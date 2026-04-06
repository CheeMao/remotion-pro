export interface TimelineFields {
  audioDuration?: number;
  durationInFrames?: number;
  audioStart?: number;
  audioEnd?: number;
  audioPath?: string;
}

/**
 * 元素级时间戳定义
 * 用于精准控制每个动画元素的出现时间
 */
export interface ElementTiming {
  /** 元素ID */
  id: string;
  /** 元素类型 */
  type: 'title' | 'subtitle' | 'stat' | 'step' | 'item' | 'highlight' | 'quote' | 'chart' | 'compare-left' | 'compare-right' | 'timeline-item' | 'custom';
  /** 触发文本（cue） */
  cue: string;
  /** 在slide中的索引 */
  index?: number;
  /** 音频开始时间（秒） */
  audioStart?: number;
  /** 音频结束时间（秒） */
  audioEnd?: number;
  /** 入场动画帧数 */
  entryDuration?: number;
  /** 入场动画延迟（相对audioStart） */
  entryDelay?: number;
}

/**
 * 扩展的Slide数据，支持元素级时间控制
 */
export interface EnhancedSlideData extends TimelineFields {
  id: string;
  title: string;
  subtitle?: string;
  points?: string[];
  narration?: string;
  type?: string;
  data?: Record<string, unknown>;
  /** 元素级时间戳配置 */
  elementTimings?: ElementTiming[];
  /** 语速配置（字/秒） */
  speechRate?: number;
}

export interface AudioSlideData extends TimelineFields {
  id: string;
  title: string;
  subtitle?: string;
  points?: string[];
  narration?: string;
  type?: string;
  data?: Record<string, unknown>;
  elementTimings?: ElementTiming[];
}

export interface VideoConfig {
  template?: string;
  slides: AudioSlideData[];
  fps: number;
  width: number;
  height: number;
  defaultDurationPerSlide: number;
  soundtrackPath?: string;
  soundtrackDuration?: number;
}

export interface ContentMeta {
  title: string;
  template: string;
  voiceId?: string;
  voice_id?: string;
  fullNarration?: string;
  full_narration?: string;
  soundtrackPath?: string;
  soundtrack_path?: string;
  soundtrackDuration?: number;
  soundtrack_duration?: number;
}

export interface ContentSlide extends TimelineFields {
  title?: string;
  subtitle?: string;
  points?: string[];
  narration?: string;
  segmentIds?: string[];
  layout?: string;
  elementTimings?: ElementTiming[];
  type?:
    | 'default'
    | 'steps'
    | 'timeline'
    | 'chart'
    | 'cta'
    | 'highlight'
    | 'list'
    | 'compare'
    | 'stats'
    | 'quote'
    | 'hero';
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

// 知识类元素类型
export interface HighlightWord {
  text: string;
  color?: string;
  emphasis?: 'bounce' | 'glow' | 'underline' | 'scale';
}

export interface StepItem {
  title: string;
  description?: string;
  icon?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description?: string;
}

export interface ChartData {
  type: 'bar' | 'progress' | 'pie';
  title?: string;
  values: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
}

// 扩展的知识类幻灯片
export interface KnowledgeSlide extends ContentSlide {
  highlights?: HighlightWord[];
  steps?: StepItem[];
  timeline?: TimelineItem[];
  chart?: ChartData;
}

export interface ContentFile {
  meta: ContentMeta;
  slides: ContentSlide[];
}
