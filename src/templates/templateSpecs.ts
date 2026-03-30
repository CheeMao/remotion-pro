export interface TemplateDimensions {
  width: number;
  height: number;
}

export const PORTRAIT_DIMENSIONS: TemplateDimensions = {
  width: 1080,
  height: 1920,
};

export const LANDSCAPE_DIMENSIONS: TemplateDimensions = {
  width: 1920,
  height: 1080,
};

const LANDSCAPE_TEMPLATES = new Set([
  'SlideShowWide',
  'GlassWideShow',
  'LiquidWideShow',
  'NeuWideShow',
]);

export const isLandscapeTemplate = (template?: string): boolean => {
  return !!template && LANDSCAPE_TEMPLATES.has(template);
};

export const getTemplateDimensions = (template?: string): TemplateDimensions => {
  return isLandscapeTemplate(template)
    ? LANDSCAPE_DIMENSIONS
    : PORTRAIT_DIMENSIONS;
};
