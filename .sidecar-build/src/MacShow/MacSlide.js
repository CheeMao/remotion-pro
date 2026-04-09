"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const LANDSCAPE_THEMES = {
    mac: {
        rootFont: "'SF Pro Display', 'PingFang SC', sans-serif",
        colors: {
            bg: "#f3f6fb",
            text: "#111827",
            muted: "#667085",
            panel: "rgba(255,255,255,0.78)",
            panelStrong: "rgba(255,255,255,0.88)",
            border: "rgba(15,23,42,0.08)",
            shadow: "rgba(15,23,42,0.08)",
            blue: "#0a84ff",
            cyan: "#58c4dc",
            purple: "#7c3aed",
            pink: "#f43f8f",
            green: "#10b981",
            red: "#ff5f57",
            yellow: "#febc2e",
            macGreen: "#28c840",
        },
        accents: ["#0a84ff", "#7c3aed", "#58c4dc", "#f43f8f", "#10b981"],
        chromeBg: "rgba(255,255,255,0.58)",
        chromeBorder: "rgba(15,23,42,0.08)",
        chromeDotInset: "inset 0 1px 1px rgba(255,255,255,0.65)",
        contentPadding: "42px 48px 50px",
        takeoverSurface: "rgba(255,255,255,0.78)",
        takeoverShadow: "0 30px 70px rgba(15,23,42,0.12)",
        takeoverInset: "none",
        infoWash: "rgba(10,132,255,0.08)",
        infoWashBorder: "rgba(10,132,255,0.12)",
        vsSurface: "rgba(255,255,255,0.68)",
        ctaGradient: "linear-gradient(90deg, #0a84ff 0%, #7c3aed 100%)",
        ctaShadow: "0 18px 36px rgba(10,132,255,0.24)",
        background: {
            base: "radial-gradient(circle at 18% 18%, rgba(88,196,220,0.18) 0%, transparent 28%), radial-gradient(circle at 84% 22%, rgba(124,58,237,0.16) 0%, transparent 24%), radial-gradient(circle at 30% 82%, rgba(244,63,143,0.14) 0%, transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
            orbOne: "radial-gradient(circle, rgba(10,132,255,0.16) 0%, rgba(10,132,255,0) 68%)",
            orbTwo: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 66%)",
            grid: "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.32) 1px, transparent 1px)",
            overlay: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(148,163,184,0.08) 100%)",
        },
    },
    studio: {
        rootFont: "'SF Pro Display', 'PingFang SC', sans-serif",
        colors: {
            bg: "#05070d",
            text: "#f8fafc",
            muted: "rgba(226,232,240,0.72)",
            panel: "rgba(8,10,18,0.82)",
            panelStrong: "rgba(12,14,24,0.9)",
            border: "rgba(94,234,212,0.14)",
            shadow: "rgba(0,0,0,0.42)",
            blue: "#22d3ee",
            cyan: "#67e8f9",
            purple: "#7c3aed",
            pink: "#e11d48",
            green: "#10b981",
            red: "#fb7185",
            yellow: "#f59e0b",
            macGreen: "#34d399",
        },
        accents: ["#22d3ee", "#e11d48", "#f59e0b", "#7c3aed", "#10b981"],
        chromeBg: "rgba(6,8,15,0.92)",
        chromeBorder: "rgba(148,163,184,0.12)",
        chromeDotInset: "inset 0 1px 0 rgba(255,255,255,0.18)",
        contentPadding: "34px 38px 40px",
        takeoverSurface: "rgba(8,10,18,0.9)",
        takeoverShadow: "0 34px 90px rgba(0,0,0,0.46)",
        takeoverInset: "inset 0 1px 0 rgba(255,255,255,0.05)",
        infoWash: "rgba(225,29,72,0.12)",
        infoWashBorder: "rgba(225,29,72,0.22)",
        vsSurface: "rgba(12,14,24,0.92)",
        ctaGradient: "linear-gradient(90deg, #e11d48 0%, #22d3ee 100%)",
        ctaShadow: "0 18px 42px rgba(225,29,72,0.28)",
        background: {
            base: "radial-gradient(circle at 16% 18%, rgba(34,211,238,0.18) 0%, transparent 28%), radial-gradient(circle at 82% 20%, rgba(225,29,72,0.18) 0%, transparent 24%), radial-gradient(circle at 58% 78%, rgba(245,158,11,0.12) 0%, transparent 24%), linear-gradient(180deg, #02040a 0%, #060914 100%)",
            orbOne: "radial-gradient(circle, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0) 70%)",
            orbTwo: "radial-gradient(circle, rgba(225,29,72,0.18) 0%, rgba(225,29,72,0) 72%)",
            grid: "linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
            overlay: "linear-gradient(180deg, rgba(2,4,10,0) 0%, rgba(15,23,42,0.28) 100%)",
        },
    },
    editorial: {
        rootFont: "'Newsreader', Georgia, 'Times New Roman', serif",
        titleFont: "'Newsreader', Georgia, 'Times New Roman', serif",
        colors: {
            bg: "#f6f0e6",
            text: "#18181b",
            muted: "#5f5b55",
            panel: "rgba(255,250,244,0.84)",
            panelStrong: "rgba(255,252,248,0.92)",
            border: "rgba(24,24,27,0.08)",
            shadow: "rgba(24,24,27,0.09)",
            blue: "#2f5bd3",
            cyan: "#0f766e",
            purple: "#7c3aed",
            pink: "#ec4899",
            green: "#15803d",
            red: "#b91c1c",
            yellow: "#b45309",
            macGreen: "#15803d",
        },
        accents: ["#18181b", "#ec4899", "#2f5bd3", "#0f766e", "#b45309"],
        chromeBg: "rgba(255,246,238,0.76)",
        chromeBorder: "rgba(24,24,27,0.08)",
        chromeDotInset: "inset 0 1px 1px rgba(255,255,255,0.55)",
        contentPadding: "44px 50px 52px",
        takeoverSurface: "rgba(255,250,244,0.9)",
        takeoverShadow: "0 28px 70px rgba(24,24,27,0.14)",
        takeoverInset: "inset 0 1px 0 rgba(255,255,255,0.72)",
        infoWash: "rgba(236,72,153,0.08)",
        infoWashBorder: "rgba(236,72,153,0.14)",
        vsSurface: "rgba(255,250,244,0.82)",
        ctaGradient: "linear-gradient(90deg, #18181b 0%, #ec4899 100%)",
        ctaShadow: "0 18px 38px rgba(24,24,27,0.14)",
        background: {
            base: "radial-gradient(circle at 18% 18%, rgba(236,72,153,0.12) 0%, transparent 28%), radial-gradient(circle at 84% 18%, rgba(47,91,211,0.1) 0%, transparent 22%), radial-gradient(circle at 50% 82%, rgba(180,83,9,0.1) 0%, transparent 28%), linear-gradient(180deg, #fbf7f1 0%, #f2ece2 100%)",
            orbOne: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0) 68%)",
            orbTwo: "radial-gradient(circle, rgba(47,91,211,0.08) 0%, rgba(47,91,211,0) 66%)",
            grid: "linear-gradient(rgba(24,24,27,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(24,24,27,0.04) 1px, transparent 1px)",
            overlay: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(24,24,27,0.04) 100%)",
        },
    },
    insight: {
        rootFont: "'Inter', 'SF Pro Display', 'PingFang SC', sans-serif",
        colors: {
            bg: "#0a0f1e",
            text: "#f1f5f9",
            muted: "rgba(203,213,225,0.72)",
            panel: "rgba(15,23,42,0.75)",
            panelStrong: "rgba(20,30,55,0.85)",
            border: "rgba(99,102,241,0.18)",
            shadow: "rgba(0,0,0,0.38)",
            blue: "#6366f1",
            cyan: "#38bdf8",
            purple: "#a78bfa",
            pink: "#f472b6",
            green: "#34d399",
            red: "#f87171",
            yellow: "#fbbf24",
            macGreen: "#34d399",
        },
        accents: ["#6366f1", "#fbbf24", "#38bdf8", "#a78bfa", "#34d399"],
        chromeBg: "rgba(10,15,30,0.88)",
        chromeBorder: "rgba(99,102,241,0.16)",
        chromeDotInset: "inset 0 1px 0 rgba(255,255,255,0.10)",
        contentPadding: "38px 44px 44px",
        takeoverSurface: "rgba(15,23,42,0.82)",
        takeoverShadow: "0 32px 80px rgba(0,0,0,0.44)",
        takeoverInset: "inset 0 1px 0 rgba(99,102,241,0.14)",
        infoWash: "rgba(99,102,241,0.10)",
        infoWashBorder: "rgba(99,102,241,0.20)",
        vsSurface: "rgba(15,23,42,0.85)",
        ctaGradient: "linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)",
        ctaShadow: "0 18px 42px rgba(99,102,241,0.30)",
        background: {
            base: "radial-gradient(circle at 16% 20%, rgba(99,102,241,0.20) 0%, transparent 28%), radial-gradient(circle at 82% 16%, rgba(56,189,248,0.16) 0%, transparent 24%), radial-gradient(circle at 46% 80%, rgba(251,191,36,0.10) 0%, transparent 24%), linear-gradient(180deg, #080d1a 0%, #0a0f1e 100%)",
            orbOne: "radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0) 70%)",
            orbTwo: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0) 68%)",
            grid: "linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
            overlay: "linear-gradient(180deg, rgba(8,13,26,0) 0%, rgba(15,23,42,0.22) 100%)",
        },
    },
};
const metricToNumber = (value) => {
    if (!value)
        return 0;
    const match = value.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
};
const splitPoint = (point) => {
    const parts = point
        .split(/[:：-]\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
    return parts.length <= 1
        ? { title: point.trim() }
        : { title: parts[0], desc: parts.slice(1).join(" - ") };
};
const toList = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.items)) {
        const normalized = [];
        data.items.forEach((item) => {
            if (typeof item === "string") {
                normalized.push(splitPoint(item));
                return;
            }
            if (!item || typeof item !== "object")
                return;
            const record = item;
            const title = typeof record.text === "string"
                ? record.text
                : typeof record.title === "string"
                    ? record.title
                    : "";
            if (!title)
                return;
            normalized.push({
                title,
                desc: typeof record.desc === "string"
                    ? record.desc
                    : typeof record.description === "string"
                        ? record.description
                        : undefined,
            });
        });
        return normalized;
    }
    return (points || []).map(splitPoint);
};
const toStats = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.stats)) {
        const normalized = [];
        data.stats.forEach((item) => {
            if (!item || typeof item !== "object")
                return;
            const record = item;
            normalized.push({
                label: typeof record.label === "string"
                    ? record.label
                    : typeof record.title === "string"
                        ? record.title
                        : "Metric",
                value: typeof record.value === "number" || typeof record.value === "string"
                    ? `${record.value}${typeof record.suffix === "string" ? record.suffix : ""}`
                    : "0",
                note: typeof record.note === "string" ? record.note : undefined,
            });
        });
        return normalized;
    }
    return (points || []).map((point, index) => {
        const parsed = splitPoint(point);
        return { label: parsed.title || `Metric ${index + 1}`, value: parsed.desc || parsed.title };
    });
};
const toChart = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.bars)) {
        return data.bars
            .map((item) => {
            var _a;
            if (!item || typeof item !== "object")
                return null;
            const record = item;
            const raw = (_a = record.percent) !== null && _a !== void 0 ? _a : record.value;
            const value = typeof raw === "number" ? raw : Number(raw || 0);
            if (typeof record.label !== "string" || Number.isNaN(value))
                return null;
            return { label: record.label, value };
        })
            .filter((item) => item !== null);
    }
    return (points || []).map((point, index) => {
        const parsed = splitPoint(point);
        return {
            label: parsed.title || `Bar ${index + 1}`,
            value: Number((parsed.desc || "0").replace(/[^\d.-]/g, "")) || 0,
        };
    });
};
const toCompare = (points, data) => {
    const left = (data === null || data === void 0 ? void 0 : data.left) && typeof data.left === "object" ? data.left : undefined;
    const right = (data === null || data === void 0 ? void 0 : data.right) && typeof data.right === "object" ? data.right : undefined;
    if (left && right) {
        return {
            left: {
                label: typeof left.label === "string" ? left.label : "Before",
                value: typeof left.value === "string" ? left.value : typeof left.title === "string" ? left.title : "",
                desc: typeof left.desc === "string" ? left.desc : undefined,
            },
            right: {
                label: typeof right.label === "string" ? right.label : "After",
                value: typeof right.value === "string" ? right.value : typeof right.title === "string" ? right.title : "",
                desc: typeof right.desc === "string" ? right.desc : undefined,
            },
        };
    }
    const [l, r] = points || [];
    const leftPoint = splitPoint(l || "Before");
    const rightPoint = splitPoint(r || "After");
    return {
        left: { label: leftPoint.title, value: leftPoint.desc || leftPoint.title },
        right: { label: rightPoint.title, value: rightPoint.desc || rightPoint.title },
    };
};
const toTimeline = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.timeline)) {
        const normalized = [];
        data.timeline.forEach((item) => {
            if (!item || typeof item !== "object")
                return;
            const record = item;
            if (typeof record.title !== "string")
                return;
            normalized.push({
                year: typeof record.year === "string" ? record.year : "",
                title: record.title,
                desc: typeof record.description === "string" ? record.description : undefined,
            });
        });
        return normalized;
    }
    return (points || []).map((point, index) => {
        const parsed = splitPoint(point);
        return { year: String(index + 1).padStart(2, "0"), title: parsed.title, desc: parsed.desc };
    });
};
const toSteps = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.steps)) {
        const normalized = [];
        data.steps.forEach((item) => {
            if (!item || typeof item !== "object")
                return;
            const record = item;
            const stepTitle = typeof record.title === "string" ? record.title : "";
            if (!stepTitle)
                return;
            normalized.push({
                title: stepTitle,
                desc: typeof record.description === "string"
                    ? record.description
                    : typeof record.desc === "string"
                        ? record.desc
                        : undefined,
            });
        });
        return normalized;
    }
    return (points || []).map(splitPoint);
};
const WindowFrame = ({ children, frame, index, totalSlides, theme }) => {
    const c = theme.colors;
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({ frame, fps, config: { damping: 18, stiffness: 110 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: 1560,
            minHeight: 850,
            borderRadius: 30,
            background: c.panel,
            border: `1px solid ${c.border}`,
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            boxShadow: `0 32px 80px ${c.shadow}, ${theme.takeoverInset}`,
            overflow: "hidden",
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [24, 0])}px) scale(${(0, remotion_1.interpolate)(progress, [0, 1], [0.98, 1])})`,
            opacity: progress,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    height: 72,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 28px",
                    background: theme.chromeBg,
                    borderBottom: `1px solid ${theme.chromeBorder}`,
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 10 }, children: [c.red, c.yellow, c.macGreen].map((color) => ((0, jsx_runtime_1.jsx)("div", { style: {
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: color,
                                boxShadow: theme.chromeDotInset,
                            } }, color))) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 15, color: c.muted, fontWeight: 700 }, children: [String(index + 1).padStart(2, "0"), " / ", String(totalSlides).padStart(2, "0")] })] }), (0, jsx_runtime_1.jsx)("div", { style: { padding: theme.contentPadding }, children: children })] }));
};
const Background = ({ frame, theme }) => {
    const drift = Math.sin(frame * 0.01) * 3;
    const orbX = Math.sin(frame * 0.012) * 40;
    const orbY = Math.cos(frame * 0.009) * 28;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    background: theme.background.base,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    width: 520,
                    height: 520,
                    left: 110 + orbX,
                    top: 100 + orbY,
                    borderRadius: "50%",
                    background: theme.background.orbOne,
                    filter: "blur(18px)",
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    width: 480,
                    height: 480,
                    right: 120 - orbX * 0.6,
                    bottom: 90 - orbY * 0.6,
                    borderRadius: "50%",
                    background: theme.background.orbTwo,
                    filter: "blur(24px)",
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: theme.background.grid,
                    backgroundSize: "64px 64px",
                    opacity: 0.42,
                    transform: `translate(${drift}px, ${drift * 0.5}px)`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: theme.background.overlay,
                } })] }));
};
const SectionHeader = ({ title, subtitle, frame, compact = false, theme }) => {
    const c = theme.colors;
    const { fps } = (0, remotion_1.useVideoConfig)();
    const titleIn = (0, remotion_1.spring)({ frame: frame - 2, fps, config: { damping: 18, stiffness: 120 } });
    const subIn = (0, remotion_1.spring)({ frame: frame - 10, fps, config: { damping: 18, stiffness: 110 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: compact ? 24 : 34 }, children: [title ? ((0, jsx_runtime_1.jsx)("h1", { style: {
                    margin: 0,
                    fontSize: compact ? 54 : 72,
                    lineHeight: compact ? 1.02 : 0.98,
                    letterSpacing: "-0.05em",
                    fontWeight: 900,
                    color: c.text,
                    fontFamily: theme.titleFont || theme.rootFont,
                    transform: `translateY(${(0, remotion_1.interpolate)(titleIn, [0, 1], [18, 0])}px)`,
                    opacity: titleIn,
                }, children: title })) : null, subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: {
                    margin: "16px 0 0",
                    fontSize: compact ? 24 : 28,
                    lineHeight: 1.5,
                    color: c.muted,
                    maxWidth: 920,
                    fontFamily: theme.rootFont,
                    transform: `translateY(${(0, remotion_1.interpolate)(subIn, [0, 1], [14, 0])}px)`,
                    opacity: subIn,
                }, children: subtitle })) : null] }));
};
const SoftCard = ({ children, frame, delay = 0, accent, style, theme }) => {
    const c = theme.colors;
    const resolvedAccent = accent || theme.accents[0];
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            background: c.panelStrong,
            borderRadius: 24,
            border: `1px solid ${c.border}`,
            boxShadow: `0 18px 40px ${c.shadow}, ${theme.takeoverInset}`,
            position: "relative",
            overflow: "hidden",
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [16, 0])}px) scale(${(0, remotion_1.interpolate)(progress, [0, 1], [0.985, 1])})`,
            opacity: progress,
            ...style,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, ${resolvedAccent}12 0%, transparent 36%)`,
                    pointerEvents: "none",
                } }), (0, jsx_runtime_1.jsx)("div", { style: { position: "relative", zIndex: 1 }, children: children })] }));
};
const Pill = ({ text, accent, frame, delay = 0, theme }) => {
    const c = theme.colors;
    const resolvedAccent = accent || theme.accents[0];
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({ frame: frame - delay, fps, config: { damping: 18, stiffness: 115 } });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 999,
            border: `1px solid ${resolvedAccent}25`,
            background: `${resolvedAccent}14`,
            color: c.text,
            fontSize: 18,
            fontWeight: 700,
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [12, 0])}px)`,
            opacity: progress,
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: resolvedAccent,
                    boxShadow: `0 0 0 8px ${resolvedAccent}16`,
                } }), text] }));
};
const SignalMeter = ({ items, frame, delay = 0, theme }) => {
    const c = theme.colors;
    const accents = theme.accents;
    const { fps } = (0, remotion_1.useVideoConfig)();
    const progress = (0, remotion_1.spring)({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: "grid",
            gap: 14,
            transform: `translateY(${(0, remotion_1.interpolate)(progress, [0, 1], [12, 0])}px)`,
            opacity: progress,
        }, children: items.map((item, index) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 15, color: c.muted, fontWeight: 700 }, children: item.label }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 15, color: c.text, fontWeight: 800 }, children: item.value })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(148,163,184,0.15)",
                        overflow: "hidden",
                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                            width: `${Math.max(20, 76 - index * 10)}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${accents[index % accents.length]} 0%, ${accents[(index + 1) % accents.length]} 100%)`,
                        } }) })] }, `${item.label}-${index}`))) }));
};
const MacSlide = ({ title, subtitle, points, type = "default", variant = "mac", data, index, totalSlides, durationInFrames, }) => {
    const theme = LANDSCAPE_THEMES[variant];
    const c = theme.colors;
    const accents = theme.accents;
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const slideDuration = Math.max(1, durationInFrames);
    const clampTiming = {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    };
    const hookTakeover = (0, remotion_1.interpolate)(frame, [0, slideDuration * 0.12, slideDuration * 0.26], [1, 1, 0], clampTiming);
    const revealProgress = (0, remotion_1.interpolate)(frame, [slideDuration * 0.1, slideDuration * 0.36], [0, 1], clampTiming);
    const evidenceReveal = (0, remotion_1.interpolate)(frame, [slideDuration * 0.34, slideDuration * 0.6], [0, 1], clampTiming);
    const endingPulse = (0, remotion_1.spring)({
        frame: frame - Math.max(0, slideDuration - 22),
        fps,
        config: { damping: 10, stiffness: 140 },
    });
    const items = toList(points, data).slice(0, 6);
    const stats = toStats(points, data).slice(0, 4);
    const bars = toChart(points, data).slice(0, 5);
    const compare = toCompare(points, data);
    const timeline = toTimeline(points, data).slice(0, 5);
    const steps = toSteps(points, data).slice(0, 4);
    const mainStat = stats[0];
    const winnerScoreLeft = metricToNumber(compare.left.value);
    const winnerScoreRight = metricToNumber(compare.right.value);
    const compareWinner = winnerScoreRight >= winnerScoreLeft
        ? { side: "right", label: compare.right.label, value: compare.right.value }
        : { side: "left", label: compare.left.label, value: compare.left.value };
    const activeItemIndex = items.length > 0
        ? Math.min(items.length - 1, Math.floor((0, remotion_1.interpolate)(frame, [slideDuration * 0.28, slideDuration * 0.84], [0, items.length], clampTiming)))
        : 0;
    const heroBadge = typeof (data === null || data === void 0 ? void 0 : data.badge) === "string" && data.badge.trim().length > 0 ? data.badge : undefined;
    const heroCta = typeof (data === null || data === void 0 ? void 0 : data.cta) === "string"
        ? data.cta
        : typeof (data === null || data === void 0 ? void 0 : data.button) === "string"
            ? data.button
            : variant === "studio"
                ? "Launch the rundown"
                : variant === "editorial"
                    ? "Frame the next story"
                    : "Start the flow";
    const quoteText = typeof (data === null || data === void 0 ? void 0 : data.quote) === "string"
        ? data.quote
        : subtitle || title || "";
    const quoteAuthor = typeof (data === null || data === void 0 ? void 0 : data.author) === "string" ? data.author : undefined;
    const highlightItems = (() => {
        if (Array.isArray(data === null || data === void 0 ? void 0 : data.items)) {
            return data.items
                .map((item) => {
                if (typeof item === "string")
                    return item;
                if (item && typeof item === "object") {
                    const record = item;
                    if (typeof record.text === "string")
                        return record.text;
                    if (typeof record.title === "string")
                        return record.title;
                }
                return undefined;
            })
                .filter((item) => typeof item === "string" && item.trim().length > 0)
                .slice(0, 8);
        }
        return (points || []).filter((item) => item.trim().length > 0).slice(0, 8);
    })();
    const renderHero = () => {
        var _a;
        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 30, minHeight: 690, position: "relative" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        opacity: hookTakeover,
                        transform: `scale(${(0, remotion_1.interpolate)(hookTakeover, [0, 1], [1.08, 1])})`,
                        zIndex: 4,
                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                            maxWidth: 1120,
                            padding: "30px 40px",
                            borderRadius: 30,
                            background: theme.takeoverSurface,
                            border: `1px solid ${c.border}`,
                            boxShadow: `${theme.takeoverShadow}, ${theme.takeoverInset}`,
                            textAlign: "center",
                        }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 78, lineHeight: 0.95, color: c.text, fontWeight: 900, letterSpacing: "-0.06em" }, children: title || "Mac workflow" }) }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        opacity: revealProgress,
                        transform: `translateY(${(0, remotion_1.interpolate)(revealProgress, [0, 1], [20, 0])}px)`,
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [heroBadge ? (0, jsx_runtime_1.jsx)(Pill, { text: heroBadge, frame: frame, theme: theme }) : null, (0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, theme: theme })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 18 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }, children: [(0, jsx_runtime_1.jsx)(Pill, { text: heroCta, accent: c.purple, frame: frame, delay: 8, theme: theme }), items.slice(0, 2).map((item, itemIndex) => ((0, jsx_runtime_1.jsx)(Pill, { text: item.title, accent: accents[(itemIndex + 2) % accents.length], frame: frame, delay: 12 + itemIndex * 5, theme: theme }, `${item.title}-${itemIndex}`)))] }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "grid",
                        gridTemplateRows: "1.2fr 0.8fr",
                        gap: 18,
                        opacity: revealProgress,
                        transform: `translateY(${(0, remotion_1.interpolate)(revealProgress, [0, 1], [28, 0])}px) scale(${(0, remotion_1.interpolate)(revealProgress, [0, 1], [0.98, 1])})`,
                    }, children: [(0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 8, accent: c.blue, style: { padding: 24 }, theme: theme, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 38, fontWeight: 800, color: c.text, lineHeight: 1.08 }, children: title || "Mac workflow" }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 20, lineHeight: 1.6, color: c.muted }, children: subtitle || "Clean, calm, and product-like horizontal storytelling." })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 14 }, children: (0, jsx_runtime_1.jsx)(SignalMeter, { items: stats.slice(0, 3), frame: frame, delay: 12, theme: theme }) })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        marginTop: 20,
                                        padding: "18px 20px",
                                        borderRadius: 20,
                                        background: theme.infoWash,
                                        border: `1px solid ${theme.infoWashBorder}`,
                                        opacity: evidenceReveal,
                                        transform: `translateY(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [16, 0])}px)`,
                                    }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, lineHeight: 1.35, color: c.text, fontWeight: 800 }, children: ((_a = items[0]) === null || _a === void 0 ? void 0 : _a.title) || title || "Lead with one result before explaining the workflow." }) })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }, children: items.slice(0, 3).map((item, itemIndex) => ((0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 14 + itemIndex * 6, accent: accents[itemIndex % accents.length], style: { padding: 20 }, theme: theme, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 14, color: c.muted, fontWeight: 700 }, children: ["0", itemIndex + 1] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 24, fontWeight: 800, color: c.text, lineHeight: 1.15 }, children: item.title }), item.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 10, fontSize: 17, color: c.muted, lineHeight: 1.55 }, children: item.desc })) : null] }, `${item.title}-${itemIndex}`))) })] })] }));
    };
    const renderDefault = () => {
        var _a, _b, _c;
        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, minHeight: 690 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 16 }, children: items.map((item, itemIndex) => ((0, jsx_runtime_1.jsx)(SoftCard, { frame: frame, delay: 14 + itemIndex * 9, accent: accents[itemIndex % accents.length], style: {
                                    padding: "20px 22px",
                                    marginLeft: itemIndex === activeItemIndex ? (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [0, 14]) : 0,
                                    filter: itemIndex === activeItemIndex
                                        ? `brightness(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 1.04])})`
                                        : `brightness(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 0.88])})`,
                                    boxShadow: itemIndex === activeItemIndex
                                        ? `0 28px 50px ${accents[itemIndex % accents.length]}18, ${theme.takeoverInset}`
                                        : undefined,
                                }, theme: theme, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "64px 1fr", gap: 18, alignItems: "start" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                width: 64,
                                                height: 64,
                                                borderRadius: 18,
                                                background: `${accents[itemIndex % accents.length]}16`,
                                                color: accents[itemIndex % accents.length],
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 900,
                                                fontSize: 24,
                                            }, children: String(itemIndex + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        fontSize: itemIndex === activeItemIndex ? 32 : 28,
                                                        lineHeight: 1.2,
                                                        color: c.text,
                                                        fontWeight: 800,
                                                    }, children: item.title }), item.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 19, lineHeight: 1.6, color: c.muted }, children: item.desc })) : null] })] }) }, `${item.title}-${itemIndex}`))) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gap: 18, alignContent: "start" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                opacity: evidenceReveal,
                                transform: `translateY(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [30, 0])}px) scale(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [0.96, 1])})`,
                            }, children: (0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 14, accent: c.cyan, style: { padding: 22 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, lineHeight: 1.22, color: c.text, fontWeight: 800 }, children: ((_a = items[activeItemIndex]) === null || _a === void 0 ? void 0 : _a.title) || title || "Main takeaway" }), ((_b = items[activeItemIndex]) === null || _b === void 0 ? void 0 : _b.desc) ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 10, fontSize: 18, lineHeight: 1.6, color: c.muted }, children: (_c = items[activeItemIndex]) === null || _c === void 0 ? void 0 : _c.desc })) : null, (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 16 }, children: (0, jsx_runtime_1.jsx)(SignalMeter, { items: stats.slice(0, 3), frame: frame, delay: 18, theme: theme }) })] }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                                opacity: evidenceReveal,
                                transform: `translateY(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [36, 0])}px)`,
                            }, children: (0, jsx_runtime_1.jsx)(SoftCard, { frame: frame, delay: 22, accent: c.pink, style: { padding: 22 }, theme: theme, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, lineHeight: 1.7, color: c.muted }, children: subtitle || "Keep one main takeaway on screen and let narration carry the detail." }) }) })] })] }));
    };
    const renderStats = () => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), mainStat ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    marginBottom: 18,
                    transform: `scale(${(0, remotion_1.interpolate)(revealProgress, [0, 1], [0.96, 1])})`,
                    transformOrigin: "center center",
                }, children: (0, jsx_runtime_1.jsx)(SoftCard, { frame: frame, delay: 6, accent: c.blue, style: { padding: "28px 30px" }, theme: theme, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 24, alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { style: {
                                        fontSize: 110,
                                        lineHeight: 0.92,
                                        color: c.text,
                                        fontWeight: 900,
                                        letterSpacing: "-0.08em",
                                        transform: `scale(${(0, remotion_1.interpolate)(endingPulse, [0, 1], [1, 1.05])})`,
                                        transformOrigin: "left center",
                                    }, children: mainStat.value }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 30, lineHeight: 1.2, color: c.text, fontWeight: 800 }, children: mainStat.label }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12, fontSize: 20, lineHeight: 1.65, color: c.muted }, children: mainStat.note || subtitle || "Open with the number that feels like proof, then let the rest support it." })] })] }) }) })) : null, (0, jsx_runtime_1.jsx)("div", { style: {
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.max(2, Math.min(3, Math.max(1, stats.length - (mainStat ? 1 : 0))))}, 1fr)`,
                    gap: 18,
                }, children: stats.slice(mainStat ? 1 : 0).map((item, itemIndex) => ((0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 12 + itemIndex * 5, accent: accents[itemIndex % accents.length], style: { padding: 24, minHeight: 220 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 16, color: c.muted, fontWeight: 700 }, children: item.label }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18, fontSize: 54, lineHeight: 1, color: c.text, fontWeight: 900 }, children: item.value }), item.note ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18, fontSize: 18, lineHeight: 1.6, color: c.muted }, children: item.note })) : null] }, `${item.label}-${itemIndex}`))) })] }));
    const renderCompare = () => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), (0, jsx_runtime_1.jsx)("div", { style: {
                    marginBottom: 18,
                    opacity: evidenceReveal,
                    transform: `translateY(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [20, 0])}px) scale(${(0, remotion_1.interpolate)(evidenceReveal, [0, 1], [0.98, 1])})`,
                }, children: (0, jsx_runtime_1.jsx)(SoftCard, { frame: frame, delay: 6, accent: compareWinner.side === "right" ? c.green : c.pink, style: { padding: "18px 22px" }, theme: theme, children: (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 28, lineHeight: 1.2, color: c.text, fontWeight: 800 }, children: [compareWinner.label, " wins attention with ", compareWinner.value] }) }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 140px 1fr", gap: 18, alignItems: "stretch" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            opacity: compareWinner.side === "left"
                                ? 1
                                : (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 0.68]),
                            transform: `scale(${compareWinner.side === "left"
                                ? (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 1.03])
                                : (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 0.97])})`,
                        }, children: (0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 8, accent: c.pink, style: { padding: 28 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 16, color: c.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: compare.left.label }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18, fontSize: 44, lineHeight: 1.06, color: c.text, fontWeight: 900 }, children: compare.left.value }), compare.left.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 16, fontSize: 20, color: c.muted, lineHeight: 1.6 }, children: compare.left.desc })) : null] }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", alignItems: "center", justifyContent: "center" }, children: (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 14, justifyItems: "center" }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: 110,
                                    height: 110,
                                    borderRadius: "50%",
                                    background: theme.vsSurface,
                                    border: `1px solid ${c.border}`,
                                    boxShadow: `0 18px 36px ${c.shadow}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: c.text,
                                    fontWeight: 900,
                                    fontSize: 30,
                                    letterSpacing: "-0.04em",
                                }, children: "VS" }) }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                            opacity: compareWinner.side === "right"
                                ? 1
                                : (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 0.68]),
                            transform: `scale(${compareWinner.side === "right"
                                ? (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 1.03])
                                : (0, remotion_1.interpolate)(evidenceReveal, [0, 1], [1, 0.97])})`,
                        }, children: (0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 14, accent: c.green, style: { padding: 28 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 16, color: c.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: compare.right.label }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18, fontSize: 44, lineHeight: 1.06, color: c.text, fontWeight: 900 }, children: compare.right.value }), compare.right.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 16, fontSize: 20, color: c.muted, lineHeight: 1.6 }, children: compare.right.desc })) : null] }) })] })] }));
    const renderSteps = () => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.max(3, Math.min(4, items.length || 3))}, 1fr)`, gap: 18 }, children: steps.map((item, itemIndex) => ((0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 14 + itemIndex * 9, accent: accents[itemIndex % accents.length], style: { padding: 24, minHeight: 260 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                width: 58,
                                height: 58,
                                borderRadius: 18,
                                background: `${accents[itemIndex % accents.length]}16`,
                                color: accents[itemIndex % accents.length],
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                fontWeight: 900,
                            }, children: String(itemIndex + 1).padStart(2, "0") }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 20, fontSize: 28, lineHeight: 1.2, color: c.text, fontWeight: 800 }, children: item.title }), item.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12, fontSize: 18, lineHeight: 1.65, color: c.muted }, children: item.desc })) : null] }, `${item.title}-${itemIndex}`))) })] }));
    const renderChart = () => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), (0, jsx_runtime_1.jsx)(SoftCard, { frame: frame, delay: 8, accent: c.cyan, style: { padding: 28 }, theme: theme, children: (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gap: 20 }, children: bars.map((item, itemIndex) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "220px 1fr 70px", gap: 16, alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 18, color: c.text, fontWeight: 700 }, children: item.label }), (0, jsx_runtime_1.jsx)("div", { style: { height: 18, borderRadius: 999, background: "rgba(148,163,184,0.16)", overflow: "hidden" }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                        width: `${Math.max(6, Math.min(100, item.value))}%`,
                                        height: "100%",
                                        borderRadius: 999,
                                        background: `linear-gradient(90deg, ${accents[itemIndex % accents.length]} 0%, ${accents[(itemIndex + 1) % accents.length]} 100%)`,
                                    } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 18, color: c.muted, fontWeight: 800, textAlign: "right" }, children: [item.value, "%"] })] }, `${item.label}-${itemIndex}`))) }) })] }));
    const renderTimeline = () => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), (0, jsx_runtime_1.jsx)("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.max(3, Math.min(4, timeline.length))}, 1fr)`, gap: 18 }, children: timeline.map((item, itemIndex) => ((0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 14 + itemIndex * 9, accent: accents[itemIndex % accents.length], style: { padding: 22, minHeight: 250 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 16, color: accents[itemIndex % accents.length], fontWeight: 800 }, children: item.year }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 16, fontSize: 28, lineHeight: 1.22, color: c.text, fontWeight: 800 }, children: item.title }), item.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12, fontSize: 18, lineHeight: 1.65, color: c.muted }, children: item.desc })) : null] }, `${item.year}-${item.title}-${itemIndex}`))) })] }));
    const renderHighlight = () => ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: 690, display: "flex", flexDirection: "column", justifyContent: "center" }, children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, compact: true, theme: theme }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 16, flexWrap: "wrap" }, children: highlightItems.map((item, itemIndex) => ((0, jsx_runtime_1.jsx)(Pill, { text: item, accent: accents[itemIndex % accents.length], frame: frame, delay: 12 + itemIndex * 7, theme: theme }, `${item}-${itemIndex}`))) })] }));
    const renderQuote = () => ((0, jsx_runtime_1.jsx)("div", { style: { minHeight: 690, display: "flex", alignItems: "center" }, children: (0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 8, accent: c.purple, style: { padding: "42px 48px", width: "100%" }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 76, lineHeight: 0.8, color: c.blue, fontWeight: 800 }, children: "\u201C" }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 46, lineHeight: 1.22, color: c.text, fontWeight: 800, maxWidth: 1180 }, children: quoteText }), quoteAuthor ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 22, fontSize: 22, color: c.muted, fontWeight: 700 }, children: quoteAuthor })) : null] }) }));
    const renderCta = () => ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: 690, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "center" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, subtitle: subtitle, frame: frame, theme: theme }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }, children: highlightItems.slice(0, 3).map((item, itemIndex) => ((0, jsx_runtime_1.jsx)(Pill, { text: item, accent: accents[itemIndex % accents.length], frame: frame, delay: 10 + itemIndex * 4, theme: theme }, `${item}-${itemIndex}`))) })] }), (0, jsx_runtime_1.jsxs)(SoftCard, { frame: frame, delay: 12, accent: c.blue, style: { padding: 28 }, theme: theme, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 34, lineHeight: 1.15, color: c.text, fontWeight: 900 }, children: heroCta }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 18, lineHeight: 1.65, color: c.muted }, children: subtitle || "Wrap the video with one clear action, one clear reason, and one calm confident finish." }), (0, jsx_runtime_1.jsx)("div", { style: {
                            marginTop: 28,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "16px 24px",
                            borderRadius: 999,
                            background: theme.ctaGradient,
                            color: "white",
                            fontSize: 20,
                            fontWeight: 800,
                            boxShadow: theme.ctaShadow,
                            transform: `scale(${(0, remotion_1.interpolate)(endingPulse, [0, 1], [1, 1.08])})`,
                            transformOrigin: "left center",
                        }, children: heroCta }), highlightItems.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }, children: highlightItems.slice(0, 4).map((item, itemIndex) => ((0, jsx_runtime_1.jsx)("div", { style: {
                                padding: "10px 14px",
                                borderRadius: 999,
                                background: `${accents[itemIndex % accents.length]}12`,
                                border: `1px solid ${accents[itemIndex % accents.length]}22`,
                                color: c.text,
                                fontSize: 15,
                                fontWeight: 700,
                            }, children: item }, `${item}-tag-${itemIndex}`))) })) : null] })] }));
    const renderBody = () => {
        switch (type) {
            case "hero":
                return renderHero();
            case "stats":
                return renderStats();
            case "compare":
                return renderCompare();
            case "steps":
                return renderSteps();
            case "chart":
                return renderChart();
            case "timeline":
                return renderTimeline();
            case "highlight":
                return renderHighlight();
            case "quote":
                return renderQuote();
            case "cta":
                return renderCta();
            case "list":
            case "default":
            default:
                return renderDefault();
        }
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { fontFamily: theme.rootFont, color: c.text }, children: [(0, jsx_runtime_1.jsx)(Background, { frame: frame, theme: theme }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { alignItems: "center", justifyContent: "center", padding: 42 }, children: (0, jsx_runtime_1.jsx)(WindowFrame, { frame: frame, index: index, totalSlides: totalSlides, theme: theme, children: renderBody() }) })] }));
};
exports.MacSlide = MacSlide;
