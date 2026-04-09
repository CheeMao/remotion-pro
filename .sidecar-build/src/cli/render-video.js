"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderVideo = renderVideo;
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const parse_content_1 = require("./parse-content");
const toMimeType = (filePath) => {
    switch ((0, path_1.extname)(filePath).toLowerCase()) {
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
const resolveLocalAssetPath = (assetPath) => {
    if (!assetPath) {
        return undefined;
    }
    if (assetPath.startsWith('file://')) {
        return (0, url_1.fileURLToPath)(assetPath);
    }
    if ((0, path_1.isAbsolute)(assetPath) || /^[A-Za-z]:[\\/]/.test(assetPath) || assetPath.startsWith('\\\\')) {
        return assetPath;
    }
    return undefined;
};
/**
 * Find a locally installed browser to avoid downloading Chromium.
 * Checks Microsoft Edge (pre-installed on Win10/11) and Chrome.
 */
function findLocalBrowserPath() {
    if (process.platform !== 'win32') {
        const macPaths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ];
        return macPaths.find((p) => (0, fs_1.existsSync)(p));
    }
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env['LOCALAPPDATA'] || '';
    const candidates = [
        (0, path_1.join)(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
        (0, path_1.join)(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
        (0, path_1.join)(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
        (0, path_1.join)(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
        (0, path_1.join)(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
        (0, path_1.join)(programFiles, 'Chromium\\Application\\chrome.exe'),
    ];
    return candidates.find((p) => (0, fs_1.existsSync)(p));
}
/** Spawn Chrome directly to test if it can launch in this environment. */
async function testBrowserLaunch(executablePath) {
    const { spawn } = await Promise.resolve().then(() => __importStar(require('child_process')));
    const { tmpdir } = await Promise.resolve().then(() => __importStar(require('os')));
    const testDir = (0, path_1.join)(tmpdir(), 'remotion-browser-test-' + Date.now());
    return new Promise((resolvePromise) => {
        var _a, _b;
        const proc = spawn(executablePath, [
            '--headless=new',
            '--no-sandbox',
            '--disable-gpu',
            '--remote-debugging-port=0',
            `--user-data-dir=${testDir}`,
            'about:blank',
        ], { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (d) => {
            out += d.toString();
        });
        (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (d) => {
            out += d.toString();
        });
        proc.on('exit', (code, sig) => {
            resolvePromise(`exit code=${code} signal=${sig} output=${JSON.stringify(out.substring(0, 400))}`);
        });
        proc.on('error', (e) => resolvePromise(`spawn error: ${e.message}`));
        setTimeout(() => {
            proc.kill();
            resolvePromise(`still running after 4s (output so far: ${JSON.stringify(out.substring(0, 400))})`);
        }, 4000);
    });
}
const isHealthyLocalBrowserTest = (testResult) => {
    return testResult.startsWith('still running after');
};
async function renderVideo(options) {
    const { config, outputPath, compositionId = 'GeneratedVideo' } = options;
    const totalFrames = (0, parse_content_1.calculateTotalFrames)(config);
    console.log(`Total frames: ${totalFrames} (${(totalFrames / config.fps).toFixed(2)}s)`);
    const localBrowser = findLocalBrowserPath();
    let browserExecutable = null;
    const isWindowsDesktop = process.platform === 'win32';
    if (localBrowser) {
        console.log(`Using local browser: ${localBrowser}`);
        const testResult = await testBrowserLaunch(localBrowser);
        console.error(`[BrowserTest] ${localBrowser} -> ${testResult}`);
        if (isHealthyLocalBrowserTest(testResult)) {
            browserExecutable = localBrowser;
        }
        else {
            console.warn('Local browser launch test failed. Falling back to the Remotion-managed browser.');
            await (0, renderer_1.ensureBrowser)();
        }
    }
    else {
        console.log('No local browser found, ensuring Remotion browser is downloaded...');
        await (0, renderer_1.ensureBrowser)();
    }
    console.log('Bundling Remotion project...');
    const bundled = process.env.REMOTION_BUNDLE_DIR && (0, fs_1.existsSync)(process.env.REMOTION_BUNDLE_DIR)
        ? (0, path_1.resolve)(process.env.REMOTION_BUNDLE_DIR)
        : await (0, bundler_1.bundle)({
            entryPoint: (0, path_1.join)(process.cwd(), 'src', 'index.ts'),
        });
    console.log('Selecting composition...');
    const localSoundtrackPath = resolveLocalAssetPath(config.soundtrackPath);
    const soundtrackPath = localSoundtrackPath
        ? `data:${toMimeType(localSoundtrackPath)};base64,${(0, fs_1.readFileSync)(localSoundtrackPath).toString('base64')}`
        : config.soundtrackPath;
    const inputProps = {
        template: config.template,
        slides: config.slides,
        defaultSlideDuration: config.defaultDurationPerSlide,
        soundtrackPath,
    };
    const chromiumOptions = browserExecutable
        ? { gl: 'swangle' }
        : undefined;
    const chromeMode = browserExecutable
        ? 'chrome-for-testing'
        : 'headless-shell';
    const logLevel = browserExecutable ? 'verbose' : 'info';
    // Windows desktop exports are significantly more reliable with a conservative
    // concurrency and a higher frame timeout.
    const safeDesktopConcurrency = isWindowsDesktop ? 2 : null;
    const safeDesktopTimeout = isWindowsDesktop ? 120000 : undefined;
    const composition = await (0, renderer_1.selectComposition)({
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
    await (0, renderer_1.renderMedia)({
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
