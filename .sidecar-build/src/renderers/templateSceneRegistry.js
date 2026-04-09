"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplateScene = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const EditorialSlide_1 = require("../EditorialShow/EditorialSlide");
const InsightSlide_1 = require("../InsightShow/InsightSlide");
const StickSlide_1 = require("../StickShow/StickSlide");
const CosmosSlide_1 = require("../CosmosShow/CosmosSlide");
const ProjectSlide_1 = require("../ProjectShow/ProjectSlide");
const GlassSlide_1 = require("../GlassShow/GlassSlide");
const KnowledgeSlide_1 = require("../KnowledgeShow/KnowledgeSlide");
const LiquidBriefSlide_1 = require("../LiquidBriefShow/LiquidBriefSlide");
const LiquidSlide_1 = require("../LiquidShow/LiquidSlide");
const MacSlide_1 = require("../MacShow/MacSlide");
const RichSlide_1 = require("../RichShow/RichSlide");
const StudioSlide_1 = require("../StudioShow/StudioSlide");
const TechSlide_1 = require("../TechShow/TechSlide");
const getLayout = (slide) => {
    const layout = slide.layout || slide.type || 'default';
    switch (layout) {
        case 'cover':
            return 'hero';
        case 'cards':
            return 'list';
        case 'progress':
            return 'chart';
        case 'title':
            return 'hero';
        default:
            return layout;
    }
};
const splitPoint = (point) => {
    const parts = point
        .trim()
        .split(/[:：-]\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
    if (parts.length <= 1) {
        return { title: point.trim() };
    }
    return {
        title: parts[0],
        description: parts.slice(1).join(' - '),
    };
};
const GENERIC_HERO_BADGE_PATTERN = /^(先抛问题|抛问题|提出问题|关键反转|反转|核心问题|关键问题|先给结论|给结论|抛结论|先讲结论|开场钩子|钩子|破题|收束|行动引导|行动建议|证据页|反差页|重点来了|继续往下看|往下看答案|看答案|call to action|cta|hook|verdict|signal|preview)$/i;
const sanitizeHeroBadge = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    if (!trimmed || GENERIC_HERO_BADGE_PATTERN.test(trimmed)) {
        return undefined;
    }
    return trimmed;
};
const GENERIC_CTA_PATTERN = /^(答案在下一页|往下看答案|继续往下看|继续看答案|下页见|下一页见|下一页告诉你|往下看|继续看|接着看|马上揭晓|马上告诉你|继续看下去|看下去|call to action|cta)$/i;
const sanitizeCtaText = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    if (!trimmed || GENERIC_CTA_PATTERN.test(trimmed)) {
        return undefined;
    }
    return trimmed;
};
const ensureListItems = (slide) => {
    var _a;
    const items = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.items;
    if (Array.isArray(items) && items.length > 0) {
        return items.map((item, index) => {
            if (typeof item === 'string') {
                const parsed = splitPoint(item);
                return {
                    icon: String(index + 1).padStart(2, '0'),
                    text: parsed.title,
                    desc: parsed.description,
                };
            }
            if (item && typeof item === 'object') {
                const record = item;
                return {
                    icon: typeof record.icon === 'string'
                        ? record.icon
                        : String(index + 1).padStart(2, '0'),
                    text: typeof record.text === 'string'
                        ? record.text
                        : typeof record.title === 'string'
                            ? record.title
                            : `Item ${index + 1}`,
                    desc: typeof record.desc === 'string'
                        ? record.desc
                        : typeof record.description === 'string'
                            ? record.description
                            : undefined,
                };
            }
            return {
                icon: String(index + 1).padStart(2, '0'),
                text: `Item ${index + 1}`,
            };
        });
    }
    return (slide.points || []).map((point, index) => {
        const parsed = splitPoint(point);
        return {
            icon: String(index + 1).padStart(2, '0'),
            text: parsed.title,
            desc: parsed.description,
        };
    });
};
const ensureHighlightItems = (slide) => {
    var _a, _b;
    const highlights = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.highlights;
    if (Array.isArray(highlights) && highlights.length > 0) {
        return highlights
            .map((item) => {
            if (typeof item === 'string') {
                return item;
            }
            if (item && typeof item === 'object' && typeof item.text === 'string') {
                return item.text;
            }
            return undefined;
        })
            .filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    const items = (_b = slide.data) === null || _b === void 0 ? void 0 : _b.items;
    if (Array.isArray(items) && items.length > 0) {
        return items
            .map((item) => {
            if (typeof item === 'string') {
                return item;
            }
            if (item && typeof item === 'object') {
                const record = item;
                if (typeof record.text === 'string')
                    return record.text;
                if (typeof record.title === 'string')
                    return record.title;
            }
            return undefined;
        })
            .filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    return (slide.points || []).filter((point) => point.trim().length > 0);
};
const ensureSteps = (slide) => {
    var _a;
    const steps = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.steps;
    if (Array.isArray(steps) && steps.length > 0) {
        const normalizedSteps = [];
        steps.forEach((item) => {
            if (!item || typeof item !== 'object')
                return;
            const record = item;
            if (typeof record.title !== 'string')
                return;
            normalizedSteps.push({
                title: record.title,
                description: typeof record.description === 'string' ? record.description : undefined,
                icon: typeof record.icon === 'string' ? record.icon : undefined,
            });
        });
        return normalizedSteps;
    }
    return (slide.points || []).map((point) => {
        const parsed = splitPoint(point);
        return {
            title: parsed.title,
            description: parsed.description,
        };
    });
};
const ensureTimeline = (slide) => {
    var _a;
    const timeline = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.timeline;
    if (Array.isArray(timeline) && timeline.length > 0) {
        const normalizedTimeline = [];
        timeline.forEach((item) => {
            if (!item || typeof item !== 'object')
                return;
            const record = item;
            if (typeof record.title !== 'string' || typeof record.year !== 'string')
                return;
            normalizedTimeline.push({
                year: record.year,
                title: record.title,
                description: typeof record.description === 'string' ? record.description : undefined,
            });
        });
        return normalizedTimeline;
    }
    return (slide.points || []).map((point, index) => {
        const parsed = splitPoint(point);
        return {
            year: String(index + 1).padStart(2, '0'),
            title: parsed.title,
            description: parsed.description,
        };
    });
};
const ensureChart = (slide) => {
    var _a, _b;
    const chart = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.chart;
    if (chart && typeof chart === 'object') {
        const record = chart;
        if ((record.type === 'bar' || record.type === 'progress' || record.type === 'pie') &&
            Array.isArray(record.values)) {
            return record;
        }
    }
    const bars = (_b = slide.data) === null || _b === void 0 ? void 0 : _b.bars;
    if (Array.isArray(bars) && bars.length > 0) {
        return {
            type: 'progress',
            values: bars
                .map((item) => {
                if (!item || typeof item !== 'object')
                    return null;
                const record = item;
                const rawValue = typeof record.value === 'number'
                    ? record.value
                    : typeof record.percent === 'number'
                        ? record.percent
                        : null;
                if (typeof record.label !== 'string' || rawValue === null)
                    return null;
                return {
                    label: record.label,
                    value: rawValue,
                    color: typeof record.color === 'string' ? record.color : undefined,
                };
            })
                .filter((item) => item !== null),
        };
    }
    // Fallback: generate descending bars from points
    const pts = slide.points || [];
    if (pts.length === 0)
        return undefined;
    return {
        type: 'progress',
        values: pts.map((point, i) => {
            const parsed = splitPoint(point);
            return {
                label: parsed.title,
                value: Math.round(90 - (i / Math.max(pts.length - 1, 1)) * 50),
            };
        }),
    };
};
const ensureStats = (slide) => {
    var _a;
    const stats = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.stats;
    if (Array.isArray(stats) && stats.length > 0) {
        return stats
            .map((item) => {
            if (!item || typeof item !== 'object')
                return null;
            const record = item;
            const rawValue = record.value;
            const value = typeof rawValue === 'number'
                ? rawValue
                : typeof rawValue === 'string'
                    ? Number(rawValue.replace(/[^\d.-]/g, ''))
                    : null;
            if (value === null || Number.isNaN(value))
                return null;
            return {
                value,
                suffix: typeof record.suffix === 'string' ? record.suffix : undefined,
                label: typeof record.label === 'string'
                    ? record.label
                    : typeof record.title === 'string'
                        ? record.title
                        : 'Metric',
                note: typeof record.note === 'string'
                    ? record.note
                    : typeof record.desc === 'string'
                        ? record.desc
                        : undefined,
                color: typeof record.color === 'string' ? record.color : undefined,
            };
        })
            .filter((item) => item !== null);
    }
    // Fallback: parse points as stats. Try to extract a leading number, otherwise use sequential index.
    return (slide.points || []).map((point, i) => {
        const parsed = splitPoint(point);
        const numMatch = parsed.title.match(/^([\d,]+\.?\d*)\s*([%+万亿kKmM]*)/);
        if (numMatch) {
            const value = parseFloat(numMatch[1].replace(/,/g, ''));
            const suffix = numMatch[2] || undefined;
            const label = parsed.title.slice(numMatch[0].length).trim() || parsed.description || parsed.title;
            return { value: isNaN(value) ? i + 1 : value, suffix, label, note: parsed.description };
        }
        return { value: i + 1, suffix: undefined, label: parsed.title, note: parsed.description };
    });
};
const ensureCompare = (slide) => {
    var _a, _b, _c, _d, _e;
    const leftRecord = ((_a = slide.data) === null || _a === void 0 ? void 0 : _a.left) && typeof slide.data.left === 'object'
        ? slide.data.left
        : undefined;
    const rightRecord = ((_b = slide.data) === null || _b === void 0 ? void 0 : _b.right) && typeof slide.data.right === 'object'
        ? slide.data.right
        : undefined;
    if (leftRecord && rightRecord) {
        const leftTitle = typeof leftRecord.title === 'string'
            ? leftRecord.title
            : typeof leftRecord.value === 'string'
                ? leftRecord.value
                : typeof leftRecord.label === 'string'
                    ? leftRecord.label
                    : 'Before';
        const rightTitle = typeof rightRecord.title === 'string'
            ? rightRecord.title
            : typeof rightRecord.value === 'string'
                ? rightRecord.value
                : typeof rightRecord.label === 'string'
                    ? rightRecord.label
                    : 'After';
        return {
            left: {
                label: typeof leftRecord.label === 'string' ? leftRecord.label : 'Before',
                value: typeof leftRecord.value === 'string' ? leftRecord.value : leftTitle,
                title: leftTitle,
                desc: typeof leftRecord.desc === 'string' ? leftRecord.desc : undefined,
                points: Array.isArray(leftRecord.points)
                    ? leftRecord.points.filter((item) => typeof item === 'string')
                    : typeof leftRecord.desc === 'string'
                        ? [leftRecord.desc]
                        : [],
            },
            right: {
                label: typeof rightRecord.label === 'string' ? rightRecord.label : 'After',
                value: typeof rightRecord.value === 'string' ? rightRecord.value : rightTitle,
                title: rightTitle,
                desc: typeof rightRecord.desc === 'string' ? rightRecord.desc : undefined,
                points: Array.isArray(rightRecord.points)
                    ? rightRecord.points.filter((item) => typeof item === 'string')
                    : typeof rightRecord.desc === 'string'
                        ? [rightRecord.desc]
                        : [],
            },
            centerLabel: typeof ((_c = slide.data) === null || _c === void 0 ? void 0 : _c.centerLabel) === 'string'
                ? slide.data.centerLabel
                : typeof ((_d = slide.data) === null || _d === void 0 ? void 0 : _d.vsText) === 'string'
                    ? slide.data.vsText
                    : 'VS',
            vsText: typeof ((_e = slide.data) === null || _e === void 0 ? void 0 : _e.vsText) === 'string' ? slide.data.vsText : 'VS',
        };
    }
    const [first, second] = slide.points || [];
    if (!first || !second) {
        return undefined;
    }
    const left = splitPoint(first);
    const right = splitPoint(second);
    return {
        left: {
            label: 'Before',
            value: left.title,
            title: left.title,
            desc: left.description,
            points: left.description ? [left.description] : [],
        },
        right: {
            label: 'After',
            value: right.title,
            title: right.title,
            desc: right.description,
            points: right.description ? [right.description] : [],
        },
        centerLabel: 'VS',
        vsText: 'VS',
    };
};
const ensureQuote = (slide) => {
    var _a, _b;
    const quote = typeof ((_a = slide.data) === null || _a === void 0 ? void 0 : _a.quote) === 'string'
        ? slide.data.quote
        : slide.subtitle || slide.title || '';
    const author = typeof ((_b = slide.data) === null || _b === void 0 ? void 0 : _b.author) === 'string'
        ? slide.data.author
        : slide.title && slide.subtitle
            ? slide.title
            : undefined;
    return {
        quote,
        author,
        tags: ensureHighlightItems(slide).slice(0, 4),
    };
};
const ensureHeroData = (slide) => {
    var _a, _b, _c;
    return ({
        badge: sanitizeHeroBadge((_a = slide.data) === null || _a === void 0 ? void 0 : _a.badge),
        cta: sanitizeCtaText((_b = slide.data) === null || _b === void 0 ? void 0 : _b.cta) ||
            sanitizeCtaText((_c = slide.data) === null || _c === void 0 ? void 0 : _c.button),
    });
};
const toCompactPoints = (slide) => {
    if (Array.isArray(slide.points) && slide.points.length > 0) {
        return slide.points.filter((point) => point.trim().length > 0);
    }
    return ensureListItems(slide)
        .map((item) => (item.desc ? `${item.text}: ${item.desc}` : item.text))
        .filter((item) => item.trim().length > 0);
};
const toKnowledgeStatHighlights = (slide) => {
    const stats = ensureStats(slide);
    if (stats.length === 0)
        return undefined;
    return stats.map((item) => ({
        text: `${item.value}${item.suffix || ''} ${item.label}`.trim(),
    }));
};
const toKnowledgeComparePoints = (slide) => {
    const compare = ensureCompare(slide);
    if (!compare)
        return undefined;
    return [
        `${compare.left.label}: ${compare.left.value}${compare.left.desc ? ` - ${compare.left.desc}` : ''}`,
        `${compare.right.label}: ${compare.right.value}${compare.right.desc ? ` - ${compare.right.desc}` : ''}`,
    ];
};
const toKnowledgeQuotePoints = (slide) => {
    const quote = ensureQuote(slide);
    if (!quote.quote)
        return undefined;
    return [quote.quote];
};
const toKnowledgeCtaPoints = (slide) => {
    var _a, _b;
    const cta = typeof ((_a = slide.data) === null || _a === void 0 ? void 0 : _a.cta) === 'string'
        ? slide.data.cta
        : typeof ((_b = slide.data) === null || _b === void 0 ? void 0 : _b.button) === 'string'
            ? slide.data.button
            : undefined;
    const points = [...(slide.points || []), ...(cta ? [cta] : [])].filter((item) => item.trim().length > 0);
    return points.length > 0 ? points : undefined;
};
const renderGlassScene = ({ slide, index, totalSlides, durationInFrames }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const layout = getLayout(slide);
    const supportedLayouts = new Set([
        'default',
        'steps',
        'timeline',
        'chart',
        'highlight',
        'list',
        'compare',
        'stats',
        'quote',
        'hero',
        'cta',
    ]);
    if (!supportedLayouts.has(layout)) {
        return null;
    }
    const componentLayout = layout;
    return ((0, jsx_runtime_1.jsx)(GlassSlide_1.GlassSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: componentLayout, data: {
            ...(slide.data || {}),
            items: layout === 'list' ? ensureListItems(slide) : layout === 'highlight' ? ensureHighlightItems(slide) : (_a = slide.data) === null || _a === void 0 ? void 0 : _a.items,
            steps: layout === 'steps' ? ensureSteps(slide) : (_b = slide.data) === null || _b === void 0 ? void 0 : _b.steps,
            timeline: layout === 'timeline' ? ensureTimeline(slide) : (_c = slide.data) === null || _c === void 0 ? void 0 : _c.timeline,
            chart: layout === 'chart' ? ensureChart(slide) : (_d = slide.data) === null || _d === void 0 ? void 0 : _d.chart,
            bars: layout === 'chart' ? (((_e = ensureChart(slide)) === null || _e === void 0 ? void 0 : _e.values) || ((_f = slide.data) === null || _f === void 0 ? void 0 : _f.bars)) : (_g = slide.data) === null || _g === void 0 ? void 0 : _g.bars,
            stats: layout === 'stats' ? ensureStats(slide) : (_h = slide.data) === null || _h === void 0 ? void 0 : _h.stats,
            ...(layout === 'compare' ? ensureCompare(slide) : null),
            ...(layout === 'quote' ? ensureQuote(slide) : null),
            ...((layout === 'hero' || layout === 'cta') ? ensureHeroData(slide) : null),
        }, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderLiquidScene = ({ slide, index, totalSlides, durationInFrames }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const layout = getLayout(slide);
    const supportedLayouts = new Set([
        'default',
        'steps',
        'timeline',
        'chart',
        'highlight',
        'list',
        'compare',
        'stats',
        'quote',
        'hero',
        'cta',
    ]);
    if (!supportedLayouts.has(layout)) {
        return null;
    }
    const componentLayout = layout;
    return ((0, jsx_runtime_1.jsx)(LiquidSlide_1.LiquidSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: componentLayout, data: {
            ...(slide.data || {}),
            items: layout === 'list' ? ensureListItems(slide) : layout === 'highlight' ? ensureHighlightItems(slide) : (_a = slide.data) === null || _a === void 0 ? void 0 : _a.items,
            steps: layout === 'steps' ? ensureSteps(slide) : (_b = slide.data) === null || _b === void 0 ? void 0 : _b.steps,
            timeline: layout === 'timeline' ? ensureTimeline(slide) : (_c = slide.data) === null || _c === void 0 ? void 0 : _c.timeline,
            chart: layout === 'chart' ? ensureChart(slide) : (_d = slide.data) === null || _d === void 0 ? void 0 : _d.chart,
            bars: layout === 'chart' ? (((_e = ensureChart(slide)) === null || _e === void 0 ? void 0 : _e.values) || ((_f = slide.data) === null || _f === void 0 ? void 0 : _f.bars)) : (_g = slide.data) === null || _g === void 0 ? void 0 : _g.bars,
            stats: layout === 'stats' ? ensureStats(slide) : (_h = slide.data) === null || _h === void 0 ? void 0 : _h.stats,
            ...(layout === 'compare' ? ensureCompare(slide) : null),
            ...(layout === 'quote' ? ensureQuote(slide) : null),
            ...((layout === 'hero' || layout === 'cta') ? ensureHeroData(slide) : null),
        }, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderLiquidBriefScene = ({ slide, index, totalSlides, durationInFrames }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const layout = getLayout(slide);
    let type = null;
    if (layout === 'hero')
        type = 'cover';
    if (layout === 'cta')
        type = 'cta';
    if (layout === 'steps')
        type = 'steps';
    if (layout === 'timeline')
        type = 'timeline';
    if (layout === 'compare')
        type = 'compare';
    if (layout === 'stats')
        type = 'stats';
    if (layout === 'chart')
        type = 'chart';
    if (layout === 'quote')
        type = 'quote';
    if (layout === 'highlight')
        type = 'highlight';
    if (layout === 'list' || layout === 'default')
        type = 'cards';
    if (!type) {
        return null;
    }
    const data = {
        ...(slide.data || {}),
        cards: type === 'cards'
            ? ensureListItems(slide).map((item, itemIndex) => ({
                eyebrow: item.icon || `0${itemIndex + 1}`,
                title: item.text,
                body: item.desc || '',
            }))
            : (_a = slide.data) === null || _a === void 0 ? void 0 : _a.cards,
        steps: type === 'steps' ? ensureSteps(slide) : (_b = slide.data) === null || _b === void 0 ? void 0 : _b.steps,
        timeline: type === 'timeline' ? ensureTimeline(slide) : (_c = slide.data) === null || _c === void 0 ? void 0 : _c.timeline,
        bars: type === 'chart' ? toTechRichBars(slide) : (_d = slide.data) === null || _d === void 0 ? void 0 : _d.bars,
        highlights: type === 'highlight' ? ensureHighlightItems(slide) : (_e = slide.data) === null || _e === void 0 ? void 0 : _e.highlights,
        stats: type === 'stats'
            ? ensureStats(slide).map((item) => ({
                value: `${item.value}${item.suffix || ''}`,
                label: item.label,
                note: item.note || '',
            }))
            : (_f = slide.data) === null || _f === void 0 ? void 0 : _f.stats,
        insights: type === 'stats'
            ? (slide.points || []).slice(0, 3)
            : (_g = slide.data) === null || _g === void 0 ? void 0 : _g.insights,
        cta: type === 'cta'
            ? typeof ((_h = slide.data) === null || _h === void 0 ? void 0 : _h.cta) === 'string'
                ? slide.data.cta
                : typeof ((_j = slide.data) === null || _j === void 0 ? void 0 : _j.button) === 'string'
                    ? slide.data.button
                    : '点赞收藏'
            : (_k = slide.data) === null || _k === void 0 ? void 0 : _k.cta,
        ...(type === 'compare' ? ensureCompare(slide) : null),
        ...(type === 'quote' ? ensureQuote(slide) : null),
    };
    return ((0, jsx_runtime_1.jsx)(LiquidBriefSlide_1.LiquidBriefSlide, { title: slide.title || '', subtitle: slide.subtitle, badge: typeof ((_l = slide.data) === null || _l === void 0 ? void 0 : _l.badge) === 'string' ? slide.data.badge : undefined, items: type === 'cover'
            ? ensureListItems(slide).map((item, itemIndex) => ({
                number: String(itemIndex + 1).padStart(2, '0'),
                title: item.text,
            }))
            : undefined, type: type, data: data, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const toTechRichListItems = (slide) => ensureListItems(slide);
const toTechRichBars = (slide) => {
    var _a;
    const chart = ensureChart(slide);
    if (chart) {
        return chart.values.map((item) => ({
            label: item.label,
            percent: item.value,
            value: item.value,
            color: item.color,
        }));
    }
    const bars = (_a = slide.data) === null || _a === void 0 ? void 0 : _a.bars;
    if (Array.isArray(bars)) {
        return bars
            .map((item) => {
            if (!item || typeof item !== 'object')
                return null;
            const record = item;
            const rawValue = typeof record.percent === 'number'
                ? record.percent
                : typeof record.value === 'number'
                    ? record.value
                    : null;
            if (typeof record.label !== 'string' || rawValue === null)
                return null;
            return {
                label: record.label,
                percent: rawValue,
                value: rawValue,
                color: typeof record.color === 'string' ? record.color : undefined,
            };
        })
            .filter((item) => item !== null);
    }
    // Fallback: generate bars from points
    return (slide.points || []).map((point, i, arr) => {
        const parsed = splitPoint(point);
        return {
            label: parsed.title,
            percent: Math.round(90 - (i / Math.max(arr.length - 1, 1)) * 50),
            value: Math.round(90 - (i / Math.max(arr.length - 1, 1)) * 50),
        };
    });
};
const renderTechScene = ({ slide, index, totalSlides, durationInFrames }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const layout = getLayout(slide);
    let type = null;
    if (layout === 'hero')
        type = 'title';
    if (layout === 'stats')
        type = 'stats';
    if (layout === 'list' || layout === 'default')
        type = 'list';
    if (layout === 'highlight')
        type = 'highlight';
    if (layout === 'steps')
        type = 'steps';
    if (layout === 'timeline')
        type = 'timeline';
    if (layout === 'chart')
        type = 'progress';
    if (layout === 'compare')
        type = 'compare';
    if (layout === 'quote')
        type = 'quote';
    if (layout === 'cta')
        type = 'cta';
    if (!type) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(TechSlide_1.TechSlide, { type: type, data: {
            ...(slide.data || {}),
            title: slide.title,
            subtitle: slide.subtitle,
            items: type === 'list'
                ? toTechRichListItems(slide)
                : type === 'highlight'
                    ? ensureHighlightItems(slide)
                    : (_a = slide.data) === null || _a === void 0 ? void 0 : _a.items,
            steps: type === 'steps' ? ensureSteps(slide) : (_b = slide.data) === null || _b === void 0 ? void 0 : _b.steps,
            timeline: type === 'timeline' ? ensureTimeline(slide) : (_c = slide.data) === null || _c === void 0 ? void 0 : _c.timeline,
            stats: type === 'stats' ? ensureStats(slide) : (_d = slide.data) === null || _d === void 0 ? void 0 : _d.stats,
            bars: type === 'progress' ? toTechRichBars(slide) : (_e = slide.data) === null || _e === void 0 ? void 0 : _e.bars,
            ...(type === 'compare' ? ensureCompare(slide) : null),
            ...(type === 'quote' ? ensureQuote(slide) : null),
            button: type === 'cta'
                ? typeof ((_f = slide.data) === null || _f === void 0 ? void 0 : _f.button) === 'string'
                    ? slide.data.button
                    : typeof ((_g = slide.data) === null || _g === void 0 ? void 0 : _g.cta) === 'string'
                        ? slide.data.cta
                        : 'Start now'
                : (_h = slide.data) === null || _h === void 0 ? void 0 : _h.button,
        }, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderRichScene = ({ slide, index, totalSlides, durationInFrames }) => {
    var _a, _b, _c, _d, _e, _f;
    const layout = getLayout(slide);
    let type = null;
    if (layout === 'hero')
        type = 'title';
    if (layout === 'stats')
        type = 'stats';
    if (layout === 'highlight')
        type = 'highlight';
    if (layout === 'chart')
        type = 'progress';
    if (layout === 'compare')
        type = 'compare';
    if (layout === 'quote')
        type = 'quote';
    if (layout === 'list' || layout === 'default' || layout === 'steps' || layout === 'timeline')
        type = 'list';
    if (layout === 'cta')
        type = 'cta';
    if (!type) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(RichSlide_1.RichSlide, { type: type, data: {
            ...(slide.data || {}),
            title: slide.title,
            subtitle: slide.subtitle,
            items: type === 'list'
                ? layout === 'steps'
                    ? ensureSteps(slide).map((item, itemIndex) => ({
                        icon: String(itemIndex + 1).padStart(2, '0'),
                        text: item.title,
                        desc: item.description,
                    }))
                    : layout === 'timeline'
                        ? ensureTimeline(slide).map((item) => ({
                            icon: item.year,
                            text: item.title,
                            desc: item.description,
                        }))
                        : toTechRichListItems(slide)
                : type === 'highlight'
                    ? ensureHighlightItems(slide)
                    : (_a = slide.data) === null || _a === void 0 ? void 0 : _a.items,
            stats: type === 'stats' ? ensureStats(slide) : (_b = slide.data) === null || _b === void 0 ? void 0 : _b.stats,
            bars: type === 'progress' ? toTechRichBars(slide) : (_c = slide.data) === null || _c === void 0 ? void 0 : _c.bars,
            ...(type === 'compare' ? ensureCompare(slide) : null),
            ...(type === 'quote' ? ensureQuote(slide) : null),
            button: type === 'cta'
                ? typeof ((_d = slide.data) === null || _d === void 0 ? void 0 : _d.button) === 'string'
                    ? slide.data.button
                    : typeof ((_e = slide.data) === null || _e === void 0 ? void 0 : _e.cta) === 'string'
                        ? slide.data.cta
                        : 'Start now'
                : (_f = slide.data) === null || _f === void 0 ? void 0 : _f.button,
        }, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const toKnowledgeHighlights = (slide) => {
    const items = ensureHighlightItems(slide);
    if (items.length === 0)
        return undefined;
    return items.map((text) => ({ text }));
};
const renderKnowledgeScene = ({ slide, index, totalSlides, durationInFrames }) => {
    const layout = getLayout(slide);
    const heroHighlights = toKnowledgeHighlights(slide);
    const statHighlights = toKnowledgeStatHighlights(slide);
    const comparePoints = toKnowledgeComparePoints(slide);
    const quotePoints = toKnowledgeQuotePoints(slide);
    const ctaPoints = toKnowledgeCtaPoints(slide);
    return ((0, jsx_runtime_1.jsx)(KnowledgeSlide_1.KnowledgeSlide, { title: slide.title, subtitle: slide.subtitle, type: layout, data: layout === 'compare'
            ? ensureCompare(slide) || slide.data
            : layout === 'quote'
                ? ensureQuote(slide)
                : layout === 'cta'
                    ? slide.data
                    : slide.data, points: layout === 'default' || layout === 'list'
            ? toCompactPoints(slide)
            : layout === 'cta'
                ? ctaPoints
                : layout === 'compare'
                    ? comparePoints
                    : layout === 'quote'
                        ? quotePoints
                        : undefined, highlights: layout === 'highlight'
            ? toKnowledgeHighlights(slide)
            : layout === 'stats'
                ? statHighlights
                : layout === 'hero'
                    ? heroHighlights
                    : undefined, steps: layout === 'steps' ? ensureSteps(slide) : undefined, timeline: layout === 'timeline' ? ensureTimeline(slide) : undefined, chart: layout === 'chart' ? ensureChart(slide) : undefined, elementTimings: slide.elementTimings, slideAudioStart: slide.audioStart, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const LANDSCAPE_SUPPORTED_LAYOUTS = new Set([
    'default',
    'steps',
    'timeline',
    'chart',
    'highlight',
    'list',
    'compare',
    'stats',
    'quote',
    'hero',
    'cta',
]);
const renderLandscapeScene = ({ slide, index, totalSlides, durationInFrames }, Component) => {
    const layout = getLayout(slide);
    if (!LANDSCAPE_SUPPORTED_LAYOUTS.has(layout)) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(Component, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: layout, data: slide.data, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderMacScene = (props) => renderLandscapeScene(props, MacSlide_1.MacSlide);
const renderStudioScene = (props) => renderLandscapeScene(props, StudioSlide_1.StudioSlide);
const renderEditorialScene = (props) => renderLandscapeScene(props, EditorialSlide_1.EditorialSlide);
const renderInsightScene = (props) => renderLandscapeScene(props, InsightSlide_1.InsightSlide);
const renderStickScene = ({ slide, index, totalSlides, durationInFrames }) => {
    const layout = getLayout(slide);
    if (!LANDSCAPE_SUPPORTED_LAYOUTS.has(layout)) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(StickSlide_1.StickSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: layout, data: slide.data, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderCosmosScene = ({ slide, index, totalSlides, durationInFrames }) => {
    const layout = getLayout(slide);
    if (!LANDSCAPE_SUPPORTED_LAYOUTS.has(layout)) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(CosmosSlide_1.CosmosSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: layout, data: slide.data, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderProjectScene = ({ slide, index, totalSlides, durationInFrames }) => {
    const layout = getLayout(slide);
    if (!LANDSCAPE_SUPPORTED_LAYOUTS.has(layout)) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(ProjectSlide_1.ProjectSlide, { title: slide.title || '', subtitle: slide.subtitle, points: slide.points, type: layout, data: slide.data, index: index, totalSlides: totalSlides, durationInFrames: durationInFrames }));
};
const renderTemplateScene = (props) => {
    switch (props.template) {
        case 'GlassShow':
            return renderGlassScene(props);
        case 'LiquidShow':
            return renderLiquidScene(props);
        case 'LiquidBriefShow':
            return renderLiquidBriefScene(props);
        case 'TechShow':
            return renderTechScene(props);
        case 'RichShow':
            return renderRichScene(props);
        case 'KnowledgeShow':
            return renderKnowledgeScene(props);
        case 'MacShow':
            return renderMacScene(props);
        case 'StudioShow':
            return renderStudioScene(props);
        case 'EditorialShow':
            return renderEditorialScene(props);
        case 'InsightShow':
            return renderInsightScene(props);
        case 'StickShow':
            return renderStickScene(props);
        case 'CosmosShow':
            return renderCosmosScene(props);
        case 'ProjectShow':
            return renderProjectScene(props);
        default:
            return null;
    }
};
exports.renderTemplateScene = renderTemplateScene;
