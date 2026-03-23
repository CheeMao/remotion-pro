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
    subtitle: '突出核心关键词',
    highlights: [
      { text: '人工智能', color: '#3b82f6', emphasis: 'glow' },
      { text: '机器学习', color: '#8b5cf6', emphasis: 'bounce' },
      { text: '深度学习', color: '#06b6d4', emphasis: 'scale' },
      { text: '神经网络', color: '#10b981', emphasis: 'underline' },
    ],
  },
  {
    title: '步骤流程',
    subtitle: '清晰展示操作步骤',
    steps: [
      { title: '数据收集', description: '获取训练所需的原始数据' },
      { title: '数据预处理', description: '清洗、标准化数据格式' },
      { title: '模型训练', description: '使用算法训练模型参数' },
      { title: '模型评估', description: '验证模型的准确性' },
    ],
  },
  {
    title: '发展历程',
    subtitle: '时间线展示历史事件',
    timeline: [
      { year: '1956', title: 'AI诞生', description: '达特茅斯会议提出人工智能概念' },
      { year: '2012', title: '深度学习突破', description: 'AlexNet在ImageNet取得突破' },
      { year: '2022', title: '大模型时代', description: 'ChatGPT引发全球关注' },
    ],
  },
  {
    title: '数据统计',
    subtitle: '直观展示数据比例',
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
