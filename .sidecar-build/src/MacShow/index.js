"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const MacSlide_1 = require("./MacSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
const defaultSlides = [
    {
        title: '把复杂内容做成像 Mac 应用一样顺滑的横屏视频',
        subtitle: '更适合教程、产品介绍、复盘和知识讲解',
        type: 'hero',
        data: {
            badge: 'macOS style layout',
            cta: 'Build a clean story',
        },
    },
    {
        title: '为什么横屏更适合这类内容',
        subtitle: '信息层级更舒展，页面能真正有主副区分',
        type: 'list',
        data: {
            items: [
                { text: '更宽的叙事空间', desc: '可以同时摆正文、侧栏、图表和对比信息' },
                { text: '更像产品界面', desc: '适合教程、演示、工作流和工具类内容' },
                { text: '镜头更稳定', desc: '减少竖屏里一味堆叠卡片的局促感' },
            ],
        },
    },
    {
        title: '核心指标一眼就能看明白',
        subtitle: '横屏里做统计页，更像真实数据面板',
        type: 'stats',
        data: {
            stats: [
                { value: 92, suffix: '%', label: '信息可读性' },
                { value: 3.2, suffix: 'x', label: '布局延展性' },
                { value: 18, suffix: 's', label: '理解启动时间' },
            ],
        },
    },
    {
        title: '结尾就用更明确的收束页',
        subtitle: '给结论，也给动作，不再只是普通结尾',
        type: 'cta',
        data: {
            cta: '用 MacShow 做下一条横屏视频',
            items: ['教程讲解', '产品演示', '工作流复盘'],
        },
    },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)('MacShow');
const MacShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: 'MacShow',
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: '#eef2f7' }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "MacShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(MacSlide_1.MacSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: slide.type, data: slide.data, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.MacShow = MacShow;
