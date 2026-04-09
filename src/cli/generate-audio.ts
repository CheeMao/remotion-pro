import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { parseFile } from 'music-metadata';
import { createTTSService } from '../tts';
import { ContentFile, ContentSlide } from '../templates/types';
import { parseContentFile } from './parse-content';
import { calculateElementTimingsFromTimestamps } from '../templates/elementTiming';

export interface GenerateAudioOptions {
  contentFile: string;
  voiceId?: string;
  speechRate?: number;
  outputDir?: string;
  accessKey?: string;
  appId?: string;
  resourceId?: string;
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
  accessKey?: string;
  appId?: string;
  resourceId?: string;
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
}

export interface GenerateNarrationTimelineOptions {
  text: string;
  voiceId?: string;
  speechRate?: number;
  outputDir?: string;
  accessKey?: string;
  appId?: string;
  resourceId?: string;
}

export interface NarrationSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  duration: number;
  audioPath: string;
}

export interface NarrationTimelineResult {
  audioPath: string;
  duration: number;
  voiceId?: string;
  segments: NarrationSegment[];
}

const FPS = 30;
const DEFAULT_SOUNDTRACK_FILE = 'narration.mp3';

const normalizeNarrationSegment = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

const isSpeakableSegment = (text: string): boolean => {
  return /[\p{L}\p{N}]/u.test(text);
};

const getContentVoiceId = (content: ContentFile): string | undefined => {
  return content.meta.voiceId || content.meta.voice_id;
};

const getNarrationText = (slide: ContentSlide): string => {
  if (typeof slide.narration === 'string' && slide.narration.trim()) {
    return slide.narration.trim();
  }

  if (typeof slide.title === 'string' && slide.title.trim()) {
    return slide.title.trim();
  }

  return '';
};

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const clearDir = (dir: string) => {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }

  mkdirSync(dir, { recursive: true });
};

const toRelativePublicPath = (filePath: string): string => {
  if (process.env.REMOTION_FORCE_FILE_URLS === '1') {
    return resolve(filePath);
  }

  const normalized = filePath.replace(/\\/g, '/');
  const publicIndex = normalized.indexOf('/public/');
  if (publicIndex >= 0) {
    return normalized.slice(publicIndex + '/public/'.length);
  }

  return normalized.replace(/^public\//, '');
};

const getAudioDuration = async (filePath: string): Promise<number> => {
  const metadata = await parseFile(filePath);
  const duration = metadata.format.duration;
  if (!duration) {
    throw new Error(`Unable to determine audio duration: ${filePath}`);
  }

  return duration;
};

const concatenateAudioFiles = (files: string[], outputFile: string): void => {
  if (files.length === 0) {
    throw new Error('No audio files to concatenate.');
  }

  ensureDir(dirname(outputFile));

  const listFile = join(dirname(outputFile), `concat-${Date.now()}.txt`);
  const fileList = files
    .map((filePath) => resolve(filePath))
    .map((filePath) => `file '${filePath.replace(/'/g, "'\\''").replace(/\\/g, '/')}'`)
    .join('\n');

  writeFileSync(listFile, fileList, 'utf-8');

  try {
    const ffmpegBinary = process.env.FFMPEG_PATH || 'ffmpeg';
    execFileSync(
      ffmpegBinary,
      [
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
      ],
      {
        stdio: ['ignore', 'ignore', 'pipe'],
      }
    );
  } catch (error) {
    const stderr =
      error && typeof error === 'object' && 'stderr' in error
        ? Buffer.isBuffer(error.stderr)
          ? error.stderr.toString('utf-8').trim()
          : typeof error.stderr === 'string'
            ? error.stderr.trim()
            : ''
        : '';
    throw new Error(
      error instanceof Error
        ? `Failed to concatenate audio: ${
            stderr || error.message
          }`
        : 'Failed to concatenate audio.'
    );
  } finally {
    rmSync(listFile, { force: true });
  }
};

const splitNarrationIntoSegments = (text: string): string[] => {
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
    .flatMap((line) =>
      line
        .split(/(?<=[。！？!?；;：:])/)
        .map((part) => normalizeNarrationSegment(part))
        .filter((part) => part.length > 0 && isSpeakableSegment(part))
    );

  return paragraphAware.length > 0 ? paragraphAware : isSpeakableSegment(normalized) ? [normalized] : [];
};

const getFullNarration = (content: ContentFile): string => {
  if (typeof content.meta.fullNarration === 'string' && content.meta.fullNarration.trim()) {
    return content.meta.fullNarration.trim();
  }

  if (typeof content.meta.full_narration === 'string' && content.meta.full_narration.trim()) {
    return content.meta.full_narration.trim();
  }

  return content.slides.map(getNarrationText).filter(Boolean).join('\n');
};

const getSlideSegmentIds = (slide: ContentSlide): string[] => {
  const raw = (slide as ContentSlide & { segmentIds?: unknown }).segmentIds;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const resolveSegmentAudioFiles = (slide: ContentSlide, outputDir: string): string[] => {
  const segmentsDir = join(outputDir, 'segments');
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
    const segmentFile = join(segmentsDir, fileName);
    return existsSync(segmentFile) ? segmentFile : null;
  });

  return files.every((filePath): filePath is string => typeof filePath === 'string')
    ? files
    : [];
};

const buildTimedSlidesFromDurations = (
  content: ContentFile,
  durations: Array<{ duration: number; audioPath: string }>,
  voiceId: string | undefined,
  soundtrackPath: string,
  soundtrackDuration: number
): ContentFile => {
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

export async function generateNarrationTrack(
  options: NarrationGenerationOptions
): Promise<NarrationGenerationResult> {
  const {
    text,
    voiceId,
    speechRate,
    outputFile = join('public', 'audio', DEFAULT_SOUNDTRACK_FILE),
    accessKey,
    appId,
    resourceId,
  } = options;

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Narration text is empty.');
  }
  if (!isSpeakableSegment(trimmed)) {
    throw new Error('Narration text must contain letters or numbers.');
  }

  ensureDir(dirname(outputFile));

  const tts = createTTSService({
    accessKey,
    appId,
    resourceId,
    defaultVoiceId: voiceId,
    defaultSpeechRate: speechRate,
  });

  const result = await tts.synthesize(trimmed, voiceId, speechRate);
  writeFileSync(outputFile, readFileSync(result.audioPath));

  const duration = await getAudioDuration(outputFile);

  return {
    audioPath: outputFile,
    duration,
    voiceId,
  };
}

export async function generateNarrationTimeline(
  options: GenerateNarrationTimelineOptions
): Promise<NarrationTimelineResult> {
  const {
    text,
    voiceId,
    speechRate,
    outputDir = join('public', 'audio'),
    accessKey,
    appId,
    resourceId,
  } = options;

  const segmentsText = splitNarrationIntoSegments(text);
  if (segmentsText.length === 0) {
    throw new Error('Narration text is empty.');
  }

  ensureDir(outputDir);
  const segmentsDir = join(outputDir, 'segments');
  clearDir(segmentsDir);

  const tts = createTTSService({
    accessKey,
    appId,
    resourceId,
    defaultVoiceId: voiceId,
    defaultSpeechRate: speechRate,
  });

  const files: string[] = [];
  const segments: NarrationSegment[] = [];
  let cursor = 0;

  for (let index = 0; index < segmentsText.length; index += 1) {
    const segmentText = normalizeNarrationSegment(segmentsText[index]);
    if (!segmentText || !isSpeakableSegment(segmentText)) {
      continue;
    }

    let result;
    try {
      result = await tts.synthesize(segmentText, voiceId, speechRate);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Narration segment ${index + 1} failed TTS synthesis: ${reason}. Segment text: "${segmentText}"`
      );
    }
    const outputFile = join(segmentsDir, `segment-${String(index + 1).padStart(3, '0')}.mp3`);
    writeFileSync(outputFile, readFileSync(result.audioPath));
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

  const soundtrackFile = join(outputDir, DEFAULT_SOUNDTRACK_FILE);
  concatenateAudioFiles(files, soundtrackFile);
  const duration = await getAudioDuration(soundtrackFile);

  return {
    audioPath: soundtrackFile,
    duration,
    voiceId,
    segments,
  };
}

export async function syncTimelineToSoundtrack(
  options: SyncTimelineOptions
): Promise<AudioGenerationResult> {
  const {
    contentFile,
    soundtrackFile = join('public', 'audio', DEFAULT_SOUNDTRACK_FILE),
    soundtrackPath = toRelativePublicPath(soundtrackFile),
    soundtrackDuration,
    voiceId,
  } = options;

  const content = parseContentFile(contentFile);
  const resolvedDuration = soundtrackDuration || (await getAudioDuration(soundtrackFile));
  const slides = content.slides;

  if (slides.length === 0) {
    throw new Error('Content has no slides.');
  }

  const perSlideDuration = resolvedDuration / slides.length;
  const updated = buildTimedSlidesFromDurations(
    content,
    slides.map(() => ({
      duration: perSlideDuration,
      audioPath: soundtrackPath,
    })),
    voiceId,
    soundtrackPath,
    resolvedDuration
  );

  writeFileSync(contentFile, JSON.stringify(updated, null, 2));

  return {
    content: updated,
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
    accessKey,
    appId,
    resourceId,
  } = options;

  const content = parseContentFile(contentFile);
  const resolvedVoiceId = voiceId || getContentVoiceId(content);
  const slidesDir = join(outputDir, 'slides');
  clearDir(slidesDir);

  const tts = createTTSService({
    accessKey,
    appId,
    resourceId,
    defaultVoiceId: resolvedVoiceId,
    defaultSpeechRate: speechRate,
  });

  const durations: Array<{ duration: number; audioPath: string }> = [];
  const files: string[] = [];
  const slideTimestamps: Array<{ slideIndex: number; timestamps?: import('../tts/types').WordTimestamp[] }> = [];

  for (let index = 0; index < content.slides.length; index += 1) {
    const slide = content.slides[index];
    const outputFile = join(slidesDir, `slide-${String(index + 1).padStart(3, '0')}.mp3`);
    const segmentFiles = resolveSegmentAudioFiles(slide, outputDir);

    if (segmentFiles.length > 0) {
      concatenateAudioFiles(segmentFiles, outputFile);
    } else {
      const text = getNarrationText(slide);
      if (!text) {
        throw new Error(`Slide ${index + 1} has no narration text.`);
      }

      const result = await tts.synthesize(text, resolvedVoiceId, speechRate);
      writeFileSync(outputFile, readFileSync(result.audioPath));

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

  const soundtrackFile = join(outputDir, DEFAULT_SOUNDTRACK_FILE);
  concatenateAudioFiles(files, soundtrackFile);
  const soundtrackDuration = await getAudioDuration(soundtrackFile);
  const soundtrackPath = toRelativePublicPath(soundtrackFile);

  // 构建基础更新后的content
  let updated = buildTimedSlidesFromDurations(
    content,
    durations,
    resolvedVoiceId,
    soundtrackPath,
    soundtrackDuration
  );

  // 如果有时间戳，计算每个slide的元素级时间戳
  if (slideTimestamps.length > 0) {
    let currentTime = 0;
    const slidesWithTimings = updated.slides.map((slide, index) => {
      const slideStartTime = currentTime;
      const slideDuration = slide.audioDuration || durations[index]?.duration || 5;
      currentTime += slideDuration;

      const timestampData = slideTimestamps.find((st) => st.slideIndex === index);
      if (timestampData?.timestamps) {
        const elementTimings = calculateElementTimingsFromTimestamps(
          slide,
          slideStartTime,
          timestampData.timestamps
        );
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

  writeFileSync(contentFile, JSON.stringify(updated, null, 2));

  return {
    content: updated,
    outputDir,
    soundtrackPath,
    soundtrackDuration,
  };
}
