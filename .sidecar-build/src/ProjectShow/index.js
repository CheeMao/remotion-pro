"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const ProjectSlide_1 = require("./ProjectSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
// ============================================================
// DEMO 内容 — 修改这里可预览所有 11 种 layout 效果
// ProjectShow 有持久 header（brand）贯穿所有页面
// ============================================================
const DEMO = {
    // Brand — 显示在所有页面的顶部 header
    brandName: 'MinerU',
    brandBadge: '58K+ Stars',
    brandTagline: '将 PDF、Word、PPT 等任何文档，一键变 Markdown',
    brandChips: ['双引擎架构', '公式→LaTeX', '109种语言OCR', 'MCP/Cursor集成'],
    brandAttribution: '上海人工智能实验室 · 书生团队出品',
    // hero — 封面
    heroTitle: 'MinerU',
    heroSubtitle1: '上海人工智能实验室出品',
    heroSubtitle2: '把任何文档变成AI能理解的数据',
    // problems — 问题痛点
    problemsTitle: 'PDF 解析三大噩梦',
    problems: [
        { icon: 'Σ', title: '公式识别', desc: '数学公式变乱码，LaTeX无从恢复' },
        { icon: '≡', title: '表格结构', desc: '表格排版全丢失，数据一团乱麻' },
        { icon: '=', title: '多栏排版', desc: '阅读顺序错乱，语义完全失真' },
    ],
    // stats — 数据
    statsCount: 58541,
    statsPrefix: '⭐',
    statsBadges: ['GitHub全平台前0.1%', '同类开源第一', '2年58K Stars'],
    statsHighlight: 'PDF、Word、PPT解析的世界级难题',
    statsAccent: '被一个中国开源项目解决了！',
    // list — 功能列表
    listTitle: '核心能力',
    listItems: [
        { icon: '📄', title: '全格式解析', desc: 'PDF / Word / PPT / Excel 一键处理' },
        { icon: '🔢', title: '公式识别', desc: '复杂数学公式精准转换为LaTeX' },
        { icon: '📊', title: '表格还原', desc: '完整保留表格结构与数据' },
        { icon: '🌐', title: '多语言OCR', desc: '支持109种语言的文字识别' },
        { icon: '🤖', title: 'MCP集成', desc: '与Claude、Cursor无缝联动' },
    ],
    // compare — 对比
    compareLeft: { label: '传统工具', value: '格式丢失', desc: '公式乱码、表格混乱、排版错误' },
    compareRight: { label: 'MinerU', value: '精准还原', desc: '公式LaTeX、表格完整、顺序正确' },
    vsText: 'VS',
    // steps — 使用步骤
    stepsTitle: '快速上手',
    steps: [
        { title: '安装依赖', description: 'pip install mineru' },
        { title: '选择文档', description: '支持 PDF / Word / PPT 格式' },
        { title: '一键解析', description: 'mineru parse your-file.pdf' },
        { title: '获取结果', description: '输出标准 Markdown + 图片 + 表格' },
    ],
    // chart — 性能对比
    chartTitle: '与主流工具准确率对比',
    chartBars: [
        { label: 'MinerU', value: 94 },
        { label: 'Marker', value: 78 },
        { label: 'PyMuPDF', value: 65 },
        { label: 'pdfplumber', value: 58 },
    ],
    // timeline — 发展历程
    timelineTitle: 'MinerU 发展历程',
    timeline: [
        { year: '2023', title: '项目启动', description: '上海人工实验室内部孵化' },
        { year: '2024', title: '开源发布', description: 'GitHub 开源，迅速获得关注' },
        { year: '2024', title: '10K Stars', description: '三个月内突破万星' },
        { year: '2025', title: '58K Stars', description: '成为同类开源第一' },
    ],
    // highlight — 关键词
    highlightTitle: '关键技术',
    highlightItems: ['双引擎架构', 'LaTeX识别', 'OCR', '表格提取', 'MCP', '开源'],
    // quote — 引言
    quoteTitle: '用户评价',
    quoteText: '终于有工具能把数学论文里的公式完整提取出来了，做RAG再也不用担心公式乱码。',
    quoteAuthor: '— AI研究员',
    // cta — 行动
    ctaTitle: '立即体验 MinerU',
    ctaText: '点赞收藏',
    ctaTags: ['点赞', '收藏', '转发', '关注'],
};
const defaultBrand = {
    name: DEMO.brandName,
    badge: DEMO.brandBadge,
    tagline: DEMO.brandTagline,
    chips: DEMO.brandChips,
    attribution: DEMO.brandAttribution,
};
// ============================================================
// 11 个 layout，每种对应一页
// ============================================================
const defaultSlides = [
    // 1. hero — 封面
    { type: 'hero', title: DEMO.heroTitle,
        data: { brand: defaultBrand, subtitleLines: [DEMO.heroSubtitle1, DEMO.heroSubtitle2] } },
    // 2. problems — 问题痛点
    { type: 'problems', title: DEMO.problemsTitle,
        data: { brand: defaultBrand, problemsTitle: DEMO.problemsTitle, problems: DEMO.problems } },
    // 3. stats — 数据统计
    { type: 'stats', title: '数据说话',
        data: { brand: defaultBrand, countPrefix: DEMO.statsPrefix, countValue: DEMO.statsCount,
            badges: DEMO.statsBadges, highlight: DEMO.statsHighlight, highlightAccent: DEMO.statsAccent } },
    // 4. list — 功能列表
    { type: 'list', title: DEMO.listTitle,
        data: { brand: defaultBrand, items: DEMO.listItems } },
    // 5. compare — 对比
    { type: 'compare', title: '精度对比',
        data: { brand: defaultBrand, left: DEMO.compareLeft, right: DEMO.compareRight, vsText: DEMO.vsText } },
    // 6. steps — 步骤流程
    { type: 'steps', title: DEMO.stepsTitle,
        data: { brand: defaultBrand, steps: DEMO.steps } },
    // 7. chart — 进度/柱状图
    { type: 'chart', title: DEMO.chartTitle,
        data: { brand: defaultBrand, bars: DEMO.chartBars } },
    // 8. timeline — 时间线
    { type: 'timeline', title: DEMO.timelineTitle,
        data: { brand: defaultBrand, timeline: DEMO.timeline } },
    // 9. highlight — 关键词
    { type: 'highlight', title: DEMO.highlightTitle,
        data: { brand: defaultBrand, keywords: DEMO.highlightItems } },
    // 10. quote — 引言
    { type: 'quote', title: DEMO.quoteTitle,
        data: { brand: defaultBrand, quote: DEMO.quoteText, author: DEMO.quoteAuthor } },
    // 11. cta — 行动页
    { type: 'cta', title: DEMO.ctaTitle,
        data: { brand: defaultBrand, cta: DEMO.ctaText, items: DEMO.ctaTags.map(t => ({ title: t })) } },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)('ProjectShow');
const ProjectShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: 'ProjectShow',
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: 'linear-gradient(180deg, #0c1629 0%, #0d1b30 100%)' }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "ProjectShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(ProjectSlide_1.ProjectSlide, { title: slide.title || '', subtitle: slide.subtitle, type: slide.type, data: slide.data, points: slide.points, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.ProjectShow = ProjectShow;
