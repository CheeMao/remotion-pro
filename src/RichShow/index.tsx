import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { RichSlide } from './RichSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { TimelineFields } from '../templates/types';
import { getTemplateContentPath } from '../project-content';

type SlideType =
  | 'title'
  | 'stats'
  | 'highlight'
  | 'progress'
  | 'quote'
  | 'compare'
  | 'list'
  | 'cta';

interface RichSlideData extends TimelineFields {
  type: SlideType;
  data: Record<string, unknown>;
  narration?: string;
}

// 验证是否是 RichShow 格式的 slide
const isRichSlide = (slide: unknown): slide is RichSlideData => {
  const s = slide as Partial<RichSlideData>;
  return typeof s?.type === 'string' && typeof s?.data === 'object';
};

const defaultSlides: RichSlideData[] = [
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
const CONTENT_PATH = getTemplateContentPath('RichShow');

export const RichShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson<RichSlideData>(defaultSlides, {
    validateSlide: isRichSlide,
    expectedTemplate: 'RichShow',
    contentPath: CONTENT_PATH,
  });
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
