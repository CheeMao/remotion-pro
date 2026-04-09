import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { getThemeDefinition, getThemeIdForTemplate } from '../themes/registry';
import { buildCaptionSegments } from './captions';

interface SubtitleOverlayProps {
  slides: ReadonlyArray<object>;
  themeId?: string;
  template?: string;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  slides,
  themeId,
  template,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;
  const captions = buildCaptionSegments(slides);
  const activeCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime < caption.end
  );

  if (!activeCaption) {
    return null;
  }

  const localFrame = Math.max(0, Math.round((currentTime - activeCaption.start) * fps));
  const activeDurationInFrames = Math.max(
    1,
    Math.round((activeCaption.end - activeCaption.start) * fps)
  );
  const resolvedThemeId = themeId || getThemeIdForTemplate(template);
  const theme = getThemeDefinition(resolvedThemeId);
  const isPortrait = height >= width;
  const safeBottomPadding = isPortrait ? Math.max(92, height * 0.058) : Math.max(54, height * 0.05);
  const horizontalPadding = isPortrait ? Math.max(36, width * 0.055) : Math.max(60, width * 0.1);
  const fontSize = isPortrait
    ? Math.max(36, Math.min(50, width * 0.037))
    : Math.max(30, Math.min(42, height * 0.05));
  const intro = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 170 },
  });
  const outroStart = Math.max(0, activeDurationInFrames - Math.round(fps * 0.18));
  const outro = interpolate(localFrame, [outroStart, activeDurationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(1, intro) * outro;
  const translateY = interpolate(intro, [0, 1], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        pointerEvents: 'none',
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        paddingBottom: safeBottomPadding,
      }}
    >
      <div
        style={{
          maxWidth: isPortrait ? width * 0.92 : width * 0.78,
          color: '#ffffff',
          fontFamily: theme.typography.fontFamily,
          fontSize,
          fontWeight: 900,
          lineHeight: 1.24,
          letterSpacing: '0.01em',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          opacity,
          transform: `translateY(${translateY}px)`,
          textShadow: '4px -4px 5px rgba(0, 0, 0, 0.8)',
        }}
      >
        {activeCaption.text}
      </div>
    </AbsoluteFill>
  );
};
