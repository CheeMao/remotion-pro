"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const QuoteLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    const data = slide.data;
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
    const quoteProgress = (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings: slide.elementTimings,
        slideAudioStart: slide.audioStart,
        id: 'quote-text',
        fallbackStart: timing.pointsStart,
        damping: theme.motion.damping,
        stiffness: theme.motion.stiffness,
    });
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: theme.palette.background,
            color: theme.palette.text,
            fontFamily: theme.typography.fontFamily,
            padding: '74px 80px',
            justifyContent: 'center',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 38,
                    right: 44,
                    color: theme.palette.muted,
                    fontSize: 22,
                    fontWeight: 800,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), slide.title ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: 54,
                    left: 64,
                    fontSize: theme.typography.overlineSize,
                    letterSpacing: '0.14em',
                    fontWeight: 800,
                    color: theme.palette.muted,
                    opacity: titleProgress,
                }, children: slide.title })) : null, (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'relative',
                    padding: '42px 46px',
                    borderRadius: theme.radius.panel + 6,
                    background: theme.palette.surface,
                    border: `1px solid ${theme.palette.border}`,
                    boxShadow: theme.effects.glass
                        ? '0 24px 50px rgba(0,0,0,0.18)'
                        : '0 18px 40px rgba(0,0,0,0.12)',
                    opacity: quoteProgress,
                    transform: `translateY(${(0, remotion_1.interpolate)(quoteProgress, [0, 1], [30, 0])}px)`,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            top: 18,
                            left: 26,
                            fontSize: 120,
                            lineHeight: 1,
                            color: theme.palette.accents[0],
                            opacity: 0.26,
                            fontWeight: 900,
                        }, children: "\"" }), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'relative',
                            zIndex: 1,
                            fontSize: theme.typography.titleSize - 12,
                            lineHeight: 1.18,
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                        }, children: (data === null || data === void 0 ? void 0 : data.quote) || slide.subtitle || slide.title }), ((data === null || data === void 0 ? void 0 : data.author) || slide.subtitle) ? ((0, jsx_runtime_1.jsx)("div", { style: {
                            marginTop: 28,
                            textAlign: 'center',
                            fontSize: theme.typography.bodySize - 2,
                            color: theme.palette.muted,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                        }, children: (data === null || data === void 0 ? void 0 : data.author) || slide.subtitle })) : null] })] }));
};
exports.QuoteLayout = QuoteLayout;
