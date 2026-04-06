import { SharedVideo } from '../../renderers/SharedVideo';
import { getSlideDurationFrames } from '../../hooks/useContentJson';
import { AudioSlideData } from '../types';

export interface DynamicSlideShowProps {
  slides: AudioSlideData[];
  defaultSlideDuration?: number;
  soundtrackPath?: string;
}

export const DynamicSlideShow: React.FC<DynamicSlideShowProps> = ({
  slides,
  defaultSlideDuration = 150,
  soundtrackPath,
}) => {
  return (
    <SharedVideo
      slides={slides}
      template="DynamicSlideShow"
      soundtrackPath={soundtrackPath}
      defaultSlideDuration={defaultSlideDuration}
    />
  );
};

export function calculateTotalFrames(
  slides: AudioSlideData[],
  fps: number,
  defaultSlideDuration: number = 150
): number {
  return slides.reduce((total, slide) => {
    return total + getSlideDurationFrames(slide, fps, defaultSlideDuration);
  }, 0);
}
