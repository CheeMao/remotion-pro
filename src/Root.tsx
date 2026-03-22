import { Composition, continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';
import { AIShow } from './AIShow';
import { FrostedShow } from './FrostedShow';
import { GlassShow } from './GlassShow';
import { LiquidShow } from './LiquidShow';
import { LuxeShow } from './LuxeShow';
import { NeonShow } from './NeonShow';
import { NeuShow } from './NeuShow';
import { RichShow } from './RichShow';
import { SlideShow } from './SlideShow';
import { TechShow } from './TechShow';
import {
  DynamicSlideShow,
  DynamicSlideShowProps,
  calculateTotalFrames,
} from './templates/DynamicSlideShow';
import { AudioSlideData, ContentFile } from './templates/types';

interface LoadedJsonData {
  slides: AudioSlideData[];
  template: string;
  soundtrackPath?: string;
}

interface GeneratedVideoProps {
  slides?: AudioSlideData[];
  template?: string;
  soundtrackPath?: string;
  defaultSlideDuration?: number;
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

const TEMPLATE_MAP = {
  SlideShow,
  GlassShow,
  NeuShow,
  RichShow,
  TechShow,
  AIShow,
  NeonShow,
  LuxeShow,
  LiquidShow,
  FrostedShow,
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

const loadSlidesFromJson = async (): Promise<LoadedJsonData> => {
  try {
    const staticBase =
      (window as { remotion_staticBase?: string }).remotion_staticBase || '';
    const response = await fetch(`${staticBase}/content/slides.json`);
    if (!response.ok) {
      throw new Error(`Failed to load slides.json: ${response.status}`);
    }

    const data: ContentFile = await response.json();
    return {
      slides: toAudioSlides(data),
      template: data.meta.template || DEFAULT_TEMPLATE,
      soundtrackPath: data.meta.soundtrackPath || data.meta.soundtrack_path,
    };
  } catch {
    return {
      slides: defaultSlides,
      template: DEFAULT_TEMPLATE,
    };
  }
};

const loadTotalFramesFromJson = async (): Promise<number> => {
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'public', 'content', 'slides.json');
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
      slides: props.slides,
      template: props.template || DEFAULT_TEMPLATE,
      soundtrackPath: props.soundtrackPath,
    };
  }

  return loadSlidesFromJson();
};

const DynamicLoader: React.FC<GeneratedVideoProps> = ({
  slides,
  template,
  soundtrackPath,
  defaultSlideDuration = DEFAULT_DURATION,
}) => {
  const [data, setData] = useState<LoadedJsonData | null>(null);
  const [handle] = useState(() => delayRender('load video json'));

  useEffect(() => {
    resolveGeneratedVideoData({
      slides,
      template,
      soundtrackPath,
      defaultSlideDuration,
    }).then((loadedData) => {
      setData(loadedData);
      continueRender(handle);
    });
  }, [defaultSlideDuration, handle, slides, soundtrackPath, template]);

  if (!data) {
    return null;
  }

  if (data.template === 'DynamicSlideShow' || data.template === 'GeneratedVideo') {
    return (
      <DynamicSlideShow
        slides={data.slides}
        defaultSlideDuration={defaultSlideDuration}
        soundtrackPath={data.soundtrackPath}
      />
    );
  }

  const TemplateComponent =
    TEMPLATE_MAP[data.template as keyof typeof TEMPLATE_MAP] || SlideShow;
  return <TemplateComponent />;
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="SlideShow" component={SlideShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="GlassShow" component={GlassShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="NeuShow" component={NeuShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="RichShow" component={RichShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="TechShow" component={TechShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="AIShow" component={AIShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="NeonShow" component={NeonShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="LuxeShow" component={LuxeShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="LiquidShow" component={LiquidShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="FrostedShow" component={FrostedShow} durationInFrames={FALLBACK_COMPOSITION_DURATION} fps={30} width={1080} height={1920} />
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

          return {
            durationInFrames:
              providedSlides.length > 0
                ? calculateTotalFrames(providedSlides, 30, defaultSlideDuration)
                : await loadTotalFramesFromJson(),
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
