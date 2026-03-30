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
    title: 'Depth First',
    subtitle: 'Use soft shadow to build order',
    points: ['Primary block first', 'Secondary details second', 'Keep spacing intentional'],
  },
  {
    title: 'Content Rhythm',
    subtitle: 'One page, one message',
    points: ['Headline for hook', 'Body for context', 'One action for memory'],
  },
  {
    title: 'Tactile Motion',
    subtitle: 'Movement should feel pressed and released',
    points: ['Short easing', 'Stable entry path', 'No noisy transitions'],
  },
  {
    title: 'Scene System',
    subtitle: 'Different pages still belong to one family',
    points: ['Shared palette', 'Shared radius', 'Shared shadow language'],
  },
  {
    title: 'Export Ready',
    subtitle: 'Preview, iterate, deliver',
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
