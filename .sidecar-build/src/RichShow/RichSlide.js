"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
// 流体渐变配色
const colors = {
    bg: "#0f0f1a",
    card: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(255,255,255,0.12)",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.6)",
    accent1: "#6366f1",
    accent2: "#a855f7",
    accent3: "#22d3ee",
    accent4: "#f43f5e",
    gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    gradient2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    gradient3: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    gradient4: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
};
// 卡片基础样式
const cardStyle = {
    background: colors.card,
    borderRadius: 20,
    border: `1px solid ${colors.cardBorder}`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
};
// ===== Bento 卡片组件 =====
const BentoCard = ({ children, style, delay = 0, gradient }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 15, stiffness: 100 },
    });
    const scale = (0, remotion_1.interpolate)(progress, [0, 1], [0.9, 1]);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            ...cardStyle,
            transform: `scale(${scale})`,
            opacity: progress,
            background: gradient || colors.card,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            ...style,
        }, children: children }));
};
// ===== 数字动画 =====
const AnimatedNumber = ({ value, suffix = "", startFrame, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - startFrame,
        fps,
        config: { damping: 20, stiffness: 50 },
    });
    const displayValue = Math.round((0, remotion_1.interpolate)(progress, [0, 1], [0, value]));
    return ((0, jsx_runtime_1.jsxs)("span", { style: { fontVariantNumeric: "tabular-nums" }, children: [displayValue.toLocaleString(), suffix] }));
};
// ===== 打字机效果 =====
const Typewriter = ({ text, startFrame }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const chars = text.split("");
    const visibleChars = Math.floor((0, remotion_1.interpolate)(frame, [startFrame, startFrame + text.length * 2], [0, text.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    }));
    return ((0, jsx_runtime_1.jsxs)("span", { children: [chars.slice(0, visibleChars).join(""), visibleChars < text.length && ((0, jsx_runtime_1.jsx)("span", { style: { opacity: frame % 10 < 5 ? 1 : 0, color: colors.accent1 }, children: "|" }))] }));
};
// ===== 进度环 =====
const ProgressRing = ({ percent, color, label, delay, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 15 },
    });
    const currentPercent = (0, remotion_1.interpolate)(progress, [0, 1], [0, percent]);
    const circumference = 2 * Math.PI * 50;
    const strokeDashoffset = circumference - (currentPercent / 100) * circumference;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { position: "relative", width: 130, height: 130 }, children: [(0, jsx_runtime_1.jsxs)("svg", { width: 130, height: 130, style: { transform: "rotate(-90deg)" }, children: [(0, jsx_runtime_1.jsx)("circle", { cx: 65, cy: 65, r: 50, fill: "none", stroke: "rgba(255,255,255,0.15)", strokeWidth: 10 }), (0, jsx_runtime_1.jsx)("circle", { cx: 65, cy: 65, r: 50, fill: "none", stroke: color, strokeWidth: 10, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: strokeDashoffset })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 32,
                            fontWeight: 700,
                            color: colors.text,
                        }, children: [Math.round(currentPercent), "%"] })] }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 24, color: colors.muted }, children: label })] }));
};
// ===== 主组件 =====
const RichSlide = ({ type, data = {}, index, totalSlides, durationInFrames }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const itemCount = Array.isArray(data.items)
        ? data.items.length
        : Array.isArray(data.stats)
            ? data.stats.length
            : Array.isArray(data.bars)
                ? data.bars.length
                : 0;
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, itemCount);
    // 淡出
    const exitOpacity = (0, remotion_1.interpolate)(frame, [timing.exitStart, timing.exitEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // 渲染不同类型
    const renderContent = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        switch (type) {
            // ===== 标题页 =====
            case "title":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center", maxWidth: 900 }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 84,
                                fontWeight: 900,
                                color: colors.text,
                                margin: 0,
                                marginBottom: 32,
                                textShadow: `0 0 60px ${colors.accent1}40`,
                                letterSpacing: "-2px",
                                lineHeight: 1.06,
                            }, children: String((_a = data.title) !== null && _a !== void 0 ? _a : "") }), typeof data.subtitle === 'string' && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 42, color: colors.muted, margin: 0 }, children: (0, jsx_runtime_1.jsx)(Typewriter, { text: data.subtitle, startFrame: 20 }) }))] }));
            // ===== 数据统计页 =====
            case "stats":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 42px 0", textAlign: "left" }, children: String((_b = data.title) !== null && _b !== void 0 ? _b : "") }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }, children: Array.isArray(data.stats) && data.stats.map((stat, i) => {
                                const gradients = [colors.gradient1, colors.gradient2, colors.gradient3, colors.gradient4];
                                return ((0, jsx_runtime_1.jsxs)(BentoCard, { delay: 10 + i * 8, gradient: gradients[i % gradients.length], style: { width: 300, alignItems: "center", padding: 40 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 80, fontWeight: 900, color: "#fff", marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)(AnimatedNumber, { value: stat.value, suffix: stat.suffix, startFrame: 15 + i * 8 }) }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: "rgba(255,255,255,0.9)" }, children: stat.label })] }, i));
                            }) })] }));
            // ===== 高亮展示页 =====
            case "highlight":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }, children: String((_c = data.title) !== null && _c !== void 0 ? _c : "") }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }, children: Array.isArray(data.items) && data.items.map((item, i) => {
                                const accents = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                                return ((0, jsx_runtime_1.jsx)(BentoCard, { delay: 10 + i * 8, style: {
                                        background: `${accents[i % accents.length]}20`,
                                        border: `2px solid ${accents[i % accents.length]}`,
                                        padding: "28px 44px",
                                    }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 36, fontWeight: 700, color: "#fff" }, children: item }) }, i));
                            }) })] }));
            // ===== 进度环页 =====
            case "progress":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }, children: String((_d = data.title) !== null && _d !== void 0 ? _d : "") }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 30, justifyContent: "center", flexWrap: "wrap" }, children: Array.isArray(data.bars) && data.bars.map((bar, i) => {
                                const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                                return ((0, jsx_runtime_1.jsx)(BentoCard, { delay: 10 + i * 10, style: { alignItems: "center", padding: 32 }, children: (0, jsx_runtime_1.jsx)(ProgressRing, { percent: bar.percent, color: accentColors[i % accentColors.length], label: bar.label, delay: 15 + i * 10 }) }, i));
                            }) })] }));
            // ===== 引用页 =====
            case "quote":
                return ((0, jsx_runtime_1.jsxs)(BentoCard, { delay: 5, gradient: colors.gradient2, style: { maxWidth: 850, padding: 60 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 80, color: "rgba(255,255,255,0.3)", marginBottom: 20 }, children: "\"" }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: 40, fontStyle: "italic", color: "#fff", margin: 0, lineHeight: 1.6 }, children: String((_e = data.quote) !== null && _e !== void 0 ? _e : "") }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: 26, color: "rgba(255,255,255,0.8)", marginTop: 30, textAlign: "right" }, children: ["\u2014 ", String((_f = data.author) !== null && _f !== void 0 ? _f : "")] })] }));
            // ===== 对比页 =====
            case "compare":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 40px 0", textAlign: "left" }, children: String((_g = data.title) !== null && _g !== void 0 ? _g : "") }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: 30, alignItems: "center", justifyContent: "center" }, children: [(0, jsx_runtime_1.jsxs)(BentoCard, { delay: 5, style: { background: "rgba(244,63,94,0.15)", border: "2px solid rgba(244,63,94,0.4)", width: 350, alignItems: "center", padding: 40 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: colors.accent4, marginBottom: 12 }, children: String((_j = (_h = data.left) === null || _h === void 0 ? void 0 : _h.label) !== null && _j !== void 0 ? _j : "") }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 42, fontWeight: 800, color: "#fff" }, children: String((_l = (_k = data.left) === null || _k === void 0 ? void 0 : _k.value) !== null && _l !== void 0 ? _l : "") })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: "#fff",
                                    }, children: "VS" }), (0, jsx_runtime_1.jsxs)(BentoCard, { delay: 15, style: { background: "rgba(34,211,238,0.15)", border: "2px solid rgba(34,211,238,0.4)", width: 350, alignItems: "center", padding: 40 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: colors.accent3, marginBottom: 12 }, children: String((_o = (_m = data.right) === null || _m === void 0 ? void 0 : _m.label) !== null && _o !== void 0 ? _o : "") }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 42, fontWeight: 800, color: "#fff" }, children: String((_q = (_p = data.right) === null || _p === void 0 ? void 0 : _p.value) !== null && _q !== void 0 ? _q : "") })] })] })] }));
            // ===== 列表页 =====
            case "list":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }, children: String((_r = data.title) !== null && _r !== void 0 ? _r : "") }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }, children: Array.isArray(data.items) && data.items.map((item, i) => {
                                const gradients = [colors.gradient1, colors.gradient2, colors.gradient3, colors.gradient4];
                                return ((0, jsx_runtime_1.jsxs)(BentoCard, { delay: 10 + i * 10, gradient: gradients[i % gradients.length], style: { width: 320, alignItems: "center", padding: 36 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 56, marginBottom: 16 }, children: item.icon || "✓" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 32, fontWeight: 700, color: "#fff" }, children: item.text }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.8)", marginTop: 10 }, children: item.desc }))] }, i));
                            }) })] }));
            // ===== 步骤页 =====
            case "steps": {
                const steps = data.steps || [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }, children: String((_s = data.title) !== null && _s !== void 0 ? _s : "") }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 18 }, children: steps.map((step, i) => {
                                const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                                const accent = accentColors[i % accentColors.length];
                                const gradients = [colors.gradient1, colors.gradient2, colors.gradient3, colors.gradient4];
                                const itemProgress = (() => {
                                    const frame = i;
                                    void frame;
                                    return 1;
                                })();
                                void itemProgress;
                                return ((0, jsx_runtime_1.jsxs)(BentoCard, { delay: 10 + i * 10, style: {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 28,
                                        padding: "28px 36px",
                                        background: `linear-gradient(135deg, ${accent}18 0%, rgba(255,255,255,0.04) 100%)`,
                                        border: `1px solid ${accent}50`,
                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                minWidth: 72,
                                                height: 72,
                                                borderRadius: "50%",
                                                background: gradients[i % gradients.length],
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 30,
                                                fontWeight: 900,
                                                color: "#fff",
                                                flexShrink: 0,
                                                boxShadow: `0 4px 20px ${accent}50`,
                                            }, children: String(i + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, fontWeight: 800, color: colors.text, lineHeight: 1.2 }, children: step.title }), step.description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: colors.muted, marginTop: 8, lineHeight: 1.5 }, children: step.description }))] })] }, i));
                            }) })] }));
            }
            // ===== 时间线页 =====
            case "timeline": {
                const timeline = data.timeline || [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "92%" }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }, children: String((_t = data.title) !== null && _t !== void 0 ? _t : "") }), (0, jsx_runtime_1.jsxs)("div", { style: { position: "relative", paddingLeft: 32 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        left: 0,
                                        top: 16,
                                        bottom: 16,
                                        width: 2,
                                        background: `linear-gradient(180deg, ${colors.accent1} 0%, ${colors.accent2} 50%, ${colors.accent3} 100%)`,
                                        borderRadius: 2,
                                    } }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: timeline.map((item, i) => {
                                        const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                                        const accent = accentColors[i % accentColors.length];
                                        return ((0, jsx_runtime_1.jsxs)("div", { style: { position: "relative" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        position: "absolute",
                                                        left: -39,
                                                        top: 20,
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: "50%",
                                                        background: accent,
                                                        boxShadow: `0 0 12px ${accent}`,
                                                    } }), (0, jsx_runtime_1.jsxs)(BentoCard, { delay: 10 + i * 10, style: {
                                                        padding: "22px 28px",
                                                        background: `linear-gradient(135deg, ${accent}12 0%, rgba(255,255,255,0.04) 100%)`,
                                                        border: `1px solid ${accent}40`,
                                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                display: "inline-flex",
                                                                padding: "6px 18px",
                                                                borderRadius: 999,
                                                                background: `${accent}25`,
                                                                border: `1px solid ${accent}50`,
                                                                fontSize: 20,
                                                                fontWeight: 800,
                                                                color: accent,
                                                                marginBottom: 12,
                                                            }, children: item.year }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: colors.text, lineHeight: 1.2 }, children: item.title }), item.description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 21, color: colors.muted, marginTop: 8, lineHeight: 1.5 }, children: item.description }))] })] }, i));
                                    }) })] })] }));
            }
            // ===== Hero 页 =====
            case "hero": {
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center", maxWidth: 900 }, children: [typeof data.badge === 'string' && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-flex",
                                padding: "10px 28px",
                                borderRadius: 999,
                                background: `linear-gradient(135deg, ${colors.accent1}40, ${colors.accent2}40)`,
                                border: `1px solid ${colors.accent1}60`,
                                fontSize: 24,
                                fontWeight: 700,
                                color: colors.accent3,
                                marginBottom: 36,
                                letterSpacing: "0.06em",
                                boxShadow: `0 0 30px ${colors.accent1}30`,
                            }, children: data.badge })), (0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 90,
                                fontWeight: 900,
                                color: colors.text,
                                margin: 0,
                                marginBottom: 32,
                                background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.accent3} 60%, ${colors.accent2} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                letterSpacing: "-2px",
                                lineHeight: 1.04,
                            }, children: String((_u = data.title) !== null && _u !== void 0 ? _u : "") }), typeof data.subtitle === 'string' && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 40, color: colors.muted, margin: 0, lineHeight: 1.5 }, children: data.subtitle }))] }));
            }
            // ===== CTA 页 =====
            case "cta": {
                const pulseScale = 1 + Math.sin(frame * 0.08) * 0.02;
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center" }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 72,
                                fontWeight: 900,
                                color: colors.text,
                                margin: 0,
                                marginBottom: 20,
                                textShadow: `0 0 60px ${colors.accent1}40`,
                            }, children: String((_v = data.title) !== null && _v !== void 0 ? _v : "") }), typeof data.subtitle === 'string' && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 34, color: colors.muted, marginBottom: 50 }, children: data.subtitle })), typeof data.button === 'string' && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-block",
                                padding: "28px 60px",
                                background: colors.gradient1,
                                borderRadius: 60,
                                fontSize: 36,
                                fontWeight: 800,
                                color: "#fff",
                                transform: `scale(${pulseScale})`,
                                boxShadow: `0 10px 50px ${colors.accent1}50`,
                            }, children: String(data.button) }))] }));
            }
            default:
                return null;
        }
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
            overflow: "hidden",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    width: 1000,
                    height: 1000,
                    top: "20%",
                    left: "20%",
                    background: `radial-gradient(ellipse, ${colors.accent1}25 0%, transparent 60%)`,
                    filter: "blur(80px)",
                    transform: `translate(${Math.sin(frame * 0.02) * 40}px, ${Math.cos(frame * 0.015) * 30}px)`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    width: 800,
                    height: 800,
                    top: "30%",
                    right: "10%",
                    background: `radial-gradient(ellipse, ${colors.accent2}20 0%, transparent 60%)`,
                    filter: "blur(80px)",
                    transform: `translate(${Math.cos(frame * 0.018) * 35}px, ${Math.sin(frame * 0.02) * 40}px)`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    width: 600,
                    height: 600,
                    bottom: "10%",
                    left: "30%",
                    background: `radial-gradient(ellipse, ${colors.accent3}15 0%, transparent 60%)`,
                    filter: "blur(70px)",
                    transform: `translate(${Math.sin(frame * 0.015) * 50}px, ${Math.cos(frame * 0.02) * 35}px)`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    bottom: 40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 8,
                }, children: [...Array(totalSlides)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                        width: i === index ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: i === index ? "#fff" : "rgba(255,255,255,0.3)",
                        boxShadow: i === index ? "0 0 15px rgba(255,255,255,0.5)" : "none",
                    } }, i))) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    opacity: exitOpacity,
                    width: "90%",
                    maxWidth: 920,
                    minHeight: 1280,
                    padding: "34px 34px 40px",
                    borderRadius: 32,
                    background: "linear-gradient(180deg, rgba(10, 10, 20, 0.48), rgba(18, 20, 38, 0.32))",
                    border: `1px solid ${colors.cardBorder}`,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            marginBottom: 26,
                        }, children: (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 20, color: "rgba(255,255,255,0.64)", fontWeight: 600 }, children: [String(index + 1).padStart(2, "0"), " / ", String(totalSlides).padStart(2, "0")] }) }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, display: "flex", alignItems: "center" }, children: renderContent() })] })] }));
};
exports.RichSlide = RichSlide;
