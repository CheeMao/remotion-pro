import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { TechSlide } from './TechSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { TimelineFields } from '../templates/types';

type SlideType = 'title' | 'stats' | 'list' | 'progress' | 'compare' | 'quote' | 'cta';

interface SlideData extends TimelineFields {
  type: SlideType;
  data: Record<string, unknown>;
  narration?: string;
}

const defaultSlides: SlideData[] = [
  { type: 'title', data: { title: 'Tech timeline', subtitle: 'Drive scenes from narration' } },
  {
    type: 'stats',
    data: {
      title: 'Pipeline',
      stats: [
        { value: 1, suffix: 'x', label: 'Full soundtrack' },
        { value: 3, suffix: '', label: 'Auto-timed scenes' },
      ],
    },
  },
  {
    type: 'cta',
    data: { title: 'Preview and export', subtitle: 'Validate the timing', button: 'Render' },
  },
];

const DEFAULT_SLIDE_DURATION = 150;

export const TechShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides);
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#050510' }}>
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
            <TechSlide
              type={slide.type}
              data={slide.data}
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
