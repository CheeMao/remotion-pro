"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
// 配色方案
const colors = {
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#06b6d4",
    warm: "#f97316",
    success: "#22c55e",
};
// ===== 动画数字组件 =====
const AnimatedNumber = ({ value, suffix = "", startFrame, color }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - startFrame,
        fps,
        config: { damping: 20, stiffness: 50 },
    });
    const displayValue = Math.round((0, remotion_1.interpolate)(progress, [0, 1], [0, value]));
    return ((0, jsx_runtime_1.jsxs)("span", { style: { fontVariantNumeric: "tabular-nums", color }, children: [displayValue.toLocaleString(), suffix] }));
};
// ===== 进度条组件 =====
const ProgressBar = ({ percent, label, color, delay }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 15 },
    });
    const width = (0, remotion_1.interpolate)(progress, [0, 1], [0, percent]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 16 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 26, color: "rgba(255,255,255,0.9)", width: 120, flexShrink: 0 }, children: label }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, height: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        width: `${width}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        borderRadius: 8,
                        boxShadow: `0 0 20px ${color}60`,
                    } }) }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 24, color, fontWeight: 600, width: 60, textAlign: "right" }, children: [Math.round(width), "%"] })] }));
};
// ===== 步骤组件 =====
const StepCard = ({ title, description, index, color, progress }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "flex",
            gap: 20,
            opacity: progress,
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [30, 0])}px)`,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "white",
                            boxShadow: `0 8px 24px ${color}50`,
                        }, children: index + 1 }), (0, jsx_runtime_1.jsx)("div", { style: { width: 3, flex: 1, background: "rgba(255,255,255,0.15)", marginTop: 8 } })] }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, paddingBottom: 28 }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: 32, fontWeight: 600, color: "white", margin: "0 0 8px 0" }, children: title }), description && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 24, color: "rgba(255,255,255,0.7)", margin: 0 }, children: description }))] })] }));
};
// ===== 时间线组件 =====
const TimelineItem = ({ year, title, description, color, progress, isLeft }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexDirection: isLeft ? "row" : "row-reverse",
            opacity: progress,
            transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [isLeft ? -40 : 40, 0])}px)`,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, textAlign: isLeft ? "right" : "left" }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, fontWeight: 700, color, marginBottom: 4 }, children: year }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 600, color: "white", marginBottom: 4 }, children: title }), description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.7)" }, children: description }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 20px ${color}`,
                    flexShrink: 0,
                } }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1 } })] }));
};
// ===== 主组件 =====
const GlassSlide = ({ title, subtitle, points, type = 'default', data, index, totalSlides, durationInFrames }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    // 根据 type 计算动画元素数量
    const getAnimCount = () => {
        var _a;
        if (type === 'steps' && Array.isArray(data === null || data === void 0 ? void 0 : data.steps))
            return data.steps.length;
        if (type === 'timeline' && Array.isArray(data === null || data === void 0 ? void 0 : data.timeline))
            return data.timeline.length;
        if (type === 'chart' && Array.isArray(data === null || data === void 0 ? void 0 : data.bars))
            return data.bars.length;
        if (type === 'stats' && Array.isArray(data === null || data === void 0 ? void 0 : data.stats))
            return data.stats.length;
        if (type === 'list' && Array.isArray(data === null || data === void 0 ? void 0 : data.items))
            return data.items.length;
        if (type === 'compare')
            return 2;
        return (_a = points === null || points === void 0 ? void 0 : points.length) !== null && _a !== void 0 ? _a : 0;
    };
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, getAnimCount());
    const bgRotate = frame * 0.3;
    const titleProgress = (0, remotion_1.spring)({
        frame: frame - timing.titleStart,
        fps,
        config: { damping: 12, stiffness: 100 },
    });
    const titleY = (0, remotion_1.interpolate)(titleProgress, [0, 1], [60, 0]);
    const titleBlur = (0, remotion_1.interpolate)(titleProgress, [0, 1], [10, 0]);
    const subtitleProgress = (0, remotion_1.spring)({
        frame: frame - timing.subtitleStart,
        fps,
        config: { damping: 14, stiffness: 90 },
    });
    const subtitleY = (0, remotion_1.interpolate)(subtitleProgress, [0, 1], [40, 0]);
    const pointProgresses = (points || []).map((_, i) => (0, remotion_1.spring)({
        frame: frame - timing.pointsStart - i * timing.pointStagger,
        fps,
        config: { damping: 10, stiffness: 100 },
    }));
    const cardFloat = Math.sin(frame * 0.03) * 8;
    const exitOpacity = (0, remotion_1.interpolate)(frame, [timing.exitStart, timing.exitEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // ===== 渲染不同类型内容 =====
    const renderContent = () => {
        var _a, _b, _c, _d, _e, _f, _g;
        switch (type) {
            // ===== 统计数据 =====
            case 'stats': {
                const stats = (data === null || data === void 0 ? void 0 : data.stats) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap", width: "100%" }, children: stats.map((stat, i) => {
                        const statProgress = (0, remotion_1.spring)({
                            frame: frame - 10 - i * 8,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const statColor = stat.color || [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                background: "rgba(255,255,255,0.06)",
                                backdropFilter: "blur(15px)",
                                borderRadius: 28,
                                border: "1px solid rgba(255,255,255,0.12)",
                                padding: "36px 48px",
                                textAlign: "center",
                                opacity: statProgress,
                                transform: `translateY(${(0, remotion_1.interpolate)(statProgress, [0, 1], [40, 0])}px) scale(${(0, remotion_1.interpolate)(statProgress, [0, 1], [0.9, 1])})`,
                                minWidth: 200,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 72, fontWeight: 800, marginBottom: 8 }, children: (0, jsx_runtime_1.jsx)(AnimatedNumber, { value: stat.value, suffix: stat.suffix, startFrame: 15 + i * 8, color: statColor }) }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: "rgba(255,255,255,0.8)" }, children: stat.label })] }, i));
                    }) }));
            }
            // ===== 对比 =====
            case 'compare': {
                const compareData = data;
                const leftProgress = (0, remotion_1.spring)({ frame: frame - 12, fps, config: { damping: 12 } });
                const rightProgress = (0, remotion_1.spring)({ frame: frame - 22, fps, config: { damping: 12 } });
                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: 24, alignItems: "center", justifyContent: "center", width: "100%" }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                flex: 1,
                                background: "rgba(244,63,94,0.12)",
                                backdropFilter: "blur(15px)",
                                borderRadius: 28,
                                border: "1px solid rgba(244,63,94,0.25)",
                                padding: "40px 36px",
                                textAlign: "center",
                                opacity: leftProgress,
                                transform: `translateX(${(0, remotion_1.interpolate)(leftProgress, [0, 1], [-50, 0])}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: colors.warm, marginBottom: 12, fontWeight: 600 }, children: ((_a = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _a === void 0 ? void 0 : _a.label) || "Before" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 800, color: "white", marginBottom: 8 }, children: ((_b = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _b === void 0 ? void 0 : _b.value) || "-" }), ((_c = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _c === void 0 ? void 0 : _c.desc) && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.7)" }, children: compareData.left.desc }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                width: 70,
                                height: 70,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.1)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: 24,
                                fontWeight: 800,
                                color: "white",
                                flexShrink: 0,
                                boxShadow: "0 0 30px rgba(255,255,255,0.1)",
                            }, children: (compareData === null || compareData === void 0 ? void 0 : compareData.vsText) || "VS" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                flex: 1,
                                background: "rgba(34,211,238,0.12)",
                                backdropFilter: "blur(15px)",
                                borderRadius: 28,
                                border: "1px solid rgba(34,211,238,0.25)",
                                padding: "40px 36px",
                                textAlign: "center",
                                opacity: rightProgress,
                                transform: `translateX(${(0, remotion_1.interpolate)(rightProgress, [0, 1], [50, 0])}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: colors.accent, marginBottom: 12, fontWeight: 600 }, children: ((_d = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _d === void 0 ? void 0 : _d.label) || "After" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 800, color: "white", marginBottom: 8 }, children: ((_e = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _e === void 0 ? void 0 : _e.value) || "+" }), ((_f = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _f === void 0 ? void 0 : _f.desc) && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.7)" }, children: compareData.right.desc }))] })] }));
            }
            // ===== 步骤 =====
            case 'steps': {
                const steps = (data === null || data === void 0 ? void 0 : data.steps) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 700 }, children: steps.map((step, i) => {
                        const stepProgress = (0, remotion_1.spring)({
                            frame: frame - 10 - i * 10,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const stepColor = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
                        return ((0, jsx_runtime_1.jsx)(StepCard, { title: step.title, description: step.description, index: i, color: stepColor, progress: stepProgress }, i));
                    }) }));
            }
            // ===== 图表 =====
            case 'chart': {
                const bars = (data === null || data === void 0 ? void 0 : data.bars) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 700 }, children: bars.map((bar, i) => {
                        const barColor = bar.color || [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
                        return ((0, jsx_runtime_1.jsx)(ProgressBar, { percent: bar.value, label: bar.label, color: barColor, delay: 10 + i * 8 }, i));
                    }) }));
            }
            // ===== 列表 =====
            case 'list': {
                const items = (data === null || data === void 0 ? void 0 : data.items) || [];
                const listColors = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 700 }, children: items.map((item, i) => {
                        const itemProgress = (0, remotion_1.spring)({
                            frame: frame - 10 - i * 8,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const itemColor = listColors[i % listColors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                gap: 20,
                                opacity: itemProgress,
                                transform: `translateX(${(0, remotion_1.interpolate)(itemProgress, [0, 1], [-30, 0])}px)`,
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                width: 52,
                                                height: 52,
                                                borderRadius: "50%",
                                                background: `linear-gradient(135deg, ${itemColor}, ${itemColor}cc)`,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                fontSize: 26,
                                                boxShadow: `0 8px 24px ${itemColor}50`,
                                            }, children: item.icon || "✦" }), i < items.length - 1 && ((0, jsx_runtime_1.jsx)("div", { style: { width: 2, flex: 1, background: "rgba(255,255,255,0.12)", marginTop: 6 } }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, paddingBottom: i < items.length - 1 ? 22 : 0, paddingTop: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, fontWeight: 600, color: "white", marginBottom: 6, lineHeight: 1.2 }, children: item.text }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }, children: item.desc }))] })] }, i));
                    }) }));
            }
            // ===== 时间线 =====
            case 'timeline': {
                const timeline = (data === null || data === void 0 ? void 0 : data.timeline) || [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: 750, position: "relative" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                position: "absolute",
                                left: "50%",
                                top: 20,
                                bottom: 20,
                                width: 3,
                                background: "rgba(255,255,255,0.15)",
                                transform: "translateX(-50%)",
                            } }), timeline.map((item, i) => {
                            const tlProgress = (0, remotion_1.spring)({
                                frame: frame - 10 - i * 12,
                                fps,
                                config: { damping: 12, stiffness: 100 },
                            });
                            const tlColor = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
                            return ((0, jsx_runtime_1.jsx)(TimelineItem, { year: item.year, title: item.title, description: item.description, color: tlColor, progress: tlProgress, isLeft: i % 2 === 0 }, i));
                        })] }));
            }
            // ===== 高亮 =====
            case 'highlight': {
                const items = (data === null || data === void 0 ? void 0 : data.items) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", width: "100%", maxWidth: 800 }, children: items.map((item, i) => {
                        const hlProgress = (0, remotion_1.spring)({
                            frame: frame - 8 - i * 6,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const hlColor = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
                        return ((0, jsx_runtime_1.jsx)("div", { style: {
                                background: `${hlColor}20`,
                                backdropFilter: "blur(15px)",
                                borderRadius: 20,
                                border: `2px solid ${hlColor}60`,
                                padding: "20px 36px",
                                opacity: hlProgress,
                                transform: `scale(${(0, remotion_1.interpolate)(hlProgress, [0, 1], [0.8, 1])})`,
                                boxShadow: `0 8px 30px ${hlColor}30`,
                            }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 28, fontWeight: 600, color: "white" }, children: item }) }, i));
                    }) }));
            }
            // ===== 引用 =====
            case 'quote': {
                const quoteData = data;
                const quoteProgress = (0, remotion_1.spring)({ frame: frame - 10, fps, config: { damping: 15 } });
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        background: "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(20px)",
                        borderRadius: 32,
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "50px 60px",
                        maxWidth: 800,
                        opacity: quoteProgress,
                        transform: `translateY(${(0, remotion_1.interpolate)(quoteProgress, [0, 1], [40, 0])}px)`,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 80, color: colors.primary, marginBottom: 10, lineHeight: 1 }, children: "\"" }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: 36, fontStyle: "italic", color: "white", margin: 0, lineHeight: 1.5 }, children: (quoteData === null || quoteData === void 0 ? void 0 : quoteData.quote) || title }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 24, textAlign: "right" }, children: ["\u2014 ", (quoteData === null || quoteData === void 0 ? void 0 : quoteData.author) || subtitle] })] }));
            }
            // ===== Hero =====
            case 'hero': {
                const heroData = data;
                const pulseScale = 1 + Math.sin(frame * 0.08) * 0.02;
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center" }, children: [(heroData === null || heroData === void 0 ? void 0 : heroData.badge) && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-block",
                                padding: "12px 28px",
                                background: `${colors.primary}30`,
                                backdropFilter: "blur(10px)",
                                borderRadius: 20,
                                border: `1px solid ${colors.primary}50`,
                                fontSize: 22,
                                fontWeight: 600,
                                color: colors.primary,
                                marginBottom: 24,
                                opacity: titleProgress,
                            }, children: heroData.badge })), (0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 80,
                                fontWeight: 900,
                                color: "white",
                                margin: 0,
                                marginBottom: 24,
                                textShadow: `0 0 60px ${colors.primary}40`,
                                letterSpacing: "-2px",
                                lineHeight: 1.1,
                            }, children: title }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 36, color: "rgba(255,255,255,0.8)", margin: 0, marginBottom: 48 }, children: subtitle })), (heroData === null || heroData === void 0 ? void 0 : heroData.cta) && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-block",
                                padding: "24px 56px",
                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                borderRadius: 40,
                                fontSize: 32,
                                fontWeight: 700,
                                color: "white",
                                transform: `scale(${pulseScale})`,
                                boxShadow: `0 15px 50px ${colors.primary}50`,
                            }, children: heroData.cta }))] }));
            }
            // ===== CTA (行动收束页) =====
            case 'cta': {
                const ctaData = data;
                const ctaText = (ctaData === null || ctaData === void 0 ? void 0 : ctaData.cta) || (ctaData === null || ctaData === void 0 ? void 0 : ctaData.button) || '点赞收藏';
                const tags = Array.isArray(ctaData === null || ctaData === void 0 ? void 0 : ctaData.items) ? ctaData.items : [];
                const pulseScale = 1 + Math.sin(frame * 0.12) * 0.04;
                const titleA = (0, remotion_1.spring)({ frame: frame - 8, fps, config: { damping: 14 } });
                const ctaA = (0, remotion_1.spring)({ frame: frame - 26, fps, config: { damping: 12, stiffness: 120 } });
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', maxWidth: 820 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                display: 'inline-block',
                                padding: '10px 22px',
                                borderRadius: 999,
                                background: `${colors.accent}25`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${colors.accent}50`,
                                fontSize: 20,
                                fontWeight: 700,
                                color: colors.accent,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                marginBottom: 28,
                                opacity: titleA,
                            }, children: (_g = ctaData === null || ctaData === void 0 ? void 0 : ctaData.badge) !== null && _g !== void 0 ? _g : '↳ FIN' }), (0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 72,
                                fontWeight: 900,
                                color: 'white',
                                margin: 0,
                                marginBottom: 22,
                                lineHeight: 1.12,
                                letterSpacing: '-1.5px',
                                opacity: titleA,
                                transform: `translateY(${(0, remotion_1.interpolate)(titleA, [0, 1], [24, 0])}px)`,
                            }, children: title }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: {
                                fontSize: 28,
                                color: 'rgba(255,255,255,0.78)',
                                margin: '0 0 40px',
                                opacity: titleA,
                            }, children: subtitle })), (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '26px 56px',
                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                borderRadius: 999,
                                fontSize: 32,
                                fontWeight: 800,
                                color: 'white',
                                boxShadow: `0 24px 70px ${colors.primary}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                transform: `scale(${pulseScale * (0, remotion_1.interpolate)(ctaA, [0, 1], [0.85, 1])})`,
                                opacity: ctaA,
                                letterSpacing: '0.04em',
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 28 }, children: "\u2192" }), ctaText] }), tags.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                marginTop: 32,
                                display: 'flex',
                                gap: 12,
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                opacity: ctaA,
                            }, children: tags.slice(0, 4).map((t, i) => {
                                const tagColor = [colors.primary, colors.accent, colors.secondary, colors.warm][i % 4];
                                return ((0, jsx_runtime_1.jsxs)("span", { style: {
                                        padding: '10px 18px',
                                        borderRadius: 999,
                                        background: `${tagColor}20`,
                                        border: `1px solid ${tagColor}45`,
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.86)',
                                    }, children: ["#", t] }, i));
                            }) }))] }));
            }
            // ===== Default (默认列表) =====
            default:
                return points && points.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                        width: "100%",
                        maxWidth: 700,
                    }, children: points.map((point, i) => {
                        const progress = pointProgresses[i] || 0;
                        const pointColor = [colors.primary, colors.accent, colors.secondary, colors.warm][i % 4];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                                padding: "22px 28px",
                                background: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(10px)",
                                borderRadius: 18,
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-40, 0])}px)`,
                                opacity: progress,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: "white",
                                        boxShadow: `0 6px 18px ${pointColor}40`,
                                        flexShrink: 0,
                                    }, children: i + 1 }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 26, color: "rgba(255, 255, 255, 0.95)", fontWeight: 500 }, children: point })] }, i));
                    }) })) : null;
        }
    };
    const getCardMinHeight = () => {
        if (type === 'hero')
            return 980;
        if (type === 'compare')
            return 900;
        if (type === 'quote')
            return 920;
        return 1180;
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
            overflow: "hidden",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    width: 1500,
                    height: 1500,
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${bgRotate}deg)`,
                    background: `conic-gradient(from 0deg, ${colors.primary}40, ${colors.secondary}40, ${colors.accent}40, ${colors.warm}40, ${colors.primary}40)`,
                    filter: "blur(100px)",
                    opacity: 0.6,
                } }), [...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
                const radius = 350;
                const x = Math.cos(angle) * radius + 540;
                const y = Math.sin(angle) * radius + 960;
                const dotColors = [colors.primary, colors.secondary, colors.accent, colors.warm];
                return ((0, jsx_runtime_1.jsx)("div", { style: {
                        position: "absolute",
                        left: x,
                        top: y,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: dotColors[i % 4],
                        boxShadow: `0 0 40px ${dotColors[i % 4]}80`,
                        opacity: 0.38,
                    } }, i));
            }), (0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
                    opacity: exitOpacity,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "88px 54px 108px",
                    zIndex: 10,
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            width: "90%",
                            maxWidth: 920,
                            minHeight: getCardMinHeight(),
                            padding: "34px 34px 40px",
                            background: "rgba(255, 255, 255, 0.08)",
                            backdropFilter: "blur(20px)",
                            borderRadius: 34,
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
                            transform: `translateY(${cardFloat}px)`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            justifyContent: "flex-start",
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    marginBottom: 28,
                                }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: 8,
                                        color: "white",
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 34, fontWeight: 800 }, children: String(index + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 18, color: "rgba(255,255,255,0.55)" }, children: ["/ ", String(totalSlides).padStart(2, "0")] })] }) }), type !== 'hero' && type !== 'quote' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                            fontSize: type === 'stats' || type === 'compare' ? 52 : 58,
                                            fontWeight: 800,
                                            color: "#ffffff",
                                            textAlign: "left",
                                            margin: 0,
                                            marginBottom: 12,
                                            transform: `translateY(${titleY}px)`,
                                            opacity: titleProgress,
                                            filter: `blur(${titleBlur}px)`,
                                            textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                                            letterSpacing: "-1px",
                                            lineHeight: 1.08,
                                            maxWidth: 760,
                                        }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            width: (0, remotion_1.interpolate)(titleProgress, [0, 1], [0, 180]),
                                            height: 4,
                                            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                                            borderRadius: 2,
                                            marginBottom: subtitle ? 16 : 32,
                                        } }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: {
                                            fontSize: 28,
                                            color: "rgba(255, 255, 255, 0.78)",
                                            textAlign: "left",
                                            margin: 0,
                                            marginBottom: 36,
                                            transform: `translateY(${subtitleY}px)`,
                                            opacity: subtitleProgress,
                                            fontWeight: 400,
                                            maxWidth: 760,
                                            lineHeight: 1.45,
                                        }, children: subtitle }))] })), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, display: "flex", alignItems: type === 'timeline' ? "flex-start" : "stretch", justifyContent: "center", width: "100%", overflow: "visible", paddingTop: type === 'quote' ? 24 : 0 }, children: renderContent() })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            marginTop: 36,
                            display: "flex",
                            gap: 10,
                        }, children: [...Array(totalSlides)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                                width: i === index ? 36 : 10,
                                height: 10,
                                borderRadius: 5,
                                background: i === index
                                    ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                                    : "rgba(255, 255, 255, 0.3)",
                            } }, i))) })] })] }));
};
exports.GlassSlide = GlassSlide;
