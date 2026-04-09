"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const normalize_1 = require("../landscape/normalize");
// ===================================================================
// EDITORIAL — NYT Magazine × Kinfolk × Aesop
// 印刷质感 / 衬线大字 / 慢节奏 / 克制装饰
// ===================================================================
const EDITORIAL = {
    bg: "#f5efe3",
    paper: "#f0e9da",
    ink: "#1c1814",
    inkDim: "#65574a",
    inkFaint: "#9b8e7d",
    accent: "#b8442a", // terracotta
    gold: "#9b7c2e",
    rule: "rgba(28,24,20,0.18)",
    ruleFaint: "rgba(28,24,20,0.10)",
    serif: "'Newsreader', 'Source Serif Pro', Georgia, 'Times New Roman', 'Songti SC', serif",
    serifItalic: "'Newsreader', 'Source Serif Pro', Georgia, 'Times New Roman', serif",
};
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
// ===================================================================
// UTILS
// ===================================================================
const ease = (frame, from, to) => (0, remotion_1.interpolate)(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: remotion_1.Easing.inOut(remotion_1.Easing.cubic),
});
const easeOut = (frame, from, to) => (0, remotion_1.interpolate)(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: remotion_1.Easing.out(remotion_1.Easing.cubic),
});
// ===================================================================
// BACKGROUND (paper grain + subtle vignette)
// ===================================================================
const EditorialBg = () => {
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { background: EDITORIAL.bg } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    background: "radial-gradient(ellipse 1600px 1200px at 50% 40%, rgba(255,251,242,0.4) 0%, transparent 65%), radial-gradient(ellipse 1100px 800px at 80% 90%, rgba(184,68,42,0.05) 0%, transparent 60%)",
                } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    backgroundImage: `radial-gradient(rgba(28,24,20,0.06) 1px, transparent 1px),
                            radial-gradient(rgba(28,24,20,0.04) 1px, transparent 1px)`,
                    backgroundSize: "3px 3px, 7px 7px",
                    backgroundPosition: "0 0, 1px 1px",
                    opacity: 0.7,
                } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    background: "radial-gradient(ellipse 1600px 1100px at 50% 50%, transparent 50%, rgba(28,24,20,0.10) 100%)",
                } })] }));
};
// ===================================================================
// CHROME (chapter info, pagination, hairlines)
// ===================================================================
const EditorialChrome = ({ frame, index, totalSlides, sectionLabel, children }) => {
    const headerOpacity = ease(frame, 0, 22);
    const footerOpacity = ease(frame, 4, 26);
    const rulesGrow = easeOut(frame, 6, 36);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    top: 70,
                    left: 100,
                    right: 100,
                    height: 1,
                    background: EDITORIAL.rule,
                    transformOrigin: "left center",
                    transform: `scaleX(${rulesGrow})`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    top: 76,
                    left: 100,
                    right: 100,
                    height: 1,
                    background: EDITORIAL.rule,
                    transformOrigin: "right center",
                    transform: `scaleX(${rulesGrow})`,
                    opacity: 0.5,
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    top: 36,
                    left: 100,
                    right: 100,
                    display: "flex",
                    alignItems: "center",
                    opacity: headerOpacity,
                    fontFamily: EDITORIAL.serifItalic,
                    fontStyle: "italic",
                    fontSize: 16,
                    color: EDITORIAL.inkDim,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Chapter\u00A0\u00A0", ROMAN[Math.min(index, ROMAN.length - 1)]] }), (0, jsx_runtime_1.jsx)("span", { style: { margin: "0 18px", color: EDITORIAL.accent }, children: "\u00B7" }), (0, jsx_runtime_1.jsx)("span", { style: { fontStyle: "normal", color: EDITORIAL.accent }, children: sectionLabel }), (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: "auto", letterSpacing: "0.2em" }, children: "The Editorial Quarterly" })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    left: 100,
                    right: 100,
                    top: 110,
                    bottom: 110,
                    fontFamily: EDITORIAL.serif,
                    color: EDITORIAL.ink,
                }, children: children }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    bottom: 76,
                    left: 100,
                    right: 100,
                    height: 1,
                    background: EDITORIAL.rule,
                    transformOrigin: "right center",
                    transform: `scaleX(${rulesGrow})`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    bottom: 70,
                    left: 100,
                    right: 100,
                    height: 1,
                    background: EDITORIAL.rule,
                    transformOrigin: "left center",
                    transform: `scaleX(${rulesGrow})`,
                    opacity: 0.5,
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    bottom: 32,
                    left: 100,
                    right: 100,
                    display: "flex",
                    alignItems: "center",
                    opacity: footerOpacity,
                    fontFamily: EDITORIAL.serifItalic,
                    fontStyle: "italic",
                    fontSize: 15,
                    color: EDITORIAL.inkDim,
                    letterSpacing: "0.14em",
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: { textTransform: "uppercase" }, children: "A Quiet Publication on Slow Knowledge" }), (0, jsx_runtime_1.jsxs)("span", { style: { marginLeft: "auto" }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                    fontStyle: "normal",
                                    fontFamily: EDITORIAL.serif,
                                    fontWeight: 700,
                                    fontSize: 18,
                                    color: EDITORIAL.ink,
                                }, children: String(index + 1).padStart(2, "0") }), "\u00A0\u00A0/\u00A0\u00A0", (0, jsx_runtime_1.jsx)("span", { style: {
                                    fontStyle: "normal",
                                    color: EDITORIAL.inkFaint,
                                }, children: String(totalSlides).padStart(2, "0") })] })] })] }));
};
// ===================================================================
// ATOMS
// ===================================================================
const SmallCapsLabel = ({ text, frame, delay = 0, color = EDITORIAL.accent }) => {
    const a = ease(frame, delay, delay + 22);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            opacity: a,
            transform: `translateY(${(1 - a) * 8}px)`,
            fontFamily: EDITORIAL.serifItalic,
            fontSize: 17,
            color,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            fontStyle: "italic",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                    width: 28,
                    height: 1,
                    background: color,
                    display: "inline-block",
                } }), text] }));
};
const SerifHeadline = ({ text, frame, delay = 0, size = 84, color = EDITORIAL.ink, italic = false, maxWidth = 1500, }) => {
    const a = ease(frame, delay, delay + 28);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            fontFamily: italic ? EDITORIAL.serifItalic : EDITORIAL.serif,
            fontStyle: italic ? "italic" : "normal",
            fontWeight: 800,
            fontSize: size,
            lineHeight: 1.08,
            letterSpacing: "-0.012em",
            color,
            opacity: a,
            transform: `translateY(${(1 - a) * 24}px)`,
            maxWidth,
        }, children: text }));
};
const SerifBody = ({ text, frame, delay = 0, size = 24, color = EDITORIAL.inkDim, italic = false, maxWidth = 980, }) => {
    const a = ease(frame, delay, delay + 24);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            fontFamily: italic ? EDITORIAL.serifItalic : EDITORIAL.serif,
            fontStyle: italic ? "italic" : "normal",
            fontWeight: italic ? 400 : 500,
            fontSize: size,
            lineHeight: 1.55,
            color,
            opacity: a,
            transform: `translateY(${(1 - a) * 14}px)`,
            maxWidth,
        }, children: text }));
};
const Ornament = ({ frame, delay = 0, width = 60 }) => {
    const a = ease(frame, delay, delay + 22);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: a,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    width,
                    height: 1,
                    background: EDITORIAL.gold,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    width: 6,
                    height: 6,
                    background: EDITORIAL.gold,
                    transform: "rotate(45deg)",
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    width,
                    height: 1,
                    background: EDITORIAL.gold,
                } })] }));
};
// ===================================================================
// MAIN
// ===================================================================
const EditorialSlide = ({ title = "", subtitle, points, type = "default", data, index, totalSlides, durationInFrames, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    void durationInFrames;
    // ----- HERO (drop cap + headline + deck) -----
    const renderHero = () => {
        const firstChar = title.charAt(0) || "·";
        const rest = title.slice(1);
        const cta = (0, normalize_1.getCta)(data);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 28,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "A Reading In Six Movements", frame: frame, delay: 20 }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "grid",
                        gridTemplateColumns: "200px 1fr",
                        gap: 24,
                        alignItems: "start",
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: EDITORIAL.serif,
                                fontSize: 280,
                                fontWeight: 900,
                                lineHeight: 0.78,
                                color: EDITORIAL.accent,
                                opacity: ease(frame, 28, 60),
                                transform: `scale(${0.85 + ease(frame, 28, 60) * 0.15}) translateY(-12px)`,
                                transformOrigin: "left top",
                            }, children: firstChar }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: rest, frame: frame, delay: 36, size: 92, maxWidth: 1200 })] }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, paddingLeft: 224 }, children: (0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 56, size: 28, italic: true, maxWidth: 1100, color: EDITORIAL.inkDim }) })), cta && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 28, paddingLeft: 224 }, children: [(0, jsx_runtime_1.jsx)(Ornament, { frame: frame, delay: 70 }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                marginTop: 16,
                                fontFamily: EDITORIAL.serifItalic,
                                fontStyle: "italic",
                                fontSize: 19,
                                color: EDITORIAL.accent,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                opacity: ease(frame, 76, 96),
                            }, children: ["\u2766\u00A0\u00A0", cta] })] }))] }));
    };
    // ----- STATS (serif numerals + italic descriptions) -----
    const renderStats = () => {
        const stats = (0, normalize_1.toStats)(points, data).slice(0, 4);
        if (stats.length === 0)
            return renderDefault();
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 22,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "Field Notes \u2014 In Numbers", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 56, maxWidth: 1500 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 22, italic: true })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
                        gap: 36,
                        alignItems: "center",
                        marginTop: 24,
                    }, children: stats.map((s, i) => {
                        const d = 46 + i * 12;
                        const a = ease(frame, d, d + 28);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                paddingLeft: i === 0 ? 0 : 32,
                                borderLeft: i === 0 ? "none" : `1px solid ${EDITORIAL.ruleFaint}`,
                                opacity: a,
                                transform: `translateY(${(1 - a) * 18}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 130,
                                        fontWeight: 900,
                                        lineHeight: 0.92,
                                        color: EDITORIAL.ink,
                                        letterSpacing: "-0.03em",
                                        display: "flex",
                                        alignItems: "baseline",
                                    }, children: s.value || `${s.rawValue}${s.suffix}` }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        width: 40,
                                        height: 1,
                                        background: EDITORIAL.accent,
                                        marginTop: 4,
                                    } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serifItalic,
                                        fontStyle: "italic",
                                        fontSize: 22,
                                        color: EDITORIAL.ink,
                                        fontWeight: 600,
                                        marginTop: 4,
                                    }, children: s.label }), s.note && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontSize: 14,
                                        color: EDITORIAL.inkFaint,
                                        fontFamily: EDITORIAL.serif,
                                        letterSpacing: "0.05em",
                                    }, children: ["\u2014 ", s.note] }))] }, s.label));
                    }) })] }));
    };
    // ----- COMPARE (two-column magazine spread) -----
    const renderCompare = () => {
        const { left, right } = (0, normalize_1.toCompare)(points, data);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 22,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "A Tale of Two", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 22, italic: true })), (0, jsx_runtime_1.jsxs)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: "1fr 1px 1fr",
                        gap: 0,
                        alignItems: "stretch",
                        marginTop: 28,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 22,
                                padding: "20px 50px 20px 0",
                                opacity: ease(frame, 44, 64),
                                transform: `translateX(${(1 - ease(frame, 44, 64)) * -16}px)`,
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: EDITORIAL.serifItalic,
                                        fontStyle: "italic",
                                        fontSize: 17,
                                        color: EDITORIAL.inkFaint,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                    }, children: ["i.\u00A0\u00A0", left.label] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serifItalic,
                                        fontStyle: "italic",
                                        fontSize: 70,
                                        fontWeight: 700,
                                        lineHeight: 1.06,
                                        color: EDITORIAL.ink,
                                        letterSpacing: "-0.012em",
                                    }, children: left.value }), left.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 22,
                                        color: EDITORIAL.inkDim,
                                        lineHeight: 1.55,
                                        fontFamily: EDITORIAL.serif,
                                        fontWeight: 500,
                                    }, children: left.desc }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                background: EDITORIAL.rule,
                                transformOrigin: "top",
                                transform: `scaleY(${ease(frame, 40, 64)})`,
                                position: "relative",
                            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%) rotate(45deg)",
                                    width: 10,
                                    height: 10,
                                    background: EDITORIAL.gold,
                                    opacity: ease(frame, 56, 76),
                                } }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 22,
                                padding: "20px 0 20px 50px",
                                opacity: ease(frame, 50, 70),
                                transform: `translateX(${(1 - ease(frame, 50, 70)) * 16}px)`,
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 17,
                                        color: EDITORIAL.accent,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        fontWeight: 700,
                                    }, children: ["ii.\u00A0\u00A0", right.label] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 70,
                                        fontWeight: 900,
                                        lineHeight: 1.06,
                                        color: EDITORIAL.ink,
                                        letterSpacing: "-0.018em",
                                    }, children: right.value }), right.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 22,
                                        color: EDITORIAL.inkDim,
                                        lineHeight: 1.55,
                                        fontFamily: EDITORIAL.serif,
                                        fontWeight: 500,
                                    }, children: right.desc }))] })] })] }));
    };
    // ----- CHART -----
    const renderChart = () => {
        const bars = (0, normalize_1.toChart)(points, data).slice(0, 6);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 22,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "Measured Findings", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 22, italic: true })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gap: 24,
                        alignContent: "center",
                        marginTop: 24,
                        paddingRight: 40,
                    }, children: bars.map((b, i) => {
                        const d = 46 + i * 12;
                        const fillProgress = ease(frame, d, d + 36);
                        const numProgress = ease(frame, d + 6, d + 38);
                        const w = Math.max(0, Math.min(100, b.value));
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "320px 1fr 130px",
                                gap: 28,
                                alignItems: "center",
                                opacity: ease(frame, d, d + 16),
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 22,
                                        color: EDITORIAL.ink,
                                        fontWeight: 700,
                                    }, children: [String(i + 1).padStart(2, "0"), "\u00A0\u00A0", (0, jsx_runtime_1.jsx)("span", { style: { fontStyle: "italic", fontWeight: 500 }, children: b.label })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        height: 6,
                                        background: "rgba(28,24,20,0.08)",
                                        position: "relative",
                                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: `${w * fillProgress}%`,
                                            background: EDITORIAL.accent,
                                        } }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 32,
                                        fontWeight: 800,
                                        color: EDITORIAL.ink,
                                        textAlign: "right",
                                        letterSpacing: "-0.02em",
                                    }, children: [Math.floor(w * numProgress), (0, jsx_runtime_1.jsx)("span", { style: {
                                                fontSize: 18,
                                                fontFamily: EDITORIAL.serifItalic,
                                                fontStyle: "italic",
                                                color: EDITORIAL.accent,
                                                marginLeft: 2,
                                            }, children: "%" })] })] }, `${b.label}-${i}`));
                    }) })] }));
    };
    // ----- STEPS (Roman numerals) -----
    const renderSteps = () => {
        const steps = (0, normalize_1.toSteps)(points, data).slice(0, 4);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 22,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "In Four Movements", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 22, italic: true })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`,
                        gap: 40,
                        marginTop: 32,
                        alignItems: "start",
                    }, children: steps.map((step, i) => {
                        const d = 46 + i * 14;
                        const a = ease(frame, d, d + 28);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 18,
                                opacity: a,
                                transform: `translateY(${(1 - a) * 22}px)`,
                                borderTop: `2px solid ${EDITORIAL.accent}`,
                                paddingTop: 22,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 60,
                                        fontWeight: 900,
                                        color: EDITORIAL.accent,
                                        lineHeight: 1,
                                    }, children: ROMAN[i] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: EDITORIAL.ink,
                                        lineHeight: 1.2,
                                    }, children: step.title }), step.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serifItalic,
                                        fontStyle: "italic",
                                        fontSize: 18,
                                        color: EDITORIAL.inkDim,
                                        lineHeight: 1.55,
                                    }, children: step.desc }))] }, `${step.title}-${i}`));
                    }) })] }));
    };
    // ----- TIMELINE (vertical-leaning chronology) -----
    const renderTimeline = () => {
        const timeline = (0, normalize_1.toTimeline)(points, data).slice(0, 5);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 18,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "A Brief Chronology", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 52 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 20, italic: true })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gap: 18,
                        alignContent: "center",
                        marginTop: 18,
                        paddingRight: 40,
                    }, children: timeline.map((t, i) => {
                        const d = 44 + i * 12;
                        const a = ease(frame, d, d + 26);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "150px 1fr",
                                gap: 36,
                                alignItems: "baseline",
                                paddingBottom: 16,
                                borderBottom: i < timeline.length - 1
                                    ? `1px solid ${EDITORIAL.ruleFaint}`
                                    : "none",
                                opacity: a,
                                transform: `translateY(${(1 - a) * 14}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 38,
                                        fontWeight: 800,
                                        color: EDITORIAL.accent,
                                        letterSpacing: "-0.02em",
                                    }, children: t.year }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 26,
                                                fontWeight: 800,
                                                color: EDITORIAL.ink,
                                                lineHeight: 1.25,
                                            }, children: t.title }), t.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontFamily: EDITORIAL.serifItalic,
                                                fontStyle: "italic",
                                                fontSize: 18,
                                                color: EDITORIAL.inkDim,
                                                marginTop: 6,
                                                lineHeight: 1.55,
                                                maxWidth: 1100,
                                            }, children: t.desc }))] })] }, `${t.year}-${i}`));
                    }) })] }));
    };
    // ----- LIST -----
    const renderList = () => {
        const items = (0, normalize_1.toList)(points, data).slice(0, 6);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 22,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "Notes & Findings", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 58 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 22, italic: true })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "grid",
                        gap: 16,
                        alignContent: "center",
                        marginTop: 24,
                        maxWidth: 1500,
                    }, children: items.map((item, i) => {
                        const d = 46 + i * 12;
                        const a = ease(frame, d, d + 26);
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "70px 1fr",
                                gap: 28,
                                alignItems: "baseline",
                                paddingBottom: 16,
                                borderBottom: i < items.length - 1
                                    ? `1px solid ${EDITORIAL.ruleFaint}`
                                    : "none",
                                opacity: a,
                                transform: `translateY(${(1 - a) * 12}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serif,
                                        fontSize: 36,
                                        fontWeight: 800,
                                        color: EDITORIAL.accent,
                                    }, children: String(i + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                fontFamily: EDITORIAL.serif,
                                                fontSize: 28,
                                                fontWeight: 700,
                                                color: EDITORIAL.ink,
                                                lineHeight: 1.25,
                                            }, children: item.title }), item.desc && ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontFamily: EDITORIAL.serifItalic,
                                                fontStyle: "italic",
                                                fontSize: 19,
                                                color: EDITORIAL.inkDim,
                                                marginTop: 4,
                                                lineHeight: 1.55,
                                            }, children: item.desc }))] })] }, `${item.title}-${i}`));
                    }) })] }));
    };
    const renderDefault = () => renderList();
    // ----- HIGHLIGHT (pull-quote fragments) -----
    const renderHighlight = () => {
        const items = (0, normalize_1.toHighlights)(points, data).slice(0, 6);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 22,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "Annotations", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 56 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 36, size: 22, italic: true })), (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                        justifyContent: "center",
                        marginTop: 18,
                    }, children: items.map((it, i) => {
                        const d = 44 + i * 14;
                        const a = ease(frame, d, d + 28);
                        const isAccent = i % 2 === 0;
                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: "flex",
                                alignItems: "baseline",
                                gap: 22,
                                opacity: a,
                                transform: `translateX(${(1 - a) * (isAccent ? -16 : 16)}px)`,
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: EDITORIAL.serifItalic,
                                        fontStyle: "italic",
                                        fontSize: 20,
                                        color: EDITORIAL.gold,
                                        width: 42,
                                        flexShrink: 0,
                                    }, children: String(i + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontFamily: isAccent
                                            ? EDITORIAL.serif
                                            : EDITORIAL.serifItalic,
                                        fontStyle: isAccent ? "normal" : "italic",
                                        fontSize: 36,
                                        fontWeight: isAccent ? 800 : 600,
                                        color: isAccent ? EDITORIAL.ink : EDITORIAL.accent,
                                        lineHeight: 1.3,
                                        maxWidth: 1500,
                                    }, children: it })] }, `${it}-${i}`));
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
                paddingLeft: 60,
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        position: "absolute",
                        top: 20,
                        left: -10,
                        fontSize: 380,
                        fontFamily: EDITORIAL.serif,
                        fontWeight: 900,
                        color: EDITORIAL.accent,
                        opacity: 0.16 * ease(frame, 6, 30),
                        lineHeight: 0.7,
                        pointerEvents: "none",
                    }, children: "\"" }), (0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "A Sentence Worth Keeping", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)("div", { style: {
                        marginTop: 36,
                        fontFamily: EDITORIAL.serifItalic,
                        fontStyle: "italic",
                        fontSize: 76,
                        fontWeight: 700,
                        lineHeight: 1.18,
                        letterSpacing: "-0.012em",
                        color: EDITORIAL.ink,
                        maxWidth: 1500,
                        opacity: ease(frame, 24, 56),
                        transform: `translateY(${(1 - ease(frame, 24, 56)) * 18}px)`,
                    }, children: quote }), author && ((0, jsx_runtime_1.jsxs)("div", { style: {
                        marginTop: 40,
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        opacity: ease(frame, 60, 80),
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 56,
                                height: 1,
                                background: EDITORIAL.accent,
                            } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                fontFamily: EDITORIAL.serif,
                                fontSize: 22,
                                color: EDITORIAL.ink,
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }, children: author })] }))] }));
    };
    // ----- CTA -----
    const renderCta = () => {
        const cta = (0, normalize_1.getCta)(data) || "Read further";
        const tags = (0, normalize_1.toHighlights)(points, data).slice(0, 4);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 28,
            }, children: [(0, jsx_runtime_1.jsx)(SmallCapsLabel, { text: "Fin.", frame: frame, delay: 14 }), (0, jsx_runtime_1.jsx)(SerifHeadline, { text: title, frame: frame, delay: 22, size: 88 }), subtitle && ((0, jsx_runtime_1.jsx)(SerifBody, { text: subtitle, frame: frame, delay: 42, size: 28, italic: true, maxWidth: 1300 })), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18 }, children: (0, jsx_runtime_1.jsx)(Ornament, { frame: frame, delay: 60, width: 80 }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                        marginTop: 18,
                        opacity: ease(frame, 66, 86),
                        transform: `translateY(${(1 - ease(frame, 66, 86)) * 14}px)`,
                    }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                            fontFamily: EDITORIAL.serifItalic,
                            fontStyle: "italic",
                            fontSize: 24,
                            color: EDITORIAL.accent,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 16,
                            borderBottom: `2px solid ${EDITORIAL.accent}`,
                            paddingBottom: 8,
                        }, children: ["\u2766\u00A0\u00A0", cta] }) }), tags.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                        marginTop: 26,
                        display: "flex",
                        gap: 22,
                        opacity: ease(frame, 80, 100),
                        fontFamily: EDITORIAL.serifItalic,
                        fontStyle: "italic",
                        fontSize: 17,
                        color: EDITORIAL.inkFaint,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                    }, children: tags.map((t, i) => ((0, jsx_runtime_1.jsxs)("span", { children: [i > 0 && ((0, jsx_runtime_1.jsx)("span", { style: { marginRight: 22, color: EDITORIAL.gold }, children: "\u00B7" })), t] }, `${t}-${i}`))) }))] }));
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
    const sectionLabel = type === "hero"
        ? "Opening"
        : type === "cta"
            ? "Coda"
            : type === "quote"
                ? "Marginalia"
                : type === "stats"
                    ? "Findings"
                    : type === "compare"
                        ? "Counterpoint"
                        : type === "timeline"
                            ? "Chronology"
                            : type === "steps"
                                ? "Movements"
                                : type === "chart"
                                    ? "Measure"
                                    : type === "highlight"
                                        ? "Annotation"
                                        : "Reading";
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { background: EDITORIAL.bg }, children: [(0, jsx_runtime_1.jsx)(EditorialBg, {}), (0, jsx_runtime_1.jsx)(EditorialChrome, { frame: frame, index: index, totalSlides: totalSlides, sectionLabel: sectionLabel, children: renderBody() })] }));
};
exports.EditorialSlide = EditorialSlide;
