export interface ThemePalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  accents: string[];
}

export interface ThemeTypography {
  fontFamily: string;
  titleSize: number;
  subtitleSize: number;
  bodySize: number;
  overlineSize: number;
  titleWeight: number;
  bodyWeight: number;
}

export interface ThemeMotion {
  damping: number;
  stiffness: number;
  staggerFrames: number;
}

export interface ThemeEffects {
  grid: boolean;
  glass: boolean;
  glow: boolean;
}

export interface ThemeDefinition {
  id: string;
  label: string;
  palette: ThemePalette;
  typography: ThemeTypography;
  motion: ThemeMotion;
  effects: ThemeEffects;
  radius: {
    panel: number;
    chip: number;
  };
}
