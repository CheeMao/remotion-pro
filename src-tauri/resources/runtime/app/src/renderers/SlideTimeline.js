"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlideTimeline = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const useContentJson_1 = require("../hooks/useContentJson");
const SceneRenderer_1 = require("./SceneRenderer");
const SubtitleOverlay_1 = require("./SubtitleOverlay");
const resolveAudioSrc = (soundtrackPath) => {
    const soundtrackSrc = (0, useContentJson_1.getStaticAssetPath)(soundtrackPath);
    if (!soundtrackSrc) {
        return undefined;
    }
    if (soundtrackSrc.startsWith('data:') ||
        soundtrackSrc.startsWith('blob:') ||
        soundtrackSrc.startsWith('http://') ||
        soundtrackSrc.startsWith('https://') ||
        soundtrackSrc.startsWith('file://') ||
        soundtrackSrc.startsWith('tauri://') ||
        soundtrackSrc.startsWith('asset://') ||
        /^[A-Za-z]:[\\/]/.test(soundtrackSrc) ||
        soundtrackSrc.startsWith('\\\\') ||
        (soundtrackSrc.startsWith('/') && !soundtrackSrc.startsWith('//'))) {
        return soundtrackSrc;
    }
    return (0, remotion_1.staticFile)(soundtrackSrc);
};
const SceneFrame = ({ slide, index, totalSlides, durationInFrames, template, themeId, renderFallback }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    return ((0, jsx_runtime_1.jsx)(SceneRenderer_1.SceneRenderer, { slide: slide, template: template, themeId: themeId, frame: frame, fps: fps, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames, fallback: renderFallback ? renderFallback(slide, index, durationInFrames) : null }));
};
const SlideTimeline = ({ slides, defaultSlideDuration = 150, soundtrackPath, template, themeId, background = '#050816', subtitlesEnabled = true, renderFallback, }) => {
    const { fps } = (0, remotion_1.useVideoConfig)();
    const soundtrackSrc = resolveAudioSrc(soundtrackPath);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background }, children: [soundtrackSrc ? (0, jsx_runtime_1.jsx)(remotion_1.Audio, { src: soundtrackSrc }) : null, subtitlesEnabled ? ((0, jsx_runtime_1.jsx)(SubtitleOverlay_1.SubtitleOverlay, { slides: slides, themeId: themeId, template: template })) : null, slides.map((slide, index) => {
                const { from, duration } = (0, useContentJson_1.getSlideTiming)(slides, index, fps, defaultSlideDuration);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: duration, children: (0, jsx_runtime_1.jsx)(SceneFrame, { slide: slide, index: index, totalSlides: slides.length, durationInFrames: duration, template: template, themeId: themeId, renderFallback: renderFallback }) }, slide.id || index));
            })] }));
};
exports.SlideTimeline = SlideTimeline;
