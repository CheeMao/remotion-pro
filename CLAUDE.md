# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remotion-based vertical video generation system (1080x1920 @ 30fps) for short-form Chinese content. It combines:

- A **layered rendering architecture** (not "one template = one fixed page") where any template renders any layout from a unified content schema
- **VolcEngine (火山引擎) TTS** with word-level timestamps for element-synced animation
- A **Tauri v2 desktop app** (`app/`) that drives the CLI and previews renders via `@remotion/player`
- A packaged Remotion runtime (`src-tauri/resources/runtime`) that mirrors `src/` for the shipped desktop app (generated at build time by `prepare:tauri-runtime`)

## Read First

Before changing architecture, templates, layouts, or content generation logic, read:

- `docs/IMPLEMENTATION_LOGIC.md` — current pipeline source of truth
- `docs/TEMPLATE_DEVELOPMENT_SPEC.md` — what makes a template "complete"
- `AGENTS.md` — overlapping but more concise rules; active template list lives there

## Commands

```bash
# Remotion Studio (preview, port 32123)
npm run dev

# Lint + typecheck (eslint src && tsc)
npm run lint

# Remotion bundle only
npm run build

# Direct Remotion render of a Composition
npx remotion render <CompositionId> out/video.mp4

# CLI: full pipeline (audio + timeline + render)
npm run generate -- <content.json> [-t GlassShow] [-v voice-id] [-r 1.0] [-o out/video.mp4] [--skip-audio]

# CLI: TTS only — per-slide audio from content.json
npm run generate:audio -- <content.json> [-v voice-id] [-r 1.0] [-o public/audio]

# CLI: structure plain slides → layouts + default elementTimings (in place by default)
npm run generate:structure -- <content.json> [-t GlassShow] [-o other.json]

# CLI: single narration soundtrack from a text file
npx tsx src/cli/index.ts narrate <text-file> [-v voice-id] [-o public/audio/narration.mp3]

# CLI: segmented narration timeline from a text file
npx tsx src/cli/index.ts narrate-timeline <text-file> [-v voice-id] [-o public/audio]

# CLI: sync audioStart/audioEnd to an existing soundtrack
npx tsx src/cli/index.ts timeline <content.json> -s public/audio/narration.mp3

# CLI: render only (expects content already has timing)
npx tsx src/cli/index.ts render <content.json> [-t GlassShow] [-o out/video.mp4]

# Tauri desktop app
npm run dev:app                 # Vite dev server inside app/
npm run build:app               # Build app/ only
npm run tauri:dev               # Tauri dev (uses app/ front-end)
npm run tauri:build             # Runs prepare:tauri-runtime then tauri build
npm run prepare:tauri-runtime   # Copies src/ → src-tauri/resources/runtime before packaging

# Dependency update helpers (wrap scripts/update-check.mjs and batch-update.mjs)
npm run update:check            # dry-run
npm run update:all
npm run update:remotion | update:react | update:types | update:dev | update:utils | update:batch
```

No test runner is configured — `npm run lint` (ESLint + `tsc`) is the only automated check.

## Architecture

### Rendering Pipeline

```
raw slides
  → prepareSlidesForRender()        (src/templates/autoLayout.ts — normalizes layout/type/data/timings)
  → SharedVideo                     (src/renderers/SharedVideo.tsx — top-level composition body)
  → SlideTimeline                   (src/renderers/SlideTimeline.tsx — maps audio time → frames)
  → SceneRenderer                   (src/renderers/SceneRenderer.tsx — per-slide dispatcher)
  → templateSceneRegistry           (src/renderers/templateSceneRegistry.tsx — template-owned scenes)
  → shared layouts (fallback)       (src/layouts/*Layout.tsx)
```

Key invariants:

- **Content schema is unified.** Every slide carries a `layout` (and optional `data`) from a single shared vocabulary. Templates are visual variants, not content protocols.
- **Templates render first, shared layouts are a fallback.** `templateSceneRegistry` routes `(template, layout)` to a template-owned scene; if absent, `SceneRenderer` falls back to `src/layouts/*Layout.tsx`. A template that lacks a layout will visibly "drop out of style" on that slide.
- **Themes are tokens, not identity.** `src/themes/registry.ts` is supporting data; a template is not defined by its theme alone.
- **Director mode** (`meta.generationMode === 'director'`) sets `preferSharedLayout=true`, intentionally routing through shared layouts.

### Entry Points

- `src/Root.tsx` — registers all Remotion `Composition`s, including the `GeneratedVideo` composition which dynamically loads JSON (via props, query params `?template=…&contentPath=…`, or `public/projects/current-project.json`).
- `src/index.ts` — `registerRoot(RemotionRoot)`.
- `src/cli/index.ts` — Commander CLI; delegates to `src/cli/workflow.ts`.

### Active Templates

These are the templates expected to fully implement the layout set. Keep this list and `AGENTS.md` in sync:

`GlassShow`, `LiquidShow`, `LiquidBriefShow`, `TechShow`, `KnowledgeShow`, `MacShow`, `StudioShow`, `EditorialShow`.

Note: `RichShow` exists as a directory under `src/` but is **not currently imported/registered** in `Root.tsx`. It should be treated as inactive until re-registered.

Additional compositions registered in `Root.tsx` (`InsightShow`, `CosmosShow`, `ProjectShow`, `StickShow`) are present but outside the "active templates must cover every layout" contract.

**Dimensions are per-composition.** Most are 1080×1920; `MacShow`, `StudioShow`, `EditorialShow`, `InsightShow` render 1920×1080. `getTemplateDimensions(template)` in `src/templates/templateSpecs.ts` is authoritative — use it (never hardcode) when sizing the `GeneratedVideo` composition.

### Required Layout Set

Every active template must implement scenes for:

`hero`, `default`, `steps`, `compare`, `stats`, `quote`, `list`, `chart`, `timeline`, `highlight`, `cta`.

Missing any causes silent fallback to `src/layouts/*Layout.tsx` and visible style drift.

### Template UI Rules

Do **not** add filler: template-name badges, decorative placeholder sentences, "system"-flavored dummy labels, or any copy that doesn't carry user content. Page numbers, step counters, progress indicators, and meaningful structural labels are allowed.

### Content File Format

Content lives at `public/projects/{template}/content.json`. Runtime selection reads `public/projects/current-project.json` (`{ template, contentPath }`).

```jsonc
{
  "meta": {
    "title": "Video title",
    "template": "GlassShow",
    "voiceId": "zh_female_shuangkuaisisi_moon_bigtts",
    "soundtrackPath": "audio/narration.mp3",
    "soundtrackDuration": 45.2,
    "generationMode": "standard"         // or "director" to prefer shared layouts
  },
  "slides": [
    {
      "title": "…", "subtitle": "…", "points": ["…"],
      "narration": "Text spoken for this slide",
      "layout": "stats",                 // one of the required layout set
      "data": { /* layout-specific */ },
      "durationInFrames": 150,
      "audioStart": 0.0, "audioEnd": 5.0,
      "elementTimings": [
        { "id": "stat-0", "type": "stat", "cue": "100万用户",
          "audioStart": 0.5, "audioEnd": 2.0,
          "entryDelay": 0, "entryDuration": 0.4 }
      ]
    }
  ]
}
```

`prepareSlidesForRender` in `src/templates/autoLayout.ts` normalizes legacy `type` aliases (e.g. `cover → hero`, `cards → list`) and fills default `elementTimings`.

### Audio Timeline Modes

1. **Single soundtrack** — one narration file; each slide has `audioStart`/`audioEnd`. Produced by `narrate` or `narrate-timeline`; synced onto an existing file with `timeline`.
2. **Per-slide audio** — each slide renders with its own audio segment, concatenated at render.

### TTS (VolcEngine / 火山引擎)

`src/tts/` wraps VolcEngine OpenSpeech HTTP with word-level timestamps and a file-based cache.

```ts
import { createTTSService } from './tts';
const tts = createTTSService();                   // uses env vars below
const r = await tts.synthesize('你好世界', 'voice-id');
// r.audioPath, r.duration, r.timestamps, r.fromCache
```

Environment variables (required for any TTS command):

- `VOLCENGINE_APP_ID`
- `VOLCENGINE_ACCESS_KEY`
- `VOLCENGINE_RESOURCE_ID` (default `seed-tts-1.0`)

Caches live in `audio-cache/` + `audio-cache-map.json` at the repo root.

### Other Environment Variables

See `.env.example` for the full list. Beyond TTS:

- `QINIU_ACCESS_KEY`, `QINIU_SECRET_KEY`, `QINIU_BUCKET`, `QINIU_DOMAIN`, `QINIU_UPLOAD_URL` — Qiniu cloud storage for audio

## Desktop App (`app/`)

Separate npm project — `cd app && npm install` on first setup. React 18 + TypeScript + Vite + Arco Design + Zustand + `@remotion/player`, driven by Tauri v2 (Rust in `src-tauri/`).

Packaging note: `npm run tauri:build` runs `scripts/prepare-tauri-runtime.js` first, which syncs `src/` into `src-tauri/resources/runtime/app/src/`. These runtime copies are generated at build time and do not exist in the repo by default. The top-level TypeScript source under `src/` is always canonical.

## Configuration

- `remotion.config.ts` — Remotion config (jpeg image format, overwrite on).
- `tsconfig.json` — excludes `remotion.config.ts` due to its module type. A separate `tsconfig.sidecar.json` covers the sidecar build.
- `eslint.config.mjs` — `@remotion/eslint-config-flat`.
- `pkg.config.json` — `@yao-pkg/pkg` config for the packaged sidecar.

## Environment Notes

- Remotion Studio default port is **32123** (not the Remotion default), configured in `npm run dev`.
