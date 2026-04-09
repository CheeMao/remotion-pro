"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
// 使用系统等宽/科技风字体，避免从 Google CDN 加载
const fontFamily = "'Courier New', 'Consolas', monospace";
// 科技感配色
const colors = {
    bg: "#050510",
    primary: "#00f0ff", // 青色霓虹
    secondary: "#00ff88", // 绿色
    accent: "#ff00aa", // 粉紫
    warning: "#ffaa00", // 橙黄
    text: "#ffffff",
    muted: "rgba(255,255,255,0.5)",
};
// ===== 扫描线效果 =====
const ScanLines = ({ frame }) => {
    const y = (frame * 8) % 1920;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 0,
                    top: y,
                    width: "100%",
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                    boxShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}`,
                    opacity: 0.42,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 0,
                    top: (y + 400) % 1920,
                    width: "100%",
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
                    opacity: 0.2,
                } })] }));
};
// ===== 数据流粒子 =====
const DataParticles = ({ frame }) => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
        const x = (i * 60 + frame * 2) % 1200;
        const y = (i * 100 + frame * 3) % 2000;
        const size = 2 + (i % 3);
        const color = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent;
        particles.push((0, jsx_runtime_1.jsx)("div", { style: {
                position: "absolute",
                left: x,
                top: y,
                width: size,
                height: size * 4,
                background: color,
                borderRadius: 2,
                opacity: 0.28,
                boxShadow: `0 0 10px ${color}`,
            } }, i));
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: particles });
};
// ===== 电路线条 =====
const CircuitLines = ({ frame }) => {
    const paths = [
        { x1: 0, y1: 200, x2: 300, y2: 200, delay: 0 },
        { x1: 300, y1: 200, x2: 300, y2: 400, delay: 10 },
        { x1: 300, y1: 400, x2: 600, y2: 400, delay: 20 },
        { x1: 780, y1: 100, x2: 780, y2: 500, delay: 5 },
        { x1: 780, y1: 500, x2: 1080, y2: 500, delay: 15 },
    ];
    return ((0, jsx_runtime_1.jsx)("svg", { style: { position: "absolute", width: "100%", height: "100%", opacity: 0.16 }, children: paths.map((p, i) => {
            const progress = Math.min(1, Math.max(0, (frame - p.delay * 3) / 30));
            const currentX2 = p.x1 + (p.x2 - p.x1) * progress;
            const currentY2 = p.y1 + (p.y2 - p.y1) * progress;
            return ((0, jsx_runtime_1.jsx)("line", { x1: p.x1, y1: p.y1, x2: currentX2, y2: currentY2, stroke: colors.primary, strokeWidth: 2, style: {
                    filter: `drop-shadow(0 0 5px ${colors.primary})`,
                } }, i));
        }) }));
};
// ===== 全息框 =====
const HoloFrame = ({ children, delay, frame, fps }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 15, stiffness: 80 },
    });
    const glitchOffset = frame % 30 < 3 ? Math.sin(frame * 0.5) * 3 : 0;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: "relative",
            transform: `translateX(${glitchOffset}px) scale(${(0, remotion_1.interpolate)(progress, [0, 1], [0.8, 1])})`,
            opacity: progress,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    top: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderTop: `3px solid ${colors.primary}`,
                    borderLeft: `3px solid ${colors.primary}`,
                    boxShadow: `0 0 15px ${colors.primary}80`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderTop: `3px solid ${colors.primary}`,
                    borderRight: `3px solid ${colors.primary}`,
                    boxShadow: `0 0 15px ${colors.primary}80`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    bottom: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderBottom: `3px solid ${colors.primary}`,
                    borderLeft: `3px solid ${colors.primary}`,
                    boxShadow: `0 0 15px ${colors.primary}80`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderBottom: `3px solid ${colors.primary}`,
                    borderRight: `3px solid ${colors.primary}`,
                    boxShadow: `0 0 15px ${colors.primary}80`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    padding: 50,
                    background: `linear-gradient(135deg, rgba(0,240,255,0.1), rgba(0,255,136,0.05))`,
                    border: `1px solid ${colors.primary}40`,
                }, children: children })] }));
};
// ===== 数字计数器 =====
const CyberCounter = ({ value, suffix = "", label, color, delay, frame, fps }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 12 },
    });
    const displayValue = Math.round((0, remotion_1.interpolate)(progress, [0, 1], [0, value]));
    const glitch = frame % 20 < 2;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            textAlign: "center",
            opacity: progress,
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [30, 0])}px)`,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    fontSize: 76,
                    fontWeight: 900,
                    color: glitch ? colors.accent : color,
                    textShadow: `0 0 30px ${color}, 0 0 60px ${color}50`,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "2px",
                }, children: [displayValue, suffix] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 26,
                    color: colors.muted,
                    marginTop: 8,
                    textTransform: "uppercase",
                    letterSpacing: "4px",
                }, children: label })] }));
};
// ===== 终端文字 =====
const TerminalText = ({ text, delay, frame }) => {
    const visibleChars = Math.floor((0, remotion_1.interpolate)(frame, [delay, delay + text.length * 1.5], [0, text.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    }));
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            fontFamily: "monospace",
            fontSize: 30,
            color: colors.secondary,
            textShadow: `0 0 10px ${colors.secondary}`,
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: colors.primary }, children: "> " }), text.slice(0, visibleChars), (0, jsx_runtime_1.jsx)("span", { style: {
                    opacity: frame % 10 < 5 ? 1 : 0,
                    color: colors.primary,
                }, children: "_" })] }));
};
// ===== 进度条 =====
const CyberProgress = ({ label, percent, color, delay, frame, fps }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps,
        config: { damping: 15 },
    });
    const width = (0, remotion_1.interpolate)(progress, [0, 1], [0, percent]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "100%", marginBottom: 24 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 24,
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: colors.text }, children: label }), (0, jsx_runtime_1.jsxs)("span", { style: { color, fontWeight: 700 }, children: [Math.round(width), "%"] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    height: 8,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    overflow: "hidden",
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        width: `${width}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${color}, ${color}80)`,
                        borderRadius: 4,
                        boxShadow: `0 0 20px ${color}`,
                    } }) })] }));
};
// ===== 主组件 =====
const TechSlide = ({ type, data = {}, index, totalSlides, durationInFrames }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
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
    // 页码
    const PageNum = () => ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: "absolute",
            top: 34,
            right: 34,
            fontFamily: "monospace",
            fontSize: 16,
            color: "rgba(255,255,255,0.28)",
        }, children: ["[", String(index + 1).padStart(2, "0"), "/", String(totalSlides).padStart(2, "0"), "]"] }));
    // 渲染内容
    const renderContent = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        switch (type) {
            // ===== 标题页 =====
            case "title": {
                const titleGlitch = frame % 40 < 3;
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center" }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 82,
                                fontWeight: 900,
                                color: titleGlitch ? colors.accent : colors.text,
                                margin: 0,
                                textShadow: titleGlitch
                                    ? `3px 0 ${colors.primary}, -3px 0 ${colors.accent}`
                                    : `0 0 40px ${colors.primary}60`,
                                letterSpacing: "2px",
                                lineHeight: 1.05,
                                transform: titleGlitch ? `translateX(${Math.sin(frame)}px)` : "none",
                            }, children: String((_a = data.title) !== null && _a !== void 0 ? _a : "") }), typeof data.subtitle === 'string' && ((0, jsx_runtime_1.jsx)("p", { style: {
                                fontSize: 30,
                                color: colors.muted,
                                marginTop: 24,
                                letterSpacing: "2px",
                            }, children: data.subtitle }))] }));
            }
            // ===== 数据页 =====
            case "stats":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "90%" }, children: [(0, jsx_runtime_1.jsx)(TerminalText, { text: String((_b = data.title) !== null && _b !== void 0 ? _b : "").toUpperCase(), delay: 0, frame: frame }), (0, jsx_runtime_1.jsx)("div", { style: {
                                display: "flex",
                                justifyContent: "space-around",
                                marginTop: 60,
                            }, children: Array.isArray(data.stats) && data.stats.map((stat, i) => {
                                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                                return ((0, jsx_runtime_1.jsx)(CyberCounter, { value: stat.value, suffix: stat.suffix, label: stat.label, color: colorSet[i % colorSet.length], delay: 15 + i * 10, frame: frame, fps: fps }, i));
                            }) })] }));
            // ===== 列表页 =====
            case "list":
                return ((0, jsx_runtime_1.jsx)(HoloFrame, { delay: 5, frame: frame, fps: fps, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 800 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    borderBottom: `1px solid ${colors.primary}40`,
                                    paddingBottom: 20,
                                    marginBottom: 30,
                                }, children: (0, jsx_runtime_1.jsx)(TerminalText, { text: String((_c = data.title) !== null && _c !== void 0 ? _c : "").toUpperCase(), delay: 0, frame: frame }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 20 }, children: Array.isArray(data.items) && data.items.map((item, i) => {
                                    const itemProgress = (0, remotion_1.spring)({
                                        frame: frame - 20 - i * 10,
                                        fps,
                                        config: { damping: 12 },
                                    });
                                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 20,
                                            opacity: itemProgress,
                                            transform: `translateX(${(0, remotion_1.interpolate)(itemProgress, [0, 1], [-30, 0])}px)`,
                                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                    width: 60,
                                                    height: 60,
                                                    border: `2px solid ${colors.primary}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 30,
                                                    color: colors.primary,
                                                    textShadow: `0 0 10px ${colors.primary}`,
                                                }, children: item.icon || String(i + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, fontWeight: 700, color: colors.text }, children: item.text }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: colors.muted, marginTop: 4 }, children: item.desc }))] })] }, i));
                                }) })] }) }));
            // ===== 步骤页 (steps) =====
            case "steps": {
                const steps = data.steps || [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: 880 }, children: [(0, jsx_runtime_1.jsx)(TerminalText, { text: String((_d = data.title) !== null && _d !== void 0 ? _d : "").toUpperCase(), delay: 0, frame: frame }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 40, display: "flex", flexDirection: "column", gap: 18 }, children: steps.map((step, i) => {
                                const stepProgress = (0, remotion_1.spring)({
                                    frame: frame - 18 - i * 10,
                                    fps,
                                    config: { damping: 14 },
                                });
                                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                                const accent = colorSet[i % colorSet.length];
                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: "grid",
                                        gridTemplateColumns: "100px 1fr",
                                        gap: 22,
                                        alignItems: "center",
                                        padding: "18px 22px",
                                        border: `1px solid ${accent}55`,
                                        background: `linear-gradient(90deg, ${accent}10 0%, transparent 80%)`,
                                        opacity: stepProgress,
                                        transform: `translateX(${(0, remotion_1.interpolate)(stepProgress, [0, 1], [-40, 0])}px)`,
                                        position: "relative",
                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: 4,
                                                background: accent,
                                                boxShadow: `0 0 12px ${accent}`,
                                            } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontSize: 42,
                                                fontWeight: 900,
                                                color: accent,
                                                textShadow: `0 0 14px ${accent}90`,
                                                letterSpacing: "-0.02em",
                                            }, children: `STEP_${String(i + 1).padStart(2, "0")}`.slice(5) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: colors.text }, children: step.title }), step.description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 19, color: colors.muted, marginTop: 4 }, children: step.description }))] })] }, i));
                            }) })] }));
            }
            // ===== 时间线页 (timeline) =====
            case "timeline": {
                const timeline = data.timeline || [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: 900 }, children: [(0, jsx_runtime_1.jsx)(TerminalText, { text: String((_e = data.title) !== null && _e !== void 0 ? _e : "").toUpperCase(), delay: 0, frame: frame }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 50, position: "relative", paddingLeft: 50 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        left: 24,
                                        top: 16,
                                        bottom: 16,
                                        width: 2,
                                        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                                        boxShadow: `0 0 12px ${colors.primary}80`,
                                        transform: `scaleY(${(0, remotion_1.spring)({ frame: frame - 12, fps, config: { damping: 18 } })})`,
                                        transformOrigin: "top",
                                    } }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 22 }, children: timeline.map((item, i) => {
                                        const itemProgress = (0, remotion_1.spring)({
                                            frame: frame - 22 - i * 12,
                                            fps,
                                            config: { damping: 14 },
                                        });
                                        const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                                        const accent = colorSet[i % colorSet.length];
                                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                position: "relative",
                                                opacity: itemProgress,
                                                transform: `translateX(${(0, remotion_1.interpolate)(itemProgress, [0, 1], [-20, 0])}px)`,
                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        position: "absolute",
                                                        left: -34,
                                                        top: 14,
                                                        width: 14,
                                                        height: 14,
                                                        borderRadius: "50%",
                                                        background: accent,
                                                        boxShadow: `0 0 14px ${accent}, 0 0 0 4px ${accent}30`,
                                                    } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontFamily: "'JetBrains Mono', monospace",
                                                        fontSize: 22,
                                                        color: accent,
                                                        letterSpacing: "0.08em",
                                                        textTransform: "uppercase",
                                                        fontWeight: 800,
                                                    }, children: `> ${item.year}` }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: colors.text, marginTop: 2 }, children: item.title }), item.description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 19, color: colors.muted, marginTop: 4 }, children: item.description }))] }, i));
                                    }) })] })] }));
            }
            // ===== 关键词页 (highlight) =====
            case "highlight": {
                const items = (data.items || []).map((it) => typeof it === "string" ? it : it.text || "");
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: 900 }, children: [(0, jsx_runtime_1.jsx)(TerminalText, { text: String((_f = data.title) !== null && _f !== void 0 ? _f : "").toUpperCase(), delay: 0, frame: frame }), (0, jsx_runtime_1.jsx)("div", { style: {
                                marginTop: 50,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                                justifyContent: "center",
                            }, children: items.map((it, i) => {
                                const tagProgress = (0, remotion_1.spring)({
                                    frame: frame - 20 - i * 8,
                                    fps,
                                    config: { damping: 12 },
                                });
                                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                                const accent = colorSet[i % colorSet.length];
                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        padding: "20px 30px",
                                        border: `1px solid ${accent}`,
                                        background: `${accent}12`,
                                        boxShadow: `0 0 24px ${accent}30, inset 0 0 14px ${accent}10`,
                                        fontSize: 30,
                                        fontWeight: 800,
                                        color: colors.text,
                                        letterSpacing: "0.04em",
                                        opacity: tagProgress,
                                        transform: `scale(${(0, remotion_1.interpolate)(tagProgress, [0, 1], [0.86, 1])})`,
                                        position: "relative",
                                    }, children: [(0, jsx_runtime_1.jsxs)("span", { style: {
                                                color: accent,
                                                marginRight: 12,
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontSize: 22,
                                            }, children: ["[", String(i + 1).padStart(2, "0"), "]"] }), it] }, i));
                            }) })] }));
            }
            // ===== 进度页 =====
            case "progress":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: 700 }, children: [(0, jsx_runtime_1.jsx)(TerminalText, { text: String((_g = data.title) !== null && _g !== void 0 ? _g : "").toUpperCase(), delay: 0, frame: frame }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 50 }, children: Array.isArray(data.bars) && data.bars.map((bar, i) => {
                                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                                return ((0, jsx_runtime_1.jsx)(CyberProgress, { label: bar.label, percent: bar.percent, color: colorSet[i % colorSet.length], delay: 15 + i * 10, frame: frame, fps: fps }, i));
                            }) })] }));
            // ===== 对比页 =====
            case "compare":
                return ((0, jsx_runtime_1.jsxs)("div", { style: { width: "90%" }, children: [(0, jsx_runtime_1.jsx)(TerminalText, { text: String((_h = data.title) !== null && _h !== void 0 ? _h : "").toUpperCase(), delay: 0, frame: frame }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 40,
                                marginTop: 50,
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        padding: 40,
                                        border: `2px solid ${colors.accent}`,
                                        background: `${colors.accent}10`,
                                        opacity: (0, remotion_1.spring)({ frame: frame - 15, fps, config: { damping: 12 } }),
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 24, color: colors.accent, marginBottom: 10 }, children: ["// ", String((_k = (_j = data.left) === null || _j === void 0 ? void 0 : _j.label) !== null && _k !== void 0 ? _k : "")] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 900, color: colors.text }, children: String((_m = (_l = data.left) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : "") })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 34,
                                        fontWeight: 900,
                                        color: colors.primary,
                                        textShadow: `0 0 20px ${colors.primary}`,
                                    }, children: "VS" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                        padding: 40,
                                        border: `2px solid ${colors.secondary}`,
                                        background: `${colors.secondary}10`,
                                        opacity: (0, remotion_1.spring)({ frame: frame - 25, fps, config: { damping: 12 } }),
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 24, color: colors.secondary, marginBottom: 10 }, children: ["// ", String((_p = (_o = data.right) === null || _o === void 0 ? void 0 : _o.label) !== null && _p !== void 0 ? _p : "")] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 900, color: colors.text }, children: String((_r = (_q = data.right) === null || _q === void 0 ? void 0 : _q.value) !== null && _r !== void 0 ? _r : "") })] })] })] }));
            // ===== 引用页 =====
            case "quote":
                return ((0, jsx_runtime_1.jsx)(HoloFrame, { delay: 5, frame: frame, fps: fps, children: (0, jsx_runtime_1.jsxs)("div", { style: { maxWidth: 800 }, children: [(0, jsx_runtime_1.jsxs)("p", { style: {
                                    fontSize: 34,
                                    fontStyle: "italic",
                                    color: colors.text,
                                    margin: 0,
                                    lineHeight: 1.6,
                                }, children: ["\"", String((_s = data.quote) !== null && _s !== void 0 ? _s : ""), "\""] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                    marginTop: 30,
                                    fontSize: 26,
                                    color: colors.secondary,
                                    textAlign: "right",
                                }, children: ["\u2014 ", String((_t = data.author) !== null && _t !== void 0 ? _t : "")] })] }) }));
            // ===== Hero 页 =====
            case "hero": {
                const titleGlitch = frame % 40 < 3;
                const items = Array.isArray(data.items)
                    ? data.items
                    : [];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center", width: "90%" }, children: [typeof data.badge === 'string' && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "inline-flex",
                                padding: "10px 28px",
                                border: `1px solid ${colors.primary}`,
                                background: `${colors.primary}18`,
                                boxShadow: `0 0 20px ${colors.primary}40, inset 0 0 14px ${colors.primary}10`,
                                fontSize: 22,
                                fontWeight: 700,
                                color: colors.primary,
                                textShadow: `0 0 10px ${colors.primary}`,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                marginBottom: 36,
                            }, children: data.badge })), (0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 84,
                                fontWeight: 900,
                                color: titleGlitch ? colors.accent : colors.text,
                                margin: 0,
                                textShadow: titleGlitch
                                    ? `3px 0 ${colors.primary}, -3px 0 ${colors.accent}`
                                    : `0 0 40px ${colors.primary}60`,
                                letterSpacing: "2px",
                                lineHeight: 1.05,
                                transform: titleGlitch ? `translateX(${Math.sin(frame)}px)` : "none",
                            }, children: String((_u = data.title) !== null && _u !== void 0 ? _u : "") }), typeof data.subtitle === 'string' && ((0, jsx_runtime_1.jsx)("p", { style: {
                                fontSize: 30,
                                color: colors.muted,
                                marginTop: 24,
                                letterSpacing: "2px",
                            }, children: data.subtitle })), items.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                marginTop: 48,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                                justifyContent: "center",
                            }, children: items.map((item, i) => {
                                const chipColors = [colors.primary, colors.secondary, colors.accent, colors.warning];
                                const chipColor = chipColors[i % chipColors.length];
                                return ((0, jsx_runtime_1.jsx)("div", { style: {
                                        padding: "12px 26px",
                                        border: `1px solid ${chipColor}`,
                                        background: `${chipColor}15`,
                                        boxShadow: `0 0 14px ${chipColor}30`,
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: chipColor,
                                        textShadow: `0 0 8px ${chipColor}`,
                                        letterSpacing: "0.04em",
                                    }, children: item }, i));
                            }) }))] }));
            }
            // ===== CTA 页 =====
            case "cta": {
                const pulse = 1 + Math.sin(frame * 0.1) * 0.03;
                return ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "center" }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                                fontSize: 76,
                                fontWeight: 900,
                                color: colors.text,
                                margin: "40px 0 20px",
                                textShadow: `0 0 40px ${colors.primary}60`,
                                letterSpacing: "3px",
                            }, children: String((_v = data.title) !== null && _v !== void 0 ? _v : "") }), typeof data.subtitle === 'string' && ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: 34, color: colors.muted }, children: data.subtitle })), typeof data.button === 'string' && ((0, jsx_runtime_1.jsx)("div", { style: {
                                marginTop: 50,
                                padding: "24px 60px",
                                background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                                border: `2px solid ${colors.primary}`,
                                display: "inline-block",
                                fontSize: 30,
                                fontWeight: 700,
                                color: colors.primary,
                                textShadow: `0 0 20px ${colors.primary}`,
                                transform: `scale(${pulse})`,
                                boxShadow: `0 0 30px ${colors.primary}50, inset 0 0 30px ${colors.primary}20`,
                            }, children: data.button }))] }));
            }
            default:
                return null;
        }
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: colors.bg,
            justifyContent: "center",
            alignItems: "center",
            fontFamily: `"${fontFamily}", "PingFang SC", "Microsoft YaHei", sans-serif`,
            overflow: "hidden",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(${colors.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}08 1px, transparent 1px)
          `,
                    backgroundSize: "40px 40px",
                } }), (0, jsx_runtime_1.jsx)(ScanLines, { frame: frame }), (0, jsx_runtime_1.jsx)(DataParticles, { frame: frame }), (0, jsx_runtime_1.jsx)(CircuitLines, { frame: frame }), (0, jsx_runtime_1.jsx)(PageNum, {}), (0, jsx_runtime_1.jsxs)("div", { style: {
                    opacity: exitOpacity,
                    width: "90%",
                    maxWidth: 920,
                    minHeight: 1260,
                    padding: "32px 34px 38px",
                    borderRadius: 32,
                    background: "linear-gradient(180deg, rgba(4,8,20,0.76), rgba(4,10,18,0.62))",
                    border: `1px solid ${colors.primary}20`,
                    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
                    backdropFilter: "blur(10px)",
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            marginBottom: 28,
                        }, children: (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 20, color: "rgba(255,255,255,0.64)", fontWeight: 600 }, children: [String(index + 1).padStart(2, "0"), " / ", String(totalSlides).padStart(2, "0")] }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 1130 }, children: renderContent() })] })] }));
};
exports.TechSlide = TechSlide;
