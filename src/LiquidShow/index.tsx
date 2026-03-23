import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { LiquidSlide } from './LiquidSlide';
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
    title: '液态玻璃也能做清晰知识页',
    subtitle: '柔和不等于松散，层级仍然必须明确',
    points: ['大标题负责抓注意力', '结构卡片负责讲清楚', '色彩负责分区但不抢信息'],
    data: { badge: 'Liquid Brief' },
  },
  {
    type: 'timeline',
    title: '知识讲解更适合连续推进',
    subtitle: '每一步都给用户一个稳定落点',
    data: {
      timeline: [
        { label: '01', title: '定义问题', description: '先说这个概念到底是什么' },
        { label: '02', title: '拆出结构', description: '再说它由哪几部分组成' },
        { label: '03', title: '给出判断', description: '最后告诉用户应该怎么做' },
      ],
      badge: 'Timeline',
    },
  },
  {
    type: 'stats',
    title: '液态模板适合做轻数据呈现',
    subtitle: '用少量数字和标签，快速建立认知',
    data: {
      stats: [
        { value: '4', label: '信息分区' },
        { value: '8s', label: '单页上限' },
        { value: '1', label: '核心问题' },
      ],
      badge: 'Metrics',
    },
    points: ['数字只放关键指标', '解释放到副标题或补充区', '避免满屏小字'],
  },
  {
    type: 'compare',
    title: '柔和风格也能做对比',
    subtitle: '把两个方案并排放，阅读成本最低',
    data: {
      left: {
        label: '方案 A',
        value: '快',
        points: ['适合快速执行', '代价是表达粗糙'],
      },
      right: {
        label: '方案 B',
        value: '稳',
        points: ['适合知识讲解', '层级更清晰，停留更自然'],
      },
      badge: 'Decision',
    },
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('LiquidShow');

export const LiquidShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: 'LiquidShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#eef1f6' }}>
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
            <LiquidSlide
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
