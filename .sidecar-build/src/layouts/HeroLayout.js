"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const HeroLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a, _b, _c, _d;
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
    const badge = ((_c = slide.data) === null || _c === void 0 ? void 0 : _c.badge) ||
        ((_d = slide.data) === null || _d === void 0 ? void 0 : _d.eyebrow) ||
        'FEATURE';
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: theme.palette.background,
            color: theme.palette.text,
            fontFamily: theme.typography.fontFamily,
            padding: '74px 72px',
            justifyContent: 'center',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 20% 24%, ${theme.palette.accents[0]}24 0%, transparent 34%),` +
                        `radial-gradient(circle at 78% 24%, ${theme.palette.accents[1] || theme.palette.accents[0]}22 0%, transparent 30%),` +
                        `radial-gradient(circle at 60% 78%, ${theme.palette.accents[2] || theme.palette.accents[0]}18 0%, transparent 30%)`,
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 38,
                    right: 44,
                    color: theme.palette.muted,
                    fontSize: 22,
                    fontWeight: 800,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1, maxWidth: 860 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            display: 'inline-flex',
                            marginBottom: 20,
                            padding: '10px 18px',
                            borderRadius: theme.radius.chip,
                            background: theme.palette.surfaceAlt,
                            border: `1px solid ${theme.palette.border}`,
                            color: theme.palette.text,
                            fontSize: theme.typography.overlineSize,
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            opacity: subtitleProgress,
                        }, children: badge }), (0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            fontSize: theme.typography.titleSize + 12,
                            lineHeight: 0.98,
                            fontWeight: theme.typography.titleWeight,
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [42, 0])}px)`,
                            textShadow: theme.effects.glow ? `0 0 30px ${theme.palette.accents[0]}30` : 'none',
                        }, children: slide.title }), slide.subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: '20px 0 0',
                            fontSize: theme.typography.subtitleSize + 2,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                            maxWidth: 760,
                            opacity: subtitleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(subtitleProgress, [0, 1], [28, 0])}px)`,
                        }, children: slide.subtitle })) : null] })] }));
};
exports.HeroLayout = HeroLayout;
