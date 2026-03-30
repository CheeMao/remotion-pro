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

export const parseJsonWithRepair = <T>(content: string, sourceLabel: string): {
  data: T;
  repairedContent?: string;
} => {
  try {
    return { data: JSON.parse(content) as T };
  } catch (error) {
    const repairedContent = repairMissingTrailingQuotes(content);
    if (repairedContent) {
      try {
        return {
          data: JSON.parse(repairedContent) as T,
          repairedContent,
        };
      } catch {
        // Fall through to the original parser error below.
      }
    }

    if (error instanceof Error) {
      throw new Error(`Failed to parse JSON from ${sourceLabel}: ${error.message}`);
    }

    throw error;
  }
};
