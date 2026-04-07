// 横屏模板共享数据规整器
// 把统一 schema 的 slide.data 转成模板内部使用的强类型数据

export type ListItem = { title: string; desc?: string };
export type StatItem = {
  label: string;
  value: string;
  rawValue: number;
  suffix: string;
  note?: string;
};
export type ChartBar = { label: string; value: number; color?: string };
export type CompareSide = { label: string; value: string; desc?: string };
export type TimelineEntry = { year: string; title: string; desc?: string };
export type StepEntry = { title: string; desc?: string };

type GenericRecord = Record<string, unknown>;

export const splitPoint = (point: string): ListItem => {
  const parts = point
    .split(/[:：-]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length <= 1
    ? { title: point.trim() }
    : { title: parts[0], desc: parts.slice(1).join(' - ') };
};

export const toList = (points?: string[], data?: GenericRecord): ListItem[] => {
  if (Array.isArray(data?.items)) {
    const result: ListItem[] = [];
    (data.items as unknown[]).forEach((item) => {
      if (typeof item === 'string') {
        result.push(splitPoint(item));
        return;
      }
      if (!item || typeof item !== 'object') return;
      const r = item as GenericRecord;
      const title =
        typeof r.text === 'string'
          ? r.text
          : typeof r.title === 'string'
            ? r.title
            : '';
      if (!title) return;
      result.push({
        title,
        desc:
          typeof r.desc === 'string'
            ? r.desc
            : typeof r.description === 'string'
              ? r.description
              : undefined,
      });
    });
    return result;
  }
  return (points || []).map(splitPoint);
};

export const toStats = (points?: string[], data?: GenericRecord): StatItem[] => {
  if (Array.isArray(data?.stats)) {
    const result: StatItem[] = [];
    (data.stats as unknown[]).forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const r = item as GenericRecord;
      const rawValue =
        typeof r.value === 'number'
          ? r.value
          : typeof r.value === 'string'
            ? Number((r.value as string).replace(/[^\d.-]/g, ''))
            : 0;
      const suffix = typeof r.suffix === 'string' ? r.suffix : '';
      result.push({
        label:
          typeof r.label === 'string'
            ? r.label
            : typeof r.title === 'string'
              ? r.title
              : 'Metric',
        value: `${r.value ?? '0'}${suffix}`,
        rawValue: Number.isFinite(rawValue) ? rawValue : 0,
        suffix,
        note: typeof r.note === 'string' ? r.note : undefined,
      });
    });
    return result;
  }
  return (points || []).map((point, i) => {
    const parsed = splitPoint(point);
    const m = (parsed.desc || parsed.title || '').match(/-?\d+(?:\.\d+)?/);
    const num = m ? Number(m[0]) : 0;
    return {
      label: parsed.title || `Metric ${i + 1}`,
      value: parsed.desc || parsed.title,
      rawValue: num,
      suffix: '',
    };
  });
};

export const toChart = (points?: string[], data?: GenericRecord): ChartBar[] => {
  if (Array.isArray(data?.bars)) {
    const result: ChartBar[] = [];
    (data.bars as unknown[]).forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const r = item as GenericRecord;
      const raw = r.percent ?? r.value;
      const value = typeof raw === 'number' ? raw : Number(raw || 0);
      if (typeof r.label !== 'string' || Number.isNaN(value)) return;
      const bar: ChartBar = { label: r.label, value };
      if (typeof r.color === 'string') bar.color = r.color;
      result.push(bar);
    });
    return result;
  }
  return (points || []).map((point, i) => {
    const parsed = splitPoint(point);
    return {
      label: parsed.title || `Bar ${i + 1}`,
      value: Number((parsed.desc || '0').replace(/[^\d.-]/g, '')) || 0,
    };
  });
};

export const toCompare = (
  points?: string[],
  data?: GenericRecord,
): { left: CompareSide; right: CompareSide } => {
  const left =
    data?.left && typeof data.left === 'object'
      ? (data.left as GenericRecord)
      : undefined;
  const right =
    data?.right && typeof data.right === 'object'
      ? (data.right as GenericRecord)
      : undefined;
  if (left && right) {
    return {
      left: {
        label: typeof left.label === 'string' ? left.label : 'Before',
        value:
          typeof left.value === 'string'
            ? left.value
            : typeof left.title === 'string'
              ? left.title
              : '',
        desc: typeof left.desc === 'string' ? left.desc : undefined,
      },
      right: {
        label: typeof right.label === 'string' ? right.label : 'After',
        value:
          typeof right.value === 'string'
            ? right.value
            : typeof right.title === 'string'
              ? right.title
              : '',
        desc: typeof right.desc === 'string' ? right.desc : undefined,
      },
    };
  }
  const [l, r] = points || [];
  const lp = splitPoint(l || 'Before');
  const rp = splitPoint(r || 'After');
  return {
    left: { label: lp.title, value: lp.desc || lp.title },
    right: { label: rp.title, value: rp.desc || rp.title },
  };
};

export const toTimeline = (
  points?: string[],
  data?: GenericRecord,
): TimelineEntry[] => {
  if (Array.isArray(data?.timeline)) {
    const result: TimelineEntry[] = [];
    (data.timeline as unknown[]).forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const r = item as GenericRecord;
      if (typeof r.title !== 'string') return;
      result.push({
        year: typeof r.year === 'string' ? r.year : '',
        title: r.title,
        desc:
          typeof r.description === 'string'
            ? r.description
            : typeof r.desc === 'string'
              ? r.desc
              : undefined,
      });
    });
    return result;
  }
  return (points || []).map((point, i) => {
    const parsed = splitPoint(point);
    return {
      year: String(i + 1).padStart(2, '0'),
      title: parsed.title,
      desc: parsed.desc,
    };
  });
};

export const toSteps = (
  points?: string[],
  data?: GenericRecord,
): StepEntry[] => {
  if (Array.isArray(data?.steps)) {
    const result: StepEntry[] = [];
    (data.steps as unknown[]).forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const r = item as GenericRecord;
      const t = typeof r.title === 'string' ? r.title : '';
      if (!t) return;
      result.push({
        title: t,
        desc:
          typeof r.description === 'string'
            ? r.description
            : typeof r.desc === 'string'
              ? r.desc
              : undefined,
      });
    });
    return result;
  }
  return (points || []).map(splitPoint);
};

export const toHighlights = (points?: string[], data?: GenericRecord): string[] => {
  if (Array.isArray(data?.highlights)) {
    return (data.highlights as unknown[])
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const r = item as GenericRecord;
          if (typeof r.text === 'string') return r.text;
        }
        return null;
      })
      .filter((x): x is string => x !== null);
  }
  if (Array.isArray(data?.items)) {
    return (data.items as unknown[])
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const r = item as GenericRecord;
          if (typeof r.text === 'string') return r.text;
          if (typeof r.title === 'string') return r.title;
        }
        return null;
      })
      .filter((x): x is string => x !== null);
  }
  return (points || []).filter((p) => p.trim().length > 0);
};

export const getQuote = (
  data?: GenericRecord,
  fallbackTitle?: string,
  fallbackSubtitle?: string,
): { quote: string; author?: string } => {
  const quote =
    typeof data?.quote === 'string'
      ? data.quote
      : fallbackSubtitle || fallbackTitle || '';
  const author =
    typeof data?.author === 'string'
      ? data.author
      : fallbackTitle && fallbackSubtitle
        ? fallbackTitle
        : undefined;
  return { quote, author };
};

export const getCta = (data?: GenericRecord): string => {
  if (typeof data?.cta === 'string') return data.cta;
  if (typeof data?.button === 'string') return data.button;
  return '';
};

export type SlideType =
  | 'hero'
  | 'default'
  | 'list'
  | 'steps'
  | 'compare'
  | 'stats'
  | 'chart'
  | 'timeline'
  | 'highlight'
  | 'quote'
  | 'cta';
