# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Remotion-based video generation system for creating short vertical videos (9:16 aspect ratio, 1080x1920) for TikTok/Douyin. Features multiple visual templates, TTS narration via DashScope CosyVoice, and a Tauri desktop app for the editor.

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

# CLI: Voice cloning
npm run clone-voice -- <audio-url> <prefix>

# CLI: Check voice clone status
npx tsx src/cli/index.ts voice-status <voice-id>

# Tauri desktop app (requires separate npm install in app/)
npm run tauri:dev
npm run tauri:build
```

## Architecture

### Video Generation Pipeline

1. **Content file** (`public/projects/{template}/content.json`) → defines slides, narration text, template
2. **TTS** (DashScope CosyVoice WebSocket API) → generates narration soundtrack with timing
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
│   ├── cosyvoice.ts            # DashScope CosyVoice WebSocket client
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
    "voiceId": "cosyvoice-voice-id",
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
      "type": "default"
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

The project uses DashScope CosyVoice via WebSocket for text-to-speech:

```typescript
import { createTTSService } from './tts';

const tts = createTTSService(); // Uses DASHSCOPE_API_KEY env var
const result = await tts.synthesize("Hello world", "voice-id");
// result.audioPath, result.duration, result.fromCache
```

Features:
- Audio caching in `public/audio/cache.json` to avoid regenerating
- Voice cloning support (create custom voices from audio URLs)
- Speech rate control (0.5-2.0x)

### Audio Timeline System

The pipeline supports two modes:

1. **Per-slide audio**: Each slide has its own audio file, concatenated during render
2. **Single soundtrack**: One narration file with segment timing (`audioStart`/`audioEnd` per slide)

Use `narrate-timeline` to generate segmented narration, or `timeline` to sync existing audio to slides.

## Configuration

- `remotion.config.ts` - Remotion configuration (video format: jpeg, overwrite: true)
- `tsconfig.json` - TypeScript config (excludes remotion.config.ts due to module type)
- `eslint.config.mjs` - Uses `@remotion/eslint-config-flat`
- `DASHSCOPE_API_KEY` - Environment variable for TTS service (required for audio generation)

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
