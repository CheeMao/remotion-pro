"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneMotionShell = exports.SceneMotionLayer = exports.hasSceneMotionLayer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const remotion_1 = require("remotion");
const motionPresets_1 = require("../templates/motionPresets");
const FALLBACK_ACCENTS = ['#60a5fa', '#22d3ee', '#f472b6'];
const getLayout = (slide) => {
    return (0, motionPresets_1.normalizeMotionLayout)(slide.layout || slide.type || 'default');
};
const getDataRecord = (slide) => {
    if (slide.data && typeof slide.data === 'object') {
        return slide.data;
    }
    return {};
};
const readString = (value) => {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const readBoolean = (value) => {
    if (typeof value !== 'boolean') {
        return undefined;
    }
    return value;
};
const normalizeIntensity = (value) => {
    if (value === 'soft' || value === 'medium' || value === 'strong') {
        return value;
    }
    return 'medium';
};
const getIntensityScale = (intensity) => {
    switch (intensity) {
        case 'soft':
            return 0.78;
        case 'strong':
            return 1.28;
        default:
            return 1;
    }
};
const scaleAlpha = (value, intensity) => Math.min(1, value * getIntensityScale(intensity));
const compactPhrase = (value) => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) {
        return '';
    }
    const [head] = normalized.split(/[:：|丨•·-]\s*/);
    return (head || normalized).trim();
};
const toRgba = (color, alpha) => {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const normalized = hex.length === 3
            ? hex
                .split('')
                .map((char) => `${char}${char}`)
                .join('')
            : hex;
        if (normalized.length === 6) {
            const r = parseInt(normalized.slice(0, 2), 16);
            const g = parseInt(normalized.slice(2, 4), 16);
            const b = parseInt(normalized.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }
    if (color.startsWith('rgb(')) {
        return color.replace(/^rgb\((.+)\)$/, `rgba($1, ${alpha})`);
    }
    if (color.startsWith('rgba(')) {
        return color.replace(/^rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*[^)]+\)$/, `rgba($1, $2, $3, ${alpha})`);
    }
    return color;
};
const getAccents = (theme) => {
    const [a = FALLBACK_ACCENTS[0], b = FALLBACK_ACCENTS[1], c = FALLBACK_ACCENTS[2]] = theme.palette.accents;
    return [a, b, c];
};
const collectMotionLabels = (slide) => {
    const data = getDataRecord(slide);
    const rawLabels = [];
    const appendLabel = (value) => {
        const resolved = readString(value);
        if (!resolved) {
            return;
        }
        const compact = compactPhrase(resolved);
        if (compact) {
            rawLabels.push(compact);
        }
    };
    appendLabel(slide.title);
    appendLabel(slide.subtitle);
    (slide.points || []).forEach((point) => appendLabel(point));
    const highlights = data.highlights;
    if (Array.isArray(highlights)) {
        highlights.forEach((item) => {
            if (typeof item === 'string') {
                appendLabel(item);
                return;
            }
            if (item && typeof item === 'object') {
                appendLabel(item.text);
            }
        });
    }
    appendLabel(data.cta);
    appendLabel(data.button);
    appendLabel(data.badge);
    return rawLabels.filter((item, index) => rawLabels.indexOf(item) === index).slice(0, 4);
};
const getGhostLabel = (slide) => {
    const label = compactPhrase(readString(slide.title) || readString(slide.subtitle) || '');
    if (label) {
        return label;
    }
    return collectMotionLabels(slide)[0] || '';
};
const resolveMotionSelection = (slide, index) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const layout = getLayout(slide);
    if (!layout) {
        return null;
    }
    const slideRecord = slide;
    const data = getDataRecord(slide);
    const slideMotion = slide.motion && typeof slide.motion === 'object'
        ? slide.motion
        : undefined;
    const dataMotion = data.motion && typeof data.motion === 'object'
        ? data.motion
        : undefined;
    const disabled = (_c = (_b = (_a = readBoolean(slideMotion === null || slideMotion === void 0 ? void 0 : slideMotion.disabled)) !== null && _a !== void 0 ? _a : readBoolean(dataMotion === null || dataMotion === void 0 ? void 0 : dataMotion.disabled)) !== null && _b !== void 0 ? _b : readBoolean(slideRecord.motionDisabled)) !== null && _c !== void 0 ? _c : false;
    if (disabled) {
        return null;
    }
    const requestedPreset = (_g = (_f = (_e = (_d = readString(slide.motionPreset)) !== null && _d !== void 0 ? _d : readString(slideMotion === null || slideMotion === void 0 ? void 0 : slideMotion.preset)) !== null && _e !== void 0 ? _e : readString(slideRecord.motionPreset)) !== null && _f !== void 0 ? _f : readString(data.motionPreset)) !== null && _g !== void 0 ? _g : readString(dataMotion === null || dataMotion === void 0 ? void 0 : dataMotion.preset);
    const intensity = normalizeIntensity((_k = (_j = (_h = slideMotion === null || slideMotion === void 0 ? void 0 : slideMotion.intensity) !== null && _h !== void 0 ? _h : dataMotion === null || dataMotion === void 0 ? void 0 : dataMotion.intensity) !== null && _j !== void 0 ? _j : slideRecord.motionIntensity) !== null && _k !== void 0 ? _k : data.motionIntensity);
    if (requestedPreset) {
        const supportedLayouts = motionPresets_1.MOTION_PRESET_SUPPORTED_LAYOUTS[requestedPreset];
        if (supportedLayouts === null || supportedLayouts === void 0 ? void 0 : supportedLayouts.includes(layout)) {
            return {
                layout,
                preset: requestedPreset,
                intensity,
            };
        }
    }
    const presets = motionPresets_1.LAYOUT_MOTION_PRESET_ROTATION[layout];
    return {
        layout,
        preset: presets[index % presets.length],
        intensity,
    };
};
const hasSceneMotionLayer = (slide, index = 0) => resolveMotionSelection(slide, index) !== null;
exports.hasSceneMotionLayer = hasSceneMotionLayer;
const CommonBackdrop = ({ slide, theme, frame, fps, index, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB, accentC] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const reveal = (0, remotion_1.spring)({
        frame,
        fps,
        config: {
            damping: Math.max(12, theme.motion.damping + 2),
            stiffness: Math.max(70, theme.motion.stiffness - 10),
        },
    });
    const driftX = Math.sin((frame + index * 5) / 28) * width * 0.018;
    const driftY = Math.cos((frame + index * 7) / 34) * height * 0.014;
    const gridOffset = -(frame * 0.6);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: -width * 0.18 + driftX,
                    top: -height * 0.09,
                    width: width * 0.58,
                    height: height * 0.28,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${toRgba(accentA, 0.26 * alpha)} 0%, ${toRgba(accentA, 0)} 72%)`,
                    filter: 'blur(90px)',
                    opacity: (0, remotion_1.interpolate)(reveal, [0, 1], [0, 1]),
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: -width * 0.14 - driftX * 0.8,
                    top: height * 0.08 + driftY,
                    width: width * 0.52,
                    height: height * 0.3,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${toRgba(accentB, 0.22 * alpha)} 0%, ${toRgba(accentB, 0)} 74%)`,
                    filter: 'blur(96px)',
                    opacity: (0, remotion_1.interpolate)(reveal, [0, 1], [0, 1]),
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    opacity: (theme.effects.grid ? 0.12 : 0.07) * alpha,
                    backgroundImage: `
            linear-gradient(${toRgba(theme.palette.text, 0.08 * alpha)} 1px, transparent 1px),
            linear-gradient(90deg, ${toRgba(theme.palette.text, 0.08 * alpha)} 1px, transparent 1px)
          `,
                    backgroundSize: `${Math.max(24, width * 0.035)}px ${Math.max(24, width * 0.035)}px`,
                    backgroundPosition: `${gridOffset}px ${gridOffset * 0.7}px`,
                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 58%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 58%, transparent 100%)',
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(1,6,20,0.18) 0%, rgba(1,6,20,0) 22%, rgba(1,6,20,0) 72%, rgba(1,6,20,0.2) 100%)',
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    border: `1px solid ${toRgba(accentC, 0.06 * alpha)}`,
                    boxShadow: `inset 0 0 0 1px ${toRgba(theme.palette.text, 0.03 * alpha)}`,
                    opacity: 0.7,
                } }), slide.title ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.07,
                    bottom: height * 0.07,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.max(16, width * 0.013),
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: toRgba(theme.palette.text, 0.12 * alpha),
                }, children: slide.title })) : null] }));
};
const FocusSweepMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const reveal = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 18, stiffness: 80 },
    });
    const beamX = (0, remotion_1.interpolate)((frame % Math.max(1, fps * 4)) / Math.max(1, fps * 4), [0, 1], [-width * 0.45, width * 0.72]);
    const ghostLabel = getGhostLabel(slide);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: beamX,
                    top: -height * 0.08,
                    width: width * 0.26,
                    height: height * 1.12,
                    transform: 'rotate(18deg)',
                    transformOrigin: 'center center',
                    background: `linear-gradient(180deg, ${toRgba(accentB, 0)} 0%, ${toRgba(accentB, 0.18 * alpha)} 38%, ${toRgba(accentA, 0.28 * alpha)} 50%, ${toRgba(accentB, 0.18 * alpha)} 62%, ${toRgba(accentB, 0)} 100%)`,
                    filter: 'blur(34px)',
                    opacity: 0.9,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.08,
                    right: width * 0.08,
                    bottom: height * 0.18,
                    height: Math.max(4, height * 0.004),
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgba(accentA, 0)} 0%, ${toRgba(accentA, 0.62 * alpha)} 32%, ${toRgba(accentB, 0.74 * alpha)} 68%, ${toRgba(accentB, 0)} 100%)`,
                    opacity: (0, remotion_1.interpolate)(reveal, [0, 1], [0, 0.9]),
                    boxShadow: `0 0 28px ${toRgba(accentB, 0.34 * alpha)}`,
                } }), ghostLabel ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.035,
                    bottom: height * 0.21,
                    maxWidth: width * 0.76,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.min(width * 0.18, height * 0.11),
                    fontWeight: 900,
                    lineHeight: 0.88,
                    letterSpacing: '-0.05em',
                    textAlign: 'right',
                    color: toRgba(theme.palette.text, 0.07 * alpha),
                    opacity: (0, remotion_1.interpolate)(reveal, [0, 1], [0, 1]),
                    transform: `translateX(${(0, remotion_1.interpolate)(reveal, [0, 1], [42, 0])}px)`,
                }, children: ghostLabel })) : null] }));
};
const HighlightChipMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB, accentC] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const labels = collectMotionLabels(slide).slice(0, 3);
    const sweep = (0, remotion_1.interpolate)((frame % Math.max(1, fps * 5)) / Math.max(1, fps * 5), [0, 1], [-width * 0.3, width * 0.42]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: sweep,
                    top: height * 0.34,
                    width: width * 0.46,
                    height: height * 0.17,
                    transform: 'skewX(-18deg)',
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgba(accentA, 0)} 0%, ${toRgba(accentA, 0.12 * alpha)} 24%, ${toRgba(accentB, 0.22 * alpha)} 50%, ${toRgba(accentC, 0.12 * alpha)} 76%, ${toRgba(accentC, 0)} 100%)`,
                    filter: 'blur(26px)',
                    opacity: 0.92,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.09,
                    right: width * 0.18,
                    top: height * 0.39,
                    height: Math.max(3, height * 0.0035),
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgba(accentA, 0)} 0%, ${toRgba(accentA, 0.7 * alpha)} 36%, ${toRgba(accentB, 0.8 * alpha)} 100%)`,
                    boxShadow: `0 0 24px ${toRgba(accentB, 0.26 * alpha)}`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: height * 0.11,
                    right: width * 0.07,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: Math.max(10, height * 0.008),
                    alignItems: 'flex-end',
                }, children: labels.map((label, index) => {
                    const chipIntro = (0, remotion_1.spring)({
                        frame: frame - 5 - index * 4,
                        fps,
                        config: { damping: 17, stiffness: 120 },
                    });
                    return ((0, jsx_runtime_1.jsx)("div", { style: {
                            padding: `${Math.max(10, height * 0.008)}px ${Math.max(16, width * 0.018)}px`,
                            borderRadius: 999,
                            border: `1px solid ${toRgba([accentA, accentB, accentC][index % 3], 0.28 * alpha)}`,
                            background: `linear-gradient(135deg, ${toRgba([accentA, accentB, accentC][index % 3], 0.18 * alpha)}, ${toRgba(theme.palette.surface, 0.08)})`,
                            backdropFilter: 'blur(16px)',
                            color: toRgba(theme.palette.text, 0.88 * alpha),
                            fontFamily: theme.typography.fontFamily,
                            fontSize: Math.max(18, width * 0.017),
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            opacity: chipIntro,
                            transform: `translateX(${(0, remotion_1.interpolate)(chipIntro, [0, 1], [44, 0])}px) scale(${(0, remotion_1.interpolate)(chipIntro, [0, 1], [0.94, 1])})`,
                            boxShadow: `0 14px 30px ${toRgba([accentA, accentB, accentC][index % 3], 0.14 * alpha)}`,
                        }, children: label }, `${label}-${index}`));
                }) })] }));
};
const CtaPulseMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const data = getDataRecord(slide);
    const label = compactPhrase(readString(data.cta) || readString(data.button) || readString(slide.subtitle) || '') ||
        collectMotionLabels(slide)[0];
    const pulseBase = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 18, stiffness: 82 },
    });
    const cycle = (frame % Math.max(1, fps * 2.6)) / Math.max(1, fps * 2.6);
    const pulseScale = 1 + cycle * 0.18;
    const pulseOpacity = (0, remotion_1.interpolate)(cycle, [0, 0.7, 1], [0.18, 0.06, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: width * 0.62,
                    height: height * 0.32,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${toRgba(accentA, 0.22 * alpha)} 0%, ${toRgba(accentB, 0.12 * alpha)} 34%, ${toRgba(accentB, 0)} 74%)`,
                    filter: 'blur(50px)',
                    opacity: (0, remotion_1.interpolate)(pulseBase, [0, 1], [0, 1]),
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: width * 0.54,
                    height: height * 0.24,
                    transform: `translate(-50%, -50%) scale(${pulseScale})`,
                    borderRadius: Math.max(40, width * 0.04),
                    border: `1px solid ${toRgba(accentA, pulseOpacity * alpha)}`,
                    boxShadow: `0 0 40px ${toRgba(accentA, pulseOpacity * 0.75 * alpha)}`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.12,
                    right: width * 0.12,
                    bottom: height * 0.14,
                    height: Math.max(4, height * 0.004),
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgba(accentB, 0)} 0%, ${toRgba(accentB, 0.46 * alpha)} 20%, ${toRgba(accentA, 0.78 * alpha)} 50%, ${toRgba(accentB, 0.46 * alpha)} 80%, ${toRgba(accentB, 0)} 100%)`,
                    boxShadow: `0 0 28px ${toRgba(accentA, 0.28 * alpha)}`,
                    opacity: 0.9,
                } }), label ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: '50%',
                    bottom: height * 0.18,
                    transform: `translateX(-50%) translateY(${(0, remotion_1.interpolate)(pulseBase, [0, 1], [20, 0])}px)`,
                    padding: `${Math.max(10, height * 0.008)}px ${Math.max(18, width * 0.02)}px`,
                    borderRadius: 999,
                    border: `1px solid ${toRgba(accentA, 0.24 * alpha)}`,
                    background: `linear-gradient(135deg, ${toRgba(theme.palette.surface, 0.22)}, ${toRgba(accentB, 0.12 * alpha)})`,
                    backdropFilter: 'blur(18px)',
                    color: toRgba(theme.palette.text, 0.86 * alpha),
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.max(18, width * 0.017),
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    opacity: (0, remotion_1.interpolate)(pulseBase, [0, 1], [0, 1]),
                    boxShadow: `0 14px 34px ${toRgba(accentB, 0.15 * alpha)}`,
                }, children: label })) : null] }));
};
const EditorialGridMotion = ({ slide, theme, frame, fps, selection, index, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const labels = collectMotionLabels(slide).slice(0, 3);
    const intro = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 17, stiffness: 102 },
    });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.055,
                    top: height * 0.08,
                    width: width * 0.28,
                    height: height * 0.22,
                    borderRadius: 34,
                    border: `1px solid ${toRgba(accentA, 0.22 * alpha)}`,
                    background: `linear-gradient(135deg, ${toRgba(theme.palette.surface, 0.14)}, ${toRgba(accentA, 0.08 * alpha)})`,
                    opacity: (0, remotion_1.interpolate)(intro, [0, 1], [0, 1]),
                    transform: `translateY(${(0, remotion_1.interpolate)(intro, [0, 1], [36, 0])}px)`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.06,
                    top: height * 0.1,
                    padding: `${Math.max(10, height * 0.008)}px ${Math.max(14, width * 0.016)}px`,
                    borderRadius: 999,
                    border: `1px solid ${toRgba(accentB, 0.22 * alpha)}`,
                    color: toRgba(theme.palette.text, 0.76),
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.max(18, width * 0.015),
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: `linear-gradient(135deg, ${toRgba(accentB, 0.14 * alpha)}, ${toRgba(theme.palette.surfaceAlt, 0.18)})`,
                }, children: String(index + 1).padStart(2, '0') }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.07,
                    bottom: height * 0.08,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: Math.max(10, height * 0.008),
                    alignItems: 'flex-end',
                }, children: labels.map((label, labelIndex) => {
                    const chipIntro = (0, remotion_1.spring)({
                        frame: frame - 4 - labelIndex * 3,
                        fps,
                        config: { damping: 16, stiffness: 120 },
                    });
                    return ((0, jsx_runtime_1.jsx)("div", { style: {
                            padding: `${Math.max(10, height * 0.008)}px ${Math.max(15, width * 0.018)}px`,
                            borderRadius: 999,
                            background: `linear-gradient(135deg, ${toRgba([accentA, accentB][labelIndex % 2], 0.2 * alpha)}, ${toRgba(theme.palette.surface, 0.1)})`,
                            border: `1px solid ${toRgba([accentA, accentB][labelIndex % 2], 0.24 * alpha)}`,
                            color: toRgba(theme.palette.text, 0.84),
                            fontFamily: theme.typography.fontFamily,
                            fontSize: Math.max(18, width * 0.016),
                            fontWeight: 800,
                            opacity: chipIntro,
                            transform: `translateX(${(0, remotion_1.interpolate)(chipIntro, [0, 1], [34, 0])}px)`,
                        }, children: label }, `${label}-${labelIndex}`));
                }) })] }));
};
const CascadeRiseMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB, accentC] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const labels = collectMotionLabels(slide).slice(0, 4);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.08,
                    top: height * 0.14,
                    bottom: height * 0.18,
                    width: Math.max(4, width * 0.004),
                    borderRadius: 999,
                    background: `linear-gradient(180deg, ${toRgba(accentA, 0.82 * alpha)} 0%, ${toRgba(accentB, 0.54 * alpha)} 54%, ${toRgba(accentC, 0.12 * alpha)} 100%)`,
                    boxShadow: `0 0 24px ${toRgba(accentA, 0.18 * alpha)}`,
                } }), labels.map((label, labelIndex) => {
                const itemIntro = (0, remotion_1.spring)({
                    frame: frame - 4 - labelIndex * 4,
                    fps,
                    config: { damping: 15, stiffness: 120 },
                });
                const accent = [accentA, accentB, accentC][labelIndex % 3];
                return ((0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        left: width * 0.11,
                        top: height * (0.18 + labelIndex * 0.11),
                        padding: `${Math.max(10, height * 0.007)}px ${Math.max(14, width * 0.016)}px`,
                        borderRadius: 20,
                        background: `linear-gradient(135deg, ${toRgba(accent, 0.18 * alpha)}, ${toRgba(theme.palette.surface, 0.08)})`,
                        border: `1px solid ${toRgba(accent, 0.22 * alpha)}`,
                        color: toRgba(theme.palette.text, 0.84),
                        fontFamily: theme.typography.fontFamily,
                        fontSize: Math.max(18, width * 0.016),
                        fontWeight: 800,
                        opacity: itemIntro,
                        transform: `translateY(${(0, remotion_1.interpolate)(itemIntro, [0, 1], [28, 0])}px) translateX(${(0, remotion_1.interpolate)(itemIntro, [0, 1], [-18, 0])}px)`,
                        boxShadow: `0 12px 28px ${toRgba(accent, 0.12 * alpha)}`,
                    }, children: label }, `${label}-${labelIndex}`));
            })] }));
};
const SplitBeamMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const beamDrift = Math.sin(frame / 18) * width * 0.02;
    const intro = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 17, stiffness: 90 },
    });
    const data = getDataRecord(slide);
    const leftLabel = readString(data.left && typeof data.left === 'object'
        ? data.left.label
        : undefined) || 'Left';
    const rightLabel = readString(data.right && typeof data.right === 'object'
        ? data.right.label
        : undefined) || 'Right';
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: '50%',
                    top: height * 0.13,
                    bottom: height * 0.13,
                    width: Math.max(5, width * 0.0046),
                    transform: 'translateX(-50%)',
                    borderRadius: 999,
                    background: `linear-gradient(180deg, ${toRgba(accentA, 0.08 * alpha)} 0%, ${toRgba(accentB, 0.82 * alpha)} 48%, ${toRgba(accentA, 0.08 * alpha)} 100%)`,
                    boxShadow: `0 0 24px ${toRgba(accentB, 0.16 * alpha)}`,
                    opacity: (0, remotion_1.interpolate)(intro, [0, 1], [0, 1]),
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.18 + beamDrift,
                    top: height * 0.22,
                    width: width * 0.18,
                    height: height * 0.12,
                    borderRadius: 32,
                    background: `linear-gradient(135deg, ${toRgba(accentA, 0.22 * alpha)}, ${toRgba(accentA, 0)})`,
                    filter: 'blur(18px)',
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.18 - beamDrift,
                    bottom: height * 0.22,
                    width: width * 0.18,
                    height: height * 0.12,
                    borderRadius: 32,
                    background: `linear-gradient(135deg, ${toRgba(accentB, 0.22 * alpha)}, ${toRgba(accentB, 0)})`,
                    filter: 'blur(18px)',
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.08,
                    top: height * 0.14,
                    padding: '10px 16px',
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${toRgba(accentA, 0.18 * alpha)}, ${toRgba(theme.palette.surface, 0.08)})`,
                    border: `1px solid ${toRgba(accentA, 0.22 * alpha)}`,
                    color: toRgba(theme.palette.text, 0.82),
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.max(16, width * 0.014),
                    fontWeight: 800,
                }, children: leftLabel }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.08,
                    bottom: height * 0.14,
                    padding: '10px 16px',
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${toRgba(accentB, 0.18 * alpha)}, ${toRgba(theme.palette.surface, 0.08)})`,
                    border: `1px solid ${toRgba(accentB, 0.22 * alpha)}`,
                    color: toRgba(theme.palette.text, 0.82),
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.max(16, width * 0.014),
                    fontWeight: 800,
                }, children: rightLabel })] }));
};
const DataPulseMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const sweep = (0, remotion_1.interpolate)((frame % Math.max(1, fps * 3.4)) / Math.max(1, fps * 3.4), [0, 1], [-width * 0.16, width * 0.7]);
    const labels = collectMotionLabels(slide).slice(0, 3);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    right: width * 0.06,
                    top: height * 0.11,
                    width: width * 0.3,
                    height: height * 0.24,
                    borderRadius: 32,
                    border: `1px solid ${toRgba(accentA, 0.18 * alpha)}`,
                    background: `linear-gradient(180deg, ${toRgba(theme.palette.surface, 0.12)}, ${toRgba(accentA, 0.08 * alpha)})`,
                    overflow: 'hidden',
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            left: sweep,
                            top: 0,
                            width: width * 0.14,
                            height: '100%',
                            background: `linear-gradient(90deg, ${toRgba(accentB, 0)} 0%, ${toRgba(accentB, 0.22 * alpha)} 50%, ${toRgba(accentB, 0)} 100%)`,
                            filter: 'blur(10px)',
                        } }), [0, 1, 2, 3].map((row) => ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            left: 18,
                            right: 18,
                            top: 22 + row * Math.max(34, height * 0.028),
                            height: 1,
                            background: toRgba(theme.palette.text, 0.08 * alpha),
                        } }, row)))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.08,
                    top: height * 0.14,
                    display: 'flex',
                    gap: Math.max(10, width * 0.01),
                }, children: labels.map((label, labelIndex) => ((0, jsx_runtime_1.jsx)("div", { style: {
                        padding: '10px 15px',
                        borderRadius: 999,
                        border: `1px solid ${toRgba([accentA, accentB][labelIndex % 2], 0.22 * alpha)}`,
                        background: `linear-gradient(135deg, ${toRgba([accentA, accentB][labelIndex % 2], 0.14 * alpha)}, ${toRgba(theme.palette.surface, 0.08)})`,
                        color: toRgba(theme.palette.text, 0.84),
                        fontFamily: theme.typography.fontFamily,
                        fontSize: Math.max(16, width * 0.014),
                        fontWeight: 800,
                    }, children: label }, `${label}-${labelIndex}`))) })] }));
};
const SignalRadarMotion = ({ theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const radarProgress = (frame % Math.max(1, fps * 4)) / Math.max(1, fps * 4);
    const radarAngle = (0, remotion_1.interpolate)(radarProgress, [0, 1], [-40, 320]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.06,
                    top: height * 0.08,
                    width: width * 0.26,
                    height: width * 0.26,
                    borderRadius: '50%',
                    border: `1px solid ${toRgba(accentA, 0.16 * alpha)}`,
                    boxShadow: `0 0 40px ${toRgba(accentA, 0.08 * alpha)}`,
                } }), [0.72, 0.48, 0.24].map((scale, index) => ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.06 + (width * 0.26 * (1 - scale)) / 2,
                    top: height * 0.08 + (width * 0.26 * (1 - scale)) / 2,
                    width: width * 0.26 * scale,
                    height: width * 0.26 * scale,
                    borderRadius: '50%',
                    border: `1px solid ${toRgba(accentB, (0.12 - index * 0.02) * alpha)}`,
                } }, scale))), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.06 + width * 0.13,
                    top: height * 0.08 + width * 0.13,
                    width: width * 0.13,
                    height: 2,
                    transformOrigin: '0 50%',
                    transform: `rotate(${radarAngle}deg)`,
                    background: `linear-gradient(90deg, ${toRgba(accentA, 0.7 * alpha)} 0%, ${toRgba(accentB, 0)} 100%)`,
                    boxShadow: `0 0 16px ${toRgba(accentA, 0.18 * alpha)}`,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.06 + width * 0.13 - 6,
                    top: height * 0.08 + width * 0.13 - 6,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: toRgba(accentA, 0.82 * alpha),
                    boxShadow: `0 0 16px ${toRgba(accentA, 0.28 * alpha)}`,
                } })] }));
};
const TimelineTraceMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB, accentC] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const labels = collectMotionLabels(slide).slice(0, 4);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.11,
                    right: width * 0.11,
                    top: height * 0.16,
                    height: Math.max(4, height * 0.004),
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgba(accentA, 0.18 * alpha)} 0%, ${toRgba(accentB, 0.72 * alpha)} 50%, ${toRgba(accentC, 0.18 * alpha)} 100%)`,
                    boxShadow: `0 0 24px ${toRgba(accentB, 0.15 * alpha)}`,
                } }), labels.map((label, labelIndex) => {
                const intro = (0, remotion_1.spring)({
                    frame: frame - labelIndex * 4,
                    fps,
                    config: { damping: 16, stiffness: 110 },
                });
                const accent = [accentA, accentB, accentC][labelIndex % 3];
                const left = width * (0.14 + labelIndex * 0.18);
                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                position: 'absolute',
                                left,
                                top: height * 0.145,
                                width: Math.max(18, width * 0.016),
                                height: Math.max(18, width * 0.016),
                                borderRadius: '50%',
                                background: accent,
                                boxShadow: `0 0 18px ${toRgba(accent, 0.24 * alpha)}`,
                                transform: `scale(${(0, remotion_1.interpolate)(intro, [0, 1], [0.4, 1])})`,
                                opacity: intro,
                            } }), (0, jsx_runtime_1.jsx)("div", { style: {
                                position: 'absolute',
                                left: left - width * 0.015,
                                top: height * 0.2 + labelIndex * height * 0.06,
                                padding: '10px 14px',
                                borderRadius: 18,
                                background: `linear-gradient(135deg, ${toRgba(accent, 0.18 * alpha)}, ${toRgba(theme.palette.surface, 0.08)})`,
                                border: `1px solid ${toRgba(accent, 0.2 * alpha)}`,
                                color: toRgba(theme.palette.text, 0.84),
                                fontFamily: theme.typography.fontFamily,
                                fontSize: Math.max(16, width * 0.014),
                                fontWeight: 800,
                                opacity: intro,
                                transform: `translateY(${(0, remotion_1.interpolate)(intro, [0, 1], [26, 0])}px)`,
                            }, children: label })] }, `${label}-${labelIndex}`));
            })] }));
};
const QuoteFocusMotion = ({ slide, theme, frame, fps, selection, }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    const [accentA, accentB] = getAccents(theme);
    const alpha = scaleAlpha(1, selection.intensity);
    const intro = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 17, stiffness: 84 },
    });
    const label = getGhostLabel(slide);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.06,
                    top: height * 0.08,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.min(width * 0.24, height * 0.22),
                    fontWeight: 900,
                    lineHeight: 0.8,
                    color: toRgba(accentA, 0.12 * alpha),
                    opacity: (0, remotion_1.interpolate)(intro, [0, 1], [0, 1]),
                    transform: `translateY(${(0, remotion_1.interpolate)(intro, [0, 1], [26, 0])}px)`,
                }, children: "\"" }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    left: width * 0.12,
                    right: width * 0.12,
                    top: height * 0.68,
                    height: Math.max(4, height * 0.004),
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgba(accentA, 0)} 0%, ${toRgba(accentB, 0.76 * alpha)} 50%, ${toRgba(accentA, 0)} 100%)`,
                    boxShadow: `0 0 24px ${toRgba(accentB, 0.18 * alpha)}`,
                    opacity: (0, remotion_1.interpolate)(intro, [0, 1], [0, 1]),
                } }), label ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    right: width * 0.08,
                    top: height * 0.14,
                    maxWidth: width * 0.54,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: Math.max(18, width * 0.016),
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: toRgba(theme.palette.text, 0.16 * alpha),
                    textAlign: 'right',
                }, children: label })) : null] }));
};
const renderMotionPreset = (props) => {
    switch (props.selection.preset) {
        case 'focus-sweep':
            return props.selection.layout === 'highlight' ? ((0, jsx_runtime_1.jsx)(HighlightChipMotion, { ...props })) : ((0, jsx_runtime_1.jsx)(FocusSweepMotion, { ...props }));
        case 'editorial-grid':
            return (0, jsx_runtime_1.jsx)(EditorialGridMotion, { ...props });
        case 'cascade-rise':
            return (0, jsx_runtime_1.jsx)(CascadeRiseMotion, { ...props });
        case 'split-beam':
            return (0, jsx_runtime_1.jsx)(SplitBeamMotion, { ...props });
        case 'data-pulse':
            return (0, jsx_runtime_1.jsx)(DataPulseMotion, { ...props });
        case 'signal-radar':
            return (0, jsx_runtime_1.jsx)(SignalRadarMotion, { ...props });
        case 'timeline-trace':
            return (0, jsx_runtime_1.jsx)(TimelineTraceMotion, { ...props });
        case 'quote-focus':
            return props.selection.layout === 'highlight' ? ((0, jsx_runtime_1.jsx)(HighlightChipMotion, { ...props })) : ((0, jsx_runtime_1.jsx)(QuoteFocusMotion, { ...props }));
        case 'cta-converge':
            return (0, jsx_runtime_1.jsx)(CtaPulseMotion, { ...props });
        default:
            return null;
    }
};
const SHELL_PROFILE = {
    'focus-sweep': { y: 26, x: 0, scale: 1.02, drift: 4 },
    'editorial-grid': { y: 20, x: 8, scale: 0.992, drift: 2 },
    'cascade-rise': { y: 22, x: 12, scale: 0.988, drift: 3 },
    'split-beam': { y: 18, x: 0, scale: 0.992, drift: 2 },
    'data-pulse': { y: 18, x: 0, scale: 0.994, drift: 2 },
    'signal-radar': { y: 24, x: 0, scale: 1.012, drift: 3 },
    'timeline-trace': { y: 18, x: 6, scale: 0.992, drift: 2 },
    'quote-focus': { y: 22, x: 0, scale: 1.008, drift: 2 },
    'cta-converge': { y: 42, x: 0, scale: 0.968, drift: 2 },
};
const SceneMotionLayer = (props) => {
    const selection = resolveMotionSelection(props.slide, props.index);
    if (!selection) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { pointerEvents: 'none', overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)(CommonBackdrop, { ...props, selection: selection }), renderMotionPreset({ ...props, selection })] }));
};
exports.SceneMotionLayer = SceneMotionLayer;
const SceneMotionShell = ({ slide, theme, frame, fps, index, children, }) => {
    const selection = resolveMotionSelection(slide, index);
    if (!selection) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
    }
    const profile = SHELL_PROFILE[selection.preset];
    const intensityScale = getIntensityScale(selection.intensity);
    const intro = (0, remotion_1.spring)({
        frame,
        fps,
        config: {
            damping: theme.motion.damping + 2,
            stiffness: Math.max(70, theme.motion.stiffness - 6),
        },
    });
    const drift = Math.sin((frame + index * 3) / 26) * profile.drift * Math.min(1.2, intensityScale);
    const translateY = (0, remotion_1.interpolate)(intro, [0, 1], [profile.y * intensityScale, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const translateX = (0, remotion_1.interpolate)(intro, [0, 1], [profile.x * intensityScale, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const scale = (0, remotion_1.interpolate)(intro, [0, 1], [profile.scale, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const opacity = (0, remotion_1.interpolate)(intro, [0, 1], [0.18, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'absolute',
            inset: 0,
            opacity,
            transform: `translate3d(${translateX}px, ${translateY + drift}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: 'transform, opacity',
        }, children: children }));
};
exports.SceneMotionShell = SceneMotionShell;
