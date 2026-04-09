"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const EditorialSlide_1 = require("./EditorialSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
const defaultSlides = [
    {
        title: "把横屏内容做成有版面感的叙事视频",
        subtitle: "更适合观点表达、案例拆解、品牌故事和内容型表达",
        type: "hero",
        data: {
            badge: "editorial landscape",
            cta: "Frame the next story",
            items: ["标题版面", "证据段落", "收束页"],
        },
    },
    {
        title: "横屏的价值不是更大，而是更会留白",
        subtitle: "当信息不再一列往下堆，叙事就有了真正的呼吸感",
        type: "steps",
        data: {
            steps: [
                { title: "先立主标题", description: "让这一页先有清楚的中心句" },
                { title: "再摆证据区", description: "把数字、案例、旁证放进第二阅读层" },
                { title: "最后做收束", description: "让用户看完知道观点落在哪里" },
            ],
        },
    },
    {
        title: "不是所有信息都要同时最大声",
        subtitle: "真正舒服的横屏视频，会让重点先被看见，再被理解",
        type: "quote",
        data: {
            quote: "真正舒服的横屏视频，会让重点先被看见，再被理解。",
            author: "EditorialShow",
            items: ["留白", "版面", "节奏"],
        },
    },
    {
        title: "让下一条内容更像作品，而不是素材拼接",
        subtitle: "给横屏一个更有气质的讲述方式",
        type: "cta",
        data: {
            cta: "用 EditorialShow 讲一个完整故事",
            items: ["案例拆解", "品牌故事", "观点视频"],
        },
    },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)("EditorialShow");
const EditorialShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        expectedTemplate: "EditorialShow",
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: "#f2ece2" }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "EditorialShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(EditorialSlide_1.EditorialSlide, { title: slide.title || "", subtitle: slide.subtitle, points: slide.points, type: slide.type, data: slide.data, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.EditorialShow = EditorialShow;
