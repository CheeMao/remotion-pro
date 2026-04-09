"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseContentFile = parseContentFile;
exports.contentToVideoConfig = contentToVideoConfig;
exports.calculateTotalFrames = calculateTotalFrames;
const fs_1 = require("fs");
const autoLayout_1 = require("../templates/autoLayout");
const templateSpecs_1 = require("../templates/templateSpecs");
const json_repair_1 = require("../utils/json-repair");
const DEFAULT_FPS = 30;
const DEFAULT_DURATION_PER_SLIDE = 150;
const getSlideDurationInFrames = (slide, fps, defaultDurationPerSlide) => {
    if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
        return slide.durationInFrames;
    }
    if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
        return Math.max(1, Math.ceil(slide.audioDuration * fps));
    }
    return defaultDurationPerSlide;
};
function parseContentFile(filePath) {
    const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
    const parsed = (0, json_repair_1.parseJsonWithRepair)(content, filePath);
    if (parsed.repairedContent && parsed.repairedContent !== content) {
        (0, fs_1.writeFileSync)(filePath, parsed.repairedContent, 'utf-8');
    }
    return parsed.data;
}
function contentToVideoConfig(content) {
    const fps = DEFAULT_FPS;
    const defaultDurationPerSlide = DEFAULT_DURATION_PER_SLIDE;
    const dimensions = (0, templateSpecs_1.getTemplateDimensions)(content.meta.template);
    const structuredSlides = (0, autoLayout_1.prepareSlidesForRender)(content.slides);
    const slides = structuredSlides.map((slide, index) => {
        const durationInFrames = getSlideDurationInFrames(slide, fps, defaultDurationPerSlide);
        return {
            id: `slide-${index}`,
            title: slide.title || `Slide ${index + 1}`,
            subtitle: slide.subtitle,
            points: slide.points,
            narration: slide.narration,
            type: slide.type,
            data: slide.data,
            elementTimings: slide.elementTimings,
            audioDuration: typeof slide.audioDuration === 'number'
                ? slide.audioDuration
                : durationInFrames / fps,
            durationInFrames,
            audioStart: slide.audioStart,
            audioEnd: slide.audioEnd,
        };
    });
    return {
        template: content.meta.template,
        slides,
        fps,
        width: dimensions.width,
        height: dimensions.height,
        defaultDurationPerSlide,
        soundtrackPath: content.meta.soundtrackPath || content.meta.soundtrack_path,
        soundtrackDuration: content.meta.soundtrackDuration || content.meta.soundtrack_duration,
    };
}
function calculateTotalFrames(config) {
    return config.slides.reduce((total, slide) => {
        return total + (slide.durationInFrames || config.defaultDurationPerSlide);
    }, 0);
}
