"use strict";
// 横屏模板共享数据规整器
// 把统一 schema 的 slide.data 转成模板内部使用的强类型数据
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCta = exports.getQuote = exports.toHighlights = exports.toSteps = exports.toTimeline = exports.toCompare = exports.toChart = exports.toStats = exports.toList = exports.splitPoint = void 0;
const splitPoint = (point) => {
    const parts = point
        .split(/[:：-]\s*/)
        .map((p) => p.trim())
        .filter(Boolean);
    return parts.length <= 1
        ? { title: point.trim() }
        : { title: parts[0], desc: parts.slice(1).join(' - ') };
};
exports.splitPoint = splitPoint;
const toList = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.items)) {
        const result = [];
        data.items.forEach((item) => {
            if (typeof item === 'string') {
                result.push((0, exports.splitPoint)(item));
                return;
            }
            if (!item || typeof item !== 'object')
                return;
            const r = item;
            const title = typeof r.text === 'string'
                ? r.text
                : typeof r.title === 'string'
                    ? r.title
                    : '';
            if (!title)
                return;
            result.push({
                title,
                desc: typeof r.desc === 'string'
                    ? r.desc
                    : typeof r.description === 'string'
                        ? r.description
                        : undefined,
            });
        });
        return result;
    }
    return (points || []).map(exports.splitPoint);
};
exports.toList = toList;
const toStats = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.stats)) {
        const result = [];
        data.stats.forEach((item) => {
            var _a;
            if (!item || typeof item !== 'object')
                return;
            const r = item;
            const rawValue = typeof r.value === 'number'
                ? r.value
                : typeof r.value === 'string'
                    ? Number(r.value.replace(/[^\d.-]/g, ''))
                    : 0;
            const suffix = typeof r.suffix === 'string' ? r.suffix : '';
            result.push({
                label: typeof r.label === 'string'
                    ? r.label
                    : typeof r.title === 'string'
                        ? r.title
                        : 'Metric',
                value: `${(_a = r.value) !== null && _a !== void 0 ? _a : '0'}${suffix}`,
                rawValue: Number.isFinite(rawValue) ? rawValue : 0,
                suffix,
                note: typeof r.note === 'string' ? r.note : undefined,
            });
        });
        return result;
    }
    return (points || []).map((point, i) => {
        const parsed = (0, exports.splitPoint)(point);
        const m = (parsed.desc || parsed.title || '').match(/-?\d+(?:\.\d+)?/);
        const num = m ? Number(m[0]) : 0;
        return {
            label: parsed.title || `Metric ${i + 1}`,
            value: parsed.desc || parsed.title,
            rawValue: num,
            suffix: '',
        };
    });
};
exports.toStats = toStats;
const toChart = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.bars)) {
        const result = [];
        data.bars.forEach((item) => {
            var _a;
            if (!item || typeof item !== 'object')
                return;
            const r = item;
            const raw = (_a = r.percent) !== null && _a !== void 0 ? _a : r.value;
            const value = typeof raw === 'number' ? raw : Number(raw || 0);
            if (typeof r.label !== 'string' || Number.isNaN(value))
                return;
            const bar = { label: r.label, value };
            if (typeof r.color === 'string')
                bar.color = r.color;
            result.push(bar);
        });
        return result;
    }
    return (points || []).map((point, i) => {
        const parsed = (0, exports.splitPoint)(point);
        return {
            label: parsed.title || `Bar ${i + 1}`,
            value: Number((parsed.desc || '0').replace(/[^\d.-]/g, '')) || 0,
        };
    });
};
exports.toChart = toChart;
const toCompare = (points, data) => {
    const left = (data === null || data === void 0 ? void 0 : data.left) && typeof data.left === 'object'
        ? data.left
        : undefined;
    const right = (data === null || data === void 0 ? void 0 : data.right) && typeof data.right === 'object'
        ? data.right
        : undefined;
    if (left && right) {
        return {
            left: {
                label: typeof left.label === 'string' ? left.label : 'Before',
                value: typeof left.value === 'string'
                    ? left.value
                    : typeof left.title === 'string'
                        ? left.title
                        : '',
                desc: typeof left.desc === 'string' ? left.desc : undefined,
            },
            right: {
                label: typeof right.label === 'string' ? right.label : 'After',
                value: typeof right.value === 'string'
                    ? right.value
                    : typeof right.title === 'string'
                        ? right.title
                        : '',
                desc: typeof right.desc === 'string' ? right.desc : undefined,
            },
        };
    }
    const [l, r] = points || [];
    const lp = (0, exports.splitPoint)(l || 'Before');
    const rp = (0, exports.splitPoint)(r || 'After');
    return {
        left: { label: lp.title, value: lp.desc || lp.title },
        right: { label: rp.title, value: rp.desc || rp.title },
    };
};
exports.toCompare = toCompare;
const toTimeline = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.timeline)) {
        const result = [];
        data.timeline.forEach((item) => {
            if (!item || typeof item !== 'object')
                return;
            const r = item;
            if (typeof r.title !== 'string')
                return;
            result.push({
                year: typeof r.year === 'string' ? r.year : '',
                title: r.title,
                desc: typeof r.description === 'string'
                    ? r.description
                    : typeof r.desc === 'string'
                        ? r.desc
                        : undefined,
            });
        });
        return result;
    }
    return (points || []).map((point, i) => {
        const parsed = (0, exports.splitPoint)(point);
        return {
            year: String(i + 1).padStart(2, '0'),
            title: parsed.title,
            desc: parsed.desc,
        };
    });
};
exports.toTimeline = toTimeline;
const toSteps = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.steps)) {
        const result = [];
        data.steps.forEach((item) => {
            if (!item || typeof item !== 'object')
                return;
            const r = item;
            const t = typeof r.title === 'string' ? r.title : '';
            if (!t)
                return;
            result.push({
                title: t,
                desc: typeof r.description === 'string'
                    ? r.description
                    : typeof r.desc === 'string'
                        ? r.desc
                        : undefined,
            });
        });
        return result;
    }
    return (points || []).map(exports.splitPoint);
};
exports.toSteps = toSteps;
const toHighlights = (points, data) => {
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.highlights)) {
        return data.highlights
            .map((item) => {
            if (typeof item === 'string')
                return item;
            if (item && typeof item === 'object') {
                const r = item;
                if (typeof r.text === 'string')
                    return r.text;
            }
            return null;
        })
            .filter((x) => x !== null);
    }
    if (Array.isArray(data === null || data === void 0 ? void 0 : data.items)) {
        return data.items
            .map((item) => {
            if (typeof item === 'string')
                return item;
            if (item && typeof item === 'object') {
                const r = item;
                if (typeof r.text === 'string')
                    return r.text;
                if (typeof r.title === 'string')
                    return r.title;
            }
            return null;
        })
            .filter((x) => x !== null);
    }
    return (points || []).filter((p) => p.trim().length > 0);
};
exports.toHighlights = toHighlights;
const getQuote = (data, fallbackTitle, fallbackSubtitle) => {
    const quote = typeof (data === null || data === void 0 ? void 0 : data.quote) === 'string'
        ? data.quote
        : fallbackSubtitle || fallbackTitle || '';
    const author = typeof (data === null || data === void 0 ? void 0 : data.author) === 'string'
        ? data.author
        : fallbackTitle && fallbackSubtitle
            ? fallbackTitle
            : undefined;
    return { quote, author };
};
exports.getQuote = getQuote;
const getCta = (data) => {
    if (typeof (data === null || data === void 0 ? void 0 : data.cta) === 'string')
        return data.cta;
    if (typeof (data === null || data === void 0 ? void 0 : data.button) === 'string')
        return data.button;
    return '';
};
exports.getCta = getCta;
