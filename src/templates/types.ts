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
  type?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ContentFile {
  meta: ContentMeta;
  slides: ContentSlide[];
}
