import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  ChartLayout,
  CompareLayout,
  CtaLayout,
  DefaultLayout,
  HighlightLayout,
  HeroLayout,
  ListLayout,
  QuoteLayout,
  StatsLayout,
  StepsLayout,
  TimelineLayout,
} from '../layouts';
import type { SharedLayoutSlide } from '../layouts';
import { renderTemplateScene } from './templateSceneRegistry';
import { getThemeDefinition } from '../themes/registry';
import { SlideMediaOverlay, slideHasRenderableMedia } from './SlideMediaOverlay';
import { SceneMotionLayer, SceneMotionShell, hasSceneMotionLayer } from './SceneMotionLayer';

interface SceneRendererProps {
  slide: SharedLayoutSlide;
  template?: string;
  themeId?: string;
  preferSharedLayout?: boolean;
  frame: number;
  fps: number;
  index: number;
  totalSlides: number;
  durationInFrames: number;
  fallback?: React.ReactNode;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  slide,
  template,
  themeId,
  preferSharedLayout = false,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
  fallback = null,
}) => {
  const theme = getThemeDefinition(themeId);

  const wrapScene = (content: React.ReactNode) => {
    const hasMedia = slideHasRenderableMedia(slide);
    const hasMotion = hasSceneMotionLayer(slide, index);

    if (!hasMedia && !hasMotion) {
      return <>{content}</>;
    }

    return (
      <AbsoluteFill>
        {hasMotion ? (
          <SceneMotionLayer
            slide={slide}
            theme={theme}
            frame={frame}
            fps={fps}
            index={index}
          />
        ) : null}
        {hasMotion ? (
          <SceneMotionShell
            slide={slide}
            theme={theme}
            frame={frame}
            fps={fps}
            index={index}
          >
            {content}
          </SceneMotionShell>
        ) : (
          content
        )}
        {hasMedia ? <SlideMediaOverlay slide={slide} frame={frame} fps={fps} /> : null}
      </AbsoluteFill>
    );
  };

  if (!preferSharedLayout) {
    const templateScene = renderTemplateScene({
      template,
      slide,
      index,
      totalSlides,
      durationInFrames,
    });

    if (templateScene) {
      return wrapScene(templateScene);
    }
  }

  const layout = slide.layout || slide.type || 'default';

  let content: React.ReactNode = fallback;

  if (layout === 'steps') {
    content = (
      <StepsLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'hero' || layout === 'cover') {
    content = (
      <HeroLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'compare') {
    content = (
      <CompareLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'highlight') {
    content = (
      <HighlightLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'list' || layout === 'cards') {
    content = (
      <ListLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'stats') {
    content = (
      <StatsLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'timeline') {
    content = (
      <TimelineLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'chart') {
    content = (
      <ChartLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'progress') {
    content = (
      <ChartLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'quote') {
    content = (
      <QuoteLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'cta') {
    content = (
      <CtaLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (layout === 'default' || !layout) {
    content = (
      <DefaultLayout
        slide={slide}
        theme={theme}
        frame={frame}
        fps={fps}
        index={index}
        totalSlides={totalSlides}
        durationInFrames={durationInFrames}
      />
    );
  }

  return wrapScene(content);
};
