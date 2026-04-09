"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonWithRepair = exports.repairMissingTrailingQuotes = void 0;
const countUnescapedQuotes = (line) => {
    let count = 0;
    let escaped = false;
    for (const char of line) {
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (char === '"') {
            count += 1;
        }
    }
    return count;
};
const stripBom = (content) => {
    return content.replace(/^\uFEFF/, '');
};
const extractJsonFromCodeFence = (content) => {
    var _a;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return ((_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) || null;
};
const extractBalancedJsonBlock = (content) => {
    const trimmed = content.trim();
    const objectStart = trimmed.indexOf('{');
    const objectEnd = trimmed.lastIndexOf('}');
    const arrayStart = trimmed.indexOf('[');
    const arrayEnd = trimmed.lastIndexOf(']');
    const objectCandidate = objectStart >= 0 && objectEnd > objectStart
        ? trimmed.slice(objectStart, objectEnd + 1).trim()
        : null;
    const arrayCandidate = arrayStart >= 0 && arrayEnd > arrayStart
        ? trimmed.slice(arrayStart, arrayEnd + 1).trim()
        : null;
    if (objectCandidate && arrayCandidate) {
        return objectStart <= arrayStart ? objectCandidate : arrayCandidate;
    }
    return objectCandidate || arrayCandidate;
};
const repairMissingTrailingQuotes = (content) => {
    const lines = content.split(/\r?\n/);
    let changed = false;
    const repaired = lines.map((line) => {
        const quoteCount = countUnescapedQuotes(line);
        if (quoteCount % 2 === 0) {
            return line;
        }
        const trimmedEnd = line.trimEnd();
        const trailingWhitespace = line.slice(trimmedEnd.length);
        const trimmedStart = trimmedEnd.trimStart();
        const looksLikeStringProperty = trimmedStart.includes(': "') || trimmedStart.startsWith('"');
        if (!looksLikeStringProperty) {
            return line;
        }
        let nextLine = trimmedEnd;
        if (trimmedEnd.endsWith(',')) {
            nextLine = `${trimmedEnd.slice(0, -1)}",`;
        }
        else if (!trimmedEnd.endsWith('"')) {
            nextLine = `${trimmedEnd}"`;
        }
        if (nextLine === trimmedEnd) {
            return line;
        }
        changed = true;
        return `${nextLine}${trailingWhitespace}`;
    });
    return changed ? repaired.join('\n') : null;
};
exports.repairMissingTrailingQuotes = repairMissingTrailingQuotes;
const buildJsonCandidates = (content) => {
    const normalized = stripBom(content).trim();
    const candidates = new Set();
    if (normalized) {
        candidates.add(normalized);
    }
    const fenced = extractJsonFromCodeFence(normalized);
    if (fenced) {
        candidates.add(fenced);
    }
    const block = extractBalancedJsonBlock(normalized);
    if (block) {
        candidates.add(block);
    }
    return Array.from(candidates);
};
const parseJsonWithRepair = (content, sourceLabel) => {
    const candidates = buildJsonCandidates(content);
    let lastError;
    for (const candidate of candidates) {
        try {
            return { data: JSON.parse(candidate) };
        }
        catch (error) {
            lastError = error;
        }
        const repairedContent = (0, exports.repairMissingTrailingQuotes)(candidate);
        if (repairedContent) {
            try {
                return {
                    data: JSON.parse(repairedContent),
                    repairedContent,
                };
            }
            catch (error) {
                lastError = error;
            }
        }
    }
    if (lastError instanceof Error) {
        throw new Error(`Failed to parse JSON from ${sourceLabel}: ${lastError.message}`);
    }
    throw new Error(`Failed to parse JSON from ${sourceLabel}: Unknown parse error`);
};
exports.parseJsonWithRepair = parseJsonWithRepair;
