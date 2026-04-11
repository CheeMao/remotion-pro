import type { ContentSlide } from './types';

/**
 * 数据字段列表
 * 这些字段会被提取到data对象中
 */
const DATA_FIELDS = [
  'badge',
  'cta',
  'stats',
  'compare',
  'steps',
  'items',
  'chart',
  'timeline',
  'highlights',
  'quote',
  'author',
  'left',
  'right',
  'vsText',
  'bars',
  'cover',
  'cards',
  'media',
  'image',
  'backgroundImage',
  'coverImage',
];

/**
 * 将扁平化字段构建为data对象
 * 供旧版组件使用
 */
export function buildDataFromFlatFields(slide: ContentSlide): Record<string, unknown> | undefined {
  const data: Record<string, unknown> = {};

  DATA_FIELDS.forEach((field) => {
    if (slide[field] !== undefined) {
      data[field] = slide[field];
    }
  });

  // 特殊处理某些字段
  if (slide.layout === 'quote' && slide.quote) {
    data.text = slide.quote;
  }

  if (slide.layout === 'chart' && slide.chart) {
    const chart = slide.chart as { bars?: unknown };
    if (chart.bars) {
      data.bars = chart.bars;
    }
  }

  return Object.keys(data).length > 0 ? data : undefined;
}

/**
 * 将AI生成的新格式转换为内部使用的旧格式
 *
 * 新格式（AI生成）:
 * {
 *   layout: 'stats',
 *   title: '...',
 *   stats: [...],
 *   narration: '...'
 * }
 *
 * 旧格式（组件使用）:
 * {
 *   type: 'stats',
 *   title: '...',
 *   data: { stats: [...] },
 *   narration: '...'
 * }
 */
export function normalizeSlide(slide: ContentSlide): ContentSlide {
  // 如果已经是旧格式（有type和data），直接返回
  if (slide.type && slide.data) {
    return slide;
  }

  // 如果是新格式（有layout），转换为旧格式
  if (slide.layout) {
    const { layout, ...rest } = slide;
    const data = buildDataFromFlatFields(slide);

    return {
      ...rest,
      type: layout,
      data,
    } as ContentSlide;
  }

  // 如果都没有，保持原样
  return slide;
}

/**
 * 批量规范化slides
 */
export function normalizeSlides(slides: ContentSlide[]): ContentSlide[] {
  return slides.map(normalizeSlide);
}

/**
 * 反向转换：将旧格式转换为新格式
 * 用于导出或显示
 */
export function denormalizeSlide(slide: ContentSlide): ContentSlide {
  // 如果已经是新格式，直接返回
  if (slide.layout && !slide.type) {
    return slide;
  }

  // 如果是旧格式，转换为新格式
  if (slide.type && slide.data) {
    const { type, data, ...rest } = slide;
    const newSlide: ContentSlide = {
      ...rest,
      layout: type,
    };

    // 将data中的字段展开
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        newSlide[key] = value;
      });
    }

    return newSlide;
  }

  // 如果都没有，保持原样
  return slide;
}

/**
 * 批量反向转换
 */
export function denormalizeSlides(slides: ContentSlide[]): ContentSlide[] {
  return slides.map(denormalizeSlide);
}
