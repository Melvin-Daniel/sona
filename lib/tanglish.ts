/**
 * Tamil → informal Latin (Tanglish-style) for UI hints.
 * Handles common syllables; unknown code points are skipped.
 */

const STANDALONE_VOWEL: Record<string, string> = {
  "\u0B85": "a",
  "\u0B86": "aa",
  "\u0B87": "i",
  "\u0B88": "ii",
  "\u0B89": "u",
  "\u0B8A": "uu",
  "\u0B8E": "e",
  "\u0B8F": "ae",
  "\u0B90": "ai",
  "\u0B92": "o",
  "\u0B93": "oa",
  "\u0B94": "au",
};

/** Consonant body with pulli (no inherent vowel). */
const CONSONANT_BARE: Record<string, string> = {
  "\u0B95": "k",
  "\u0B99": "ng",
  /** ச — Tanglish often "s" (sol, samayam). */
  "\u0B9A": "s",
  "\u0B9C": "j",
  "\u0B9E": "ny",
  /** Retroflex ட — Tanglish often written "d" (e.g. padi). */
  "\u0B9F": "d",
  "\u0BA3": "n",
  "\u0BA4": "th",
  "\u0BA8": "n",
  "\u0BA9": "n",
  "\u0BAA": "p",
  "\u0BAE": "m",
  "\u0BAF": "y",
  "\u0BB0": "r",
  /** ற — simplify to "r" for hints (e.g. aaru). */
  "\u0BB1": "r",
  "\u0BB2": "l",
  "\u0BB3": "zh",
  "\u0BB4": "l",
  "\u0BB5": "v",
  "\u0BB6": "sh",
  "\u0BB7": "sh",
  "\u0BB8": "s",
  "\u0BB9": "h",
};

const VIRAMA = "\u0BCD";

/** Single dependent vowel sign (after consonant). */
const VOWEL_SIGN_1: Record<string, string> = {
  "\u0BBE": "aa",
  "\u0BBF": "i",
  "\u0BC0": "ii",
  "\u0BC1": "u",
  "\u0BC2": "uu",
  "\u0BC6": "e",
  "\u0BC7": "ae",
  "\u0BC8": "ai",
};

function isTamilChar(ch: string): boolean {
  if (!ch) return false;
  const cp = ch.codePointAt(0)!;
  return cp >= 0x0b80 && cp <= 0x0bff;
}

function readVowelAfterConsonant(s: string, i: number): { tail: string; len: number } | null {
  if (i >= s.length) return null;
  const a = s[i];
  const b = s[i + 1];
  // Precomposed vowel signs (NFC) on consonants
  if (a === "\u0BCA") return { tail: "o", len: 1 };
  if (a === "\u0BCB") return { tail: "oa", len: 1 };
  if (a === "\u0BCC") return { tail: "au", len: 1 };
  // Compound signs (two code points, NFD-style)
  if (a === "\u0BC6" && b === "\u0BBE") return { tail: "o", len: 2 };
  if (a === "\u0BC7" && b === "\u0BBE") return { tail: "oa", len: 2 };
  if (a === "\u0BC6" && b === "\u0BD7") return { tail: "au", len: 2 };
  const one = VOWEL_SIGN_1[a];
  if (one) return { tail: one, len: 1 };
  return null;
}

/**
 * Convert a Tamil string to Tanglish-style Latin (lowercase).
 * Returns "" if there are no Tamil letters in `input`.
 */
export function tamilToTanglish(input: string): string {
  const s = input.normalize("NFC").trim();
  if (!s) return "";
  if (!/[\u0B80-\u0BFF]/.test(s)) return "";

  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;

    if (ch === " " || ch === "-" || ch === "\u200C" || ch === "\u200D") {
      out += ch === "\u200C" || ch === "\u200D" ? "" : ch;
      i += 1;
      continue;
    }

    const sv = STANDALONE_VOWEL[ch];
    if (sv !== undefined) {
      out += sv;
      i += 1;
      continue;
    }

    const bare = CONSONANT_BARE[ch];
    if (bare !== undefined) {
      i += 1;
      if (i < s.length && s[i] === VIRAMA) {
        out += bare;
        i += 1;
        continue;
      }
      const vs = readVowelAfterConsonant(s, i);
      if (vs) {
        out += bare + vs.tail;
        i += vs.len;
        continue;
      }
      out += bare + "a";
      continue;
    }

    // ஃ aytham — skip or light hint
    if (ch === "\u0B83") {
      i += 1;
      continue;
    }

    if (isTamilChar(ch)) {
      i += 1;
      continue;
    }

    i += 1;
  }

  return out;
}

/** Roman hint in parentheses for mixed UI (e.g. after a Tamil sentence). */
export function tanglishSuffix(ta: string): string {
  const t = tamilToTanglish(ta);
  return t ? ` (${t})` : "";
}

