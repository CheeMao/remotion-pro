"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const runtimeTiming_1 = require("../templates/runtimeTiming");
const colors = {
    bg: "#0f172a",
    card: "rgba(15, 23, 42, 0.78)",
    panel: "rgba(30, 41, 59, 0.72)",
    accent1: "#3b82f6",
    accent2: "#8b5cf6",
    accent3: "#06b6d4",
    accent4: "#10b981",
    accent5: "#f59e0b",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "rgba(148, 163, 184, 0.18)",
};
const GridBackground = ({ frame }) => {
    const offset = (frame * 0.45) % 100;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: "absolute",
            inset: 0,
            background: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
            backgroundSize: "28px 28px",
            backgroundPosition: `-${offset}px -${offset}px`,
        } }));
};
const InfoCard = ({ children, frame, delay, }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - delay,
        fps: 30,
        config: { damping: 20, stiffness: 80 },
    });
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: "relative",
            padding: "34px 32px 30px",
            borderRadius: 30,
            background: colors.card,
            backdropFilter: "blur(18px)",
            border: `1px solid ${colors.border}`,
            boxShadow: "0 28px 70px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
            opacity: progress,
            transform: `translateY(${(1 - progress) * 28}px) scale(${0.97 + progress * 0.03})`,
        }, children: children }));
};
const chipPalette = [colors.accent1, colors.accent2, colors.accent3, colors.accent4, colors.accent5];
const HighlightText = ({ highlights, frame, delay, getProgress, }) => ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }, children: highlights.map((word, i) => {
        const progress = getProgress
            ? getProgress(`highlight-${i}`, delay + i * 3)
            : (0, remotion_1.spring)({
                frame: frame - delay - i * 3,
                fps: 30,
                config: { damping: 12 },
            });
        const accent = word.color || chipPalette[i % chipPalette.length];
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                padding: "14px 22px",
                borderRadius: 16,
                background: `linear-gradient(135deg, ${accent}20, ${accent}10)`,
                border: `1px solid ${accent}55`,
                color: colors.text,
                fontSize: 30,
                fontWeight: 800,
                boxShadow: `0 0 18px ${accent}18`,
                opacity: progress,
                transform: `translateY(${(1 - progress) * 18}px)`,
            }, children: word.text }, i));
    }) }));
const StepsFlow = ({ steps, frame, delay, getProgress, }) => ((0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 14 }, children: steps.map((step, i) => {
        const progress = getProgress
            ? getProgress(`step-${i}`, delay + i * 5)
            : (0, remotion_1.spring)({
                frame: frame - delay - i * 5,
                fps: 30,
                config: { damping: 15 },
            });
        const accent = chipPalette[i % chipPalette.length];
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                display: "grid",
                gridTemplateColumns: "64px 1fr",
                gap: 16,
                alignItems: "start",
                padding: "16px 18px",
                borderRadius: 18,
                background: colors.panel,
                border: `1px solid ${accent}28`,
                opacity: progress,
                transform: `translateX(${(1 - progress) * 38}px)`,
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        width: 64,
                        height: 56,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 24,
                        fontWeight: 900,
                        boxShadow: `0 10px 20px ${accent}30`,
                    }, children: i + 1 }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, fontWeight: 800, color: colors.text, marginBottom: 4 }, children: step.title }), step.description ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, color: colors.muted, lineHeight: 1.5 }, children: step.description })) : null] })] }, i));
    }) }));
const TimelineView = ({ items, frame, delay, getProgress, }) => ((0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 14 }, children: items.map((item, i) => {
        const progress = getProgress
            ? getProgress(`timeline-${i}`, delay + i * 4)
            : (0, remotion_1.spring)({
                frame: frame - delay - i * 4,
                fps: 30,
                config: { damping: 16 },
            });
        const accent = chipPalette[i % chipPalette.length];
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                display: "grid",
                gridTemplateColumns: "120px 18px 1fr",
                gap: 16,
                alignItems: "center",
                opacity: progress,
                transform: `translateX(${(1 - progress) * (i % 2 === 0 ? -28 : 28)}px)`,
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, fontWeight: 800, color: accent, textAlign: "right" }, children: item.year }), (0, jsx_runtime_1.jsx)("div", { style: { width: 18, height: 18, borderRadius: "50%", background: accent, boxShadow: `0 0 14px ${accent}` } }), (0, jsx_runtime_1.jsxs)("div", { style: { padding: "14px 18px", borderRadius: 18, background: colors.panel, border: `1px solid ${accent}24` }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 4 }, children: item.title }), item.description ? (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: colors.muted, lineHeight: 1.5 }, children: item.description }) : null] })] }, i));
    }) }));
const ChartView = ({ chart, frame, delay, getProgress, }) => {
    if (chart.type === "progress") {
        return ((0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 18 }, children: chart.values.map((item, i) => {
                const progress = getProgress
                    ? getProgress(`chart-bar-${i}`, delay + i * 4)
                    : (0, remotion_1.spring)({
                        frame: frame - delay - i * 4,
                        fps: 30,
                        config: { damping: 15 },
                    });
                const accent = item.color || chipPalette[i % chipPalette.length];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { opacity: progress }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 22, fontWeight: 700, color: colors.text }, children: item.label }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 22, fontWeight: 800, color: accent }, children: [item.value, "%"] })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: 16, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: `${item.value * progress}%`,
                                    height: "100%",
                                    borderRadius: 999,
                                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                                    boxShadow: `0 0 14px ${accent}45`,
                                } }) })] }, i));
            }) }));
    }
    if (chart.type === "bar") {
        const maxValue = Math.max(...chart.values.map((v) => v.value));
        return ((0, jsx_runtime_1.jsx)("div", { style: { display: "flex", alignItems: "flex-end", gap: 14, height: 250 }, children: chart.values.map((item, i) => {
                const progress = getProgress
                    ? getProgress(`chart-bar-${i}`, delay + i * 4)
                    : (0, remotion_1.spring)({
                        frame: frame - delay - i * 4,
                        fps: 30,
                        config: { damping: 15 },
                    });
                const accent = item.color || chipPalette[i % chipPalette.length];
                return ((0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: "100%",
                                height: (item.value / maxValue) * 200 * progress,
                                borderRadius: "14px 14px 4px 4px",
                                background: `linear-gradient(180deg, ${accent}, ${accent}bb)`,
                                boxShadow: `0 0 18px ${accent}40`,
                            } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, fontWeight: 800, color: accent }, children: item.value }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 16, color: colors.muted, textAlign: "center" }, children: item.label })] }, i));
            }) }));
    }
    return null;
};
const KnowledgeSlide = ({ title, subtitle, points, highlights, steps, timeline, chart, elementTimings, slideAudioStart, type, data, index, totalSlides, durationInFrames, }) => {
    var _a;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const timing = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, (_a = points === null || points === void 0 ? void 0 : points.length) !== null && _a !== void 0 ? _a : 0);
    const resolveProgress = (id, fallbackStart) => (0, runtimeTiming_1.getElementProgress)({
        frame,
        fps,
        elementTimings,
        slideAudioStart,
        id,
        fallbackStart,
        damping: 16,
        stiffness: 96,
    });
    const titleProgress = resolveProgress("title", timing.titleStart);
    const subtitleProgress = resolveProgress("subtitle", timing.subtitleStart);
    const exitOpacity = (0, remotion_1.interpolate)(frame, [timing.exitStart, timing.exitEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: colors.bg,
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
            overflow: "hidden",
        }, children: [(0, jsx_runtime_1.jsx)(GridBackground, { frame: frame }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at 18% 18%, rgba(59,130,246,0.14) 0%, transparent 28%), radial-gradient(circle at 80% 22%, rgba(139,92,246,0.1) 0%, transparent 24%), radial-gradient(circle at 58% 78%, rgba(6,182,212,0.1) 0%, transparent 28%)",
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    top: 40,
                    right: 40,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.28)",
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: 22,
                    fontWeight: 800,
                }, children: [(0, jsx_runtime_1.jsx)("span", { children: String(index + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsx)("span", { style: { color: colors.muted }, children: "/" }), (0, jsx_runtime_1.jsx)("span", { style: { color: colors.muted }, children: String(totalSlides).padStart(2, "0") })] }), (0, jsx_runtime_1.jsxs)("div", { style: { opacity: exitOpacity, padding: "46px", width: "100%", maxWidth: 920 }, children: [title ? ((0, jsx_runtime_1.jsx)("h1", { style: {
                            margin: 0,
                            fontSize: 72,
                            lineHeight: 1.02,
                            fontWeight: 900,
                            color: colors.text,
                            textAlign: "left",
                            letterSpacing: "-0.05em",
                            opacity: titleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(titleProgress, [0, 1], [30, 0])}px)`,
                            maxWidth: 720,
                        }, children: title })) : null, subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                            margin: "18px 0 26px",
                            fontSize: 30,
                            lineHeight: 1.5,
                            color: colors.muted,
                            maxWidth: 720,
                            opacity: subtitleProgress,
                            transform: `translateY(${(0, remotion_1.interpolate)(subtitleProgress, [0, 1], [18, 0])}px)`,
                        }, children: subtitle })) : null, (0, jsx_runtime_1.jsxs)(InfoCard, { frame: frame, delay: 10, children: [type === 'compare' && (data === null || data === void 0 ? void 0 : data.left) && (data === null || data === void 0 ? void 0 : data.right) ? ((() => {
                                var _a;
                                const left = data.left;
                                const right = data.right;
                                const lp = (0, remotion_1.spring)({ frame: frame - 18, fps: 30, config: { damping: 14 } });
                                const rp = (0, remotion_1.spring)({ frame: frame - 28, fps: 30, config: { damping: 14 } });
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 0, alignItems: 'stretch' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                padding: '24px 24px 28px 0',
                                                borderRight: `1px solid ${colors.border}`,
                                                opacity: lp,
                                                transform: `translateX(${(0, remotion_1.interpolate)(lp, [0, 1], [-18, 0])}px)`,
                                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 18, color: colors.accent3, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }, children: ["\u25C7 ", left.label || 'Before'] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 38, fontWeight: 900, color: colors.text, lineHeight: 1.18, letterSpacing: '-0.02em' }, children: left.value }), left.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12, fontSize: 20, color: colors.muted, lineHeight: 1.5 }, children: left.desc })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: colors.accent5, opacity: (0, remotion_1.spring)({ frame: frame - 32, fps: 30 }) }, children: (_a = data === null || data === void 0 ? void 0 : data.vsText) !== null && _a !== void 0 ? _a : 'VS' }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                padding: '24px 0 28px 24px',
                                                opacity: rp,
                                                transform: `translateX(${(0, remotion_1.interpolate)(rp, [0, 1], [18, 0])}px)`,
                                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 18, color: colors.accent2, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }, children: ["\u25C6 ", right.label || 'After'] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 38, fontWeight: 900, color: colors.text, lineHeight: 1.18, letterSpacing: '-0.02em' }, children: right.value }), right.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12, fontSize: 20, color: colors.muted, lineHeight: 1.5 }, children: right.desc })) : null] })] }));
                            })()) : null, type === 'quote' && (typeof (data === null || data === void 0 ? void 0 : data.quote) === 'string' || (points && points.length > 0)) ? ((() => {
                                const quoteText = (typeof (data === null || data === void 0 ? void 0 : data.quote) === 'string' ? data.quote : points === null || points === void 0 ? void 0 : points[0]) || '';
                                const author = typeof (data === null || data === void 0 ? void 0 : data.author) === 'string' ? data.author : undefined;
                                const qp = (0, remotion_1.spring)({ frame: frame - 18, fps: 30, config: { damping: 16 } });
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', padding: '20px 12px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                position: 'absolute',
                                                top: -30,
                                                left: -8,
                                                fontSize: 200,
                                                fontFamily: 'Georgia, serif',
                                                fontWeight: 900,
                                                color: colors.accent2,
                                                opacity: 0.18 * qp,
                                                lineHeight: 0.7,
                                            }, children: "\"" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                position: 'relative',
                                                fontSize: 38,
                                                fontWeight: 800,
                                                lineHeight: 1.3,
                                                color: colors.text,
                                                letterSpacing: '-0.02em',
                                                opacity: qp,
                                                transform: `translateY(${(0, remotion_1.interpolate)(qp, [0, 1], [16, 0])}px)`,
                                                paddingLeft: 12,
                                            }, children: quoteText }), author ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                marginTop: 24,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 14,
                                                opacity: (0, remotion_1.spring)({ frame: frame - 36, fps: 30 }),
                                                paddingLeft: 12,
                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 40, height: 2, background: colors.accent2 } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, color: colors.accent2, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }, children: author })] })) : null] }));
                            })()) : null, type === 'cta' ? ((() => {
                                const ctaText = (typeof (data === null || data === void 0 ? void 0 : data.cta) === 'string' && data.cta) ||
                                    (typeof (data === null || data === void 0 ? void 0 : data.button) === 'string' && data.button) ||
                                    '点赞收藏';
                                const tags = points || [];
                                const cp = (0, remotion_1.spring)({ frame: frame - 22, fps: 30, config: { damping: 13, stiffness: 110 } });
                                const pulse = 1 + Math.sin(frame * 0.12) * 0.04;
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, padding: '8px 0' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 14,
                                                padding: '24px 52px',
                                                borderRadius: 999,
                                                background: `linear-gradient(135deg, ${colors.accent1} 0%, ${colors.accent2} 100%)`,
                                                fontSize: 30,
                                                fontWeight: 800,
                                                color: 'white',
                                                boxShadow: `0 24px 56px ${colors.accent1}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                                transform: `scale(${pulse * (0, remotion_1.interpolate)(cp, [0, 1], [0.86, 1])})`,
                                                opacity: cp,
                                                letterSpacing: '-0.01em',
                                            }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 28 }, children: "\u2192" }), String(ctaText)] }), tags.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', opacity: cp }, children: tags.slice(0, 4).map((tag, i) => {
                                                const tagColor = chipPalette[i % chipPalette.length];
                                                return ((0, jsx_runtime_1.jsxs)("span", { style: {
                                                        padding: '10px 18px',
                                                        borderRadius: 999,
                                                        background: `${tagColor}18`,
                                                        border: `1px solid ${tagColor}45`,
                                                        fontSize: 17,
                                                        fontWeight: 700,
                                                        color: colors.text,
                                                        letterSpacing: '0.02em',
                                                    }, children: ["#", tag] }, `${tag}-${i}`));
                                            }) })) : null] }));
                            })()) : null, (type === 'highlight' || type === 'hero' || type === 'stats' || !type) &&
                                highlights && highlights.length > 0 ? ((0, jsx_runtime_1.jsx)(HighlightText, { highlights: highlights, frame: frame, delay: 15, getProgress: resolveProgress })) : null, steps && steps.length > 0 && type !== 'steps' ? ((0, jsx_runtime_1.jsx)(StepsFlow, { steps: steps, frame: frame, delay: 15, getProgress: resolveProgress })) : null, type === 'steps' ? ((() => {
                                const stepsData = (Array.isArray(data === null || data === void 0 ? void 0 : data.steps) ? data.steps :
                                    steps && steps.length > 0 ? steps :
                                        (points !== null && points !== void 0 ? points : []).map((p) => ({ title: p })));
                                return stepsData.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 0 }, children: stepsData.map((step, i) => {
                                        const progress = resolveProgress(`step-${i}`, 15 + i * 10);
                                        const accent = chipPalette[i % chipPalette.length];
                                        const isLast = i === stepsData.length - 1;
                                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '72px 1fr',
                                                gap: 18,
                                                alignItems: 'stretch',
                                                opacity: progress,
                                                transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-36, 0])}px)`,
                                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                width: 56,
                                                                height: 56,
                                                                borderRadius: '50%',
                                                                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                color: 'white',
                                                                fontSize: 22,
                                                                fontWeight: 900,
                                                                flexShrink: 0,
                                                                boxShadow: `0 8px 20px ${accent}40`,
                                                            }, children: String(i + 1).padStart(2, '0') }), !isLast ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                                width: 2,
                                                                flex: 1,
                                                                minHeight: 20,
                                                                background: `linear-gradient(180deg, ${accent}88, ${chipPalette[(i + 1) % chipPalette.length]}44)`,
                                                                margin: '4px 0',
                                                            } })) : null] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                        padding: '10px 18px 18px 0',
                                                        paddingBottom: isLast ? 0 : 18,
                                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                fontSize: 28,
                                                                fontWeight: 800,
                                                                color: colors.text,
                                                                lineHeight: 1.3,
                                                                marginBottom: step.description ? 6 : 0,
                                                            }, children: step.title }), step.description ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 21, color: colors.muted, lineHeight: 1.5 }, children: step.description })) : null] })] }, i));
                                    }) })) : null;
                            })()) : null, timeline && timeline.length > 0 && type !== 'timeline' ? ((0, jsx_runtime_1.jsx)(TimelineView, { items: timeline, frame: frame, delay: 15, getProgress: resolveProgress })) : null, type === 'timeline' ? ((() => {
                                const tlData = (Array.isArray(data === null || data === void 0 ? void 0 : data.timeline) ? data.timeline :
                                    timeline && timeline.length > 0 ? timeline :
                                        []);
                                return tlData.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 12 }, children: tlData.map((item, i) => {
                                        const progress = resolveProgress(`timeline-${i}`, 15 + i * 10);
                                        const accent = chipPalette[i % chipPalette.length];
                                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '110px 28px 1fr',
                                                gap: 12,
                                                alignItems: 'center',
                                                opacity: progress,
                                                transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [i % 2 === 0 ? -28 : 28, 0])}px)`,
                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: 20,
                                                        fontWeight: 900,
                                                        color: accent,
                                                        textAlign: 'right',
                                                        letterSpacing: '-0.01em',
                                                    }, children: item.year }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: '50%',
                                                                background: accent,
                                                                boxShadow: `0 0 12px ${accent}`,
                                                                flexShrink: 0,
                                                            } }), i < tlData.length - 1 ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                                width: 2,
                                                                height: 32,
                                                                background: `linear-gradient(180deg, ${accent}66, transparent)`,
                                                                marginTop: 2,
                                                            } })) : null] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                        padding: '12px 16px',
                                                        borderRadius: 16,
                                                        background: colors.panel,
                                                        border: `1px solid ${accent}28`,
                                                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: item.description ? 4 : 0 }, children: item.title }), item.description ? ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: colors.muted, lineHeight: 1.5 }, children: item.description })) : null] })] }, i));
                                    }) })) : null;
                            })()) : null, chart && type !== 'chart' ? ((0, jsx_runtime_1.jsx)(ChartView, { chart: chart, frame: frame, delay: 15, getProgress: resolveProgress })) : null, type === 'chart' ? ((() => {
                                const chartData = (data === null || data === void 0 ? void 0 : data.chart) && typeof data.chart.type === 'string'
                                    ? data.chart
                                    : chart;
                                return chartData ? ((0, jsx_runtime_1.jsx)(ChartView, { chart: chartData, frame: frame, delay: 15, getProgress: resolveProgress })) : null;
                            })()) : null, type === 'list' ? ((() => {
                                const listItems = Array.isArray(data === null || data === void 0 ? void 0 : data.items)
                                    ? data.items
                                    : (points !== null && points !== void 0 ? points : []).map((p) => ({ title: p }));
                                return listItems.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 14 }, children: listItems.map((item, i) => {
                                        const progress = resolveProgress(`list-${i}`, 15 + i * 8);
                                        const accent = chipPalette[i % chipPalette.length];
                                        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: item.icon ? '60px 1fr' : '1fr',
                                                gap: 16,
                                                alignItems: 'flex-start',
                                                padding: '18px 20px',
                                                borderRadius: 20,
                                                background: colors.panel,
                                                border: `1px solid ${accent}28`,
                                                boxShadow: `0 4px 16px rgba(0,0,0,0.18)`,
                                                opacity: progress,
                                                transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [24, 0])}px) scale(${(0, remotion_1.interpolate)(progress, [0, 1], [0.97, 1])})`,
                                            }, children: [item.icon ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                        width: 52,
                                                        height: 52,
                                                        borderRadius: 14,
                                                        background: `linear-gradient(135deg, ${accent}28, ${accent}14)`,
                                                        border: `1px solid ${accent}44`,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        fontSize: 26,
                                                        flexShrink: 0,
                                                    }, children: item.icon })) : null, !item.icon ? ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 14 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                background: accent,
                                                                boxShadow: `0 0 10px ${accent}`,
                                                                marginTop: 11,
                                                                flexShrink: 0,
                                                            } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: colors.text, lineHeight: 1.35 }, children: item.title }), item.description ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 4, fontSize: 21, color: colors.muted, lineHeight: 1.5 }, children: item.description })) : null] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: colors.text, lineHeight: 1.35 }, children: item.title }), item.description ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 4, fontSize: 21, color: colors.muted, lineHeight: 1.5 }, children: item.description })) : null] }))] }, i));
                                    }) })) : null;
                            })()) : null, type === 'default' ? ((() => {
                                const hasPoints = points && points.length > 0;
                                if (hasPoints) {
                                    return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 14 }, children: (points !== null && points !== void 0 ? points : []).map((point, i) => {
                                            const progress = resolveProgress(`point-${i}`, timing.pointsStart + i * timing.pointStagger);
                                            const accent = chipPalette[i % chipPalette.length];
                                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: '14px 1fr',
                                                    gap: 14,
                                                    alignItems: 'center',
                                                    padding: '16px 18px',
                                                    borderRadius: 18,
                                                    background: colors.panel,
                                                    border: `1px solid ${accent}22`,
                                                    opacity: progress,
                                                    transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-30, 0])}px)`,
                                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            background: accent,
                                                            boxShadow: `0 0 10px ${accent}`,
                                                        } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: colors.text, fontWeight: 600, lineHeight: 1.42 }, children: point })] }, i));
                                        }) }));
                                }
                                // No points: centered title + subtitle
                                const extraTitle = typeof (data === null || data === void 0 ? void 0 : data.title) === 'string' ? data.title : undefined;
                                const cp = (0, remotion_1.spring)({ frame: frame - 18, fps: 30, config: { damping: 16 } });
                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 18,
                                        padding: '24px 12px',
                                        textAlign: 'center',
                                    }, children: [extraTitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 44,
                                                fontWeight: 900,
                                                color: colors.text,
                                                lineHeight: 1.2,
                                                letterSpacing: '-0.03em',
                                                opacity: cp,
                                                transform: `translateY(${(0, remotion_1.interpolate)(cp, [0, 1], [20, 0])}px)`,
                                            }, children: extraTitle })) : null, subtitle ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                fontSize: 26,
                                                color: colors.muted,
                                                lineHeight: 1.5,
                                                maxWidth: 640,
                                                opacity: (0, remotion_1.spring)({ frame: frame - 28, fps: 30, config: { damping: 16 } }),
                                            }, children: subtitle })) : null] }));
                            })()) : null, points && points.length > 0 && !highlights && !steps && !timeline && !chart &&
                                type !== 'compare' && type !== 'quote' && type !== 'cta' &&
                                type !== 'list' && type !== 'steps' && type !== 'timeline' && type !== 'chart' && type !== 'default' ? ((0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 14 }, children: points.map((point, i) => {
                                    const progress = resolveProgress(`point-${i}`, timing.pointsStart + i * timing.pointStagger);
                                    const accent = chipPalette[i % chipPalette.length];
                                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "14px 1fr",
                                            gap: 14,
                                            alignItems: "center",
                                            padding: "16px 18px",
                                            borderRadius: 18,
                                            background: colors.panel,
                                            border: `1px solid ${accent}22`,
                                            opacity: progress,
                                            transform: `translateX(${(0, remotion_1.interpolate)(progress, [0, 1], [-30, 0])}px)`,
                                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: "50%",
                                                    background: accent,
                                                    boxShadow: `0 0 10px ${accent}`,
                                                } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, color: colors.text, fontWeight: 600, lineHeight: 1.42 }, children: point })] }, i));
                                }) })) : null] }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 8, marginTop: 26 }, children: [...Array(totalSlides)].map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                                width: i === index ? 34 : 10,
                                height: 10,
                                borderRadius: 999,
                                background: i === index
                                    ? `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`
                                    : "rgba(255,255,255,0.18)",
                            } }, i))) })] })] }));
};
exports.KnowledgeSlide = KnowledgeSlide;
