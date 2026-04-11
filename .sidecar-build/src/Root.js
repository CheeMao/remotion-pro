"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemotionRoot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const react_1 = require("react");
const GlassShow_1 = require("./GlassShow");
const EditorialShow_1 = require("./EditorialShow");
const InsightShow_1 = require("./InsightShow");
const KnowledgeShow_1 = require("./KnowledgeShow");
const LiquidBriefShow_1 = require("./LiquidBriefShow");
const LiquidShow_1 = require("./LiquidShow");
const MacShow_1 = require("./MacShow");
const CosmosShow_1 = require("./CosmosShow");
const ProjectShow_1 = require("./ProjectShow");
const StickShow_1 = require("./StickShow");
const StudioShow_1 = require("./StudioShow");
const TechShow_1 = require("./TechShow");
const DynamicSlideShow_1 = require("./templates/DynamicSlideShow");
const autoLayout_1 = require("./templates/autoLayout");
const SharedVideo_1 = require("./renderers/SharedVideo");
const templateSpecs_1 = require("./templates/templateSpecs");
const project_content_1 = require("./project-content");
const DEFAULT_TEMPLATE = "GlassShow";
const DEFAULT_DURATION = 150;
const FALLBACK_COMPOSITION_DURATION = 5400;
const defaultSlides = [
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
const getQueryParam = (name) => {
    if (typeof window === "undefined") {
        return undefined;
    }
    const value = new URLSearchParams(window.location.search).get(name);
    return value || undefined;
};
const getTemplateProjectContentPath = (template) => {
    return (0, project_content_1.getTemplateContentPath)(template);
};
const loadCurrentProjectReference = async () => {
    try {
        const staticBase = window.remotion_staticBase || "";
        const response = await fetch(`${staticBase}/projects/current-project.json`);
        if (!response.ok) {
            throw new Error(`Failed to load current project: ${response.status}`);
        }
        return (await response.json());
    }
    catch {
        return null;
    }
};
const readCurrentProjectReference = async () => {
    try {
        const { readFile } = await Promise.resolve().then(() => __importStar(require("fs/promises")));
        const { join } = await Promise.resolve().then(() => __importStar(require("path")));
        const filePath = join(process.cwd(), "public", "projects", "current-project.json");
        const fileContent = await readFile(filePath, "utf-8");
        return JSON.parse(fileContent);
    }
    catch {
        return null;
    }
};
const toAudioSlides = (content) => {
    return (0, autoLayout_1.prepareSlidesForRender)(content.slides).map((slide, index) => ({
        id: `slide-${index}`,
        title: slide.title || `Slide ${index + 1}`,
        subtitle: slide.subtitle,
        points: slide.points,
        narration: slide.narration,
        segmentIds: slide.segmentIds,
        type: slide.type,
        data: slide.data,
        media: slide.media,
        motionPreset: slide.motionPreset,
        motion: slide.motion,
        elementTimings: slide.elementTimings,
        audioDuration: slide.audioDuration,
        durationInFrames: slide.durationInFrames,
        audioStart: slide.audioStart,
        audioEnd: slide.audioEnd,
    }));
};
const coerceToAudioSlides = (slides) => {
    return (0, autoLayout_1.prepareSlidesForRender)(slides).map((slide, index) => ({
        id: `slide-${index}`,
        title: slide.title || `Slide ${index + 1}`,
        subtitle: slide.subtitle,
        points: slide.points,
        narration: slide.narration,
        segmentIds: slide.segmentIds,
        type: slide.type,
        data: slide.data,
        media: slide.media,
        motionPreset: slide.motionPreset,
        motion: slide.motion,
        elementTimings: slide.elementTimings,
        audioDuration: slide.audioDuration,
        durationInFrames: slide.durationInFrames,
        audioStart: slide.audioStart,
        audioEnd: slide.audioEnd,
        audioPath: slide.audioPath,
    }));
};
const loadSlidesFromJson = async (contentPath, template) => {
    try {
        const staticBase = window.remotion_staticBase || "";
        const currentProject = !contentPath
            ? await loadCurrentProjectReference()
            : null;
        const requestedContentPath = (0, project_content_1.toStaticContentPath)(contentPath ||
            (currentProject === null || currentProject === void 0 ? void 0 : currentProject.contentPath) ||
            getTemplateProjectContentPath((currentProject === null || currentProject === void 0 ? void 0 : currentProject.template) || template || DEFAULT_TEMPLATE));
        const response = await fetch(`${staticBase}/${requestedContentPath}`);
        if (!response.ok) {
            throw new Error(`Failed to load content JSON: ${response.status}`);
        }
        const data = await response.json();
        const resolvedTemplate = data.meta.template || template || DEFAULT_TEMPLATE;
        return {
            slides: (0, autoLayout_1.prepareSlidesForRender)(data.slides),
            template: resolvedTemplate,
            soundtrackPath: data.meta.soundtrackPath || data.meta.soundtrack_path,
        };
    }
    catch {
        return {
            slides: (0, autoLayout_1.prepareSlidesForRender)(defaultSlides),
            template: DEFAULT_TEMPLATE,
        };
    }
};
const loadTotalFramesFromJson = async (contentPath, template) => {
    try {
        const { readFile } = await Promise.resolve().then(() => __importStar(require("fs/promises")));
        const { join } = await Promise.resolve().then(() => __importStar(require("path")));
        const currentProject = !contentPath
            ? await readCurrentProjectReference()
            : null;
        const requestedContentPath = (0, project_content_1.toStaticContentPath)(contentPath ||
            (currentProject === null || currentProject === void 0 ? void 0 : currentProject.contentPath) ||
            getTemplateProjectContentPath((currentProject === null || currentProject === void 0 ? void 0 : currentProject.template) || template || DEFAULT_TEMPLATE));
        const filePath = join(process.cwd(), "public", requestedContentPath);
        const fileContent = await readFile(filePath, "utf-8");
        const data = JSON.parse(fileContent);
        return (0, DynamicSlideShow_1.calculateTotalFrames)(toAudioSlides(data), 30, DEFAULT_DURATION);
    }
    catch {
        return FALLBACK_COMPOSITION_DURATION;
    }
};
const resolveGeneratedVideoData = async (props) => {
    if (Array.isArray(props.slides) && props.slides.length > 0) {
        return {
            slides: props.slides,
            template: props.template || DEFAULT_TEMPLATE,
            soundtrackPath: props.soundtrackPath,
        };
    }
    const queryTemplate = getQueryParam("template");
    const queryContentPath = getQueryParam("contentPath");
    return loadSlidesFromJson(props.contentPath || queryContentPath, props.template || queryTemplate);
};
const DynamicLoader = ({ slides, template, soundtrackPath, defaultSlideDuration = DEFAULT_DURATION, contentPath, }) => {
    const [data, setData] = (0, react_1.useState)(null);
    const [handle] = (0, react_1.useState)(() => (0, remotion_1.delayRender)("load video json"));
    (0, react_1.useEffect)(() => {
        resolveGeneratedVideoData({
            slides,
            template,
            soundtrackPath,
            defaultSlideDuration,
            contentPath,
        }).then((loadedData) => {
            setData(loadedData);
            (0, remotion_1.continueRender)(handle);
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
    return ((0, jsx_runtime_1.jsx)(SharedVideo_1.SharedVideo, { slides: coerceToAudioSlides(data.slides), template: data.template, soundtrackPath: data.soundtrackPath, defaultSlideDuration: defaultSlideDuration }));
};
const getTemplateMetadata = (template) => {
    return async () => ({
        durationInFrames: await loadTotalFramesFromJson(getTemplateProjectContentPath(template), template),
    });
};
const getGeneratedCompositionDimensions = (template) => {
    return (0, templateSpecs_1.getTemplateDimensions)(template);
};
const RemotionRoot = () => {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "GlassShow", component: GlassShow_1.GlassShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("GlassShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "LiquidShow", component: LiquidShow_1.LiquidShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("LiquidShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "LiquidBriefShow", component: LiquidBriefShow_1.LiquidBriefShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("LiquidBriefShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "KnowledgeShow", component: KnowledgeShow_1.KnowledgeShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("KnowledgeShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "MacShow", component: MacShow_1.MacShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1920, height: 1080, calculateMetadata: getTemplateMetadata("MacShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "StudioShow", component: StudioShow_1.StudioShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1920, height: 1080, calculateMetadata: getTemplateMetadata("StudioShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "EditorialShow", component: EditorialShow_1.EditorialShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1920, height: 1080, calculateMetadata: getTemplateMetadata("EditorialShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "InsightShow", component: InsightShow_1.InsightShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1920, height: 1080, calculateMetadata: getTemplateMetadata("InsightShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "StickShow", component: StickShow_1.StickShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("StickShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "TechShow", component: TechShow_1.TechShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("TechShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "CosmosShow", component: CosmosShow_1.CosmosShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("CosmosShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "ProjectShow", component: ProjectShow_1.ProjectShow, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: getTemplateMetadata("ProjectShow") }), (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "GeneratedVideo", component: DynamicLoader, durationInFrames: FALLBACK_COMPOSITION_DURATION, fps: 30, width: 1080, height: 1920, calculateMetadata: async ({ props }) => {
                    var _a;
                    const typedProps = props;
                    const defaultSlideDuration = (_a = typedProps.defaultSlideDuration) !== null && _a !== void 0 ? _a : DEFAULT_DURATION;
                    const providedSlides = Array.isArray(typedProps.slides)
                        ? typedProps.slides
                        : [];
                    const dimensions = getGeneratedCompositionDimensions(typedProps.template);
                    return {
                        durationInFrames: providedSlides.length > 0
                            ? (0, DynamicSlideShow_1.calculateTotalFrames)(providedSlides, 30, defaultSlideDuration)
                            : await loadTotalFramesFromJson(typedProps.contentPath, typedProps.template),
                        width: dimensions.width,
                        height: dimensions.height,
                        props: {
                            ...typedProps,
                            defaultSlideDuration,
                        },
                    };
                } })] }));
};
exports.RemotionRoot = RemotionRoot;
