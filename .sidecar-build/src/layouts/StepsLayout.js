"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepsLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const StepsLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a, _b, _c, _d;
    const stepItems = (((_a = slide.data) === null || _a === void 0 ? void 0 : _a.steps) || []).length > 0
        ? (((_b = slide.data) === null || _b === void 0 ? void 0 : _b.steps) || [])
        : (slide.points || []).map((point) => ({ title: point, description: undefined }));
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, stepItems.length);
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
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: theme.palette.background,
            color: theme.palette.text,
            fontFamily: theme.typography.fontFamily,
            padding: '64px 58px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 18% 18%, ${theme.palette.accents[0]}24 0%, transparent 32%),` +
                        `radial-gradient(circle at 80% 18%, ${theme.palette.accents[1]}20 0%, transparent 28%)`,
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 40,
                    right: 48,
                    fontSize: 22,
                    fontWeight: 800,
                    color: theme.palette.muted,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            padding: '10px 16px',
                            borderRadius: theme.radius.chip,
                            fontSize: theme.typography.overlineSize,
                            letterSpacing: '0.14em',
                            fontWeight: 800,
                            color: theme.palette.muted,
                            background: theme.palette.surfaceAlt,
                            border: `1px solid ${theme.palette.border}`,
                            display: 'inline-flex',
                            marginBottom: 18,
                        }, children: (_d = (_c = slide.data) === null || _c === void 0 ? void 0 : _c.stepsLabel) !== null && _d !== void 0 ? _d : 'STEP FLOW' }), (0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            fontSize: theme.typography.titleSize - 6,
                            lineHeight: 1.03,
                            fontWeight: theme.typography.titleWeight,
                            maxWidth: 780,
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [38, 0])}px)`,
                        }, children: slide.title }), slide.subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: '16px 0 32px',
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', display: 'grid', gap: 16, marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'absolute',
                                    left: 31,
                                    top: 24,
                                    bottom: 24,
                                    width: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.accents[0]}, ${theme.palette.accents[1]})`,
                                    opacity: 0.55,
                                } }), stepItems.map((step, stepIndex) => {
                                const progress = (0, runtimeTiming_1.getElementProgress)({
                                    frame,
                                    fps,
                                    elementTimings: slide.elementTimings,
                                    slideAudioStart: slide.audioStart,
                                    id: `step-${stepIndex}`,
                                    fallbackStart: timing.pointsStart + stepIndex * theme.motion.staggerFrames,
                                    damping: theme.motion.damping,
                                    stiffness: theme.motion.stiffness,
                                });
                                const accent = theme.palette.accents[stepIndex % theme.palette.accents.length];
                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: '64px 1fr',
                                        gap: 18,
                                        alignItems: 'start',
                                        opacity: progress,
                                        transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-32, 0])}px)`,
                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                width: 64,
                                                height: 64,
                                                borderRadius: 20,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                                                color: '#fff',
                                                fontSize: 24,
                                                fontWeight: 900,
                                                boxShadow: `0 12px 24px ${accent}3d`,
                                                zIndex: 1,
                                            }, children: stepIndex + 1 }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                padding: '20px 22px',
                                                borderRadius: theme.radius.panel,
                                                background: theme.palette.surface,
                                                border: `1px solid ${theme.palette.border}`,
                                                boxShadow: theme.effects.glass
                                                    ? '0 24px 50px rgba(0,0,0,0.18)'
                                                    : '0 18px 40px rgba(0,0,0,0.12)',
                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: theme.typography.bodySize + 2,
                                                        fontWeight: 800,
                                                        lineHeight: 1.3,
                                                        marginBottom: step.description ? 8 : 0,
                                                    }, children: step.title }), step.description ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: theme.typography.bodySize - 4,
                                                        lineHeight: 1.55,
                                                        color: theme.palette.muted,
                                                    }, children: step.description })) : null] })] }, `${stepIndex}-${step.title}`));
                            })] })] })] }));
};
exports.StepsLayout = StepsLayout;
