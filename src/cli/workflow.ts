import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { contentToVideoConfig, parseContentFile } from './parse-content';
import {
  generateAudio,
  generateNarrationTrack,
  generateNarrationTimeline,
  syncTimelineToSoundtrack,
} from './generate-audio';
import { renderVideo } from './render-video';

export interface GenerateOptions {
  contentFile: string;
  template: string;
  voiceId?: string;
  speechRate?: number;
  outputPath: string;
  skipAudio?: boolean;
}

export interface AudioOnlyOptions {
  contentFile: string;
  voiceId?: string;
  speechRate?: number;
  outputDir?: string;
  accessKey?: string;
  appId?: string;
  resourceId?: string;
}

export interface RenderOnlyOptions {
  contentFile: string;
  template?: string;
  outputPath: string;
}

export interface NarrationOnlyOptions {
  textFile: string;
  voiceId?: string;
  speechRate?: number;
  outputFile?: string;
  accessKey?: string;
  appId?: string;
  resourceId?: string;
}

export interface NarrationTimelineOnlyOptions {
  textFile: string;
  voiceId?: string;
  speechRate?: number;
  outputDir?: string;
  accessKey?: string;
  appId?: string;
  resourceId?: string;
}

export interface TimelineOnlyOptions {
  contentFile: string;
  soundtrackFile?: string;
  soundtrackPath?: string;
  voiceId?: string;
}

export async function generateFromContent(options: GenerateOptions): Promise<void> {
  console.log('=== Video Generation Pipeline ===\n');

  console.log('1. Parsing content file...');
  let content = parseContentFile(options.contentFile);
  console.log(`   Found ${content.slides.length} slides\n`);

  if (options.skipAudio) {
    console.log('2. Reusing existing narration timing...');
  } else {
    console.log('2. Generating soundtrack with TTS...');
    const result = await generateAudio({
      contentFile: options.contentFile,
      voiceId: options.voiceId,
      speechRate: options.speechRate,
    });
    content = result.content;
  }
  console.log('');

  console.log('3. Creating video configuration...');
  content = parseContentFile(options.contentFile);
  const videoConfig = contentToVideoConfig(content);

  const configPath = join(process.cwd(), 'video-config.json');
  writeFileSync(configPath, JSON.stringify(videoConfig, null, 2));

  const totalFrames = videoConfig.slides.reduce(
    (sum, slide) => sum + (slide.durationInFrames || videoConfig.defaultDurationPerSlide),
    0
  );
  console.log(`   Total duration: ${totalFrames} frames (${(totalFrames / 30).toFixed(2)}s)\n`);

  console.log('4. Rendering video...');
  await renderVideo({
    config: videoConfig,
    outputPath: options.outputPath,
  });

  console.log('\n=== Generation Complete ===');
  console.log(`Output: ${options.outputPath}`);
}

export async function generateAudioOnly(options: AudioOnlyOptions): Promise<void> {
  console.log('=== Audio Generation ===\n');

  const result = await generateAudio({
    contentFile: options.contentFile,
    voiceId: options.voiceId,
    speechRate: options.speechRate,
    outputDir: options.outputDir,
    accessKey: options.accessKey,
    appId: options.appId,
    resourceId: options.resourceId,
  });

  console.log(`Generated soundtrack: ${result.soundtrackPath}`);
  console.log(`Duration: ${result.soundtrackDuration.toFixed(2)}s`);
  console.log(`Audio files saved to: ${result.outputDir}`);
}

export async function generateNarrationOnly(
  options: NarrationOnlyOptions
): Promise<void> {
  const text = readFileSync(options.textFile, 'utf-8');
  const result = await generateNarrationTrack({
    text,
    voiceId: options.voiceId,
    speechRate: options.speechRate,
    outputFile: options.outputFile,
    accessKey: options.accessKey,
    appId: options.appId,
    resourceId: options.resourceId,
  });

  console.log(
    JSON.stringify(
      {
        audioPath: result.audioPath.replace(/\\/g, '/'),
        duration: result.duration,
      },
      null,
      2
    )
  );
}

export async function generateNarrationTimelineOnly(
  options: NarrationTimelineOnlyOptions
): Promise<void> {
  const text = readFileSync(options.textFile, 'utf-8');
  const result = await generateNarrationTimeline({
    text,
    voiceId: options.voiceId,
    speechRate: options.speechRate,
    outputDir: options.outputDir,
    accessKey: options.accessKey,
    appId: options.appId,
    resourceId: options.resourceId,
  });

  console.log(
    JSON.stringify(
      {
        audioPath: result.audioPath.replace(/\\/g, '/'),
        duration: result.duration,
        segments: result.segments,
      },
      null,
      2
    )
  );
}

export async function syncTimelineOnly(
  options: TimelineOnlyOptions
): Promise<void> {
  const result = await syncTimelineToSoundtrack({
    contentFile: options.contentFile,
    soundtrackFile: options.soundtrackFile,
    soundtrackPath: options.soundtrackPath,
    voiceId: options.voiceId,
  });

  console.log(
    JSON.stringify(
      {
        soundtrackPath: result.soundtrackPath,
        soundtrackDuration: result.soundtrackDuration,
        slides: result.content.slides.length,
      },
      null,
      2
    )
  );
}

export async function renderOnly(options: RenderOnlyOptions): Promise<void> {
  console.log('=== Video Render ===\n');

  const content = parseContentFile(options.contentFile);
  const videoConfig = contentToVideoConfig(content);

  if (options.template) {
    videoConfig.template = options.template;
  }

  const totalFrames = videoConfig.slides.reduce(
    (sum, slide) =>
      sum + (slide.durationInFrames || videoConfig.defaultDurationPerSlide),
    0
  );

  console.log(
    `Rendering ${totalFrames} frames (${(totalFrames / videoConfig.fps).toFixed(2)}s)`
  );

  await renderVideo({
    config: videoConfig,
    outputPath: options.outputPath,
    compositionId: 'GeneratedVideo',
  });

  console.log(`Output: ${options.outputPath}`);
}

export const workflow = {
  generateFromContent,
  generateAudioOnly,
  generateNarrationOnly,
  generateNarrationTimelineOnly,
  syncTimelineOnly,
  renderOnly,
};
