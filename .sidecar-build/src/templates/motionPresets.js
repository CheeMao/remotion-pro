"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMotionPresetOptionsForLayout = exports.normalizeMotionLayout = exports.MOTION_PRESET_SUPPORTED_LAYOUTS = exports.LAYOUT_MOTION_PRESET_ROTATION = exports.MOTION_PRESET_LABELS = void 0;
exports.MOTION_PRESET_LABELS = {
    'focus-sweep': '聚焦扫光',
    'editorial-grid': '编辑网格',
    'cascade-rise': '层叠上升',
    'split-beam': '双向束线',
    'data-pulse': '数据脉冲',
    'signal-radar': '信号雷达',
    'timeline-trace': '时间轨迹',
    'quote-focus': '引用聚焦',
    'cta-converge': '行动收束',
};
exports.LAYOUT_MOTION_PRESET_ROTATION = {
    hero: ['focus-sweep', 'editorial-grid', 'signal-radar'],
    default: ['editorial-grid', 'cascade-rise', 'data-pulse'],
    steps: ['cascade-rise', 'timeline-trace', 'editorial-grid'],
    compare: ['split-beam', 'signal-radar'],
    stats: ['data-pulse', 'split-beam', 'signal-radar'],
    quote: ['quote-focus', 'focus-sweep'],
    list: ['cascade-rise', 'editorial-grid', 'timeline-trace'],
    chart: ['data-pulse', 'split-beam', 'signal-radar'],
    timeline: ['timeline-trace', 'editorial-grid'],
    highlight: ['focus-sweep', 'cascade-rise', 'quote-focus'],
    cta: ['cta-converge', 'focus-sweep'],
};
exports.MOTION_PRESET_SUPPORTED_LAYOUTS = {
    'focus-sweep': ['hero', 'default', 'highlight', 'quote', 'cta'],
    'editorial-grid': ['hero', 'default', 'list', 'steps', 'timeline'],
    'cascade-rise': ['default', 'list', 'steps', 'highlight'],
    'split-beam': ['compare', 'stats', 'chart'],
    'data-pulse': ['stats', 'chart', 'default'],
    'signal-radar': ['hero', 'compare', 'stats', 'chart'],
    'timeline-trace': ['timeline', 'steps', 'list'],
    'quote-focus': ['quote', 'highlight', 'hero'],
    'cta-converge': ['cta', 'hero'],
};
const normalizeMotionLayout = (layout) => {
    switch (layout) {
        case 'cover':
        case 'title':
        case 'hero':
            return 'hero';
        case 'default':
            return 'default';
        case 'steps':
            return 'steps';
        case 'compare':
            return 'compare';
        case 'stats':
            return 'stats';
        case 'quote':
            return 'quote';
        case 'cards':
        case 'list':
            return 'list';
        case 'chart':
        case 'progress':
            return 'chart';
        case 'timeline':
            return 'timeline';
        case 'highlight':
            return 'highlight';
        case 'cta':
            return 'cta';
        default:
            return null;
    }
};
exports.normalizeMotionLayout = normalizeMotionLayout;
const getMotionPresetOptionsForLayout = (layout) => {
    const normalizedLayout = (0, exports.normalizeMotionLayout)(layout);
    if (!normalizedLayout) {
        return Object.keys(exports.MOTION_PRESET_LABELS);
    }
    return exports.LAYOUT_MOTION_PRESET_ROTATION[normalizedLayout];
};
exports.getMotionPresetOptionsForLayout = getMotionPresetOptionsForLayout;
