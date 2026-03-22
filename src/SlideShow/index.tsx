import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Slide } from './Slide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';

const defaultSlides = [
  {
    title: 'AI video workflow',
    subtitle: 'Turn script into slides',
    points: ['Write one script', 'Split into scenes', 'Render in Remotion'],
  },
  {
    title: 'One soundtrack',
    subtitle: 'Use a single narration file',
    points: ['Generate once', 'Drive the full timeline', 'Keep rhythm consistent'],
  },
  {
    title: 'Preview and export',
    subtitle: 'Review before final render',
    points: ['Check pacing', 'Adjust slides', 'Export MP4'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;

export const SlideShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides);
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0c0c1d' }}>
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
            <Slide
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
