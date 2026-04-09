const countUnescapedQuotes = (line: string): number => {
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

const stripBom = (content: string): string => {
  return content.replace(/^\uFEFF/, '');
};

const extractJsonFromCodeFence = (content: string): string | null => {
  const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return match?.[1]?.trim() || null;
};

const extractBalancedJsonBlock = (content: string): string | null => {
  const trimmed = content.trim();
  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');
  const arrayStart = trimmed.indexOf('[');
  const arrayEnd = trimmed.lastIndexOf(']');

  const objectCandidate =
    objectStart >= 0 && objectEnd > objectStart
      ? trimmed.slice(objectStart, objectEnd + 1).trim()
      : null;
  const arrayCandidate =
    arrayStart >= 0 && arrayEnd > arrayStart
      ? trimmed.slice(arrayStart, arrayEnd + 1).trim()
      : null;

  if (objectCandidate && arrayCandidate) {
    return objectStart <= arrayStart ? objectCandidate : arrayCandidate;
  }

  return objectCandidate || arrayCandidate;
};

export const repairMissingTrailingQuotes = (content: string): string | null => {
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
    const looksLikeStringProperty =
      trimmedStart.includes(': "') || trimmedStart.startsWith('"');

    if (!looksLikeStringProperty) {
      return line;
    }

    let nextLine = trimmedEnd;
    if (trimmedEnd.endsWith(',')) {
      nextLine = `${trimmedEnd.slice(0, -1)}",`;
    } else if (!trimmedEnd.endsWith('"')) {
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

const buildJsonCandidates = (content: string): string[] => {
  const normalized = stripBom(content).trim();
  const candidates = new Set<string>();

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

export const parseJsonWithRepair = <T>(content: string, sourceLabel: string): {
  data: T;
  repairedContent?: string;
} => {
  const candidates = buildJsonCandidates(content);
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      return { data: JSON.parse(candidate) as T };
    } catch (error) {
      lastError = error;
    }

    const repairedContent = repairMissingTrailingQuotes(candidate);
    if (repairedContent) {
      try {
        return {
          data: JSON.parse(repairedContent) as T,
          repairedContent,
        };
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (lastError instanceof Error) {
    throw new Error(`Failed to parse JSON from ${sourceLabel}: ${lastError.message}`);
  }

  throw new Error(`Failed to parse JSON from ${sourceLabel}: Unknown parse error`);
};
