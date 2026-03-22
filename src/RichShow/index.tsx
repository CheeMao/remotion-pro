import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { RichSlide } from './RichSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { TimelineFields } from '../templates/types';

type SlideType =
  | 'title'
  | 'stats'
  | 'highlight'
  | 'progress'
  | 'quote'
  | 'compare'
  | 'list'
  | 'cta';

interface SlideData extends TimelineFields {
  type: SlideType;
  data: Record<string, unknown>;
  narration?: string;
}

const defaultSlides: SlideData[] = [
  { type: 'title', data: { title: 'Rich story flow', subtitle: 'Scene-based layout' } },
  {
    type: 'list',
    data: {
      title: 'What changes',
      items: [
        { icon: '01', text: 'Single narration track' },
        { icon: '02', text: 'Timeline-based durations' },
        { icon: '03', text: 'Unified preview and export' },
      ],
    },
  },
  {
    type: 'cta',
    data: { title: 'Render the final cut', subtitle: 'Preview before export', button: 'Export' },
  },
];

const DEFAULT_SLIDE_DURATION = 150;

export const RichShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides);
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0f0f1a' }}>
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
            <RichSlide
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
