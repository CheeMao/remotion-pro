"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlideMediaOverlay = exports.slideHasRenderableMedia = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const EXTERNAL_MEDIA_PATTERN = /^(https?:|data:|blob:|file:|asset:|tauri:)/i;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;
const readString = (value) => {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const readFocalPoint = (value) => {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    const record = value;
    if (typeof record.x !== 'number' || typeof record.y !== 'number') {
        return undefined;
    }
    return { x: record.x, y: record.y };
};
const toFileUrl = (value) => {
    const normalizedPath = value.replace(/\\/g, '/');
    return encodeURI(`file:///${normalizedPath}`);
};
const toStaticAssetPath = (value) => {
    const withoutPublicPrefix = value.replace(/^public[\\/]/i, '');
    const normalized = withoutPublicPrefix.replace(/^\.?[\\/]/, '').replace(/\\/g, '/');
    return (0, remotion_1.staticFile)(normalized);
};
const resolveMediaSource = (value) => {
    if (EXTERNAL_MEDIA_PATTERN.test(value)) {
        return value;
    }
    if (WINDOWS_ABSOLUTE_PATH_PATTERN.test(value)) {
        return toFileUrl(value);
    }
    return toStaticAssetPath(value);
};
const normalizeMediaInput = (value, defaultRole) => {
    var _a, _b, _c, _d, _e, _f;
    if (typeof value === 'string') {
        return {
            kind: 'image',
            role: defaultRole,
            src: resolveMediaSource(value),
        };
    }
    if (!value || typeof value !== 'object') {
        return null;
    }
    const record = value;
    const rawSource = (_d = (_c = (_b = (_a = readString(record.url)) !== null && _a !== void 0 ? _a : readString(record.remoteUrl)) !== null && _b !== void 0 ? _b : readString(record.localPath)) !== null && _c !== void 0 ? _c : readString(record.path)) !== null && _d !== void 0 ? _d : readString(record.src);
    if (!rawSource) {
        return null;
    }
    const role = (_e = readString(record.role)) !== null && _e !== void 0 ? _e : defaultRole;
    return {
        kind: (_f = readString(record.kind)) !== null && _f !== void 0 ? _f : 'image',
        role,
        sourceType: readString(record.sourceType),
        url: readString(record.url),
        remoteUrl: readString(record.remoteUrl),
        localPath: readString(record.localPath),
        path: readString(record.path),
        query: readString(record.query),
        alt: readString(record.alt),
        credit: readString(record.credit),
        focalPoint: readFocalPoint(record.focalPoint),
        src: resolveMediaSource(rawSource),
    };
};
const collectSlideMedia = (slide) => {
    const slideRecord = slide;
    const slideData = slide.data && typeof slide.data === 'object'
        ? slide.data
        : {};
    const candidates = [];
    (slide.media || []).forEach((item) => {
        candidates.push({ value: item, role: item.role || 'support' });
    });
    if (Array.isArray(slideData.media)) {
        slideData.media.forEach((item) => {
            candidates.push({ value: item, role: 'support' });
        });
    }
    candidates.push({ value: slideRecord.backgroundImage, role: 'background' }, { value: slideData.backgroundImage, role: 'background' }, { value: slideRecord.coverImage, role: 'hero' }, { value: slideData.coverImage, role: 'hero' }, { value: slideRecord.image, role: 'hero' }, { value: slideData.image, role: 'hero' });
    const normalizedMedia = [];
    const seenKeys = new Set();
    candidates.forEach(({ value, role }) => {
        const normalized = normalizeMediaInput(value, role);
        if (!normalized) {
            return;
        }
        const dedupeKey = `${normalized.role}:${normalized.src}`;
        if (seenKeys.has(dedupeKey)) {
            return;
        }
        seenKeys.add(dedupeKey);
        normalizedMedia.push(normalized);
    });
    return normalizedMedia;
};
const getObjectPosition = (asset) => {
    if (!(asset === null || asset === void 0 ? void 0 : asset.focalPoint)) {
        return 'center center';
    }
    return `${asset.focalPoint.x}% ${asset.focalPoint.y}%`;
};
const slideHasRenderableMedia = (slide) => collectSlideMedia(slide).length > 0;
exports.slideHasRenderableMedia = slideHasRenderableMedia;
const MediaCard = ({ asset, frame, fps, width, height, right, top, rotation, opacity }) => {
    const progress = (0, remotion_1.spring)({
        frame: frame - 6,
        fps,
        config: { damping: 16, stiffness: 90 },
    });
    const translateY = (0, remotion_1.interpolate)(progress, [0, 1], [48, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const scale = (0, remotion_1.interpolate)(progress, [0, 1], [0.94, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            right,
            top,
            width,
            height,
            opacity,
            transform: `translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    inset: 18,
                    borderRadius: 34,
                    background: 'rgba(56, 189, 248, 0.18)',
                    filter: 'blur(54px)',
                    transform: 'scale(1.04)',
                } }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 34,
                    overflow: 'hidden',
                    background: 'rgba(10, 14, 23, 0.82)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.36)',
                }, children: [(0, jsx_runtime_1.jsx)(remotion_1.Img, { src: asset.src, style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: getObjectPosition(asset),
                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(12,18,28,0.02) 0%, rgba(12,18,28,0.1) 58%, rgba(12,18,28,0.34) 100%)',
                        } }), asset.credit ? ((0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            left: 18,
                            right: 18,
                            bottom: 16,
                            fontSize: 18,
                            color: 'rgba(255,255,255,0.74)',
                            textShadow: '0 2px 10px rgba(0,0,0,0.28)',
                        }, children: asset.credit })) : null] })] }));
};
const SlideMediaOverlay = ({ slide, frame, fps, }) => {
    var _a, _b, _c, _d, _e;
    const assets = collectSlideMedia(slide);
    if (assets.length === 0) {
        return null;
    }
    const layout = slide.layout || slide.type || 'default';
    const backgroundAsset = (_b = (_a = assets.find((asset) => asset.role === 'background')) !== null && _a !== void 0 ? _a : assets.find((asset) => asset.role === 'hero')) !== null && _b !== void 0 ? _b : assets[0];
    const compareAssets = assets.filter((asset) => asset.role === 'compare-left' || asset.role === 'compare-right');
    const primaryAsset = (_e = (_d = (_c = compareAssets[0]) !== null && _c !== void 0 ? _c : assets.find((asset) => asset.role === 'hero')) !== null && _d !== void 0 ? _d : assets.find((asset) => asset.role === 'support')) !== null && _e !== void 0 ? _e : assets[0];
    const secondaryAsset = compareAssets.length > 1
        ? compareAssets[1]
        : assets.find((asset) => asset.src !== primaryAsset.src && asset.role !== 'background');
    const reveal = (0, remotion_1.spring)({
        frame,
        fps,
        config: { damping: 20, stiffness: 70 },
    });
    const panelOpacity = (0, remotion_1.interpolate)(reveal, [0, 1], [0, 0.34], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const isTextHeavyLayout = ['steps', 'list', 'stats', 'timeline', 'chart'].includes(layout);
    const primaryWidth = isTextHeavyLayout ? 332 : 404;
    const primaryHeight = isTextHeavyLayout ? 500 : 620;
    const primaryTopFromViewport = isTextHeavyLayout ? 1180 : 940;
    const secondaryWidth = isTextHeavyLayout ? 236 : 260;
    const secondaryHeight = isTextHeavyLayout ? 172 : 196;
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { pointerEvents: 'none' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: 0,
                    right: -24,
                    width: '64%',
                    height: '100%',
                    opacity: panelOpacity,
                    overflow: 'hidden',
                    maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.92) 40%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.92) 40%, black 100%)',
                }, children: [(0, jsx_runtime_1.jsx)(remotion_1.Img, { src: backgroundAsset.src, style: {
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: getObjectPosition(backgroundAsset),
                            filter: 'blur(18px) saturate(1.05)',
                            transform: 'scale(1.12)',
                        } }), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(90deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.16) 20%, rgba(2,6,23,0.42) 62%, rgba(2,6,23,0.58) 100%)',
                        } })] }), (0, jsx_runtime_1.jsx)(MediaCard, { asset: primaryAsset, frame: frame, fps: fps, width: primaryWidth, height: primaryHeight, right: 38, top: primaryTopFromViewport, rotation: isTextHeavyLayout ? -3 : -2, opacity: 0.94 }), secondaryAsset ? ((0, jsx_runtime_1.jsx)(MediaCard, { asset: secondaryAsset, frame: frame + 3, fps: fps, width: secondaryWidth, height: secondaryHeight, right: primaryWidth + 48, top: primaryTopFromViewport - 82, rotation: 5, opacity: 0.82 })) : null] }));
};
exports.SlideMediaOverlay = SlideMediaOverlay;
