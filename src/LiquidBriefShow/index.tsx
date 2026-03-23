import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { LiquidBriefSlide } from './LiquidBriefSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

const defaultSlides = [
  {
    title: '液态玻璃也能做清晰知识页',
    subtitle: '柔和不等于松散，层级仍然必须明确',
    badge: 'LIQUID BRIEF',
    items: [
      { number: '01', title: '大标题负责抓注意力', color: '#ffcce0' },
      { number: '02', title: '结构卡片负责讲清楚', color: '#a8e6e6' },
      { number: '03', title: '色彩负责分区但不抢信息', color: '#ffe4cc' },
    ],
  },
];

const DEFAULT_SLIDE_DURATION = 180;
const CONTENT_PATH = getTemplateContentPath('LiquidBriefShow');

export const LiquidBriefShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'LiquidBriefShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#faf5ff' }}>
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
            <LiquidBriefSlide
              title={slide.title || ''}
              subtitle={slide.subtitle || ''}
              badge={slide.badge || ''}
              items={(slide as { items?: Array<{ number: string; title: string; color?: string }> }).items || []}
              index={index}
              totalSlides={slides.length}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
