import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { GlassSlide } from './GlassSlide';
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
    title: '知识型内容也能轻盈表达',
    subtitle: '重点结论、结构层次、对比关系一眼看懂',
    points: ['先给结论', '再给结构', '最后给行动建议'],
    data: { badge: 'Glass Knowledge' },
  },
  {
    type: 'compare',
    title: '旧写法 vs 新写法',
    subtitle: '把抽象观点变成对比，更利于理解',
    data: {
      left: {
        label: '旧写法',
        value: '信息堆砌',
        points: ['只讲概念', '缺少层级', '用户难抓重点'],
      },
      right: {
        label: '新写法',
        value: '结构清晰',
        points: ['先结论后解释', '信息分组展示', '更适合短视频吸收'],
      },
      badge: 'Compare',
    },
  },
  {
    type: 'timeline',
    title: '一页知识拆成三步',
    subtitle: '让观众按你的逻辑节奏往下看',
    data: {
      timeline: [
        { label: '01', title: '先讲问题', description: '明确用户现在卡在哪里' },
        { label: '02', title: '再讲方法', description: '给出简明可执行的思路' },
        { label: '03', title: '最后收束', description: '用结果或行动建议结束' },
      ],
      badge: 'Flow',
    },
  },
  {
    type: 'stats',
    title: '知识页面应该更清楚',
    subtitle: '不是更花，而是更容易被吸收',
    data: {
      stats: [
        { value: '3', label: '核心结论' },
        { value: '2', label: '对比维度' },
        { value: '1', label: '最终行动' },
      ],
      badge: 'Stats',
    },
    points: ['每页只解决一个问题', '每组内容只放一个重点', '视觉层级服务于理解'],
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
