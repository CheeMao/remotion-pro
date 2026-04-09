"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsLayout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const StatsLayout = ({ slide, theme, frame, fps, index, totalSlides, durationInFrames, }) => {
    var _a;
    const stats = (((_a = slide.data) === null || _a === void 0 ? void 0 : _a.stats) || []).slice(0, 4);
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, stats.length || 3);
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
                            margin: '16px 0 28px',
                            maxWidth: 760,
                            fontSize: theme.typography.subtitleSize,
                            lineHeight: 1.45,
                            color: theme.palette.muted,
                        }, children: slide.subtitle })) : null, (0, jsx_runtime_1.jsx)("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: stats.length > 2 ? '1fr 1fr' : `repeat(${Math.max(stats.length, 1)}, 1fr)`,
                            gap: 18,
                            marginTop: 18,
                        }, children: stats.map((stat, statIndex) => {
                            const progress = (0, runtimeTiming_1.getElementProgress)({
                                frame,
                                fps,
                                elementTimings: slide.elementTimings,
                                slideAudioStart: slide.audioStart,
                                id: `stat-${statIndex}`,
                                fallbackStart: timing.pointsStart + statIndex * theme.motion.staggerFrames,
                                damping: theme.motion.damping,
                                stiffness: theme.motion.stiffness,
                            });
                            const accent = theme.palette.accents[statIndex % theme.palette.accents.length];
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    padding: '28px 24px',
                                    borderRadius: theme.radius.panel,
                                    background: theme.palette.surface,
                                    border: `1px solid ${theme.palette.border}`,
                                    opacity: progress,
                                    transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [32, 0])}px)`,
                                    boxShadow: theme.effects.glass
                                        ? '0 24px 50px rgba(0,0,0,0.18)'
                                        : '0 18px 40px rgba(0,0,0,0.12)',
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: 18,
                                            fontWeight: 800,
                                            color: accent,
                                            letterSpacing: '0.12em',
                                            marginBottom: 14,
                                        }, children: String(statIndex + 1).padStart(2, '0') }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                            fontSize: theme.typography.titleSize - 10,
                                            lineHeight: 1,
                                            fontWeight: 900,
                                            color: theme.palette.text,
                                        }, children: [stat.value, stat.suffix || ''] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            marginTop: 16,
                                            fontSize: theme.typography.bodySize - 2,
                                            color: theme.palette.muted,
                                            lineHeight: 1.45,
                                        }, children: stat.label })] }, `${stat.label}-${statIndex}`));
                        }) })] })] }));
};
exports.StatsLayout = StatsLayout;
