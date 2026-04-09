"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const normalize_1 = require("../landscape/normalize");
// ===================================================================
// STUDIO TERMINAL — Bloomberg × Vision Pro × restrained cyberpunk
// ===================================================================
const STUDIO = {
    bg: "#000000",
    ink: "#ffffff",
    inkDim: "rgba(255,255,255,0.62)",
    inkFaint: "rgba(255,255,255,0.28)",
    inkGhost: "rgba(255,255,255,0.10)",
    signal: "#06b6d4",
    signalSoft: "rgba(6,182,212,0.18)",
    alert: "#ef4444",
    warn: "#fbbf24",
    success: "#10b981",
    surface: "rgba(8,12,20,0.55)",
    surfaceStrong: "rgba(10,16,28,0.85)",
    border: "rgba(6,182,212,0.22)",
    borderFaint: "rgba(255,255,255,0.07)",
    monoFont: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
    sansFont: "'SF Pro Display', 'Inter', 'PingFang SC', sans-serif",
};
// ===================================================================
// UTILS
// ===================================================================
const ease = (frame, from, to) => (0, remotion_1.interpolate)(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: remotion_1.Easing.out(remotion_1.Easing.cubic),
});
const easeInOut = (frame, from, to) => (0, remotion_1.interpolate)(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: remotion_1.Easing.inOut(remotion_1.Easing.cubic),
});
// ===================================================================
// BACKGROUND
// ===================================================================
const StudioBg = ({ frame }) => {
    const scanY = (frame * 6) % 1180 - 80;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { background: STUDIO.bg } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    background: "radial-gradient(ellipse 1400px 900px at 50% 35%, rgba(6,182,212,0.12) 0%, transparent 65%), radial-gradient(ellipse 900px 600px at 85% 90%, rgba(239,68,68,0.06) 0%, transparent 60%)",
                } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
                    backgroundSize: "80px 80px",
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: scanY,
                    height: 80,
                    background: "linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.10) 50%, transparent 100%)",
                    pointerEvents: "none",
                } }), [
                { top: 24, left: 24, b: "1px 0 0 1px" },
                { top: 24, right: 24, b: "1px 1px 0 0" },
                { bottom: 24, left: 24, b: "0 0 1px 1px" },
                { bottom: 24, right: 24, b: "0 1px 1px 0" },
            ].map((p, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    ...p,
                    width: 16,
                    height: 16,
                    borderColor: STUDIO.signal,
                    borderStyle: "solid",
                    borderWidth: p.b,
                    opacity: 0.5,
                } }, i)))] }));
};
// ===================================================================
// FRAME (top bar + side label + bottom progress)
// ===================================================================
const StudioFrame = ({ frame, index, totalSlides, layoutLabel, children, durationInFrames }) => {
    const topAppear = ease(frame, 0, 14);
    const sideAppear = ease(frame, 6, 22);
    const bottomAppear = ease(frame, 4, 18);
    const playProgress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 48px",
                    borderBottom: `1px solid ${STUDIO.borderFaint}`,
                    opacity: topAppear,
                    transform: `translateY(${(1 - topAppear) * -10}px)`,
                    fontFamily: STUDIO.monoFont,
                    fontSize: 12,
                    color: STUDIO.inkDim,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: 14, alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: STUDIO.signal,
                                    boxShadow: `0 0 14px ${STUDIO.signal}`,
                                } }), (0, jsx_runtime_1.jsx)("span", { style: { color: STUDIO.signal, fontWeight: 700 }, children: "\u25CF SIGNAL LIVE" }), (0, jsx_runtime_1.jsx)("span", { style: {
                                    width: 1,
                                    height: 14,
                                    background: STUDIO.borderFaint,
                                    marginLeft: 6,
                                    marginRight: 6,
                                } }), (0, jsx_runtime_1.jsx)("span", { children: "STUDIO TERMINAL" })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            marginLeft: "auto",
                            display: "flex",
                            gap: 28,
                            alignItems: "center",
                        }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["SIG ", String(index + 1).padStart(2, "0"), " /", " ", String(totalSlides).padStart(2, "0")] }), (0, jsx_runtime_1.jsxs)("span", { style: { color: STUDIO.warn, fontWeight: 700 }, children: ["\u25B8 ", layoutLabel.toUpperCase()] })] })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 14,
                    top: 80,
                    bottom: 80,
                    width: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: sideAppear,
                    transform: `translateX(${(1 - sideAppear) * -12}px)`,
                }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                        transform: "rotate(-90deg)",
                        fontFamily: STUDIO.monoFont,
                        fontSize: 11,
                        color: STUDIO.inkFaint,
                        letterSpacing: "0.42em",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                    }, children: ["\u25C6 SECTION ", String(index + 1).padStart(2, "0"), " \u25C6 ", layoutLabel, " \u25C6"] }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 88,
                    right: 48,
                    top: 84,
                    bottom: 84,
                    fontFamily: STUDIO.sansFont,
                    color: STUDIO.ink,
                }, children: children }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 48px",
                    borderTop: `1px solid ${STUDIO.borderFaint}`,
                    opacity: bottomAppear,
                    transform: `translateY(${(1 - bottomAppear) * 10}px)`,
                    fontFamily: STUDIO.monoFont,
                    fontSize: 11,
                    color: STUDIO.inkDim,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["FRM ", String(frame).padStart(4, "0")] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            flex: 1,
                            height: 2,
                            margin: "0 36px",
                            background: STUDIO.borderFaint,
                            position: "relative",
                        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${playProgress * 100}%`,
                                background: `linear-gradient(90deg, ${STUDIO.signal} 0%, ${STUDIO.warn} 100%)`,
                                boxShadow: `0 0 16px ${STUDIO.signal}80`,
                            } }) }), (0, jsx_runtime_1.jsxs)("span", { children: [Math.floor(playProgress * 100).toString().padStart(3, "0"), "%"] })] })] }));
};
// ===================================================================
// ATOMS
// ===================================================================
const HeadingDisplay = ({ text, frame, delay = 0, size = 80, color = STUDIO.ink, weight = 900, }) => {
    const chars = text.split("");
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            fontFamily: STUDIO.sansFont,
            fontWeight: weight,
            fontSize: size,
            lineHeight: 1.04,
            letterSpacing: "-0.022em",
            color,
        }, children: chars.map((ch, i) => {
            const cd = delay + i * 1.4;
            const a = ease(frame, cd, cd + 16);
            return ((0, jsx_runtime_1.jsx)("span", { style: {
                    display: "inline-block",
                    opacity: a,
                    transform: `translateY(${(1 - a) * 28}px)`,
                    whiteSpace: "pre",
                }, children: ch === " " ? "\u00A0" : ch }, i));
        }) }));
};
const DataLabel = ({ text, frame, delay = 0, color = STUDIO.signal }) => {
    const appear = ease(frame, delay, delay + 14);
    const lineGrow = ease(frame, delay + 6, delay + 26);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "inline-flex",
            flexDirection: "column",
            gap: 8,
            opacity: appear,
            transform: `translateY(${(1 - appear) * 8}px)`,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    fontFamily: STUDIO.monoFont,
                    fontSize: 13,
                    color,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                }, children: text }), (0, jsx_runtime_1.jsx)("div", { style: {
                    height: 2,
                    width: `${lineGrow * 100}%`,
                    background: color,
                    boxShadow: `0 0 10px ${color}90`,
                } })] }));
};
const DataNumber = ({ value, suffix = "", frame, delay = 0, size = 160, color = STUDIO.ink, }) => {
    const progress = ease(frame, delay, delay + 30);
    const display = value * progress;
    const isFloat = value % 1 !== 0;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            fontFamily: STUDIO.monoFont,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.95,
            color,
            letterSpacing: "-0.045em",
            display: "flex",
            alignItems: "baseline",
        }, children: [(0, jsx_runtime_1.jsx)("span", { children: isFloat ? display.toFixed(1) : Math.floor(display) }), suffix && ((0, jsx_runtime_1.jsx)("span", { style: {
                    fontSize: size * 0.42,
                    marginLeft: 6,
                    color: STUDIO.signal,
                    fontWeight: 700,
                }, children: suffix }))] }));
};
const Subtext = ({ text, frame, delay = 0, size = 24, color = STUDIO.inkDim, maxWidth = 900, }) => {
    const a = ease(frame, delay, delay + 18);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            opacity: a,
            transform: `translateY(${(1 - a) * 12}px)`,
            fontSize: size,
            lineHeight: 1.5,
            color,
            fontWeight: 500,
            maxWidth,
        }, children: text }));
};
const Hairline = ({ frame, delay = 0, color = STUDIO.border, width = "100%", height = 1, }) => {
    const grow = ease(frame, delay, delay + 22);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            height,
            width,
            background: color,
            transformOrigin: "left center",
            transform: `scaleX(${grow})`,
        } }));
};
// ===================================================================
// LAYOUT RENDERERS
// ===================================================================
const StudioSlide = ({ title = "", subtitle, points, type = "default", data, index, totalSlides, durationInFrames, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    void fps;
    // ----- HERO -----
    const renderHero = () => {
        const cta = (0, normalize_1.getCta)(data);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 32,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 TRANSMISSION 01 \u25C6 HEADLINE", frame: frame, delay: 10 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 18, size: 108 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 36, size: 30, maxWidth: 1200 })), cta && ((0, jsx_runtime_1.jsxs)("div", { style: {
                        marginTop: 24,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "16px 26px",
                        border: `1px solid ${STUDIO.signal}`,
                        background: STUDIO.signalSoft,
                        fontFamily: STUDIO.monoFont,
                        fontSize: 16,
                        color: STUDIO.signal,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        alignSelf: "flex-start",
                        opacity: ease(frame, 48, 64),
                        transform: `translateY(${(1 - ease(frame, 48, 64)) * 12}px)`,
                    }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u25B8" }), (0, jsx_runtime_1.jsx)("span", { children: cta })] }))] }));
    };
    // ----- STATS -----
    const renderStats = () => {
        const stats = (0, normalize_1.toStats)(points, data);
        if (stats.length === 0)
            return renderDefault();
        const [primary, ...rest] = stats;
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 28,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 DATA SIGNAL", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsxs)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: rest.length > 0 ? "1.4fr 1fr" : "1fr",
                        gap: 56,
                        alignItems: "center",
                        marginTop: 16,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: STUDIO.monoFont,
                                        fontSize: 14,
                                        color: STUDIO.warn,
                                        letterSpacing: "0.22em",
                                        textTransform: "uppercase",
                                        marginBottom: 18,
                                        opacity: ease(frame, 32, 46),
                                    }, children: ["\u25B8 ", primary.label] }), (0, jsx_runtime_1.jsx)(DataNumber, { value: primary.rawValue, suffix: primary.suffix, frame: frame, delay: 36, size: 220 }), primary.note && ((0, jsx_runtime_1.jsx)(Subtext, { text: primary.note, frame: frame, delay: 64, size: 18, color: STUDIO.inkFaint }))] }), rest.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 30 }, children: rest.map((s, i) => {
                                const d = 50 + i * 14;
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gap: 6 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                fontFamily: STUDIO.monoFont,
                                                fontSize: 12,
                                                color: STUDIO.signal,
                                                letterSpacing: "0.2em",
                                                textTransform: "uppercase",
                                                opacity: ease(frame, d, d + 14),
                                            }, children: ["\u25B8 ", s.label] }), (0, jsx_runtime_1.jsx)(DataNumber, { value: s.rawValue, suffix: s.suffix, frame: frame, delay: d + 4, size: 72 }), s.note && ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontFamily: STUDIO.monoFont,
                                                fontSize: 12,
                                                color: STUDIO.inkFaint,
                                                letterSpacing: "0.1em",
                                                opacity: ease(frame, d + 18, d + 32),
                                            }, children: s.note }))] }, s.label));
                            }) }))] })] }));
    };
    // ----- COMPARE -----
    const renderCompare = () => {
        const { left, right } = (0, normalize_1.toCompare)(points, data);
        const sideContent = (side, isLeft, delay) => {
            const accent = isLeft ? STUDIO.signal : STUDIO.warn;
            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    padding: "32px 38px",
                    background: isLeft
                        ? "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, transparent 70%)"
                        : "linear-gradient(225deg, rgba(251,191,36,0.10) 0%, transparent 70%)",
                    border: `1px solid ${accent}30`,
                    borderLeftWidth: isLeft ? 3 : 1,
                    borderRightWidth: isLeft ? 1 : 3,
                    borderLeftColor: isLeft ? accent : `${accent}30`,
                    borderRightColor: isLeft ? `${accent}30` : accent,
                    opacity: ease(frame, delay, delay + 18),
                    transform: `translateX(${(1 - ease(frame, delay, delay + 18)) * (isLeft ? -20 : 20)}px)`,
                    height: "100%",
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            fontFamily: STUDIO.monoFont,
                            fontSize: 13,
                            color: accent,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            fontWeight: 700,
                        }, children: ["\u25B8 ", side.label] }), (0, jsx_runtime_1.jsx)("div", { style: {
                            fontFamily: STUDIO.sansFont,
                            fontSize: 56,
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: "-0.02em",
                            color: STUDIO.ink,
                        }, children: side.value }), side.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                            fontSize: 22,
                            lineHeight: 1.5,
                            color: STUDIO.inkDim,
                            fontWeight: 500,
                            marginTop: 8,
                        }, children: side.desc }))] }));
        };
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 28,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 DUAL COMPARE", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 50 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsxs)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 1fr",
                        alignItems: "stretch",
                        gap: 0,
                        marginTop: 16,
                    }, children: [sideContent(left, true, 36), (0, jsx_runtime_1.jsx)("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: STUDIO.monoFont,
                                fontSize: 32,
                                color: STUDIO.alert,
                                fontWeight: 900,
                                letterSpacing: "0.1em",
                                opacity: ease(frame, 50, 70),
                            }, children: "VS" }), sideContent(right, false, 44)] })] }));
    };
    // ----- CHART -----
    const renderChart = () => {
        const bars = (0, normalize_1.toChart)(points, data).slice(0, 6);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 METRIC STREAM", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 52 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gap: 22,
                        alignContent: "center",
                        marginTop: 24,
                        paddingRight: 40,
                    }, children: bars.map((b, i) => {
                        const d = 36 + i * 10;
                        const fillProgress = ease(frame, d, d + 36);
                        const numericProgress = ease(frame, d + 6, d + 38);
                        const w = Math.max(0, Math.min(100, b.value));
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "300px 1fr 110px",
                                gap: 24,
                                alignItems: "center",
                                opacity: ease(frame, d, d + 14),
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: STUDIO.monoFont,
                                        fontSize: 16,
                                        color: STUDIO.ink,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        fontWeight: 700,
                                    }, children: ["\u25B8 ", b.label] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        height: 18,
                                        background: "rgba(255,255,255,0.04)",
                                        border: `1px solid ${STUDIO.borderFaint}`,
                                        position: "relative",
                                        overflow: "hidden",
                                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: `${w * fillProgress}%`,
                                            background: `linear-gradient(90deg, ${STUDIO.signal} 0%, ${STUDIO.warn} 100%)`,
                                            boxShadow: `0 0 12px ${STUDIO.signal}70`,
                                        } }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: STUDIO.monoFont,
                                        fontSize: 24,
                                        fontWeight: 800,
                                        color: STUDIO.warn,
                                        textAlign: "right",
                                        letterSpacing: "-0.02em",
                                    }, children: [Math.floor(w * numericProgress), "%"] })] }, `${b.label}-${i}`));
                    }) })] }));
    };
    // ----- STEPS -----
    const renderSteps = () => {
        const steps = (0, normalize_1.toSteps)(points, data).slice(0, 5);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 EXECUTION SEQUENCE", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 52 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`,
                        gap: 24,
                        marginTop: 24,
                    }, children: steps.map((step, i) => {
                        const d = 36 + i * 12;
                        const a = ease(frame, d, d + 22);
                        const lineGrow = ease(frame, d + 8, d + 30);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 18,
                                padding: "26px 24px",
                                border: `1px solid ${STUDIO.borderFaint}`,
                                background: STUDIO.surface,
                                opacity: a,
                                transform: `translateY(${(1 - a) * 24}px)`,
                                position: "relative",
                                overflow: "hidden",
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        height: 2,
                                        width: `${lineGrow * 100}%`,
                                        background: STUDIO.signal,
                                        boxShadow: `0 0 8px ${STUDIO.signal}`,
                                    } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: STUDIO.monoFont,
                                        fontSize: 38,
                                        color: STUDIO.signal,
                                        fontWeight: 800,
                                        letterSpacing: "-0.02em",
                                    }, children: String(i + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: STUDIO.ink,
                                        lineHeight: 1.2,
                                    }, children: step.title }), step.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 16,
                                        color: STUDIO.inkDim,
                                        lineHeight: 1.55,
                                    }, children: step.desc }))] }, `${step.title}-${i}`));
                    }) })] }));
    };
    // ----- TIMELINE -----
    const renderTimeline = () => {
        const timeline = (0, normalize_1.toTimeline)(points, data).slice(0, 5);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 HISTORY STREAM", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 52 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsxs)("div", { style: {
                        flex: 1,
                        position: "relative",
                        marginTop: 60,
                        paddingTop: 80,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                position: "absolute",
                                top: 50,
                                left: 0,
                                right: 0,
                                height: 2,
                                background: STUDIO.borderFaint,
                            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    height: "100%",
                                    width: `${ease(frame, 32, 60) * 100}%`,
                                    background: `linear-gradient(90deg, ${STUDIO.signal} 0%, ${STUDIO.warn} 100%)`,
                                    boxShadow: `0 0 12px ${STUDIO.signal}80`,
                                } }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                                display: "grid",
                                gridTemplateColumns: `repeat(${timeline.length}, 1fr)`,
                                gap: 16,
                                position: "relative",
                            }, children: timeline.map((t, i) => {
                                const d = 42 + i * 14;
                                const a = ease(frame, d, d + 22);
                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 14,
                                        opacity: a,
                                        transform: `translateY(${(1 - a) * 18}px)`,
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                position: "absolute",
                                                top: -56,
                                                left: `${(i + 0.5) * (100 / timeline.length)}%`,
                                                transform: "translateX(-50%)",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 6,
                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontFamily: STUDIO.monoFont,
                                                        fontSize: 20,
                                                        color: STUDIO.warn,
                                                        fontWeight: 800,
                                                        letterSpacing: "-0.02em",
                                                    }, children: t.year }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                        width: 14,
                                                        height: 14,
                                                        borderRadius: "50%",
                                                        background: STUDIO.signal,
                                                        boxShadow: `0 0 14px ${STUDIO.signal}, 0 0 0 4px rgba(6,182,212,0.18)`,
                                                    } })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 22,
                                                fontWeight: 800,
                                                color: STUDIO.ink,
                                                lineHeight: 1.25,
                                                paddingTop: 24,
                                                paddingRight: 14,
                                            }, children: t.title }), t.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 15,
                                                color: STUDIO.inkDim,
                                                lineHeight: 1.55,
                                                paddingRight: 14,
                                            }, children: t.desc }))] }, `${t.year}-${i}`));
                            }) })] })] }));
    };
    // ----- LIST / DEFAULT -----
    const renderList = () => {
        const items = (0, normalize_1.toList)(points, data).slice(0, 6);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 DATA INDEX", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gap: 14,
                        alignContent: "center",
                        marginTop: 24,
                    }, children: items.map((item, i) => {
                        const d = 36 + i * 12;
                        const a = ease(frame, d, d + 22);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "80px 1fr",
                                gap: 28,
                                alignItems: "center",
                                padding: "20px 28px",
                                borderTop: i === 0 ? `1px solid ${STUDIO.borderFaint}` : "none",
                                borderBottom: `1px solid ${STUDIO.borderFaint}`,
                                background: i % 2 === 0 ? "rgba(6,182,212,0.04)" : "transparent",
                                opacity: a,
                                transform: `translateX(${(1 - a) * -20}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: STUDIO.monoFont,
                                        fontSize: 36,
                                        fontWeight: 800,
                                        color: STUDIO.signal,
                                        letterSpacing: "-0.02em",
                                    }, children: String(i + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 28,
                                                fontWeight: 800,
                                                color: STUDIO.ink,
                                                lineHeight: 1.25,
                                            }, children: item.title }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 17,
                                                color: STUDIO.inkDim,
                                                marginTop: 6,
                                                lineHeight: 1.5,
                                            }, children: item.desc }))] })] }, `${item.title}-${i}`));
                    }) })] }));
    };
    const renderDefault = () => renderList();
    // ----- HIGHLIGHT -----
    const renderHighlight = () => {
        const items = (0, normalize_1.toHighlights)(points, data).slice(0, 8);
        const palette = [STUDIO.signal, STUDIO.warn, STUDIO.alert, STUDIO.success];
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 28,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 KEYWORD STREAM", frame: frame, delay: 8 }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 14, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 28, size: 22 })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 18,
                        alignContent: "center",
                        marginTop: 24,
                    }, children: items.map((it, i) => {
                        const d = 36 + i * 11;
                        const a = ease(frame, d, d + 24);
                        const color = palette[i % palette.length];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                padding: "18px 28px",
                                border: `1px solid ${color}40`,
                                background: `linear-gradient(135deg, ${color}12 0%, transparent 80%)`,
                                fontFamily: STUDIO.sansFont,
                                fontSize: 32,
                                fontWeight: 800,
                                color: STUDIO.ink,
                                opacity: a,
                                transform: `translateY(${(1 - a) * 18}px) scale(${0.96 + a * 0.04})`,
                                position: "relative",
                                overflow: "hidden",
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: `${ease(frame, d + 6, d + 28) * 100}%`,
                                        height: 2,
                                        background: color,
                                        boxShadow: `0 0 8px ${color}`,
                                    } }), (0, jsx_runtime_1.jsx)("span", { style: { color, marginRight: 12, fontFamily: STUDIO.monoFont, fontSize: 20 }, children: String(i + 1).padStart(2, "0") }), it] }, `${it}-${i}`));
                    }) })] }));
    };
    // ----- QUOTE -----
    const renderQuote = () => {
        const { quote, author } = (0, normalize_1.getQuote)(data, title, subtitle);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        position: "absolute",
                        top: 0,
                        left: -20,
                        fontSize: 380,
                        fontFamily: "Georgia, serif",
                        fontWeight: 900,
                        color: STUDIO.signal,
                        opacity: 0.1 * ease(frame, 6, 24),
                        lineHeight: 0.7,
                        pointerEvents: "none",
                    }, children: "\"" }), (0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 TRANSMISSION QUOTE", frame: frame, delay: 10 }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        marginTop: 36,
                        fontFamily: STUDIO.sansFont,
                        fontSize: 76,
                        fontWeight: 800,
                        lineHeight: 1.18,
                        letterSpacing: "-0.02em",
                        color: STUDIO.ink,
                        maxWidth: 1500,
                        opacity: ease(frame, 22, 50),
                        transform: `translateY(${(1 - ease(frame, 22, 50)) * 20}px)`,
                    }, children: ["\"", quote, "\""] }), author && ((0, jsx_runtime_1.jsxs)("div", { style: {
                        marginTop: 36,
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        opacity: ease(frame, 56, 76),
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 60,
                                height: 2,
                                background: STUDIO.signal,
                                boxShadow: `0 0 8px ${STUDIO.signal}`,
                            } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: STUDIO.monoFont,
                                fontSize: 20,
                                color: STUDIO.signal,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                fontWeight: 700,
                            }, children: author })] }))] }));
    };
    // ----- CTA -----
    const renderCta = () => {
        const cta = (0, normalize_1.getCta)(data) || "EXECUTE NOW";
        const tags = (0, normalize_1.toHighlights)(points, data).slice(0, 4);
        const pulse = Math.sin((frame / 24) * Math.PI * 2) * 0.5 + 0.5;
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 36,
            }, children: [(0, jsx_runtime_1.jsx)(DataLabel, { text: "\u25C6 END TRANSMISSION", frame: frame, delay: 8, color: STUDIO.alert }), (0, jsx_runtime_1.jsx)(HeadingDisplay, { text: title, frame: frame, delay: 16, size: 92 }), subtitle && ((0, jsx_runtime_1.jsx)(Subtext, { text: subtitle, frame: frame, delay: 36, size: 28, maxWidth: 1200 })), (0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        marginTop: 24,
                        opacity: ease(frame, 50, 70),
                        transform: `translateY(${(1 - ease(frame, 50, 70)) * 16}px)`,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                padding: "22px 36px",
                                border: `2px solid ${STUDIO.signal}`,
                                background: `rgba(6,182,212,${0.10 + pulse * 0.10})`,
                                boxShadow: `0 0 ${20 + pulse * 18}px ${STUDIO.signal}80`,
                                fontFamily: STUDIO.monoFont,
                                fontSize: 22,
                                color: STUDIO.signal,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                fontWeight: 800,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 14,
                            }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u25B8" }), (0, jsx_runtime_1.jsx)("span", { children: cta }), (0, jsx_runtime_1.jsx)("span", { children: "\u25C2" })] }), tags.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                display: "flex",
                                gap: 12,
                                marginLeft: 16,
                                flexWrap: "wrap",
                            }, children: tags.map((t, i) => {
                                const d = 60 + i * 8;
                                return ((0, jsx_runtime_1.jsxs)("span", { style: {
                                        padding: "10px 16px",
                                        border: `1px solid ${STUDIO.borderFaint}`,
                                        fontFamily: STUDIO.monoFont,
                                        fontSize: 13,
                                        color: STUDIO.inkDim,
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                        opacity: ease(frame, d, d + 16),
                                    }, children: ["#", t] }, `${t}-${i}`));
                            }) }))] })] }));
    };
    // ===== DISPATCH =====
    const renderBody = () => {
        switch (type) {
            case "hero":
                return renderHero();
            case "stats":
                return renderStats();
            case "compare":
                return renderCompare();
            case "chart":
                return renderChart();
            case "steps":
                return renderSteps();
            case "timeline":
                return renderTimeline();
            case "highlight":
                return renderHighlight();
            case "quote":
                return renderQuote();
            case "cta":
                return renderCta();
            case "list":
                return renderList();
            case "default":
            default:
                return renderDefault();
        }
    };
    const layoutLabel = type || "default";
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: STUDIO.bg }, children: [(0, jsx_runtime_1.jsx)(StudioBg, { frame: frame }), (0, jsx_runtime_1.jsx)(StudioFrame, { frame: frame, index: index, totalSlides: totalSlides, layoutLabel: layoutLabel, durationInFrames: durationInFrames, children: renderBody() })] }));
};
exports.StudioSlide = StudioSlide;
void easeInOut;
void Hairline;
