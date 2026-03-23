import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { TimelineFields } from '../templates/types';
import { toStaticContentPath } from '../project-content';

interface ContentMetaData {
  title?: string;
  template?: string;
  voice_id?: string;
  fullNarration?: string;
  full_narration?: string;
  soundtrackPath?: string;
  soundtrack_path?: string;
  soundtrackDuration?: number;
  soundtrack_duration?: number;
}

interface ContentJsonResponse<TSlide> {
  meta?: ContentMetaData;
  slides?: TSlide[];
}

export interface LoadedContent<TSlide> {
  meta?: ContentMetaData;
  slides: TSlide[];
  soundtrackPath?: string;
  soundtrackDuration?: number;
}

// 检查 slide 是否符合特定模板的格式要求
type SlideFormatValidator<TSlide> = (slide: unknown) => slide is TSlide;

export function useContentJson<TSlide>(
  defaultSlides: TSlide[],
  options?: {
    validateSlide?: SlideFormatValidator<TSlide>;
    expectedTemplate?: string;
    contentPath?: string;
  }
): LoadedContent<TSlide> {
  const [content, setContent] = useState<LoadedContent<TSlide>>({
    slides: defaultSlides,
  });
  const [handle] = useState(() => delayRender('load content json'));

  useEffect(() => {
    const staticBase = (window as { remotion_staticBase?: string }).remotion_staticBase || '';
    const requestedPath = options?.contentPath
      ? toStaticContentPath(options.contentPath)
      : 'content/slides.json';
    const url = `${staticBase}/${requestedPath}?t=${Date.now()}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content JSON: ${response.status}`);
        }
        return response.json();
      })
      .then((data: ContentJsonResponse<TSlide>) => {
        let slides: TSlide[];
        const rawSlides = data.slides;

        // 检查模板是否匹配
        const templateMatch = !options?.expectedTemplate ||
          data.meta?.template === options.expectedTemplate;

        // 检查数据格式是否有效
        const hasValidSlides = Array.isArray(rawSlides) &&
          rawSlides.length > 0 &&
          (!options?.validateSlide || rawSlides.every(options.validateSlide));

        if (templateMatch && hasValidSlides) {
          slides = rawSlides;
        } else {
          // 格式不匹配或模板不匹配，使用默认数据
          slides = defaultSlides;
        }

        setContent({
          meta: data.meta,
          slides,
          soundtrackPath: data.meta?.soundtrackPath || data.meta?.soundtrack_path,
          soundtrackDuration:
            data.meta?.soundtrackDuration || data.meta?.soundtrack_duration,
        });
        continueRender(handle);
      })
      .catch(() => {
        continueRender(handle);
      });
  }, [defaultSlides, handle, options]);

  return content;
}

export const getSlideDurationFrames = (
  slide: Partial<TimelineFields>,
  fps: number,
  defaultSlideDuration: number
): number => {
  if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
    return slide.durationInFrames;
  }

  if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
    return Math.max(1, Math.ceil(slide.audioDuration * fps));
  }

  return defaultSlideDuration;
};

export const getSlideTiming = <TSlide>(
  slides: TSlide[],
  index: number,
  fps: number,
  defaultSlideDuration: number
): { from: number; duration: number } => {
  let from = 0;

  for (let i = 0; i < index; i++) {
    from += getSlideDurationFrames(
      slides[i] as Partial<TimelineFields>,
      fps,
      defaultSlideDuration
    );
  }

  return {
    from,
    duration: getSlideDurationFrames(
      slides[index] as Partial<TimelineFields>,
      fps,
      defaultSlideDuration
    ),
  };
};

export const getStaticAssetPath = (path?: string): string | undefined => {
  if (!path) {
    return undefined;
  }

  return path.replace(/^public\//, '');
};
