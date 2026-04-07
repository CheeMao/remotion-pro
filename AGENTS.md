# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Project Overview

This is a Remotion-based vertical video system for short-form content. The project now uses a layered rendering architecture instead of the old "one template = one fixed page structure" model.

## Read First

Before changing architecture, templates, or AI generation logic, read:

- `docs/IMPLEMENTATION_LOGIC.md`
- `docs/TEMPLATE_DEVELOPMENT_SPEC.md`

These two files are the current source of truth.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npx remotion render <CompositionId> out/video.mp4
```

Desktop app:

```bash
cd app
npm run build
```

## Current Architecture

Core pipeline:

`raw slides -> prepareSlidesForRender() -> unified layout/type/data -> templateSceneRegistry -> SceneRenderer -> SlideTimeline`

Important ideas:

- Content schema is unified
- Layout set is shared platform capability
- Templates should support the full layout set
- Template scenes render first
- Shared layouts are fallback only
- Theme tokens are support data, not the full template identity

Main entry files:

- `src/index.ts`
- `src/Root.tsx`
- `src/templates/autoLayout.ts`
- `src/renderers/SharedVideo.tsx`
- `src/renderers/SlideTimeline.tsx`
- `src/renderers/SceneRenderer.tsx`
- `src/renderers/templateSceneRegistry.tsx`
- `src/themes/registry.ts`

## Current Templates

Only these templates should be treated as active:

- `GlassShow`
- `LiquidShow`
- `LiquidBriefShow`
- `TechShow`
- `RichShow`
- `KnowledgeShow`
- `MacShow`
- `StudioShow`
- `EditorialShow`

## Required Layout Set

Every active template should support:

- `hero`
- `default`
- `steps`
- `compare`
- `stats`
- `quote`
- `list`
- `chart`
- `timeline`
- `highlight`
- `cta`

If a template does not support one of these layouts, rendering may fall back to the shared layout layer and create visual inconsistency.

## Content Expectations

Content is data-driven. AI and code should aim for slides that normalize into this shape:

```ts
{
  title?: string;
  subtitle?: string;
  points?: string[];
  narration?: string;
  layout: 'hero' | 'default' | 'steps' | 'compare' | 'stats' | 'quote' | 'list' | 'chart' | 'timeline' | 'highlight' | 'cta';
  data?: Record<string, unknown>;
  elementTimings?: unknown[];
}
```

Do not treat templates as separate incompatible content protocols.

## Template UI Rules

Do not add meaningless static filler text such as:

- template name badges
- system-flavored dummy labels
- explanatory placeholder sentences
- decorative copy that does not carry user content

Allowed fixed UI elements include:

- page numbers
- step numbers
- progress indicators
- meaningful structural labels

## Remotion Concepts

- `AbsoluteFill`
- `Sequence`
- `useCurrentFrame()`
- `useVideoConfig()`
- `spring()`
- `interpolate()`

## Configuration

- `remotion.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
