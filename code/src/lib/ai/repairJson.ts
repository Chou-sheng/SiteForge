function tryParseObject(text: string): unknown | null {
  try {
    const parsed = JSON.parse(text) as unknown;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function findBalancedObject(text: string): string | null {
  const start = text.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return null;
}

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  const direct = tryParseObject(trimmed);

  if (direct) {
    return direct;
  }

  const fencePattern = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match = fencePattern.exec(text);

  while (match) {
    const fenced = match[1]?.trim() ?? "";
    const parsedFence = tryParseObject(fenced);

    if (parsedFence) {
      return parsedFence;
    }

    const balancedFence = findBalancedObject(fenced);

    if (balancedFence) {
      const parsedBalancedFence = tryParseObject(balancedFence);

      if (parsedBalancedFence) {
        return parsedBalancedFence;
      }
    }

    match = fencePattern.exec(text);
  }

  const balanced = findBalancedObject(text);

  if (!balanced) {
    return null;
  }

  return tryParseObject(balanced);
}
