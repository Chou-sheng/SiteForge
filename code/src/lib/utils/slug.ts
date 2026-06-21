const pinyinDictionary: Record<string, string> = {
  企业: "qi-ye",
  官网: "guan-wang",
  教育: "jiao-yu",
  平台: "ping-tai",
  智能: "zhi-neng",
  咨询: "zi-xun",
  服务: "fu-wu",
  品牌: "pin-pai",
  落地页: "luo-di-ye",
  产品: "chan-pin",
  系统: "xi-tong",
  科技: "ke-ji",
  方案: "fang-an",
  教: "jiao",
  育: "yu",
  平: "ping",
  台: "tai",
  企: "qi",
  业: "ye",
  官: "guan",
  网: "wang",
};

const dictionaryKeys = Object.keys(pinyinDictionary).sort((a, b) => b.length - a.length);
const chineseCharacterPattern = /[\u4E00-\u9FFF]/u;

function tokenizeChinese(input: string) {
  const tokens: string[] = [];
  let index = 0;

  while (index < input.length) {
    const match = dictionaryKeys.find((key) => input.startsWith(key, index));

    if (match) {
      tokens.push(pinyinDictionary[match]);
      index += match.length;
      continue;
    }

    if (chineseCharacterPattern.test(input[index])) {
      tokens.push("page");
    }

    index += 1;
  }

  return tokens;
}

export function createSlug(input: string) {
  const segments: string[] = [];
  let asciiBuffer = "";
  let chineseBuffer = "";

  const flushAscii = () => {
    if (asciiBuffer) {
      segments.push(asciiBuffer.toLowerCase());
      asciiBuffer = "";
    }
  };

  const flushChinese = () => {
    if (chineseBuffer) {
      segments.push(...tokenizeChinese(chineseBuffer));
      chineseBuffer = "";
    }
  };

  for (const char of input.trim()) {
    if (chineseCharacterPattern.test(char)) {
      flushAscii();
      chineseBuffer += char;
      continue;
    }

    flushChinese();

    if (/[\p{Letter}\p{Number}]/u.test(char)) {
      asciiBuffer += char;
      continue;
    }

    flushAscii();
  }

  flushAscii();
  flushChinese();

  const slug = segments
    .join("-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "page";
}

export function ensureUniqueSlug(slug: string, existingSlugs: readonly string[]) {
  const baseSlug = createSlug(slug);
  const existing = new Set(existingSlugs);

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}
