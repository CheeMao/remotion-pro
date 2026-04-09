"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const CompareLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    const data = slide.data;
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, 2);
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
    const renderPanel = (side, id, fallbackStart, accent, direction) => {
        const progress = (0, runtimeTiming_1.getElementProgress)({
            frame,
            fps,
            elementTimings: slide.elementTimings,
            slideAudioStart: slide.audioStart,
            id,
            fallbackStart,
            damping: theme.motion.damping,
            stiffness: theme.motion.stiffness,
        });
        if (!side)
            return null;
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                flex: 1,
                minHeight: 420,
                padding: '28px 26px',
                borderRadius: theme.radius.panel,
                background: theme.palette.surface,
                border: `1px solid ${theme.palette.border}`,
                opacity: progress,
                transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [direction * 54, 0])}px)`,
                boxShadow: theme.effects.glass
                    ? '0 24px 50px rgba(0,0,0,0.18)'
                    : '0 18px 40px rgba(0,0,0,0.12)',
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        display: 'inline-flex',
                        padding: '10px 16px',
                        borderRadius: theme.radius.chip,
                        background: `${accent}22`,
                        border: `1px solid ${accent}55`,
                        color: accent,
                        fontSize: theme.typography.overlineSize,
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                    }, children: side.label || (direction < 0 ? 'LEFT' : 'RIGHT') }), (0, jsx_runtime_1.jsx)("div", { style: {
                        marginTop: 20,
                        fontSize: theme.typography.bodySize + 8,
                        fontWeight: 800,
                        lineHeight: 1.2,
                    }, children: side.title || side.value }), side.desc ? ((0, jsx_runtime_1.jsx)("div", { style: {
                        marginTop: 14,
                        fontSize: theme.typography.bodySize - 2,
                        color: theme.palette.muted,
                        lineHeight: 1.5,
                    }, children: side.desc })) : null, side.points && side.points.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 12, marginTop: 22 }, children: side.points.map((point, pointIndex) => ((0, jsx_runtime_1.jsx)("div", { style: {
                            padding: '14px 16px',
                            borderRadius: 18,
                            background: theme.palette.surfaceAlt,
                            color: theme.palette.text,
                            fontSize: theme.typography.bodySize - 4,
                            lineHeight: 1.45,
                        }, children: point }, `${id}-${pointIndex}`))) })) : null] }));
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: theme.palette.background,
            color: theme.palette.text,
            fontFamily: theme.typography.fontFamily,
            padding: '58px 54px',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 38,
                    right: 44,
                    color: theme.palette.muted,
                    fontSize: 22,
                    fontWeight: 800,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            maxWidth: 760,
                            fontSize: theme.typography.titleSize - 4,
                            lineHeight: 1.02,
                            fontWeight: theme.typography.titleWeight,
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [36, 0])}px)`,
                        }, children: slide.title }), slide.subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: '16px 0 26px',
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 18 }, children: [renderPanel(data === null || data === void 0 ? void 0 : data.left, 'compare-left', timing.pointsStart, theme.palette.accents[0], -1), (0, jsx_runtime_1.jsx)("div", { style: {
                                    padding: '14px 18px',
                                    borderRadius: theme.radius.chip,
                                    background: theme.palette.surfaceAlt,
                                    border: `1px solid ${theme.palette.border}`,
                                    color: theme.palette.text,
                                    fontSize: 22,
                                    fontWeight: 900,
                                    letterSpacing: '0.08em',
                                }, children: (data === null || data === void 0 ? void 0 : data.centerLabel) || (data === null || data === void 0 ? void 0 : data.vsText) || 'VS' }), renderPanel(data === null || data === void 0 ? void 0 : data.right, 'compare-right', timing.pointsStart + theme.motion.staggerFrames, theme.palette.accents[1] || theme.palette.accents[0], 1)] })] })] }));
};
exports.CompareLayout = CompareLayout;
