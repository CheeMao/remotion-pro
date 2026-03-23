import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { FrostedSlide } from './FrostedSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';
import { ContentSlide } from '../templates/types';

const defaultSlides: ContentSlide[] = [
  {
    type: 'hero',
    title: '更适合知识干货的磨砂页面',
    subtitle: '阅读节奏更平稳，信息块更克制',
    points: ['标题先立住', '解释跟上', '重点单独强调'],
    data: { badge: 'Frosted Brief' },
  },
  {
    type: 'cards',
    title: '一页里可以放四类要点',
    subtitle: '适合概念拆解、经验总结、方法步骤',
    points: ['结论', '原因', '方法', '风险提示'],
    data: { badge: 'Cards' },
  },
  {
    type: 'compare',
    title: '复杂问题适合做对照',
    subtitle: '把好坏、前后、方案差异讲清楚',
    data: {
      left: {
        label: '错误做法',
        points: ['信息混在一起', '同层级内容太多', '没有明显阅读路径'],
      },
      right: {
        label: '推荐做法',
        points: ['按主题拆分', '先总后分', '视觉上有主次'],
      },
      badge: 'Contrast',
    },
  },
  {
    type: 'quote',
    title: '一句话记住整页',
    subtitle: '知识视频里，金句页适合承接前文并形成记忆点',
    data: {
      quote: '信息不是越多越好，而是越容易被理解越好。',
      author: 'Content Design',
      badge: 'Quote',
    },
    points: ['留一个记忆点', '适合章节收束', '适合过渡到下一页'],
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
