import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { getSlideTiming, getStaticAssetPath } from '../hooks/useContentJson';
import { SceneRenderer } from './SceneRenderer';
import type { AudioSlideData } from '../templates/types';
import { SubtitleOverlay } from './SubtitleOverlay';

interface SlideTimelineProps {
  slides: AudioSlideData[];
  defaultSlideDuration?: number;
  soundtrackPath?: string;
  template?: string;
  themeId?: string;
  preferSharedLayout?: boolean;
  background?: string;
  subtitlesEnabled?: boolean;
  subtitleFont?: string;
  renderFallback?: (
    slide: AudioSlideData,
    index: number,
    durationInFrames: number
  ) => React.ReactNode;
}

const resolveAudioSrc = (soundtrackPath?: string): string | undefined => {
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  if (!soundtrackSrc) {
    return undefined;
  }

  if (
    soundtrackSrc.startsWith('data:') ||
    soundtrackSrc.startsWith('blob:') ||
    soundtrackSrc.startsWith('http://') ||
    soundtrackSrc.startsWith('https://') ||
    soundtrackSrc.startsWith('file://') ||
    soundtrackSrc.startsWith('tauri://') ||
    soundtrackSrc.startsWith('asset://') ||
    /^[A-Za-z]:[\\/]/.test(soundtrackSrc) ||
    soundtrackSrc.startsWith('\\\\') ||
    (soundtrackSrc.startsWith('/') && !soundtrackSrc.startsWith('//'))
  ) {
    return soundtrackSrc;
  }

  return staticFile(soundtrackSrc);
};

const SceneFrame: React.FC<{
  slide: AudioSlideData;
  index: number;
  totalSlides: number;
  durationInFrames: number;
  template?: string;
  themeId?: string;
  preferSharedLayout?: boolean;
  renderFallback?: (
    slide: AudioSlideData,
    index: number,
    durationInFrames: number
  ) => React.ReactNode;
}> = ({
  slide,
  index,
  totalSlides,
  durationInFrames,
  template,
  themeId,
  preferSharedLayout,
  renderFallback,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneRenderer
      slide={slide}
      template={template}
      themeId={themeId}
      preferSharedLayout={preferSharedLayout}
      frame={frame}
      fps={fps}
      index={index}
      totalSlides={totalSlides}
      durationInFrames={durationInFrames}
      fallback={renderFallback ? renderFallback(slide, index, durationInFrames) : null}
    />
  );
};

export const SlideTimeline: React.FC<SlideTimelineProps> = ({
  slides,
  defaultSlideDuration = 150,
  soundtrackPath,
  template,
  themeId,
  preferSharedLayout = false,
  background = '#050816',
  subtitlesEnabled = true,
  subtitleFont,
  renderFallback,
}) => {
  const { fps } = useVideoConfig();
  const soundtrackSrc = resolveAudioSrc(soundtrackPath);

  return (
    <AbsoluteFill style={{ background }}>
      {soundtrackSrc ? <Audio src={soundtrackSrc} /> : null}
      {subtitlesEnabled ? (
        <SubtitleOverlay
          slides={slides}
          themeId={themeId}
          template={template}
          subtitleFont={subtitleFont}
        />
      ) : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(
          slides,
          index,
          fps,
          defaultSlideDuration
        );

        return (
          <Sequence key={slide.id || index} from={from} durationInFrames={duration}>
            <SceneFrame
              slide={slide}
              index={index}
              totalSlides={slides.length}
              durationInFrames={duration}
              template={template}
              themeId={themeId}
              preferSharedLayout={preferSharedLayout}
              renderFallback={renderFallback}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
