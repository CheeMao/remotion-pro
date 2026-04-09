"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StickSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const StickFigure_1 = require("./figure/StickFigure");
const actions_1 = require("./figure/actions");
const normalize_1 = require("../landscape/normalize");
// ===================================================================
// STICK — 火柴人 + 数据卡片混合模板
// 黑板感深底 + 粉笔/黄色重点 + 手绘抖动
// ===================================================================
// ===== 安全区 (避开抖音/视频号 UI 遮挡) =====
// 顶部 240 (用户名/时间) / 底部 1620 (操作按钮+文案) / 两侧 100
const SAFE_TOP = 240;
const SAFE_LEFT = 100;
const STICK = {
    bg: '#1a1814',
    bgGradient: 'radial-gradient(ellipse 1200px 1800px at 50% 30%, #2a2520 0%, #0e0c0a 80%)',
    ink: '#fffefb',
    inkDim: 'rgba(255,254,251,0.66)',
    inkFaint: 'rgba(255,254,251,0.30)',
    chalk: '#fffefb',
    yellow: '#fbbf24',
    pink: '#f472b6',
    cyan: '#67e8f9',
    green: '#86efac',
    red: '#f87171',
    rule: 'rgba(255,254,251,0.18)',
    font: "'Caveat', 'Marker Felt', 'Comic Sans MS', 'PingFang SC', sans-serif",
    fontHeading: "'Caveat', 'Permanent Marker', 'Comic Sans MS', 'PingFang SC', sans-serif",
};
// ===== UTILS =====
const ease = (frame, from, to) => (0, remotion_1.interpolate)(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: remotion_1.Easing.out(remotion_1.Easing.cubic),
});
// ===== BACKGROUND =====
const StickBg = ({ frame }) => {
    const grain = (frame * 0.02) % 100;
    void grain;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { background: STICK.bg } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { background: STICK.bgGradient } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    backgroundImage: `radial-gradient(rgba(255,254,251,0.04) 1px, transparent 1px),
                            radial-gradient(rgba(255,254,251,0.025) 1px, transparent 1px)`,
                    backgroundSize: '4px 4px, 9px 9px',
                    backgroundPosition: '0 0, 2px 2px',
                    opacity: 0.7,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: SAFE_LEFT,
                    right: SAFE_LEFT,
                    top: 1560,
                    height: 3,
                    background: STICK.rule,
                    borderRadius: 2,
                } })] }));
};
// ===== HAND-DRAWN BORDER (装饰用边框) =====
const HandBorder = ({ x, y, w, h, color = STICK.yellow, frame, delay = 0, fill = 'transparent' }) => {
    const a = ease(frame, delay, delay + 14);
    const draw = ease(frame, delay + 2, delay + 26);
    const perimeter = 2 * (w + h);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: x, y: y, width: w, height: h, fill: fill, rx: 14, opacity: a * 0.9 }), (0, jsx_runtime_1.jsx)("rect", { x: x, y: y, width: w, height: h, fill: "none", stroke: color, strokeWidth: 6, strokeLinecap: "round", strokeDasharray: perimeter, strokeDashoffset: perimeter * (1 - draw), rx: 14 })] }));
};
// ===== ATOMS =====
const ChalkText = ({ text, x, y, size = 64, color = STICK.chalk, frame, delay = 0, weight = 700, textAnchor = 'start', maxWidth, }) => {
    const a = ease(frame, delay, delay + 22);
    return ((0, jsx_runtime_1.jsx)("text", { x: x, y: y + (1 - a) * 18, fill: color, fontSize: size, fontWeight: weight, fontFamily: STICK.fontHeading, textAnchor: textAnchor, opacity: a, style: {
            letterSpacing: '0.01em',
            ...(maxWidth ? { maxWidth } : {}),
        }, children: text }));
};
const Underline = ({ x, y, width, color = STICK.yellow, frame, delay = 0, thickness = 8 }) => {
    const t = ease(frame, delay, delay + 26);
    return ((0, jsx_runtime_1.jsx)("line", { x1: x, y1: y, x2: x + width * t, y2: y, stroke: color, strokeWidth: thickness, strokeLinecap: "round" }));
};
// ===================================================================
// MAIN
// ===================================================================
const StickSlide = ({ title = '', subtitle, points, type = 'default', data, index, totalSlides, durationInFrames, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    // ----- 火柴人 pose -----
    const choosePose = () => {
        switch (type) {
            case 'hero':
                return (0, actions_1.heroChoreo)(frame);
            case 'stats':
                return (0, actions_1.statsChoreo)(frame);
            case 'compare':
                return (0, actions_1.compareChoreo)(frame);
            case 'chart':
                return (0, actions_1.chartChoreo)(frame);
            case 'steps': {
                const steps = (0, normalize_1.toSteps)(points, data);
                return (0, actions_1.stepsChoreo)(frame, Math.max(2, Math.min(4, steps.length || 3)));
            }
            case 'timeline': {
                const tl = (0, normalize_1.toTimeline)(points, data);
                return (0, actions_1.timelineChoreo)(frame, Math.max(2, Math.min(4, tl.length || 3)));
            }
            case 'list':
                return (0, actions_1.listChoreo)(frame);
            case 'highlight':
                return (0, actions_1.highlightChoreo)(frame);
            case 'quote':
                return (0, actions_1.quoteChoreo)(frame);
            case 'cta':
                return (0, actions_1.ctaChoreo)(frame);
            default:
                return (0, actions_1.defaultChoreo)(frame);
        }
    };
    const pose = choosePose();
    // ----- HEADER (页码) — 在安全区顶部 -----
    const renderHeader = () => ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            top: SAFE_TOP,
            left: SAFE_LEFT,
            right: SAFE_LEFT,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: ease(frame, 0, 18),
            fontFamily: STICK.font,
            color: STICK.inkDim,
            fontSize: 26,
            fontWeight: 700,
        }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["\u2726 ", (type || 'default').toUpperCase()] }), (0, jsx_runtime_1.jsxs)("span", { children: [String(index + 1).padStart(2, '0'), " /", ' ', String(totalSlides).padStart(2, '0')] })] }));
    // ----- 数据卡片层（DOM） -----
    const renderCards = () => {
        switch (type) {
            case 'hero':
                return renderHeroCards();
            case 'stats':
                return renderStatsCards();
            case 'compare':
                return renderCompareCards();
            case 'chart':
                return renderChartCards();
            case 'steps':
                return renderStepsCards();
            case 'timeline':
                return renderTimelineCards();
            case 'list':
                return renderListCards();
            case 'highlight':
                return renderHighlightCards();
            case 'quote':
                return renderQuoteCards();
            case 'cta':
                return renderCtaCards();
            default:
                return renderDefaultCards();
        }
    };
    const renderDefaultCards = () => {
        const bulletPoints = Array.isArray(points) && points.length > 0
            ? points
            : Array.isArray(data === null || data === void 0 ? void 0 : data.points)
                ? data.points
                : [];
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: SAFE_TOP + 60,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        fontFamily: STICK.fontHeading,
                        color: STICK.ink,
                        textAlign: 'center',
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 72,
                                fontWeight: 800,
                                lineHeight: 1.1,
                                opacity: ease(frame, 8, 30),
                                transform: `translateY(${(1 - ease(frame, 8, 30)) * 24}px)`,
                            }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 30,
                                color: STICK.inkDim,
                                marginTop: 14,
                                opacity: ease(frame, 18, 38),
                            }, children: subtitle })) : null] }), bulletPoints.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 520,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        fontFamily: STICK.fontHeading,
                    }, children: bulletPoints.slice(0, 5).map((pt, i) => {
                        const t = 30 + i * 18;
                        const a = ease(frame, t, t + 22);
                        const bulletColors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green, STICK.red];
                        const color = bulletColors[i % bulletColors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 22,
                                padding: '14px 18px',
                                borderBottom: `2px dashed ${STICK.inkFaint}`,
                                opacity: a,
                                transform: `translateX(${(1 - a) * -24}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 42, color, fontWeight: 900, lineHeight: 1.1, flexShrink: 0 }, children: "\u2726" }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 34, color: STICK.ink, fontWeight: 700, lineHeight: 1.3 }, children: pt })] }, `${pt}-${i}`));
                    }) })) : null] }));
    };
    const renderHeroCards = () => ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            top: SAFE_TOP + 80,
            left: SAFE_LEFT,
            right: SAFE_LEFT,
            textAlign: 'center',
            fontFamily: STICK.fontHeading,
            color: STICK.ink,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 30,
                    color: STICK.yellow,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    opacity: ease(frame, 18, 34),
                }, children: "\u2726  HOOK  \u2726" }), (0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 88,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginTop: 22,
                    letterSpacing: '-0.01em',
                    opacity: ease(frame, 24, 50),
                    transform: `translateY(${(1 - ease(frame, 24, 50)) * 24}px)`,
                }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 36,
                    color: STICK.inkDim,
                    marginTop: 18,
                    fontWeight: 600,
                    opacity: ease(frame, 40, 60),
                }, children: subtitle })) : null] }));
    const renderStatsCards = () => {
        const stats = (0, normalize_1.toStats)(points, data).slice(0, 3);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: SAFE_TOP + 60,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        fontFamily: STICK.fontHeading,
                        color: STICK.ink,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 54,
                                fontWeight: 800,
                                lineHeight: 1.12,
                                opacity: ease(frame, 8, 28),
                            }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 28,
                                color: STICK.inkDim,
                                marginTop: 12,
                                opacity: ease(frame, 18, 36),
                            }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 540,
                        right: SAFE_LEFT,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 28,
                        width: 540,
                    }, children: stats.map((s, i) => {
                        const triggers = [30, 70, 110];
                        const t = triggers[i] || 30;
                        const a = ease(frame, t, t + 22);
                        const numProgress = ease(frame, t + 4, t + 30);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                opacity: a,
                                transform: `translateY(${(1 - a) * 20}px)`,
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: STICK.fontHeading,
                                        fontSize: 110,
                                        fontWeight: 900,
                                        lineHeight: 0.92,
                                        color: STICK.yellow,
                                        letterSpacing: '-0.04em',
                                    }, children: [s.rawValue % 1 !== 0
                                            ? (s.rawValue * numProgress).toFixed(1)
                                            : Math.floor(s.rawValue * numProgress), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 50, color: STICK.pink }, children: s.suffix })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: STICK.fontHeading,
                                        fontSize: 30,
                                        color: STICK.ink,
                                        fontWeight: 700,
                                    }, children: s.label })] }, s.label));
                    }) })] }));
    };
    const renderCompareCards = () => {
        const { left, right } = (0, normalize_1.toCompare)(points, data);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: SAFE_TOP + 60,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        fontFamily: STICK.fontHeading,
                        color: STICK.ink,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 52,
                                fontWeight: 800,
                                lineHeight: 1.12,
                                opacity: ease(frame, 6, 26),
                            }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 26,
                                color: STICK.inkDim,
                                marginTop: 12,
                                opacity: ease(frame, 14, 32),
                            }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: 460,
                        left: SAFE_LEFT + 20,
                        width: 380,
                        padding: '22px 24px 26px',
                        border: `4px solid ${STICK.cyan}`,
                        borderRadius: 18,
                        opacity: ease(frame, 26, 50),
                        transform: `translateY(${(1 - ease(frame, 26, 50)) * 16}px)`,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                fontFamily: STICK.fontHeading,
                                fontSize: 24,
                                color: STICK.cyan,
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }, children: ["\u2460 ", left.label] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: STICK.fontHeading,
                                fontSize: 44,
                                color: STICK.ink,
                                fontWeight: 800,
                                lineHeight: 1.15,
                                marginTop: 14,
                            }, children: left.value }), left.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: STICK.inkDim, marginTop: 12, lineHeight: 1.5 }, children: left.desc })) : null] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: 460,
                        right: SAFE_LEFT + 20,
                        width: 380,
                        padding: '22px 24px 26px',
                        border: `4px solid ${STICK.yellow}`,
                        borderRadius: 18,
                        opacity: ease(frame, 78, 100),
                        transform: `translateY(${(1 - ease(frame, 78, 100)) * 16}px)`,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                fontFamily: STICK.fontHeading,
                                fontSize: 24,
                                color: STICK.yellow,
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }, children: ["\u2461 ", right.label] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: STICK.fontHeading,
                                fontSize: 44,
                                color: STICK.ink,
                                fontWeight: 800,
                                lineHeight: 1.15,
                                marginTop: 14,
                            }, children: right.value }), right.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: STICK.inkDim, marginTop: 12, lineHeight: 1.5 }, children: right.desc })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 560,
                        left: '50%',
                        transform: `translateX(-50%) scale(${ease(frame, 60, 80)})`,
                        fontFamily: STICK.fontHeading,
                        fontSize: 64,
                        color: STICK.red,
                        fontWeight: 900,
                    }, children: "VS" })] }));
    };
    const renderChartCards = () => {
        const bars = (0, normalize_1.toChart)(points, data).slice(0, 4);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: SAFE_TOP + 60,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        fontFamily: STICK.fontHeading,
                        color: STICK.ink,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 52, fontWeight: 800, opacity: ease(frame, 8, 28) }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 16, 34) }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 520,
                        right: SAFE_LEFT,
                        width: 540,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 22,
                    }, children: bars.map((b, i) => {
                        const beats = [25, 55, 85, 115];
                        const t = beats[i] || 25;
                        const fill = ease(frame, t, t + 30);
                        const w = Math.max(0, Math.min(100, b.value));
                        const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
                        const color = colors[i % colors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: { opacity: ease(frame, t, t + 14) }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'baseline',
                                        fontFamily: STICK.fontHeading,
                                        color: STICK.ink,
                                        marginBottom: 8,
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 30, fontWeight: 800 }, children: b.label }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 38, fontWeight: 900, color }, children: [Math.floor(w * fill), "%"] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        height: 22,
                                        border: `3px solid ${STICK.inkFaint}`,
                                        borderRadius: 14,
                                        overflow: 'hidden',
                                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                            height: '100%',
                                            width: `${w * fill}%`,
                                            background: color,
                                            borderRadius: 11,
                                        } }) })] }, `${b.label}-${i}`));
                    }) })] }));
    };
    const renderStepsCards = () => {
        const steps = (0, normalize_1.toSteps)(points, data).slice(0, 4);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: SAFE_TOP + 60,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        fontFamily: STICK.fontHeading,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 52, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 14, 32) }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 460,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`,
                        gap: 16,
                    }, children: steps.map((step, i) => {
                        const t = 24 + i * 28;
                        const a = ease(frame, t, t + 24);
                        const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
                        const color = colors[i % colors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                border: `4px solid ${color}`,
                                borderRadius: 16,
                                padding: '20px 18px',
                                opacity: a,
                                transform: `translateY(${(1 - a) * 22}px)`,
                                fontFamily: STICK.fontHeading,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 56,
                                        fontWeight: 900,
                                        color,
                                        lineHeight: 1,
                                    }, children: String(i + 1).padStart(2, '0') }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: STICK.ink,
                                        marginTop: 14,
                                        lineHeight: 1.2,
                                    }, children: step.title }), step.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: STICK.inkDim, marginTop: 8, lineHeight: 1.5 }, children: step.desc })) : null] }, `${step.title}-${i}`));
                    }) })] }));
    };
    const renderTimelineCards = () => {
        const timeline = (0, normalize_1.toTimeline)(points, data).slice(0, 4);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', top: SAFE_TOP + 60, left: SAFE_LEFT, right: SAFE_LEFT, fontFamily: STICK.fontHeading }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 50, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 14, 32) }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 460,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(timeline.length, 4)}, 1fr)`,
                        gap: 14,
                    }, children: timeline.map((t, i) => {
                        const start = 20 + i * 24;
                        const a = ease(frame, start, start + 24);
                        const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
                        const color = colors[i % colors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                fontFamily: STICK.fontHeading,
                                opacity: a,
                                transform: `translateY(${(1 - a) * 18}px)`,
                                borderTop: `4px solid ${color}`,
                                paddingTop: 16,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 36, fontWeight: 900, color }, children: t.year }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, fontWeight: 800, color: STICK.ink, marginTop: 8, lineHeight: 1.25 }, children: t.title }), t.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 17, color: STICK.inkDim, marginTop: 6, lineHeight: 1.5 }, children: t.desc })) : null] }, `${t.year}-${i}`));
                    }) })] }));
    };
    const renderListCards = () => {
        const items = (0, normalize_1.toList)(points, data).slice(0, 5);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', top: SAFE_TOP + 60, left: SAFE_LEFT, right: SAFE_LEFT, fontFamily: STICK.fontHeading }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 56, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 14, 32) }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 480,
                        left: SAFE_LEFT,
                        right: 380,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }, children: items.map((it, i) => {
                        const t = 26 + i * 16;
                        const a = ease(frame, t, t + 22);
                        const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green, STICK.red];
                        const color = colors[i % colors.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: '70px 1fr',
                                gap: 18,
                                alignItems: 'baseline',
                                padding: '14px 18px',
                                borderBottom: `2px dashed ${STICK.inkFaint}`,
                                opacity: a,
                                transform: `translateX(${(1 - a) * -20}px)`,
                                fontFamily: STICK.fontHeading,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 48, fontWeight: 900, color }, children: String(i + 1).padStart(2, '0') }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, fontWeight: 800, color: STICK.ink, lineHeight: 1.25 }, children: it.title }), it.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, color: STICK.inkDim, marginTop: 4, lineHeight: 1.5 }, children: it.desc })) : null] })] }, `${it.title}-${i}`));
                    }) })] }));
    };
    const renderHighlightCards = () => {
        const items = (0, normalize_1.toHighlights)(points, data).slice(0, 4);
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: SAFE_TOP + 60, left: SAFE_LEFT, right: SAFE_LEFT, fontFamily: STICK.fontHeading }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 52, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }, children: title }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 460,
                        left: SAFE_LEFT + 40,
                        right: SAFE_LEFT,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 18,
                        alignItems: 'flex-start',
                    }, children: items.map((it, i) => {
                        const triggers = [25, 55, 85, 115];
                        const t = triggers[i] || 25;
                        const a = ease(frame, t, t + 22);
                        const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
                        const color = colors[i % colors.length];
                        const offset = i % 2 === 0 ? 0 : 80;
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                marginLeft: offset,
                                fontFamily: STICK.fontHeading,
                                fontSize: 56,
                                fontWeight: 800,
                                color: STICK.ink,
                                opacity: a,
                                transform: `translateX(${(1 - a) * (i % 2 === 0 ? -30 : 30)}px) scale(${0.92 + a * 0.08})`,
                                lineHeight: 1.15,
                                position: 'relative',
                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                        position: 'absolute',
                                        left: -36,
                                        top: 12,
                                        color,
                                        fontSize: 32,
                                        fontWeight: 900,
                                    }, children: "\u2726" }), it, (0, jsx_runtime_1.jsx)("div", { style: {
                                        position: 'absolute',
                                        bottom: -6,
                                        left: 0,
                                        height: 6,
                                        width: `${a * 100}%`,
                                        background: color,
                                        borderRadius: 4,
                                    } })] }, `${it}-${i}`));
                    }) })] }));
    };
    const renderQuoteCards = () => {
        const { quote, author } = (0, normalize_1.getQuote)(data, title, subtitle);
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: SAFE_TOP + 100,
                    left: SAFE_LEFT,
                    right: 380,
                    fontFamily: STICK.fontHeading,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 220,
                            color: STICK.yellow,
                            opacity: 0.18 * ease(frame, 4, 24),
                            lineHeight: 0.7,
                            fontWeight: 900,
                            marginBottom: -60,
                        }, children: "\"" }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 64,
                            fontWeight: 800,
                            color: STICK.ink,
                            lineHeight: 1.22,
                            opacity: ease(frame, 18, 50),
                            transform: `translateY(${(1 - ease(frame, 18, 50)) * 18}px)`,
                        }, children: quote }), author ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                            marginTop: 36,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            opacity: ease(frame, 50, 70),
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 50, height: 4, background: STICK.yellow, borderRadius: 2 } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: STICK.yellow, fontWeight: 800, letterSpacing: '0.06em' }, children: author })] })) : null] }) }));
    };
    const renderCtaCards = () => {
        const cta = (0, normalize_1.getCta)(data) || '点赞收藏';
        const tags = (0, normalize_1.toHighlights)(points, data).slice(0, 4);
        const pulse = 1 + Math.sin(frame * 0.13) * 0.04;
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        position: 'absolute',
                        top: SAFE_TOP + 60,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        textAlign: 'center',
                        fontFamily: STICK.fontHeading,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 30,
                                color: STICK.yellow,
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                opacity: ease(frame, 6, 24),
                            }, children: "\u2726  THE END  \u2726" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 84,
                                fontWeight: 800,
                                color: STICK.ink,
                                lineHeight: 1.1,
                                marginTop: 28,
                                opacity: ease(frame, 16, 42),
                                transform: `translateY(${(1 - ease(frame, 16, 42)) * 22}px)`,
                            }, children: title }), subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 32,
                                color: STICK.inkDim,
                                marginTop: 18,
                                opacity: ease(frame, 30, 50),
                            }, children: subtitle })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 720,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        opacity: ease(frame, 70, 90),
                    }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                            padding: '24px 56px',
                            border: `6px solid ${STICK.yellow}`,
                            borderRadius: 999,
                            background: 'rgba(251,191,36,0.10)',
                            fontFamily: STICK.fontHeading,
                            fontSize: 44,
                            fontWeight: 800,
                            color: STICK.yellow,
                            transform: `scale(${pulse})`,
                        }, children: ["\u2192 ", cta] }) }), tags.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        top: 850,
                        left: SAFE_LEFT,
                        right: SAFE_LEFT,
                        display: 'flex',
                        gap: 12,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        fontFamily: STICK.fontHeading,
                        opacity: ease(frame, 86, 110),
                    }, children: tags.map((t, i) => {
                        const colors = [STICK.cyan, STICK.pink, STICK.green, STICK.yellow];
                        const color = colors[i % colors.length];
                        return ((0, jsx_runtime_1.jsxs)("span", { style: {
                                padding: '10px 20px',
                                border: `3px solid ${color}`,
                                borderRadius: 999,
                                fontSize: 24,
                                color,
                                fontWeight: 800,
                            }, children: ["#", t] }, `${t}-${i}`));
                    }) })) : null] }));
    };
    void Underline;
    void HandBorder;
    void ChalkText;
    void durationInFrames;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: STICK.bg, fontFamily: STICK.font }, children: [(0, jsx_runtime_1.jsx)(StickBg, { frame: frame }), renderHeader(), renderCards(), (0, jsx_runtime_1.jsx)("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }, children: (0, jsx_runtime_1.jsx)(StickFigure_1.StickFigure, { pose: pose, frame: frame, color: STICK.chalk, strokeWidth: 9, fillColor: STICK.bg }) })] }));
};
exports.StickSlide = StickSlide;
