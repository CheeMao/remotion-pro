import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { VideoConfig } from '../templates/types';
import { calculateTotalFrames } from './parse-content';

export interface RenderVideoOptions {
  config: VideoConfig;
  outputPath: string;
  compositionId?: string;
}

export async function renderVideo(options: RenderVideoOptions): Promise<void> {
  const { config, outputPath, compositionId = 'GeneratedVideo' } = options;
  const totalFrames = calculateTotalFrames(config);
  console.log(`Total frames: ${totalFrames} (${(totalFrames / config.fps).toFixed(2)}s)`);

  const tempConfigPath = join(process.cwd(), 'temp-video-config.json');
  writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));

  console.log('Bundling Remotion project...');
  const bundled = await bundle({
    entryPoint: join(process.cwd(), 'src', 'index.ts'),
  });

  console.log('Selecting composition...');
  const inputProps = {
    template: config.template,
    slides: config.slides,
    defaultSlideDuration: config.defaultDurationPerSlide,
    soundtrackPath: config.soundtrackPath,
  };

  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps,
  });

  console.log('Rendering video...');
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
  });

  console.log(`Video rendered: ${outputPath}`);
}
