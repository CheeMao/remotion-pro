"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const StudioSlide_1 = require("./StudioSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
const defaultSlides = [
    {
        title: "把横屏视频做成演播室级信息墙",
        subtitle: "更适合数据复盘、项目总结、策略拆解和报告型内容",
        type: "hero",
        data: {
            badge: "landscape control room",
            cta: "Open the signal board",
            items: ["数据主屏", "证据中段", "明确收束"],
        },
    },
    {
        title: "横屏里最适合摆证据而不是堆文案",
        subtitle: "一边讲逻辑，一边给图表、对比、次级信息留空间",
        type: "compare",
        data: {
            left: { label: "堆文本", value: "信息平铺", desc: "读者只能顺着念，抓不到焦点" },
            right: { label: "演播室布局", value: "主次并行", desc: "标题、证据、补充信息能同时成立" },
        },
    },
    {
        title: "中段至少给一页真正的指标页",
        subtitle: "横屏的优势不是更宽，而是能把结论和证据一起摆出来",
        type: "stats",
        data: {
            stats: [
                { value: 87, suffix: "%", label: "信息聚焦度" },
                { value: 3.4, suffix: "x", label: "证据承载量" },
                { value: 18, suffix: "s", label: "结论进入时间" },
            ],
        },
    },
    {
        title: "最后一页就让用户知道下一步",
        subtitle: "先给结论，再给行动，不要把横屏视频收在空话里",
        type: "cta",
        data: {
            cta: "用 StudioShow 做下一条横屏复盘",
            items: ["复盘", "汇报", "数据讲解"],
        },
    },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)("StudioShow");
const StudioShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: "StudioShow",
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: "#060914" }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "StudioShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(StudioSlide_1.StudioSlide, { title: slide.title || "", subtitle: slide.subtitle, points: slide.points, type: slide.type, data: slide.data, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.StudioShow = StudioShow;
