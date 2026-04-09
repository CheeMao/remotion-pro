"use strict";
// TTS 服务类型定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSpeechRate = exports.DEFAULT_SPEECH_RATE = void 0;
exports.DEFAULT_SPEECH_RATE = 1.0;
const normalizeSpeechRate = (speechRate) => {
    if (speechRate === undefined) {
        return undefined;
    }
    if (!Number.isFinite(speechRate) || speechRate < 0.5 || speechRate > 2.0) {
        throw new Error('Speech rate must be a number between 0.5 and 2.0.');
    }
    return speechRate;
};
exports.normalizeSpeechRate = normalizeSpeechRate;
