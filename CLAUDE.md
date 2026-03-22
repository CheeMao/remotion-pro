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

# CLI: Generate video from content file (TTS + render)
npm run generate -- <content.json> [--template SlideShow] [--voice voice-id] [-o out/video.mp4]

# CLI: Generate audio only
npm run generate:audio -- <content.json> [-v voice-id]

# CLI: Generate single narration track
npx tsx src/cli/index.ts narrate <text-file> [-v voice-id] [-o public/audio/narration.mp3]

# CLI: Sync timeline to existing narration
npx tsx src/cli/index.ts timeline <content.json> -s public/audio/narration.mp3

# CLI: Render video from existing content
npx tsx src/cli/index.ts render <content.json> [-o out/video.mp4]

# CLI: Voice cloning
npm run clone-voice -- <audio-url> <prefix>

# Tauri desktop app
npm run tauri:dev
npm run tauri:build
```

## Architecture

### Video Generation Pipeline

1. **Content file** (`public/content/slides.json` or custom path) → defines slides, narration text, template
2. **TTS** (DashScope CosyVoice) → generates narration soundtrack with timing
3. **Timeline sync** → calculates frame durations from audio
4. **Remotion render** → outputs MP4

### Key Directories

```
src/
├── Root.tsx              # All video compositions (appears in Remotion Studio)
├── cli/                  # Command-line tools for video generation
│   ├── index.ts          # CLI entry point
│   ├── workflow.ts       # High-level workflow functions
│   ├── generate-audio.ts # TTS and timeline sync
│   └── render-video.ts   # Remotion rendering
├── tts/                  # Text-to-speech service
│   ├── index.ts          # TTSService class
│   ├── cosyvoice.ts      # DashScope CosyVoice client
│   └── voice-clone.ts    # Custom voice creation
├── templates/            # Shared template types and DynamicSlideShow
├── hooks/                # useContentJson, useSlidesFromJson
└── <Template>Show/      # Individual template directories

app/                      # Tauri desktop app (React + Vite)
├── src/pages/            # Home, Editor, Settings
└── src/stores/           # Pinia state management

src-tauri/                # Rust backend for Tauri app
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
| FrostedShow | Frosted glass | `src/FrostedShow/index.tsx` |
| DynamicSlideShow | Dynamic timing | `src/templates/DynamicSlideShow/index.tsx` |

### Content File Format

```json
{
  "meta": {
    "title": "Video title",
    "template": "SlideShow",
    "voiceId": "cosyvoice-voice-id",
    "soundtrackPath": "audio/narration.mp3"
  },
  "slides": [
    {
      "title": "Slide title",
      "subtitle": "Optional subtitle",
      "points": ["Point 1", "Point 2"],
      "narration": "Text to speak",
      "durationInFrames": 150
    }
  ]
}
```

### Dynamic vs Static Templates

- **Static templates** (SlideShow, GlassShow, etc.): Fixed duration per slide, content hardcoded in `index.tsx`
- **DynamicSlideShow**: Duration calculated from narration audio timing, content loaded from `public/content/slides.json`
- **GeneratedVideo**: Special composition that loads content dynamically and supports all templates via `template` prop

### TTS Integration

The project uses DashScope CosyVoice for text-to-speech:

```typescript
import { createTTSService } from './tts';

const tts = createTTSService(); // Uses DASHSCOPE_API_KEY env var
const result = await tts.synthesize("Hello world", "voice-id");
// result.audioPath, result.duration
```

## Configuration

- `remotion.config.ts` - Remotion configuration
- `tsconfig.json` - TypeScript config (excludes remotion.config.ts)
- `eslint.config.mjs` - Uses `@remotion/eslint-config-flat`
- `DASHSCOPE_API_KEY` - Environment variable for TTS service