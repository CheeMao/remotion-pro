import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { AISlide } from '../AIShow/AISlide';
import { FrostedSlide } from '../FrostedShow/FrostedSlide';
import { GlassSlide } from '../GlassShow/GlassSlide';
import { KnowledgeSlide } from '../KnowledgeShow/KnowledgeSlide';
import { LiquidBriefSlide } from '../LiquidBriefShow/LiquidBriefSlide';
import { LiquidSlide as LiquidSlideAlt } from '../LiquidShow-1/LiquidSlide';
import { LiquidSlide } from '../LiquidShow/LiquidSlide';
import { LuxeSlide } from '../LuxeShow/LuxeSlide';
import { NeonSlide } from '../NeonShow/NeonSlide';
import { NeuSlide } from '../NeuShow/NeuSlide';
import { RichSlide } from '../RichShow/RichSlide';
import { Slide } from '../SlideShow/Slide';
import { WideSlide } from '../SlideShowWide/WideSlide';
import { TechSlide } from '../TechShow/TechSlide';
import { getSlideTiming, getStaticAssetPath } from '../hooks/useContentJson';
import type {
  AudioSlideData,
  ChartData,
  HighlightWord,
  StepItem,
  TimelineItem,
} from './types';

const DEFAULT_SLIDE_DURATION = 150;
const FPS = 30;

type PreviewSimpleSlide = AudioSlideData;

type PreviewComplexSlide = AudioSlideData & {
  type?: string;
  data?: Record<string, unknown>;
};

type PreviewKnowledgeSlide = AudioSlideData & {
  highlights?: HighlightWord[];
  steps?: StepItem[];
  timeline?: TimelineItem[];
  chart?: ChartData;
};

const SimpleTimeline: React.FC<{
  slides: PreviewSimpleSlide[];
  soundtrackPath?: string;
  background: string;
  SlideComponent: React.ComponentType<{
    title: string;
    subtitle?: string;
    points?: string[];
    type?: string;
    data?: Record<string, unknown>;
    index: number;
    totalSlides: number;
    durationInFrames: number;
  }>;
}> = ({ slides, soundtrackPath, background, SlideComponent }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <SlideComponent
              title={slide.title || `Slide ${index + 1}`}
              subtitle={slide.subtitle}
              points={slide.points}
              type={(slide as PreviewComplexSlide).type}
              data={(slide as PreviewComplexSlide).data}
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

const GlassTimeline: React.FC<{
  slides: PreviewComplexSlide[];
  soundtrackPath?: string;
}> = ({ slides, soundtrackPath }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#1e1b4b' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <GlassSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              points={slide.points}
              type={
                slide.type as
                  | 'default'
                  | 'steps'
                  | 'timeline'
                  | 'chart'
                  | 'highlight'
                  | 'list'
                  | 'compare'
                  | 'stats'
                  | 'quote'
                  | 'hero'
                  | undefined
              }
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

const RichTimeline: React.FC<{
  slides: PreviewComplexSlide[];
  soundtrackPath?: string;
}> = ({ slides, soundtrackPath }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0f0f1a' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
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
  soundtrackPath?: string;
}> = ({ slides, soundtrackPath }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#050510' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
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

const KnowledgeTimeline: React.FC<{
  slides: PreviewKnowledgeSlide[];
  soundtrackPath?: string;
}> = ({ slides, soundtrackPath }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <KnowledgeSlide
              title={slide.title || `Slide ${index + 1}`}
              subtitle={slide.subtitle}
              points={slide.points}
              highlights={slide.highlights}
              steps={slide.steps}
              timeline={slide.timeline}
              chart={slide.chart}
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

const LiquidTimeline: React.FC<{
  slides: PreviewComplexSlide[];
  soundtrackPath?: string;
}> = ({ slides, soundtrackPath }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#e8e8ed' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <LiquidSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              points={slide.points}
              type={
                slide.type as
                  | 'default'
                  | 'hero'
                  | 'stats'
                  | 'compare'
                  | 'steps'
                  | 'list'
                  | 'chart'
                  | 'timeline'
                  | 'highlight'
                  | 'quote'
                  | undefined
              }
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

const LiquidBriefTimeline: React.FC<{
  slides: PreviewComplexSlide[];
  soundtrackPath?: string;
}> = ({ slides, soundtrackPath }) => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#ebe7e8' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          FPS,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <LiquidBriefSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              badge={(slide as PreviewComplexSlide & { badge?: string }).badge}
              items={
                (slide as PreviewComplexSlide & {
                  items?: Array<{ number: string; title: string; color?: string }>;
                }).items
              }
              type={
                slide.type as
                  | 'cover'
                  | 'cards'
                  | 'steps'
                  | 'compare'
                  | 'stats'
                  | 'quote'
                  | undefined
              }
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

export const GeneratedTemplateRenderer: React.FC<{
  template: string;
  slides: Array<Record<string, unknown>>;
  soundtrackPath?: string;
}> = ({ template, slides, soundtrackPath }) => {
  switch (template) {
    case 'GlassShow':
      return (
        <GlassTimeline
          slides={slides as unknown as PreviewComplexSlide[]}
          soundtrackPath={soundtrackPath}
        />
      );
    case 'NeuShow':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#e8eef5"
          SlideComponent={NeuSlide}
        />
      );
    case 'AIShow':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#0a0a0f"
          SlideComponent={AISlide}
        />
      );
    case 'NeonShow':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#0a0010"
          SlideComponent={NeonSlide}
        />
      );
    case 'LuxeShow':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#08080a"
          SlideComponent={LuxeSlide}
        />
      );
    case 'LiquidShow':
      return (
        <LiquidTimeline
          slides={slides as unknown as PreviewComplexSlide[]}
          soundtrackPath={soundtrackPath}
        />
      );
    case 'LiquidShow-1':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#0b1020"
          SlideComponent={LiquidSlideAlt}
        />
      );
    case 'FrostedShow':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#667eea"
          SlideComponent={FrostedSlide}
        />
      );
    case 'RichShow':
      return (
        <RichTimeline
          slides={slides as unknown as PreviewComplexSlide[]}
          soundtrackPath={soundtrackPath}
        />
      );
    case 'TechShow':
      return (
        <TechTimeline
          slides={slides as unknown as PreviewComplexSlide[]}
          soundtrackPath={soundtrackPath}
        />
      );
    case 'KnowledgeShow':
      return (
        <KnowledgeTimeline
          slides={slides as unknown as PreviewKnowledgeSlide[]}
          soundtrackPath={soundtrackPath}
        />
      );
    case 'LiquidBriefShow':
      return (
        <LiquidBriefTimeline
          slides={slides as unknown as PreviewComplexSlide[]}
          soundtrackPath={soundtrackPath}
        />
      );
    case 'SlideShowWide':
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#050816"
          SlideComponent={WideSlide}
        />
      );
    case 'SlideShow':
    default:
      return (
        <SimpleTimeline
          slides={slides as unknown as PreviewSimpleSlide[]}
          soundtrackPath={soundtrackPath}
          background="#0c0c1d"
          SlideComponent={Slide}
        />
      );
  }
};
