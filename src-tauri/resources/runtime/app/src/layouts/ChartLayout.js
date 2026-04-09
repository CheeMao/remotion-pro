"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const ChartLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a;
    const chart = ((_a = slide.data) === null || _a === void 0 ? void 0 : _a.chart) || slide.data;
    const items = ((chart === null || chart === void 0 ? void 0 : chart.values) || (chart === null || chart === void 0 ? void 0 : chart.bars) || []).slice(0, 5);
    const chartType = (chart === null || chart === void 0 ? void 0 : chart.type) || ((chart === null || chart === void 0 ? void 0 : chart.values) ? 'bar' : 'progress');
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
    const maxValue = Math.max(...items.map((item) => item.value || 0), 1);
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
                        }, children: slide.subtitle })) : null, chartType === 'progress' ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 18 }, children: items.map((item, itemIndex) => {
                            const progress = (0, runtimeTiming_1.getElementProgress)({
                                frame,
                                fps,
                                elementTimings: slide.elementTimings,
                                slideAudioStart: slide.audioStart,
                                id: `chart-bar-${itemIndex}`,
                                fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                                damping: theme.motion.damping,
                                stiffness: theme.motion.stiffness,
                            });
                            const accent = item.color || theme.palette.accents[itemIndex % theme.palette.accents.length];
                            const width = ((item.value || 0) / maxValue) * 100 * progress;
                            return ((0, jsx_runtime_1.jsxs)("div", { style: { opacity: progress }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 8,
                                            fontSize: theme.typography.bodySize - 4,
                                        }, children: [(0, jsx_runtime_1.jsx)("span", { children: item.label }), (0, jsx_runtime_1.jsx)("span", { style: { color: accent, fontWeight: 800 }, children: item.value })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            height: 18,
                                            borderRadius: 999,
                                            background: theme.palette.surfaceAlt,
                                            overflow: 'hidden',
                                        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                width: `${width}%`,
                                                height: '100%',
                                                borderRadius: 999,
                                                background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                                                boxShadow: `0 0 16px ${accent}45`,
                                            } }) })] }, `${item.label}-${itemIndex}`));
                        }) })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 16, height: 360, marginTop: 12 }, children: items.map((item, itemIndex) => {
                            const progress = (0, runtimeTiming_1.getElementProgress)({
                                frame,
                                fps,
                                elementTimings: slide.elementTimings,
                                slideAudioStart: slide.audioStart,
                                id: `chart-bar-${itemIndex}`,
                                fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                                damping: theme.motion.damping,
                                stiffness: theme.motion.stiffness,
                            });
                            const accent = item.color || theme.palette.accents[itemIndex % theme.palette.accents.length];
                            const height = ((item.value || 0) / maxValue) * 250 * progress;
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 10,
                                    opacity: progress,
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, fontWeight: 800, color: accent }, children: item.value }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            width: '100%',
                                            height,
                                            borderRadius: '16px 16px 6px 6px',
                                            background: `linear-gradient(180deg, ${accent}, ${accent}cc)`,
                                            boxShadow: `0 0 18px ${accent}40`,
                                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: 16,
                                            color: theme.palette.muted,
                                            textAlign: 'center',
                                            lineHeight: 1.35,
                                        }, children: item.label })] }, `${item.label}-${itemIndex}`));
                        }) }))] })] }));
};
exports.ChartLayout = ChartLayout;
