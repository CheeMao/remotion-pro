export type MotionLayout =
  | 'hero'
  | 'default'
  | 'steps'
  | 'compare'
  | 'stats'
  | 'quote'
  | 'list'
  | 'chart'
  | 'timeline'
  | 'highlight'
  | 'cta';

export type SlideMotionPresetId =
  | 'focus-sweep'
  | 'editorial-grid'
  | 'cascade-rise'
  | 'split-beam'
  | 'data-pulse'
  | 'signal-radar'
  | 'timeline-trace'
  | 'quote-focus'
  | 'cta-converge';

export const MOTION_PRESET_LABELS: Record<SlideMotionPresetId, string> = {
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

export const LAYOUT_MOTION_PRESET_ROTATION: Record<
  MotionLayout,
  SlideMotionPresetId[]
> = {
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

export const MOTION_PRESET_SUPPORTED_LAYOUTS: Record<
  SlideMotionPresetId,
  MotionLayout[]
> = {
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

export const normalizeMotionLayout = (
  layout?: string | null,
): MotionLayout | null => {
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

export const getMotionPresetOptionsForLayout = (
  layout?: string | null,
): SlideMotionPresetId[] => {
  const normalizedLayout = normalizeMotionLayout(layout);
  if (!normalizedLayout) {
    return Object.keys(MOTION_PRESET_LABELS) as SlideMotionPresetId[];
  }

  return LAYOUT_MOTION_PRESET_ROTATION[normalizedLayout];
};
