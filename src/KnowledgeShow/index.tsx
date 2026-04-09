import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { KnowledgeSlide } from './KnowledgeSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import type { KnowledgeSlide as KnowledgeSlideType } from '../templates/types';
import { getTemplateContentPath } from '../project-content';
import { SubtitleOverlay } from '../renderers/SubtitleOverlay';

// ============================================================
// DEMO 内容 — 修改这里可预览所有 layout 效果
// KnowledgeShow 通过字段类型自动判断 layout：
//   highlights → 关键词强调  |  steps → 步骤流程
//   timeline   → 时间线      |  chart  → 进度/柱状图
//   points     → 普通列表    |  其他字段组合 → 对比/引言/数据等
// ============================================================
const DEMO = {
  // highlight — 关键词强调
  highlightTitle:    'AI 时代核心能力',
  highlightSubtitle: '先把关键概念推到前台',
  highlightItems:    [
    { text: '人工智能', color: '#3b82f6', emphasis: 'glow' as const },
    { text: '机器学习', color: '#8b5cf6', emphasis: 'bounce' as const },
    { text: '深度学习', color: '#06b6d4', emphasis: 'scale' as const },
    { text: '神经网络', color: '#10b981', emphasis: 'underline' as const },
  ],

  // steps — 步骤流程
  stepsTitle:    '模型训练流程',
  stepsSubtitle: '把复杂动作拆成可理解的顺序',
  stepsData:     [
    { title: '数据收集',   description: '先拿到训练所需的原始数据' },
    { title: '数据预处理', description: '清洗并统一输入格式' },
    { title: '模型训练',   description: '让算法在样本上学习参数' },
    { title: '模型评估',   description: '验证结果是否达到预期' },
  ],

  // timeline — 时间线
  timelineTitle:    'AI 发展历程',
  timelineSubtitle: '时间线最适合承载阶段变化',
  timelineData:     [
    { year: '1956', title: 'AI 诞生',     description: '达特茅斯会议提出人工智能概念' },
    { year: '2012', title: '深度学习突破', description: 'AlexNet 在图像任务上大幅领先' },
    { year: '2022', title: '大模型时代',  description: 'ChatGPT 让生成式 AI 进入大众视野' },
    { year: '2025', title: 'Agent 时代',  description: 'AI 开始自主完成复杂任务' },
  ],

  // chart (progress) — 进度条图
  progressTitle:    '编程语言使用占比',
  progressSubtitle: '用进度图快速表达比例关系',
  progressChart:    {
    type: 'progress' as const,
    values: [
      { label: 'Python',     value: 85, color: '#3b82f6' },
      { label: 'JavaScript', value: 72, color: '#f59e0b' },
      { label: 'Go',         value: 58, color: '#06b6d4' },
      { label: 'Rust',       value: 45, color: '#ef4444' },
    ],
  },

  // points — 普通要点列表
  pointsTitle:    '知识拆解原则',
  pointsSubtitle: '普通信息页也需要强结构',
  pointsData:     ['一页只讲一个重点', '先给结论，再给解释', '卡片之间要有明确层级', '颜色只负责辅助，不负责抢戏'],

  // chart (bar) — 柱状图
  barTitle:    '各能力维度对比',
  barSubtitle: '柱状图适合做横向比较',
  barChart:    {
    type: 'bar' as const,
    values: [
      { label: '理解力', value: 92, color: '#3b82f6' },
      { label: '生成力', value: 88, color: '#8b5cf6' },
      { label: '执行力', value: 81, color: '#06b6d4' },
      { label: '稳定性', value: 76, color: '#10b981' },
    ],
  },
};

// ============================================================
// 6 个 layout（KnowledgeShow 通过字段自动识别类型）
// ============================================================
const defaultSlides: KnowledgeSlideType[] = [
  // 1. highlight — 关键词强调
  { title: DEMO.highlightTitle, subtitle: DEMO.highlightSubtitle, highlights: DEMO.highlightItems },
  // 2. steps — 步骤流程
  { title: DEMO.stepsTitle, subtitle: DEMO.stepsSubtitle, steps: DEMO.stepsData },
  // 3. timeline — 时间线
  { title: DEMO.timelineTitle, subtitle: DEMO.timelineSubtitle, timeline: DEMO.timelineData },
  // 4. chart (progress) — 进度条
  { title: DEMO.progressTitle, subtitle: DEMO.progressSubtitle, chart: DEMO.progressChart },
  // 5. points — 普通列表
  { title: DEMO.pointsTitle, subtitle: DEMO.pointsSubtitle, points: DEMO.pointsData },
  // 6. chart (bar) — 柱状图
  { title: DEMO.barTitle, subtitle: DEMO.barSubtitle, chart: DEMO.barChart },
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
      <SubtitleOverlay slides={slides} template="KnowledgeShow" />
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
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
              elementTimings={slide.elementTimings}
              slideAudioStart={slide.audioStart}
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
