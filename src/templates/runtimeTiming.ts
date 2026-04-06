import { spring } from 'remotion';
import type { ElementTiming } from './types';

interface ProgressOptions {
  frame: number;
  fps: number;
  elementTimings?: ElementTiming[];
  slideAudioStart?: number;
  id: string;
  fallbackStart: number;
  damping?: number;
  stiffness?: number;
}

export const getTimingStartFrame = (
  elementTimings: ElementTiming[] | undefined,
  slideAudioStart: number | undefined,
  id: string,
  fps: number,
): number | undefined => {
  if (!elementTimings || typeof slideAudioStart !== 'number') {
    return undefined;
  }

  const timing = elementTimings.find((item) => item.id === id);
  if (!timing || typeof timing.audioStart !== 'number') {
    return undefined;
  }

  const delay = typeof timing.entryDelay === 'number' ? timing.entryDelay : 0;
  return Math.max(0, (timing.audioStart - slideAudioStart + delay) * fps);
};

export const getElementProgress = ({
  frame,
  fps,
  elementTimings,
  slideAudioStart,
  id,
  fallbackStart,
  damping = 14,
  stiffness = 100,
}: ProgressOptions): number => {
  const resolvedStart =
    getTimingStartFrame(elementTimings, slideAudioStart, id, fps) ?? fallbackStart;

  return spring({
    frame: frame - resolvedStart,
    fps,
    config: { damping, stiffness },
  });
};
