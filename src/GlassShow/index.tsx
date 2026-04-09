import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { GlassSlide } from './GlassSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { getTemplateContentPath } from '../project-content';
import { SubtitleOverlay } from '../renderers/SubtitleOverlay';

// ============================================================
// DEMO 内容 — 修改这里可预览所有 11 种 layout 效果
// ============================================================
const DEMO = {
  heroTitle:      'Claude Code',
  heroBadge:      'AI 编程 · 2025',
  heroSubtitle:   '命令行里的 AI 编程搭档',
  heroCta:        '开始体验',

  defaultTitle:   '为什么选 Claude Code',
  defaultPoints:  ['不依赖 IDE，任何终端都能用', '开源透明，无黑盒操作', '支持 MCP 扩展，能力无上限', '一次描述，跨文件批量修改'],

  listTitle:      '核心能力',
  listItems:      [
    { icon: '📂', text: '读写代码库', desc: '理解整个项目结构' },
    { icon: '⚡', text: '执行命令',   desc: '直接运行测试和构建' },
    { icon: '🔀', text: 'Git 操作',  desc: '自动化提交和分支管理' },
    { icon: '✏️', text: '多文件编辑', desc: '跨文件重构一步完成' },
  ],

  statsTitle:     '数据说话',
  stats:          [
    { value: 58000, suffix: '+', label: 'GitHub Stars' },
    { value: 10,    suffix: 'x', label: '开发效率提升' },
    { value: 100,   suffix: '+', label: '支持语言数量' },
  ],

  compareTitle:   '效率对比',
  compareLeft:    { label: '传统开发', value: '手写代码', desc: '重复劳动多、容易出错' },
  compareRight:   { label: 'Claude Code', value: 'AI 辅助', desc: '自动生成、即时反馈' },
  vsText:         'VS',

  stepsTitle:     '快速上手',
  steps:          [
    { title: '安装工具',   description: 'npm install -g @anthropic-ai/claude-code' },
    { title: '打开项目',   description: 'cd your-project && claude' },
    { title: '描述需求',   description: '用自然语言告诉 Claude 要做什么' },
    { title: '审查结果',   description: 'Claude 展示所有修改供你确认' },
  ],

  chartTitle:     '各场景提效幅度',
  chartBars:      [
    { label: '代码生成', value: 90 },
    { label: 'Bug 排查', value: 82 },
    { label: '文档编写', value: 88 },
    { label: '测试编写', value: 78 },
    { label: '代码重构', value: 85 },
  ],

  timelineTitle:  'AI 编程发展历程',
  timeline:       [
    { year: '2023', title: 'AI 初探',    description: 'GPT-4 带来第一波 Copilot 浪潮' },
    { year: '2024', title: 'Cursor 崛起', description: 'AI 原生 IDE 开始主流化' },
    { year: '2025', title: 'Agent 时代', description: 'Claude Code 引领命令行 AI' },
    { year: '2026', title: '全面普及',   description: '80% 代码由 AI 辅助完成' },
  ],

  highlightTitle:  '关键词',
  highlightItems:  ['AI 编程', 'Claude Code', '效率工具', '命令行', '代码审查', '自动化'],

  quoteTitle:     '核心理念',
  quoteText:      '不是 AI 会替代程序员，而是会用 AI 的程序员会替代不会用的。',
  quoteAuthor:    'AI 编程箴言',

  ctaTitle:       '关注 AI 编程系列',
  ctaText:        '点赞收藏',
  ctaTags:        ['Claude Code', 'Cursor', 'AI 编程', '效率工具'],
};

// ============================================================
// 11 个 layout，每种对应一页 — 顺序即预览顺序
// ============================================================
const defaultSlides = [
  // 1. hero — 封面/开场
  { title: DEMO.heroTitle, subtitle: DEMO.heroSubtitle, type: 'hero' as const,
    data: { badge: DEMO.heroBadge, cta: DEMO.heroCta } },
  // 2. default — 普通要点（points 驱动）
  { title: DEMO.defaultTitle, type: 'default' as const, points: DEMO.defaultPoints },
  // 3. list — 带图标列表
  { title: DEMO.listTitle, type: 'list' as const, data: { items: DEMO.listItems } },
  // 4. stats — 数据统计
  { title: DEMO.statsTitle, type: 'stats' as const, data: { stats: DEMO.stats } },
  // 5. compare — 对比
  { title: DEMO.compareTitle, type: 'compare' as const,
    data: { left: DEMO.compareLeft, right: DEMO.compareRight, vsText: DEMO.vsText } },
  // 6. steps — 步骤流程
  { title: DEMO.stepsTitle, type: 'steps' as const, data: { steps: DEMO.steps } },
  // 7. chart — 进度/柱状图
  { title: DEMO.chartTitle, type: 'chart' as const, data: { bars: DEMO.chartBars } },
  // 8. timeline — 时间线
  { title: DEMO.timelineTitle, type: 'timeline' as const, data: { timeline: DEMO.timeline } },
  // 9. highlight — 关键词
  { title: DEMO.highlightTitle, type: 'highlight' as const, data: { items: DEMO.highlightItems } },
  // 10. quote — 引言
  { title: DEMO.quoteTitle, type: 'quote' as const,
    data: { quote: DEMO.quoteText, author: DEMO.quoteAuthor } },
  // 11. cta — 收尾行动页
  { title: DEMO.ctaTitle, type: 'cta' as const,
    data: { cta: DEMO.ctaText, items: DEMO.ctaTags } },
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
      <SubtitleOverlay slides={slides} template="GlassShow" />
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <GlassSlide
              title={slide.title || ''}
              subtitle={slide.subtitle}
              points={(slide as { points?: string[] }).points}
              type={(slide as { type?: string }).type as React.ComponentProps<typeof GlassSlide>['type']}
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
