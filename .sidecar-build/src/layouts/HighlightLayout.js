"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const HighlightLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a, _b, _c;
    const items = (((_a = slide.data) === null || _a === void 0 ? void 0 : _a.highlights) || []).length > 0
        ? (((_b = slide.data) === null || _b === void 0 ? void 0 : _b.highlights) || [])
        : (((_c = slide.data) === null || _c === void 0 ? void 0 : _c.items) || (slide.points || [])).map((item) => ({
            text: typeof item === 'string' ? item : String(item),
            color: undefined,
        }));
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, items.length);
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
            padding: '66px 62px',
            justifyContent: 'center',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 38,
                    right: 44,
                    color: theme.palette.muted,
                    fontSize: 22,
                    fontWeight: 800,
                }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            maxWidth: 780,
                            fontSize: theme.typography.titleSize - 4,
                            lineHeight: 1.02,
                            fontWeight: theme.typography.titleWeight,
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [34, 0])}px)`,
                        }, children: slide.title }), slide.subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: '18px 0 30px',
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 14, maxWidth: 860 }, children: items.map((item, itemIndex) => {
                            const progress = (0, runtimeTiming_1.getElementProgress)({
                                frame,
                                fps,
                                elementTimings: slide.elementTimings,
                                slideAudioStart: slide.audioStart,
                                id: `highlight-${itemIndex}`,
                                fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                                damping: theme.motion.damping,
                                stiffness: theme.motion.stiffness,
                            });
                            const accent = item.color || theme.palette.accents[itemIndex % theme.palette.accents.length];
                            return ((0, jsx_runtime_1.jsx)("div", { style: {
                                    padding: '16px 22px',
                                    borderRadius: theme.radius.panel - 8,
                                    background: `${accent}18`,
                                    border: `1px solid ${accent}55`,
                                    color: theme.palette.text,
                                    fontSize: theme.typography.bodySize,
                                    fontWeight: 800,
                                    opacity: progress,
                                    transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [18, 0])}px) scale(${(0, remotion_1.interpolate)(progress, [0, 1], [0.96, 1])})`,
                                    boxShadow: theme.effects.glow ? `0 0 18px ${accent}28` : 'none',
                                }, children: item.text }, `${item.text}-${itemIndex}`));
                        }) })] })] }));
};
exports.HighlightLayout = HighlightLayout;
