import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { parseFile } from 'music-metadata';
import { parseContentFile } from './parse-content';
import { createTTSService } from '../tts';
import { ContentFile, ContentSlide } from '../templates/types';

export interface GenerateAudioOptions {
  contentFile: string;
  voiceId?: string;
  speechRate?: number;
  outputDir?: string;
  apiKey?: string;
}

export interface AudioGenerationResult {
  content: ContentFile;
  outputDir: string;
  soundtrackPath: string;
  soundtrackDuration: number;
}

export interface NarrationGenerationOptions {
  text: string;
  voiceId?: string;
  speechRate?: number;
  outputFile?: string;
  apiKey?: string;
}

export interface NarrationGenerationResult {
  audioPath: string;
  duration: number;
  voiceId?: string;
}

export interface SyncTimelineOptions {
  contentFile: string;
  soundtrackFile?: string;
  soundtrackPath?: string;
  soundtrackDuration?: number;
  voiceId?: string;
  fullNarration?: string;
}

const FPS = 30;
const DEFAULT_SOUNDTRACK_FILE = 'narration.mp3';
const MIN_SLIDE_DURATION_FRAMES = 45;
const MAX_SLIDE_DURATION_SECONDS = 8;
const MAX_SLIDE_DURATION_FRAMES = MAX_SLIDE_DURATION_SECONDS * FPS;
const MAX_SPLIT_ITERATIONS = 24;

const getContentVoiceId = (content: ContentFile): string | undefined => {
  return content.meta.voiceId || content.meta.voice_id;
};

const getFullNarration = (content: ContentFile): string => {
  const fromMeta = content.meta.fullNarration || content.meta.full_narration;
  if (fromMeta && fromMeta.trim()) {
    return fromMeta.trim();
  }

  return content.slides
    .map((slide) => {
      if (typeof slide.narration === 'string' && slide.narration.trim()) {
        return slide.narration.trim();
      }
      if (typeof slide.title === 'string' && slide.title.trim()) {
        return slide.title.trim();
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
};

const getSlideWeight = (slide: ContentSlide): number => {
  const parts: string[] = [];

  if (typeof slide.narration === 'string') {
    parts.push(slide.narration);
  }
  if (typeof slide.title === 'string') {
    parts.push(slide.title);
  }
  if (Array.isArray(slide.points)) {
    parts.push(
      ...slide.points.filter((point): point is string => typeof point === 'string')
    );
  }
  if (slide.data && typeof slide.data === 'object') {
    parts.push(JSON.stringify(slide.data));
  }

  return Math.max(1, parts.join(' ').replace(/\s+/g, '').length);
};

const allocateSlideFrames = (
  slides: ContentSlide[],
  totalFrames: number
): number[] => {
  const minTotalFrames = slides.length * MIN_SLIDE_DURATION_FRAMES;
  const weights = slides.map(getSlideWeight);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || slides.length;

  if (totalFrames <= minTotalFrames) {
    const rawFrames = weights.map((weight) => (weight / weightSum) * totalFrames);
    const baseFrames = rawFrames.map((value) => Math.max(1, Math.floor(value)));
    let assignedFrames = baseFrames.reduce((sum, value) => sum + value, 0);
    const remainders = rawFrames.map((value, index) => ({
      index,
      remainder: value - baseFrames[index],
    }));

    remainders.sort((left, right) => right.remainder - left.remainder);
    let cursor = 0;
    while (assignedFrames < totalFrames) {
      baseFrames[remainders[cursor % remainders.length].index] += 1;
      assignedFrames += 1;
      cursor += 1;
    }

    return baseFrames;
  }

  const remainingFrames = totalFrames - minTotalFrames;
  const rawFrames = weights.map(
    (weight) => MIN_SLIDE_DURATION_FRAMES + (weight / weightSum) * remainingFrames
  );
  const baseFrames = rawFrames.map((value) => Math.floor(value));
  let assignedFrames = baseFrames.reduce((sum, value) => sum + value, 0);
  const remainders = rawFrames.map((value, index) => ({
    index,
    remainder: value - baseFrames[index],
  }));

  remainders.sort((left, right) => right.remainder - left.remainder);
  let cursor = 0;
  while (assignedFrames < totalFrames) {
    baseFrames[remainders[cursor % remainders.length].index] += 1;
    assignedFrames += 1;
    cursor += 1;
  }

  return baseFrames;
};

const splitTextBySentences = (text: string): [string, string] | null => {
  const normalized = text.trim();
  if (!normalized) {
    return null;
  }

  const sentences = normalized
    .split(/(?<=[。！？!?；;.])\s*|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length >= 2) {
    const midpoint = Math.ceil(sentences.length / 2);
    return [
      sentences.slice(0, midpoint).join(' ').trim(),
      sentences.slice(midpoint).join(' ').trim(),
    ];
  }

  if (normalized.length < 24) {
    return null;
  }

  const midpoint = Math.floor(normalized.length / 2);
  const splitIndex =
    normalized.slice(midpoint).search(/[，,、；;。！？!? ]/) + midpoint;
  const safeIndex = splitIndex > midpoint ? splitIndex + 1 : midpoint;

  return [
    normalized.slice(0, safeIndex).trim(),
    normalized.slice(safeIndex).trim(),
  ];
};

const splitArrayInHalf = <T>(items: T[]): [T[], T[]] => {
  if (items.length <= 1) {
    return [items, items];
  }

  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
};

const splitSlideData = (
  data: Record<string, unknown> | undefined
): [Record<string, unknown> | undefined, Record<string, unknown> | undefined] => {
  if (!data) {
    return [undefined, undefined];
  }

  if (Array.isArray(data.items)) {
    const [left, right] = splitArrayInHalf(data.items);
    return [
      { ...data, items: left },
      { ...data, items: right.length > 0 ? right : left },
    ];
  }

  if (Array.isArray(data.stats)) {
    const [left, right] = splitArrayInHalf(data.stats);
    return [
      { ...data, stats: left },
      { ...data, stats: right.length > 0 ? right : left },
    ];
  }

  if (Array.isArray(data.bars)) {
    const [left, right] = splitArrayInHalf(data.bars);
    return [
      { ...data, bars: left },
      { ...data, bars: right.length > 0 ? right : left },
    ];
  }

  return [data, data];
};

const splitContentSlide = (slide: ContentSlide): ContentSlide[] | null => {
  const baseNarration =
    typeof slide.narration === 'string' && slide.narration.trim()
      ? slide.narration.trim()
      : typeof slide.title === 'string'
        ? slide.title.trim()
        : '';

  const splitNarration = splitTextBySentences(baseNarration);
  if (!splitNarration) {
    return null;
  }

  const [firstNarration, secondNarration] = splitNarration;
  const firstSlide: ContentSlide = {
    ...slide,
    narration: firstNarration,
  };
  const secondSlide: ContentSlide = {
    ...slide,
    narration: secondNarration,
  };

  if (Array.isArray(slide.points) && slide.points.length > 0) {
    const [leftPoints, rightPoints] = splitArrayInHalf(slide.points);
    firstSlide.points = leftPoints;
    secondSlide.points = rightPoints.length > 0 ? rightPoints : leftPoints;
  }

  if (slide.data && typeof slide.data === 'object') {
    const [leftData, rightData] = splitSlideData(
      slide.data as Record<string, unknown>
    );
    firstSlide.data = leftData;
    secondSlide.data = rightData;
  }

  return [firstSlide, secondSlide];
};

const rebalanceSlidesToMaxDuration = (
  slides: ContentSlide[],
  soundtrackDuration: number
): ContentSlide[] => {
  let balancedSlides = [...slides];
  const totalFrames = Math.max(1, Math.ceil(soundtrackDuration * FPS));

  for (let iteration = 0; iteration < MAX_SPLIT_ITERATIONS; iteration++) {
    const allocatedFrames = allocateSlideFrames(balancedSlides, totalFrames);
    const overLimitIndex = allocatedFrames.findIndex(
      (frames) => frames > MAX_SLIDE_DURATION_FRAMES
    );

    if (overLimitIndex === -1) {
      return balancedSlides;
    }

    const splitSlides = splitContentSlide(balancedSlides[overLimitIndex]);
    if (!splitSlides) {
      return balancedSlides;
    }

    balancedSlides = [
      ...balancedSlides.slice(0, overLimitIndex),
      ...splitSlides,
      ...balancedSlides.slice(overLimitIndex + 1),
    ];
  }

  return balancedSlides;
};

const toRelativeSoundtrackPath = (soundtrackFile: string): string => {
  const normalized = soundtrackFile.replace(/\\/g, '/');
  const publicPrefix = 'public/';

  if (normalized.startsWith(publicPrefix)) {
    return normalized.slice(publicPrefix.length);
  }

  return normalized;
};

const buildTimedContent = ({
  content,
  soundtrackDuration,
  voiceId,
  narration,
  soundtrackPath,
}: {
  content: ContentFile;
  soundtrackDuration: number;
  voiceId?: string;
  narration: string;
  soundtrackPath: string;
}): ContentFile => {
  const balancedSlides = rebalanceSlidesToMaxDuration(
    content.slides,
    soundtrackDuration
  );
  const totalFrames = Math.max(1, Math.ceil(soundtrackDuration * FPS));
  const allocatedFrames = allocateSlideFrames(balancedSlides, totalFrames);

  let frameCursor = 0;
  const slides = balancedSlides.map((slide, index) => {
    const durationInFrames = allocatedFrames[index];
    const audioStart = frameCursor / FPS;
    frameCursor += durationInFrames;
    const audioEnd = frameCursor / FPS;

    return {
      ...slide,
      audioDuration: durationInFrames / FPS,
      durationInFrames,
      audioStart,
      audioEnd,
    };
  });

  return {
    ...content,
    meta: {
      ...content.meta,
      voiceId: voiceId || getContentVoiceId(content),
      fullNarration: narration,
      soundtrackPath,
      soundtrackDuration,
    },
    slides,
  };
};

export async function generateNarrationTrack(
  options: NarrationGenerationOptions
): Promise<NarrationGenerationResult> {
  const {
    text,
    voiceId,
    speechRate,
    outputFile = join('public', 'audio', DEFAULT_SOUNDTRACK_FILE),
    apiKey,
  } = options;

  if (!text.trim()) {
    throw new Error('Narration text is empty.');
  }

  const outputDir = dirname(outputFile);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const tts = createTTSService({
    apiKey,
    defaultVoiceId: voiceId,
    defaultSpeechRate: speechRate,
  });

  const result = await tts.synthesize(text.trim(), voiceId, speechRate);
  copyFileSync(result.audioPath, outputFile);

  const metadata = await parseFile(outputFile);
  const duration = metadata.format.duration || result.duration;

  return {
    audioPath: outputFile,
    duration,
    voiceId,
  };
}

export async function syncTimelineToSoundtrack(
  options: SyncTimelineOptions
): Promise<AudioGenerationResult> {
  const {
    contentFile,
    soundtrackFile = join('public', 'audio', DEFAULT_SOUNDTRACK_FILE),
    soundtrackPath = toRelativeSoundtrackPath(soundtrackFile),
    soundtrackDuration,
    voiceId,
    fullNarration,
  } = options;

  const content = parseContentFile(contentFile);
  const metadata = await parseFile(soundtrackFile);
  const resolvedDuration =
    soundtrackDuration || metadata.format.duration || content.meta.soundtrackDuration;

  if (!resolvedDuration) {
    throw new Error('Unable to determine soundtrack duration.');
  }

  const narration = fullNarration || getFullNarration(content);
  const updatedContent = buildTimedContent({
    content,
    soundtrackDuration: resolvedDuration,
    voiceId,
    narration,
    soundtrackPath,
  });

  writeFileSync(contentFile, JSON.stringify(updatedContent, null, 2));

  return {
    content: updatedContent,
    outputDir: dirname(soundtrackFile),
    soundtrackPath,
    soundtrackDuration: resolvedDuration,
  };
}

export async function generateAudio(
  options: GenerateAudioOptions
): Promise<AudioGenerationResult> {
  const {
    contentFile,
    voiceId,
    speechRate,
    outputDir = 'public/audio',
    apiKey,
  } = options;
  const content = parseContentFile(contentFile);
  const narration = getFullNarration(content);
  const soundtrackOutputPath = join(outputDir, DEFAULT_SOUNDTRACK_FILE);

  console.log(`Generating full narration audio for ${content.slides.length} slides...`);
  const narrationResult = await generateNarrationTrack({
    text: narration,
    voiceId: voiceId || getContentVoiceId(content),
    speechRate,
    outputFile: soundtrackOutputPath,
    apiKey,
  });

  return syncTimelineToSoundtrack({
    contentFile,
    soundtrackFile: narrationResult.audioPath,
    soundtrackPath: `audio/${DEFAULT_SOUNDTRACK_FILE}`,
    soundtrackDuration: narrationResult.duration,
    voiceId: voiceId || getContentVoiceId(content),
    fullNarration: narration,
  });
}
