import { readFileSync } from 'fs';
import { AudioSlideData, ContentFile, VideoConfig } from '../templates/types';

const DEFAULT_FPS = 30;
const DEFAULT_DURATION_PER_SLIDE = 150;

const getSlideDurationInFrames = (
  slide: ContentFile['slides'][number],
  fps: number,
  defaultDurationPerSlide: number
): number => {
  if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
    return slide.durationInFrames;
  }

  if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
    return Math.max(1, Math.ceil(slide.audioDuration * fps));
  }

  return defaultDurationPerSlide;
};

export function parseContentFile(filePath: string): ContentFile {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function contentToVideoConfig(content: ContentFile): VideoConfig {
  const fps = DEFAULT_FPS;
  const defaultDurationPerSlide = DEFAULT_DURATION_PER_SLIDE;

  const slides: AudioSlideData[] = content.slides.map((slide, index) => {
    const durationInFrames = getSlideDurationInFrames(
      slide,
      fps,
      defaultDurationPerSlide
    );

    return {
      id: `slide-${index}`,
      title: slide.title || `Slide ${index + 1}`,
      subtitle: slide.subtitle,
      points: slide.points,
      narration: slide.narration,
      audioDuration:
        typeof slide.audioDuration === 'number'
          ? slide.audioDuration
          : durationInFrames / fps,
      durationInFrames,
      audioStart: slide.audioStart,
      audioEnd: slide.audioEnd,
    };
  });

  return {
    template: content.meta.template,
    slides,
    fps,
    width: 1080,
    height: 1920,
    defaultDurationPerSlide,
    soundtrackPath:
      content.meta.soundtrackPath || content.meta.soundtrack_path,
    soundtrackDuration:
      content.meta.soundtrackDuration || content.meta.soundtrack_duration,
  };
}

export function calculateTotalFrames(config: VideoConfig): number {
  return config.slides.reduce((total, slide) => {
    return total + (slide.durationInFrames || config.defaultDurationPerSlide);
  }, 0);
}
