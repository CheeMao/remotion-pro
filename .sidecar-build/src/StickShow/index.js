"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StickShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const StickSlide_1 = require("./StickSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
// ============================================================
// DEMO 内容 — 修改这里可预览所有 11 种 layout 效果
// ============================================================
const DEMO = {
    heroTitle: '为什么 AI 编程没让你变快',
    heroBadge: 'AI 编程真相',
    heroSubtitle: '也许你只是把 AI 当成了打字员',
    heroCta: '看完你就懂了',
    defaultTitle: '三个最常见的误区',
    defaultPoints: ['把 AI 当搜索引擎用', '不给 AI 足够的上下文', '不验证 AI 的输出结果'],
    listTitle: '老手用 AI 的四个习惯',
    listItems: [
        { icon: '🎯', text: '先想清楚再问', desc: '问题越清晰，答案越有用' },
        { icon: '📋', text: '给足上下文', desc: '让 AI 了解你的项目背景' },
        { icon: '🔍', text: '验证每一步', desc: '不盲目信任任何输出' },
        { icon: '🔄', text: '持续迭代', desc: '把对话当协作，不是命令' },
    ],
    statsTitle: '数据说话',
    stats: [
        { value: 55, suffix: '%', label: '代码生成占比' },
        { value: 3.2, suffix: 'x', label: '任务完成速度' },
        { value: 78, suffix: '%', label: '开发者采用率' },
    ],
    compareTitle: '新手 vs 老手用 AI',
    compareLeft: { label: '新手', value: '让 AI 写代码', desc: '把需求扔给 AI 等结果' },
    compareRight: { label: '老手', value: '让 AI 验证思路', desc: '先有判断再让 AI 落地' },
    vsText: 'VS',
    stepsTitle: '想用好 AI，先练这四个基本功',
    steps: [
        { title: '问题拆解', description: '把模糊需求转成清晰任务' },
        { title: '上下文管理', description: '给 AI 足够背景信息' },
        { title: '结果验证', description: '快速判断输出是否正确' },
        { title: '迭代提示', description: '通过对话逼近最优解' },
    ],
    chartTitle: 'AI 工具使用频率',
    chartBars: [
        { label: 'Claude Code', value: 88 },
        { label: 'Cursor', value: 82 },
        { label: 'Copilot', value: 75 },
        { label: 'ChatGPT', value: 70 },
    ],
    timelineTitle: 'AI 编程工具发展史',
    timeline: [
        { year: '2021', title: 'Copilot 诞生', description: 'GitHub 发布首个 AI 代码补全工具' },
        { year: '2023', title: 'ChatGPT 爆发', description: '生成式 AI 进入大众视野' },
        { year: '2024', title: 'Cursor 崛起', description: 'AI 原生 IDE 重新定义编程体验' },
        { year: '2025', title: 'Agent 时代', description: 'Claude Code 让 AI 自主完成任务' },
    ],
    highlightTitle: '关键认知',
    highlightItems: ['AI 编程', '提示工程', '上下文', '验证', '迭代', '思维方式'],
    quoteTitle: '记住一句话',
    quoteText: 'AI 不会让你失业，不会用 AI 的人才会',
    quoteAuthor: 'AI 编程箴言',
    ctaTitle: '今天就开始练，从下一行代码开始',
    ctaText: '点赞收藏',
    ctaTags: ['AI 编程', '效率提升', 'Cursor', '认知升级'],
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
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)("StickShow");
const StickShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: "StickShow",
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: "#1a1814" }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(StickSlide_1.StickSlide, { title: slide.title || "", subtitle: slide.subtitle, points: slide.points, type: slide.type, data: slide.data, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.StickShow = StickShow;
