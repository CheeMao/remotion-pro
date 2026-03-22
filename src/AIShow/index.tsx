import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { AISlide } from './AISlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';

const defaultSlides = [
  {
    title: 'AI scenes',
    subtitle: 'Structure the message',
    points: ['Open with context', 'Highlight key points', 'Close with action'],
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
];

const DEFAULT_SLIDE_DURATION = 150;

export const AIShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides);
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
