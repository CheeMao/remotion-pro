"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// 动态幻灯片单页组件 - 科技风格
const remotion_1 = require("remotion");
const animationTiming_1 = require("../animationTiming");
const runtimeTiming_1 = require("../runtimeTiming");
const DynamicSlide = ({ title, subtitle, points, elementTimings, slideAudioStart, index, totalSlides, durationInFrames, }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, (_a = points === null || points === void 0 ? void 0 : points.length) !== null && _a !== void 0 ? _a : 0);
    // 科技感配色
    const colors = {
        primary: "#00f0ff",
        secondary: "#7c3aed",
        accent: "#06ffa5",
        pink: "#ff2e97",
    };
    // 背景动态光效
    const glowMove = Math.sin(frame * 0.02) * 50;
    // 动态调整动画时间（根据总时长）
    // 标题入场
    const titleProgress = (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings,
        slideAudioStart,
        id: "title",
        fallbackStart: timing.titleStart,
        damping: 12,
        stiffness: 120,
    });
    const titleY = (0, remotion_1.interpolate)(titleProgress, [0, 1], [80, 0]);
    const titleScale = (0, remotion_1.interpolate)(titleProgress, [0, 1], [0.9, 1]);
    // 副标题入场
    const subtitleProgress = (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings,
        slideAudioStart,
        id: "subtitle",
        fallbackStart: timing.subtitleStart,
        damping: 15,
        stiffness: 100,
    });
    const subtitleY = (0, remotion_1.interpolate)(subtitleProgress, [0, 1], [50, 0]);
    // 分隔线动画
    const lineProgress = (0, remotion_1.spring)({
        frame: frame - timing.lineStart,
        fps,
        config: { damping: 12 },
    });
    const lineWidth = (0, remotion_1.interpolate)(lineProgress, [0, 1], [0, 500]);
    // 要点逐个入场
    const pointProgresses = (points || []).map((_, i) => (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings,
        slideAudioStart,
        id: `point-${i}`,
        fallbackStart: timing.pointsStart + i * timing.pointStagger,
        damping: 10,
        stiffness: 100,
    }));
    // 淡出
    const exitOpacity = (0, remotion_1.interpolate)(frame, [timing.exitStart, timing.exitEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // 数字跳动效果
    const numberPulse = Math.sin(frame * 0.15) * 0.05 + 1;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #0d1b2a 100%)",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
            overflow: "hidden",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    top: "10%",
                    left: "50%",
                    transform: `translateX(-50%) translateX(${glowMove}px)`,
                    width: 900,
                    height: 900,
                    background: `radial-gradient(ellipse, ${colors.primary}20 0%, transparent 60%)`,
                    filter: "blur(60px)",
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    bottom: "0%",
                    right: "10%",
                    width: 600,
                    height: 600,
                    background: `radial-gradient(ellipse, ${colors.pink}15 0%, transparent 60%)`,
                    filter: "blur(80px)",
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(${colors.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}08 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                    opacity: 0.8,
                } }), (0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
                    opacity: exitOpacity,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "70px 60px",
                    zIndex: 10,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.pink}, ${colors.accent}, transparent)`,
                        } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            position: "absolute",
                            top: 50,
                            right: 60,
                            display: "flex",
                            alignItems: "baseline",
                            gap: 8,
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                    fontSize: 72,
                                    fontWeight: 900,
                                    color: colors.primary,
                                    textShadow: `0 0 40px ${colors.primary}80, 0 0 80px ${colors.primary}40`,
                                    transform: `scale(${numberPulse})`,
                                }, children: String(index + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("span", { style: {
                                    fontSize: 28,
                                    color: "rgba(255,255,255,0.4)",
                                    fontWeight: 400,
                                }, children: ["/ ", String(totalSlides).padStart(2, "0")] })] }), (0, jsx_runtime_1.jsx)("h1", { style: {
                            fontSize: 88,
                            fontWeight: 900,
                            color: "#ffffff",
                            textAlign: "center",
                            margin: 0,
                            marginBottom: 20,
                            transform: `translateY(${titleY}px) scale(${titleScale})`,
                            opacity: titleProgress,
                            textShadow: `
              0 0 60px ${colors.primary}60,
              0 0 120px ${colors.primary}30,
              0 4px 30px rgba(0,0,0,0.5)
            `,
                            letterSpacing: "-2px",
                            lineHeight: 1.15,
                        }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: {
                            width: lineWidth,
                            height: 3,
                            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.accent}, transparent)`,
                            borderRadius: 2,
                            marginBottom: 28,
                            boxShadow: `0 0 30px ${colors.primary}80`,
                        } }), subtitle && ((0, jsx_runtime_1.jsx)("p", { style: {
                            fontSize: 38,
                            color: "rgba(255,255,255,0.85)",
                            textAlign: "center",
                            margin: 0,
                            marginBottom: 70,
                            transform: `translateY(${subtitleY}px)`,
                            opacity: subtitleProgress,
                            fontWeight: 400,
                            maxWidth: "85%",
                            letterSpacing: "0.5px",
                        }, children: subtitle })), points && points.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 32,
                            maxWidth: "88%",
                        }, children: points.map((point, i) => {
                            const progress = pointProgresses[i] || 0;
                            const pointX = (0, remotion_1.interpolate)(progress, [0, 1], [-100, 0]);
                            const pointGlow = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.accent : colors.pink;
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 28,
                                    transform: `translateX(${pointX}px)`,
                                    opacity: progress,
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            minWidth: 64,
                                            height: 64,
                                            borderRadius: 12,
                                            background: `linear-gradient(135deg, ${pointGlow}25, ${pointGlow}10)`,
                                            border: `2px solid ${pointGlow}`,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: 28,
                                            fontWeight: 700,
                                            color: pointGlow,
                                            boxShadow: `0 0 30px ${pointGlow}50, inset 0 0 20px ${pointGlow}20`,
                                        }, children: i + 1 }), (0, jsx_runtime_1.jsx)("span", { style: {
                                            fontSize: 36,
                                            color: "#ffffff",
                                            fontWeight: 500,
                                            letterSpacing: "0.3px",
                                            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                                        }, children: point })] }, i));
                        }) })), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: `linear-gradient(90deg, transparent, ${colors.accent}, ${colors.primary}, ${colors.pink}, transparent)`,
                        } })] })] }));
};
exports.DynamicSlide = DynamicSlide;
