"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// CLI 入口
const commander_1 = require("commander");
const workflow_1 = require("./workflow");
const program = new commander_1.Command();
const parseSpeechRate = (value) => Number(value);
program
    .name('video-generator')
    .description('Generate videos with TTS from content files')
    .version('1.0.0');
// 从内容文件生成视频
program
    .command('generate')
    .description('Generate video from content JSON file')
    .argument('<content-file>', 'Path to content JSON file')
    .option('-t, --template <template>', 'Template name', 'GlassShow')
    .option('-v, --voice <voice-id>', 'Voice ID for TTS')
    .option('-r, --speech-rate <rate>', 'Speech rate for TTS (0.5-2.0)', parseSpeechRate)
    .option('-o, --output <output>', 'Output video path', 'out/video.mp4')
    .option('--skip-audio', 'Skip audio generation (use cached)')
    .action(async (contentFile, options) => {
    await workflow_1.workflow.generateFromContent({
        contentFile,
        template: options.template,
        voiceId: options.voice,
        speechRate: options.speechRate,
        outputPath: options.output,
        skipAudio: options.skipAudio,
    });
});
// 仅生成音频
program
    .command('audio')
    .description('Generate audio files from content JSON file')
    .argument('<content-file>', 'Path to content JSON file')
    .option('-v, --voice <voice-id>', 'Voice ID for TTS')
    .option('-r, --speech-rate <rate>', 'Speech rate for TTS (0.5-2.0)', parseSpeechRate)
    .option('-o, --output-dir <dir>', 'Output directory for audio files', 'public/audio')
    .option('-k, --access-key <key>', 'VolcEngine Access Key (or set VOLCENGINE_ACCESS_KEY env)')
    .option('--app-id <id>', 'VolcEngine App ID (or set VOLCENGINE_APP_ID env)')
    .option('--resource-id <id>', 'VolcEngine Resource ID (default: seed-tts-1.0)')
    .action(async (contentFile, options) => {
    await workflow_1.workflow.generateAudioOnly({
        contentFile,
        voiceId: options.voice,
        speechRate: options.speechRate,
        outputDir: options.outputDir,
        accessKey: options.accessKey || process.env.VOLCENGINE_ACCESS_KEY,
        appId: options.appId || process.env.VOLCENGINE_APP_ID,
        resourceId: options.resourceId || process.env.VOLCENGINE_RESOURCE_ID,
    });
});
program
    .command('narrate')
    .description('Generate one narration soundtrack from a text file')
    .argument('<text-file>', 'Path to narration text file')
    .option('-v, --voice <voice-id>', 'Voice ID for TTS')
    .option('-r, --speech-rate <rate>', 'Speech rate for TTS (0.5-2.0)', parseSpeechRate)
    .option('-o, --output <output>', 'Output audio path', 'public/audio/narration.mp3')
    .option('-k, --access-key <key>', 'VolcEngine Access Key (or set VOLCENGINE_ACCESS_KEY env)')
    .option('--app-id <id>', 'VolcEngine App ID (or set VOLCENGINE_APP_ID env)')
    .option('--resource-id <id>', 'VolcEngine Resource ID (default: seed-tts-1.0)')
    .action(async (textFile, options) => {
    await workflow_1.workflow.generateNarrationOnly({
        textFile,
        voiceId: options.voice,
        speechRate: options.speechRate,
        outputFile: options.output,
        accessKey: options.accessKey || process.env.VOLCENGINE_ACCESS_KEY,
        appId: options.appId || process.env.VOLCENGINE_APP_ID,
        resourceId: options.resourceId || process.env.VOLCENGINE_RESOURCE_ID,
    });
});
program
    .command('narrate-timeline')
    .description('Generate narration segments timeline from a text file')
    .argument('<text-file>', 'Path to narration text file')
    .option('-v, --voice <voice-id>', 'Voice ID for TTS')
    .option('-r, --speech-rate <rate>', 'Speech rate for TTS (0.5-2.0)', parseSpeechRate)
    .option('-o, --output-dir <dir>', 'Output directory for narration timeline assets', 'public/audio')
    .option('-k, --access-key <key>', 'VolcEngine Access Key (or set VOLCENGINE_ACCESS_KEY env)')
    .option('--app-id <id>', 'VolcEngine App ID (or set VOLCENGINE_APP_ID env)')
    .option('--resource-id <id>', 'VolcEngine Resource ID (default: seed-tts-1.0)')
    .action(async (textFile, options) => {
    await workflow_1.workflow.generateNarrationTimelineOnly({
        textFile,
        voiceId: options.voice,
        speechRate: options.speechRate,
        outputDir: options.outputDir,
        accessKey: options.accessKey || process.env.VOLCENGINE_ACCESS_KEY,
        appId: options.appId || process.env.VOLCENGINE_APP_ID,
        resourceId: options.resourceId || process.env.VOLCENGINE_RESOURCE_ID,
    });
});
program
    .command('timeline')
    .description('Sync slide timing from an existing narration soundtrack')
    .argument('<content-file>', 'Path to content JSON file')
    .option('-s, --soundtrack <soundtrack>', 'Path to narration audio', 'public/audio/narration.mp3')
    .option('-p, --soundtrack-path <soundtrack-path>', 'Relative soundtrack path stored in content', 'audio/narration.mp3')
    .option('-v, --voice <voice-id>', 'Voice ID for content metadata')
    .action(async (contentFile, options) => {
    await workflow_1.workflow.syncTimelineOnly({
        contentFile,
        soundtrackFile: options.soundtrack,
        soundtrackPath: options.soundtrackPath,
        voiceId: options.voice,
    });
});
program
    .command('structure')
    .description('Convert plain slides into structured layouts and default element timings')
    .argument('<content-file>', 'Path to content JSON file')
    .option('-t, --template <template>', 'Template name override')
    .option('-o, --output <output>', 'Output content path (defaults to overwriting the input file)')
    .action(async (contentFile, options) => {
    await workflow_1.workflow.structureContentOnly({
        contentFile,
        template: options.template,
        outputFile: options.output,
    });
});
program
    .command('render')
    .description('Render video from existing content JSON file')
    .argument('<content-file>', 'Path to content JSON file')
    .option('-t, --template <template>', 'Template name override')
    .option('-o, --output <output>', 'Output video path', 'out/video.mp4')
    .action(async (contentFile, options) => {
    await workflow_1.workflow.renderOnly({
        contentFile,
        template: options.template,
        outputPath: options.output,
    });
});
program.parse();
