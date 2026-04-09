"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThemeIdForTemplate = exports.getThemeForTemplate = exports.getThemeDefinition = exports.THEME_REGISTRY = void 0;
const baseTypography = {
    titleSize: 82,
    subtitleSize: 34,
    bodySize: 28,
    overlineSize: 15,
    titleWeight: 900,
    bodyWeight: 600,
};
const baseMotion = {
    damping: 16,
    stiffness: 100,
    staggerFrames: 6,
};
exports.THEME_REGISTRY = {
    cosmos: {
        id: 'cosmos',
        label: 'Cosmos',
        palette: {
            background: 'radial-gradient(ellipse 1400px 2000px at 50% 30%, #0e0a1a 0%, #07070f 80%)',
            surface: 'rgba(255, 255, 255, 0.05)',
            surfaceAlt: 'rgba(245, 166, 35, 0.08)',
            text: '#ffffff',
            muted: '#8a94b0',
            border: 'rgba(255, 255, 255, 0.07)',
            accents: ['#f5a623', '#a78bfa', '#22d3ee', '#34d399'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
            titleSize: 80,
            subtitleSize: 34,
        },
        motion: { ...baseMotion, damping: 18, stiffness: 80 },
        effects: { grid: false, glass: false, glow: true },
        radius: { panel: 28, chip: 999 },
    },
    glass: {
        id: 'glass',
        label: 'Glass',
        palette: {
            background: 'linear-gradient(135deg, #17153b 0%, #2d1e5f 50%, #121a3f 100%)',
            surface: 'rgba(18, 24, 54, 0.68)',
            surfaceAlt: 'rgba(255, 255, 255, 0.1)',
            text: '#f8fafc',
            muted: '#c7d2fe',
            border: 'rgba(255, 255, 255, 0.14)',
            accents: ['#8b5cf6', '#22d3ee', '#f472b6'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
        },
        motion: baseMotion,
        effects: { grid: false, glass: true, glow: true },
        radius: { panel: 30, chip: 999 },
    },
    tech: {
        id: 'tech',
        label: 'Tech',
        palette: {
            background: 'linear-gradient(135deg, #050816 0%, #0f172a 45%, #111827 100%)',
            surface: 'rgba(8, 15, 35, 0.82)',
            surfaceAlt: 'rgba(0, 240, 255, 0.08)',
            text: '#f8fafc',
            muted: 'rgba(226, 232, 240, 0.72)',
            border: 'rgba(34, 211, 238, 0.18)',
            accents: ['#00f0ff', '#06ffa5', '#ff2e97'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
        },
        motion: { ...baseMotion, damping: 14, stiffness: 110 },
        effects: { grid: true, glass: false, glow: true },
        radius: { panel: 28, chip: 999 },
    },
    knowledge: {
        id: 'knowledge',
        label: 'Knowledge',
        palette: {
            background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
            surface: 'rgba(15, 23, 42, 0.78)',
            surfaceAlt: 'rgba(30, 41, 59, 0.72)',
            text: '#f8fafc',
            muted: '#94a3b8',
            border: 'rgba(148, 163, 184, 0.18)',
            accents: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
            titleSize: 74,
            subtitleSize: 30,
        },
        motion: baseMotion,
        effects: { grid: true, glass: true, glow: false },
        radius: { panel: 28, chip: 999 },
    },
    liquid: {
        id: 'liquid',
        label: 'Liquid',
        palette: {
            background: 'linear-gradient(180deg, #eef2ff 0%, #e2e8f0 100%)',
            surface: 'rgba(255, 255, 255, 0.78)',
            surfaceAlt: 'rgba(255, 255, 255, 0.54)',
            text: '#1e293b',
            muted: '#64748b',
            border: 'rgba(148, 163, 184, 0.22)',
            accents: ['#0ea5e9', '#a78bfa', '#fb7185'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
            titleSize: 78,
        },
        motion: baseMotion,
        effects: { grid: false, glass: true, glow: false },
        radius: { panel: 32, chip: 999 },
    },
    minimal: {
        id: 'minimal',
        label: 'Minimal',
        palette: {
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            surfaceAlt: 'rgba(241, 245, 249, 0.85)',
            text: '#0f172a',
            muted: '#475569',
            border: 'rgba(148, 163, 184, 0.18)',
            accents: ['#2563eb', '#7c3aed', '#f97316'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
            titleSize: 76,
            subtitleSize: 30,
        },
        motion: baseMotion,
        effects: { grid: false, glass: false, glow: false },
        radius: { panel: 24, chip: 999 },
    },
    stick: {
        id: 'stick',
        label: 'Stick',
        palette: {
            background: 'radial-gradient(ellipse 1200px 1800px at 50% 30%, #2a2520 0%, #0e0c0a 80%)',
            surface: 'rgba(255, 254, 251, 0.06)',
            surfaceAlt: 'rgba(251, 191, 36, 0.10)',
            text: '#fffefb',
            muted: 'rgba(255, 254, 251, 0.66)',
            border: 'rgba(255, 254, 251, 0.18)',
            accents: ['#fbbf24', '#f472b6', '#67e8f9', '#86efac'],
        },
        typography: {
            fontFamily: "'Caveat', 'Marker Felt', 'Comic Sans MS', 'PingFang SC', sans-serif",
            ...baseTypography,
            titleSize: 84,
            subtitleSize: 32,
        },
        motion: { ...baseMotion, damping: 18, stiffness: 100 },
        effects: { grid: false, glass: false, glow: true },
        radius: { panel: 18, chip: 999 },
    },
    insight: {
        id: 'insight',
        label: 'Insight',
        palette: {
            background: 'linear-gradient(180deg, #080d1a 0%, #0a0f1e 100%)',
            surface: 'rgba(15, 23, 42, 0.75)',
            surfaceAlt: 'rgba(99, 102, 241, 0.10)',
            text: '#f1f5f9',
            muted: 'rgba(203, 213, 225, 0.72)',
            border: 'rgba(99, 102, 241, 0.18)',
            accents: ['#6366f1', '#fbbf24', '#38bdf8', '#34d399'],
        },
        typography: {
            fontFamily: "'Inter', 'SF Pro Display', 'PingFang SC', sans-serif",
            ...baseTypography,
            titleSize: 78,
            subtitleSize: 32,
        },
        motion: { ...baseMotion, damping: 17, stiffness: 105 },
        effects: { grid: true, glass: false, glow: true },
        radius: { panel: 28, chip: 999 },
    },
    project: {
        id: 'project',
        label: 'Project',
        palette: {
            background: 'linear-gradient(180deg, #0c1629 0%, #0d1b30 100%)',
            surface: 'rgba(255, 255, 255, 0.04)',
            surfaceAlt: 'rgba(74, 159, 213, 0.08)',
            text: '#e8f0fe',
            muted: '#64748b',
            border: 'rgba(100, 160, 220, 0.2)',
            accents: ['#4a9fd5', '#87ceeb', '#f5821f', '#fbbf24'],
        },
        typography: {
            fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
            titleSize: 82,
            subtitleSize: 34,
            bodySize: 28,
            overlineSize: 15,
            titleWeight: 900,
            bodyWeight: 600,
        },
        motion: { damping: 16, stiffness: 100, staggerFrames: 6 },
        effects: { grid: false, glass: false, glow: false },
        radius: { panel: 12, chip: 999 },
    },
};
const TEMPLATE_THEME_MAP = {
    CosmosShow: 'cosmos',
    GlassShow: 'glass',
    LiquidShow: 'liquid',
    LiquidBriefShow: 'liquid',
    MacShow: 'minimal',
    StudioShow: 'tech',
    EditorialShow: 'minimal',
    InsightShow: 'insight',
    StickShow: 'stick',
    KnowledgeShow: 'knowledge',
    TechShow: 'tech',
    GeneratedVideo: 'tech',
    RichShow: 'glass',
    ProjectShow: 'project',
};
const getThemeDefinition = (themeId) => {
    return exports.THEME_REGISTRY[themeId || 'tech'] || exports.THEME_REGISTRY.tech;
};
exports.getThemeDefinition = getThemeDefinition;
const getThemeForTemplate = (template) => {
    return (0, exports.getThemeDefinition)(template ? TEMPLATE_THEME_MAP[template] : undefined);
};
exports.getThemeForTemplate = getThemeForTemplate;
const getThemeIdForTemplate = (template) => {
    if (!template) {
        return 'tech';
    }
    return TEMPLATE_THEME_MAP[template] || 'tech';
};
exports.getThemeIdForTemplate = getThemeIdForTemplate;
