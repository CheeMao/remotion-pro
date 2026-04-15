import type { WordTimestamp } from '../tts/types';

export interface CaptionSourceSlide {
  id?: string;
  narration?: string;
  audioStart?: number;
  audioEnd?: number;
  audioDuration?: number;
  durationInFrames?: number;
  segmentIds?: string[];
  wordTimestamps?: WordTimestamp[];
}

export interface CaptionSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  slideIndex: number;
  slideId?: string;
}

const DEFAULT_FPS = 30;
const DEFAULT_DURATION_IN_FRAMES = 150;

const normalizeCaptionText = (text?: string): string | undefined => {
  if (typeof text !== 'string') {
    return undefined;
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
};

const countReadableUnits = (text: string): number => {
  const matches = text.match(/[\u4e00-\u9fa5]|[a-zA-Z0-9]+/g);
  return matches ? matches.length : text.length;
};

const splitLongToken = (token: string, maxUnits = 22): string[] => {
  const parts: string[] = [];
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

const splitNarrationByPunctuation = (text: string): string[] => {
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

    return minorParts.flatMap((item) =>
      countReadableUnits(item) > 24 ? splitLongToken(item) : [item]
    );
  });

  return chunks.length > 0 ? chunks : [normalized];
};

const mergeChunksToTarget = (chunks: string[], targetCount: number): string[] => {
  if (chunks.length <= targetCount) {
    return chunks;
  }

  const merged: string[] = [];
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

const ensureTargetChunkCount = (chunks: string[], targetCount: number): string[] => {
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
    const splitChunks = splitLongToken(
      chunk,
      Math.max(8, Math.ceil(countReadableUnits(chunk) / 2))
    );
    nextChunks.splice(splitIndex, 0, ...splitChunks);
  }

  if (nextChunks.length > targetCount) {
    return mergeChunksToTarget(nextChunks, targetCount);
  }

  return nextChunks;
};

const buildCaptionChunks = (text: string, segmentCount?: number): string[] => {
  const baseChunks = splitNarrationByPunctuation(text);
  if (!segmentCount || segmentCount <= 0) {
    return baseChunks;
  }

  return ensureTargetChunkCount(baseChunks, segmentCount);
};

const resolveSlideDurationSeconds = (slide: CaptionSourceSlide): number => {
  if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
    return slide.audioDuration;
  }

  if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
    return slide.durationInFrames / DEFAULT_FPS;
  }

  return DEFAULT_DURATION_IN_FRAMES / DEFAULT_FPS;
};

const isWordTimestamp = (value: unknown): value is WordTimestamp => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<WordTimestamp>;
  return (
    typeof candidate.word === 'string' &&
    typeof candidate.startTime === 'number' &&
    typeof candidate.endTime === 'number'
  );
};

const toCaptionSourceSlide = (value: object): CaptionSourceSlide => {
  const slide = value as Partial<CaptionSourceSlide>;
  return {
    id: typeof slide.id === 'string' ? slide.id : undefined,
    narration: typeof slide.narration === 'string' ? slide.narration : undefined,
    audioStart: typeof slide.audioStart === 'number' ? slide.audioStart : undefined,
    audioEnd: typeof slide.audioEnd === 'number' ? slide.audioEnd : undefined,
    audioDuration: typeof slide.audioDuration === 'number' ? slide.audioDuration : undefined,
    durationInFrames:
      typeof slide.durationInFrames === 'number' ? slide.durationInFrames : undefined,
    segmentIds: Array.isArray(slide.segmentIds)
      ? slide.segmentIds.filter((item): item is string => typeof item === 'string')
      : undefined,
    wordTimestamps: Array.isArray(slide.wordTimestamps)
      ? slide.wordTimestamps.filter(isWordTimestamp)
      : undefined,
  };
};

const resolveSlideWindow = (
  slide: CaptionSourceSlide,
  fallbackStart: number
): { start: number; end: number } => {
  const duration = resolveSlideDurationSeconds(slide);
  const start =
    typeof slide.audioStart === 'number' && slide.audioStart >= 0
      ? slide.audioStart
      : fallbackStart;
  const end =
    typeof slide.audioEnd === 'number' && slide.audioEnd > start
      ? slide.audioEnd
      : start + duration;

  return { start, end };
};

const PUNCTUATION_BREAK_PATTERN = /[，。！？；：、,.!?;:]/u;
const SOFT_CHUNK_LIMIT = 18;
const MIN_CAPTION_DURATION = 0.18;

const buildSegmentsFromWordTimestamps = (
  slide: CaptionSourceSlide,
  slideIndex: number,
  audioOffset: number,
  windowEnd: number,
  words: WordTimestamp[]
): CaptionSegment[] => {
  const segments: CaptionSegment[] = [];
  const slideId = slide.id || `slide-${slideIndex}`;
  let buffer: WordTimestamp[] = [];
  let bufferUnits = 0;
  let captionIndex = 0;

  const flush = () => {
    if (buffer.length === 0) {
      return;
    }

    const text = normalizeCaptionText(buffer.map((word) => word.word).join(''));
    if (!text) {
      buffer = [];
      bufferUnits = 0;
      return;
    }

    const rawStart = audioOffset + buffer[0].startTime;
    const rawEnd = audioOffset + buffer[buffer.length - 1].endTime;
    const clampedStart = Math.max(audioOffset, Math.min(rawStart, windowEnd - MIN_CAPTION_DURATION));
    const clampedEnd = Math.min(windowEnd, Math.max(rawEnd, clampedStart + MIN_CAPTION_DURATION));

    segments.push({
      id: `${slideId}-caption-${captionIndex}`,
      text,
      start: clampedStart,
      end: clampedEnd,
      slideIndex,
      slideId: slide.id,
    });
    captionIndex += 1;
    buffer = [];
    bufferUnits = 0;
  };

  words.forEach((word) => {
    if (!word || typeof word.word !== 'string' || word.word.length === 0) {
      return;
    }

    buffer.push(word);
    bufferUnits += countReadableUnits(word.word);
    const breaksOnPunctuation = PUNCTUATION_BREAK_PATTERN.test(word.word);

    if (breaksOnPunctuation || bufferUnits >= SOFT_CHUNK_LIMIT) {
      flush();
    }
  });

  flush();
  return segments;
};

export const buildCaptionSegments = (
  slides: ReadonlyArray<object>
): CaptionSegment[] => {
  const segments: CaptionSegment[] = [];
  let fallbackStart = 0;

  slides.forEach((rawSlide, slideIndex) => {
    const slide = toCaptionSourceSlide(rawSlide);
    const narration = normalizeCaptionText(slide.narration);
    const { start, end } = resolveSlideWindow(slide, fallbackStart);
    fallbackStart = end;

    if (slide.wordTimestamps && slide.wordTimestamps.length > 0) {
      const wordSegments = buildSegmentsFromWordTimestamps(
        slide,
        slideIndex,
        start,
        end,
        slide.wordTimestamps
      );
      if (wordSegments.length > 0) {
        segments.push(...wordSegments);
        return;
      }
    }

    if (!narration) {
      return;
    }

    const chunks = buildCaptionChunks(
      narration,
      Array.isArray(slide.segmentIds) ? slide.segmentIds.length : undefined
    ).filter(Boolean);

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
      const chunkEnd =
        chunkIndex === chunks.length - 1
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
