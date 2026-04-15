import { create } from 'zustand';

export type CliProgress =
  | {
      phase: 'audio:progress';
      step: string;
      slideIndex?: number;
      totalSlides?: number;
      mode?: string;
    }
  | { phase: 'bundle:start' }
  | { phase: 'bundle:done'; durationMs: number }
  | { phase: 'browser:detecting' }
  | { phase: 'browser:testing'; executable: string }
  | { phase: 'browser:downloading' }
  | { phase: 'browser:ready'; source: 'local' | 'remotion'; executable?: string }
  | { phase: 'render:init'; totalFrames: number; fps: number; slides: number }
  | { phase: 'render:start'; totalFrames: number; startedAt: number }
  | {
      phase: 'render:progress';
      renderedFrames: number;
      encodedFrames: number;
      totalFrames: number;
      progress: number;
      elapsedMs: number;
    }
  | { phase: 'render:done'; durationMs: number; outputPath: string };

interface RenderState {
  rendering: boolean;
  previewing: boolean;
  stageLabel: string;
  cliProgress: CliProgress | null;
  setRendering: (v: boolean) => void;
  setPreviewing: (v: boolean) => void;
  setStageLabel: (s: string) => void;
  setCliProgress: (p: CliProgress | null) => void;
  reset: () => void;
}

export const useRenderStore = create<RenderState>((set) => ({
  rendering: false,
  previewing: false,
  stageLabel: '',
  cliProgress: null,
  setRendering: (v) => set({ rendering: v }),
  setPreviewing: (v) => set({ previewing: v }),
  setStageLabel: (s) => set({ stageLabel: s }),
  setCliProgress: (p) => set({ cliProgress: p }),
  reset: () =>
    set({ rendering: false, previewing: false, stageLabel: '', cliProgress: null }),
}));
