"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateDimensions = exports.getTemplateOrientation = exports.isLandscapeTemplate = exports.LANDSCAPE_DIMENSIONS = exports.PORTRAIT_DIMENSIONS = void 0;
exports.PORTRAIT_DIMENSIONS = {
    width: 1080,
    height: 1920,
};
exports.LANDSCAPE_DIMENSIONS = {
    width: 1920,
    height: 1080,
};
const LANDSCAPE_TEMPLATES = new Set(['MacShow', 'StudioShow', 'EditorialShow', 'InsightShow']);
const isLandscapeTemplate = (template) => {
    return !!template && LANDSCAPE_TEMPLATES.has(template);
};
exports.isLandscapeTemplate = isLandscapeTemplate;
const getTemplateOrientation = (template) => {
    return (0, exports.isLandscapeTemplate)(template) ? 'landscape' : 'portrait';
};
exports.getTemplateOrientation = getTemplateOrientation;
const getTemplateDimensions = (template) => {
    return (0, exports.isLandscapeTemplate)(template)
        ? exports.LANDSCAPE_DIMENSIONS
        : exports.PORTRAIT_DIMENSIONS;
};
exports.getTemplateDimensions = getTemplateDimensions;
