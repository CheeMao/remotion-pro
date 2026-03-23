import { ContentSlide } from './types';

export type KnowledgeLayoutMode =
  | 'hero'
  | 'list'
  | 'cards'
  | 'compare'
  | 'timeline'
  | 'stats'
  | 'quote';

export interface KnowledgeCompareSide {
  label: string;
  value?: string;
  points: string[];
}

export interface KnowledgeTimelineItem {
  label: string;
  title: string;
  description?: string;
}

export interface KnowledgeStatItem {
  value: string;
  label: string;
  note?: string;
}

export interface KnowledgeQuote {
  text: string;
  author?: string;
}

export interface KnowledgeLayout {
  mode: KnowledgeLayoutMode;
  title: string;
  subtitle?: string;
  badge?: string;
  points: string[];
  compare?: {
    left: KnowledgeCompareSide;
    right: KnowledgeCompareSide;
  };
  timeline?: KnowledgeTimelineItem[];
  stats?: KnowledgeStatItem[];
  quote?: KnowledgeQuote;
}

const asString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item));
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
};

const toLabel = (value: unknown, fallback: string): string => {
  return asString(value) || fallback;
};

const toCompareSide = (
  value: unknown,
  fallbackLabel: string,
  fallbackPoints: string[]
): KnowledgeCompareSide => {
  const record = asRecord(value);
  if (!record) {
    return {
      label: fallbackLabel,
      points: fallbackPoints,
    };
  }

  const points = asStringArray(record.points);
  const description = asString(record.description) || asString(record.desc);

  return {
    label: toLabel(record.label ?? record.title, fallbackLabel),
    value: asString(record.value),
    points:
      points.length > 0
        ? points
        : description
          ? [description]
          : fallbackPoints,
  };
};

const toTimelineItems = (
  data: Record<string, unknown> | undefined,
  points: string[]
): KnowledgeTimelineItem[] => {
  const source =
    (Array.isArray(data?.timeline) ? data?.timeline : undefined) ||
    (Array.isArray(data?.items) ? data?.items : undefined);

  if (source) {
    return source
      .map((item, index) => {
        const record = asRecord(item);
        if (!record) {
          const text = asString(item);
          return text
            ? {
                label: String(index + 1).padStart(2, '0'),
                title: text,
              }
            : undefined;
        }

        return {
          label:
            asString(record.label) ||
            asString(record.year) ||
            asString(record.icon) ||
            String(index + 1).padStart(2, '0'),
          title:
            asString(record.title) ||
            asString(record.text) ||
            `Step ${index + 1}`,
          description:
            asString(record.description) ||
            asString(record.desc) ||
            asString(record.value),
        };
      })
      .filter((item): item is KnowledgeTimelineItem => Boolean(item));
  }

  return points.map((point, index) => ({
    label: String(index + 1).padStart(2, '0'),
    title: point,
  }));
};

const toStats = (
  data: Record<string, unknown> | undefined,
  points: string[]
): KnowledgeStatItem[] => {
  if (Array.isArray(data?.stats)) {
    return data.stats
      .map((item) => {
        const record = asRecord(item);
        if (!record) {
          return undefined;
        }

        const value = asString(record.value) || String(record.value ?? '').trim();
        const suffix = asString(record.suffix) || '';
        const label = asString(record.label);
        if (!value || !label) {
          return undefined;
        }

        return {
          value: `${value}${suffix}`,
          label,
          note: asString(record.note) || asString(record.description),
        };
      })
      .filter((item): item is KnowledgeStatItem => Boolean(item));
  }

  return points.slice(0, 4).map((point, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: point,
  }));
};

const inferMode = (
  slide: Pick<ContentSlide, 'type' | 'data' | 'points' | 'title'>,
  index: number
): KnowledgeLayoutMode => {
  const explicitType = asString(slide.type);
  const data = asRecord(slide.data);
  const pointCount = slide.points?.length ?? 0;

  if (explicitType === 'compare' || (data?.left && data?.right)) {
    return 'compare';
  }

  if (
    explicitType === 'timeline' ||
    explicitType === 'steps' ||
    Array.isArray(data?.timeline) ||
    Array.isArray(data?.items)
  ) {
    return 'timeline';
  }

  if (
    explicitType === 'stats' ||
    explicitType === 'chart' ||
    Array.isArray(data?.stats)
  ) {
    return 'stats';
  }

  if (explicitType === 'quote' || asString(data?.quote)) {
    return 'quote';
  }

  if (explicitType === 'highlight') {
    return 'cards';
  }

  if (index === 0 && pointCount <= 3) {
    return 'hero';
  }

  if (pointCount === 2) {
    return 'compare';
  }

  if (pointCount === 3) {
    return 'timeline';
  }

  if (pointCount >= 4) {
    return 'cards';
  }

  return 'list';
};

export const resolveKnowledgeLayout = (
  slide: Pick<ContentSlide, 'title' | 'subtitle' | 'points' | 'type' | 'data'>,
  index: number
): KnowledgeLayout => {
  const title = asString(slide.title) || `Slide ${index + 1}`;
  const subtitle = asString(slide.subtitle);
  const points = asStringArray(slide.points);
  const data = asRecord(slide.data);
  const mode = inferMode(slide, index);

  if (mode === 'compare') {
    const leftFallback = points[0] ? [points[0]] : subtitle ? [subtitle] : [];
    const rightFallback = points[1] ? [points[1]] : points.slice(2);

    return {
      mode,
      title,
      subtitle,
      badge: asString(data?.badge),
      points,
      compare: {
        left: toCompareSide(data?.left, asString(data?.leftTitle) || 'Current', leftFallback),
        right: toCompareSide(data?.right, asString(data?.rightTitle) || 'Target', rightFallback),
      },
    };
  }

  if (mode === 'timeline') {
    return {
      mode,
      title,
      subtitle,
      badge: asString(data?.badge),
      points,
      timeline: toTimelineItems(data, points),
    };
  }

  if (mode === 'stats') {
    return {
      mode,
      title,
      subtitle,
      badge: asString(data?.badge),
      points,
      stats: toStats(data, points),
    };
  }

  if (mode === 'quote') {
    return {
      mode,
      title,
      subtitle,
      badge: asString(data?.badge),
      points,
      quote: {
        text: asString(data?.quote) || subtitle || title,
        author: asString(data?.author),
      },
    };
  }

  return {
    mode,
    title,
    subtitle,
    badge: asString(data?.badge),
    points,
  };
};

export const getKnowledgeLayoutItemCount = (layout: KnowledgeLayout): number => {
  switch (layout.mode) {
    case 'compare':
      return Math.max(
        layout.compare?.left.points.length ?? 0,
        layout.compare?.right.points.length ?? 0,
        2
      );
    case 'timeline':
      return Math.max(layout.timeline?.length ?? 0, 1);
    case 'stats':
      return Math.max(layout.stats?.length ?? 0, layout.points.length, 1);
    case 'quote':
      return Math.max(layout.points.length, 1);
    case 'hero':
    case 'list':
    case 'cards':
    default:
      return Math.max(layout.points.length, 1);
  }
};
