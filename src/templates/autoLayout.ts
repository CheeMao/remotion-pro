import { calculateAllElementTimings } from './elementTiming';
import { normalizeSlide } from './normalizeSlide';
import type {
  ChartData,
  ContentSlide,
  HighlightWord,
  StepItem,
  TimelineItem,
} from './types';

const NUMERIC_POINT_PATTERN = /\d+(?:[.,]\d+)?\s*(%|x|X|倍|个|项|天|年|小时|分钟|万|亿|k|K|m|M)?/;
const STEP_HINT_PATTERN = /^(?:\d+[.)、:\-\s]|step\s*\d+|第[一二三四五六七八九十\d]+步)/i;
const COMPARE_HINT_PATTERN = /\b(vs|versus)\b|对比|比较|区别|差异|before|after|前后/i;
const STEP_TITLE_PATTERN = /步骤|流程|方法|打法|路线|指南|方案|how to|framework|checklist/i;
const CTA_HINT_PATTERN = /立即|马上|现在|行动|关注|订阅|了解更多|开始|加入|领取|预约/i;
const HERO_HINT_PATTERN = /为什么|秘诀|核心|关键|趋势|方法|公式|指南|框架|玩法|模板/i;

const GENERIC_HERO_BADGE_PATTERN =
  /^(先抛问题|抛问题|提出问题|关键反转|反转|核心问题|关键问题|先给结论|给结论|抛结论|先讲结论|开场钩子|钩子|破题|收束|行动引导|行动建议|证据页|反差页|重点来了|继续往下看|往下看答案|看答案|call to action|cta|hook|verdict|signal|preview)$/i;

type SharedLayout =
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

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const sanitizeHeroBadge = (value: unknown): string | undefined => {
  if (!isNonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (!trimmed || GENERIC_HERO_BADGE_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed;
};

const GENERIC_CTA_PATTERN =
  /^(答案在下一页|往下看答案|继续往下看|继续看答案|下页见|下一页见|下一页告诉你|往下看|继续看|接着看|马上揭晓|马上告诉你|继续看下去|看下去|call to action|cta)$/i;

const sanitizeCtaText = (value: unknown): string | undefined => {
  if (!isNonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  if (!trimmed || GENERIC_CTA_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed;
};

const splitPoint = (point: string): { title: string; description?: string } => {
  const cleaned = point.trim().replace(STEP_HINT_PATTERN, '').trim();
  const parts = cleaned.split(/[：:]\s*/);
  if (parts.length > 1) {
    return {
      title: parts[0].trim(),
      description: parts.slice(1).join('：').trim(),
    };
  }

  const sentenceParts = cleaned.split(/[，,;；]\s*/);
  if (sentenceParts.length > 1) {
    return {
      title: sentenceParts[0].trim(),
      description: sentenceParts.slice(1).join('，').trim(),
    };
  }

  return { title: cleaned };
};

const extractNumericStat = (point: string) => {
  const match = point.match(NUMERIC_POINT_PATTERN);
  if (!match || match.index === undefined) {
    return null;
  }

  const rawValue = match[0].trim();
  const valueMatch = rawValue.match(/\d+(?:[.,]\d+)?/);
  if (!valueMatch) {
    return null;
  }

  const suffix = rawValue.slice(valueMatch[0].length).trim();
  const label = `${point.slice(0, match.index)} ${point.slice(match.index + rawValue.length)}`
    .replace(/[-:：,，;；]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    value: Number(valueMatch[0].replace(',', '.')),
    suffix: suffix || undefined,
    label: label || point.trim(),
  };
};

const toCompareData = (points: string[]) => {
  const left = splitPoint(points[0]);
  const right = splitPoint(points[1]);

  return {
    left: {
      label: 'Before',
      value: left.title,
      desc: left.description,
      title: left.title,
      points: left.description ? [left.description] : [],
    },
    right: {
      label: 'After',
      value: right.title,
      desc: right.description,
      title: right.title,
      points: right.description ? [right.description] : [],
    },
    centerLabel: 'VS',
    vsText: 'VS',
  };
};

const toStepData = (points: string[]) => ({
  steps: points.map((point) => {
    const step = splitPoint(point);
    return {
      title: step.title,
      description: step.description,
    };
  }),
});

const toStatsData = (points: string[]) => ({
  stats: points
    .map((point) => extractNumericStat(point))
    .filter((item): item is NonNullable<ReturnType<typeof extractNumericStat>> => item !== null),
});

const toHighlightData = (points: string[]) => ({
  highlights: points.map((point) => ({ text: point.trim() })),
  items: points.map((point) => point.trim()),
});

const toListData = (points: string[]) => ({
  items: points.map((point, index) => {
    const item = splitPoint(point);
    return {
      icon: String(index + 1).padStart(2, '0'),
      text: item.title,
      title: item.title,
      desc: item.description,
    };
  }),
});

const coerceLegacyLayout = (layout?: string): SharedLayout | undefined => {
  if (!layout) return undefined;

  switch (layout) {
    case 'cover':
    case 'title':
      return 'hero';
    case 'cards':
      return 'list';
    case 'progress':
      return 'chart';
    case 'hero':
    case 'default':
    case 'steps':
    case 'compare':
    case 'stats':
    case 'quote':
    case 'list':
    case 'chart':
    case 'timeline':
    case 'highlight':
    case 'cta':
      return layout;
    default:
      return undefined;
  }
};

const ensureChartData = (chart?: ChartData): { chart?: ChartData } | undefined => {
  if (!chart) return undefined;
  return { chart };
};

const getDirectData = (slide: ContentSlide, layout?: SharedLayout) => {
  const directSteps = slide.steps as StepItem[] | undefined;
  const directTimeline = slide.timeline as TimelineItem[] | undefined;
  const directHighlights = slide.highlights as HighlightWord[] | undefined;
  const directChart = slide.chart as ChartData | undefined;

  switch (layout) {
    case 'steps':
      return directSteps && directSteps.length > 0 ? { steps: directSteps } : undefined;
    case 'timeline':
      return directTimeline && directTimeline.length > 0 ? { timeline: directTimeline } : undefined;
    case 'highlight':
      return directHighlights && directHighlights.length > 0
        ? {
            highlights: directHighlights,
            items: directHighlights.map((item) => item.text),
          }
        : undefined;
    case 'chart':
      return ensureChartData(directChart);
    default:
      return undefined;
  }
};

const normalizeStructuredSlide = (
  rawSlide: ContentSlide,
  index: number,
  total: number
): ContentSlide => {
  const normalized = normalizeSlide(rawSlide);
  const currentLayout = coerceLegacyLayout(normalized.layout || normalized.type);

  const directLayout =
    currentLayout ||
    (Array.isArray(normalized.steps) && normalized.steps.length > 0
      ? 'steps'
      : Array.isArray(normalized.timeline) && normalized.timeline.length > 0
        ? 'timeline'
        : Array.isArray(normalized.highlights) && normalized.highlights.length > 0
          ? 'highlight'
          : normalized.chart
            ? 'chart'
            : undefined);

  if (directLayout) {
    const directData = getDirectData(normalized, directLayout);
    const mergedData = directData
      ? { ...(normalized.data || {}), ...directData }
      : normalized.data;
    const sanitizedData =
      directLayout === 'hero' && mergedData
        ? {
            ...mergedData,
            badge: sanitizeHeroBadge(mergedData.badge),
            cta: sanitizeCtaText(mergedData.cta),
            button: sanitizeCtaText(mergedData.button),
          }
        : directLayout === 'cta' && mergedData
          ? {
              ...mergedData,
              cta: sanitizeCtaText(mergedData.cta) || sanitizeCtaText(mergedData.button) || '立即开始',
              button: sanitizeCtaText(mergedData.button) || sanitizeCtaText(mergedData.cta) || '立即开始',
            }
        : mergedData;
    return {
      ...normalized,
      layout: directLayout,
      type: directLayout,
      data: sanitizedData,
    };
  }

  const points = Array.isArray(normalized.points)
    ? normalized.points.map((point) => String(point).trim()).filter(Boolean)
    : [];
  const text = [normalized.title, normalized.subtitle, normalized.narration]
    .filter(isNonEmptyString)
    .join(' ');

  let inferredLayout: SharedLayout = 'default';
  let data = normalized.data;

  if (index === 0 && total > 1 && points.length > 0 && points.length <= 3) {
    inferredLayout = 'hero';
    data = {
      ...(normalized.data || {}),
      badge: sanitizeHeroBadge(normalized.data?.badge),
    };
  } else if (points.length === 0) {
    if (isNonEmptyString(normalized.subtitle) && normalized.subtitle.length <= 88) {
      inferredLayout = /总结|记住|一句话|金句|结论|quote/i.test(text)
        ? 'quote'
        : index === total - 1 || CTA_HINT_PATTERN.test(text)
          ? 'cta'
          : index === 0 || HERO_HINT_PATTERN.test(text)
            ? 'hero'
            : 'default';
      if (inferredLayout === 'quote') {
        data = {
          quote: normalized.subtitle || normalized.title,
          author: normalized.title && normalized.subtitle ? normalized.title : undefined,
        };
      } else if (inferredLayout === 'cta') {
        data = { cta: sanitizeCtaText(normalized.data?.cta) || '立即开始' };
      }
    } else {
      inferredLayout = index === 0 ? 'hero' : 'default';
    }
  } else if (points.length === 2 && COMPARE_HINT_PATTERN.test(text)) {
    inferredLayout = 'compare';
    data = toCompareData(points);
  } else if (
    points.length >= 3 &&
    points.length <= 6 &&
    (STEP_TITLE_PATTERN.test(text) || points.some((point) => STEP_HINT_PATTERN.test(point)))
  ) {
    inferredLayout = 'steps';
    data = toStepData(points);
  } else if (
    points.length >= 2 &&
    points.length <= 4 &&
    points.filter((point) => NUMERIC_POINT_PATTERN.test(point)).length >= Math.max(2, points.length - 1)
  ) {
    inferredLayout = 'stats';
    data = toStatsData(points);
  } else if (points.length === 2) {
    inferredLayout = 'default';
  } else if (
    points.length >= 3 &&
    points.length <= 5 &&
    points.every((point) => point.length <= 16) &&
    (!isNonEmptyString(normalized.subtitle) || normalized.subtitle.length <= 36)
  ) {
    inferredLayout = 'highlight';
    data = toHighlightData(points);
  } else if (index === total - 1 && CTA_HINT_PATTERN.test(text)) {
    inferredLayout = 'cta';
    data = { cta: sanitizeCtaText(normalized.data?.cta) || '立即开始' };
  } else if (index === 0 && HERO_HINT_PATTERN.test(text)) {
    inferredLayout = 'hero';
  } else {
    inferredLayout = 'list';
    data = toListData(points);
  }

  return {
    ...normalized,
    layout: inferredLayout,
    type: inferredLayout,
    data:
      inferredLayout === 'hero' && data
        ? {
            ...data,
            badge: sanitizeHeroBadge(data.badge),
            cta: sanitizeCtaText(data.cta),
            button: sanitizeCtaText(data.button),
          }
        : inferredLayout === 'cta' && data
          ? {
              ...data,
              cta: sanitizeCtaText(data.cta) || sanitizeCtaText(data.button) || '立即开始',
              button: sanitizeCtaText(data.button) || sanitizeCtaText(data.cta) || '立即开始',
            }
        : data,
  };
};

export const autoStructureSlide = (
  rawSlide: ContentSlide,
  index = 0,
  total = 1
): ContentSlide => {
  return normalizeStructuredSlide(rawSlide, index, total);
};

export const autoStructureSlides = (
  slides: ContentSlide[]
): ContentSlide[] => {
  return slides.map((slide, index) => autoStructureSlide(slide, index, slides.length));
};

export const prepareSlidesForRender = (
  slides: ContentSlide[]
): ContentSlide[] => {
  const structuredSlides = autoStructureSlides(slides);
  const hasMissingTimings = structuredSlides.some(
    (slide) => !Array.isArray(slide.elementTimings) || slide.elementTimings.length === 0
  );

  if (!hasMissingTimings) {
    return structuredSlides;
  }

  const timingsMap = calculateAllElementTimings(structuredSlides);
  return structuredSlides.map((slide, index) => ({
    ...slide,
    elementTimings:
      slide.elementTimings && slide.elementTimings.length > 0
        ? slide.elementTimings
        : timingsMap.get(index),
  }));
};
