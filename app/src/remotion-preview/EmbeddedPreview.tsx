import React from 'react';
import { Player } from '@remotion/player';
import { AbsoluteFill, Audio, Sequence } from 'remotion';
import { AISlide } from '@remotion-root/AIShow/AISlide';
import { FrostedSlide } from '@remotion-root/FrostedShow/FrostedSlide';
import { GlassSlide } from '@remotion-root/GlassShow/GlassSlide';
import { LiquidSlide as LiquidSlideAlt } from '@remotion-root/LiquidShow-1/LiquidSlide';
import { LiquidSlide } from '@remotion-root/LiquidShow/LiquidSlide';
import { LuxeSlide } from '@remotion-root/LuxeShow/LuxeSlide';
import { NeonSlide } from '@remotion-root/NeonShow/NeonSlide';
import { NeuSlide } from '@remotion-root/NeuShow/NeuSlide';
import { RichSlide } from '@remotion-root/RichShow/RichSlide';
import { Slide } from '@remotion-root/SlideShow/Slide';
import { TechSlide } from '@remotion-root/TechShow/TechSlide';

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 150;
const WIDTH = 1080;
const HEIGHT = 1920;

interface TimelineFields {
  audioDuration?: number;
  durationInFrames?: number;
}

interface PreviewSimpleSlide extends TimelineFields {
  id?: string;
  title?: string;
  subtitle?: string;
  points?: string[];
}

interface PreviewComplexSlide extends TimelineFields {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface PreviewProjectData {
  template: string;
  slides: Array<Record<string, unknown>>;
  soundtrackUrl?: string;
}

const getSlideDurationFrames = (
  slide: Partial<TimelineFields>,
  fps: number,
  defaultSlideDuration: number
): number => {
  if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
    return slide.durationInFrames;
  }

  if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
    return Math.max(1, Math.ceil(slide.audioDuration * fps));
  }

  return defaultSlideDuration;
};

const getSlideTiming = (
  slides: Array<Record<string, unknown>>,
  index: number,
  fps: number,
  defaultSlideDuration: number
) => {
  let from = 0;

  for (let i = 0; i < index; i += 1) {
    from += getSlideDurationFrames(
      slides[i] as Partial<TimelineFields>,
      fps,
      defaultSlideDuration
    );
  }

  return {
    from,
    duration: getSlideDurationFrames(
      slides[index] as Partial<TimelineFields>,
      fps,
      defaultSlideDuration
    ),
  };
};

const calculateDuration = (slides: Array<Record<string, unknown>>) => {
  return slides.reduce((total, slide) => {
    return total + getSlideDurationFrames(slide as Partial<TimelineFields>, FPS, DEFAULT_SLIDE_DURATION);
  }, 0);
};

const SimpleTimeline: React.FC<{
  slides: PreviewSimpleSlide[];
  soundtrackUrl?: string;
  background: string;
  SlideComponent: React.ComponentType<{
    title: string;
    subtitle?: string;
    points?: string[];
    index: number;
    totalSlides: number;
    durationInFrames: number;
  }>;
}> = ({ slides, soundtrackUrl, background, SlideComponent }) => {
  return (
    <AbsoluteFill style={{ background }}>
      {soundtrackUrl ? <Audio src={soundtrackUrl} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides as Array<Record<string, unknown>>,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence
            key={slide.id || index}
            from={from}
            durationInFrames={duration}
          >
            <SlideComponent
              title={slide.title || `Slide ${index + 1}`}
              subtitle={slide.subtitle}
              points={slide.points}
              index={index}
              totalSlides={slides.length}
              durationInFrames={duration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const RichTimeline: React.FC<{
  slides: PreviewComplexSlide[];
  soundtrackUrl?: string;
}> = ({ slides, soundtrackUrl }) => {
  return (
    <AbsoluteFill style={{ background: '#0f0f1a' }}>
      {soundtrackUrl ? <Audio src={soundtrackUrl} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides as Array<Record<string, unknown>>,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <RichSlide
              type={typeof slide.type === 'string' ? slide.type : 'title'}
              data={slide.data}
              index={index}
              totalSlides={slides.length}
              durationInFrames={duration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const TechTimeline: React.FC<{
  slides: PreviewComplexSlide[];
  soundtrackUrl?: string;
}> = ({ slides, soundtrackUrl }) => {
  return (
    <AbsoluteFill style={{ background: '#050510' }}>
      {soundtrackUrl ? <Audio src={soundtrackUrl} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides as Array<Record<string, unknown>>,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <TechSlide
              type={typeof slide.type === 'string' ? slide.type : 'title'}
              data={slide.data}
              index={index}
              totalSlides={slides.length}
              durationInFrames={duration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PreviewComposition: React.FC<PreviewProjectData> = ({
  template,
  slides,
  soundtrackUrl,
}) => {
  switch (template) {
    case 'SlideShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#0c0c1d"
          SlideComponent={Slide}
        />
      );
    case 'GlassShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#1e1b4b"
          SlideComponent={GlassSlide}
        />
      );
    case 'NeuShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#e8eef5"
          SlideComponent={NeuSlide}
        />
      );
    case 'AIShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#0a0a0f"
          SlideComponent={AISlide}
        />
      );
    case 'NeonShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#0a0010"
          SlideComponent={NeonSlide}
        />
      );
    case 'LuxeShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#08080a"
          SlideComponent={LuxeSlide}
        />
      );
    case 'LiquidShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#e8e8ed"
          SlideComponent={LiquidSlide}
        />
      );
    case 'LiquidShow-1':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#0b1020"
          SlideComponent={LiquidSlideAlt}
        />
      );
    case 'FrostedShow':
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#667eea"
          SlideComponent={FrostedSlide}
        />
      );
    case 'RichShow':
      return (
        <RichTimeline
          slides={slides as PreviewComplexSlide[]}
          soundtrackUrl={soundtrackUrl}
        />
      );
    case 'TechShow':
      return (
        <TechTimeline
          slides={slides as PreviewComplexSlide[]}
          soundtrackUrl={soundtrackUrl}
        />
      );
    default:
      return (
        <SimpleTimeline
          slides={slides as PreviewSimpleSlide[]}
          soundtrackUrl={soundtrackUrl}
          background="#0c0c1d"
          SlideComponent={Slide}
        />
      );
  }
};

export const EmbeddedPreview: React.FC<{
  previewData: PreviewProjectData;
}> = ({ previewData }) => {
  const durationInFrames = calculateDuration(previewData.slides);

  return (
    <Player
      key={`${previewData.template}-${previewData.soundtrackUrl || 'silent'}-${durationInFrames}`}
      component={PreviewComposition as unknown as React.ComponentType<Record<string, unknown>>}
      inputProps={previewData}
      durationInFrames={durationInFrames}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      fps={FPS}
      controls
      style={{ width: '100%', height: '100%' }}
    />
  );
};
