"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const react_1 = require("react");
const animationTiming_1 = require("../templates/animationTiming");
// ============================================================
// THEME COLORS
// ============================================================
const C = {
    bg: '#0c1629',
    bgAlt: '#0d1b30',
    blue1: '#4a9fd5',
    blue2: '#87ceeb',
    orange: '#f5821f',
    orangeDim: 'rgba(245,130,31,0.15)',
    white: '#ffffff',
    text: '#e8f0fe',
    muted: '#64748b',
    surface: 'rgba(255,255,255,0.04)',
    surfaceAlt: 'rgba(74,159,213,0.08)',
    border: 'rgba(100,160,220,0.2)',
    borderChip: 'rgba(100,160,220,0.35)',
    chipText: '#7ab8e8',
    cardBorder: 'rgba(255,255,255,0.07)',
    divider: 'rgba(100,160,220,0.2)',
};
const blueGradient = {
    background: 'linear-gradient(135deg, #4a9fd5, #87ceeb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};
// ============================================================
// PERSISTENT HEADER
// ============================================================
const PersistentHeader = ({ brand, entryProgress }) => {
    const translateY = (0, remotion_1.interpolate)(entryProgress, [0, 1], [-60, 0]);
    const opacity = (0, remotion_1.interpolate)(entryProgress, [0, 1], [0, 1]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 380,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 220,
            paddingLeft: 64,
            paddingRight: 64,
            opacity,
            transform: `translateY(${translateY}px)`,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                    marginBottom: 20,
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: 72,
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                            ...blueGradient,
                        }, children: brand.name }), brand.badge && ((0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: 22,
                            fontWeight: 600,
                            color: C.chipText,
                            border: '1px solid rgba(120,180,230,0.5)',
                            borderRadius: 999,
                            padding: '6px 16px',
                            letterSpacing: '0.01em',
                            flexShrink: 0,
                            lineHeight: 1,
                        }, children: brand.badge }))] }), brand.tagline && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 22,
                    fontWeight: 400,
                    color: C.text,
                    textAlign: 'center',
                    lineHeight: 1.5,
                    maxWidth: 800,
                    marginBottom: 28,
                }, children: brand.tagline })), (0, jsx_runtime_1.jsx)("div", { style: {
                    width: '80%',
                    height: 1,
                    background: C.divider,
                } })] }));
};
// ============================================================
// PERSISTENT FOOTER
// ============================================================
const PersistentFooter = ({ brand, entryProgress }) => {
    var _a;
    const translateY = (0, remotion_1.interpolate)(entryProgress, [0, 1], [60, 0]);
    const opacity = (0, remotion_1.interpolate)(entryProgress, [0, 1], [0, 1]);
    const chips = (_a = brand.chips) !== null && _a !== void 0 ? _a : [];
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 380,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingLeft: 48,
            paddingRight: 48,
            paddingBottom: 160,
            gap: 20,
            opacity,
            transform: `translateY(${translateY}px)`,
        }, children: [chips.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                }, children: chips.map((chip, i) => ((0, jsx_runtime_1.jsx)("span", { style: {
                        fontSize: 22,
                        fontWeight: 500,
                        color: C.chipText,
                        border: `1px solid ${C.borderChip}`,
                        borderRadius: 999,
                        padding: '7px 18px',
                        letterSpacing: '0.01em',
                        lineHeight: 1,
                    }, children: chip }, i))) })), brand.attribution && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 20,
                    fontWeight: 400,
                    color: C.muted,
                    textAlign: 'center',
                    letterSpacing: '0.02em',
                }, children: brand.attribution }))] }));
};
// ============================================================
// HERO CONTENT
// ============================================================
const HeroContent = ({ brandName, subtitleLines, contentProgress }) => {
    const opacity = (0, remotion_1.interpolate)(contentProgress, [0, 1], [0, 1]);
    const scale = (0, remotion_1.interpolate)(contentProgress, [0, 1], [0.88, 1]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            opacity,
            transform: `scale(${scale})`,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 120,
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    textAlign: 'center',
                    ...blueGradient,
                }, children: brandName }), subtitleLines && subtitleLines.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }, children: subtitleLines.map((line, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 30,
                        fontWeight: 400,
                        color: C.text,
                        textAlign: 'center',
                        lineHeight: 1.5,
                    }, children: line }, i))) }))] }));
};
// ============================================================
// PROBLEMS CONTENT
// ============================================================
const ProblemsContent = ({ title, problems = [], frame, fps, pointsStart, pointStagger }) => {
    const titleP = (0, remotion_1.spring)({
        frame: frame - pointsStart + 10,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 24,
            width: '100%',
        }, children: [title && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 48,
                    fontWeight: 700,
                    color: C.orange,
                    textAlign: 'left',
                    opacity: titleP,
                    transform: `translateX(${(0, remotion_1.interpolate)(titleP, [0, 1], [-24, 0])}px)`,
                    marginBottom: 8,
                }, children: title })), problems.map((p, i) => {
                const cardStart = pointsStart + i * pointStagger;
                const cardP = (0, remotion_1.spring)({
                    frame: frame - cardStart,
                    fps,
                    config: { damping: 16, stiffness: 90 },
                });
                const cardOpacity = (0, remotion_1.interpolate)(cardP, [0, 1], [0, 1]);
                const cardY = (0, remotion_1.interpolate)(cardP, [0, 1], [32, 0]);
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 20,
                        background: C.surface,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 12,
                        padding: '22px 24px',
                        opacity: cardOpacity,
                        transform: `translateY(${cardY}px)`,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                background: C.orangeDim,
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                                color: C.orange,
                                fontWeight: 700,
                            }, children: p.icon }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: C.white,
                                        lineHeight: 1.2,
                                        marginBottom: p.desc ? 6 : 0,
                                    }, children: p.title }), p.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 24,
                                        fontWeight: 400,
                                        color: C.muted,
                                        lineHeight: 1.4,
                                    }, children: p.desc }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontSize: 28,
                                fontWeight: 700,
                                color: C.orange,
                                flexShrink: 0,
                            }, children: "\u2715" })] }, i));
            })] }));
};
// ============================================================
// ANIMATED COUNT NUMBER
// ============================================================
const AnimatedCount = ({ prefix = '', value = 0, suffix = '', frame, fps, startFrame }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - startFrame,
        fps,
        config: { damping: 22, stiffness: 48 },
    });
    const displayValue = Math.round((0, remotion_1.interpolate)(progress, [0, 1], [0, value]));
    const opacity = (0, remotion_1.interpolate)(Math.min(progress * 3, 1), [0, 1], [0, 1]);
    const scale = (0, remotion_1.interpolate)(progress, [0, 1], [0.8, 1]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 8,
            opacity,
            transform: `scale(${scale})`,
        }, children: [prefix && ((0, jsx_runtime_1.jsx)("span", { style: { fontSize: 80, lineHeight: 1 }, children: prefix })), (0, jsx_runtime_1.jsx)("span", { style: {
                    fontSize: 96,
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums',
                    ...blueGradient,
                }, children: displayValue.toLocaleString() }), suffix && ((0, jsx_runtime_1.jsx)("span", { style: {
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1,
                    ...blueGradient,
                }, children: suffix }))] }));
};
// ============================================================
// STATS CONTENT
// ============================================================
const StatsContent = ({ countPrefix, countValue, countSuffix, badges = [], highlight, highlightAccent, frame, fps, pointsStart, pointStagger, }) => {
    const badgesStart = pointsStart + pointStagger;
    const highlightStart = badgesStart + pointStagger;
    const badgesP = (0, remotion_1.spring)({
        frame: frame - badgesStart,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    const highlightP = (0, remotion_1.spring)({
        frame: frame - highlightStart,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 36,
            width: '100%',
        }, children: [(0, jsx_runtime_1.jsx)(AnimatedCount, { prefix: countPrefix, value: countValue, suffix: countSuffix, frame: frame, fps: fps, startFrame: pointsStart }), badges.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 14,
                    justifyContent: 'center',
                    opacity: badgesP,
                    transform: `translateY(${(0, remotion_1.interpolate)(badgesP, [0, 1], [20, 0])}px)`,
                }, children: badges.map((badge, i) => ((0, jsx_runtime_1.jsx)("span", { style: {
                        fontSize: 24,
                        fontWeight: 500,
                        color: C.chipText,
                        border: `1px solid ${C.borderChip}`,
                        borderRadius: 999,
                        padding: '8px 22px',
                        lineHeight: 1,
                    }, children: badge }, i))) })), (highlight || highlightAccent) && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    opacity: highlightP,
                    transform: `translateY(${(0, remotion_1.interpolate)(highlightP, [0, 1], [20, 0])}px)`,
                }, children: [highlight && ((0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 28,
                            fontWeight: 400,
                            color: C.text,
                            textAlign: 'center',
                            lineHeight: 1.5,
                            maxWidth: 800,
                        }, children: highlight })), highlightAccent && ((0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 30,
                            fontWeight: 700,
                            color: C.orange,
                            textAlign: 'center',
                            lineHeight: 1.4,
                            maxWidth: 800,
                        }, children: highlightAccent }))] }))] }));
};
// ============================================================
// LIST / DEFAULT CONTENT
// ============================================================
const ListContent = ({ title, items = [], points = [], frame, fps, pointsStart, pointStagger }) => {
    const titleP = (0, remotion_1.spring)({
        frame: frame - pointsStart + 10,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    const allItems = items.length > 0
        ? items
        : points.map((p, i) => ({ icon: `${i + 1}`, title: p, desc: undefined }));
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 18,
            width: '100%',
        }, children: [title && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 44,
                    fontWeight: 700,
                    color: C.text,
                    textAlign: 'left',
                    opacity: titleP,
                    transform: `translateX(${(0, remotion_1.interpolate)(titleP, [0, 1], [-24, 0])}px)`,
                    marginBottom: 8,
                }, children: title })), allItems.map((item, i) => {
                const itemStart = pointsStart + i * pointStagger;
                const itemP = (0, remotion_1.spring)({
                    frame: frame - itemStart,
                    fps,
                    config: { damping: 16, stiffness: 90 },
                });
                const itemOpacity = (0, remotion_1.interpolate)(itemP, [0, 1], [0, 1]);
                const itemX = (0, remotion_1.interpolate)(itemP, [0, 1], [30, 0]);
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 18,
                        opacity: itemOpacity,
                        transform: `translateX(${itemX}px)`,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 48,
                                height: 48,
                                flexShrink: 0,
                                background: C.surfaceAlt,
                                border: `1px solid ${C.borderChip}`,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                                color: C.chipText,
                                fontWeight: 700,
                            }, children: item.icon }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 30,
                                        fontWeight: 600,
                                        color: C.white,
                                        lineHeight: 1.3,
                                        marginBottom: item.desc ? 4 : 0,
                                    }, children: item.title }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 22,
                                        fontWeight: 400,
                                        color: C.muted,
                                        lineHeight: 1.4,
                                    }, children: item.desc }))] })] }, i));
            })] }));
};
// ============================================================
// COMPARE CONTENT
// ============================================================
const CompareContent = ({ left, right, vsText = 'VS', frame, fps, pointsStart, pointStagger }) => {
    const leftP = (0, remotion_1.spring)({
        frame: frame - pointsStart,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    const vsP = (0, remotion_1.spring)({
        frame: frame - pointsStart - pointStagger,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    const rightP = (0, remotion_1.spring)({
        frame: frame - pointsStart - pointStagger * 2,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    const panelStyle = (tint, p) => ({
        width: '100%',
        background: tint === 'blue'
            ? 'rgba(74,159,213,0.08)'
            : 'rgba(245,130,31,0.08)',
        border: `1px solid ${tint === 'blue' ? 'rgba(74,159,213,0.3)' : 'rgba(245,130,31,0.3)'}`,
        borderRadius: 16,
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: (0, remotion_1.interpolate)(p, [0, 1], [0, 1]),
        transform: `translateY(${(0, remotion_1.interpolate)(p, [0, 1], [32, 0])}px)`,
    });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 0,
            width: '100%',
        }, children: [left && ((0, jsx_runtime_1.jsxs)("div", { style: panelStyle('blue', leftP), children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 24,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            marginBottom: 4,
                            ...blueGradient,
                        }, children: left.label }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 52,
                            fontWeight: 900,
                            color: C.white,
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                        }, children: left.value }), left.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: C.muted, lineHeight: 1.4 }, children: left.desc })), left.points && left.points.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }, children: left.points.map((pt, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 22, color: C.text, lineHeight: 1.4 }, children: ["\u2022 ", pt] }, i))) }))] })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    paddingLeft: 24,
                    paddingRight: 24,
                    marginTop: 8,
                    marginBottom: 8,
                    opacity: (0, remotion_1.interpolate)(vsP, [0, 1], [0, 1]),
                    transform: `scale(${(0, remotion_1.interpolate)(vsP, [0, 1], [0.7, 1])})`,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { flex: 1, height: 1, background: C.divider } }), (0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: 28,
                            fontWeight: 900,
                            letterSpacing: '0.12em',
                            ...blueGradient,
                        }, children: vsText }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, height: 1, background: C.divider } })] }), right && ((0, jsx_runtime_1.jsxs)("div", { style: panelStyle('orange', rightP), children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 24,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            color: C.orange,
                            marginBottom: 4,
                        }, children: right.label }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 52,
                            fontWeight: 900,
                            color: C.white,
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                        }, children: right.value }), right.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: C.muted, lineHeight: 1.4 }, children: right.desc })), right.points && right.points.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }, children: right.points.map((pt, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 22, color: C.text, lineHeight: 1.4 }, children: ["\u2022 ", pt] }, i))) }))] }))] }));
};
// ============================================================
// STEPS CONTENT
// ============================================================
const StepsContent = ({ steps = [], frame, fps, pointsStart, pointStagger }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 0,
            width: '100%',
            position: 'relative',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: 38,
                    top: 24,
                    bottom: 24,
                    width: 2,
                    background: C.divider,
                    zIndex: 0,
                } }), steps.map((step, i) => {
                const stepStart = pointsStart + i * pointStagger;
                const stepP = (0, remotion_1.spring)({
                    frame: frame - stepStart,
                    fps,
                    config: { damping: 16, stiffness: 85 },
                });
                const stepOpacity = (0, remotion_1.interpolate)(stepP, [0, 1], [0, 1]);
                const stepX = (0, remotion_1.interpolate)(stepP, [0, 1], [40, 0]);
                const numStr = String(i + 1).padStart(2, '0');
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 24,
                        paddingBottom: i < steps.length - 1 ? 32 : 0,
                        opacity: stepOpacity,
                        transform: `translateX(${stepX}px)`,
                        position: 'relative',
                        zIndex: 1,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 52,
                                height: 52,
                                flexShrink: 0,
                                background: C.bgAlt,
                                border: `2px solid ${C.blue1}`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                                    fontSize: 20,
                                    fontWeight: 900,
                                    letterSpacing: '-0.02em',
                                    ...blueGradient,
                                }, children: numStr }) }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, minWidth: 0, paddingTop: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: C.white,
                                        lineHeight: 1.25,
                                        marginBottom: step.description ? 8 : 0,
                                    }, children: step.title }), step.description && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 24,
                                        fontWeight: 400,
                                        color: C.muted,
                                        lineHeight: 1.45,
                                    }, children: step.description }))] })] }, i));
            })] }));
};
// ============================================================
// CHART CONTENT
// ============================================================
const ChartContent = ({ bars = [], frame, fps, pointsStart, pointStagger }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 28,
            width: '100%',
        }, children: bars.map((bar, i) => {
            var _a;
            const barStart = pointsStart + i * pointStagger;
            const barP = (0, remotion_1.spring)({
                frame: frame - barStart,
                fps,
                config: { damping: 18, stiffness: 70 },
            });
            const rowOpacity = (0, remotion_1.interpolate)(barP, [0, 1], [0, 1]);
            const rowY = (0, remotion_1.interpolate)(barP, [0, 1], [20, 0]);
            const fillWidth = (0, remotion_1.interpolate)(barP, [0, 1], [0, Math.min(100, Math.max(0, bar.value))]);
            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    opacity: rowOpacity,
                    transform: `translateY(${rowY}px)`,
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 26, fontWeight: 600, color: C.white }, children: bar.label }), (0, jsx_runtime_1.jsxs)("span", { style: {
                                    fontSize: 26,
                                    fontWeight: 700,
                                    ...blueGradient,
                                }, children: [bar.value, "%"] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            width: '100%',
                            height: 16,
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 999,
                            overflow: 'hidden',
                        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                width: `${fillWidth}%`,
                                height: '100%',
                                background: (_a = bar.color) !== null && _a !== void 0 ? _a : 'linear-gradient(90deg, #4a9fd5, #87ceeb)',
                                borderRadius: 999,
                            } }) })] }, i));
        }) }));
};
// ============================================================
// TIMELINE CONTENT
// ============================================================
const TimelineContent = ({ timeline = [], frame, fps, pointsStart, pointStagger }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 0,
            width: '100%',
            position: 'relative',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: 70,
                    top: 12,
                    bottom: 12,
                    width: 2,
                    background: C.divider,
                    zIndex: 0,
                } }), timeline.map((item, i) => {
                const itemStart = pointsStart + i * pointStagger;
                const itemP = (0, remotion_1.spring)({
                    frame: frame - itemStart,
                    fps,
                    config: { damping: 16, stiffness: 85 },
                });
                const itemOpacity = (0, remotion_1.interpolate)(itemP, [0, 1], [0, 1]);
                const itemX = (0, remotion_1.interpolate)(itemP, [0, 1], [50, 0]);
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 0,
                        paddingBottom: i < timeline.length - 1 ? 36 : 0,
                        position: 'relative',
                        zIndex: 1,
                        opacity: itemOpacity,
                        transform: `translateX(${itemX}px)`,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 70,
                                flexShrink: 0,
                                paddingTop: 2,
                                fontSize: 22,
                                fontWeight: 800,
                                lineHeight: 1,
                                ...blueGradient,
                            }, children: item.year }), (0, jsx_runtime_1.jsx)("div", { style: {
                                width: 14,
                                height: 14,
                                flexShrink: 0,
                                marginTop: 4,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${C.blue1}, ${C.blue2})`,
                                boxShadow: `0 0 8px rgba(74,159,213,0.6)`,
                                marginRight: 20,
                            } }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 30,
                                        fontWeight: 700,
                                        color: C.white,
                                        lineHeight: 1.25,
                                        marginBottom: item.description ? 6 : 0,
                                    }, children: item.title }), item.description && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 22,
                                        fontWeight: 400,
                                        color: C.muted,
                                        lineHeight: 1.45,
                                    }, children: item.description }))] })] }, i));
            })] }));
};
// ============================================================
// HIGHLIGHT CONTENT
// ============================================================
const HighlightContent = ({ keywords = [], frame, fps, pointsStart, pointStagger }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            width: '100%',
        }, children: keywords.map((kw, i) => {
            const kwStart = pointsStart + i * pointStagger;
            const kwP = (0, remotion_1.spring)({
                frame: frame - kwStart,
                fps,
                config: { damping: 14, stiffness: 110 },
            });
            const kwOpacity = (0, remotion_1.interpolate)(kwP, [0, 1], [0, 1]);
            const kwScale = (0, remotion_1.interpolate)(kwP, [0, 1], [0.6, 1]);
            const isOrange = i % 3 === 2;
            return ((0, jsx_runtime_1.jsx)("span", { style: {
                    fontSize: 28,
                    fontWeight: 600,
                    color: isOrange ? C.orange : C.chipText,
                    border: `1px solid ${isOrange ? 'rgba(245,130,31,0.4)' : C.borderChip}`,
                    borderRadius: 999,
                    padding: '10px 24px',
                    letterSpacing: '0.02em',
                    lineHeight: 1,
                    boxShadow: isOrange
                        ? '0 0 14px rgba(245,130,31,0.15)'
                        : '0 0 14px rgba(74,159,213,0.15)',
                    opacity: kwOpacity,
                    transform: `scale(${kwScale})`,
                }, children: kw }, i));
        }) }));
};
// ============================================================
// QUOTE CONTENT
// ============================================================
const QuoteContent = ({ quote, author, contentProgress, frame, fps, pointsStart }) => {
    const authorP = (0, remotion_1.spring)({
        frame: frame - pointsStart - 12,
        fps,
        config: { damping: 16, stiffness: 80 },
    });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            width: '100%',
            background: C.surface,
            border: `1px solid rgba(74,159,213,0.25)`,
            borderRadius: 20,
            padding: '48px 48px',
            boxShadow: '0 0 40px rgba(74,159,213,0.08)',
            opacity: (0, remotion_1.interpolate)(contentProgress, [0, 1], [0, 1]),
            transform: `scale(${(0, remotion_1.interpolate)(contentProgress, [0, 1], [0.92, 1])})`,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 96,
                    fontWeight: 900,
                    lineHeight: 0.6,
                    color: 'rgba(74,159,213,0.25)',
                    alignSelf: 'flex-start',
                    marginBottom: 8,
                    fontFamily: 'Georgia, serif',
                }, children: "\"" }), quote && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 36,
                    fontWeight: 500,
                    color: C.white,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                }, children: quote })), author && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    fontSize: 24,
                    fontWeight: 600,
                    color: C.chipText,
                    textAlign: 'center',
                    letterSpacing: '0.04em',
                    opacity: (0, remotion_1.interpolate)(authorP, [0, 1], [0, 1]),
                    transform: `translateY(${(0, remotion_1.interpolate)(authorP, [0, 1], [12, 0])}px)`,
                }, children: ["\u2014 ", author] }))] }));
};
// ============================================================
// CTA CONTENT
// ============================================================
const CtaContent = ({ cta, items = [], contentProgress, frame, fps, pointsStart, pointStagger }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            width: '100%',
            position: 'relative',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    height: 300,
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(74,159,213,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), cta && ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 52,
                    fontWeight: 900,
                    color: C.white,
                    textAlign: 'center',
                    lineHeight: 1.25,
                    letterSpacing: '-0.02em',
                    opacity: (0, remotion_1.interpolate)(contentProgress, [0, 1], [0, 1]),
                    transform: `scale(${(0, remotion_1.interpolate)(contentProgress, [0, 1], [0.85, 1])})`,
                    position: 'relative',
                }, children: cta })), items.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 14,
                }, children: items.map((item, i) => {
                    const chipStart = pointsStart + i * pointStagger;
                    const chipP = (0, remotion_1.spring)({
                        frame: frame - chipStart,
                        fps,
                        config: { damping: 14, stiffness: 100 },
                    });
                    return ((0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: 26,
                            fontWeight: 600,
                            color: C.chipText,
                            border: `1px solid ${C.borderChip}`,
                            borderRadius: 999,
                            padding: '10px 24px',
                            lineHeight: 1,
                            opacity: (0, remotion_1.interpolate)(chipP, [0, 1], [0, 1]),
                            transform: `translateY(${(0, remotion_1.interpolate)(chipP, [0, 1], [16, 0])}px)`,
                        }, children: item }, i));
                }) }))] }));
};
// ============================================================
// MAIN PROJECT SLIDE COMPONENT
// ============================================================
const ProjectSlide = ({ type = 'default', title, subtitle, data, points = [], durationInFrames, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const brand = (0, react_1.useMemo)(() => {
        var _a;
        return ({
            name: title !== null && title !== void 0 ? title : 'Project',
            badge: undefined,
            tagline: subtitle,
            chips: [],
            attribution: undefined,
            ...((_a = data === null || data === void 0 ? void 0 : data.brand) !== null && _a !== void 0 ? _a : {}),
        });
    }, [data === null || data === void 0 ? void 0 : data.brand, title, subtitle]);
    // Determine point count for timing
    const pointCount = (0, react_1.useMemo)(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (type === 'problems')
            return ((_b = (_a = data === null || data === void 0 ? void 0 : data.problems) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + 1;
        if (type === 'stats')
            return 3;
        if (type === 'list' || type === 'default') {
            return ((_d = (_c = data === null || data === void 0 ? void 0 : data.items) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) || points.length;
        }
        if (type === 'compare')
            return 2;
        if (type === 'steps')
            return (_f = (_e = data === null || data === void 0 ? void 0 : data.steps) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 1;
        if (type === 'chart')
            return (_h = (_g = data === null || data === void 0 ? void 0 : data.bars) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 1;
        if (type === 'timeline')
            return (_k = (_j = data === null || data === void 0 ? void 0 : data.timeline) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 1;
        if (type === 'highlight')
            return ((_o = (_l = data === null || data === void 0 ? void 0 : data.keywords) !== null && _l !== void 0 ? _l : (_m = data === null || data === void 0 ? void 0 : data.items) === null || _m === void 0 ? void 0 : _m.map(i => i.title)) !== null && _o !== void 0 ? _o : []).length;
        if (type === 'quote' || type === 'cta')
            return 1;
        return 1;
    }, [type, data, points]);
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, pointCount);
    // Header entry (slides from top)
    const headerP = (0, remotion_1.spring)({
        frame: frame - 0,
        fps,
        config: { damping: 18, stiffness: 90 },
    });
    // Footer entry (slides from bottom)
    const footerP = (0, remotion_1.spring)({
        frame: frame - 4,
        fps,
        config: { damping: 18, stiffness: 90 },
    });
    // Content area entry
    const contentP = (0, remotion_1.spring)({
        frame: frame - timing.titleStart,
        fps,
        config: { damping: 16, stiffness: 80 },
    });
    const renderContent = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        switch (type) {
            case 'hero':
                return ((0, jsx_runtime_1.jsx)(HeroContent, { brandName: brand.name, subtitleLines: (_b = (_a = data === null || data === void 0 ? void 0 : data.subtitleLines) !== null && _a !== void 0 ? _a : (subtitle ? [subtitle] : undefined)) !== null && _b !== void 0 ? _b : (title ? [title] : undefined), contentProgress: contentP, durationInFrames: durationInFrames }));
            case 'problems':
                return ((0, jsx_runtime_1.jsx)(ProblemsContent, { title: (_c = data === null || data === void 0 ? void 0 : data.problemsTitle) !== null && _c !== void 0 ? _c : title, problems: (_d = data === null || data === void 0 ? void 0 : data.problems) !== null && _d !== void 0 ? _d : points.map((p) => {
                        const sep = p.indexOf('：') !== -1 ? '：' : p.indexOf(':') !== -1 ? ':' : null;
                        if (sep) {
                            const idx = p.indexOf(sep);
                            return { icon: '⚡', title: p.slice(0, idx).trim(), desc: p.slice(idx + 1).trim() };
                        }
                        return { icon: '⚡', title: p };
                    }), frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 10 }));
            case 'stats':
                return ((0, jsx_runtime_1.jsx)(StatsContent, { countPrefix: data === null || data === void 0 ? void 0 : data.countPrefix, countValue: data === null || data === void 0 ? void 0 : data.countValue, countSuffix: data === null || data === void 0 ? void 0 : data.countSuffix, badges: (_e = data === null || data === void 0 ? void 0 : data.badges) !== null && _e !== void 0 ? _e : points.slice(0, 4), highlight: (_f = data === null || data === void 0 ? void 0 : data.highlight) !== null && _f !== void 0 ? _f : subtitle, highlightAccent: data === null || data === void 0 ? void 0 : data.highlightAccent, frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 12 }));
            case 'compare':
                if ((data === null || data === void 0 ? void 0 : data.left) || (data === null || data === void 0 ? void 0 : data.right)) {
                    return ((0, jsx_runtime_1.jsx)(CompareContent, { left: data === null || data === void 0 ? void 0 : data.left, right: data === null || data === void 0 ? void 0 : data.right, vsText: data === null || data === void 0 ? void 0 : data.vsText, frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 12 }));
                }
                // fall through to list when compare data is absent
                return ((0, jsx_runtime_1.jsx)(ListContent, { title: title, items: data === null || data === void 0 ? void 0 : data.items, points: (_g = data === null || data === void 0 ? void 0 : data.points) !== null && _g !== void 0 ? _g : points, frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 10 }));
            case 'steps':
                return ((0, jsx_runtime_1.jsx)(StepsContent, { steps: (_h = data === null || data === void 0 ? void 0 : data.steps) !== null && _h !== void 0 ? _h : points.map((p) => {
                        const sep = p.indexOf('：') !== -1 ? '：' : p.indexOf(':') !== -1 ? ':' : null;
                        if (sep) {
                            const idx = p.indexOf(sep);
                            return { title: p.slice(0, idx).trim(), description: p.slice(idx + 1).trim() };
                        }
                        return { title: p };
                    }), frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 10 }));
            case 'chart':
                return ((0, jsx_runtime_1.jsx)(ChartContent, { bars: (_j = data === null || data === void 0 ? void 0 : data.bars) !== null && _j !== void 0 ? _j : points.map((p, i) => ({
                        label: p,
                        value: Math.round(80 - i * (60 / Math.max(points.length - 1, 1))),
                    })), frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 10 }));
            case 'timeline':
                return ((0, jsx_runtime_1.jsx)(TimelineContent, { timeline: (_k = data === null || data === void 0 ? void 0 : data.timeline) !== null && _k !== void 0 ? _k : points.map((p, i) => {
                        const sep = p.indexOf('：') !== -1 ? '：' : p.indexOf(':') !== -1 ? ':' : null;
                        if (sep) {
                            const idx = p.indexOf(sep);
                            return { year: p.slice(0, idx).trim(), title: p.slice(idx + 1).trim() };
                        }
                        return { year: String(i + 1), title: p };
                    }), frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 12 }));
            case 'highlight':
                return ((0, jsx_runtime_1.jsx)(HighlightContent, { keywords: (_o = (_l = data === null || data === void 0 ? void 0 : data.keywords) !== null && _l !== void 0 ? _l : (_m = data === null || data === void 0 ? void 0 : data.items) === null || _m === void 0 ? void 0 : _m.map(i => i.title)) !== null && _o !== void 0 ? _o : points, frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 8 }));
            case 'quote':
                return ((0, jsx_runtime_1.jsx)(QuoteContent, { quote: (_q = (_p = data === null || data === void 0 ? void 0 : data.quote) !== null && _p !== void 0 ? _p : subtitle) !== null && _q !== void 0 ? _q : points[0], author: data === null || data === void 0 ? void 0 : data.author, contentProgress: contentP, frame: frame, fps: fps, pointsStart: timing.pointsStart }));
            case 'cta':
                return ((0, jsx_runtime_1.jsx)(CtaContent, { cta: (_r = data === null || data === void 0 ? void 0 : data.cta) !== null && _r !== void 0 ? _r : title, items: (_u = (_t = (_s = data === null || data === void 0 ? void 0 : data.items) === null || _s === void 0 ? void 0 : _s.map(i => i.title)) !== null && _t !== void 0 ? _t : data === null || data === void 0 ? void 0 : data.points) !== null && _u !== void 0 ? _u : points, contentProgress: contentP, frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 8 }));
            case 'list':
            default:
                return ((0, jsx_runtime_1.jsx)(ListContent, { title: title, items: data === null || data === void 0 ? void 0 : data.items, points: (_v = data === null || data === void 0 ? void 0 : data.points) !== null && _v !== void 0 ? _v : points, frame: frame, fps: fps, pointsStart: timing.pointsStart, pointStagger: timing.pointStagger || 10 }));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bgAlt} 100%)`,
            fontFamily: "'SF Pro Display', 'PingFang SC', 'Noto Sans SC', sans-serif",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: '10%',
                    right: '10%',
                    height: 300,
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(74,159,213,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                } }), (0, jsx_runtime_1.jsx)(PersistentHeader, { brand: brand, entryProgress: headerP }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: 380,
                    bottom: 380,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 72px',
                }, children: renderContent() }), (0, jsx_runtime_1.jsx)(PersistentFooter, { brand: brand, entryProgress: footerP })] }));
};
exports.ProjectSlide = ProjectSlide;
