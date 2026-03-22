import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { DynamicSlide } from './Slide';
import { AudioSlideData } from '../types';
import { getSlideDurationFrames, getSlideTiming, getStaticAssetPath } from '../../hooks/useContentJson';

export interface DynamicSlideShowProps {
  slides: AudioSlideData[];
  defaultSlideDuration?: number;
  soundtrackPath?: string;
}

export const DynamicSlideShow: React.FC<DynamicSlideShowProps> = ({
  slides,
  defaultSlideDuration = 150,
  soundtrackPath,
}) => {
  const { fps } = useVideoConfig();
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0c0c1d' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          fps,
          defaultSlideDuration
        );

        return (
          <Sequence
            key={slide.id || index}
            from={from}
            durationInFrames={duration}
          >
            <DynamicSlide
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

export function calculateTotalFrames(
  slides: AudioSlideData[],
  fps: number,
  defaultSlideDuration: number = 150
): number {
  return slides.reduce((total, slide) => {
    return total + getSlideDurationFrames(slide, fps, defaultSlideDuration);
  }, 0);
}
