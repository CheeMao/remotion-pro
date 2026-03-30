import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { KnowledgeSlide } from './KnowledgeSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import type { KnowledgeSlide as KnowledgeSlideType } from '../templates/types';
import { getTemplateContentPath } from '../project-content';

const defaultSlides: KnowledgeSlideType[] = [
  {
    title: '重点强调',
    subtitle: '先把关键概念推到前台',
    highlights: [
      { text: '人工智能', color: '#3b82f6', emphasis: 'glow' },
      { text: '机器学习', color: '#8b5cf6', emphasis: 'bounce' },
      { text: '深度学习', color: '#06b6d4', emphasis: 'scale' },
      { text: '神经网络', color: '#10b981', emphasis: 'underline' },
    ],
  },
  {
    title: '步骤流程',
    subtitle: '把复杂动作拆成可理解的顺序',
    steps: [
      { title: '数据收集', description: '先拿到训练所需的原始数据' },
      { title: '数据预处理', description: '清洗并统一输入格式' },
      { title: '模型训练', description: '让算法在样本上学习参数' },
      { title: '模型评估', description: '验证结果是否达到预期' },
    ],
  },
  {
    title: '发展历程',
    subtitle: '时间线最适合承载阶段变化',
    timeline: [
      { year: '1956', title: 'AI 诞生', description: '达特茅斯会议提出人工智能概念' },
      { year: '2012', title: '深度学习突破', description: 'AlexNet 在图像任务上大幅领先' },
      { year: '2022', title: '大模型时代', description: 'ChatGPT 让生成式 AI 进入大众视野' },
    ],
  },
  {
    title: '数据统计',
    subtitle: '用进度图快速表达比例关系',
    chart: {
      type: 'progress',
      values: [
        { label: 'Python', value: 85, color: '#3b82f6' },
        { label: 'JavaScript', value: 72, color: '#f59e0b' },
        { label: 'Go', value: 58, color: '#06b6d4' },
        { label: 'Rust', value: 45, color: '#ef4444' },
      ],
    },
  },
  {
    title: '知识拆解',
    subtitle: '普通信息页也需要强结构',
    points: [
      '一页只讲一个重点',
      '先给结论，再给解释',
      '卡片之间要有明确层级',
      '颜色只负责辅助，不负责抢戏',
    ],
  },
  {
    title: '能力对比',
    subtitle: '柱状图适合做横向比较',
    chart: {
      type: 'bar',
      values: [
        { label: '理解力', value: 92, color: '#3b82f6' },
        { label: '生成力', value: 88, color: '#8b5cf6' },
        { label: '执行力', value: 81, color: '#06b6d4' },
        { label: '稳定性', value: 76, color: '#10b981' },
      ],
    },
  },
];

const DEFAULT_SLIDE_DURATION = 180;
const CONTENT_PATH = getTemplateContentPath('KnowledgeShow');

export const KnowledgeShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson<KnowledgeSlideType>(defaultSlides, {
    expectedTemplate: 'KnowledgeShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
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
            <KnowledgeSlide
              title={slide.title}
              subtitle={slide.subtitle}
              points={slide.points}
              highlights={slide.highlights}
              steps={slide.steps}
              timeline={slide.timeline}
              chart={slide.chart}
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
