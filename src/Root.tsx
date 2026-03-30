import { Composition, continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';
import { AIShow } from './AIShow';
import { FrostedShow } from './FrostedShow';
import { GlassShow } from './GlassShow';
import { KnowledgeShow } from './KnowledgeShow';
import { LiquidBriefShow } from './LiquidBriefShow';
import { LiquidShow } from './LiquidShow';
import { LuxeShow } from './LuxeShow';
import { NeonShow } from './NeonShow';
import { NeuShow } from './NeuShow';
import { RichShow } from './RichShow';
import { SlideShow } from './SlideShow';
import { SlideShowWide } from './SlideShowWide';
import { TechShow } from './TechShow';
import {
  DynamicSlideShow,
  DynamicSlideShowProps,
  calculateTotalFrames,
} from './templates/DynamicSlideShow';
import { AudioSlideData, ContentFile, ContentSlide } from './templates/types';
import { GeneratedTemplateRenderer } from './templates/GeneratedTemplateRenderer';
import { getTemplateDimensions } from './templates/templateSpecs';
import { getTemplateContentPath, toStaticContentPath } from './project-content';

interface LoadedJsonData {
  slides: ContentSlide[];
  template: string;
  soundtrackPath?: string;
}

interface CurrentProjectReference {
  template?: string;
  contentPath?: string;
}

interface GeneratedVideoProps {
  slides?: AudioSlideData[];
  template?: string;
  soundtrackPath?: string;
  defaultSlideDuration?: number;
  contentPath?: string;
}

const DEFAULT_TEMPLATE = 'DynamicSlideShow';
const DEFAULT_DURATION = 150;
const FALLBACK_COMPOSITION_DURATION = 5400;

const defaultSlides: AudioSlideData[] = [
  {
    id: 'slide-0',
    title: 'AI video workflow',
    subtitle: 'Script to final video',
    points: ['Generate slides', 'Create one narration track', 'Preview and export'],
    durationInFrames: DEFAULT_DURATION,
  },
];

const getQueryParam = (name: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const value = new URLSearchParams(window.location.search).get(name);
  return value || undefined;
};

const getTemplateProjectContentPath = (template: string): string => {
  return getTemplateContentPath(template);
};

const loadCurrentProjectReference = async (): Promise<CurrentProjectReference | null> => {
  try {
    const staticBase =
      (window as { remotion_staticBase?: string }).remotion_staticBase || '';
    const response = await fetch(`${staticBase}/projects/current-project.json`);
    if (!response.ok) {
      throw new Error(`Failed to load current project: ${response.status}`);
    }

    return (await response.json()) as CurrentProjectReference;
  } catch {
    return null;
  }
};

const readCurrentProjectReference = async (): Promise<CurrentProjectReference | null> => {
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'public', 'projects', 'current-project.json');
    const fileContent = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as CurrentProjectReference;
  } catch {
    return null;
  }
};

const toAudioSlides = (content: ContentFile): AudioSlideData[] => {
  return content.slides.map((slide, index) => ({
    id: `slide-${index}`,
    title: slide.title || `Slide ${index + 1}`,
    subtitle: slide.subtitle,
    points: slide.points,
    narration: slide.narration,
    audioDuration: slide.audioDuration,
    durationInFrames: slide.durationInFrames,
    audioStart: slide.audioStart,
    audioEnd: slide.audioEnd,
  }));
};

const coerceToAudioSlides = (slides: ContentSlide[]): AudioSlideData[] => {
  return slides.map((slide, index) => ({
    id: `slide-${index}`,
    title: slide.title || `Slide ${index + 1}`,
    subtitle: slide.subtitle,
    points: slide.points,
    narration: slide.narration,
    audioDuration: slide.audioDuration,
    durationInFrames: slide.durationInFrames,
    audioStart: slide.audioStart,
    audioEnd: slide.audioEnd,
    audioPath: slide.audioPath,
  }));
};

const loadSlidesFromJson = async (
  contentPath?: string,
  template?: string
): Promise<LoadedJsonData> => {
  try {
    const staticBase =
      (window as { remotion_staticBase?: string }).remotion_staticBase || '';
    const currentProject = !contentPath ? await loadCurrentProjectReference() : null;
    const requestedContentPath = toStaticContentPath(
      contentPath ||
        currentProject?.contentPath ||
        getTemplateProjectContentPath(
          currentProject?.template || template || DEFAULT_TEMPLATE
        )
    );
    const response = await fetch(`${staticBase}/${requestedContentPath}`);
    if (!response.ok) {
      throw new Error(`Failed to load content JSON: ${response.status}`);
    }

    const data: ContentFile = await response.json();
    return {
      slides: data.slides,
      template: data.meta.template || DEFAULT_TEMPLATE,
      soundtrackPath: data.meta.soundtrackPath || data.meta.soundtrack_path,
    };
  } catch {
    return {
      slides: defaultSlides as unknown as ContentSlide[],
      template: DEFAULT_TEMPLATE,
    };
  }
};

const loadTotalFramesFromJson = async (
  contentPath?: string,
  template?: string
): Promise<number> => {
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const currentProject = !contentPath ? await readCurrentProjectReference() : null;
    const requestedContentPath = toStaticContentPath(
      contentPath ||
        currentProject?.contentPath ||
        getTemplateProjectContentPath(
          currentProject?.template || template || DEFAULT_TEMPLATE
        )
    );
    const filePath = join(process.cwd(), 'public', requestedContentPath);
    const fileContent = await readFile(filePath, 'utf-8');
    const data: ContentFile = JSON.parse(fileContent);
    return calculateTotalFrames(toAudioSlides(data), 30, DEFAULT_DURATION);
  } catch {
    return FALLBACK_COMPOSITION_DURATION;
  }
};

const resolveGeneratedVideoData = async (
  props: GeneratedVideoProps
): Promise<LoadedJsonData> => {
  if (Array.isArray(props.slides) && props.slides.length > 0) {
    return {
      slides: props.slides as unknown as ContentSlide[],
      template: props.template || DEFAULT_TEMPLATE,
      soundtrackPath: props.soundtrackPath,
    };
  }

  const queryTemplate = getQueryParam('template');
  const queryContentPath = getQueryParam('contentPath');

  return loadSlidesFromJson(
    props.contentPath || queryContentPath,
    props.template || queryTemplate
  );
};

const DynamicLoader: React.FC<GeneratedVideoProps> = ({
  slides,
  template,
  soundtrackPath,
  defaultSlideDuration = DEFAULT_DURATION,
  contentPath,
}) => {
  const [data, setData] = useState<LoadedJsonData | null>(null);
  const [handle] = useState(() => delayRender('load video json'));

  useEffect(() => {
    resolveGeneratedVideoData({
      slides,
      template,
      soundtrackPath,
      defaultSlideDuration,
      contentPath,
    }).then((loadedData) => {
      setData(loadedData);
      continueRender(handle);
    });
  }, [contentPath, defaultSlideDuration, handle, slides, soundtrackPath, template]);

  if (!data) {
    return null;
  }

  if (data.template === 'DynamicSlideShow' || data.template === 'GeneratedVideo') {
    return (
      <DynamicSlideShow
        slides={coerceToAudioSlides(data.slides)}
        defaultSlideDuration={defaultSlideDuration}
        soundtrackPath={data.soundtrackPath}
      />
    );
  }

  return (
    <GeneratedTemplateRenderer
      template={data.template}
      slides={data.slides as unknown as Array<Record<string, unknown>>}
      soundtrackPath={data.soundtrackPath}
    />
  );
};

const DynamicSlideShowComposition: React.FC<Record<string, unknown>> = (props) => {
  return <DynamicSlideShow {...(props as unknown as DynamicSlideShowProps)} />;
};

const demoSlides: AudioSlideData[] = [
  {
    id: '1',
    title: 'Dynamic timeline',
    subtitle: 'Frames come from narration',
    points: ['Single soundtrack', 'Auto scene lengths', 'Flexible preview'],
    durationInFrames: 150,
  },
  {
    id: '2',
    title: 'Export ready',
    subtitle: 'Use one composition',
    points: ['Preview GeneratedVideo', 'Render GeneratedVideo', 'Keep template style'],
    durationInFrames: 150,
  },
];

const getTemplateMetadata = (template: string) => {
  return async () => ({
    durationInFrames: await loadTotalFramesFromJson(
      getTemplateProjectContentPath(template),
      template
    ),
  });
};

const getGeneratedCompositionDimensions = (template?: string) => {
  return getTemplateDimensions(template);
};

export const RemotionRoot: React.FC = () => {
  const slideShowWideDimensions = getTemplateDimensions('SlideShowWide');

  return (
    <>
      <Composition id="SlideShow" component={SlideShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('SlideShow')} />
      <Composition
        id="SlideShowWide"
        component={SlideShowWide}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={slideShowWideDimensions.width}
        height={slideShowWideDimensions.height}
        calculateMetadata={getTemplateMetadata('SlideShowWide')}
      />
      <Composition id="GlassShow" component={GlassShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('GlassShow')} />
      <Composition id="NeuShow" component={NeuShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('NeuShow')} />
      <Composition id="RichShow" component={RichShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('RichShow')} />
      <Composition id="TechShow" component={TechShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('TechShow')} />
      <Composition id="AIShow" component={AIShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('AIShow')} />
      <Composition id="NeonShow" component={NeonShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('NeonShow')} />
      <Composition id="LuxeShow" component={LuxeShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('LuxeShow')} />
      <Composition id="LiquidShow" component={LiquidShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('LiquidShow')} />
      <Composition id="LiquidBriefShow" component={LiquidBriefShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('LiquidBriefShow')} />
      <Composition id="FrostedShow" component={FrostedShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('FrostedShow')} />
      <Composition id="KnowledgeShow" component={KnowledgeShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} calculateMetadata={getTemplateMetadata('KnowledgeShow')} />
      <Composition
        id="GeneratedVideo"
        component={DynamicLoader}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          const typedProps = props as GeneratedVideoProps;
          const defaultSlideDuration =
            typedProps.defaultSlideDuration ?? DEFAULT_DURATION;
          const providedSlides = Array.isArray(typedProps.slides)
            ? typedProps.slides
            : [];
          const dimensions = getGeneratedCompositionDimensions(typedProps.template);

          return {
            durationInFrames:
              providedSlides.length > 0
                ? calculateTotalFrames(providedSlides, 30, defaultSlideDuration)
                : await loadTotalFramesFromJson(
                    typedProps.contentPath,
                    typedProps.template
                  ),
            width: dimensions.width,
            height: dimensions.height,
            props: {
              ...typedProps,
              defaultSlideDuration,
            },
          };
        }}
      />
      <Composition
        id="DynamicSlideShow"
        component={DynamicSlideShowComposition}
        durationInFrames={calculateTotalFrames(demoSlides, 30, DEFAULT_DURATION)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          slides: demoSlides,
          defaultSlideDuration: DEFAULT_DURATION,
        }}
        calculateMetadata={({ props }) => {
          const typedProps = props as {
            slides: AudioSlideData[];
            defaultSlideDuration: number;
            soundtrackPath?: string;
          };

          return {
            durationInFrames: calculateTotalFrames(
              typedProps.slides,
              30,
              typedProps.defaultSlideDuration
            ),
            props: typedProps,
          };
        }}
      />
    </>
  );
};
