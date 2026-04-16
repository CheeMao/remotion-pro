import { bundle } from '@remotion/bundler';
import { ensureBrowser, renderMedia, selectComposition } from '@remotion/renderer';
import { existsSync, readFileSync } from 'fs';
import { cpus } from 'os';
import { extname, isAbsolute, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { VideoConfig } from '../templates/types';
import { calculateTotalFrames } from './parse-content';

export interface RenderVideoOptions {
  config: VideoConfig;
  outputPath: string;
  compositionId?: string;
}

const toMimeType = (filePath: string): string => {
  switch (extname(filePath).toLowerCase()) {
    case '.wav':
      return 'audio/wav';
    case '.aac':
      return 'audio/aac';
    case '.ogg':
      return 'audio/ogg';
    default:
      return 'audio/mpeg';
  }
};

const resolveLocalAssetPath = (assetPath?: string): string | undefined => {
  if (!assetPath) {
    return undefined;
  }

  if (assetPath.startsWith('file://')) {
    return fileURLToPath(assetPath);
  }

  if (isAbsolute(assetPath) || /^[A-Za-z]:[\\/]/.test(assetPath) || assetPath.startsWith('\\\\')) {
    return assetPath;
  }

  return undefined;
};

/**
 * Find a locally installed browser to avoid downloading Chromium.
 * Checks Microsoft Edge (pre-installed on Win10/11) and Chrome.
 */
function findLocalBrowserPath(): string | undefined {
  if (process.platform !== 'win32') {
    const macPaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    return macPaths.find((p) => existsSync(p));
  }

  const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const localAppData = process.env['LOCALAPPDATA'] || '';

  const candidates = [
    join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
    join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
    join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
    join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
    join(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
    join(programFiles, 'Chromium\\Application\\chrome.exe'),
  ];

  return candidates.find((p) => existsSync(p));
}

/** Spawn Chrome directly to test if it can launch in this environment. */
async function testBrowserLaunch(executablePath: string): Promise<string> {
  const { spawn } = await import('child_process');
  const { tmpdir } = await import('os');
  const testDir = join(tmpdir(), 'remotion-browser-test-' + Date.now());
  return new Promise<string>((resolvePromise) => {
    const proc = spawn(
      executablePath,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--remote-debugging-port=0',
        `--user-data-dir=${testDir}`,
        'about:blank',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let out = '';
    proc.stdout?.on('data', (d: Buffer) => {
      out += d.toString();
    });
    proc.stderr?.on('data', (d: Buffer) => {
      out += d.toString();
    });
    proc.on('exit', (code: number | null, sig: string | null) => {
      resolvePromise(
        `exit code=${code} signal=${sig} output=${JSON.stringify(out.substring(0, 400))}`
      );
    });
    proc.on('error', (e: Error) => resolvePromise(`spawn error: ${e.message}`));
    setTimeout(() => {
      proc.kill();
      resolvePromise(
        `still running after 4s (output so far: ${JSON.stringify(out.substring(0, 400))})`
      );
    }, 4000);
  });
}

const isHealthyLocalBrowserTest = (testResult: string): boolean => {
  return testResult.startsWith('still running after');
};

const emitProgress = (payload: Record<string, unknown>): void => {
  process.stderr.write(`[progress] ${JSON.stringify(payload)}\n`);
};

export async function renderVideo(options: RenderVideoOptions): Promise<void> {
  const { config, outputPath, compositionId = 'GeneratedVideo' } = options;
  const totalFrames = calculateTotalFrames(config);
  console.error(`[render] start: ${config.slides.length} slides, ${totalFrames} frames (${(totalFrames / config.fps).toFixed(2)}s)`);
  const inputPropsSize = JSON.stringify(config.slides).length;
  console.error(`[render] inputProps slides serialized size: ${(inputPropsSize / 1024).toFixed(1)}KB`);
  emitProgress({ phase: 'render:init', totalFrames, fps: config.fps, slides: config.slides.length });

  emitProgress({ phase: 'browser:detecting' });
  let browserExecutable: string | null = null;

  // Packaged mode: Rust sets REMOTION_CHROMIUM_EXECUTABLE to the bundled
  // chrome-headless-shell. Use it directly — no detection, no network.
  const bundledChromium = process.env.REMOTION_CHROMIUM_EXECUTABLE;
  if (bundledChromium && existsSync(bundledChromium)) {
    console.error(`[render] using bundled chromium: ${bundledChromium}`);
    browserExecutable = bundledChromium;
    emitProgress({
      phase: 'browser:ready',
      source: 'bundled',
      executable: bundledChromium,
    });
  } else {
    // On macOS, the user's installed Chrome/Edge often conflicts with an already-running instance
    // (SIGTERM kills, "Trying to load the allocator multiple times" errors). Skip local browser
    // detection and always use Remotion's managed chrome-headless-shell, which runs isolated.
    const preferManagedBrowser = process.platform === 'darwin';
    const localBrowser = preferManagedBrowser ? null : findLocalBrowserPath();
    if (localBrowser) {
      console.log(`Using local browser: ${localBrowser}`);
      emitProgress({ phase: 'browser:testing', executable: localBrowser });
      const testResult = await testBrowserLaunch(localBrowser);
      console.error(`[BrowserTest] ${localBrowser} -> ${testResult}`);

      if (isHealthyLocalBrowserTest(testResult)) {
        browserExecutable = localBrowser;
        emitProgress({
          phase: 'browser:ready',
          source: 'local',
          executable: localBrowser,
        });
      } else {
        console.warn(
          'Local browser launch test failed. Falling back to the Remotion-managed browser.'
        );
        emitProgress({ phase: 'browser:downloading' });
        await ensureBrowser();
        emitProgress({ phase: 'browser:ready', source: 'remotion' });
      }
    } else {
      console.log('Using Remotion-managed chrome-headless-shell...');
      emitProgress({ phase: 'browser:downloading' });
      await ensureBrowser();
      emitProgress({ phase: 'browser:ready', source: 'remotion' });
    }
  }

  console.log('Bundling Remotion project...');
  emitProgress({ phase: 'bundle:start' });
  const bundleStart = Date.now();
  const bundled =
    process.env.REMOTION_BUNDLE_DIR && existsSync(process.env.REMOTION_BUNDLE_DIR)
      ? resolve(process.env.REMOTION_BUNDLE_DIR)
      : await bundle({
          entryPoint: join(process.cwd(), 'src', 'index.ts'),
        });
  emitProgress({ phase: 'bundle:done', durationMs: Date.now() - bundleStart });

  console.error('[render] selecting composition...');
  const localSoundtrackPath = resolveLocalAssetPath(config.soundtrackPath);
  const soundtrackPath = localSoundtrackPath
    ? `data:${toMimeType(localSoundtrackPath)};base64,${readFileSync(localSoundtrackPath).toString(
        'base64'
      )}`
    : config.soundtrackPath;
  const inputProps = {
    template: config.template,
    slides: config.slides,
    defaultSlideDuration: config.defaultDurationPerSlide,
    soundtrackPath,
    subtitleFont: config.subtitleFont,
  };

  // GL backend for Chromium.
  // Default: 'angle' on Windows = hardware (D3D). Much faster for WebGL animations.
  // Override via REMOTION_GL env var if GPU drivers cause artifacts (try 'swangle' or 'swiftshader').
  type RemotionGl =
    | 'angle'
    | 'angle-egl'
    | 'egl'
    | 'swangle'
    | 'swiftshader'
    | 'vulkan';
  const allowedGl: RemotionGl[] = ['angle', 'angle-egl', 'egl', 'swangle', 'swiftshader', 'vulkan'];
  const envGlRaw = (process.env.REMOTION_GL || '').trim() as RemotionGl;
  const envGl = allowedGl.includes(envGlRaw) ? envGlRaw : undefined;
  // 'angle' uses hardware acceleration: D3D on Windows, Metal on macOS. Much faster for WebGL.
  const defaultGl: RemotionGl = process.platform === 'linux' ? 'egl' : 'angle';
  const selectedGl = envGl || defaultGl;
  const chromiumOptions = browserExecutable
    ? { gl: selectedGl }
    : undefined;
  if (browserExecutable) {
    console.error(`[render] chromium gl=${selectedGl} (set REMOTION_GL=swangle to force software)`);
  }
  // Bundled chromium is chrome-headless-shell → 'headless-shell' mode.
  // Local user Chrome/Edge is a full browser → 'chrome-for-testing' mode.
  const usingBundledChromium = Boolean(
    bundledChromium && browserExecutable === bundledChromium
  );
  const chromeMode = usingBundledChromium
    ? ('headless-shell' as const)
    : browserExecutable
      ? ('chrome-for-testing' as const)
      : ('headless-shell' as const);
  const logLevel = browserExecutable ? 'verbose' as const : 'info' as const;
  // Desktop exports: default concurrency = all logical cores.
  // Override via REMOTION_CONCURRENCY env var; set to a lower value if render is unstable.
  const envConcurrency = Number(process.env.REMOTION_CONCURRENCY);
  const autoConcurrency = Math.max(2, cpus().length);
  const safeDesktopConcurrency =
    Number.isFinite(envConcurrency) && envConcurrency > 0 ? envConcurrency : autoConcurrency;
  const safeDesktopTimeout = 120_000;
  console.error(`[render] using concurrency=${safeDesktopConcurrency} (cpus=${cpus().length})`);

  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps,
    browserExecutable,
    chromiumOptions,
    chromeMode,
    logLevel,
    timeoutInMilliseconds: safeDesktopTimeout,
  });

  console.error('[render] rendering media...');
  const renderStart = Date.now();
  emitProgress({ phase: 'render:start', totalFrames, startedAt: renderStart });
  let lastProgressEmit = 0;
  // macOS: swap libx264 for h264_videotoolbox (Apple Silicon hardware encoder).
  const useVideoToolbox = process.platform === 'darwin' && process.env.REMOTION_DISABLE_VIDEOTOOLBOX !== '1';
  const ffmpegOverride = useVideoToolbox
    ? ({ args }: { args: string[] }) =>
        args.map((a) => (a === 'libx264' ? 'h264_videotoolbox' : a))
    : undefined;
  if (useVideoToolbox) {
    console.error('[render] using hardware encoder: h264_videotoolbox');
  }

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    browserExecutable,
    chromiumOptions,
    chromeMode,
    logLevel,
    concurrency: safeDesktopConcurrency,
    timeoutInMilliseconds: safeDesktopTimeout,
    ffmpegOverride,
    onProgress: ({ renderedFrames, encodedFrames, progress }) => {
      const now = Date.now();
      // Throttle to ~5 updates per second to avoid log spam
      if (now - lastProgressEmit < 200 && progress < 1) return;
      lastProgressEmit = now;
      emitProgress({
        phase: 'render:progress',
        renderedFrames,
        encodedFrames,
        totalFrames,
        progress,
        elapsedMs: now - renderStart,
      });
    },
  });

  const totalMs = Date.now() - renderStart;
  emitProgress({ phase: 'render:done', durationMs: totalMs, outputPath });
  console.error(`[render] done in ${(totalMs / 1000).toFixed(1)}s -> ${outputPath}`);
}
