"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const react_1 = require("react");
const animationTiming_1 = require("../templates/animationTiming");
// ============================================================
// THEME COLORS
// ============================================================
const C = {
    bg: '#07070f',
    gold: '#f5a623',
    goldBright: '#fdd366',
    purple: '#a78bfa',
    purpleDim: '#7c5cbf',
    white: '#ffffff',
    whiteDim: 'rgba(255,255,255,0.88)',
    muted: '#8a94b0',
    mutedDark: '#4e5878',
    surface: 'rgba(255,255,255,0.05)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.07)',
    borderGold: 'rgba(245,166,35,0.25)',
    borderPurple: 'rgba(167,139,250,0.25)',
    glowGold: 'rgba(245,166,35,0.18)',
    glowPurple: 'rgba(167,139,250,0.15)',
};
// ============================================================
// STAR FIELD
// ============================================================
const StarField = () => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const stars = (0, react_1.useMemo)(() => {
        return Array.from({ length: 88 }, (_, i) => {
            // Deterministic pseudo-random positions
            const x = ((i * 1597 + 31337) % 9973) / 9973;
            const y = ((i * 9871 + 12345) % 9769) / 9769;
            const phase = ((i * 3571 + 54321) % 6283) / 1000; // 0..2π
            const speed = 0.02 + ((i * 137) % 100) / 1000; // 0.02..0.12
            const size = 1 + ((i * 7) % 3) * 0.6; // 1, 1.6, 2.2
            const baseOpacity = 0.15 + ((i * 11) % 60) / 100; // 0.15..0.75
            return { x, y, phase, speed, size, baseOpacity };
        });
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, overflow: 'hidden' }, children: stars.map((star, i) => {
            const twinkle = (Math.sin(frame * star.speed + star.phase) + 1) / 2;
            const opacity = star.baseOpacity * (0.5 + twinkle * 0.5);
            return ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: `${star.x * 100}%`,
                    top: `${star.y * 100}%`,
                    width: star.size,
                    height: star.size,
                    borderRadius: '50%',
                    background: 'white',
                    opacity,
                } }, i));
        }) }));
};
// ============================================================
// NEBULA GLOW — subtle colored radial gradients in bg
// ============================================================
const NebulaGlow = () => ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', inset: 0, overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                position: 'absolute',
                top: '-10%', left: '-15%',
                width: '70%', height: '50%',
                background: 'radial-gradient(ellipse, rgba(120,80,200,0.12) 0%, transparent 65%)',
            } }), (0, jsx_runtime_1.jsx)("div", { style: {
                position: 'absolute',
                bottom: '-5%', right: '-10%',
                width: '60%', height: '45%',
                background: 'radial-gradient(ellipse, rgba(200,130,30,0.08) 0%, transparent 65%)',
            } }), (0, jsx_runtime_1.jsx)("div", { style: {
                position: 'absolute',
                top: '30%', left: '20%',
                width: '60%', height: '40%',
                background: 'radial-gradient(ellipse, rgba(80,60,160,0.06) 0%, transparent 70%)',
            } })] }));
const AnimatedStat = ({ numericValue, decimals = 0, suffix = '', displayValue, label, startFrame, color, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({
        frame: frame - startFrame,
        fps,
        config: { damping: 22, stiffness: 48 },
    });
    const fadeIn = (0, remotion_1.interpolate)(Math.min(progress * 3, 1), [0, 1], [0, 1]);
    let display;
    if (numericValue !== undefined) {
        const val = (0, remotion_1.interpolate)(progress, [0, 1], [0, numericValue]);
        display = decimals > 0
            ? val.toFixed(decimals) + suffix
            : Math.round(val).toLocaleString() + suffix;
    }
    else {
        display = displayValue || '';
    }
    const statColor = color || C.gold;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            opacity: fadeIn,
            transform: `translateY(${(0, remotion_1.interpolate)(fadeIn, [0, 1], [24, 0])}px)`,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 76,
                    fontWeight: 800,
                    color: statColor,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    textShadow: `0 0 48px ${statColor}55`,
                }, children: display }), (0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 22,
                    color: C.muted,
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                    textAlign: 'center',
                }, children: label })] }));
};
// ============================================================
// DIVIDER LINE
// ============================================================
const Divider = ({ progress, color = C.gold, }) => ((0, jsx_runtime_1.jsx)("div", { style: {
        width: `${(0, remotion_1.interpolate)(progress, [0, 1], [0, 120])}px`,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        borderRadius: 2,
        boxShadow: `0 0 16px ${color}60`,
        margin: '0 auto',
    } }));
const HeroLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a, _b, _c;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, ((_b = (_a = data === null || data === void 0 ? void 0 : data.stats) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + 1);
    const badge = data === null || data === void 0 ? void 0 : data.badge;
    const accentWord = data === null || data === void 0 ? void 0 : data.accentWord;
    const stats = (_c = data === null || data === void 0 ? void 0 : data.stats) !== null && _c !== void 0 ? _c : [];
    const badgeP = (0, remotion_1.spring)({ frame: frame - 4, fps, config: { damping: 18, stiffness: 85 } });
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subtitleP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const dividerP = (0, remotion_1.spring)({ frame: frame - timing.lineStart, fps, config: { damping: 18, stiffness: 80 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [badge && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: badgeP,
                    transform: `translateY(${(0, remotion_1.interpolate)(badgeP, [0, 1], [16, 0])}px)`,
                    marginBottom: 44,
                }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                        fontSize: 19,
                        fontWeight: 600,
                        color: C.gold,
                        letterSpacing: '0.25em',
                        fontFamily: "'Courier New', 'SF Mono', monospace",
                    }, children: badge }) })), accentWord && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `scale(${0.88 + titleP * 0.12})`,
                    marginBottom: 4,
                    textAlign: 'center',
                }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                        fontSize: 144,
                        fontWeight: 900,
                        color: C.purple,
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        display: 'block',
                        textShadow: `0 0 80px ${C.purple}60`,
                    }, children: accentWord }) })), (0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [24, 0])}px)`,
                    textAlign: 'center',
                    marginBottom: 28,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 80,
                        fontWeight: 800,
                        color: C.white,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'pre-line',
                    }, children: title }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 28 }, children: (0, jsx_runtime_1.jsx)(Divider, { progress: dividerP }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subtitleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subtitleP, [0, 1], [16, 0])}px)`,
                    marginBottom: stats.length > 0 ? 64 : 0,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 34,
                        color: C.muted,
                        textAlign: 'center',
                        letterSpacing: '0.01em',
                        lineHeight: 1.5,
                        maxWidth: 860,
                    }, children: subtitle }) })), stats.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: 0,
                }, children: stats.map((stat, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'stretch' }, children: [i > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                width: 1,
                                background: C.border,
                                margin: '8px 40px',
                                alignSelf: 'stretch',
                            } })), (0, jsx_runtime_1.jsx)(AnimatedStat, { ...stat, startFrame: timing.pointsStart + i * 10 })] }, i))) }))] }));
};
const StatsLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const stats = (_a = data === null || data === void 0 ? void 0 : data.stats) !== null && _a !== void 0 ? _a : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, stats.length);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`,
                    marginBottom: 12,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 60, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subP, [0, 1], [16, 0])}px)`,
                    marginBottom: 48,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: stats.length <= 2 ? '1fr 1fr' : stats.length === 4 ? '1fr 1fr' : '1fr 1fr 1fr',
                    gap: 32,
                    alignContent: 'center',
                }, children: stats.map((stat, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 18, stiffness: 70 },
                    });
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            background: C.surface,
                            border: `1px solid ${stat.color ? stat.color + '33' : C.borderGold}`,
                            borderRadius: 24,
                            padding: '36px 32px',
                            opacity: p,
                            transform: `translateY(${(0, remotion_1.interpolate)(p, [0, 1], [32, 0])}px) scale(${0.95 + p * 0.05})`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 12,
                        }, children: [(0, jsx_runtime_1.jsx)(AnimatedStat, { ...stat, startFrame: timing.pointsStart + i * timing.pointStagger }), stat.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, color: C.mutedDark, textAlign: 'center', marginTop: -4 }, children: stat.desc }))] }, i));
                }) })] }));
};
const ListLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const items = (_a = data === null || data === void 0 ? void 0 : data.items) !== null && _a !== void 0 ? _a : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, items.length);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const accentColors = [C.gold, C.purple, '#22d3ee', '#f472b6', '#34d399'];
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`,
                    marginBottom: 8,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 62, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.15 }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subP, [0, 1], [14, 0])}px)`,
                    marginBottom: 40,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }, children: items.map((item, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 18, stiffness: 80 },
                    });
                    const accent = item.color || accentColors[i % accentColors.length];
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 24,
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderLeft: `3px solid ${accent}`,
                            borderRadius: 20,
                            padding: '24px 32px',
                            opacity: p,
                            transform: `translateX(${(0, remotion_1.interpolate)(p, [0, 1], [-40, 0])}px)`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: 52,
                                    height: 52,
                                    borderRadius: '50%',
                                    background: accent + '18',
                                    border: `1px solid ${accent}44`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: item.icon ? 28 : 24,
                                    fontWeight: 700,
                                    color: accent,
                                    flexShrink: 0,
                                }, children: item.icon || (i + 1) }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 34, fontWeight: 700, color: C.whiteDim, lineHeight: 1.2 }, children: item.text }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: C.muted, marginTop: 4 }, children: item.desc }))] })] }, i));
                }) })] }));
};
const StepsLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const steps = (_a = data === null || data === void 0 ? void 0 : data.steps) !== null && _a !== void 0 ? _a : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, steps.length);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`,
                    marginBottom: 8,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 62, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    marginBottom: 40,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }, children: steps.map((step, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 18, stiffness: 80 },
                    });
                    const isLast = i === steps.length - 1;
                    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 24, opacity: p, transform: `translateY(${(0, remotion_1.interpolate)(p, [0, 1], [28, 0])}px)` }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 52, height: 52,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 22, fontWeight: 800, color: C.bg,
                                            boxShadow: `0 4px 24px ${C.gold}40`,
                                            flexShrink: 0,
                                        }, children: step.icon || (i + 1) }), !isLast && ((0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 2,
                                            flex: 1,
                                            background: `linear-gradient(180deg, ${C.gold}60, transparent)`,
                                            marginTop: 4,
                                            marginBottom: 4,
                                            minHeight: 24,
                                        } }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, paddingBottom: isLast ? 0 : 28 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1.2, marginBottom: 6 }, children: step.title }), step.description && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: C.muted, lineHeight: 1.4 }, children: step.description }))] })] }, i));
                }) })] }));
};
const CompareLayout = ({ title, subtitle, data, durationInFrames }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, 2);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const leftP = (0, remotion_1.spring)({ frame: frame - timing.pointsStart, fps, config: { damping: 18, stiffness: 75 } });
    const rightP = (0, remotion_1.spring)({ frame: frame - (timing.pointsStart + 10), fps, config: { damping: 18, stiffness: 75 } });
    const vsP = (0, remotion_1.spring)({ frame: frame - (timing.pointsStart + 5), fps, config: { damping: 20, stiffness: 90 } });
    const left = data === null || data === void 0 ? void 0 : data.left;
    const right = data === null || data === void 0 ? void 0 : data.right;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { opacity: titleP, transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`, marginBottom: 8 }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 62, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: { opacity: subP, marginBottom: 40 }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 32, marginTop: 16 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            flex: 1,
                            background: C.surface,
                            border: `1px solid ${(left === null || left === void 0 ? void 0 : left.color) ? left.color + '44' : C.mutedDark + '44'}`,
                            borderRadius: 28,
                            padding: '44px 36px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                            opacity: leftP,
                            transform: `translateX(${(0, remotion_1.interpolate)(leftP, [0, 1], [-50, 0])}px)`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: (left === null || left === void 0 ? void 0 : left.color) || C.mutedDark, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }, children: left === null || left === void 0 ? void 0 : left.label }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 72, fontWeight: 900, color: (left === null || left === void 0 ? void 0 : left.color) || C.mutedDark, lineHeight: 1, letterSpacing: '-0.02em' }, children: left === null || left === void 0 ? void 0 : left.value }), (left === null || left === void 0 ? void 0 : left.desc) && (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: C.muted, textAlign: 'center' }, children: left.desc })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            opacity: vsP,
                            transform: `scale(${0.6 + vsP * 0.4})`,
                            fontSize: 44, fontWeight: 900, color: C.purple,
                            textShadow: `0 0 30px ${C.purple}80`,
                            flexShrink: 0,
                        }, children: (data === null || data === void 0 ? void 0 : data.vsText) || 'VS' }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            flex: 1,
                            background: `linear-gradient(135deg, ${C.glowGold}, ${C.surface})`,
                            border: `1px solid ${(right === null || right === void 0 ? void 0 : right.color) ? right.color + '55' : C.borderGold}`,
                            borderRadius: 28,
                            padding: '44px 36px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                            opacity: rightP,
                            transform: `translateX(${(0, remotion_1.interpolate)(rightP, [0, 1], [50, 0])}px)`,
                            boxShadow: `0 0 60px ${C.gold}1a`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: (right === null || right === void 0 ? void 0 : right.color) || C.gold, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }, children: right === null || right === void 0 ? void 0 : right.label }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 72, fontWeight: 900, color: (right === null || right === void 0 ? void 0 : right.color) || C.gold, lineHeight: 1, letterSpacing: '-0.02em', textShadow: `0 0 40px ${C.gold}55` }, children: right === null || right === void 0 ? void 0 : right.value }), (right === null || right === void 0 ? void 0 : right.desc) && (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, color: C.muted, textAlign: 'center' }, children: right.desc })] })] })] }));
};
const QuoteLayout = ({ title, data, durationInFrames }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, 1);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const quoteP = (0, remotion_1.spring)({ frame: frame - timing.pointsStart, fps, config: { damping: 18, stiffness: 70 } });
    const authorP = (0, remotion_1.spring)({ frame: frame - (timing.pointsStart + 14), fps, config: { damping: 18, stiffness: 70 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: 180,
                    color: C.gold,
                    opacity: 0.12,
                    lineHeight: 1,
                    position: 'absolute',
                    top: 80,
                    left: 60,
                    fontFamily: 'Georgia, serif',
                    userSelect: 'none',
                }, children: "\"" }), (0, jsx_runtime_1.jsx)("div", { style: { opacity: titleP, transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`, marginBottom: 48 }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.gold, letterSpacing: '0.2em', fontWeight: 600, textAlign: 'center' }, children: title }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: quoteP,
                    transform: `translateY(${(0, remotion_1.interpolate)(quoteP, [0, 1], [30, 0])}px)`,
                    background: C.surface,
                    border: `1px solid ${C.borderGold}`,
                    borderRadius: 32,
                    padding: '52px 60px',
                    maxWidth: 900,
                    boxShadow: `0 0 80px ${C.gold}0f`,
                    marginBottom: 36,
                    position: 'relative',
                    zIndex: 1,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 42,
                        color: C.whiteDim,
                        lineHeight: 1.6,
                        textAlign: 'center',
                        fontWeight: 400,
                        letterSpacing: '0.01em',
                    }, children: (data === null || data === void 0 ? void 0 : data.quote) || '' }) }), (data === null || data === void 0 ? void 0 : data.author) && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    opacity: authorP,
                    transform: `translateY(${(0, remotion_1.interpolate)(authorP, [0, 1], [16, 0])}px)`,
                    display: 'flex', alignItems: 'center', gap: 16,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 32, height: 2, background: C.gold, borderRadius: 1 } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: C.gold, fontWeight: 600 }, children: data.author })] }))] }));
};
// ============================================================
// LAYOUT: DEFAULT (title + points)
// ============================================================
const DefaultLayout = ({ title, subtitle, points, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, (_a = points === null || points === void 0 ? void 0 : points.length) !== null && _a !== void 0 ? _a : 0);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const lineP = (0, remotion_1.spring)({ frame: frame - timing.lineStart, fps, config: { damping: 18, stiffness: 80 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { opacity: titleP, transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [24, 0])}px)`, marginBottom: 16 }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 68, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.2 }, children: title }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 28 }, children: (0, jsx_runtime_1.jsx)(Divider, { progress: lineP }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: { opacity: subP, marginBottom: 36 }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, color: C.muted, lineHeight: 1.5 }, children: subtitle }) })), points && ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }, children: points.map((point, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 18, stiffness: 80 },
                    });
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex', alignItems: 'flex-start', gap: 20,
                            opacity: p,
                            transform: `translateX(${(0, remotion_1.interpolate)(p, [0, 1], [-28, 0])}px)`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: i % 2 === 0 ? C.gold : C.purple,
                                    marginTop: 16, flexShrink: 0,
                                    boxShadow: `0 0 10px ${i % 2 === 0 ? C.gold : C.purple}80`,
                                } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 34, color: C.whiteDim, lineHeight: 1.4, flex: 1 }, children: point })] }, i));
                }) }))] }));
};
const ChartLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const bars = (_a = data === null || data === void 0 ? void 0 : data.bars) !== null && _a !== void 0 ? _a : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, bars.length);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const barColors = [C.gold, C.purple, '#22d3ee', '#34d399'];
    const BAR_MAX_WIDTH = 820;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`,
                    marginBottom: 8,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 62,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #f5a623, #fdd366)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subP, [0, 1], [14, 0])}px)`,
                    marginBottom: 40,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 36, justifyContent: 'center' }, children: bars.map((bar, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * 10),
                        fps,
                        config: { damping: 20, stiffness: 70 },
                    });
                    const accent = bar.color || barColors[i % barColors.length];
                    const fillWidth = (0, remotion_1.interpolate)(p, [0, 1], [0, (bar.value / 100) * BAR_MAX_WIDTH]);
                    const fadeIn = (0, remotion_1.interpolate)(Math.min(p * 2, 1), [0, 1], [0, 1]);
                    return ((0, jsx_runtime_1.jsxs)("div", { style: { opacity: fadeIn }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: 12,
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 600, color: C.whiteDim }, children: bar.label }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 28, fontWeight: 700, color: accent }, children: [bar.value, "%"] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '100%',
                                    height: 20,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                        width: fillWidth,
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                                        borderRadius: 10,
                                        boxShadow: `0 0 18px ${accent}55`,
                                    } }) })] }, i));
                }) })] }));
};
const TimelineLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const items = (_a = data === null || data === void 0 ? void 0 : data.timeline) !== null && _a !== void 0 ? _a : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, items.length);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`,
                    marginBottom: 8,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 62,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #f5a623, #fdd366)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subP, [0, 1], [14, 0])}px)`,
                    marginBottom: 40,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }, children: items.map((item, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 18, stiffness: 75 },
                    });
                    const isLast = i === items.length - 1;
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            gap: 0,
                            opacity: p,
                            transform: `translateX(${(0, remotion_1.interpolate)(p, [0, 1], [40, 0])}px)`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: 120,
                                    flexShrink: 0,
                                    paddingTop: 8,
                                    paddingBottom: isLast ? 0 : 32,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    paddingRight: 0,
                                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: C.gold,
                                        letterSpacing: '-0.01em',
                                    }, children: item.year }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                    width: 52,
                                    flexShrink: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    paddingBottom: isLast ? 0 : 8,
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            background: C.gold,
                                            border: `2px solid ${C.goldBright}`,
                                            boxShadow: `0 0 14px ${C.gold}80`,
                                            marginTop: 8,
                                            flexShrink: 0,
                                        } }), !isLast && ((0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 2,
                                            flex: 1,
                                            background: `linear-gradient(180deg, ${C.gold}60, transparent)`,
                                            marginTop: 4,
                                            minHeight: 28,
                                        } }))] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                    flex: 1,
                                    paddingLeft: 20,
                                    paddingBottom: isLast ? 0 : 32,
                                    paddingTop: 4,
                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: 30,
                                            fontWeight: 700,
                                            color: C.white,
                                            lineHeight: 1.25,
                                            marginBottom: 6,
                                        }, children: item.title }), item.description && ((0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: 24,
                                            color: C.muted,
                                            lineHeight: 1.45,
                                        }, children: item.description }))] })] }, i));
                }) })] }));
};
const HighlightLayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a, _b;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const keywords = (_b = (_a = data === null || data === void 0 ? void 0 : data.keywords) !== null && _a !== void 0 ? _a : data === null || data === void 0 ? void 0 : data.items) !== null && _b !== void 0 ? _b : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, keywords.length);
    const titleP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const chipColors = [C.gold, C.purple, '#22d3ee', '#34d399'];
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: titleP,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleP, [0, 1], [20, 0])}px)`,
                    marginBottom: 8,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 62,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #f5a623, #fdd366)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }, children: title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subP, [0, 1], [14, 0])}px)`,
                    marginBottom: 40,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, color: C.muted }, children: subtitle }) })), (0, jsx_runtime_1.jsx)("div", { style: {
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 24,
                    alignContent: 'center',
                    alignItems: 'center',
                }, children: keywords.map((kw, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 20, stiffness: 85 },
                    });
                    const accent = chipColors[i % chipColors.length];
                    return ((0, jsx_runtime_1.jsx)("div", { style: {
                            opacity: p,
                            transform: `scale(${0.75 + p * 0.25})`,
                            background: accent + '14',
                            border: `1.5px solid ${accent}55`,
                            borderRadius: 40,
                            padding: '16px 36px',
                            boxShadow: `0 0 20px ${accent}22`,
                        }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                                fontSize: 30,
                                fontWeight: 700,
                                color: C.white,
                                letterSpacing: '0.01em',
                            }, children: kw }) }, i));
                }) })] }));
};
const CTALayout = ({ title, subtitle, data, durationInFrames }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const items = (_a = data === null || data === void 0 ? void 0 : data.items) !== null && _a !== void 0 ? _a : [];
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, items.length + 1);
    const badgeP = (0, remotion_1.spring)({ frame: frame - 4, fps, config: { damping: 18, stiffness: 85 } });
    const ctaP = (0, remotion_1.spring)({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 70 } });
    const subP = (0, remotion_1.spring)({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
    const chipColors = [C.gold, C.purple, '#22d3ee', '#34d399'];
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 64px',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: '35%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: `radial-gradient(ellipse, ${C.glowGold} 0%, transparent 65%)`,
                    pointerEvents: 'none',
                } }), (data === null || data === void 0 ? void 0 : data.badge) && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: badgeP,
                    transform: `translateY(${(0, remotion_1.interpolate)(badgeP, [0, 1], [16, 0])}px)`,
                    marginBottom: 40,
                    position: 'relative',
                    zIndex: 1,
                }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                        fontSize: 19,
                        fontWeight: 600,
                        color: C.muted,
                        letterSpacing: '0.2em',
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        padding: '8px 24px',
                    }, children: data.badge }) })), (0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: ctaP,
                    transform: `translateY(${(0, remotion_1.interpolate)(ctaP, [0, 1], [32, 0])}px) scale(${0.9 + ctaP * 0.1})`,
                    textAlign: 'center',
                    marginBottom: subtitle ? 28 : (items.length > 0 ? 52 : 0),
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 900,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        fontSize: 52,
                        fontWeight: 800,
                        color: C.white,
                        lineHeight: 1.25,
                        letterSpacing: '-0.02em',
                    }, children: (data === null || data === void 0 ? void 0 : data.cta) || title }) }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: {
                    opacity: subP,
                    transform: `translateY(${(0, remotion_1.interpolate)(subP, [0, 1], [16, 0])}px)`,
                    textAlign: 'center',
                    marginBottom: items.length > 0 ? 52 : 0,
                    position: 'relative',
                    zIndex: 1,
                }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, color: C.muted, lineHeight: 1.5 }, children: subtitle }) })), items.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 20,
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                }, children: items.map((item, i) => {
                    const p = (0, remotion_1.spring)({
                        frame: frame - (timing.pointsStart + i * timing.pointStagger),
                        fps,
                        config: { damping: 20, stiffness: 85 },
                    });
                    const accent = chipColors[i % chipColors.length];
                    return ((0, jsx_runtime_1.jsx)("div", { style: {
                            opacity: p,
                            transform: `scale(${0.8 + p * 0.2})`,
                            background: accent + '14',
                            border: `1px solid ${accent}44`,
                            borderRadius: 32,
                            padding: '12px 28px',
                        }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 24, fontWeight: 600, color: C.whiteDim }, children: item }) }, i));
                }) }))] }));
};
// ============================================================
// SLIDE PROGRESS INDICATOR
// ============================================================
const ProgressDots = ({ index, total }) => ((0, jsx_runtime_1.jsx)("div", { style: {
        position: 'absolute',
        bottom: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 10,
    }, children: Array.from({ length: total }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
            width: i === index ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === index ? C.gold : 'rgba(255,255,255,0.15)',
            transition: 'none',
            boxShadow: i === index ? `0 0 12px ${C.gold}80` : 'none',
        } }, i))) }));
const CosmosSlide = ({ title, subtitle, type, data, points, index, totalSlides, durationInFrames, }) => {
    const renderContent = () => {
        switch (type) {
            case 'hero':
                return ((0, jsx_runtime_1.jsx)(HeroLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'stats':
                return ((0, jsx_runtime_1.jsx)(StatsLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'list':
                return ((0, jsx_runtime_1.jsx)(ListLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'steps':
                return ((0, jsx_runtime_1.jsx)(StepsLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'compare':
                return ((0, jsx_runtime_1.jsx)(CompareLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'quote':
                return ((0, jsx_runtime_1.jsx)(QuoteLayout, { title: title, data: data, durationInFrames: durationInFrames }));
            case 'chart':
                return ((0, jsx_runtime_1.jsx)(ChartLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'timeline':
                return ((0, jsx_runtime_1.jsx)(TimelineLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'highlight':
                return ((0, jsx_runtime_1.jsx)(HighlightLayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            case 'cta':
                return ((0, jsx_runtime_1.jsx)(CTALayout, { title: title, subtitle: subtitle, data: data, durationInFrames: durationInFrames }));
            default:
                return ((0, jsx_runtime_1.jsx)(DefaultLayout, { title: title, subtitle: subtitle, points: points, durationInFrames: durationInFrames }));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: C.bg }, children: [(0, jsx_runtime_1.jsx)(NebulaGlow, {}), (0, jsx_runtime_1.jsx)(StarField, {}), renderContent(), totalSlides > 1 && ((0, jsx_runtime_1.jsx)(ProgressDots, { index: index, total: totalSlides }))] }));
};
exports.CosmosSlide = CosmosSlide;
