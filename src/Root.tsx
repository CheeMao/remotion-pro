import { Composition, continueRender, delayRender } from "remotion";
import { useEffect, useState } from "react";
import { GlassShow } from "./GlassShow";
import { KnowledgeShow } from "./KnowledgeShow";
import { LiquidBriefShow } from "./LiquidBriefShow";
import { LiquidShow } from "./LiquidShow";
import { MacShow } from "./MacShow";
import { RichShow } from "./RichShow";
import { TechShow } from "./TechShow";
import { calculateTotalFrames } from "./templates/DynamicSlideShow";
import { prepareSlidesForRender } from "./templates/autoLayout";
import { AudioSlideData, ContentFile, ContentSlide } from "./templates/types";
import { SharedVideo } from "./renderers/SharedVideo";
import { getTemplateDimensions } from "./templates/templateSpecs";
import { getTemplateContentPath, toStaticContentPath } from "./project-content";

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

const DEFAULT_TEMPLATE = "GlassShow";
const DEFAULT_DURATION = 150;
const FALLBACK_COMPOSITION_DURATION = 5400;

const defaultSlides: AudioSlideData[] = [
  {
    id: "slide-0",
    title: "AI video workflow",
    subtitle: "Script to final video",
    points: [
      "Generate slides",
      "Create one narration track",
      "Preview and export",
    ],
    durationInFrames: DEFAULT_DURATION,
  },
];

const getQueryParam = (name: string): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const value = new URLSearchParams(window.location.search).get(name);
  return value || undefined;
};

const getTemplateProjectContentPath = (template: string): string => {
  return getTemplateContentPath(template);
};

const loadCurrentProjectReference =
  async (): Promise<CurrentProjectReference | null> => {
    try {
      const staticBase =
        (window as { remotion_staticBase?: string }).remotion_staticBase || "";
      const response = await fetch(
        `${staticBase}/projects/current-project.json`,
      );
      if (!response.ok) {
        throw new Error(`Failed to load current project: ${response.status}`);
      }

      return (await response.json()) as CurrentProjectReference;
    } catch {
      return null;
    }
  };

const readCurrentProjectReference =
  async (): Promise<CurrentProjectReference | null> => {
    try {
      const { readFile } = await import("fs/promises");
      const { join } = await import("path");
      const filePath = join(
        process.cwd(),
        "public",
        "projects",
        "current-project.json",
      );
      const fileContent = await readFile(filePath, "utf-8");
      return JSON.parse(fileContent) as CurrentProjectReference;
    } catch {
      return null;
    }
  };

const toAudioSlides = (content: ContentFile): AudioSlideData[] => {
  return prepareSlidesForRender(content.slides).map((slide, index) => ({
    id: `slide-${index}`,
    title: slide.title || `Slide ${index + 1}`,
    subtitle: slide.subtitle,
    points: slide.points,
    narration: slide.narration,
    type: slide.type,
    data: slide.data,
    elementTimings: slide.elementTimings,
    audioDuration: slide.audioDuration,
    durationInFrames: slide.durationInFrames,
    audioStart: slide.audioStart,
    audioEnd: slide.audioEnd,
  }));
};

const coerceToAudioSlides = (slides: ContentSlide[]): AudioSlideData[] => {
  return prepareSlidesForRender(slides).map((slide, index) => ({
    id: `slide-${index}`,
    title: slide.title || `Slide ${index + 1}`,
    subtitle: slide.subtitle,
    points: slide.points,
    narration: slide.narration,
    type: slide.type,
    data: slide.data,
    elementTimings: slide.elementTimings,
    audioDuration: slide.audioDuration,
    durationInFrames: slide.durationInFrames,
    audioStart: slide.audioStart,
    audioEnd: slide.audioEnd,
    audioPath: slide.audioPath,
  }));
};

const loadSlidesFromJson = async (
  contentPath?: string,
  template?: string,
): Promise<LoadedJsonData> => {
  try {
    const staticBase =
      (window as { remotion_staticBase?: string }).remotion_staticBase || "";
    const currentProject = !contentPath
      ? await loadCurrentProjectReference()
      : null;
    const requestedContentPath = toStaticContentPath(
      contentPath ||
        currentProject?.contentPath ||
        getTemplateProjectContentPath(
          currentProject?.template || template || DEFAULT_TEMPLATE,
        ),
    );
    const response = await fetch(`${staticBase}/${requestedContentPath}`);
    if (!response.ok) {
      throw new Error(`Failed to load content JSON: ${response.status}`);
    }

    const data: ContentFile = await response.json();
    const resolvedTemplate = data.meta.template || template || DEFAULT_TEMPLATE;
    return {
      slides: prepareSlidesForRender(data.slides),
      template: resolvedTemplate,
      soundtrackPath: data.meta.soundtrackPath || data.meta.soundtrack_path,
    };
  } catch {
    return {
      slides: prepareSlidesForRender(
        defaultSlides as unknown as ContentSlide[]
      ),
      template: DEFAULT_TEMPLATE,
    };
  }
};

const loadTotalFramesFromJson = async (
  contentPath?: string,
  template?: string,
): Promise<number> => {
  try {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const currentProject = !contentPath
      ? await readCurrentProjectReference()
      : null;
    const requestedContentPath = toStaticContentPath(
      contentPath ||
        currentProject?.contentPath ||
        getTemplateProjectContentPath(
          currentProject?.template || template || DEFAULT_TEMPLATE,
        ),
    );
    const filePath = join(process.cwd(), "public", requestedContentPath);
    const fileContent = await readFile(filePath, "utf-8");
    const data: ContentFile = JSON.parse(fileContent);
    return calculateTotalFrames(toAudioSlides(data), 30, DEFAULT_DURATION);
  } catch {
    return FALLBACK_COMPOSITION_DURATION;
  }
};

const resolveGeneratedVideoData = async (
  props: GeneratedVideoProps,
): Promise<LoadedJsonData> => {
  if (Array.isArray(props.slides) && props.slides.length > 0) {
    return {
      slides: props.slides as unknown as ContentSlide[],
      template: props.template || DEFAULT_TEMPLATE,
      soundtrackPath: props.soundtrackPath,
    };
  }

  const queryTemplate = getQueryParam("template");
  const queryContentPath = getQueryParam("contentPath");

  return loadSlidesFromJson(
    props.contentPath || queryContentPath,
    props.template || queryTemplate,
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
  const [handle] = useState(() => delayRender("load video json"));

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
  }, [
    contentPath,
    defaultSlideDuration,
    handle,
    slides,
    soundtrackPath,
    template,
  ]);

  if (!data) {
    return null;
  }

  return (
    <SharedVideo
      slides={coerceToAudioSlides(data.slides)}
      template={data.template}
      soundtrackPath={data.soundtrackPath}
      defaultSlideDuration={defaultSlideDuration}
    />
  );
};

const getTemplateMetadata = (template: string) => {
  return async () => ({
    durationInFrames: await loadTotalFramesFromJson(
      getTemplateProjectContentPath(template),
      template,
    ),
  });
};

const getGeneratedCompositionDimensions = (template?: string) => {
  return getTemplateDimensions(template);
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GlassShow"
        component={GlassShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={getTemplateMetadata("GlassShow")}
      />
      <Composition
        id="LiquidShow"
        component={LiquidShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={getTemplateMetadata("LiquidShow")}
      />
      <Composition
        id="LiquidBriefShow"
        component={LiquidBriefShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={getTemplateMetadata("LiquidBriefShow")}
      />
      <Composition
        id="KnowledgeShow"
        component={KnowledgeShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={getTemplateMetadata("KnowledgeShow")}
      />
      <Composition
        id="MacShow"
        component={MacShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={getTemplateMetadata("MacShow")}
      />
      <Composition
        id="RichShow"
        component={RichShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={getTemplateMetadata("RichShow")}
      />
      <Composition
        id="TechShow"
        component={TechShow}
        durationInFrames={FALLBACK_COMPOSITION_DURATION}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={getTemplateMetadata("TechShow")}
      />
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
          const dimensions = getGeneratedCompositionDimensions(
            typedProps.template,
          );

          return {
            durationInFrames:
              providedSlides.length > 0
                ? calculateTotalFrames(providedSlides, 30, defaultSlideDuration)
                : await loadTotalFramesFromJson(
                    typedProps.contentPath,
                    typedProps.template,
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
    </>
  );
};
