"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedTemplateRenderer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SharedVideo_1 = require("../renderers/SharedVideo");
const GeneratedTemplateRenderer = ({ template, slides, soundtrackPath }) => {
    return ((0, jsx_runtime_1.jsx)(SharedVideo_1.SharedVideo, { template: template, slides: slides, soundtrackPath: soundtrackPath }));
};
exports.GeneratedTemplateRenderer = GeneratedTemplateRenderer;
