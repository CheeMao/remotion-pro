"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCaptionSegments = void 0;
const DEFAULT_FPS = 30;
const DEFAULT_DURATION_IN_FRAMES = 150;
const normalizeCaptionText = (text) => {
    if (typeof text !== 'string') {
        return undefined;
    }
    const normalized = text.replace(/\s+/g, ' ').trim();
    return normalized || undefined;
};
const countReadableUnits = (text) => {
    const matches = text.match(/[\u4e00-\u9fa5]|[a-zA-Z0-9]+/g);
    return matches ? matches.length : text.length;
};
const splitLongToken = (token, maxUnits = 22) => {
    const parts = [];
    let current = '';
    for (const char of token) {
        current += char;
        if (countReadableUnits(current) >= maxUnits) {
            parts.push(current);
            current = '';
        }
    }
    if (current.trim()) {
        parts.push(current);
    }
    return parts.length > 0 ? parts : [token];
};
const splitNarrationByPunctuation = (text) => {
    const normalized = normalizeCaptionText(text);
    if (!normalized) {
        return [];
    }
    const sentenceParts = normalized
        .split(/(?<=[，。！？；：,.!?;:])/u)
        .map((part) => part.trim())
        .filter(Boolean);
    const chunks = sentenceParts.flatMap((part) => {
        if (countReadableUnits(part) <= 24) {
            return [part];
        }
        const minorParts = part
            .split(/(?<=[、,])/u)
            .map((item) => item.trim())
            .filter(Boolean);
        if (minorParts.length <= 1) {
            return splitLongToken(part);
        }
        return minorParts.flatMap((item) => countReadableUnits(item) > 24 ? splitLongToken(item) : [item]);
    });
    return chunks.length > 0 ? chunks : [normalized];
};
const mergeChunksToTarget = (chunks, targetCount) => {
    if (chunks.length <= targetCount) {
        return chunks;
    }
    const merged = [];
    let cursor = 0;
    for (let index = 0; index < targetCount; index += 1) {
        const remainingSource = chunks.length - cursor;
        const remainingTarget = targetCount - index;
        const takeCount = Math.max(1, Math.ceil(remainingSource / remainingTarget));
        merged.push(chunks.slice(cursor, cursor + takeCount).join(''));
        cursor += takeCount;
    }
    return merged.filter(Boolean);
};
const ensureTargetChunkCount = (chunks, targetCount) => {
    if (targetCount <= 1) {
        return [chunks.join('')];
    }
    const nextChunks = [...chunks];
    while (nextChunks.length < targetCount) {
        const splitIndex = nextChunks.findIndex((chunk) => countReadableUnits(chunk) > 14);
        if (splitIndex < 0) {
            break;
        }
        const [chunk] = nextChunks.splice(splitIndex, 1);
        const splitChunks = splitLongToken(chunk, Math.max(8, Math.ceil(countReadableUnits(chunk) / 2)));
        nextChunks.splice(splitIndex, 0, ...splitChunks);
    }
    if (nextChunks.length > targetCount) {
        return mergeChunksToTarget(nextChunks, targetCount);
    }
    return nextChunks;
};
const buildCaptionChunks = (text, segmentCount) => {
    const baseChunks = splitNarrationByPunctuation(text);
    if (!segmentCount || segmentCount <= 0) {
        return baseChunks;
    }
    return ensureTargetChunkCount(baseChunks, segmentCount);
};
const resolveSlideDurationSeconds = (slide) => {
    if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
        return slide.audioDuration;
    }
    if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
        return slide.durationInFrames / DEFAULT_FPS;
    }
    return DEFAULT_DURATION_IN_FRAMES / DEFAULT_FPS;
};
const toCaptionSourceSlide = (value) => {
    const slide = value;
    return {
        id: typeof slide.id === 'string' ? slide.id : undefined,
        narration: typeof slide.narration === 'string' ? slide.narration : undefined,
        audioStart: typeof slide.audioStart === 'number' ? slide.audioStart : undefined,
        audioEnd: typeof slide.audioEnd === 'number' ? slide.audioEnd : undefined,
        audioDuration: typeof slide.audioDuration === 'number' ? slide.audioDuration : undefined,
        durationInFrames: typeof slide.durationInFrames === 'number' ? slide.durationInFrames : undefined,
        segmentIds: Array.isArray(slide.segmentIds)
            ? slide.segmentIds.filter((item) => typeof item === 'string')
            : undefined,
    };
};
const resolveSlideWindow = (slide, fallbackStart) => {
    const duration = resolveSlideDurationSeconds(slide);
    const start = typeof slide.audioStart === 'number' && slide.audioStart >= 0
        ? slide.audioStart
        : fallbackStart;
    const end = typeof slide.audioEnd === 'number' && slide.audioEnd > start
        ? slide.audioEnd
        : start + duration;
    return { start, end };
};
const buildCaptionSegments = (slides) => {
    const segments = [];
    let fallbackStart = 0;
    slides.forEach((rawSlide, slideIndex) => {
        const slide = toCaptionSourceSlide(rawSlide);
        const narration = normalizeCaptionText(slide.narration);
        const { start, end } = resolveSlideWindow(slide, fallbackStart);
        fallbackStart = end;
        if (!narration) {
            return;
        }
        const chunks = buildCaptionChunks(narration, Array.isArray(slide.segmentIds) ? slide.segmentIds.length : undefined).filter(Boolean);
        if (chunks.length === 0) {
            return;
        }
        const totalDuration = Math.max(0.01, end - start);
        const weights = chunks.map((chunk) => Math.max(1, countReadableUnits(chunk)));
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let consumedWeight = 0;
        chunks.forEach((chunk, chunkIndex) => {
            const chunkStart = start + (totalDuration * consumedWeight) / totalWeight;
            consumedWeight += weights[chunkIndex];
            const chunkEnd = chunkIndex === chunks.length - 1
                ? end
                : start + (totalDuration * consumedWeight) / totalWeight;
            segments.push({
                id: `${slide.id || `slide-${slideIndex}`}-caption-${chunkIndex}`,
                text: chunk,
                start: chunkStart,
                end: Math.max(chunkStart + 0.01, chunkEnd),
                slideIndex,
                slideId: slide.id,
            });
        });
    });
    return segments;
};
exports.buildCaptionSegments = buildCaptionSegments;
