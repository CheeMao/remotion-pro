// CLI 入口
import { Command } from 'commander';
import { workflow } from './workflow';

const program = new Command();
const parseSpeechRate = (value: string): number => Number(value);

program
  .name('video-generator')
  .description('Generate videos with TTS from content files')
  .version('1.0.0');

// 从内容文件生成视频
program
  .command('generate')
  .description('Generate video from content JSON file')
  .argument('<content-file>', 'Path to content JSON file')
  .option('-t, --template <template>', 'Template name', 'SlideShow')
  .option('-v, --voice <voice-id>', 'Voice ID for TTS')
  .option('-r, --speech-rate <rate>', 'Speech rate for TTS (0.5-2.0)', parseSpeechRate)
  .option('-o, --output <output>', 'Output video path', 'out/video.mp4')
  .option('--skip-audio', 'Skip audio generation (use cached)')
  .action(async (contentFile, options) => {
    await workflow.generateFromContent({
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
  .option('-k, --api-key <key>', 'DashScope API Key (or set DASHSCOPE_API_KEY env)')
  .action(async (contentFile, options) => {
    await workflow.generateAudioOnly({
      contentFile,
      voiceId: options.voice,
      speechRate: options.speechRate,
      outputDir: options.outputDir,
      apiKey: options.apiKey || process.env.DASHSCOPE_API_KEY,
    });
  });

program
  .command('narrate')
  .description('Generate one narration soundtrack from a text file')
  .argument('<text-file>', 'Path to narration text file')
  .option('-v, --voice <voice-id>', 'Voice ID for TTS')
  .option('-r, --speech-rate <rate>', 'Speech rate for TTS (0.5-2.0)', parseSpeechRate)
  .option('-o, --output <output>', 'Output audio path', 'public/audio/narration.mp3')
  .option('-k, --api-key <key>', 'DashScope API Key (or set DASHSCOPE_API_KEY env)')
  .action(async (textFile, options) => {
    await workflow.generateNarrationOnly({
      textFile,
      voiceId: options.voice,
      speechRate: options.speechRate,
      outputFile: options.output,
      apiKey: options.apiKey || process.env.DASHSCOPE_API_KEY,
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
    await workflow.syncTimelineOnly({
      contentFile,
      soundtrackFile: options.soundtrack,
      soundtrackPath: options.soundtrackPath,
      voiceId: options.voice,
    });
  });

program
  .command('render')
  .description('Render video from existing content JSON file')
  .argument('<content-file>', 'Path to content JSON file')
  .option('-t, --template <template>', 'Template name override')
  .option('-o, --output <output>', 'Output video path', 'out/video.mp4')
  .action(async (contentFile, options) => {
    await workflow.renderOnly({
      contentFile,
      template: options.template,
      outputPath: options.output,
    });
  });

// 创建自定义音色
program
  .command('clone-voice')
  .description('Create custom voice from audio URL')
  .argument('<audio-url>', 'Public URL of reference audio')
  .argument('<prefix>', 'Voice prefix identifier (lowercase letters and numbers, max 10 chars)')
  .action(async (audioUrl, prefix) => {
    await workflow.cloneVoice({
      audioUrl,
      prefix,
    });
  });

// 查询音色状态
program
  .command('voice-status')
  .description('Query voice clone status')
  .argument('<voice-id>', 'Voice ID to query')
  .action(async (voiceId) => {
    await workflow.queryVoiceStatus(voiceId);
  });

program.parse();
