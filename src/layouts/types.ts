import type {
  ElementTiming,
  SlideMediaAsset,
  SlideMotionConfig,
} from '../templates/types';
import type { ThemeDefinition } from '../themes/types';

export interface SharedLayoutSlide {
  id?: string;
  title?: string;
  subtitle?: string;
  points?: string[];
  type?: string;
  layout?: string;
  data?: Record<string, unknown>;
  media?: SlideMediaAsset[];
  motionPreset?: string;
  motion?: SlideMotionConfig;
  audioStart?: number;
  elementTimings?: ElementTiming[];
}

export interface SharedLayoutProps {
  slide: SharedLayoutSlide;
  theme: ThemeDefinition;
  frame: number;
  fps: number;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}
