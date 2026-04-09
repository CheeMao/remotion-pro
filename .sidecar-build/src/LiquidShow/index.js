"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const LiquidSlide_1 = require("./LiquidSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
// ============================================================
// DEMO 内容 — 修改这里可预览所有 11 种 layout 效果
// ============================================================
const DEMO = {
    heroTitle: 'Claude Code',
    heroBadge: 'AI 编程 · 2025',
    heroSubtitle: '命令行里的 AI 编程搭档',
    heroCta: '开始体验',
    defaultTitle: '为什么选 Claude Code',
    defaultPoints: ['不依赖 IDE，任何终端都能用', '开源透明，无黑盒操作', '支持 MCP 扩展，能力无上限', '一次描述，跨文件批量修改'],
    listTitle: '核心能力',
    listItems: [
        { icon: '📂', text: '读写代码库', desc: '理解整个项目结构' },
        { icon: '⚡', text: '执行命令', desc: '直接运行测试和构建' },
        { icon: '🔀', text: 'Git 操作', desc: '自动化提交和分支管理' },
        { icon: '✏️', text: '多文件编辑', desc: '跨文件重构一步完成' },
    ],
    statsTitle: '数据说话',
    stats: [
        { value: 58000, suffix: '+', label: 'GitHub Stars' },
        { value: 10, suffix: 'x', label: '开发效率提升' },
        { value: 100, suffix: '+', label: '支持语言数量' },
    ],
    compareTitle: '效率对比',
    compareLeft: { label: '传统开发', value: '手写代码', desc: '重复劳动多、容易出错' },
    compareRight: { label: 'Claude Code', value: 'AI 辅助', desc: '自动生成、即时反馈' },
    vsText: 'VS',
    stepsTitle: '快速上手',
    steps: [
        { title: '安装工具', description: 'npm install -g @anthropic-ai/claude-code' },
        { title: '打开项目', description: 'cd your-project && claude' },
        { title: '描述需求', description: '用自然语言告诉 Claude 要做什么' },
        { title: '审查结果', description: 'Claude 展示所有修改供你确认' },
    ],
    chartTitle: '各场景提效幅度',
    chartBars: [
        { label: '代码生成', value: 90 },
        { label: 'Bug 排查', value: 82 },
        { label: '文档编写', value: 88 },
        { label: '测试编写', value: 78 },
        { label: '代码重构', value: 85 },
    ],
    timelineTitle: 'AI 编程发展历程',
    timeline: [
        { year: '2023', title: 'AI 初探', description: 'GPT-4 带来第一波 Copilot 浪潮' },
        { year: '2024', title: 'Cursor 崛起', description: 'AI 原生 IDE 开始主流化' },
        { year: '2025', title: 'Agent 时代', description: 'Claude Code 引领命令行 AI' },
        { year: '2026', title: '全面普及', description: '80% 代码由 AI 辅助完成' },
    ],
    highlightTitle: '关键词',
    highlightItems: ['AI 编程', 'Claude Code', '效率工具', '命令行', '代码审查', '自动化'],
    quoteTitle: '核心理念',
    quoteText: '不是 AI 会替代程序员，而是会用 AI 的程序员会替代不会用的。',
    quoteAuthor: 'AI 编程箴言',
    ctaTitle: '关注 AI 编程系列',
    ctaText: '点赞收藏',
    ctaTags: ['Claude Code', 'Cursor', 'AI 编程', '效率工具'],
};
const defaultSlides = [
    { title: DEMO.heroTitle, subtitle: DEMO.heroSubtitle, type: 'hero',
        data: { badge: DEMO.heroBadge, cta: DEMO.heroCta } },
    { title: DEMO.defaultTitle, type: 'default', points: DEMO.defaultPoints },
    { title: DEMO.listTitle, type: 'list', data: { items: DEMO.listItems } },
    { title: DEMO.statsTitle, type: 'stats', data: { stats: DEMO.stats } },
    { title: DEMO.compareTitle, type: 'compare',
        data: { left: DEMO.compareLeft, right: DEMO.compareRight, vsText: DEMO.vsText } },
    { title: DEMO.stepsTitle, type: 'steps', data: { steps: DEMO.steps } },
    { title: DEMO.chartTitle, type: 'chart', data: { bars: DEMO.chartBars } },
    { title: DEMO.timelineTitle, type: 'timeline', data: { timeline: DEMO.timeline } },
    { title: DEMO.highlightTitle, type: 'highlight', data: { items: DEMO.highlightItems } },
    { title: DEMO.quoteTitle, type: 'quote',
        data: { quote: DEMO.quoteText, author: DEMO.quoteAuthor } },
    { title: DEMO.ctaTitle, type: 'cta',
        data: { cta: DEMO.ctaText, items: DEMO.ctaTags } },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)('LiquidShow');
const LiquidShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: 'LiquidShow',
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: '#e8e8ed' }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "LiquidShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(LiquidSlide_1.LiquidSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: slide.type, data: slide.data, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.LiquidShow = LiquidShow;
