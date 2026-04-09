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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.normalizeSpeechRate = exports.DEFAULT_SPEECH_RATE = exports.TTSService = exports.AudioCache = exports.calculateDurationFromTimestamps = exports.findCueInTimestamps = exports.VolcEngineTTSClient = void 0;
exports.createTTSService = createTTSService;
// TTS 服务统一入口 - 火山引擎版本
const volcengine_1 = require("./volcengine");
const audio_cache_1 = require("./audio-cache");
const types_1 = require("./types");
var volcengine_2 = require("./volcengine");
Object.defineProperty(exports, "VolcEngineTTSClient", { enumerable: true, get: function () { return volcengine_2.VolcEngineTTSClient; } });
var volcengine_3 = require("./volcengine");
Object.defineProperty(exports, "findCueInTimestamps", { enumerable: true, get: function () { return volcengine_3.findCueInTimestamps; } });
Object.defineProperty(exports, "calculateDurationFromTimestamps", { enumerable: true, get: function () { return volcengine_3.calculateDurationFromTimestamps; } });
var audio_cache_2 = require("./audio-cache");
Object.defineProperty(exports, "AudioCache", { enumerable: true, get: function () { return audio_cache_2.AudioCache; } });
__exportStar(require("./types"), exports);
class TTSService {
    constructor(options) {
        var _a;
        const config = {
            appId: options.appId || process.env.VOLCENGINE_APP_ID,
            apiKey: options.apiKey || process.env.VOLCENGINE_ACCESS_KEY,
            accessKey: options.accessKey || process.env.VOLCENGINE_ACCESS_KEY,
            resourceId: options.resourceId || process.env.VOLCENGINE_RESOURCE_ID || 'seed-tts-1.0',
            voiceId: options.defaultVoiceId,
            speechRate: options.defaultSpeechRate,
            uid: options.uid || 'default-user',
        };
        this.client = new volcengine_1.VolcEngineTTSClient(config);
        this.cache = new audio_cache_1.AudioCache(options.cacheDir);
        this.enableCache = options.enableCache !== false;
        this.defaultSpeechRate =
            (_a = (0, types_1.normalizeSpeechRate)(options.defaultSpeechRate)) !== null && _a !== void 0 ? _a : types_1.DEFAULT_SPEECH_RATE;
    }
    /**
     * 合成语音（带缓存和时间戳）
     */
    async synthesize(text, voiceId, speechRate) {
        var _a;
        const vid = voiceId || 'default';
        const rate = (_a = (0, types_1.normalizeSpeechRate)(speechRate)) !== null && _a !== void 0 ? _a : this.defaultSpeechRate;
        // 检查缓存（注意：缓存现在也存储时间戳）
        if (this.enableCache) {
            const cached = this.cache.get(text, vid, rate);
            if (cached) {
                // 尝试读取缓存的时间戳
                const timestampPath = cached.audioPath.replace('.mp3', '_timestamps.json');
                let timestamps;
                try {
                    const { readFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
                    const tsData = JSON.parse(readFileSync(timestampPath, 'utf-8'));
                    timestamps = tsData.timestamps;
                }
                catch {
                    // 时间戳文件不存在，忽略
                }
                return {
                    audioPath: cached.audioPath,
                    duration: cached.duration,
                    timestamps,
                    fromCache: true,
                };
            }
        }
        // 调用 TTS
        const result = await this.client.synthesize(text, voiceId, speechRate);
        // 保存到缓存
        if (this.enableCache) {
            this.cache.set(text, vid, result.audioPath, result.duration, rate);
            // 同时保存时间戳
            if (result.timestamps) {
                const timestampPath = result.audioPath.replace('.mp3', '_timestamps.json');
                const { writeFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
                writeFileSync(timestampPath, JSON.stringify({
                    timestamps: result.timestamps,
                    duration: result.duration,
                }, null, 2), 'utf-8');
            }
        }
        return {
            ...result,
            fromCache: false,
        };
    }
    /**
     * 获取缓存实例
     */
    getCache() {
        return this.cache;
    }
}
exports.TTSService = TTSService;
/**
 * 从环境变量创建 TTS 服务
 */
function createTTSService(options) {
    const appId = (options === null || options === void 0 ? void 0 : options.appId) || process.env.VOLCENGINE_APP_ID;
    const accessKey = (options === null || options === void 0 ? void 0 : options.apiKey) || (options === null || options === void 0 ? void 0 : options.accessKey) || process.env.VOLCENGINE_ACCESS_KEY;
    if (!appId || !accessKey) {
        throw new Error('VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY are required. Set them as environment variables or pass in options.');
    }
    return new TTSService({
        appId,
        accessKey,
        resourceId: (options === null || options === void 0 ? void 0 : options.resourceId) || process.env.VOLCENGINE_RESOURCE_ID,
        ...options,
    });
}
// 导出默认配置
var types_2 = require("./types");
Object.defineProperty(exports, "DEFAULT_SPEECH_RATE", { enumerable: true, get: function () { return types_2.DEFAULT_SPEECH_RATE; } });
Object.defineProperty(exports, "normalizeSpeechRate", { enumerable: true, get: function () { return types_2.normalizeSpeechRate; } });
