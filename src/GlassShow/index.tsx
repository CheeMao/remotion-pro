import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { GlassSlide } from './GlassSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: 'Glass interface',
    subtitle: 'Soft depth and blur',
    points: ['Layered cards', 'Bright edges', 'Focused hierarchy'],
  },
  {
    title: 'Narration pacing',
    subtitle: 'Slides follow the spoken flow',
    points: ['Global audio', 'Auto timing', 'Stable transitions'],
  },
  {
    title: 'Ready to render',
    subtitle: 'Preview the complete cut',
    points: ['Review timing', 'Tune content', 'Export final video'],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('GlassShow');

export const GlassShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'GlassShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#1e1b4b' }}>
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
            <GlassSlide
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
