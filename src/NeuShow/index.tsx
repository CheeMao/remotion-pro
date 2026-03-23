import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { NeuSlide } from './NeuSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: 'Soft UI',
    subtitle: 'Minimal and tactile',
    points: ['Calm surfaces', 'Clear hierarchy', 'Focused transitions'],
  },
  {
    title: 'Narration aware',
    subtitle: 'Scenes follow the script',
    points: ['Global timing', 'Predictable pacing', 'No page-level audio cuts'],
  },
  {
    title: 'Ship the video',
    subtitle: 'Preview, iterate, export',
    points: ['Review the cut', 'Adjust content', 'Render MP4'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('NeuShow');

export const NeuShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'NeuShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#e8eef5' }}>
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
            <NeuSlide
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
