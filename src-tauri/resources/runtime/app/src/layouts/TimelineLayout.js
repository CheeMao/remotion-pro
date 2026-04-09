"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const TimelineLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a;
    const items = (((_a = slide.data) === null || _a === void 0 ? void 0 : _a.timeline) || []).slice(0, 5);
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
                            margin: '16px 0 32px',
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', display: 'grid', gap: 16 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 'calc(50% - 1px)',
                                    width: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.accents[0]}, ${theme.palette.accents[1] || theme.palette.accents[0]})`,
                                    opacity: 0.45,
                                } }), items.map((item, itemIndex) => {
                                const progress = (0, runtimeTiming_1.getElementProgress)({
                                    frame,
                                    fps,
                                    elementTimings: slide.elementTimings,
                                    slideAudioStart: slide.audioStart,
                                    id: `timeline-${itemIndex}`,
                                    fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                                    damping: theme.motion.damping,
                                    stiffness: theme.motion.stiffness,
                                });
                                const isLeft = itemIndex % 2 === 0;
                                const accent = theme.palette.accents[itemIndex % theme.palette.accents.length];
                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 36px 1fr',
                                        gap: 18,
                                        alignItems: 'center',
                                        opacity: progress,
                                        transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [isLeft ? -34 : 34, 0])}px)`,
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { textAlign: isLeft ? 'right' : 'left', order: isLeft ? 0 : 2 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: 20,
                                                        fontWeight: 800,
                                                        color: accent,
                                                        marginBottom: 4,
                                                    }, children: item.year }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: theme.typography.bodySize,
                                                        fontWeight: 800,
                                                        lineHeight: 1.3,
                                                        marginBottom: item.description ? 6 : 0,
                                                    }, children: item.title }), item.description ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: theme.typography.bodySize - 6,
                                                        color: theme.palette.muted,
                                                        lineHeight: 1.5,
                                                    }, children: item.description })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                order: 1,
                                                width: 22,
                                                height: 22,
                                                borderRadius: 999,
                                                background: accent,
                                                boxShadow: `0 0 18px ${accent}`,
                                                justifySelf: 'center',
                                            } }), (0, jsx_runtime_1.jsx)("div", { style: { order: isLeft ? 2 : 0 } })] }, `${item.year}-${item.title}-${itemIndex}`));
                            })] })] })] }));
};
exports.TimelineLayout = TimelineLayout;
