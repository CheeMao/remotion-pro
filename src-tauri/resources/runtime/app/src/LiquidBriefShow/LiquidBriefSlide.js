"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidBriefSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const animationTiming_1 = require("../templates/animationTiming");
const c = {
    ink: '#1d2637',
    muted: '#69798b',
    soft: '#8a97a6',
    pink: '#ff8ec8',
    aqua: '#7ce6ec',
    apricot: '#ffc892',
    lavender: '#b6a7ff',
    line: 'rgba(124,138,160,0.18)',
};
const pill = (color) => `linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.68) 100%)`;
const rise = (p, y = 20) => `translateY(${(0, remotion_1.interpolate)(p, [0, 1], [y, 0])}px)`;
const glassBase = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.72) 100%)',
    border: '1px solid rgba(255,255,255,0.82)',
    boxShadow: '0 24px 48px rgba(146, 154, 172, 0.14), 0 6px 14px rgba(255,255,255,0.28) inset',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
};
const tagStyle = (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 15px',
    borderRadius: 999,
    background: `${color}22`,
    border: `1px solid ${color}52`,
    boxShadow: '0 4px 14px rgba(255,255,255,0.24) inset',
    fontSize: 15,
    fontWeight: 800,
    color: c.ink,
    letterSpacing: '0.02em',
});
const LiquidBriefSlide = ({ title, subtitle, items = [], type = 'cover', data, index, totalSlides, durationInFrames, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const count = type === 'cover' ? items.length :
        type === 'cards' && Array.isArray(data === null || data === void 0 ? void 0 : data.cards) ? data.cards.length :
            type === 'steps' && Array.isArray(data === null || data === void 0 ? void 0 : data.steps) ? data.steps.length :
                type === 'stats' && Array.isArray(data === null || data === void 0 ? void 0 : data.stats) ? data.stats.length :
                    type === 'quote' && Array.isArray(data === null || data === void 0 ? void 0 : data.tags) ? data.tags.length : 2;
    const t = (0, animationTiming_1.getSlideMotionTiming)(durationInFrames, count);
    const enter = (0, remotion_1.spring)({ frame, fps, config: { damping: 18, stiffness: 100 } });
    const head = (0, remotion_1.spring)({ frame: frame - 4, fps, config: { damping: 18, stiffness: 120 } });
    const titleIn = (0, remotion_1.spring)({ frame: frame - t.titleStart, fps, config: { damping: 18, stiffness: 100 } });
    const subIn = (0, remotion_1.spring)({ frame: frame - t.subtitleStart, fps, config: { damping: 18, stiffness: 90 } });
    const lineIn = (0, remotion_1.spring)({ frame: frame - t.lineStart, fps, config: { damping: 18, stiffness: 110 } });
    const exit = (0, remotion_1.interpolate)(frame, [t.exitStart, t.exitEnd], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const shift = Math.sin(frame * 0.012) * 20;
    const titleSize = type === 'cover' ? 74 : 58;
    const titleLine = type === 'cover' ? 1.05 : 1.08;
    const numPill = (number, color) => ((0, jsx_runtime_1.jsx)("div", { style: {
            width: 58,
            height: 40,
            borderRadius: 999,
            background: pill(color),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 24px ${color}45`,
        }, children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 18, fontWeight: 800, color: c.ink }, children: number }) }));
    const panelShell = (color) => ({
        ...glassBase,
        borderRadius: 28,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(135deg, ${color}10 0%, transparent 40%)`,
    });
    const render = () => {
        if (type === 'cover') {
            return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }, children: items.map((item, i) => {
                    const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 16, stiffness: 110 } });
                    const color = item.color || [c.pink, c.aqua, c.apricot][i % 3];
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            ...panelShell(color),
                            minHeight: i === 0 ? 176 : 154,
                            padding: '24px 28px 26px',
                            gridColumn: i === 0 ? '1 / 2' : 'auto',
                            opacity: p,
                            transform: `${rise(p, 22)} scale(${(0, remotion_1.interpolate)(p, [0, 1], [0.986, 1])})`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'absolute',
                                    inset: 0,
                                    background: `radial-gradient(circle at 88% 18%, ${color}2c 0%, transparent 32%), radial-gradient(circle at 12% 100%, rgba(255,255,255,0.76) 0%, transparent 36%)`,
                                    pointerEvents: 'none',
                                } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [numPill(item.number, color), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 24, fontSize: i === 0 ? 34 : 30, fontWeight: 800, lineHeight: 1.22, color: c.ink, letterSpacing: '-0.035em', maxWidth: i === 0 ? 380 : undefined }, children: item.title }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 20, width: i === 0 ? 96 : 72, height: 4, borderRadius: 999, background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.95) 100%)`, boxShadow: `0 0 18px ${color}55` } })] })] }, `${item.number}-${i}`));
                }) }));
        }
        if (type === 'cards') {
            const cards = (data === null || data === void 0 ? void 0 : data.cards) || [];
            return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }, children: cards.map((card, i) => {
                    const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 16, stiffness: 100 } });
                    const color = card.color || [c.pink, c.aqua, c.lavender, c.apricot][i % 4];
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            ...panelShell(color),
                            minHeight: 248,
                            padding: '24px 24px 24px',
                            opacity: p,
                            transform: `${rise(p, 18)} scale(${(0, remotion_1.interpolate)(p, [0, 1], [0.984, 1])})`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: -22, right: -16, width: 118, height: 118, borderRadius: '50%', background: `radial-gradient(circle, ${color}40 0%, ${color}08 52%, transparent 74%)`, filter: 'blur(4px)' } }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.85) 100%)` } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, children: (0, jsx_runtime_1.jsx)("div", { style: tagStyle(color), children: card.eyebrow || `0${i + 1}` }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 22, fontSize: 30, fontWeight: 800, lineHeight: 1.16, color: c.ink, letterSpacing: '-0.04em', maxWidth: 290 }, children: card.title }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 21, lineHeight: 1.58, color: c.muted, fontWeight: 500 }, children: card.body })] })] }, `${card.title}-${i}`));
                }) }));
        }
        if (type === 'steps') {
            const steps = (data === null || data === void 0 ? void 0 : data.steps) || [];
            return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 18 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: 27, top: 62, bottom: 62, width: 2, background: 'linear-gradient(180deg, rgba(255,142,200,0.45) 0%, rgba(124,230,236,0.42) 52%, rgba(255,200,146,0.42) 100%)' } }), steps.map((step, i) => {
                        const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 15, stiffness: 100 } });
                        const color = step.color || [c.pink, c.aqua, c.apricot][i % 3];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 18, opacity: p, transform: rise(p, 18) }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 56, paddingTop: 16, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1, flexShrink: 0 }, children: numPill(String(i + 1).padStart(2, '0'), color) }), (0, jsx_runtime_1.jsxs)("div", { style: { ...panelShell(color), flex: 1, padding: '22px 24px 24px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 800, color: c.ink, letterSpacing: '-0.03em' }, children: step.title }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 10, fontSize: 22, lineHeight: 1.55, color: c.muted, fontWeight: 500 }, children: step.description })] })] }, `${step.title}-${i}`));
                    })] }));
        }
        if (type === 'compare') {
            const compare = data;
            const left = (0, remotion_1.spring)({ frame: frame - t.pointsStart, fps, config: { damping: 15, stiffness: 100 } });
            const right = (0, remotion_1.spring)({ frame: frame - t.pointsStart - 10, fps, config: { damping: 15, stiffness: 100 } });
            const center = (0, remotion_1.spring)({ frame: frame - t.pointsStart - 4, fps, config: { damping: 16, stiffness: 100 } });
            const panel = (side, color, p, d) => {
                if (!side)
                    return null;
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        ...panelShell(color),
                        minHeight: 274,
                        padding: '26px 24px 28px',
                        opacity: p,
                        transform: `translateX(${(0, remotion_1.interpolate)(p, [0, 1], [d, 0])}px) rotate(${(0, remotion_1.interpolate)(p, [0, 1], [d < 0 ? -2 : 2, d < 0 ? -0.8 : 0.8])}deg)`,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, background: `radial-gradient(circle at ${d < 0 ? '18% 16%' : '82% 16%'}, rgba(255,255,255,0.82) 0%, transparent 34%), radial-gradient(circle at ${d < 0 ? '88% 90%' : '12% 90%'}, ${color}22 0%, transparent 40%)`, pointerEvents: 'none' } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: tagStyle(color), children: side.label }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18, fontSize: 30, fontWeight: 800, lineHeight: 1.18, color: c.ink, letterSpacing: '-0.04em' }, children: side.title }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }, children: side.points.map((point, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 12, height: 12, borderRadius: 999, background: color, boxShadow: `0 0 16px ${color}80` } }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 22, lineHeight: 1.45, color: c.muted, fontWeight: 600 }, children: point })] }, `${point}-${i}`))) })] })] }));
            };
            return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'stretch', gap: 18, position: 'relative' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: '50%', top: '50%', width: 168, height: 2, borderRadius: 999, background: 'linear-gradient(90deg, rgba(255,142,200,0.35) 0%, rgba(255,255,255,0.9) 52%, rgba(124,230,236,0.35) 100%)', transform: `translate(-50%, -50%) scaleX(${(0, remotion_1.interpolate)(center, [0, 1], [0.45, 1])})`, opacity: center, boxShadow: '0 0 18px rgba(255,255,255,0.45)' } }), panel(compare.left, c.pink, left, -28), (0, jsx_runtime_1.jsxs)("div", { style: {
                            ...glassBase,
                            width: 92,
                            height: 92,
                            alignSelf: 'center',
                            borderRadius: '50% 50% 42% 42%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: center,
                            transform: `scale(${(0, remotion_1.interpolate)(center, [0, 1], [0.72, 1])})`,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: c.soft, marginBottom: 4 }, children: compare.centerBadge || 'MODE' }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, fontWeight: 900, color: c.ink, letterSpacing: '-0.03em' }, children: compare.centerLabel || 'VS' })] }), panel(compare.right, c.aqua, right, 28)] }));
        }
        if (type === 'stats') {
            const stats = (data === null || data === void 0 ? void 0 : data.stats) || [];
            const insights = (data === null || data === void 0 ? void 0 : data.insights) || [];
            return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }, children: stats.map((stat, i) => {
                            const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 15, stiffness: 100 } });
                            const color = stat.color || [c.pink, c.aqua, c.apricot][i % 3];
                            return ((0, jsx_runtime_1.jsxs)("div", { style: { ...panelShell(color), padding: '22px 22px 24px', opacity: p, transform: rise(p, 16) }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, background: `radial-gradient(circle at 84% 16%, ${color}26 0%, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)`, pointerEvents: 'none' } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: tagStyle(color), children: stat.label }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 20, fontSize: 56, fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.06em', color: c.ink }, children: stat.value }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 10, width: 70, height: 4, borderRadius: 999, background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.92) 100%)` } }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 14, fontSize: 20, lineHeight: 1.5, color: c.muted, fontWeight: 600 }, children: stat.note })] })] }, `${stat.label}-${i}`));
                        }) }), (0, jsx_runtime_1.jsx)("div", { style: { ...glassBase, borderRadius: 30, padding: '24px 24px 26px' }, children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 12 }, children: insights.map((text, i) => {
                                const color = [c.pink, c.aqua, c.apricot][i % 3];
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.74)' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 16px ${color}80`, marginTop: 10, flexShrink: 0 } }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 22, lineHeight: 1.5, color: c.ink, fontWeight: 700 }, children: text })] }, `${text}-${i}`));
                            }) }) })] }));
        }
        if (type === 'timeline') {
            const timeline = (data === null || data === void 0 ? void 0 : data.timeline) || [];
            return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: 30, top: 48, bottom: 48, width: 2, background: 'linear-gradient(180deg, rgba(255,142,200,0.5) 0%, rgba(124,230,236,0.5) 50%, rgba(255,200,146,0.5) 100%)' } }), timeline.map((item, i) => {
                        const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 15, stiffness: 100 } });
                        const color = [c.pink, c.aqua, c.apricot, c.lavender][i % 4];
                        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 18, alignItems: 'flex-start', opacity: p, transform: rise(p, 16) }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 62, paddingTop: 14, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1, flexShrink: 0 }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: 18, height: 18, borderRadius: '50%', background: color, boxShadow: `0 0 0 5px ${color}25, 0 0 18px ${color}90` } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { ...panelShell(color), flex: 1, padding: '18px 22px 20px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 20, fontWeight: 800, color: color, letterSpacing: '0.02em' }, children: item.year }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 6, fontSize: 26, fontWeight: 800, color: c.ink, letterSpacing: '-0.025em', lineHeight: 1.22 }, children: item.title }), item.description ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 20, lineHeight: 1.55, color: c.muted, fontWeight: 500 }, children: item.description })) : null] })] }, `${item.year}-${i}`));
                    })] }));
        }
        if (type === 'chart') {
            const bars = (data === null || data === void 0 ? void 0 : data.bars) || [];
            return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: bars.map((bar, i) => {
                    var _a;
                    const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 16, stiffness: 100 } });
                    const value = Math.max(0, Math.min(100, (_a = bar.percent) !== null && _a !== void 0 ? _a : bar.value));
                    const fillP = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger - 4, fps, config: { damping: 18, stiffness: 80 } });
                    const color = bar.color || [c.pink, c.aqua, c.apricot, c.lavender][i % 4];
                    return ((0, jsx_runtime_1.jsxs)("div", { style: { ...panelShell(color), padding: '20px 24px 22px', opacity: p, transform: rise(p, 14) }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 24, fontWeight: 800, color: c.ink, letterSpacing: '-0.02em' }, children: bar.label }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 36, fontWeight: 900, color: color, letterSpacing: '-0.04em' }, children: [Math.floor(value * fillP), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 22, marginLeft: 2 }, children: "%" })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: 14, borderRadius: 999, background: 'rgba(124,138,160,0.14)', overflow: 'hidden', position: 'relative' }, children: (0, jsx_runtime_1.jsx)("div", { style: { height: '100%', width: `${value * fillP}%`, borderRadius: 999, background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.92) 100%)`, boxShadow: `0 0 18px ${color}65` } }) })] }, `${bar.label}-${i}`));
                }) }));
        }
        if (type === 'highlight') {
            const items = (data === null || data === void 0 ? void 0 : data.highlights) || [];
            return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', alignItems: 'center', minHeight: 300 }, children: items.map((it, i) => {
                    const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 14, stiffness: 100 } });
                    const color = [c.pink, c.aqua, c.apricot, c.lavender][i % 4];
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            ...glassBase,
                            borderRadius: 24,
                            padding: '18px 26px',
                            border: `1px solid ${color}50`,
                            background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0.85) 100%)`,
                            fontSize: 26,
                            fontWeight: 800,
                            color: c.ink,
                            letterSpacing: '-0.02em',
                            opacity: p,
                            transform: `scale(${(0, remotion_1.interpolate)(p, [0, 1], [0.86, 1])}) ${rise(p, 10)}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 14px ${color}` } }), it] }, `${it}-${i}`));
                }) }));
        }
        if (type === 'cta') {
            const ctaText = typeof (data === null || data === void 0 ? void 0 : data.cta) === 'string' ? data.cta : '点赞收藏';
            const cards = (data === null || data === void 0 ? void 0 : data.cards) || [];
            const tags = cards.map(c => c.title).slice(0, 4);
            const pulse = 1 + Math.sin(frame * 0.12) * 0.04;
            const ctaP = (0, remotion_1.spring)({ frame: frame - t.pointsStart - 4, fps, config: { damping: 13, stiffness: 110 } });
            return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '20px 0' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { ...glassBase, borderRadius: 32, padding: '30px 44px 34px', position: 'relative', overflow: 'hidden', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(255,142,200,0.30) 0%, transparent 60%)', pointerEvents: 'none' } }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'relative', zIndex: 1 }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        padding: '24px 56px',
                                        borderRadius: 999,
                                        background: 'linear-gradient(135deg, #ff64bf 0%, #7de5ef 100%)',
                                        fontSize: 32,
                                        fontWeight: 800,
                                        color: 'white',
                                        boxShadow: '0 24px 56px rgba(255,100,191,0.40), inset 0 1px 0 rgba(255,255,255,0.45)',
                                        transform: `scale(${pulse * (0, remotion_1.interpolate)(ctaP, [0, 1], [0.86, 1])})`,
                                        opacity: ctaP,
                                        letterSpacing: '-0.01em',
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 28 }, children: "\u2192" }), ctaText] }) })] }), tags.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }, children: tags.map((tg, i) => {
                            const color = [c.pink, c.aqua, c.apricot, c.lavender][i % 4];
                            const tp = (0, remotion_1.spring)({ frame: frame - t.pointsStart - 12 - i * 4, fps, config: { damping: 16 } });
                            return (0, jsx_runtime_1.jsx)("div", { style: { opacity: tp }, children: (0, jsx_runtime_1.jsxs)("div", { style: tagStyle(color), children: ["#", tg] }) }, `${tg}-${i}`);
                        }) })) : null] }));
        }
        if (type === 'list') {
            const listItems = (data === null || data === void 0 ? void 0 : data.items) || [];
            return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: listItems.map((item, i) => {
                    const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * t.pointStagger, fps, config: { damping: 16, stiffness: 100 } });
                    const color = [c.pink, c.aqua, c.apricot, c.lavender][i % 4];
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            ...panelShell(color),
                            padding: '20px 24px 22px',
                            opacity: p,
                            transform: rise(p, 16),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 20,
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: `linear-gradient(180deg, ${color} 0%, rgba(255,255,255,0.9) 100%)`, borderRadius: '28px 0 0 28px' } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, width: '100%' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            background: `${color}28`,
                                            border: `1.5px solid ${color}60`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 22,
                                            flexShrink: 0,
                                        }, children: item.icon || (0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 900, color: color, fontSize: 18 }, children: String(i + 1).padStart(2, '0') }) }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 26, fontWeight: 800, color: c.ink, letterSpacing: '-0.025em', lineHeight: 1.2 }, children: item.title }), item.desc ? ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 6, fontSize: 20, lineHeight: 1.5, color: c.muted, fontWeight: 500 }, children: item.desc })) : null] })] })] }, `${item.title}-${i}`));
                }) }));
        }
        const quote = data;
        const tags = (quote === null || quote === void 0 ? void 0 : quote.tags) || [];
        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 20, alignItems: 'stretch' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { ...glassBase, borderRadius: 32, padding: '34px 34px 32px', position: 'relative', overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: -36, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,167,255,0.32) 0%, rgba(182,167,255,0.06) 48%, transparent 72%)' } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 84, lineHeight: 0.82, color: c.lavender, fontWeight: 800 }, children: "\u201C" }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 38, lineHeight: 1.38, color: c.ink, fontWeight: 800, letterSpacing: '-0.035em' }, children: (quote === null || quote === void 0 ? void 0 : quote.quote) || title }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(182,167,255,0.18)', fontSize: 22, color: c.muted, fontWeight: 700 }, children: (quote === null || quote === void 0 ? void 0 : quote.author) || subtitle })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { ...glassBase, borderRadius: 28, padding: '22px 20px', display: 'flex', flexDirection: 'column' }, children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 14 }, children: tags.map((tag, i) => {
                            const p = (0, remotion_1.spring)({ frame: frame - t.pointsStart - i * 4, fps, config: { damping: 18, stiffness: 110 } });
                            const color = [c.pink, c.aqua, c.apricot, c.lavender][i % 4];
                            return (0, jsx_runtime_1.jsx)("div", { style: { opacity: p, transform: `scale(${(0, remotion_1.interpolate)(p, [0, 1], [0.84, 1])})` }, children: (0, jsx_runtime_1.jsx)("div", { style: tagStyle(color), children: tag }) }, `${tag}-${i}`);
                        }) }) })] }));
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: 'linear-gradient(180deg, #efebee 0%, #ebe7e8 34%, #e7e5e5 100%)',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            fontFamily: "'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `
            radial-gradient(58% 34% at ${18 + shift * 0.05}% 10%, rgba(250,158,196,0.74) 0%, rgba(250,158,196,0.22) 42%, transparent 80%),
            radial-gradient(52% 32% at ${84 - shift * 0.06}% 10%, rgba(171,145,244,0.82) 0%, rgba(171,145,244,0.22) 45%, transparent 78%),
            radial-gradient(48% 30% at ${22 + shift * 0.04}% 58%, rgba(142,236,239,0.62) 0%, rgba(142,236,239,0.16) 42%, transparent 76%),
            radial-gradient(42% 28% at ${78 - shift * 0.03}% 74%, rgba(255,203,120,0.64) 0%, rgba(255,203,120,0.16) 44%, transparent 74%),
            radial-gradient(44% 28% at ${82 - shift * 0.03}% 92%, rgba(175,232,255,0.56) 0%, rgba(175,232,255,0.12) 42%, transparent 74%)
          `,
                } }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { opacity: exit, alignItems: 'center', justifyContent: 'center', padding: '42px 44px 56px' }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                        ...glassBase,
                        position: 'relative',
                        width: 922,
                        marginTop: type === 'cover' ? 54 : 34,
                        borderRadius: 34,
                        padding: '44px 44px 40px',
                        transform: `translateY(${(0, remotion_1.interpolate)(enter, [0, 1], [28, 0])}px) scale(${(0, remotion_1.interpolate)(enter, [0, 1], [0.978, 1])})`,
                        opacity: enter,
                        overflow: 'hidden',
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, background: 'radial-gradient(42% 34% at 22% 72%, rgba(162,240,243,0.28) 0%, transparent 68%), radial-gradient(34% 28% at 80% 88%, rgba(255,214,140,0.24) 0%, transparent 68%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' } }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 28, opacity: head, transform: rise(head, 10) }, children: (0, jsx_runtime_1.jsx)("div", { style: { padding: '13px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.52)', minWidth: 96, textAlign: 'center', boxShadow: '0 6px 18px rgba(255,255,255,0.28) inset' }, children: (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 18, fontWeight: 800, color: '#273243', letterSpacing: '0.02em' }, children: [String(index + 1).padStart(2, '0'), " / ", String(totalSlides).padStart(2, '0')] }) }) }), (0, jsx_runtime_1.jsx)("h1", { style: { margin: 0, maxWidth: type === 'cover' ? 780 : 790, fontSize: titleSize, lineHeight: titleLine, letterSpacing: type === 'cover' ? '-0.058em' : '-0.05em', fontWeight: 900, color: c.ink, whiteSpace: 'pre-line', opacity: titleIn, transform: rise(titleIn, 22) }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: { width: (0, remotion_1.interpolate)(lineIn, [0, 1], [0, type === 'cover' ? 160 : 150]), height: 6, borderRadius: 999, marginTop: 22, background: 'linear-gradient(90deg, #ff64bf 0%, #7de5ef 52%, #19c4b7 100%)' } }), subtitle ? ((0, jsx_runtime_1.jsx)("p", { style: { margin: type === 'cover' ? '26px 0 34px' : '24px 0 30px', maxWidth: 780, fontSize: 28, lineHeight: 1.48, color: c.muted, fontWeight: 500, opacity: subIn, transform: rise(subIn, 14) }, children: subtitle })) : null, render()] })] }) })] }));
};
exports.LiquidBriefSlide = LiquidBriefSlide;
