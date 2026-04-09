"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichShow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const RichSlide_1 = require("./RichSlide");
const useContentJson_1 = require("../hooks/useContentJson");
const project_content_1 = require("../project-content");
const SubtitleOverlay_1 = require("../renderers/SubtitleOverlay");
// 验证是否是 RichShow 格式的 slide
const isRichSlide = (slide) => {
    const s = slide;
    return typeof (s === null || s === void 0 ? void 0 : s.type) === 'string' && typeof (s === null || s === void 0 ? void 0 : s.data) === 'object';
};
const defaultSlides = [
    { type: 'title', data: { title: 'Rich story flow', subtitle: 'Scene-based layout' } },
    {
        type: 'list',
        data: {
            title: 'What changes',
            items: [
                { icon: '01', text: 'Single narration track' },
                { icon: '02', text: 'Timeline-based durations' },
                { icon: '03', text: 'Unified preview and export' },
            ],
        },
    },
    {
        type: 'cta',
        data: { title: 'Render the final cut', subtitle: 'Preview before export', button: 'Export' },
    },
];
const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = (0, project_content_1.getTemplateContentPath)('RichShow');
const RichShow = () => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const { slides, soundtrackPath } = (0, useContentJson_1.useContentJson)(defaultSlides, {
        validateSlide: isRichSlide,
        expectedTemplate: 'RichShow',
        contentPath: CONTENT_PATH,
    });
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: '#0f0f1a' }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: (0, remotion_1.staticFile)(soundtrackSrc) }) : null, (0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, template: "RichShow" }), slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, DEFAULT_SLIDE_DURATION);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(RichSlide_1.RichSlide, { type: slide.type, data: slide.data, index: index, totalSlides: slides.length, durationInFrames: duration }) }, index));
            })] }));
};
exports.RichShow = RichShow;
