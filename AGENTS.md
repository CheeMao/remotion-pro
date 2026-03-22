# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a Remotion video project for creating short vertical videos (9:16 aspect ratio, 1080x1920) suitable for TikTok/Douyin/Video accounts. The project contains multiple video templates with different visual styles.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Remotion Studio (preview)
npm run build      # Bundle the project
npm run lint       # Run ESLint and TypeScript checks
npx remotion render <CompositionId> out/video.mp4  # Render specific composition
npx remotion upgrade                               # Upgrade Remotion version
```

## Architecture

### Entry Points
- `src/index.ts` - Registers the root component with Remotion
- `src/Root.tsx` - Defines all video compositions (each appears in Remotion Studio sidebar)

### Template Structure

Each video template follows this pattern:

```
src/<TemplateName>/
├── index.tsx         # Entry file with content configuration (slides array)
├── <Slide>.tsx       # Individual slide component with styling/animations
└── TEMPLATE_SPEC.md  # Documentation for the template
```

### Available Templates

| Template | Style | Duration |
|----------|-------|----------|
| SlideShow | Cyberpunk tech | 750 frames (25s) |
| GlassShow | Glassmorphism | 600 frames (20s) |
| NeuShow | Neumorphism | 600 frames (20s) |
| RichShow | Rich effects | 1200 frames (40s) |
| TechShow | Tech effects | 1050 frames (35s) |

### Creating/Modifying Content

To modify video content, edit the `slides` array in the template's `index.tsx`:

```typescript
const slides = [
  {
    title: "Title text",
    subtitle: "Optional subtitle",
    points: ["Point 1", "Point 2", "Point 3"],  // Optional
  },
];
```

Each template has a `TEMPLATE_SPEC.md` with detailed documentation on content guidelines, color schemes, and animation timing.

### Remotion Key Concepts

- `AbsoluteFill` - Absolutely positioned container (like a full-screen div)
- `Sequence` - Time-shifts its children (used for slide transitions)
- `useCurrentFrame()` - Hook to get current frame number
- `useVideoConfig()` - Hook to get fps, duration, dimensions
- `spring()` - Physics-based animation helper
- `interpolate()` - Map frame ranges to values

## Configuration

- `remotion.config.ts` - Remotion configuration (video format, output settings)
- `tsconfig.json` - TypeScript config (excludes remotion.config.ts)
- `eslint.config.mjs` - Uses `@remotion/eslint-config-flat`