"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBTITLE_READING_TIME = exports.TITLE_READING_TIME = exports.MIN_ELEMENT_DURATION = exports.DEFAULT_CHARS_PER_SECOND = void 0;
exports.countChineseChars = countChineseChars;
exports.estimateReadingTime = estimateReadingTime;
exports.calculateElementTimings = calculateElementTimings;
exports.calculateElementTimingsFromTimestamps = calculateElementTimingsFromTimestamps;
exports.calculateAllElementTimings = calculateAllElementTimings;
exports.applyElementTimings = applyElementTimings;
exports.adjustElementTiming = adjustElementTiming;
exports.validateTimings = validateTimings;
/**
 * 默认中文语速（字/秒）
 * 正常说话速度约 4-5 字/秒
 * 视频配音通常稍快，约 5-6 字/秒
 */
exports.DEFAULT_CHARS_PER_SECOND = 5.5;
/**
 * 最小元素时长（秒）
 * 确保每个元素至少有足够的时间展示
 */
exports.MIN_ELEMENT_DURATION = 0.8;
/**
 * 标题朗读时长估算（秒）
 */
exports.TITLE_READING_TIME = 1.2;
/**
 * 副标题朗读时长估算（秒）
 */
exports.SUBTITLE_READING_TIME = 0.8;
function findCueInTimestamps(cue, timestamps) {
    if (!cue || !timestamps || timestamps.length === 0) {
        return null;
    }
    const cueChars = cue.split('').filter((char) => /[\u4e00-\u9fa5a-zA-Z0-9]/.test(char));
    if (cueChars.length === 0) {
        return null;
    }
    for (let index = 0; index <= timestamps.length - cueChars.length; index++) {
        const window = timestamps.slice(index, index + cueChars.length);
        const windowText = window.map((timestamp) => timestamp.word).join('');
        if (windowText.includes(cue) || cue.includes(windowText)) {
            return {
                start: window[0].startTime,
                end: window[window.length - 1].endTime,
            };
        }
    }
    const cuePosition = timestamps.findIndex((timestamp) => cue.includes(timestamp.word) || timestamp.word.includes(cue[0]));
    if (cuePosition >= 0) {
        const endPosition = Math.min(cuePosition + cueChars.length, timestamps.length);
        return {
            start: timestamps[cuePosition].startTime,
            end: timestamps[endPosition - 1].endTime,
        };
    }
    return null;
}
/**
 * 计算中文字符数（不含标点）
 */
function countChineseChars(text) {
    // 统计中文字符和数字字母
    const matches = text.match(/[\u4e00-\u9fa5a-zA-Z0-9]/g);
    return matches ? matches.length : 0;
}
/**
 * 计算文本朗读时长
 * @param text 文本内容
 * @param charsPerSecond 语速（字/秒）
 */
function estimateReadingTime(text, charsPerSecond = exports.DEFAULT_CHARS_PER_SECOND) {
    const charCount = countChineseChars(text);
    if (charCount === 0)
        return 0;
    return Math.max(exports.MIN_ELEMENT_DURATION, charCount / charsPerSecond);
}
/**
 * 为单个slide生成元素级时间戳
 *
 * 算法：
 * 1. 根据narration总时长分配各元素时间
 * 2. 按元素在slide中的顺序分配时间窗口
 * 3. 考虑标题先入场的原则
 *
 * @param slide slide数据
 * @param slideStartTime slide在视频中的开始时间（秒）
 * @param charsPerSecond 语速
 */
function calculateElementTimings(slide, slideStartTime, charsPerSecond = exports.DEFAULT_CHARS_PER_SECOND) {
    const timings = [];
    const narration = slide.narration || '';
    const narrationDuration = slide.audioDuration || estimateReadingTime(narration, charsPerSecond);
    // 如果没有narration，使用默认的均匀分配
    if (!narration || narrationDuration === 0) {
        return generateDefaultTimings(slide, slideStartTime);
    }
    // 获取所有元素及其cue文本
    const elements = extractElementsWithCues(slide);
    if (elements.length === 0) {
        return generateDefaultTimings(slide, slideStartTime);
    }
    // 在narration中定位每个cue的位置
    let currentTime = slideStartTime;
    // 标题总是第一个出现
    if (slide.title) {
        const titleDuration = Math.min(exports.TITLE_READING_TIME, narrationDuration * 0.15);
        timings.push({
            id: 'title',
            type: 'title',
            cue: slide.title,
            audioStart: currentTime,
            audioEnd: currentTime + titleDuration,
            entryDelay: 0,
            entryDuration: 0.5,
        });
        currentTime += titleDuration * 0.8; // 标题和副标题可以部分重叠
    }
    // 副标题
    if (slide.subtitle) {
        const subtitleDuration = Math.min(exports.SUBTITLE_READING_TIME, narrationDuration * 0.1);
        timings.push({
            id: 'subtitle',
            type: 'subtitle',
            cue: slide.subtitle,
            audioStart: currentTime,
            audioEnd: currentTime + subtitleDuration,
            entryDelay: 0,
            entryDuration: 0.4,
        });
        currentTime += subtitleDuration * 0.5;
    }
    // 计算剩余时间给内容元素
    const contentStartTime = currentTime + 0.3; // 给标题副标题留出过渡时间
    const contentEndTime = slideStartTime + narrationDuration;
    const contentDuration = Math.max(1, contentEndTime - contentStartTime);
    // 在剩余narration中查找每个cue的位置
    const contentElements = elements.filter((e) => e.type !== 'title' && e.type !== 'subtitle');
    if (contentElements.length > 0) {
        // 尝试在narration中匹配每个cue
        let searchStart = 0;
        const narrationText = narration;
        contentElements.forEach((element, index) => {
            const cueText = element.cue;
            // 在narration中查找cue的位置
            const cueIndex = narrationText.indexOf(cueText, searchStart);
            if (cueIndex >= 0) {
                // 找到了cue，计算时间位置
                // 基于cue在narration中的位置比例计算时间
                const charsBeforeCue = countChineseChars(narrationText.slice(0, cueIndex));
                const cueCharIndex = countChineseChars(narrationText.slice(0, cueIndex + cueText.length));
                const relativeStart = charsBeforeCue / Math.max(1, countChineseChars(narrationText));
                const relativeEnd = cueCharIndex / Math.max(1, countChineseChars(narrationText));
                const elementStart = contentStartTime + relativeStart * contentDuration;
                const elementEnd = contentStartTime + relativeEnd * contentDuration;
                timings.push({
                    ...element,
                    audioStart: elementStart,
                    audioEnd: elementEnd,
                    entryDelay: 0,
                    entryDuration: 0.4,
                });
                searchStart = cueIndex + cueText.length;
            }
            else {
                // 没找到cue，按顺序均匀分配
                const timePerElement = contentDuration / contentElements.length;
                const elementStart = contentStartTime + index * timePerElement;
                const elementEnd = elementStart + timePerElement;
                timings.push({
                    ...element,
                    audioStart: elementStart,
                    audioEnd: elementEnd,
                    entryDelay: 0,
                    entryDuration: 0.4,
                });
            }
        });
    }
    return timings;
}
/**
 * 提取slide中的所有元素及其cue文本
 */
function extractElementsWithCues(slide) {
    var _a, _b;
    const elements = [];
    // 根据layout类型提取元素
    const inferredLayout = slide.type ||
        slide.layout ||
        (Array.isArray(slide.steps)
            ? 'steps'
            : Array.isArray(slide.timeline)
                ? 'timeline'
                : Array.isArray(slide.highlights)
                    ? 'highlight'
                    : slide.chart
                        ? 'chart'
                        : 'default');
    const layout = inferredLayout;
    // 提取data中的元素
    const data = (slide.data || {});
    const directSlide = slide;
    switch (layout) {
        case 'stats':
            if (data.stats && Array.isArray(data.stats)) {
                data.stats.forEach((stat, index) => {
                    const label = stat.label || '';
                    const value = String(stat.value || '');
                    const suffix = stat.suffix || '';
                    elements.push({
                        id: `stat-${index}`,
                        type: 'stat',
                        cue: `${value}${suffix}${label}`,
                        index,
                    });
                });
            }
            break;
        case 'steps':
            if (data.steps && Array.isArray(data.steps)) {
                data.steps.forEach((step, index) => {
                    elements.push({
                        id: `step-${index}`,
                        type: 'step',
                        cue: step.title || '',
                        index,
                    });
                });
            }
            else if (directSlide.steps && Array.isArray(directSlide.steps)) {
                directSlide.steps.forEach((step, index) => {
                    elements.push({
                        id: `step-${index}`,
                        type: 'step',
                        cue: step.title || '',
                        index,
                    });
                });
            }
            break;
        case 'list':
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item, index) => {
                    const text = typeof item === 'string' ? item : item.text || item.title || item.desc || '';
                    elements.push({
                        id: `item-${index}`,
                        type: 'item',
                        cue: text,
                        index,
                    });
                });
            }
            break;
        case 'compare':
            if (data.left) {
                elements.push({
                    id: 'compare-left',
                    type: 'compare-left',
                    cue: data.left.label || '',
                });
            }
            if (data.right) {
                elements.push({
                    id: 'compare-right',
                    type: 'compare-right',
                    cue: data.right.label || '',
                });
            }
            break;
        case 'timeline':
            if (data.timeline && Array.isArray(data.timeline)) {
                data.timeline.forEach((item, index) => {
                    elements.push({
                        id: `timeline-${index}`,
                        type: 'timeline-item',
                        cue: item.title || '',
                        index,
                    });
                });
            }
            else if (directSlide.timeline && Array.isArray(directSlide.timeline)) {
                directSlide.timeline.forEach((item, index) => {
                    elements.push({
                        id: `timeline-${index}`,
                        type: 'timeline-item',
                        cue: item.title || '',
                        index,
                    });
                });
            }
            break;
        case 'highlight':
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item, index) => {
                    const text = typeof item === 'string' ? item : item.text || item.title || item.desc || '';
                    elements.push({
                        id: `highlight-${index}`,
                        type: 'highlight',
                        cue: text,
                        index,
                    });
                });
            }
            else if (data.highlights && Array.isArray(data.highlights)) {
                data.highlights.forEach((item, index) => {
                    const text = typeof item === 'string' ? item : item.text || '';
                    elements.push({
                        id: `highlight-${index}`,
                        type: 'highlight',
                        cue: text,
                        index,
                    });
                });
            }
            else if (directSlide.highlights && Array.isArray(directSlide.highlights)) {
                directSlide.highlights.forEach((item, index) => {
                    const text = typeof item === 'string' ? item : item.text || '';
                    elements.push({
                        id: `highlight-${index}`,
                        type: 'highlight',
                        cue: text,
                        index,
                    });
                });
            }
            break;
        case 'quote':
            if (data.quote) {
                elements.push({
                    id: 'quote-text',
                    type: 'quote',
                    cue: data.quote,
                });
            }
            break;
        case 'chart':
            if (data.bars && Array.isArray(data.bars)) {
                data.bars.forEach((bar, index) => {
                    elements.push({
                        id: `chart-bar-${index}`,
                        type: 'chart',
                        cue: bar.label || '',
                        index,
                    });
                });
            }
            else if (((_a = data.chart) === null || _a === void 0 ? void 0 : _a.values) && Array.isArray(data.chart.values)) {
                data.chart.values.forEach((bar, index) => {
                    elements.push({
                        id: `chart-bar-${index}`,
                        type: 'chart',
                        cue: bar.label || '',
                        index,
                    });
                });
            }
            else if (((_b = directSlide.chart) === null || _b === void 0 ? void 0 : _b.values) && Array.isArray(directSlide.chart.values)) {
                directSlide.chart.values.forEach((bar, index) => {
                    elements.push({
                        id: `chart-bar-${index}`,
                        type: 'chart',
                        cue: bar.label || '',
                        index,
                    });
                });
            }
            break;
        default:
            // 默认处理points
            if (slide.points && slide.points.length > 0) {
                slide.points.forEach((point, index) => {
                    elements.push({
                        id: `point-${index}`,
                        type: 'custom',
                        cue: point,
                        index,
                    });
                });
            }
    }
    return elements;
}
/**
 * 生成默认的时间戳（均匀分配）
 */
function generateDefaultTimings(slide, slideStartTime) {
    const timings = [];
    const duration = slide.audioDuration || 5;
    timings.push({
        id: 'title',
        type: 'title',
        cue: slide.title || '',
        audioStart: slideStartTime,
        audioEnd: slideStartTime + duration * 0.2,
        entryDelay: 0,
        entryDuration: 0.5,
    });
    if (slide.subtitle) {
        timings.push({
            id: 'subtitle',
            type: 'subtitle',
            cue: slide.subtitle,
            audioStart: slideStartTime + duration * 0.15,
            audioEnd: slideStartTime + duration * 0.3,
            entryDelay: 0,
            entryDuration: 0.4,
        });
    }
    // 内容元素均匀分配剩余时间
    const contentStart = slideStartTime + duration * 0.3;
    const contentDuration = duration * 0.65;
    const elements = extractElementsWithCues(slide).filter((e) => e.type !== 'title' && e.type !== 'subtitle');
    if (elements.length > 0) {
        const timePerElement = contentDuration / elements.length;
        elements.forEach((element, index) => {
            timings.push({
                ...element,
                audioStart: contentStart + index * timePerElement,
                audioEnd: contentStart + (index + 1) * timePerElement,
                entryDelay: 0,
                entryDuration: 0.4,
            });
        });
    }
    return timings;
}
/**
 * 从字级时间戳计算元素时间戳（精确版）
 *
 * 使用火山引擎返回的字级时间戳，通过cue文本匹配精确定位每个元素的出现时间
 *
 * @param slide slide数据
 * @param slideStartTime slide在视频中的开始时间（秒）
 * @param timestamps 字级时间戳数组
 * @param minElementDuration 最小元素展示时长
 */
function calculateElementTimingsFromTimestamps(slide, slideStartTime, timestamps, minElementDuration = exports.MIN_ELEMENT_DURATION) {
    var _a, _b, _c, _d;
    const timings = [];
    if (!timestamps || timestamps.length === 0) {
        // 没有时间戳，回退到估算模式
        return calculateElementTimings(slide, slideStartTime);
    }
    // 提取所有元素
    const elements = extractElementsWithCues(slide);
    if (elements.length === 0) {
        return generateDefaultTimings(slide, slideStartTime);
    }
    // 标题和副标题总是优先
    let currentTime = slideStartTime;
    if (slide.title) {
        const titleResult = findCueInTimestamps(slide.title, timestamps);
        const titleStart = (_a = titleResult === null || titleResult === void 0 ? void 0 : titleResult.start) !== null && _a !== void 0 ? _a : currentTime;
        const titleEnd = (_b = titleResult === null || titleResult === void 0 ? void 0 : titleResult.end) !== null && _b !== void 0 ? _b : titleStart + exports.TITLE_READING_TIME;
        timings.push({
            id: 'title',
            type: 'title',
            cue: slide.title,
            audioStart: titleStart,
            audioEnd: titleEnd,
            entryDelay: 0,
            entryDuration: 0.5,
        });
        currentTime = titleEnd;
    }
    if (slide.subtitle) {
        const subtitleResult = findCueInTimestamps(slide.subtitle, timestamps);
        const subtitleStart = (_c = subtitleResult === null || subtitleResult === void 0 ? void 0 : subtitleResult.start) !== null && _c !== void 0 ? _c : currentTime;
        const subtitleEnd = (_d = subtitleResult === null || subtitleResult === void 0 ? void 0 : subtitleResult.end) !== null && _d !== void 0 ? _d : subtitleStart + exports.SUBTITLE_READING_TIME;
        timings.push({
            id: 'subtitle',
            type: 'subtitle',
            cue: slide.subtitle,
            audioStart: subtitleStart,
            audioEnd: subtitleEnd,
            entryDelay: 0,
            entryDuration: 0.4,
        });
        currentTime = Math.max(currentTime, subtitleEnd);
    }
    // 内容元素使用精确时间戳匹配
    const contentElements = elements.filter((e) => e.type !== 'title' && e.type !== 'subtitle');
    contentElements.forEach((element, index) => {
        const cueText = element.cue;
        if (!cueText) {
            return;
        }
        const result = findCueInTimestamps(cueText, timestamps);
        if (result) {
            // 确保最小展示时长
            const duration = Math.max(minElementDuration, result.end - result.start);
            const elementEnd = result.start + duration;
            timings.push({
                ...element,
                audioStart: slideStartTime + result.start,
                audioEnd: slideStartTime + elementEnd,
                entryDelay: 0,
                entryDuration: 0.4,
            });
        }
        else {
            // 未找到匹配，使用顺序分配
            const estimatedDuration = Math.max(minElementDuration, estimateReadingTime(cueText));
            const elementStart = currentTime + index * 0.5;
            timings.push({
                ...element,
                audioStart: elementStart,
                audioEnd: elementStart + estimatedDuration,
                entryDelay: 0,
                entryDuration: 0.4,
            });
        }
    });
    return timings;
}
/**
 * 批量计算所有slides的元素时间戳
 *
 * @param slides slide数组
 * @param charsPerSecond 语速
 * @returns 每个slide对应的元素时间戳数组
 */
function calculateAllElementTimings(slides, charsPerSecond = exports.DEFAULT_CHARS_PER_SECOND) {
    const result = new Map();
    let currentTime = 0;
    slides.forEach((slide, index) => {
        const slideStartTime = currentTime;
        const timings = calculateElementTimings(slide, slideStartTime, charsPerSecond);
        result.set(index, timings);
        // 更新当前时间
        const slideDuration = slide.audioDuration || estimateReadingTime(slide.narration || '', charsPerSecond);
        currentTime += slideDuration;
    });
    return result;
}
/**
 * 将元素时间戳应用到slide数据
 */
function applyElementTimings(slides, timingsMap) {
    return slides.map((slide, index) => {
        const timings = timingsMap.get(index);
        if (!timings)
            return slide;
        return {
            ...slide,
            elementTimings: timings,
        };
    });
}
/**
 * 手动调整元素时间戳
 * 用于在编辑器中微调
 */
function adjustElementTiming(timing, adjustments) {
    return {
        ...timing,
        ...adjustments,
    };
}
/**
 * 验证时间戳是否合理
 * 检查是否有重叠或间隙过大的问题
 */
function validateTimings(timings) {
    const issues = [];
    if (timings.length === 0) {
        return { valid: true, issues };
    }
    // 按开始时间排序
    const sorted = [...timings].sort((a, b) => (a.audioStart || 0) - (b.audioStart || 0));
    // 检查重叠
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (prev.audioEnd && curr.audioStart && prev.audioEnd > curr.audioStart) {
            issues.push(`元素 "${prev.id}" 和 "${curr.id}" 时间重叠`);
        }
        // 检查间隔过大（超过1秒）
        if (prev.audioEnd && curr.audioStart && curr.audioStart - prev.audioEnd > 1) {
            issues.push(`元素 "${prev.id}" 和 "${curr.id}" 之间间隔过长 (${(curr.audioStart - prev.audioEnd).toFixed(2)}秒)`);
        }
    }
    // 检查元素时长过短
    sorted.forEach((t) => {
        const duration = (t.audioEnd || 0) - (t.audioStart || 0);
        if (duration < exports.MIN_ELEMENT_DURATION && duration > 0) {
            issues.push(`元素 "${t.id}" 时长过短 (${duration.toFixed(2)}秒)`);
        }
    });
    return { valid: issues.length === 0, issues };
}
