import React from 'react';
import { Player } from '@remotion/player';
import { SharedVideo } from '@remotion-root/renderers/SharedVideo';
import { prepareSlidesForRender } from '@remotion-root/templates/autoLayout';
import type { AudioSlideData, ContentSlide } from '@remotion-root/templates/types';
import { getTemplateDimensions } from '@remotion-root/templates/templateSpecs';

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 150;

export interface PreviewProjectData {
  template: string;
  slides: Array<Record<string, unknown>>;
  soundtrackUrl?: string;
}

const toAudioSlides = (slides: Array<Record<string, unknown>>): AudioSlideData[] => {
  return prepareSlidesForRender(slides as ContentSlide[]).map((slide, index) => ({
    id: typeof slide.id === 'string' ? slide.id : `slide-${index}`,
    title: typeof slide.title === 'string' ? slide.title : `Slide ${index + 1}`,
    subtitle: typeof slide.subtitle === 'string' ? slide.subtitle : undefined,
    points: Array.isArray(slide.points)
      ? slide.points.filter((point): point is string => typeof point === 'string')
      : undefined,
    narration: typeof slide.narration === 'string' ? slide.narration : undefined,
    type: typeof slide.type === 'string' ? slide.type : slide.layout,
    data: slide.data,
    elementTimings: slide.elementTimings,
    audioDuration: slide.audioDuration,
    durationInFrames: slide.durationInFrames,
    audioStart: slide.audioStart,
    audioEnd: slide.audioEnd,
    audioPath: typeof slide.audioPath === 'string' ? slide.audioPath : undefined,
  }));
};

const calculateDuration = (slides: AudioSlideData[]) => {
  return slides.reduce((total, slide) => {
    if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
      return total + slide.durationInFrames;
    }

    if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
      return total + Math.max(1, Math.ceil(slide.audioDuration * FPS));
    }

    return total + DEFAULT_SLIDE_DURATION;
  }, 0);
};

const SharedVideoComponent = SharedVideo as unknown as React.ComponentType<{
  slides: AudioSlideData[];
  template?: string;
  soundtrackPath?: string;
  defaultSlideDuration?: number;
}>;

const PreviewComposition: React.FC<PreviewProjectData> = ({
  template,
  slides,
  soundtrackUrl,
}) => {
  return React.createElement(SharedVideoComponent, {
    slides: toAudioSlides(slides),
    template,
    soundtrackPath: soundtrackUrl,
    defaultSlideDuration: DEFAULT_SLIDE_DURATION,
  });
};

export const EmbeddedPreview: React.FC<{
  previewData: PreviewProjectData;
}> = ({ previewData }) => {
  const preparedSlides = toAudioSlides(previewData.slides);
  const durationInFrames = calculateDuration(preparedSlides);
  const dimensions = getTemplateDimensions(previewData.template);

  return (
    <div style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }}>
      <Player
        key={`${previewData.template}-${previewData.soundtrackUrl || 'silent'}-${durationInFrames}-${preparedSlides.length}`}
        component={PreviewComposition as unknown as React.ComponentType<Record<string, unknown>>}
        inputProps={previewData}
        durationInFrames={durationInFrames}
        compositionWidth={dimensions.width}
        compositionHeight={dimensions.height}
        fps={FPS}
        controls
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
