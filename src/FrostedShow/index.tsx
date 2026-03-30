import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { FrostedSlide } from './FrostedSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: 'Frosted panels',
    subtitle: 'Depth with soft contrast',
    points: ['Blurred glass', 'Bright edges', 'Clear visual focus'],
  },
  {
    title: 'Layered Atmosphere',
    subtitle: 'The background should support the card, not compete with it',
    points: ['Large color clouds', 'Stable card shell', 'Bright top highlight'],
  },
  {
    title: 'Glass Discipline',
    subtitle: 'Soft blur still needs hierarchy',
    points: ['Headline first', 'Body second', 'Accent strip for rhythm'],
  },
  {
    title: 'One narration layer',
    subtitle: 'Keep the full story intact',
    points: ['Global audio file', 'Scene-level timing', 'No cut voice seams'],
  },
  {
    title: 'Ambient Motion',
    subtitle: 'Move the light, not the layout',
    points: ['Slow background drift', 'Stable content box', 'Measured transitions'],
  },
  {
    title: 'Export ready',
    subtitle: 'Preview the complete timing',
    points: ['Review the cut', 'Tune the slides', 'Render MP4'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('FrostedShow');

export const FrostedShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'FrostedShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#667eea' }}>
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
            <FrostedSlide
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
