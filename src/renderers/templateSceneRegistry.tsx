import React from 'react';
import { GlassSlide } from '../GlassShow/GlassSlide';
import { KnowledgeSlide } from '../KnowledgeShow/KnowledgeSlide';
import { LiquidBriefSlide } from '../LiquidBriefShow/LiquidBriefSlide';
import { LiquidSlide } from '../LiquidShow/LiquidSlide';
import { MacSlide } from '../MacShow/MacSlide';
import { RichSlide } from '../RichShow/RichSlide';
import { TechSlide } from '../TechShow/TechSlide';
import type { SharedLayoutSlide } from '../layouts';
import type { ChartData, HighlightWord, StepItem, TimelineItem } from '../templates/types';

interface TemplateSceneProps {
  template?: string;
  slide: SharedLayoutSlide;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}

const getLayout = (slide: SharedLayoutSlide): string => {
  const layout = slide.layout || slide.type || 'default';

  switch (layout) {
    case 'cover':
      return 'hero';
    case 'cards':
      return 'list';
    case 'progress':
      return 'chart';
    case 'title':
      return 'hero';
    default:
      return layout;
  }
};

const splitPoint = (point: string): { title: string; description?: string } => {
  const parts = point
    .trim()
    .split(/[:：-]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { title: point.trim() };
  }

  return {
    title: parts[0],
    description: parts.slice(1).join(' - '),
  };
};

const GENERIC_HERO_BADGE_PATTERN =
  /^(先抛问题|抛问题|提出问题|关键反转|反转|核心问题|关键问题|先给结论|给结论|抛结论|先讲结论|开场钩子|钩子|破题|收束|行动引导|行动建议|证据页|反差页|重点来了|继续往下看|往下看答案|看答案|call to action|cta|hook|verdict|signal|preview)$/i;

const sanitizeHeroBadge = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || GENERIC_HERO_BADGE_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed;
};

const GENERIC_CTA_PATTERN =
  /^(答案在下一页|往下看答案|继续往下看|继续看答案|下页见|下一页见|下一页告诉你|往下看|继续看|接着看|马上揭晓|马上告诉你|继续看下去|看下去|call to action|cta)$/i;

const sanitizeCtaText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || GENERIC_CTA_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed;
};

const ensureListItems = (slide: SharedLayoutSlide) => {
  const items = slide.data?.items;

  if (Array.isArray(items) && items.length > 0) {
    return items.map((item, index) => {
      if (typeof item === 'string') {
        const parsed = splitPoint(item);
        return {
          icon: String(index + 1).padStart(2, '0'),
          text: parsed.title,
          desc: parsed.description,
        };
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        return {
          icon:
            typeof record.icon === 'string'
              ? record.icon
              : String(index + 1).padStart(2, '0'),
          text:
            typeof record.text === 'string'
              ? record.text
              : typeof record.title === 'string'
                ? record.title
                : `Item ${index + 1}`,
          desc:
            typeof record.desc === 'string'
              ? record.desc
              : typeof record.description === 'string'
                ? record.description
                : undefined,
        };
      }

      return {
        icon: String(index + 1).padStart(2, '0'),
        text: `Item ${index + 1}`,
      };
    });
  }

  return (slide.points || []).map((point, index) => {
    const parsed = splitPoint(point);
    return {
      icon: String(index + 1).padStart(2, '0'),
      text: parsed.title,
      desc: parsed.description,
    };
  });
};

const ensureHighlightItems = (slide: SharedLayoutSlide): string[] => {
  const highlights = slide.data?.highlights;
  if (Array.isArray(highlights) && highlights.length > 0) {
    return highlights
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string') {
          return (item as { text: string }).text;
        }

        return undefined;
      })
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  const items = slide.data?.items;
  if (Array.isArray(items) && items.length > 0) {
    return items
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          if (typeof record.text === 'string') return record.text;
          if (typeof record.title === 'string') return record.title;
        }

        return undefined;
      })
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  return (slide.points || []).filter((point) => point.trim().length > 0);
};

const ensureSteps = (slide: SharedLayoutSlide): StepItem[] => {
  const steps = slide.data?.steps;
  if (Array.isArray(steps) && steps.length > 0) {
    const normalizedSteps: StepItem[] = [];

    steps.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const record = item as Record<string, unknown>;
      if (typeof record.title !== 'string') return;
      normalizedSteps.push({
        title: record.title,
        description: typeof record.description === 'string' ? record.description : undefined,
        icon: typeof record.icon === 'string' ? record.icon : undefined,
      });
    });

    return normalizedSteps;
  }

  return (slide.points || []).map((point) => {
    const parsed = splitPoint(point);
    return {
      title: parsed.title,
      description: parsed.description,
    };
  });
};

const ensureTimeline = (slide: SharedLayoutSlide): TimelineItem[] => {
  const timeline = slide.data?.timeline;
  if (Array.isArray(timeline) && timeline.length > 0) {
    const normalizedTimeline: TimelineItem[] = [];

    timeline.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const record = item as Record<string, unknown>;
      if (typeof record.title !== 'string' || typeof record.year !== 'string') return;
      normalizedTimeline.push({
        year: record.year,
        title: record.title,
        description: typeof record.description === 'string' ? record.description : undefined,
      });
    });

    return normalizedTimeline;
  }

  return (slide.points || []).map((point, index) => {
    const parsed = splitPoint(point);
    return {
      year: String(index + 1).padStart(2, '0'),
      title: parsed.title,
      description: parsed.description,
    };
  });
};

const ensureChart = (slide: SharedLayoutSlide): ChartData | undefined => {
  const chart = slide.data?.chart;
  if (chart && typeof chart === 'object') {
    const record = chart as Record<string, unknown>;
    if (
      (record.type === 'bar' || record.type === 'progress' || record.type === 'pie') &&
      Array.isArray(record.values)
    ) {
      return record as unknown as ChartData;
    }
  }

  const bars = slide.data?.bars;
  if (Array.isArray(bars) && bars.length > 0) {
    return {
      type: 'progress',
      values: bars
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const record = item as Record<string, unknown>;
          const rawValue =
            typeof record.value === 'number'
              ? record.value
              : typeof record.percent === 'number'
                ? record.percent
                : null;
          if (typeof record.label !== 'string' || rawValue === null) return null;
          return {
            label: record.label,
            value: rawValue,
            color: typeof record.color === 'string' ? record.color : undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    };
  }

  return undefined;
};

const ensureStats = (slide: SharedLayoutSlide) => {
  const stats = slide.data?.stats;
  if (Array.isArray(stats) && stats.length > 0) {
    return stats
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const rawValue = record.value;
        const value =
          typeof rawValue === 'number'
            ? rawValue
            : typeof rawValue === 'string'
              ? Number(rawValue.replace(/[^\d.-]/g, ''))
              : null;

        if (value === null || Number.isNaN(value)) return null;

        return {
          value,
          suffix: typeof record.suffix === 'string' ? record.suffix : undefined,
          label:
            typeof record.label === 'string'
              ? record.label
              : typeof record.title === 'string'
                ? record.title
                : 'Metric',
          note:
            typeof record.note === 'string'
              ? record.note
              : typeof record.desc === 'string'
                ? record.desc
                : undefined,
          color: typeof record.color === 'string' ? record.color : undefined,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  return [];
};

const ensureCompare = (slide: SharedLayoutSlide) => {
  const leftRecord =
    slide.data?.left && typeof slide.data.left === 'object'
      ? (slide.data.left as Record<string, unknown>)
      : undefined;
  const rightRecord =
    slide.data?.right && typeof slide.data.right === 'object'
      ? (slide.data.right as Record<string, unknown>)
      : undefined;

  if (leftRecord && rightRecord) {
    const leftTitle =
      typeof leftRecord.title === 'string'
        ? leftRecord.title
        : typeof leftRecord.value === 'string'
          ? leftRecord.value
          : typeof leftRecord.label === 'string'
            ? leftRecord.label
            : 'Before';
    const rightTitle =
      typeof rightRecord.title === 'string'
        ? rightRecord.title
        : typeof rightRecord.value === 'string'
          ? rightRecord.value
          : typeof rightRecord.label === 'string'
            ? rightRecord.label
            : 'After';

    return {
      left: {
        label: typeof leftRecord.label === 'string' ? leftRecord.label : 'Before',
        value: typeof leftRecord.value === 'string' ? leftRecord.value : leftTitle,
        title: leftTitle,
        desc: typeof leftRecord.desc === 'string' ? leftRecord.desc : undefined,
        points: Array.isArray(leftRecord.points)
          ? leftRecord.points.filter((item): item is string => typeof item === 'string')
          : typeof leftRecord.desc === 'string'
            ? [leftRecord.desc]
            : [],
      },
      right: {
        label: typeof rightRecord.label === 'string' ? rightRecord.label : 'After',
        value: typeof rightRecord.value === 'string' ? rightRecord.value : rightTitle,
        title: rightTitle,
        desc: typeof rightRecord.desc === 'string' ? rightRecord.desc : undefined,
        points: Array.isArray(rightRecord.points)
          ? rightRecord.points.filter((item): item is string => typeof item === 'string')
          : typeof rightRecord.desc === 'string'
            ? [rightRecord.desc]
            : [],
      },
      centerLabel:
        typeof slide.data?.centerLabel === 'string'
          ? slide.data.centerLabel
          : typeof slide.data?.vsText === 'string'
            ? slide.data.vsText
            : 'VS',
      vsText: typeof slide.data?.vsText === 'string' ? slide.data.vsText : 'VS',
    };
  }

  const [first, second] = slide.points || [];
  if (!first || !second) {
    return undefined;
  }

  const left = splitPoint(first);
  const right = splitPoint(second);
  return {
    left: {
      label: 'Before',
      value: left.title,
      title: left.title,
      desc: left.description,
      points: left.description ? [left.description] : [],
    },
    right: {
      label: 'After',
      value: right.title,
      title: right.title,
      desc: right.description,
      points: right.description ? [right.description] : [],
    },
    centerLabel: 'VS',
    vsText: 'VS',
  };
};

const ensureQuote = (slide: SharedLayoutSlide) => {
  const quote =
    typeof slide.data?.quote === 'string'
      ? slide.data.quote
      : slide.subtitle || slide.title || '';
  const author =
    typeof slide.data?.author === 'string'
      ? slide.data.author
      : slide.title && slide.subtitle
        ? slide.title
        : undefined;

  return {
    quote,
    author,
    tags: ensureHighlightItems(slide).slice(0, 4),
  };
};

const ensureHeroData = (slide: SharedLayoutSlide) => ({
  badge: sanitizeHeroBadge(slide.data?.badge),
  cta:
    sanitizeCtaText(slide.data?.cta) ||
    sanitizeCtaText(slide.data?.button),
});

const toCompactPoints = (slide: SharedLayoutSlide): string[] => {
  if (Array.isArray(slide.points) && slide.points.length > 0) {
    return slide.points.filter((point) => point.trim().length > 0);
  }

  return ensureListItems(slide)
    .map((item) => (item.desc ? `${item.text}: ${item.desc}` : item.text))
    .filter((item) => item.trim().length > 0);
};

const toKnowledgeStatHighlights = (slide: SharedLayoutSlide): HighlightWord[] | undefined => {
  const stats = ensureStats(slide);
  if (stats.length === 0) return undefined;

  return stats.map((item) => ({
    text: `${item.value}${item.suffix || ''} ${item.label}`.trim(),
  }));
};

const toKnowledgeComparePoints = (slide: SharedLayoutSlide): string[] | undefined => {
  const compare = ensureCompare(slide);
  if (!compare) return undefined;

  return [
    `${compare.left.label}: ${compare.left.value}${compare.left.desc ? ` - ${compare.left.desc}` : ''}`,
    `${compare.right.label}: ${compare.right.value}${compare.right.desc ? ` - ${compare.right.desc}` : ''}`,
  ];
};

const toKnowledgeQuotePoints = (slide: SharedLayoutSlide): string[] | undefined => {
  const quote = ensureQuote(slide);
  if (!quote.quote) return undefined;
  return [quote.quote];
};

const toKnowledgeCtaPoints = (slide: SharedLayoutSlide): string[] | undefined => {
  const cta =
    typeof slide.data?.cta === 'string'
      ? slide.data.cta
      : typeof slide.data?.button === 'string'
        ? slide.data.button
        : undefined;

  const points = [...(slide.points || []), ...(cta ? [cta] : [])].filter((item) => item.trim().length > 0);
  return points.length > 0 ? points : undefined;
};

const renderGlassScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  const supportedLayouts = new Set([
    'default',
    'steps',
    'timeline',
    'chart',
    'highlight',
    'list',
    'compare',
    'stats',
    'quote',
    'hero',
    'cta',
  ]);

  if (!supportedLayouts.has(layout)) {
    return null;
  }

  const componentLayout = layout === 'cta' ? 'hero' : layout;

  return (
    <GlassSlide
      title={slide.title || ''}
      subtitle={slide.subtitle}
      points={slide.points}
      type={componentLayout as React.ComponentProps<typeof GlassSlide>['type']}
      data={{
        ...(slide.data || {}),
        items: layout === 'list' ? ensureListItems(slide) : layout === 'highlight' ? ensureHighlightItems(slide) : slide.data?.items,
        steps: layout === 'steps' ? ensureSteps(slide) : slide.data?.steps,
        timeline: layout === 'timeline' ? ensureTimeline(slide) : slide.data?.timeline,
        chart: layout === 'chart' ? ensureChart(slide) : slide.data?.chart,
        bars: layout === 'chart' ? (ensureChart(slide)?.values || slide.data?.bars) : slide.data?.bars,
        stats: layout === 'stats' ? ensureStats(slide) : slide.data?.stats,
        ...(layout === 'compare' ? ensureCompare(slide) : null),
        ...(layout === 'quote' ? ensureQuote(slide) : null),
        ...((layout === 'hero' || layout === 'cta') ? ensureHeroData(slide) : null),
      }}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

const renderLiquidScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  const supportedLayouts = new Set([
    'default',
    'steps',
    'timeline',
    'chart',
    'highlight',
    'list',
    'compare',
    'stats',
    'quote',
    'hero',
    'cta',
  ]);

  if (!supportedLayouts.has(layout)) {
    return null;
  }

  const componentLayout = layout === 'cta' ? 'hero' : layout;

  return (
    <LiquidSlide
      title={slide.title || ''}
      subtitle={slide.subtitle}
      points={slide.points}
      type={componentLayout as React.ComponentProps<typeof LiquidSlide>['type']}
      data={{
        ...(slide.data || {}),
        items: layout === 'list' ? ensureListItems(slide) : layout === 'highlight' ? ensureHighlightItems(slide) : slide.data?.items,
        steps: layout === 'steps' ? ensureSteps(slide) : slide.data?.steps,
        timeline: layout === 'timeline' ? ensureTimeline(slide) : slide.data?.timeline,
        chart: layout === 'chart' ? ensureChart(slide) : slide.data?.chart,
        bars: layout === 'chart' ? (ensureChart(slide)?.values || slide.data?.bars) : slide.data?.bars,
        stats: layout === 'stats' ? ensureStats(slide) : slide.data?.stats,
        ...(layout === 'compare' ? ensureCompare(slide) : null),
        ...(layout === 'quote' ? ensureQuote(slide) : null),
        ...((layout === 'hero' || layout === 'cta') ? ensureHeroData(slide) : null),
      }}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

const renderLiquidBriefScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  let type: React.ComponentProps<typeof LiquidBriefSlide>['type'] | null = null;

  if (layout === 'hero') type = 'cover';
  if (layout === 'cta') type = 'cover';
  if (layout === 'steps') type = 'steps';
  if (layout === 'timeline') type = 'steps';
  if (layout === 'compare') type = 'compare';
  if (layout === 'stats') type = 'stats';
  if (layout === 'chart') type = 'stats';
  if (layout === 'quote') type = 'quote';
  if (layout === 'list' || layout === 'highlight' || layout === 'default') type = 'cards';

  if (!type) {
    return null;
  }

  const data: Record<string, unknown> = {
    ...(slide.data || {}),
    cards:
      type === 'cards'
        ? ensureListItems(slide).map((item, itemIndex) => ({
            eyebrow: item.icon || `0${itemIndex + 1}`,
            title: item.text,
            body: item.desc || '',
          }))
        : slide.data?.cards,
    steps:
      type === 'steps'
        ? layout === 'timeline'
          ? ensureTimeline(slide).map((item) => ({
              title: `${item.year} ${item.title}`.trim(),
              description: item.description,
            }))
          : ensureSteps(slide)
        : slide.data?.steps,
    stats:
      type === 'stats'
        ? layout === 'chart'
          ? toTechRichBars(slide).map((item) => ({
              value: `${item.value}%`,
              label: item.label,
              note: '当前进度',
            }))
          : ensureStats(slide).map((item) => ({
              value: `${item.value}${item.suffix || ''}`,
              label: item.label,
              note: item.note || '',
            }))
        : slide.data?.stats,
    insights:
      type === 'stats'
        ? (slide.points || []).slice(0, 3)
        : slide.data?.insights,
    ...(type === 'compare' ? ensureCompare(slide) : null),
    ...(type === 'quote' ? ensureQuote(slide) : null),
  };

  return (
    <LiquidBriefSlide
      title={slide.title || ''}
      subtitle={slide.subtitle}
      badge={typeof slide.data?.badge === 'string' ? slide.data.badge : undefined}
      items={
        type === 'cover'
          ? ensureListItems({
              ...slide,
              points:
                layout === 'cta'
                  ? [...(slide.points || []), ...(typeof slide.data?.cta === 'string' ? [slide.data.cta] : [])]
                  : slide.points,
            }).map((item, itemIndex) => ({
              number: String(itemIndex + 1).padStart(2, '0'),
              title: item.text,
            }))
          : undefined
      }
      type={type}
      data={data}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

const toTechRichListItems = (slide: SharedLayoutSlide) => ensureListItems(slide);

const toTechRichBars = (slide: SharedLayoutSlide) => {
  const chart = ensureChart(slide);
  if (chart) {
    return chart.values.map((item) => ({
      label: item.label,
      percent: item.value,
      value: item.value,
      color: item.color,
    }));
  }

  const bars = slide.data?.bars;
  if (Array.isArray(bars)) {
    return bars
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const rawValue =
          typeof record.percent === 'number'
            ? record.percent
            : typeof record.value === 'number'
              ? record.value
              : null;
        if (typeof record.label !== 'string' || rawValue === null) return null;
        return {
          label: record.label,
          percent: rawValue,
          value: rawValue,
          color: typeof record.color === 'string' ? record.color : undefined,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  return [];
};

const renderTechScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  let type: string | null = null;

  if (layout === 'hero') type = 'title';
  if (layout === 'stats') type = 'stats';
  if (layout === 'list' || layout === 'highlight' || layout === 'default' || layout === 'steps' || layout === 'timeline') type = 'list';
  if (layout === 'chart') type = 'progress';
  if (layout === 'compare') type = 'compare';
  if (layout === 'quote') type = 'quote';
  if (layout === 'cta') type = 'cta';

  if (!type) {
    return null;
  }

  return (
    <TechSlide
      type={type}
      data={{
        ...(slide.data || {}),
        title: slide.title,
        subtitle: slide.subtitle,
        items:
          type === 'list'
            ? layout === 'steps'
              ? ensureSteps(slide).map((item, itemIndex) => ({
                  icon: String(itemIndex + 1).padStart(2, '0'),
                  text: item.title,
                  desc: item.description,
                }))
              : layout === 'timeline'
                ? ensureTimeline(slide).map((item) => ({
                    icon: item.year,
                    text: item.title,
                    desc: item.description,
                  }))
                : toTechRichListItems(slide)
            : slide.data?.items,
        stats: type === 'stats' ? ensureStats(slide) : slide.data?.stats,
        bars: type === 'progress' ? toTechRichBars(slide) : slide.data?.bars,
        ...(type === 'compare' ? ensureCompare(slide) : null),
        ...(type === 'quote' ? ensureQuote(slide) : null),
        button:
          type === 'cta'
            ? typeof slide.data?.button === 'string'
              ? slide.data.button
              : typeof slide.data?.cta === 'string'
                ? slide.data.cta
                : 'Start now'
            : slide.data?.button,
      }}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

const renderRichScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  let type: string | null = null;

  if (layout === 'hero') type = 'title';
  if (layout === 'stats') type = 'stats';
  if (layout === 'highlight') type = 'highlight';
  if (layout === 'chart') type = 'progress';
  if (layout === 'compare') type = 'compare';
  if (layout === 'quote') type = 'quote';
  if (layout === 'list' || layout === 'default' || layout === 'steps' || layout === 'timeline') type = 'list';
  if (layout === 'cta') type = 'cta';

  if (!type) {
    return null;
  }

  return (
    <RichSlide
      type={type}
      data={{
        ...(slide.data || {}),
        title: slide.title,
        subtitle: slide.subtitle,
        items:
          type === 'list'
            ? layout === 'steps'
              ? ensureSteps(slide).map((item, itemIndex) => ({
                  icon: String(itemIndex + 1).padStart(2, '0'),
                  text: item.title,
                  desc: item.description,
                }))
              : layout === 'timeline'
                ? ensureTimeline(slide).map((item) => ({
                    icon: item.year,
                    text: item.title,
                    desc: item.description,
                  }))
                : toTechRichListItems(slide)
            : type === 'highlight'
              ? ensureHighlightItems(slide)
              : slide.data?.items,
        stats: type === 'stats' ? ensureStats(slide) : slide.data?.stats,
        bars: type === 'progress' ? toTechRichBars(slide) : slide.data?.bars,
        ...(type === 'compare' ? ensureCompare(slide) : null),
        ...(type === 'quote' ? ensureQuote(slide) : null),
        button:
          type === 'cta'
            ? typeof slide.data?.button === 'string'
              ? slide.data.button
              : typeof slide.data?.cta === 'string'
                ? slide.data.cta
                : 'Start now'
            : slide.data?.button,
      }}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

const toKnowledgeHighlights = (slide: SharedLayoutSlide): HighlightWord[] | undefined => {
  const items = ensureHighlightItems(slide);
  if (items.length === 0) return undefined;
  return items.map((text) => ({ text }));
};

const renderKnowledgeScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  const heroHighlights = toKnowledgeHighlights(slide);
  const statHighlights = toKnowledgeStatHighlights(slide);
  const comparePoints = toKnowledgeComparePoints(slide);
  const quotePoints = toKnowledgeQuotePoints(slide);
  const ctaPoints = toKnowledgeCtaPoints(slide);

  return (
    <KnowledgeSlide
      title={slide.title}
      subtitle={slide.subtitle}
      points={
        layout === 'default' || layout === 'list'
          ? toCompactPoints(slide)
          : layout === 'compare'
            ? comparePoints
            : layout === 'quote'
              ? quotePoints
              : layout === 'cta'
                ? ctaPoints
                : undefined
      }
      highlights={
        layout === 'highlight'
          ? toKnowledgeHighlights(slide)
          : layout === 'stats'
            ? statHighlights
            : layout === 'hero'
              ? heroHighlights
              : undefined
      }
      steps={layout === 'steps' ? ensureSteps(slide) : undefined}
      timeline={layout === 'timeline' ? ensureTimeline(slide) : undefined}
      chart={layout === 'chart' ? ensureChart(slide) : undefined}
      elementTimings={slide.elementTimings}
      slideAudioStart={slide.audioStart}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

const renderMacScene = ({ slide, index, totalSlides, durationInFrames }: TemplateSceneProps) => {
  const layout = getLayout(slide);
  const supportedLayouts = new Set([
    'default',
    'steps',
    'timeline',
    'chart',
    'highlight',
    'list',
    'compare',
    'stats',
    'quote',
    'hero',
    'cta',
  ]);

  if (!supportedLayouts.has(layout)) {
    return null;
  }

  return (
    <MacSlide
      title={slide.title || ''}
      subtitle={slide.subtitle}
      points={slide.points}
      type={layout as React.ComponentProps<typeof MacSlide>['type']}
      data={slide.data as Record<string, unknown> | undefined}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
    />
  );
};

export const renderTemplateScene = (props: TemplateSceneProps): React.ReactNode | null => {
  switch (props.template) {
    case 'GlassShow':
      return renderGlassScene(props);
    case 'LiquidShow':
      return renderLiquidScene(props);
    case 'LiquidBriefShow':
      return renderLiquidBriefScene(props);
    case 'TechShow':
      return renderTechScene(props);
    case 'RichShow':
      return renderRichScene(props);
    case 'KnowledgeShow':
      return renderKnowledgeScene(props);
    case 'MacShow':
      return renderMacScene(props);
    default:
      return null;
  }
};
