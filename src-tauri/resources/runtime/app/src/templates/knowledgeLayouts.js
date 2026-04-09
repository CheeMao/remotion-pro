"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKnowledgeLayoutItemCount = exports.resolveKnowledgeLayout = void 0;
const asString = (value) => {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};
const asStringArray = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) => asString(item))
        .filter((item) => Boolean(item));
};
const asRecord = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }
    return value;
};
const toLabel = (value, fallback) => {
    return asString(value) || fallback;
};
const toCompareSide = (value, fallbackLabel, fallbackPoints) => {
    var _a;
    const record = asRecord(value);
    if (!record) {
        return {
            label: fallbackLabel,
            points: fallbackPoints,
        };
    }
    const points = asStringArray(record.points);
    const description = asString(record.description) || asString(record.desc);
    return {
        label: toLabel((_a = record.label) !== null && _a !== void 0 ? _a : record.title, fallbackLabel),
        value: asString(record.value),
        points: points.length > 0
            ? points
            : description
                ? [description]
                : fallbackPoints,
    };
};
const toTimelineItems = (data, points) => {
    const source = (Array.isArray(data === null || data === void 0 ? void 0 : data.timeline) ? data === null || data === void 0 ? void 0 : data.timeline : undefined) ||
        (Array.isArray(data === null || data === void 0 ? void 0 : data.items) ? data === null || data === void 0 ? void 0 : data.items : undefined);
    if (source) {
        return source
            .map((item, index) => {
            const record = asRecord(item);
            if (!record) {
                const text = asString(item);
                return text
                    ? {
                        label: String(index + 1).padStart(2, '0'),
                        title: text,
                    }
                    : undefined;
            }
            return {
                label: asString(record.label) ||
                    asString(record.year) ||
                    asString(record.icon) ||
                    String(index + 1).padStart(2, '0'),
                title: asString(record.title) ||
                    asString(record.text) ||
                    `Step ${index + 1}`,
                description: asString(record.description) ||
                    asString(record.desc) ||
                    asString(record.value),
            };
        })
            .filter((item) => Boolean(item));
    }
    return points.map((point, index) => ({
        label: String(index + 1).padStart(2, '0'),
        title: point,
    }));
};
const toStats = (data, points) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.stats)) {
        return data.stats
            .map((item) => {
            var _a;
            const record = asRecord(item);
            if (!record) {
                return undefined;
            }
            const value = asString(record.value) || String((_a = record.value) !== null && _a !== void 0 ? _a : '').trim();
            const suffix = asString(record.suffix) || '';
            const label = asString(record.label);
            if (!value || !label) {
                return undefined;
            }
            const normalized = {
                value: `${value}${suffix}`,
                label,
                note: asString(record.note) || asString(record.description),
            };
            return normalized;
        })
            .filter((item) => item !== undefined);
    }
    return points.slice(0, 4).map((point, index) => ({
        value: String(index + 1).padStart(2, '0'),
        label: point,
    }));
};
const inferMode = (slide, index) => {
    var _a, _b;
    const explicitType = asString(slide.type);
    const data = asRecord(slide.data);
    const pointCount = (_b = (_a = slide.points) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    if (explicitType === 'compare' || ((data === null || data === void 0 ? void 0 : data.left) && (data === null || data === void 0 ? void 0 : data.right))) {
        return 'compare';
    }
    if (explicitType === 'timeline' ||
        explicitType === 'steps' ||
        Array.isArray(data === null || data === void 0 ? void 0 : data.timeline) ||
        Array.isArray(data === null || data === void 0 ? void 0 : data.items)) {
        return 'timeline';
    }
    if (explicitType === 'stats' ||
        explicitType === 'chart' ||
        Array.isArray(data === null || data === void 0 ? void 0 : data.stats)) {
        return 'stats';
    }
    if (explicitType === 'quote' || asString(data === null || data === void 0 ? void 0 : data.quote)) {
        return 'quote';
    }
    if (explicitType === 'highlight') {
        return 'cards';
    }
    if (index === 0 && pointCount <= 3) {
        return 'hero';
    }
    if (pointCount === 2) {
        return 'compare';
    }
    if (pointCount === 3) {
        return 'timeline';
    }
    if (pointCount >= 4) {
        return 'cards';
    }
    return 'list';
};
const resolveKnowledgeLayout = (slide, index) => {
    const title = asString(slide.title) || `Slide ${index + 1}`;
    const subtitle = asString(slide.subtitle);
    const points = asStringArray(slide.points);
    const data = asRecord(slide.data);
    const mode = inferMode(slide, index);
    if (mode === 'compare') {
        const leftFallback = points[0] ? [points[0]] : subtitle ? [subtitle] : [];
        const rightFallback = points[1] ? [points[1]] : points.slice(2);
        return {
            mode,
            title,
            subtitle,
            badge: asString(data === null || data === void 0 ? void 0 : data.badge),
            points,
            compare: {
                left: toCompareSide(data === null || data === void 0 ? void 0 : data.left, asString(data === null || data === void 0 ? void 0 : data.leftTitle) || 'Current', leftFallback),
                right: toCompareSide(data === null || data === void 0 ? void 0 : data.right, asString(data === null || data === void 0 ? void 0 : data.rightTitle) || 'Target', rightFallback),
            },
        };
    }
    if (mode === 'timeline') {
        return {
            mode,
            title,
            subtitle,
            badge: asString(data === null || data === void 0 ? void 0 : data.badge),
            points,
            timeline: toTimelineItems(data, points),
        };
    }
    if (mode === 'stats') {
        return {
            mode,
            title,
            subtitle,
            badge: asString(data === null || data === void 0 ? void 0 : data.badge),
            points,
            stats: toStats(data, points),
        };
    }
    if (mode === 'quote') {
        return {
            mode,
            title,
            subtitle,
            badge: asString(data === null || data === void 0 ? void 0 : data.badge),
            points,
            quote: {
                text: asString(data === null || data === void 0 ? void 0 : data.quote) || subtitle || title,
                author: asString(data === null || data === void 0 ? void 0 : data.author),
            },
        };
    }
    return {
        mode,
        title,
        subtitle,
        badge: asString(data === null || data === void 0 ? void 0 : data.badge),
        points,
    };
};
exports.resolveKnowledgeLayout = resolveKnowledgeLayout;
const getKnowledgeLayoutItemCount = (layout) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    switch (layout.mode) {
        case 'compare':
            return Math.max((_b = (_a = layout.compare) === null || _a === void 0 ? void 0 : _a.left.points.length) !== null && _b !== void 0 ? _b : 0, (_d = (_c = layout.compare) === null || _c === void 0 ? void 0 : _c.right.points.length) !== null && _d !== void 0 ? _d : 0, 2);
        case 'timeline':
            return Math.max((_f = (_e = layout.timeline) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0, 1);
        case 'stats':
            return Math.max((_h = (_g = layout.stats) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0, layout.points.length, 1);
        case 'quote':
            return Math.max(layout.points.length, 1);
        case 'hero':
        case 'list':
        case 'cards':
        default:
            return Math.max(layout.points.length, 1);
    }
};
exports.getKnowledgeLayoutItemCount = getKnowledgeLayoutItemCount;
