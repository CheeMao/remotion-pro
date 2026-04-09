"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const CosmosSlide_1 = require("./CosmosSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
// ============================================================
// DEMO 内容 — 修改这里可预览所有 11 种 layout 效果
// ============================================================
const DEMO = {
    heroTitle: '6 个火爆且好用的 MCP',
    heroBadge: 'MODEL CONTEXT PROTOCOL · 2026',
    heroSubtitle: '让 AI 真正连接外部世界的利器',
    heroCta: '立即了解',
    defaultTitle: 'MCP 能做什么',
    defaultPoints: ['让 AI 直接操控浏览器', '读写本地文件系统', '查询数据库', '调用任意外部 API'],
    listTitle: '精选 MCP 工具',
    listItems: [
        { icon: '🔍', text: 'Browser MCP', desc: '让 AI 真正操控浏览器' },
        { icon: '📁', text: 'Filesystem MCP', desc: '读写本地文件，无缝集成' },
        { icon: '🗄️', text: 'Database MCP', desc: '自然语言查询数据库' },
        { icon: '🐙', text: 'GitHub MCP', desc: '代码仓库一键管理' },
        { icon: '📧', text: 'Email MCP', desc: '邮件自动化处理' },
        { icon: '🔗', text: 'API MCP', desc: '接入任意外部服务' },
    ],
    statsTitle: 'MCP 生态数据',
    stats: [
        { value: 2600000, suffix: '+', label: '周下载量' },
        { value: 48000, suffix: '+', label: 'GitHub Stars' },
        { value: 200, suffix: '+', label: '可用服务器' },
    ],
    compareTitle: '接入 MCP 前后对比',
    compareLeft: { label: '传统 AI', value: '仅聊天', desc: '只能提供建议，无法实际操作' },
    compareRight: { label: '接入 MCP', value: '真执行', desc: '直接操控工具，完成实际任务' },
    vsText: 'VS',
    stepsTitle: '快速安装 MCP',
    steps: [
        { title: '选择 MCP 服务', description: '访问官方仓库，找到需要的工具' },
        { title: '配置到 Claude', description: '在设置中添加 MCP 服务器地址' },
        { title: '开始使用', description: '直接在对话中调用外部能力' },
    ],
    chartTitle: 'MCP 工具受欢迎程度',
    chartBars: [
        { label: 'Browser MCP', value: 92 },
        { label: 'Filesystem MCP', value: 87 },
        { label: 'GitHub MCP', value: 83 },
        { label: 'Database MCP', value: 76 },
    ],
    timelineTitle: 'MCP 发展历程',
    timeline: [
        { year: '2024 Q4', title: 'MCP 协议发布', description: 'Anthropic 开源 MCP 标准规范' },
        { year: '2025 Q1', title: '生态快速扩张', description: '数百个 MCP 服务器涌现' },
        { year: '2025 Q2', title: '主流 IDE 集成', description: 'Cursor、VS Code 原生支持' },
        { year: '2025 Q3', title: '企业级采用', description: '大厂开始内部部署 MCP' },
    ],
    highlightTitle: '关键词',
    highlightItems: ['MCP', 'Claude', 'AI Agent', '工具调用', '自动化', '扩展协议'],
    quoteTitle: '核心价值',
    quoteText: 'MCP 让 AI 不再只会聊天，能真正操控计算机、连接世界。',
    quoteAuthor: '— AI 干货局',
    ctaTitle: '关注 MCP 工具系列',
    ctaText: '点赞收藏',
    ctaTags: ['MCP', 'Claude Code', 'AI Agent', '工具扩展'],
};
const defaultSlides = [
    { type: 'hero', title: DEMO.heroTitle, subtitle: DEMO.heroSubtitle,
        data: { badge: DEMO.heroBadge, cta: DEMO.heroCta } },
    { type: 'default', title: DEMO.defaultTitle, points: DEMO.defaultPoints },
    { type: 'list', title: DEMO.listTitle, data: { items: DEMO.listItems } },
    { type: 'stats', title: DEMO.statsTitle, data: { stats: DEMO.stats } },
    { type: 'compare', title: DEMO.compareTitle,
        data: { left: DEMO.compareLeft, right: DEMO.compareRight, vsText: DEMO.vsText } },
    { type: 'steps', title: DEMO.stepsTitle, data: { steps: DEMO.steps } },
    { type: 'chart', title: DEMO.chartTitle, data: { bars: DEMO.chartBars } },
    { type: 'timeline', title: DEMO.timelineTitle, data: { timeline: DEMO.timeline } },
    { type: 'highlight', title: DEMO.highlightTitle, data: { items: DEMO.highlightItems } },
    { type: 'quote', title: DEMO.quoteTitle,
        data: { quote: DEMO.quoteText, author: DEMO.quoteAuthor } },
    { type: 'cta', title: DEMO.ctaTitle,
        data: { cta: DEMO.ctaText, items: DEMO.ctaTags } },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)('CosmosShow');
const CosmosShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: 'CosmosShow',
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: '#07070f' }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "CosmosShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(CosmosSlide_1.CosmosSlide, { title: slide.title || '', subtitle: slide.subtitle, type: slide.type, data: slide.data, points: slide.points, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.CosmosShow = CosmosShow;
