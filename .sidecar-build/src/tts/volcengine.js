"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolcEngineTTSClient = void 0;
exports.calculateDurationFromTimestamps = calculateDurationFromTimestamps;
exports.findCueInTimestamps = findCueInTimestamps;
const fs_1 = require("fs");
const path_1 = require("path");
const VOLCENGINE_TTS_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const normalizeResponseLine = (line) => {
    const trimmed = line.trim();
    return trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
};
const parseVolcEngineStreamResponse = (payload) => {
    const trimmedPayload = payload.trim();
    if (!trimmedPayload) {
        throw new Error('VolcEngine returned an empty response.');
    }
    const lines = trimmedPayload
        .split(/\r?\n/)
        .map(normalizeResponseLine)
        .filter(Boolean);
    const audioChunks = [];
    const timestamps = [];
    let duration = 0;
    let upstreamError = null;
    for (const line of lines) {
        let data;
        try {
            data = JSON.parse(line);
        }
        catch {
            continue;
        }
        const code = typeof data.code === 'number'
            ? data.code
            : typeof data.code === 'string'
                ? Number(data.code)
                : 0;
        if (code === 0 && typeof data.data === 'string' && data.data.length > 0) {
            audioChunks.push(Buffer.from(data.data, 'base64'));
            continue;
        }
        const sentence = data.sentence && typeof data.sentence === 'object'
            ? data.sentence
            : null;
        if (code === 0 && Array.isArray(sentence === null || sentence === void 0 ? void 0 : sentence.words)) {
            for (const word of sentence.words) {
                if (!word || typeof word !== 'object') {
                    continue;
                }
                const normalizedWord = word;
                const timestamp = {
                    word: typeof normalizedWord.word === 'string' ? normalizedWord.word : '',
                    startTime: typeof normalizedWord.startTime === 'number' ? normalizedWord.startTime : 0,
                    endTime: typeof normalizedWord.endTime === 'number' ? normalizedWord.endTime : 0,
                    confidence: typeof normalizedWord.confidence === 'number' ? normalizedWord.confidence : 1,
                };
                timestamps.push(timestamp);
                duration = Math.max(duration, timestamp.endTime);
            }
            continue;
        }
        if (code === 20000000) {
            break;
        }
        if (code > 0) {
            upstreamError = data;
            break;
        }
    }
    if (audioChunks.length === 0) {
        if (upstreamError !== null) {
            throw new Error(`No audio data received. Upstream error: ${JSON.stringify(upstreamError)}`);
        }
        throw new Error(`No audio data received. Raw response: ${trimmedPayload.slice(0, 500)}`);
    }
    return {
        audio: Buffer.concat(audioChunks),
        duration,
        timestamps,
    };
};
class VolcEngineTTSClient {
    constructor(config) {
        this.config = {
            sampleRate: 24000,
            format: 'mp3',
            ...config,
        };
    }
    async synthesize(text, voiceId, speechRate) {
        var _a;
        const normalizedText = text.trim();
        if (!normalizedText) {
            throw new Error('Cannot synthesize empty text.');
        }
        if (!/[\u4e00-\u9fa5a-zA-Z0-9]/.test(normalizedText)) {
            throw new Error('Cannot synthesize text without letters or numbers.');
        }
        const outputPath = (0, path_1.join)(process.cwd(), 'audio-cache', `volc-${Date.now()}.mp3`);
        const dir = (0, path_1.dirname)(outputPath);
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
        const speaker = voiceId || this.config.voiceId || 'zh_female_shuangkuaisisi_moon_bigtts';
        const rate = (_a = speechRate !== null && speechRate !== void 0 ? speechRate : this.config.speechRate) !== null && _a !== void 0 ? _a : 1.0;
        const requestData = {
            user: {
                uid: this.config.uid || 'default-user',
            },
            req_params: {
                text: normalizedText,
                speaker,
                model: this.config.model,
                audio_params: {
                    format: this.config.format || 'mp3',
                    sample_rate: this.config.sampleRate || 24000,
                    speech_rate: rate,
                    enable_timestamp: true,
                },
            },
        };
        try {
            return await this.callVolcEngineApi(requestData, outputPath);
        }
        catch (error) {
            throw new Error(`VolcEngine TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async callVolcEngineApi(requestData, outputPath) {
        const appId = this.config.appId;
        const accessKey = this.config.apiKey || this.config.accessKey;
        const resourceId = this.config.resourceId || 'seed-tts-1.0';
        if (!appId || !accessKey) {
            throw new Error('VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY are required');
        }
        const response = await fetch(VOLCENGINE_TTS_URL, {
            method: 'POST',
            headers: {
                'X-Api-App-Id': appId,
                'X-Api-Access-Key': accessKey,
                'X-Api-Resource-Id': resourceId,
                'Content-Type': 'application/json',
                Connection: 'keep-alive',
            },
            body: JSON.stringify(requestData),
        });
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} - ${responseText.slice(0, 500)}`);
        }
        const result = parseVolcEngineStreamResponse(responseText);
        const { writeFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
        writeFileSync(outputPath, result.audio);
        writeFileSync(outputPath.replace('.mp3', '_timestamps.json'), JSON.stringify({
            timestamps: result.timestamps,
            duration: result.duration,
        }, null, 2), 'utf-8');
        return {
            audioPath: outputPath,
            duration: result.duration,
            timestamps: result.timestamps,
            fromCache: false,
        };
    }
    async synthesizeToFile(text, outputPath, voiceId, speechRate) {
        const result = await this.synthesize(text, voiceId, speechRate);
        if (result.audioPath !== outputPath) {
            const { copyFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
            copyFileSync(result.audioPath, outputPath);
        }
        return outputPath;
    }
}
exports.VolcEngineTTSClient = VolcEngineTTSClient;
function calculateDurationFromTimestamps(timestamps) {
    if (!timestamps || timestamps.length === 0) {
        return 0;
    }
    const lastWord = timestamps[timestamps.length - 1];
    return lastWord.endTime;
}
function findCueInTimestamps(cue, timestamps) {
    if (!cue || !timestamps || timestamps.length === 0) {
        return null;
    }
    const cueChars = cue.split('').filter((c) => /[\u4e00-\u9fa5a-zA-Z0-9]/.test(c));
    if (cueChars.length === 0) {
        return null;
    }
    for (let i = 0; i <= timestamps.length - cueChars.length; i += 1) {
        const window = timestamps.slice(i, i + cueChars.length);
        const windowText = window.map((t) => t.word).join('');
        if (windowText.includes(cue) || cue.includes(windowText)) {
            return {
                start: window[0].startTime,
                end: window[window.length - 1].endTime,
            };
        }
    }
    const cuePosition = timestamps.findIndex((t) => cue.includes(t.word) || t.word.includes(cue[0]));
    if (cuePosition >= 0) {
        const endPosition = Math.min(cuePosition + cueChars.length, timestamps.length);
        return {
            start: timestamps[cuePosition].startTime,
            end: timestamps[endPosition - 1].endTime,
        };
    }
    return null;
}
