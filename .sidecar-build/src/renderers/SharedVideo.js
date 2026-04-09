"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedVideo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SlideTimeline_1 = require("./SlideTimeline");
const registry_1 = require("../themes/registry");
const SharedVideo = ({ slides, template, soundtrackPath, defaultSlideDuration = 150, subtitlesEnabled = true, }) => {
    const themeId = (0, registry_1.getThemeIdForTemplate)(template);
    const theme = (0, registry_1.getThemeDefinition)(themeId);
    return ((0, jsx_runtime_1.jsx)(SlideTimeline_1.SlideTimeline, { slides: slides, soundtrackPath: soundtrackPath, defaultSlideDuration: defaultSlideDuration, template: template, themeId: themeId, background: theme.palette.background, subtitlesEnabled: subtitlesEnabled }));
};
exports.SharedVideo = SharedVideo;
