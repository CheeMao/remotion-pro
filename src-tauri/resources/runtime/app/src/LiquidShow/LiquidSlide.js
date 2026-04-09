"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
// macOS 26 液态玻璃配色
const colors = {
    bg: "#e8e8ed",
    blob1: "#ff6b9d",
    blob2: "#c44dff",
    blob3: "#00d4aa",
    blob4: "#ff9f43",
    blob5: "#5f9eff",
    blob6: "#a855f7",
    text: "#1d1d1f",
    textSecondary: "#424245",
    muted: "#6e6e73",
};
// ===== 超大液态 Blob =====
const MegaBlob = ({ frame, x, y, size, color, speedX, speedY, phase }) => {
    const moveX = Math.sin(frame * speedX + phase) * 100 + Math.cos(frame * speedX * 0.7) * 50;
    const moveY = Math.cos(frame * speedY + phase) * 80 + Math.sin(frame * speedY * 0.6) * 40;
    const morph1 = 30 + Math.sin(frame * 0.015 + phase) * 25;
    const morph2 = 70 + Math.cos(frame * 0.012 + phase) * 30;
    const morph3 = 50 + Math.sin(frame * 0.018 + phase + 1) * 28;
    const morph4 = 60 + Math.cos(frame * 0.014 + phase + 2) * 22;
    const scale = 1 + Math.sin(frame * 0.008 + phase) * 0.12;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: "absolute",
            left: x + moveX,
            top: y + moveY,
            width: size,
            height: size,
            background: color,
            borderRadius: `${morph1}% ${morph2}% ${morph3}% ${morph4}%`,
            filter: "blur(100px)",
            opacity: 0.85,
            transform: `scale(${scale})`,
        } }));
};
// ===== 渐变背景 =====
const GradientBackground = ({ frame }) => {
    const shift = Math.sin(frame * 0.005) * 20;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: "absolute",
            inset: 0,
            background: `
          radial-gradient(ellipse 80% 60% at ${50 + shift}% 30%, rgba(255,107,157,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 70% 80% at ${30 + shift * 0.5}% 70%, rgba(196,77,255,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 90% 70% at ${70 - shift * 0.3}% 50%, rgba(0,212,170,0.1) 0%, transparent 50%),
          linear-gradient(180deg, #f0f0f5 0%, #e8e8ed 50%, #e0e0e5 100%)
        `,
        } }));
};
// ===== 主毛玻璃卡片 =====
const LiquidGlassCard = ({ children, frame, delay, width = 920, padding = "70px 55px" }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps: 30,
        config: { damping: 20, stiffness: 100 },
    });
    const breathe = 1 + Math.sin(frame * 0.025) * 0.008;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: "relative",
            opacity: progress,
            transform: `scale(${progress * breathe}) translateY(${(1 - progress) * 20}px)`,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: -2,
                    borderRadius: 46,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
                    filter: "blur(20px)",
                    opacity: 0.5,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "relative",
                    width,
                    padding,
                    background: `
            linear-gradient(135deg,
              rgba(255,255,255,0.75) 0%,
              rgba(255,255,255,0.65) 50%,
              rgba(255,255,255,0.7) 100%
            )
          `,
                    backdropFilter: "blur(80px) saturate(200%)",
                    WebkitBackdropFilter: "blur(80px) saturate(200%)",
                    borderRadius: 44,
                    border: "1px solid rgba(255,255,255,0.8)",
                    boxShadow: `
            0 25px 50px -12px rgba(0,0,0,0.08),
            0 12px 24px -8px rgba(0,0,0,0.04),
            0 0 0 1px rgba(255,255,255,0.5),
            inset 0 1px 2px rgba(255,255,255,1),
            inset 0 -1px 1px rgba(0,0,0,0.03)
          `,
                }, children: children })] }));
};
// ===== 浮动装饰球 =====
const FloatingSphere = ({ frame, x, y, size, color, delay }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps: 30,
        config: { damping: 15 },
    });
    const floatY = Math.sin(frame * 0.025 + delay) * 12;
    const floatX = Math.cos(frame * 0.018 + delay * 0.7) * 8;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: "absolute",
            left: x + floatX,
            top: y + floatY,
            width: size,
            height: size,
            borderRadius: "50%",
            background: `
          radial-gradient(circle at 35% 35%,
            rgba(255,255,255,0.9) 0%,
            ${color} 40%,
            ${color}cc 100%
          )
        `,
            boxShadow: `
          0 8px 32px ${color}50,
          inset 0 -6px 12px rgba(0,0,0,0.15),
          inset 0 6px 12px rgba(255,255,255,0.9)
        `,
            opacity: progress * 0.9,
            transform: `scale(${progress})`,
        } }));
};
// ===== 玻璃胶囊标签 =====
// ===== 动画数字 =====
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
// ===== 进度条 =====
const ProgressBar = ({ percent, label, color, delay }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 15 },
    });
    const width = (0, remotion_1.interpolate)(progress, [0, 1], [0, percent]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 14 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 22, color: colors.text, width: 100, flexShrink: 0, fontWeight: 500 }, children: label }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, height: 14, background: "rgba(0,0,0,0.06)", borderRadius: 7, overflow: "hidden" }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        width: `${width}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        borderRadius: 7,
                        boxShadow: `0 2px 12px ${color}50`,
                    } }) }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 20, color, fontWeight: 600, width: 50, textAlign: "right" }, children: [Math.round(width), "%"] })] }));
};
// ===== 步骤卡片 =====
const StepCard = ({ title, description, index, color, progress }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "flex",
            gap: 16,
            opacity: progress,
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [25, 0])}px)`,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 20,
                            fontWeight: 700,
                            color: "white",
                            boxShadow: `0 6px 20px ${color}50`,
                        }, children: index + 1 }), (0, jsx_runtime_1.jsx)("div", { style: { width: 2, flex: 1, background: "rgba(0,0,0,0.08)", marginTop: 6 } })] }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, paddingBottom: 24 }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: 26, fontWeight: 600, color: colors.text, margin: "0 0 4px 0" }, children: title }), description && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 20, color: colors.muted, margin: 0 }, children: description }))] })] }));
};
// ===== 时间线项 =====
const TimelineItem = ({ year, title, description, color, progress, isLeft }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexDirection: isLeft ? "row" : "row-reverse",
            opacity: progress,
            transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [isLeft ? -30 : 30, 0])}px)`,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, textAlign: isLeft ? "right" : "left" }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, fontWeight: 700, color, marginBottom: 2 }, children: year }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, fontWeight: 600, color: colors.text, marginBottom: 2 }, children: title }), description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: colors.muted }, children: description }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 16px ${color}`,
                    flexShrink: 0,
                } }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1 } })] }));
};
// ===== 主组件 =====
const LiquidSlide = ({ title, subtitle, points, type = 'default', data, index, totalSlides, durationInFrames }) => {
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
    const titleProgress = (0, remotion_1.spring)({
        frame: frame - timing.titleStart,
        fps,
        config: { damping: 18, stiffness: 100 },
    });
    const subtitleProgress = (0, remotion_1.spring)({
        frame: frame - timing.subtitleStart,
        fps,
        config: { damping: 18, stiffness: 90 },
    });
    const pointProgresses = (points || []).map((_, i) => (0, remotion_1.spring)({
        frame: frame - timing.pointsStart - i * timing.pointStagger,
        fps,
        config: { damping: 14, stiffness: 100 },
    }));
    const exitOpacity = (0, remotion_1.interpolate)(frame, [timing.exitStart, timing.exitEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // ===== 渲染不同类型内容 =====
    const renderContent = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        switch (type) {
            // ===== 统计数据 =====
            case 'stats': {
                const stats = (data === null || data === void 0 ? void 0 : data.stats) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", width: "100%" }, children: stats.map((stat, i) => {
                        const statProgress = (0, remotion_1.spring)({
                            frame: frame - 10 - i * 8,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const statColor = stat.color || [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                background: "rgba(255,255,255,0.6)",
                                backdropFilter: "blur(15px)",
                                borderRadius: 24,
                                border: "1px solid rgba(255,255,255,0.8)",
                                padding: "32px 40px",
                                textAlign: "center",
                                opacity: statProgress,
                                transform: `translateY(${(0, remotion_1.interpolate)(statProgress, [0, 1], [30, 0])}px) scale(${(0, remotion_1.interpolate)(statProgress, [0, 1], [0.9, 1])})`,
                                minWidth: 170,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 60, fontWeight: 700, marginBottom: 6 }, children: (0, jsx_runtime_1.jsx)(AnimatedNumber, { value: stat.value, suffix: stat.suffix, startFrame: 15 + i * 8, color: statColor }) }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: colors.muted }, children: stat.label })] }, i));
                    }) }));
            }
            // ===== 对比 =====
            case 'compare': {
                const compareData = data;
                const leftProgress = (0, remotion_1.spring)({ frame: frame - 12, fps, config: { damping: 12 } });
                const rightProgress = (0, remotion_1.spring)({ frame: frame - 22, fps, config: { damping: 12 } });
                const coreProgress = (0, remotion_1.spring)({ frame: frame - 18, fps, config: { damping: 14, stiffness: 90 } });
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: 18,
                        alignItems: "stretch",
                        justifyContent: "center",
                        width: "100%",
                        maxWidth: 760,
                        position: "relative",
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 160,
                                height: 2,
                                borderRadius: 999,
                                background: "linear-gradient(90deg, rgba(255,107,157,0.28) 0%, rgba(255,255,255,0.92) 48%, rgba(0,212,170,0.28) 100%)",
                                transform: `translate(-50%, -50%) scaleX(${(0, remotion_1.interpolate)(coreProgress, [0, 1], [0.4, 1])})`,
                                opacity: (0, remotion_1.interpolate)(coreProgress, [0, 1], [0, 1]),
                                boxShadow: "0 0 20px rgba(255,255,255,0.5)",
                            } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                flex: 1,
                                position: "relative",
                                overflow: "hidden",
                                background: "linear-gradient(155deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.42) 54%, rgba(255,107,157,0.18) 100%)",
                                backdropFilter: "blur(24px) saturate(180%)",
                                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                                borderRadius: 30,
                                border: "1px solid rgba(255,255,255,0.82)",
                                padding: "28px 24px 30px",
                                minHeight: 204,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                textAlign: "left",
                                opacity: leftProgress,
                                transform: `translateX(${(0, remotion_1.interpolate)(leftProgress, [0, 1], [-48, 0])}px) rotate(${(0, remotion_1.interpolate)(leftProgress, [0, 1], [-3, -1])}deg)`,
                                boxShadow: `
                  0 24px 44px rgba(255,107,157,0.16),
                  0 8px 18px rgba(255,255,255,0.32),
                  inset 0 1px 0 rgba(255,255,255,0.95),
                  inset 0 -1px 0 rgba(255,107,157,0.12)
                `,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        inset: 0,
                                        background: "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at 86% 100%, rgba(255,107,157,0.18) 0%, rgba(255,107,157,0) 48%)",
                                        pointerEvents: "none",
                                    } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: "relative", zIndex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "8px 14px",
                                                borderRadius: 999,
                                                background: "rgba(255,255,255,0.62)",
                                                border: "1px solid rgba(255,255,255,0.9)",
                                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.96)",
                                                marginBottom: 22,
                                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { width: 10, height: 10, borderRadius: "50%", background: colors.blob1, boxShadow: `0 0 14px ${colors.blob1}80` } }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 15, color: colors.blob1, fontWeight: 700, letterSpacing: "0.02em" }, children: ((_a = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _a === void 0 ? void 0 : _a.label) || "Before" })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 700, color: colors.text, marginBottom: 10, letterSpacing: "-0.04em" }, children: ((_b = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _b === void 0 ? void 0 : _b.value) || "-" }), ((_c = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _c === void 0 ? void 0 : _c.desc) && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: colors.textSecondary, lineHeight: 1.5, maxWidth: 220 }, children: compareData.left.desc }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "relative",
                                        zIndex: 1,
                                        marginTop: 24,
                                        paddingTop: 18,
                                        borderTop: "1px solid rgba(255,107,157,0.14)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "rgba(255,107,157,0.8)",
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                    }, children: ((_d = compareData === null || compareData === void 0 ? void 0 : compareData.left) === null || _d === void 0 ? void 0 : _d.label) || "Old Rhythm" })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                width: 94,
                                minWidth: 94,
                                alignSelf: "center",
                                height: 94,
                                borderRadius: "50% 50% 44% 44%",
                                background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.72) 100%)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: 22,
                                fontWeight: 700,
                                color: colors.text,
                                flexShrink: 0,
                                transform: `scale(${(0, remotion_1.interpolate)(coreProgress, [0, 1], [0.7, 1])})`,
                                opacity: coreProgress,
                                border: "1px solid rgba(255,255,255,0.95)",
                                boxShadow: `
                  0 18px 34px rgba(145, 87, 255, 0.16),
                  inset 0 1px 0 rgba(255,255,255,0.96),
                  inset 0 -10px 20px rgba(145, 87, 255, 0.08)
                `,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 12,
                                        letterSpacing: "0.18em",
                                        color: colors.muted,
                                        marginBottom: 4,
                                    }, children: (compareData === null || compareData === void 0 ? void 0 : compareData.vsLabel) || "FLOW" }), (0, jsx_runtime_1.jsx)("div", { children: (compareData === null || compareData === void 0 ? void 0 : compareData.vsText) || "VS" })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                flex: 1,
                                position: "relative",
                                overflow: "hidden",
                                background: "linear-gradient(205deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.46) 52%, rgba(0,212,170,0.18) 100%)",
                                backdropFilter: "blur(24px) saturate(180%)",
                                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                                borderRadius: 30,
                                border: "1px solid rgba(255,255,255,0.82)",
                                padding: "28px 24px 30px",
                                minHeight: 204,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                textAlign: "left",
                                opacity: rightProgress,
                                transform: `translateX(${(0, remotion_1.interpolate)(rightProgress, [0, 1], [48, 0])}px) rotate(${(0, remotion_1.interpolate)(rightProgress, [0, 1], [3, 1])}deg)`,
                                boxShadow: `
                  0 24px 44px rgba(0,212,170,0.16),
                  0 8px 18px rgba(255,255,255,0.32),
                  inset 0 1px 0 rgba(255,255,255,0.95),
                  inset 0 -1px 0 rgba(0,212,170,0.12)
                `,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        inset: 0,
                                        background: "radial-gradient(circle at 82% 16%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 18% 100%, rgba(0,212,170,0.18) 0%, rgba(0,212,170,0) 48%)",
                                        pointerEvents: "none",
                                    } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: "relative", zIndex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "8px 14px",
                                                borderRadius: 999,
                                                background: "rgba(255,255,255,0.66)",
                                                border: "1px solid rgba(255,255,255,0.92)",
                                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.98)",
                                                marginBottom: 22,
                                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { width: 10, height: 10, borderRadius: "50%", background: colors.blob3, boxShadow: `0 0 14px ${colors.blob3}80` } }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 15, color: colors.blob3, fontWeight: 700, letterSpacing: "0.02em" }, children: ((_e = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _e === void 0 ? void 0 : _e.label) || "After" })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 700, color: colors.text, marginBottom: 10, letterSpacing: "-0.04em" }, children: ((_f = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _f === void 0 ? void 0 : _f.value) || "+" }), ((_g = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _g === void 0 ? void 0 : _g.desc) && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: colors.textSecondary, lineHeight: 1.5, maxWidth: 220 }, children: compareData.right.desc }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "relative",
                                        zIndex: 1,
                                        marginTop: 24,
                                        paddingTop: 18,
                                        borderTop: "1px solid rgba(0,212,170,0.16)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "rgba(0,212,170,0.88)",
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                    }, children: ((_h = compareData === null || compareData === void 0 ? void 0 : compareData.right) === null || _h === void 0 ? void 0 : _h.label) || "New Focus" })] })] }));
            }
            // ===== 步骤 =====
            case 'steps': {
                const steps = (data === null || data === void 0 ? void 0 : data.steps) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 650 }, children: steps.map((step, i) => {
                        const stepProgress = (0, remotion_1.spring)({
                            frame: frame - 10 - i * 10,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const stepColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
                        return ((0, jsx_runtime_1.jsx)(StepCard, { title: step.title, description: step.description, index: i, color: stepColor, progress: stepProgress }, i));
                    }) }));
            }
            // ===== 图表 =====
            case 'chart': {
                const bars = (data === null || data === void 0 ? void 0 : data.bars) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 650 }, children: bars.map((bar, i) => {
                        const barColor = bar.color || [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
                        return ((0, jsx_runtime_1.jsx)(ProgressBar, { percent: bar.value, label: bar.label, color: barColor, delay: 10 + i * 8 }, i));
                    }) }));
            }
            // ===== 列表 =====
            case 'list': {
                const items = (data === null || data === void 0 ? void 0 : data.items) || [];
                const blobColors = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 650 }, children: items.map((item, i) => {
                        const itemProgress = (0, remotion_1.spring)({
                            frame: frame - 8 - i * 8,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const itemColor = blobColors[i % blobColors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                gap: 18,
                                alignItems: "center",
                                background: "rgba(255,255,255,0.62)",
                                backdropFilter: "blur(20px)",
                                borderRadius: 20,
                                padding: "20px 24px",
                                border: "1px solid rgba(255,255,255,0.85)",
                                boxShadow: `0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px ${itemColor}18`,
                                opacity: itemProgress,
                                transform: `translateY(${(0, remotion_1.interpolate)(itemProgress, [0, 1], [24, 0])}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: `${itemColor}22`,
                                        border: `2px solid ${itemColor}55`,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: 24,
                                        flexShrink: 0,
                                    }, children: item.icon || "✦" }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, fontWeight: 600, color: colors.text, lineHeight: 1.2 }, children: item.text }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, color: colors.muted, marginTop: 4 }, children: item.desc }))] }), (0, jsx_runtime_1.jsx)("div", { style: { width: 10, height: 10, borderRadius: "50%", background: itemColor, flexShrink: 0 } })] }, i));
                    }) }));
            }
            // ===== 时间线 =====
            case 'timeline': {
                const timeline = (data === null || data === void 0 ? void 0 : data.timeline) || [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 700, position: "relative" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                position: "absolute",
                                left: "50%",
                                top: 16,
                                bottom: 16,
                                width: 2,
                                background: "rgba(0,0,0,0.08)",
                                transform: "translateX(-50%)",
                            } }), timeline.map((item, i) => {
                            const tlProgress = (0, remotion_1.spring)({
                                frame: frame - 10 - i * 12,
                                fps,
                                config: { damping: 12, stiffness: 100 },
                            });
                            const tlColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
                            return ((0, jsx_runtime_1.jsx)(TimelineItem, { year: item.year, title: item.title, description: item.description, color: tlColor, progress: tlProgress, isLeft: i % 2 === 0 }, i));
                        })] }));
            }
            // ===== 高亮 =====
            case 'highlight': {
                const items = (data === null || data === void 0 ? void 0 : data.items) || [];
                return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", width: "100%", maxWidth: 750 }, children: items.map((item, i) => {
                        const hlProgress = (0, remotion_1.spring)({
                            frame: frame - 6 - i * 5,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });
                        const hlColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
                        return ((0, jsx_runtime_1.jsx)("div", { style: {
                                background: `${hlColor}15`,
                                backdropFilter: "blur(15px)",
                                borderRadius: 18,
                                border: `2px solid ${hlColor}50`,
                                padding: "16px 30px",
                                opacity: hlProgress,
                                transform: `scale(${(0, remotion_1.interpolate)(hlProgress, [0, 1], [0.8, 1])})`,
                                boxShadow: `0 4px 20px ${hlColor}25`,
                            }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 24, fontWeight: 600, color: colors.text }, children: item }) }, i));
                    }) }));
            }
            // ===== 引用 =====
            case 'quote': {
                const quoteData = data;
                const quoteProgress = (0, remotion_1.spring)({ frame: frame - 10, fps, config: { damping: 15 } });
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        background: "rgba(255,255,255,0.55)",
                        backdropFilter: "blur(20px)",
                        borderRadius: 28,
                        border: "1px solid rgba(255,255,255,0.8)",
                        padding: "44px 50px",
                        maxWidth: 750,
                        opacity: quoteProgress,
                        transform: `translateY(${(0, remotion_1.interpolate)(quoteProgress, [0, 1], [30, 0])}px)`,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 70, color: colors.blob2, marginBottom: 8, lineHeight: 1 }, children: "\"" }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: 32, fontStyle: "italic", color: colors.text, margin: 0, lineHeight: 1.5 }, children: (quoteData === null || quoteData === void 0 ? void 0 : quoteData.quote) || title }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: 20, color: colors.muted, marginTop: 20, textAlign: "right" }, children: ["\u2014 ", (quoteData === null || quoteData === void 0 ? void 0 : quoteData.author) || subtitle] })] }));
            }
            // ===== Hero =====
            case 'hero': {
                const heroData = data;
                const pulseScale = 1 + Math.sin(frame * 0.08) * 0.02;
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center" }, children: [(heroData === null || heroData === void 0 ? void 0 : heroData.badge) && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-block",
                                padding: "10px 24px",
                                background: `${colors.blob2}15`,
                                backdropFilter: "blur(10px)",
                                borderRadius: 18,
                                border: `1px solid ${colors.blob2}40`,
                                fontSize: 18,
                                fontWeight: 600,
                                color: colors.blob2,
                                marginBottom: 20,
                                opacity: titleProgress,
                            }, children: heroData.badge })), (0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 70,
                                fontWeight: 700,
                                color: colors.text,
                                margin: 0,
                                marginBottom: 20,
                                letterSpacing: "-2px",
                                lineHeight: 1.1,
                            }, children: title }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 30, color: colors.muted, margin: 0, marginBottom: 40 }, children: subtitle })), (heroData === null || heroData === void 0 ? void 0 : heroData.cta) && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-block",
                                padding: "20px 48px",
                                background: `linear-gradient(135deg, ${colors.blob1}, ${colors.blob2})`,
                                borderRadius: 32,
                                fontSize: 26,
                                fontWeight: 600,
                                color: "white",
                                transform: `scale(${pulseScale})`,
                                boxShadow: `0 10px 40px ${colors.blob1}40`,
                            }, children: heroData.cta }))] }));
            }
            // ===== CTA (行动收束页) =====
            case 'cta': {
                const ctaData = data;
                const ctaText = (ctaData === null || ctaData === void 0 ? void 0 : ctaData.cta) || (ctaData === null || ctaData === void 0 ? void 0 : ctaData.button) || '点赞收藏';
                const tags = Array.isArray(ctaData === null || ctaData === void 0 ? void 0 : ctaData.items) ? ctaData.items : [];
                const pulseScale = 1 + Math.sin(frame * 0.12) * 0.04;
                const titleA = (0, remotion_1.spring)({ frame: frame - 6, fps, config: { damping: 14 } });
                const ctaA = (0, remotion_1.spring)({ frame: frame - 24, fps, config: { damping: 12, stiffness: 110 } });
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', maxWidth: 820 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                display: 'inline-block',
                                padding: '10px 22px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(14px)',
                                border: `1px solid ${colors.blob2}45`,
                                fontSize: 18,
                                fontWeight: 700,
                                color: colors.blob2,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                marginBottom: 26,
                                boxShadow: '0 14px 30px rgba(180,200,230,0.18)',
                                opacity: titleA,
                            }, children: (_j = ctaData === null || ctaData === void 0 ? void 0 : ctaData.badge) !== null && _j !== void 0 ? _j : '◆ FIN' }), (0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 64,
                                fontWeight: 800,
                                color: colors.text,
                                margin: 0,
                                marginBottom: 18,
                                lineHeight: 1.12,
                                letterSpacing: '-1.2px',
                                opacity: titleA,
                                transform: `translateY(${(0, remotion_1.interpolate)(titleA, [0, 1], [22, 0])}px)`,
                            }, children: title }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: {
                                fontSize: 26,
                                color: colors.muted,
                                margin: '0 0 36px',
                                opacity: titleA,
                            }, children: subtitle })), (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '24px 52px',
                                background: `linear-gradient(135deg, ${colors.blob1}, ${colors.blob2})`,
                                borderRadius: 999,
                                fontSize: 30,
                                fontWeight: 700,
                                color: 'white',
                                boxShadow: `0 22px 60px ${colors.blob1}55, inset 0 1px 0 rgba(255,255,255,0.45)`,
                                transform: `scale(${pulseScale * (0, remotion_1.interpolate)(ctaA, [0, 1], [0.85, 1])})`,
                                opacity: ctaA,
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 26 }, children: "\u2192" }), ctaText] }), tags.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                marginTop: 30,
                                display: 'flex',
                                gap: 12,
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                opacity: ctaA,
                            }, children: tags.slice(0, 4).map((t, i) => {
                                const tagColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4][i % 4];
                                return ((0, jsx_runtime_1.jsxs)("span", { style: {
                                        padding: '10px 18px',
                                        borderRadius: 999,
                                        background: 'rgba(255,255,255,0.65)',
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${tagColor}45`,
                                        fontSize: 17,
                                        fontWeight: 700,
                                        color: colors.text,
                                    }, children: ["#", t] }, i));
                            }) }))] }));
            }
            // ===== Default =====
            default:
                return points && points.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        width: "100%",
                    }, children: points.map((point, i) => {
                        const progress = pointProgresses[i] || 0;
                        const pointColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5, colors.blob6][i % 6];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 18,
                                padding: "20px 24px",
                                background: "rgba(255,255,255,0.5)",
                                backdropFilter: "blur(10px)",
                                borderRadius: 22,
                                border: "1px solid rgba(255,255,255,0.7)",
                                boxShadow: `0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.8)`,
                                transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-30, 0])}px)`,
                                opacity: progress,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        width: 42,
                                        height: 42,
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: "white",
                                        boxShadow: `0 4px 14px ${pointColor}40`,
                                        flexShrink: 0,
                                    }, children: i + 1 }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 26, color: colors.text, fontWeight: 500 }, children: point })] }, i));
                    }) })) : null;
        }
    };
    // 计算卡片尺寸
    const getCardSize = () => {
        if (type === 'hero')
            return { width: 900, padding: "60px 50px" };
        if (type === 'stats')
            return { width: 920, padding: "55px 45px" };
        if (type === 'compare')
            return { width: 880, padding: "50px 40px" };
        if (type === 'quote')
            return { width: 800, padding: "50px 45px" };
        return { width: 880, padding: "60px 50px" };
    };
    const cardSize = getCardSize();
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: colors.bg,
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
            overflow: "hidden",
        }, children: [(0, jsx_runtime_1.jsx)(GradientBackground, { frame: frame }), (0, jsx_runtime_1.jsx)(MegaBlob, { frame: frame, x: -200, y: -100, size: 700, color: colors.blob1, speedX: 0.006, speedY: 0.005, phase: 0 }), (0, jsx_runtime_1.jsx)(MegaBlob, { frame: frame, x: 600, y: 0, size: 800, color: colors.blob2, speedX: 0.005, speedY: 0.006, phase: 2 }), (0, jsx_runtime_1.jsx)(MegaBlob, { frame: frame, x: 100, y: 600, size: 750, color: colors.blob3, speedX: 0.007, speedY: 0.005, phase: 4 }), (0, jsx_runtime_1.jsx)(MegaBlob, { frame: frame, x: 550, y: 900, size: 650, color: colors.blob4, speedX: 0.0055, speedY: 0.0065, phase: 1 }), (0, jsx_runtime_1.jsx)(MegaBlob, { frame: frame, x: -150, y: 1200, size: 600, color: colors.blob5, speedX: 0.0065, speedY: 0.0055, phase: 3 }), (0, jsx_runtime_1.jsx)(MegaBlob, { frame: frame, x: 650, y: 1300, size: 700, color: colors.blob6, speedX: 0.005, speedY: 0.007, phase: 5 }), (0, jsx_runtime_1.jsx)(FloatingSphere, { frame: frame, x: 80, y: 280, size: 28, color: colors.blob2, delay: 8 }), (0, jsx_runtime_1.jsx)(FloatingSphere, { frame: frame, x: 920, y: 380, size: 22, color: colors.blob3, delay: 12 }), (0, jsx_runtime_1.jsx)(FloatingSphere, { frame: frame, x: 100, y: 750, size: 24, color: colors.blob1, delay: 10 }), (0, jsx_runtime_1.jsx)(FloatingSphere, { frame: frame, x: 890, y: 850, size: 26, color: colors.blob5, delay: 15 }), (0, jsx_runtime_1.jsx)(FloatingSphere, { frame: frame, x: 70, y: 1300, size: 20, color: colors.blob4, delay: 18 }), (0, jsx_runtime_1.jsx)(FloatingSphere, { frame: frame, x: 940, y: 1400, size: 24, color: colors.blob6, delay: 6 }), (0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
                    opacity: exitOpacity,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "50px",
                    zIndex: 10,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            top: 50,
                            left: 50,
                            right: 50,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.55)",
                                backdropFilter: "blur(20px)",
                                borderRadius: 18,
                                border: "1px solid rgba(255,255,255,0.75)",
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 18, fontWeight: 600, color: colors.text }, children: index + 1 }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 18, color: colors.muted }, children: "/" }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 18, color: colors.muted }, children: totalSlides })] }) }), (0, jsx_runtime_1.jsx)(LiquidGlassCard, { frame: frame, delay: 8, width: cardSize.width, padding: cardSize.padding, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "relative",
                                zIndex: 2,
                            }, children: [type !== 'hero' && type !== 'quote' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                                fontSize: type === 'stats' || type === 'compare' ? 48 : 56,
                                                fontWeight: 700,
                                                color: colors.text,
                                                margin: 0,
                                                marginBottom: 10,
                                                transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [20, 0])}px)`,
                                                opacity: titleProgress,
                                                letterSpacing: "-1px",
                                                textAlign: "center",
                                            }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                width: (0, remotion_1.interpolate)(titleProgress, [0, 1], [0, 80]),
                                                height: 5,
                                                borderRadius: 3,
                                                background: `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2}, ${colors.blob3}, ${colors.blob4})`,
                                                marginBottom: subtitle ? 12 : 28,
                                                boxShadow: `0 2px 10px ${colors.blob2}40`,
                                            } }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: {
                                                fontSize: 26,
                                                color: colors.muted,
                                                margin: 0,
                                                marginBottom: 32,
                                                transform: `translateY(${(0, remotion_1.interpolate)(subtitleProgress, [0, 1], [14, 0])}px)`,
                                                opacity: subtitleProgress,
                                                fontWeight: 400,
                                            }, children: subtitle }))] })), renderContent()] }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            bottom: 50,
                            display: "flex",
                            gap: 8,
                        }, children: [...Array(totalSlides)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                                width: i === index ? 32 : 10,
                                height: 10,
                                borderRadius: 5,
                                background: i === index
                                    ? `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2})`
                                    : "rgba(0,0,0,0.1)",
                                boxShadow: i === index ? `0 2px 8px ${colors.blob1}40` : "none",
                            } }, i))) })] })] }));
};
exports.LiquidSlide = LiquidSlide;
