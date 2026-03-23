import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { LiquidSlide } from './LiquidSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';

const defaultSlides = [
  {
    title: 'Fluid motion',
    subtitle: 'Shape the flow visually',
    points: ['Organic transitions', 'Soft gradients', 'Layered movement'],
  },
  {
    title: 'Narration-led scenes',
    subtitle: 'Slide timing follows speech',
    points: ['One voice track', 'Auto timing', 'Balanced duration'],
  },
  {
    title: 'Preview the sequence',
    subtitle: 'Validate the final rhythm',
    points: ['Review motion', 'Adjust content', 'Render video'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;

export const LiquidShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides);
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0b1020' }}>
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
            <LiquidSlide
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