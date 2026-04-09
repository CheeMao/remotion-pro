"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementProgress = exports.getTimingStartFrame = void 0;
const remotion_1 = require("remotion");
const getTimingStartFrame = (elementTimings, slideAudioStart, id, fps) => {
    if (!elementTimings || typeof slideAudioStart !== 'number') {
        return undefined;
    }
    const timing = elementTimings.find((item) => item.id === id);
    if (!timing || typeof timing.audioStart !== 'number') {
        return undefined;
    }
    const delay = typeof timing.entryDelay === 'number' ? timing.entryDelay : 0;
    return Math.max(0, (timing.audioStart - slideAudioStart + delay) * fps);
};
exports.getTimingStartFrame = getTimingStartFrame;
const getElementProgress = ({ frame, fps, elementTimings, slideAudioStart, id, fallbackStart, damping = 14, stiffness = 100, }) => {
    var _a;
    const resolvedStart = (_a = (0, exports.getTimingStartFrame)(elementTimings, slideAudioStart, id, fps)) !== null && _a !== void 0 ? _a : fallbackStart;
    return (0, remotion_1.spring)({
        frame: frame - resolvedStart,
        fps,
        config: { damping, stiffness },
    });
};
exports.getElementProgress = getElementProgress;
