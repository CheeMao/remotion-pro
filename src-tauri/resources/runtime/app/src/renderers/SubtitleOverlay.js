"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubtitleOverlay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const registry_1 = require("../themes/registry");
const captions_1 = require("./captions");
const SubtitleOverlay = ({ slides, themeId, template, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps, width, height } = (0, remotion_1.useVideoConfig)();
    const currentTime = frame / fps;
    const captions = (0, captions_1.buildCaptionSegments)(slides);
    const activeCaption = captions.find((caption) => currentTime >= caption.start && currentTime < caption.end);
    if (!activeCaption) {
        return null;
    }
    const localFrame = Math.max(0, Math.round((currentTime - activeCaption.start) * fps));
    const activeDurationInFrames = Math.max(1, Math.round((activeCaption.end - activeCaption.start) * fps));
    const resolvedThemeId = themeId || (0, registry_1.getThemeIdForTemplate)(template);
    const theme = (0, registry_1.getThemeDefinition)(resolvedThemeId);
    const isPortrait = height >= width;
    const safeBottomPadding = isPortrait ? Math.max(92, height * 0.058) : Math.max(54, height * 0.05);
    const horizontalPadding = isPortrait ? Math.max(36, width * 0.055) : Math.max(60, width * 0.1);
    const fontSize = isPortrait
        ? Math.max(36, Math.min(50, width * 0.037))
        : Math.max(30, Math.min(42, height * 0.05));
    const intro = (0, remotion_1.spring)({
        frame: localFrame,
        fps,
        config: { damping: 20, stiffness: 170 },
    });
    const outroStart = Math.max(0, activeDurationInFrames - Math.round(fps * 0.18));
    const outro = (0, remotion_1.interpolate)(localFrame, [outroStart, activeDurationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const opacity = Math.min(1, intro) * outro;
    const translateY = (0, remotion_1.interpolate)(intro, [0, 1], [12, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
            justifyContent: 'flex-end',
            alignItems: 'center',
            pointerEvents: 'none',
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
            paddingBottom: safeBottomPadding,
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                maxWidth: isPortrait ? width * 0.92 : width * 0.78,
                color: '#ffffff',
                fontFamily: theme.typography.fontFamily,
                fontSize,
                fontWeight: 900,
                lineHeight: 1.24,
                letterSpacing: '0.01em',
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                opacity,
                transform: `translateY(${translateY}px)`,
                textShadow: '4px -4px 5px rgba(0, 0, 0, 0.8)',
            }, children: activeCaption.text }) }));
};
exports.SubtitleOverlay = SubtitleOverlay;
