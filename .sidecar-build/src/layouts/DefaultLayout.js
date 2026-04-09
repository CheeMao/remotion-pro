"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const DefaultLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a, _b;
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, (_b = (_a = slide.points) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
    const titleProgress = (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings: slide.elementTimings,
        slideAudioStart: slide.audioStart,
        id: 'title',
        fallbackStart: timing.titleStart,
        damping: theme.motion.damping,
        stiffness: theme.motion.stiffness,
    });
    const subtitleProgress = (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings: slide.elementTimings,
        slideAudioStart: slide.audioStart,
        id: 'subtitle',
        fallbackStart: timing.subtitleStart,
        damping: theme.motion.damping,
        stiffness: theme.motion.stiffness,
    });
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: theme.palette.background,
            color: theme.palette.text,
            fontFamily: theme.typography.fontFamily,
            padding: '64px 58px',
            justifyContent: 'center',
        }, children: [theme.effects.grid ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
              linear-gradient(${theme.palette.border} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.palette.border} 1px, transparent 1px)
            `,
                    backgroundSize: '72px 72px',
                    opacity: 0.4,
                } })) : null, (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: 40,
                    left: 48,
                    padding: '10px 16px',
                    borderRadius: theme.radius.chip,
                    fontSize: theme.typography.overlineSize,
                    letterSpacing: '0.14em',
                    fontWeight: 800,
                    color: theme.palette.muted,
                    background: theme.palette.surfaceAlt,
                    border: `1px solid ${theme.palette.border}`,
                }, children: "SHARED LAYOUT" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 40,
                    right: 48,
                    fontSize: 22,
                    fontWeight: 800,
                    color: theme.palette.muted,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 22,
                }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            fontSize: theme.typography.titleSize,
                            lineHeight: 1.03,
                            fontWeight: theme.typography.titleWeight,
                            maxWidth: 780,
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [42, 0])}px)`,
                        }, children: slide.title }), slide.subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: 0,
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                            opacity: subtitleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(subtitleProgress, [0, 1], [26, 0])}px)`,
                        }, children: slide.subtitle })) : null, slide.points && slide.points.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 16, marginTop: 18, maxWidth: 820 }, children: slide.points.map((point, pointIndex) => {
                            const progress = (0, runtimeTiming_1.getElementProgress)({
                                frame,
                                fps,
                                elementTimings: slide.elementTimings,
                                slideAudioStart: slide.audioStart,
                                id: `point-${pointIndex}`,
                                fallbackStart: timing.pointsStart + pointIndex * theme.motion.staggerFrames,
                                damping: theme.motion.damping,
                                stiffness: theme.motion.stiffness,
                            });
                            const accent = theme.palette.accents[pointIndex % theme.palette.accents.length];
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: '14px 1fr',
                                    gap: 16,
                                    alignItems: 'center',
                                    padding: '18px 22px',
                                    borderRadius: theme.radius.panel,
                                    background: theme.palette.surface,
                                    border: `1px solid ${theme.palette.border}`,
                                    opacity: progress,
                                    transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-36, 0])}px)`,
                                    boxShadow: theme.effects.glass
                                        ? '0 24px 50px rgba(0,0,0,0.18)'
                                        : '0 18px 40px rgba(0,0,0,0.12)',
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 12,
                                            height: 12,
                                            borderRadius: 999,
                                            background: accent,
                                            boxShadow: theme.effects.glow ? `0 0 18px ${accent}` : 'none',
                                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: theme.typography.bodySize,
                                            lineHeight: 1.45,
                                            fontWeight: theme.typography.bodyWeight,
                                        }, children: point })] }, `${pointIndex}-${point}`));
                        }) })) : null] })] }));
};
exports.DefaultLayout = DefaultLayout;
