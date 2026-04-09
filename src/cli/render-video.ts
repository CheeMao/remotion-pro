import { bundle } from '@remotion/bundler';
import { ensureBrowser, renderMedia, selectComposition } from '@remotion/renderer';
import { existsSync, readFileSync } from 'fs';
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

export async function renderVideo(options: RenderVideoOptions): Promise<void> {
  const { config, outputPath, compositionId = 'GeneratedVideo' } = options;
  const totalFrames = calculateTotalFrames(config);
  console.log(`Total frames: ${totalFrames} (${(totalFrames / config.fps).toFixed(2)}s)`);

  const localBrowser = findLocalBrowserPath();
  let browserExecutable: string | null = null;
  const isWindowsDesktop = process.platform === 'win32';

  if (localBrowser) {
    console.log(`Using local browser: ${localBrowser}`);
    const testResult = await testBrowserLaunch(localBrowser);
    console.error(`[BrowserTest] ${localBrowser} -> ${testResult}`);

    if (isHealthyLocalBrowserTest(testResult)) {
      browserExecutable = localBrowser;
    } else {
      console.warn(
        'Local browser launch test failed. Falling back to the Remotion-managed browser.'
      );
      await ensureBrowser();
    }
  } else {
    console.log('No local browser found, ensuring Remotion browser is downloaded...');
    await ensureBrowser();
  }

  console.log('Bundling Remotion project...');
  const bundled =
    process.env.REMOTION_BUNDLE_DIR && existsSync(process.env.REMOTION_BUNDLE_DIR)
      ? resolve(process.env.REMOTION_BUNDLE_DIR)
      : await bundle({
          entryPoint: join(process.cwd(), 'src', 'index.ts'),
        });

  console.log('Selecting composition...');
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
  };

  const chromiumOptions = browserExecutable
    ? { gl: 'swangle' as const }
    : undefined;
  const chromeMode = browserExecutable
    ? ('chrome-for-testing' as const)
    : ('headless-shell' as const);
  const logLevel = browserExecutable ? 'verbose' as const : 'info' as const;
  // Windows desktop exports are significantly more reliable with a conservative
  // concurrency and a higher frame timeout.
  const safeDesktopConcurrency = isWindowsDesktop ? 2 : null;
  const safeDesktopTimeout = isWindowsDesktop ? 120_000 : undefined;

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

  console.log('Rendering video...');
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
  });

  console.log(`Video rendered: ${outputPath}`);
}
