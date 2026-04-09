import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { TechSlide } from './TechSlide';
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from '../hooks/useContentJson';
import { TimelineFields } from '../templates/types';
import { getTemplateContentPath } from '../project-content';
import { SubtitleOverlay } from '../renderers/SubtitleOverlay';

type SlideType = 'title' | 'stats' | 'list' | 'steps' | 'timeline' | 'highlight' | 'progress' | 'compare' | 'quote' | 'cta';

interface TechSlideData extends TimelineFields {
  type: SlideType;
  data: Record<string, unknown>;
  narration?: string;
}

const isTechSlide = (slide: unknown): slide is TechSlideData => {
  const s = slide as Partial<TechSlideData>;
  return typeof s?.type === 'string' && typeof s?.data === 'object';
};

// ============================================================
// DEMO 内容 — 修改这里可预览所有 10 种 layout 效果
// TechShow 注意：title/subtitle 放在 data 对象内，不是顶层 props
// ============================================================
const DEMO = {
  // title（= hero）
  titleText:      'Claude Code',
  titleSubtitle:  '命令行里的 AI 编程搭档',

  // stats
  statsTitle:     '数据说话',
  stats:          [
    { value: 58000, suffix: '+', label: 'GitHub Stars' },
    { value: 10,    suffix: 'x', label: '开发效率提升' },
    { value: 100,   suffix: '+', label: '支持语言数量' },
  ],

  // list
  listTitle:      '核心能力',
  listItems:      [
    { icon: '📂', text: '读写代码库', desc: '理解整个项目结构' },
    { icon: '⚡', text: '执行命令',   desc: '直接运行测试和构建' },
    { icon: '🔀', text: 'Git 操作',  desc: '自动化提交和分支管理' },
    { icon: '✏️', text: '多文件编辑', desc: '跨文件重构一步完成' },
  ],

  // steps
  stepsTitle:     '快速上手',
  steps:          [
    { title: '安装工具',  description: 'npm install -g @anthropic-ai/claude-code' },
    { title: '打开项目',  description: 'cd your-project && claude' },
    { title: '描述需求',  description: '用自然语言告诉 Claude 要做什么' },
    { title: '审查结果',  description: 'Claude 展示所有修改供你确认' },
  ],

  // timeline
  timelineTitle:  'AI 编程发展历程',
  timeline:       [
    { year: '2023', title: 'AI 初探',    description: 'GPT-4 带来第一波 Copilot 浪潮' },
    { year: '2024', title: 'Cursor 崛起', description: 'AI 原生 IDE 开始主流化' },
    { year: '2025', title: 'Agent 时代', description: 'Claude Code 引领命令行 AI' },
    { year: '2026', title: '全面普及',   description: '80% 代码由 AI 辅助完成' },
  ],

  // highlight
  highlightTitle:  '关键词',
  highlightItems:  ['AI 编程', 'Claude Code', '效率工具', '命令行', '代码审查', '自动化'],

  // progress（= chart）
  progressTitle:  '各场景提效幅度',
  progressBars:   [
    { label: '代码生成', percent: 90 },
    { label: 'Bug 排查', percent: 82 },
    { label: '文档编写', percent: 88 },
    { label: '测试编写', percent: 78 },
  ],

  // compare
  compareTitle:   '效率对比',
  compareLeft:    { label: '传统开发', value: '手写代码', desc: '重复劳动多、容易出错' },
  compareRight:   { label: 'Claude Code', value: 'AI 辅助', desc: '自动生成、即时反馈' },

  // quote
  quoteTitle:     '核心理念',
  quoteText:      '不是 AI 会替代程序员，而是会用 AI 的程序员会替代不会用的。',
  quoteAuthor:    'AI 编程箴言',

  // cta
  ctaTitle:       '关注 AI 编程系列',
  ctaButton:      'Star on GitHub',
};

const defaultSlides: TechSlideData[] = [
  // 1. title — 封面
  { type: 'title',    data: { title: DEMO.titleText,     subtitle: DEMO.titleSubtitle } },
  // 2. stats — 数据统计
  { type: 'stats',    data: { title: DEMO.statsTitle,    stats: DEMO.stats } },
  // 3. list — 列表
  { type: 'list',     data: { title: DEMO.listTitle,     items: DEMO.listItems } },
  // 4. steps — 步骤
  { type: 'steps',    data: { title: DEMO.stepsTitle,    steps: DEMO.steps } },
  // 5. timeline — 时间线
  { type: 'timeline', data: { title: DEMO.timelineTitle, timeline: DEMO.timeline } },
  // 6. highlight — 关键词
  { type: 'highlight', data: { title: DEMO.highlightTitle, items: DEMO.highlightItems } },
  // 7. progress — 进度图（= chart）
  { type: 'progress', data: { title: DEMO.progressTitle, bars: DEMO.progressBars } },
  // 8. compare — 对比
  { type: 'compare',  data: { title: DEMO.compareTitle, left: DEMO.compareLeft, right: DEMO.compareRight } },
  // 9. quote — 引言
  { type: 'quote',    data: { title: DEMO.quoteTitle,   quote: DEMO.quoteText, author: DEMO.quoteAuthor } },
  // 10. cta — 行动页
  { type: 'cta',      data: { title: DEMO.ctaTitle,     button: DEMO.ctaButton } },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath('TechShow');

export const TechShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson<TechSlideData>(defaultSlides, {
    validateSlide: isTechSlide,
    expectedTemplate: 'TechShow',
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: '#050510' }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      <SubtitleOverlay slides={slides} template="TechShow" />
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <TechSlide
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
