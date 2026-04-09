"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNarrationTrack = generateNarrationTrack;
exports.generateNarrationTimeline = generateNarrationTimeline;
exports.syncTimelineToSoundtrack = syncTimelineToSoundtrack;
exports.generateAudio = generateAudio;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path_1 = require("path");
const music_metadata_1 = require("music-metadata");
const tts_1 = require("../tts");
const parse_content_1 = require("./parse-content");
const elementTiming_1 = require("../templates/elementTiming");
const FPS = 30;
const DEFAULT_SOUNDTRACK_FILE = 'narration.mp3';
const normalizeNarrationSegment = (text) => {
    return text.replace(/\s+/g, ' ').trim();
};
const isSpeakableSegment = (text) => {
    return /[\p{L}\p{N}]/u.test(text);
};
const getContentVoiceId = (content) => {
    return content.meta.voiceId || content.meta.voice_id;
};
const getNarrationText = (slide) => {
    if (typeof slide.narration === 'string' && slide.narration.trim()) {
        return slide.narration.trim();
    }
    if (typeof slide.title === 'string' && slide.title.trim()) {
        return slide.title.trim();
    }
    return '';
};
const ensureDir = (dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
};
const clearDir = (dir) => {
    if ((0, fs_1.existsSync)(dir)) {
        (0, fs_1.rmSync)(dir, { recursive: true, force: true });
    }
    (0, fs_1.mkdirSync)(dir, { recursive: true });
};
const toRelativePublicPath = (filePath) => {
    if (process.env.REMOTION_FORCE_FILE_URLS === '1') {
        return (0, path_1.resolve)(filePath);
    }
    const normalized = filePath.replace(/\\/g, '/');
    const publicIndex = normalized.indexOf('/public/');
    if (publicIndex >= 0) {
        return normalized.slice(publicIndex + '/public/'.length);
    }
    return normalized.replace(/^public\//, '');
};
const getAudioDuration = async (filePath) => {
    const metadata = await (0, music_metadata_1.parseFile)(filePath);
    const duration = metadata.format.duration;
    if (!duration) {
        throw new Error(`Unable to determine audio duration: ${filePath}`);
    }
    return duration;
};
const concatenateAudioFiles = (files, outputFile) => {
    if (files.length === 0) {
        throw new Error('No audio files to concatenate.');
    }
    ensureDir((0, path_1.dirname)(outputFile));
    const listFile = (0, path_1.join)((0, path_1.dirname)(outputFile), `concat-${Date.now()}.txt`);
    const fileList = files
        .map((filePath) => (0, path_1.resolve)(filePath))
        .map((filePath) => `file '${filePath.replace(/'/g, "'\\''").replace(/\\/g, '/')}'`)
        .join('\n');
    (0, fs_1.writeFileSync)(listFile, fileList, 'utf-8');
    try {
        const ffmpegBinary = process.env.FFMPEG_PATH || 'ffmpeg';
        (0, child_process_1.execFileSync)(ffmpegBinary, [
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            listFile,
            '-c',
            'copy',
            outputFile,
        ], {
            stdio: ['ignore', 'ignore', 'pipe'],
        });
    }
    catch (error) {
        const stderr = error && typeof error === 'object' && 'stderr' in error
            ? Buffer.isBuffer(error.stderr)
                ? error.stderr.toString('utf-8').trim()
                : typeof error.stderr === 'string'
                    ? error.stderr.trim()
                    : ''
            : '';
        throw new Error(error instanceof Error
            ? `Failed to concatenate audio: ${stderr || error.message}`
            : 'Failed to concatenate audio.');
    }
    finally {
        (0, fs_1.rmSync)(listFile, { force: true });
    }
};
const splitNarrationIntoSegments = (text) => {
    const normalized = text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => normalizeNarrationSegment(line))
        .filter(Boolean)
        .join('\n');
    if (!normalized) {
        return [];
    }
    const paragraphAware = normalized
        .split('\n')
        .flatMap((line) => line
        .split(/(?<=[。！？!?；;：:])/)
        .map((part) => normalizeNarrationSegment(part))
        .filter((part) => part.length > 0 && isSpeakableSegment(part)));
    return paragraphAware.length > 0 ? paragraphAware : isSpeakableSegment(normalized) ? [normalized] : [];
};
const getFullNarration = (content) => {
    if (typeof content.meta.fullNarration === 'string' && content.meta.fullNarration.trim()) {
        return content.meta.fullNarration.trim();
    }
    if (typeof content.meta.full_narration === 'string' && content.meta.full_narration.trim()) {
        return content.meta.full_narration.trim();
    }
    return content.slides.map(getNarrationText).filter(Boolean).join('\n');
};
const getSlideSegmentIds = (slide) => {
    const raw = slide.segmentIds;
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.filter((item) => typeof item === 'string' && item.trim().length > 0);
};
const resolveSegmentAudioFiles = (slide, outputDir) => {
    const segmentsDir = (0, path_1.join)(outputDir, 'segments');
    const segmentIds = getSlideSegmentIds(slide);
    if (segmentIds.length === 0) {
        return [];
    }
    const files = segmentIds.map((segmentId) => {
        const match = /^segment-(\d+)$/.exec(segmentId.trim());
        if (!match) {
            return null;
        }
        const fileName = `segment-${match[1].padStart(3, '0')}.mp3`;
        const segmentFile = (0, path_1.join)(segmentsDir, fileName);
        return (0, fs_1.existsSync)(segmentFile) ? segmentFile : null;
    });
    return files.every((filePath) => typeof filePath === 'string')
        ? files
        : [];
};
const buildTimedSlidesFromDurations = (content, durations, voiceId, soundtrackPath, soundtrackDuration) => {
    let cursor = 0;
    const slides = content.slides.map((slide, index) => {
        const duration = durations[index];
        const audioStart = cursor;
        cursor += duration.duration;
        const audioEnd = cursor;
        return {
            ...slide,
            audioPath: duration.audioPath,
            audioDuration: duration.duration,
            durationInFrames: Math.max(1, Math.round(duration.duration * FPS)),
            audioStart,
            audioEnd,
        };
    });
    return {
        ...content,
        meta: {
            ...content.meta,
            voiceId: voiceId || getContentVoiceId(content),
            fullNarration: getFullNarration(content),
            soundtrackPath,
            soundtrackDuration,
        },
        slides,
    };
};
async function generateNarrationTrack(options) {
    const { text, voiceId, speechRate, outputFile = (0, path_1.join)('public', 'audio', DEFAULT_SOUNDTRACK_FILE), accessKey, appId, resourceId, } = options;
    const trimmed = text.trim();
    if (!trimmed) {
        throw new Error('Narration text is empty.');
    }
    if (!isSpeakableSegment(trimmed)) {
        throw new Error('Narration text must contain letters or numbers.');
    }
    ensureDir((0, path_1.dirname)(outputFile));
    const tts = (0, tts_1.createTTSService)({
        accessKey,
        appId,
        resourceId,
        defaultVoiceId: voiceId,
        defaultSpeechRate: speechRate,
    });
    const result = await tts.synthesize(trimmed, voiceId, speechRate);
    (0, fs_1.writeFileSync)(outputFile, (0, fs_1.readFileSync)(result.audioPath));
    const duration = await getAudioDuration(outputFile);
    return {
        audioPath: outputFile,
        duration,
        voiceId,
    };
}
async function generateNarrationTimeline(options) {
    const { text, voiceId, speechRate, outputDir = (0, path_1.join)('public', 'audio'), accessKey, appId, resourceId, } = options;
    const segmentsText = splitNarrationIntoSegments(text);
    if (segmentsText.length === 0) {
        throw new Error('Narration text is empty.');
    }
    ensureDir(outputDir);
    const segmentsDir = (0, path_1.join)(outputDir, 'segments');
    clearDir(segmentsDir);
    const tts = (0, tts_1.createTTSService)({
        accessKey,
        appId,
        resourceId,
        defaultVoiceId: voiceId,
        defaultSpeechRate: speechRate,
    });
    const files = [];
    const segments = [];
    let cursor = 0;
    for (let index = 0; index < segmentsText.length; index += 1) {
        const segmentText = normalizeNarrationSegment(segmentsText[index]);
        if (!segmentText || !isSpeakableSegment(segmentText)) {
            continue;
        }
        let result;
        try {
            result = await tts.synthesize(segmentText, voiceId, speechRate);
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            throw new Error(`Narration segment ${index + 1} failed TTS synthesis: ${reason}. Segment text: "${segmentText}"`);
        }
        const outputFile = (0, path_1.join)(segmentsDir, `segment-${String(index + 1).padStart(3, '0')}.mp3`);
        (0, fs_1.writeFileSync)(outputFile, (0, fs_1.readFileSync)(result.audioPath));
        const duration = await getAudioDuration(outputFile);
        const start = cursor;
        const end = start + duration;
        cursor = end;
        files.push(outputFile);
        segments.push({
            id: `segment-${index + 1}`,
            text: segmentText,
            start,
            end,
            duration,
            audioPath: toRelativePublicPath(outputFile),
        });
    }
    if (files.length === 0) {
        throw new Error('Narration text did not contain any speakable segments.');
    }
    const soundtrackFile = (0, path_1.join)(outputDir, DEFAULT_SOUNDTRACK_FILE);
    concatenateAudioFiles(files, soundtrackFile);
    const duration = await getAudioDuration(soundtrackFile);
    return {
        audioPath: soundtrackFile,
        duration,
        voiceId,
        segments,
    };
}
async function syncTimelineToSoundtrack(options) {
    const { contentFile, soundtrackFile = (0, path_1.join)('public', 'audio', DEFAULT_SOUNDTRACK_FILE), soundtrackPath = toRelativePublicPath(soundtrackFile), soundtrackDuration, voiceId, } = options;
    const content = (0, parse_content_1.parseContentFile)(contentFile);
    const resolvedDuration = soundtrackDuration || (await getAudioDuration(soundtrackFile));
    const slides = content.slides;
    if (slides.length === 0) {
        throw new Error('Content has no slides.');
    }
    const perSlideDuration = resolvedDuration / slides.length;
    const updated = buildTimedSlidesFromDurations(content, slides.map(() => ({
        duration: perSlideDuration,
        audioPath: soundtrackPath,
    })), voiceId, soundtrackPath, resolvedDuration);
    (0, fs_1.writeFileSync)(contentFile, JSON.stringify(updated, null, 2));
    return {
        content: updated,
        outputDir: (0, path_1.dirname)(soundtrackFile),
        soundtrackPath,
        soundtrackDuration: resolvedDuration,
    };
}
async function generateAudio(options) {
    const { contentFile, voiceId, speechRate, outputDir = 'public/audio', accessKey, appId, resourceId, } = options;
    const content = (0, parse_content_1.parseContentFile)(contentFile);
    const resolvedVoiceId = voiceId || getContentVoiceId(content);
    const slidesDir = (0, path_1.join)(outputDir, 'slides');
    clearDir(slidesDir);
    const tts = (0, tts_1.createTTSService)({
        accessKey,
        appId,
        resourceId,
        defaultVoiceId: resolvedVoiceId,
        defaultSpeechRate: speechRate,
    });
    const durations = [];
    const files = [];
    const slideTimestamps = [];
    for (let index = 0; index < content.slides.length; index += 1) {
        const slide = content.slides[index];
        const outputFile = (0, path_1.join)(slidesDir, `slide-${String(index + 1).padStart(3, '0')}.mp3`);
        const segmentFiles = resolveSegmentAudioFiles(slide, outputDir);
        if (segmentFiles.length > 0) {
            concatenateAudioFiles(segmentFiles, outputFile);
        }
        else {
            const text = getNarrationText(slide);
            if (!text) {
                throw new Error(`Slide ${index + 1} has no narration text.`);
            }
            const result = await tts.synthesize(text, resolvedVoiceId, speechRate);
            (0, fs_1.writeFileSync)(outputFile, (0, fs_1.readFileSync)(result.audioPath));
            // 保存时间戳用于后续计算元素动画
            if (result.timestamps) {
                slideTimestamps.push({ slideIndex: index, timestamps: result.timestamps });
            }
        }
        const duration = await getAudioDuration(outputFile);
        files.push(outputFile);
        durations.push({
            duration,
            audioPath: toRelativePublicPath(outputFile),
        });
    }
    const soundtrackFile = (0, path_1.join)(outputDir, DEFAULT_SOUNDTRACK_FILE);
    concatenateAudioFiles(files, soundtrackFile);
    const soundtrackDuration = await getAudioDuration(soundtrackFile);
    const soundtrackPath = toRelativePublicPath(soundtrackFile);
    // 构建基础更新后的content
    let updated = buildTimedSlidesFromDurations(content, durations, resolvedVoiceId, soundtrackPath, soundtrackDuration);
    // 如果有时间戳，计算每个slide的元素级时间戳
    if (slideTimestamps.length > 0) {
        let currentTime = 0;
        const slidesWithTimings = updated.slides.map((slide, index) => {
            var _a;
            const slideStartTime = currentTime;
            const slideDuration = slide.audioDuration || ((_a = durations[index]) === null || _a === void 0 ? void 0 : _a.duration) || 5;
            currentTime += slideDuration;
            const timestampData = slideTimestamps.find((st) => st.slideIndex === index);
            if (timestampData === null || timestampData === void 0 ? void 0 : timestampData.timestamps) {
                const elementTimings = (0, elementTiming_1.calculateElementTimingsFromTimestamps)(slide, slideStartTime, timestampData.timestamps);
                return {
                    ...slide,
                    elementTimings,
                };
            }
            return slide;
        });
        updated = {
            ...updated,
            slides: slidesWithTimings,
        };
    }
    (0, fs_1.writeFileSync)(contentFile, JSON.stringify(updated, null, 2));
    return {
        content: updated,
        outputDir,
        soundtrackPath,
        soundtrackDuration,
    };
}
