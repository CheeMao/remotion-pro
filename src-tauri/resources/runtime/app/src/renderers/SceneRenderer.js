"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneRenderer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const layouts_1 = require("../layouts");
const templateSceneRegistry_1 = require("./templateSceneRegistry");
const registry_1 = require("../themes/registry");
const SceneRenderer = ({ slide, template, themeId, frame, fps, index, totalSlides, durationInFrames, fallback = null, }) => {
    const templateScene = (0, templateSceneRegistry_1.renderTemplateScene)({
        template,
        slide,
        index,
        totalSlides,
        durationInFrames,
    });
    if (templateScene) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: templateScene });
    }
    const theme = (0, registry_1.getThemeDefinition)(themeId);
    const layout = slide.layout || slide.type || 'default';
    if (layout === 'steps') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.StepsLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'hero' || layout === 'cover') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.HeroLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'compare') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.CompareLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'highlight') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.HighlightLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'list' || layout === 'cards') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.ListLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'stats') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.StatsLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'timeline') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.TimelineLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'chart') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.ChartLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'progress') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.ChartLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'quote') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.QuoteLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'cta') {
        return ((0, jsx_runtime_1.jsx)(layouts_1.CtaLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    if (layout === 'default' || !layout) {
        return ((0, jsx_runtime_1.jsx)(layouts_1.DefaultLayout, { slide: slide, theme: theme, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: fallback });
};
exports.SceneRenderer = SceneRenderer;
