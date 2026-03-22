import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { LuxeSlide } from './LuxeSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';

const defaultSlides = [
  {
    title: 'Premium tone',
    subtitle: 'Elegant pacing and spacing',
    points: ['Strong hierarchy', 'Measured motion', 'Quiet contrast'],
  },
  {
    title: 'Continuous voice',
    subtitle: 'One soundtrack for the story',
    points: ['Consistent delivery', 'Clean transitions', 'Predictable timing'],
  },
  {
    title: 'Final export',
    subtitle: 'Preview before delivery',
    points: ['Check flow', 'Refine slides', 'Render the final cut'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;

export const LuxeShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides);
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#08080a' }}>
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
            <LuxeSlide
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
