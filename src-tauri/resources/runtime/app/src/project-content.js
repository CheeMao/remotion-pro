"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStaticContentPath = exports.getTemplateSoundtrackPath = exports.getTemplateContentPath = void 0;
const getTemplateContentPath = (template) => {
    return `projects/${template}/content.json`;
};
exports.getTemplateContentPath = getTemplateContentPath;
const getTemplateSoundtrackPath = (template) => {
    return `projects/${template}/audio/narration.mp3`;
};
exports.getTemplateSoundtrackPath = getTemplateSoundtrackPath;
const toStaticContentPath = (path) => {
    return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^public\//, '');
};
exports.toStaticContentPath = toStaticContentPath;
