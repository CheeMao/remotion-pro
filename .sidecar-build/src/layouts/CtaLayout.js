"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtaLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const CtaLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a, _b;
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, 1);
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
    const cta = ((_a = slide.data) === null || _a === void 0 ? void 0 : _a.cta) ||
        ((_b = slide.data) === null || _b === void 0 ? void 0 : _b.button) ||
        'Learn More';
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: theme.palette.background,
            color: theme.palette.text,
            fontFamily: theme.typography.fontFamily,
            padding: '74px 72px',
            justifyContent: 'center',
            alignItems: 'center',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 38,
                    right: 44,
                    color: theme.palette.muted,
                    fontSize: 22,
                    fontWeight: 800,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'relative',
                    zIndex: 1,
                    padding: '42px 46px',
                    borderRadius: theme.radius.panel + 6,
                    background: theme.palette.surface,
                    border: `1px solid ${theme.palette.border}`,
                    maxWidth: 860,
                    textAlign: 'center',
                    boxShadow: theme.effects.glass
                        ? '0 24px 50px rgba(0,0,0,0.18)'
                        : '0 18px 40px rgba(0,0,0,0.12)',
                }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            fontSize: theme.typography.titleSize,
                            lineHeight: 1.02,
                            fontWeight: theme.typography.titleWeight,
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [36, 0])}px)`,
                        }, children: slide.title }), slide.subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: '18px auto 0',
                            maxWidth: 720,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                            opacity: subtitleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(subtitleProgress, [0, 1], [24, 0])}px)`,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsx)("div", { style: {
                            marginTop: 32,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px 28px',
                            borderRadius: theme.radius.chip,
                            background: `linear-gradient(135deg, ${theme.palette.accents[0]}, ${theme.palette.accents[1] || theme.palette.accents[0]})`,
                            color: '#fff',
                            fontSize: theme.typography.bodySize - 2,
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            boxShadow: `0 18px 34px ${theme.palette.accents[0]}40`,
                        }, children: cta })] })] }));
};
exports.CtaLayout = CtaLayout;
