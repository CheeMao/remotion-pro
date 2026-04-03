# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Remotion-based video generation system for creating short vertical videos (9:16 aspect ratio, 1080x1920) for TikTok/Douyin. Features multiple visual templates, TTS narration via VolcEngine (火山引擎), and a Tauri desktop app for the editor.

## Commands

```bash
# Remotion Studio (preview)
npm run dev

# Lint and type check
npm run lint

# CLI: Full pipeline - generate audio + render video
npm run generate -- <content.json> [--template SlideShow] [--voice voice-id] [-o out/video.mp4]

# CLI: Generate audio only from content file
npm run generate:audio -- <content.json> [-v voice-id]

# CLI: Generate single narration track from text file
npx tsx src/cli/index.ts narrate <text-file> [-v voice-id] [-o public/audio/narration.mp3]

# CLI: Generate narration with segment timeline
npx tsx src/cli/index.ts narrate-timeline <text-file> [-v voice-id] [-o public/audio]

# CLI: Sync timeline to existing narration audio
npx tsx src/cli/index.ts timeline <content.json> -s public/audio/narration.mp3

# CLI: Render video from existing content (skips audio gen)
npx tsx src/cli/index.ts render <content.json> [-o out/video.mp4]

# Tauri desktop app (requires separate npm install in app/)
npm run tauri:dev
npm run tauri:build
```

## Architecture

### Video Generation Pipeline

1. **Content file** (`public/projects/{template}/content.json`) → defines slides, narration text, template
2. **TTS** (VolcEngine OpenSpeech HTTP API) → generates narration soundtrack with timing
3. **Timeline sync** → calculates frame durations from audio segments
4. **Remotion render** → outputs MP4 via Puppeteer/Chromium

### Key Directories

```
src/
├── Root.tsx                    # All video compositions (appears in Remotion Studio)
├── cli/                        # Command-line tools for video generation
│   ├── index.ts                # CLI entry point (Commander.js)
│   ├── workflow.ts             # High-level workflow functions
│   ├── generate-audio.ts       # TTS and timeline sync logic
│   ├── render-video.ts         # Remotion rendering via Node APIs
│   └── parse-content.ts        # Content file parsing helpers
├── tts/                        # Text-to-speech service
│   ├── index.ts                # TTSService class
│   ├── volcengine.ts           # VolcEngine OpenSpeech client
│   ├── voice-clone.ts          # Custom voice creation
│   ├── audio-cache.ts          # File-based audio caching
│   └── types.ts                # TTS type definitions
├── templates/                  # Shared template types and DynamicSlideShow
│   ├── types.ts                # ContentFile, ContentSlide interfaces
│   ├── DynamicSlideShow/       # Dynamic template with audio-synced timing
│   └── GeneratedTemplateRenderer.tsx  # Runtime template selector
├── hooks/                      # useContentJson, useSlidesFromJson
└── <Template>Show/             # Individual template directories (12 templates)

app/                            # Tauri desktop app (React + Vite + Zustand)
├── src/pages/                  # Home, Editor, Settings
└── src/stores/                 # Zustand state management

public/
└── projects/                   # Template content files & audio
    ├── SlideShow/content.json
    └── {template}/audio/narration.mp3

src-tauri/                      # Rust backend for Tauri app
```

### Available Templates

| Template | Style | Entry File |
|----------|-------|------------|
| SlideShow | Cyberpunk tech | `src/SlideShow/index.tsx` |
| GlassShow | Glassmorphism | `src/GlassShow/index.tsx` |
| NeuShow | Neumorphism | `src/NeuShow/index.tsx` |
| RichShow | Rich effects | `src/RichShow/index.tsx` |
| TechShow | Tech effects | `src/TechShow/index.tsx` |
| AIShow | AI theme | `src/AIShow/index.tsx` |
| NeonShow | Neon glow | `src/NeonShow/index.tsx` |
| LuxeShow | Luxury gold | `src/LuxeShow/index.tsx` |
| LiquidShow | Liquid motion | `src/LiquidShow/index.tsx` |
| LiquidBriefShow | Brief liquid | `src/LiquidBriefShow/index.tsx` |
| FrostedShow | Frosted glass | `src/FrostedShow/index.tsx` |
| KnowledgeShow | Knowledge layout | `src/KnowledgeShow/index.tsx` |

### Content File Format

```json
{
  "meta": {
    "title": "Video title",
    "template": "SlideShow",
    "voiceId": "zh_female_shuangkuaisisi_moon_bigtts",
    "soundtrackPath": "audio/narration.mp3",
    "soundtrackDuration": 45.2
  },
  "slides": [
    {
      "title": "Slide title",
      "subtitle": "Optional subtitle",
      "points": ["Point 1", "Point 2"],
      "narration": "Text to speak for this slide",
      "durationInFrames": 150,
      "audioStart": 0.0,
      "audioEnd": 5.0,
      "elementTimings": [
        {
          "id": "stat-0",
          "type": "stat",
          "cue": "100万用户",
          "audioStart": 0.5,
          "audioEnd": 2.0,
          "entryDelay": 0,
          "entryDuration": 0.4
        }
      ],
      "type": "stats"
    }
  ]
}
```

### Template System Architecture

- **Static templates** (SlideShow, GlassShow, etc.): Fixed duration, hardcoded content in their `index.tsx`
- **DynamicSlideShow**: Content loaded from JSON, durations calculated from audio timing
- **GeneratedVideo**: Special composition that loads content dynamically and renders any template via `GeneratedTemplateRenderer`

The `GeneratedVideo` composition uses query parameters (`?template=xxx&contentPath=xxx`) or props to determine what to render, enabling the CLI workflow to use a single composition for all templates.

### TTS Integration

The project uses **VolcEngine (火山引擎) TTS** via HTTP API for text-to-speech with **word-level timestamps**:

```typescript
import { createTTSService } from './tts';

const tts = createTTSService(); // Uses VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY env vars
const result = await tts.synthesize("Hello world", "voice-id");
// result.audioPath, result.duration, result.timestamps, result.fromCache
```

Features:
- **Word-level timestamps** for precise element animation synchronization
- Audio caching with timestamp persistence
- Speech rate control (0.5-2.0x)
- Supports seed-tts-1.0 resource with multiple voices

Environment variables:
```bash
VOLCENGINE_APP_ID=your_app_id
VOLCENGINE_ACCESS_KEY=your_access_key
VOLCENGINE_RESOURCE_ID=seed-tts-1.0
```

### Audio Timeline System

The pipeline supports two modes:

1. **Per-slide audio**: Each slide has its own audio file, concatenated during render
2. **Single soundtrack**: One narration file with segment timing (`audioStart`/`audioEnd` per slide)

Use `narrate-timeline` to generate segmented narration, or `timeline` to sync existing audio to slides.

## Configuration

- `remotion.config.ts` - Remotion configuration (video format: jpeg, overwrite: true)
- `tsconfig.json` - TypeScript config (excludes remotion.config.ts due to module type)
- `eslint.config.mjs` - Uses `@remotion/eslint-config-flat`
- `VOLCENGINE_APP_ID` - 火山引擎App ID (用于TTS服务)
- `VOLCENGINE_ACCESS_KEY` - 火山引擎Access Key (用于TTS服务)
- `VOLCENGINE_RESOURCE_ID` - 火山引擎Resource ID (默认: seed-tts-1.0)

## Desktop App

The Tauri app in `app/` is a separate npm project:

```bash
cd app && npm install  # First time setup
npm run dev            # Vite dev server (separate from Remotion Studio)
```

The app uses:
- React 18 + TypeScript
- Arco Design component library
- Zustand for state management
- `@remotion/player` for video preview
- Tauri v2 for native APIs
