import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { NeonSlide } from './NeonSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: 'Neon grid',
    subtitle: 'High-contrast storytelling',
    points: ['Bright accents', 'Hard cuts', 'Rhythmic motion'],
  },
  {
    title: 'Night Signal',
    subtitle: 'Build the page like a stage, not a document',
    points: ['Outer frame first', 'Headline glow second', 'Content strips last'],
  },
  {
    title: 'Contrast Rules',
    subtitle: 'Neon works only when the dark base is stable',
    points: ['Use fewer colors', 'Reserve glow for emphasis', 'Keep spacing strict'],
  },
  {
    title: 'Full-voice track',
    subtitle: 'One continuous narration',
    points: ['No fragment stitching', 'Stable mood', 'Better continuity'],
  },
  {
    title: 'Auto scene timing',
    subtitle: 'Slides match the speech',
    points: ['Scene weights', 'Frame allocation', 'Consistent preview'],
  },
  {
    title: 'Final Burst',
    subtitle: 'The closing page should feel louder than the rest',
    points: ['Compress the message', 'Use one strong line', 'End on a visual spike'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('NeonShow');

export const NeonShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'NeonShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0a0010' }}>
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
            <NeonSlide
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
