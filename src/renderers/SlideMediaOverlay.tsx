import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile } from 'remotion';
import type { SharedLayoutSlide } from '../layouts';
import type { SlideMediaAsset, SlideMediaRole } from '../templates/types';

interface SlideMediaOverlayProps {
  slide: SharedLayoutSlide;
  frame: number;
  fps: number;
}

interface NormalizedSlideMedia extends SlideMediaAsset {
  role: SlideMediaRole;
  src: string;
}

const EXTERNAL_MEDIA_PATTERN = /^(https?:|data:|blob:|file:|asset:|tauri:)/i;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;

const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readFocalPoint = (value: unknown): SlideMediaAsset['focalPoint'] => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.x !== 'number' || typeof record.y !== 'number') {
    return undefined;
  }

  return { x: record.x, y: record.y };
};

const toFileUrl = (value: string): string => {
  const normalizedPath = value.replace(/\\/g, '/');
  return encodeURI(`file:///${normalizedPath}`);
};

const toStaticAssetPath = (value: string): string => {
  const withoutPublicPrefix = value.replace(/^public[\\/]/i, '');
  const normalized = withoutPublicPrefix.replace(/^\.?[\\/]/, '').replace(/\\/g, '/');
  return staticFile(normalized);
};

const resolveMediaSource = (value: string): string => {
  if (EXTERNAL_MEDIA_PATTERN.test(value)) {
    return value;
  }

  if (WINDOWS_ABSOLUTE_PATH_PATTERN.test(value)) {
    return toFileUrl(value);
  }

  return toStaticAssetPath(value);
};

const normalizeMediaInput = (
  value: unknown,
  defaultRole: SlideMediaRole,
): NormalizedSlideMedia | null => {
  if (typeof value === 'string') {
    return {
      kind: 'image',
      role: defaultRole,
      src: resolveMediaSource(value),
    };
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const rawSource =
    readString(record.url) ??
    readString(record.remoteUrl) ??
    readString(record.localPath) ??
    readString(record.path) ??
    readString(record.src);

  if (!rawSource) {
    return null;
  }

  const role = (readString(record.role) as SlideMediaRole | undefined) ?? defaultRole;

  return {
    kind: (readString(record.kind) as SlideMediaAsset['kind']) ?? 'image',
    role,
    sourceType: readString(record.sourceType) as SlideMediaAsset['sourceType'] | undefined,
    url: readString(record.url),
    remoteUrl: readString(record.remoteUrl),
    localPath: readString(record.localPath),
    path: readString(record.path),
    query: readString(record.query),
    alt: readString(record.alt),
    credit: readString(record.credit),
    focalPoint: readFocalPoint(record.focalPoint),
    src: resolveMediaSource(rawSource),
  };
};

const collectSlideMedia = (slide: SharedLayoutSlide): NormalizedSlideMedia[] => {
  const slideRecord = slide as SharedLayoutSlide & Record<string, unknown>;
  const slideData =
    slide.data && typeof slide.data === 'object'
      ? (slide.data as Record<string, unknown>)
      : {};

  const candidates: Array<{ value: unknown; role: SlideMediaRole }> = [];

  (slide.media || []).forEach((item) => {
    candidates.push({ value: item, role: item.role || 'support' });
  });

  if (Array.isArray(slideData.media)) {
    slideData.media.forEach((item) => {
      candidates.push({ value: item, role: 'support' });
    });
  }

  candidates.push(
    { value: slideRecord.backgroundImage, role: 'background' },
    { value: slideData.backgroundImage, role: 'background' },
    { value: slideRecord.coverImage, role: 'hero' },
    { value: slideData.coverImage, role: 'hero' },
    { value: slideRecord.image, role: 'hero' },
    { value: slideData.image, role: 'hero' },
  );

  const normalizedMedia: NormalizedSlideMedia[] = [];
  const seenKeys = new Set<string>();

  candidates.forEach(({ value, role }) => {
    const normalized = normalizeMediaInput(value, role);
    if (!normalized) {
      return;
    }

    const dedupeKey = `${normalized.role}:${normalized.src}`;
    if (seenKeys.has(dedupeKey)) {
      return;
    }

    seenKeys.add(dedupeKey);
    normalizedMedia.push(normalized);
  });

  return normalizedMedia;
};

const getObjectPosition = (asset: NormalizedSlideMedia | undefined): string => {
  if (!asset?.focalPoint) {
    return 'center center';
  }

  return `${asset.focalPoint.x}% ${asset.focalPoint.y}%`;
};

export const slideHasRenderableMedia = (slide: SharedLayoutSlide): boolean =>
  collectSlideMedia(slide).length > 0;

const MediaCard: React.FC<{
  asset: NormalizedSlideMedia;
  frame: number;
  fps: number;
  width: number;
  height: number;
  right: number;
  top: number;
  rotation: number;
  opacity: number;
}> = ({ asset, frame, fps, width, height, right, top, rotation, opacity }) => {
  const progress = spring({
    frame: frame - 6,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const translateY = interpolate(progress, [0, 1], [48, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.94, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        right,
        top,
        width,
        height,
        opacity,
        transform: `translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 18,
          borderRadius: 34,
          background: 'rgba(56, 189, 248, 0.18)',
          filter: 'blur(54px)',
          transform: 'scale(1.04)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 34,
          overflow: 'hidden',
          background: 'rgba(10, 14, 23, 0.82)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.36)',
        }}
      >
        <Img
          src={asset.src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: getObjectPosition(asset),
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(12,18,28,0.02) 0%, rgba(12,18,28,0.1) 58%, rgba(12,18,28,0.34) 100%)',
          }}
        />
        {asset.credit ? (
          <div
            style={{
              position: 'absolute',
              left: 18,
              right: 18,
              bottom: 16,
              fontSize: 18,
              color: 'rgba(255,255,255,0.74)',
              textShadow: '0 2px 10px rgba(0,0,0,0.28)',
            }}
          >
            {asset.credit}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const SlideMediaOverlay: React.FC<SlideMediaOverlayProps> = ({
  slide,
  frame,
  fps,
}) => {
  const assets = collectSlideMedia(slide);

  if (assets.length === 0) {
    return null;
  }

  const layout = slide.layout || slide.type || 'default';
  const backgroundAsset =
    assets.find((asset) => asset.role === 'background') ??
    assets.find((asset) => asset.role === 'hero') ??
    assets[0];
  const compareAssets = assets.filter(
    (asset) => asset.role === 'compare-left' || asset.role === 'compare-right',
  );
  const primaryAsset =
    compareAssets[0] ??
    assets.find((asset) => asset.role === 'hero') ??
    assets.find((asset) => asset.role === 'support') ??
    assets[0];
  const secondaryAsset =
    compareAssets.length > 1
      ? compareAssets[1]
      : assets.find((asset) => asset.src !== primaryAsset.src && asset.role !== 'background');

  const reveal = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 70 },
  });

  const panelOpacity = interpolate(reveal, [0, 1], [0, 0.34], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isTextHeavyLayout = ['steps', 'list', 'stats', 'timeline', 'chart'].includes(layout);
  const primaryWidth = isTextHeavyLayout ? 332 : 404;
  const primaryHeight = isTextHeavyLayout ? 500 : 620;
  const primaryTopFromViewport = isTextHeavyLayout ? 1180 : 940;
  const secondaryWidth = isTextHeavyLayout ? 236 : 260;
  const secondaryHeight = isTextHeavyLayout ? 172 : 196;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: -24,
          width: '64%',
          height: '100%',
          opacity: panelOpacity,
          overflow: 'hidden',
          maskImage:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.92) 40%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.92) 40%, black 100%)',
        }}
      >
        <Img
          src={backgroundAsset.src}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: getObjectPosition(backgroundAsset),
            filter: 'blur(18px) saturate(1.05)',
            transform: 'scale(1.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.16) 20%, rgba(2,6,23,0.42) 62%, rgba(2,6,23,0.58) 100%)',
          }}
        />
      </div>

      <MediaCard
        asset={primaryAsset}
        frame={frame}
        fps={fps}
        width={primaryWidth}
        height={primaryHeight}
        right={38}
        top={primaryTopFromViewport}
        rotation={isTextHeavyLayout ? -3 : -2}
        opacity={0.94}
      />

      {secondaryAsset ? (
        <MediaCard
          asset={secondaryAsset}
          frame={frame + 3}
          fps={fps}
          width={secondaryWidth}
          height={secondaryHeight}
          right={primaryWidth + 48}
          top={primaryTopFromViewport - 82}
          rotation={5}
          opacity={0.82}
        />
      ) : null}
    </AbsoluteFill>
  );
};
