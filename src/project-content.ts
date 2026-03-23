export const getTemplateContentPath = (template: string): string => {
  return `projects/${template}/content.json`;
};

export const getTemplateSoundtrackPath = (template: string): string => {
  return `projects/${template}/audio/narration.mp3`;
};

export const toStaticContentPath = (path: string): string => {
  return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^public\//, '');
};
