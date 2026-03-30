import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { AISlide } from './AISlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: 'AI scenes',
    subtitle: 'Structure the message',
    points: ['Open with context', 'Highlight key points', 'Close with action'],
  },
  {
    title: 'System Panel',
    subtitle: 'Let the layout feel computational',
    points: ['Clear modules', 'Strong labels', 'Controlled glow'],
  },
  {
    title: 'Signal Priority',
    subtitle: 'The eye should know where to look first',
    points: ['Big title first', 'Metric block second', 'Detail rows last'],
  },
  {
    title: 'Single narration',
    subtitle: 'Keep the tone continuous',
    points: ['No audio stitching', 'Consistent voice', 'Unified pacing'],
  },
  {
    title: 'Timeline driven',
    subtitle: 'Slides adapt to duration',
    points: ['Auto frame sizing', 'Smoother flow', 'Cleaner preview'],
  },
  {
    title: 'Delivery Layer',
    subtitle: 'A stronger ending improves the whole cut',
    points: ['Summarize the idea', 'Keep one CTA', 'Finish with confidence'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('AIShow');

export const AIShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'AIShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0a0a0f' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          fps,
          DEFAULT_SLIDE_DURATION
        );

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <AISlide
              title={slide.title}
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
