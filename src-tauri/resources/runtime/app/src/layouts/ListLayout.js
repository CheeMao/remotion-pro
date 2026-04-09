"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const ListLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a, _b;
    const items = (((_a = slide.data) === null || _a === void 0 ? void 0 : _a.items) || []).length > 0
        ? (((_b = slide.data) === null || _b === void 0 ? void 0 : _b.items) || [])
        : (slide.points || []).map((point, itemIndex) => ({
            icon: String(itemIndex + 1).padStart(2, '0'),
            text: point,
            title: point,
            desc: undefined,
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
                            margin: '16px 0 30px',
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsx)("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: items.length >= 4 ? '1fr 1fr' : '1fr',
                            gap: 16,
                        }, children: items.map((item, itemIndex) => {
                            const progress = (0, runtimeTiming_1.getElementProgress)({
                                frame,
                                fps,
                                elementTimings: slide.elementTimings,
                                slideAudioStart: slide.audioStart,
                                id: `item-${itemIndex}`,
                                fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                                damping: theme.motion.damping,
                                stiffness: theme.motion.stiffness,
                            });
                            const accent = theme.palette.accents[itemIndex % theme.palette.accents.length];
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: '58px 1fr',
                                    gap: 16,
                                    alignItems: 'start',
                                    padding: '18px 20px',
                                    borderRadius: theme.radius.panel,
                                    background: theme.palette.surface,
                                    border: `1px solid ${theme.palette.border}`,
                                    opacity: progress,
                                    transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [24, 0])}px)`,
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 58,
                                            height: 58,
                                            borderRadius: 18,
                                            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18,
                                            fontWeight: 900,
                                            boxShadow: `0 12px 24px ${accent}3d`,
                                        }, children: item.icon || String(itemIndex + 1).padStart(2, '0') }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                    fontSize: theme.typography.bodySize,
                                                    fontWeight: 800,
                                                    lineHeight: 1.35,
                                                    marginBottom: item.desc ? 6 : 0,
                                                }, children: item.title || item.text }), item.desc ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                    fontSize: theme.typography.bodySize - 6,
                                                    color: theme.palette.muted,
                                                    lineHeight: 1.5,
                                                }, children: item.desc })) : null] })] }, `${item.title || item.text}-${itemIndex}`));
                        }) })] })] }));
};
exports.ListLayout = ListLayout;
