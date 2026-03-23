export interface TimelineFields {
  audioDuration?: number;
  durationInFrames?: number;
  audioStart?: number;
  audioEnd?: number;
}

export interface AudioSlideData extends TimelineFields {
  id: string;
  title: string;
  subtitle?: string;
  points?: string[];
  narration?: string;
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
  type?:
    | 'default'
    | 'steps'
    | 'timeline'
    | 'chart'
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
