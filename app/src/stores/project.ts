import { create } from 'zustand';

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  points: string[];
  narration: string;
}

export interface Project {
  id: string;
  title: string;
  rawText: string;
  slides: Slide[];
  template: string;
  voiceId: string;
}

interface ProjectState {
  project: Project | null;
  isGenerating: boolean;
  isRendering: boolean;
  progress: number;

  setProject: (project: Project | null) => void;
  setRawText: (text: string) => void;
  setSlides: (slides: Slide[]) => void;
  updateSlide: (id: string, data: Partial<Slide>) => void;
  setTemplate: (template: string) => void;
  setVoiceId: (voiceId: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setRendering: (isRendering: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  isGenerating: false,
  isRendering: false,
  progress: 0,

  setProject: (project) => set({ project }),
  setRawText: (text) => set((state) => ({
    project: state.project ? { ...state.project, rawText: text } : null
  })),
  setSlides: (slides) => set((state) => ({
    project: state.project ? { ...state.project, slides } : null
  })),
  updateSlide: (id, data) => set((state) => {
    if (!state.project) return state;
    const slides = state.project.slides.map((slide) =>
      slide.id === id ? { ...slide, ...data } : slide
    );
    return { project: { ...state.project, slides } };
  }),
  setTemplate: (template) => set((state) => ({
    project: state.project ? { ...state.project, template } : null
  })),
  setVoiceId: (voiceId) => set((state) => ({
    project: state.project ? { ...state.project, voiceId } : null
  })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setRendering: (isRendering) => set({ isRendering }),
  setProgress: (progress) => set({ progress }),
}));