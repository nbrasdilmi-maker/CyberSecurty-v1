const ARABIC_TO_LATIN: Record<string, string> = {
  "ا": "a", "أ": "a", "إ": "e", "آ": "a", "ب": "b", "ت": "t", "ث": "th",
  "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
  "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "dh", "ع": "a",
  "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
  "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "h", "ء": "", "ئ": "y",
  "ؤ": "w", " ": "-", "َ": "", "ُ": "", "ِ": "", "ٌ": "", "ً": "", "ٍ": "",
  "ّ": "", "ْ": "",
};

const ROLE_SUFFIX: Record<string, string> = {
  ADMIN: "-ad",
  MANAGEMENT: "-mg",
  TEACHER: "-tc",
  STUDENT: "-st",
};

const LEVEL_SUFFIX: Record<string, string> = {
  LEVEL_1: "l1",
  LEVEL_2: "l2",
  LEVEL_3: "l3",
  LEVEL_4: "l4",
};

function transliterate(name: string): string {
  let result = "";
  for (const char of name) {
    result += ARABIC_TO_LATIN[char] || char;
  }
  return result.replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function removeRepeatedChars(s: string): string {
  return s.replace(/(.)\1+/g, "$1");
}

export function generateUsername(name: string, role: string, level?: string | null): string {
  const latin = removeRepeatedChars(transliterate(name));
  const rolePart = ROLE_SUFFIX[role] || "";
  const levelPart = level ? (LEVEL_SUFFIX[level] || "") : "";
  const base = latin.slice(0, 8) + (levelPart ? `.${levelPart}` : "") + rolePart;
  const random = Math.random().toString(36).substring(2, 5);
  return `${base}.${random}`;
}
