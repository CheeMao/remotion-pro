"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflow = void 0;
exports.generateFromContent = generateFromContent;
exports.generateAudioOnly = generateAudioOnly;
exports.generateNarrationOnly = generateNarrationOnly;
exports.generateNarrationTimelineOnly = generateNarrationTimelineOnly;
exports.syncTimelineOnly = syncTimelineOnly;
exports.renderOnly = renderOnly;
exports.structureContentOnly = structureContentOnly;
const fs_1 = require("fs");
const parse_content_1 = require("./parse-content");
const autoLayout_1 = require("../templates/autoLayout");
const generate_audio_1 = require("./generate-audio");
const render_video_1 = require("./render-video");
async function generateFromContent(options) {
    console.log('=== Video Generation Pipeline ===\n');
    console.log('1. Parsing content file...');
    let content = (0, parse_content_1.parseContentFile)(options.contentFile);
    console.log(`   Found ${content.slides.length} slides\n`);
    if (options.skipAudio) {
        console.log('2. Reusing existing narration timing...');
    }
    else {
        console.log('2. Generating soundtrack with TTS...');
        const result = await (0, generate_audio_1.generateAudio)({
            contentFile: options.contentFile,
            voiceId: options.voiceId,
            speechRate: options.speechRate,
        });
        content = result.content;
    }
    console.log('');
    console.log('3. Creating video configuration...');
    content = (0, parse_content_1.parseContentFile)(options.contentFile);
    const videoConfig = (0, parse_content_1.contentToVideoConfig)(content);
    const totalFrames = videoConfig.slides.reduce((sum, slide) => sum + (slide.durationInFrames || videoConfig.defaultDurationPerSlide), 0);
    console.log(`   Total duration: ${totalFrames} frames (${(totalFrames / 30).toFixed(2)}s)\n`);
    console.log('4. Rendering video...');
    await (0, render_video_1.renderVideo)({
        config: videoConfig,
        outputPath: options.outputPath,
    });
    console.log('\n=== Generation Complete ===');
    console.log(`Output: ${options.outputPath}`);
}
async function generateAudioOnly(options) {
    console.log('=== Audio Generation ===\n');
    const result = await (0, generate_audio_1.generateAudio)({
        contentFile: options.contentFile,
        voiceId: options.voiceId,
        speechRate: options.speechRate,
        outputDir: options.outputDir,
        accessKey: options.accessKey,
        appId: options.appId,
        resourceId: options.resourceId,
    });
    console.log(`Generated soundtrack: ${result.soundtrackPath}`);
    console.log(`Duration: ${result.soundtrackDuration.toFixed(2)}s`);
    console.log(`Audio files saved to: ${result.outputDir}`);
}
async function generateNarrationOnly(options) {
    const text = (0, fs_1.readFileSync)(options.textFile, 'utf-8');
    const result = await (0, generate_audio_1.generateNarrationTrack)({
        text,
        voiceId: options.voiceId,
        speechRate: options.speechRate,
        outputFile: options.outputFile,
        accessKey: options.accessKey,
        appId: options.appId,
        resourceId: options.resourceId,
    });
    console.log(JSON.stringify({
        audioPath: result.audioPath.replace(/\\/g, '/'),
        duration: result.duration,
    }, null, 2));
}
async function generateNarrationTimelineOnly(options) {
    const text = (0, fs_1.readFileSync)(options.textFile, 'utf-8');
    const result = await (0, generate_audio_1.generateNarrationTimeline)({
        text,
        voiceId: options.voiceId,
        speechRate: options.speechRate,
        outputDir: options.outputDir,
        accessKey: options.accessKey,
        appId: options.appId,
        resourceId: options.resourceId,
    });
    console.log(JSON.stringify({
        audioPath: result.audioPath.replace(/\\/g, '/'),
        duration: result.duration,
        segments: result.segments,
    }, null, 2));
}
async function syncTimelineOnly(options) {
    const result = await (0, generate_audio_1.syncTimelineToSoundtrack)({
        contentFile: options.contentFile,
        soundtrackFile: options.soundtrackFile,
        soundtrackPath: options.soundtrackPath,
        voiceId: options.voiceId,
    });
    console.log(JSON.stringify({
        soundtrackPath: result.soundtrackPath,
        soundtrackDuration: result.soundtrackDuration,
        slides: result.content.slides.length,
    }, null, 2));
}
async function renderOnly(options) {
    console.log('=== Video Render ===\n');
    const content = (0, parse_content_1.parseContentFile)(options.contentFile);
    const videoConfig = (0, parse_content_1.contentToVideoConfig)(content);
    if (options.template) {
        videoConfig.template = options.template;
    }
    const totalFrames = videoConfig.slides.reduce((sum, slide) => sum + (slide.durationInFrames || videoConfig.defaultDurationPerSlide), 0);
    console.log(`Rendering ${totalFrames} frames (${(totalFrames / videoConfig.fps).toFixed(2)}s)`);
    await (0, render_video_1.renderVideo)({
        config: videoConfig,
        outputPath: options.outputPath,
        compositionId: 'GeneratedVideo',
    });
    console.log(`Output: ${options.outputPath}`);
}
async function structureContentOnly(options) {
    console.log('=== Content Structuring ===\n');
    const content = (0, parse_content_1.parseContentFile)(options.contentFile);
    const template = options.template || content.meta.template;
    const structuredSlides = (0, autoLayout_1.prepareSlidesForRender)(content.slides);
    const outputFile = options.outputFile || options.contentFile;
    const updated = {
        ...content,
        meta: {
            ...content.meta,
            template,
        },
        slides: structuredSlides,
    };
    (0, fs_1.writeFileSync)(outputFile, JSON.stringify(updated, null, 2));
    console.log(`Template: ${template}`);
    console.log(`Slides: ${structuredSlides.length}`);
    console.log(`Output: ${outputFile}`);
}
exports.workflow = {
    generateFromContent,
    generateAudioOnly,
    generateNarrationOnly,
    generateNarrationTimelineOnly,
    syncTimelineOnly,
    renderOnly,
    structureContentOnly,
};
