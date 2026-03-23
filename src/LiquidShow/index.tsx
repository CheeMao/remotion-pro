import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { LiquidSlide } from './LiquidSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';

// 演示各种知识类布局
const defaultSlides = [
  {
    title: 'Liquid Glass',
    subtitle: 'macOS 风格液态玻璃设计',
    type: 'hero' as const,
    data: {
      badge: 'NEW DESIGN',
      cta: '开始体验',
    },
  },
  {
    title: 'Fluid Motion',
    subtitle: 'Shape the flow visually',
    points: ['Organic transitions', 'Soft gradients', 'Layered movement'],
  },
  {
    title: '核心数据',
    subtitle: '2024年度统计',
    type: 'stats' as const,
    data: {
      stats: [
        { value: 25600, suffix: '+', label: '活跃用户' },
        { value: 99, suffix: '%', label: '满意度' },
        { value: 180, suffix: '天', label: '持续运营' },
      ],
    },
  },
  {
    title: '方案对比',
    type: 'compare' as const,
    data: {
      left: { label: '传统方案', value: '3-5天', desc: '手动处理流程' },
      right: { label: '智能方案', value: '5分钟', desc: '自动化处理' },
      vsText: 'VS',
    },
  },
  {
    title: '实现步骤',
    subtitle: '三步完成部署',
    type: 'steps' as const,
    data: {
      steps: [
        { title: '配置环境', description: '安装依赖并配置参数' },
        { title: '导入数据', description: '支持多种数据格式导入' },
        { title: '一键部署', description: '自动化部署到云端' },
      ],
    },
  },
  {
    title: '核心优势',
    type: 'list' as const,
    data: {
      items: [
        { icon: '⚡', text: '极速响应', desc: '毫秒级处理' },
        { icon: '🔒', text: '安全可靠', desc: '端到端加密' },
        { icon: '🎨', text: '精美设计', desc: '现代化UI' },
        { icon: '📱', text: '跨平台', desc: '全端支持' },
      ],
    },
  },
  {
    title: '性能指标',
    type: 'chart' as const,
    data: {
      bars: [
        { label: '响应速度', value: 96 },
        { label: '稳定性', value: 92 },
        { label: '用户体验', value: 95 },
        { label: '安全性', value: 98 },
      ],
    },
  },
  {
    title: '发展历程',
    type: 'timeline' as const,
    data: {
      timeline: [
        { year: '2021', title: '项目启动', description: '核心团队组建' },
        { year: '2022', title: '产品发布', description: '首个版本上线' },
        { year: '2023', title: '快速增长', description: '用户突破10万' },
        { year: '2024', title: '全面升级', description: 'AI能力集成' },
      ],
    },
  },
  {
    title: '关键词',
    type: 'highlight' as const,
    data: {
      items: ['高效', '智能', '安全', '易用', '专业', '创新'],
    },
  },
  {
    title: '创新改变世界，技术成就未来',
    type: 'quote' as const,
    data: {
      quote: '最好的代码是没有代码，最好的设计是看不见的设计。',
      author: '极简主义原则',
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
    <AbsoluteFill style={{ background: '#0a0a12' }}>
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
              title={slide.title || ''}
              subtitle={slide.subtitle}
              points={(slide as { points?: string[] }).points}
              type={(slide as { type?: string }).type as 'default' | 'steps' | 'timeline' | 'chart' | 'highlight' | 'list' | 'compare' | 'stats' | 'quote' | 'hero' | undefined}
              data={(slide as { data?: Record<string, unknown> }).data}
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