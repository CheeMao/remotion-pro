import React from 'react';
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

interface SceneRendererProps {
  slide: SharedLayoutSlide;
  template?: string;
  themeId?: string;
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
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
  fallback = null,
}) => {
  const templateScene = renderTemplateScene({
    template,
    slide,
    index,
    totalSlides,
    durationInFrames,
  });

  if (templateScene) {
    return <>{templateScene}</>;
  }

  const theme = getThemeDefinition(themeId);
  const layout = slide.layout || slide.type || 'default';

  if (layout === 'steps') {
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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

  return <>{fallback}</>;
};
