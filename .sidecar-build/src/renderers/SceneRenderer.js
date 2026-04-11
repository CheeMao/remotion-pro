"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneRenderer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const layouts_1 = require("../layouts");
const templateSceneRegistry_1 = require("./templateSceneRegistry");
const registry_1 = require("../themes/registry");
const SlideMediaOverlay_1 = require("./SlideMediaOverlay");
const SceneMotionLayer_1 = require("./SceneMotionLayer");
const SceneRenderer = ({ slide, template, themeId, frame, fps, index, totalSlides, durationInFrames, fallback = null, }) => {
    const theme = (0, registry_1.getThemeDefinition)(themeId);
    const wrapScene = (content) => {
        const hasMedia = (0, SlideMediaOverlay_1.slideHasRenderableMedia)(slide);
        const hasMotion = (0, SceneMotionLayer_1.hasSceneMotionLayer)(slide, index);
        if (!hasMedia && !hasMotion) {
            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: content });
        }
        return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { children: [hasMotion ? ((0, jsx_runtime_1.jsx)(SceneMotionLayer_1.SceneMotionLayer, { slide: slide, theme: theme, frame: frame, fps: fps, index: index })) : null, hasMotion ? ((0, jsx_runtime_1.jsx)(SceneMotionLayer_1.SceneMotionShell, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, children: content })) : (content), hasMedia ? (0, jsx_runtime_1.jsx)(SlideMediaOverlay_1.SlideMediaOverlay, { slide: slide, frame: frame, fps: fps }) : null] }));
    };
    const templateScene = (0, templateSceneRegistry_1.renderTemplateScene)({
        template,
        slide,
        index,
        totalSlides,
        durationInFrames,
    });
    if (templateScene) {
        return wrapScene(templateScene);
    }
    const layout = slide.layout || slide.type || 'default';
    let content = fallback;
    if (layout === 'steps') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.StepsLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'hero' || layout === 'cover') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.HeroLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'compare') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.CompareLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'highlight') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.HighlightLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'list' || layout === 'cards') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.ListLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'stats') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.StatsLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'timeline') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.TimelineLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'chart') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.ChartLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'progress') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.ChartLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'quote') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.QuoteLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'cta') {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.CtaLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'default' || !layout) {
        content = ((0, jsx_runtime_1.jsx)(layouts_1.DefaultLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    return wrapScene(content);
};
exports.SceneRenderer = SceneRenderer;
