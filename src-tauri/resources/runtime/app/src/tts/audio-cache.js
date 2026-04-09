"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioCache = void 0;
// 音频缓存管理
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const DEFAULT_CACHE_DIR = 'audio-cache';
class AudioCache {
    constructor(baseDir) {
        this.cacheDir = (0, path_1.join)(baseDir || process.cwd(), DEFAULT_CACHE_DIR);
        if (!(0, fs_1.existsSync)(this.cacheDir)) {
            (0, fs_1.mkdirSync)(this.cacheDir, { recursive: true });
        }
    }
    /**
     * 生成缓存键
     */
    getCacheKey(text, voiceId, speechRate) {
        return (0, crypto_1.createHash)('md5')
            .update(`${text}:${voiceId}:${speechRate !== null && speechRate !== void 0 ? speechRate : 'default'}`)
            .digest('hex');
    }
    /**
     * 检查缓存
     */
    get(text, voiceId, speechRate) {
        const key = this.getCacheKey(text, voiceId, speechRate);
        const metaPath = (0, path_1.join)(this.cacheDir, `${key}.json`);
        const audioPath = (0, path_1.join)(this.cacheDir, `${key}.mp3`);
        if ((0, fs_1.existsSync)(metaPath) && (0, fs_1.existsSync)(audioPath)) {
            const meta = JSON.parse((0, fs_1.readFileSync)(metaPath, 'utf-8'));
            return {
                ...meta,
                audioPath,
            };
        }
        return null;
    }
    /**
     * 保存缓存（支持时间戳）
     */
    set(text, voiceId, audioPathOrBuffer, duration, speechRate, timestamps) {
        const key = this.getCacheKey(text, voiceId, speechRate);
        const metaPath = (0, path_1.join)(this.cacheDir, `${key}.json`);
        const audioPath = typeof audioPathOrBuffer === 'string'
            ? audioPathOrBuffer
            : (0, path_1.join)(this.cacheDir, `${key}.mp3`);
        // 如果是Buffer，保存音频
        if (Buffer.isBuffer(audioPathOrBuffer)) {
            (0, fs_1.writeFileSync)(audioPath, audioPathOrBuffer);
        }
        // 估算时长（如果没有提供）
        const estimatedDuration = duration !== null && duration !== void 0 ? duration : this.estimateDuration(text);
        // 保存元数据
        const entry = {
            text,
            voiceId,
            speechRate,
            audioPath,
            duration: estimatedDuration,
            timestamps,
            createdAt: new Date().toISOString(),
        };
        (0, fs_1.writeFileSync)(metaPath, JSON.stringify(entry, null, 2));
        // 同时保存时间戳到独立文件
        if (timestamps) {
            const timestampPath = audioPath.replace('.mp3', '_timestamps.json');
            (0, fs_1.writeFileSync)(timestampPath, JSON.stringify({ timestamps, duration: estimatedDuration }, null, 2), 'utf-8');
        }
        return entry;
    }
    /**
     * 估算音频时长（基于文本长度）
     * 假设平均语速约 4 字符/秒
     */
    estimateDuration(text) {
        return Math.max(1, text.length / 4);
    }
    /**
     * 清除所有缓存
     */
    clear() {
        const files = (0, fs_1.readdirSync)(this.cacheDir);
        for (const file of files) {
            (0, fs_1.unlinkSync)((0, path_1.join)(this.cacheDir, file));
        }
    }
    /**
     * 获取缓存目录路径
     */
    getCacheDir() {
        return this.cacheDir;
    }
}
exports.AudioCache = AudioCache;
