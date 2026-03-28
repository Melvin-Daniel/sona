import type {
  ChallengeRound,
  GuardrailResult,
  OptionRole,
  SenseSlot,
} from "./types";

const TAMIL_RANGE = /[\u0B80-\u0BFF]/;

function hasTamilScript(s: string): boolean {
  return TAMIL_RANGE.test(s);
}

function uniqueStrings(arr: string[]): boolean {
  const set = new Set(arr.map((x) => x.trim()));
  return set.size === arr.length;
}

type Bundle = {
  text: string;
  role?: OptionRole;
  explainTa: string | null;
  explainEn: string | null;
};

/**
 * Shuffle options and parallel metadata (roles, explanations).
 */
export function shuffleRound(round: ChallengeRound): ChallengeRound {
  const n = round.options.length;
  const bundles: Bundle[] = round.options.map((text, i) => ({
    text,
    role:
      round.optionRoles?.[i] ??
      (i === round.correctIndex ? "correct" : "same_POS_wrong_sense"),
    explainTa: round.explainWrongTa?.[i] ?? null,
    explainEn: round.explainWrongEn?.[i] ?? null,
  }));

  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bundles[i], bundles[j]] = [bundles[j], bundles[i]];
  }

  const correctText = round.options[round.correctIndex];
  const newCorrectIndex = bundles.findIndex((b) => b.text === correctText);
  const fixIdx = newCorrectIndex >= 0 ? newCorrectIndex : 0;
  const options = bundles.map((b) => b.text);
  const optionRoles = bundles.map((b, i) => {
    if (i === fixIdx) return "correct" as const;
    if (b.role === "correct") return "near_synonym" as const;
    return (b.role ?? "same_POS_wrong_sense") as OptionRole;
  });
  const explainWrongTa = bundles.map((b) => b.explainTa);
  const explainWrongEn = bundles.map((b) => b.explainEn);

  return {
    ...round,
    options,
    correctIndex: fixIdx,
    optionRoles,
    explainWrongTa,
    explainWrongEn,
  };
}

export function validateEngineOutput(input: {
  senses: SenseSlot[];
  rounds: ChallengeRound[];
}): GuardrailResult {
  const flags: string[] = [];
  let needsHumanReview = false;

  if (input.senses.length < 2) {
    flags.push("Fewer_than_two_senses");
    needsHumanReview = true;
  }

  const sanitizedRounds: ChallengeRound[] = [];

  for (const r of input.rounds) {
    const localFlags: string[] = [];

    if (!r.sentence?.trim()) {
      localFlags.push("empty_sentence");
      needsHumanReview = true;
    }
    if (!Array.isArray(r.options) || r.options.length !== 4) {
      localFlags.push("options_must_be_four");
      needsHumanReview = true;
    }
    if (!uniqueStrings(r.options || [])) {
      localFlags.push("duplicate_options");
      needsHumanReview = true;
    }
    if (
      r.correctIndex < 0 ||
      r.correctIndex > 3 ||
      !r.options[r.correctIndex]
    ) {
      localFlags.push("invalid_correct_index");
      needsHumanReview = true;
    }

    const tamilCoverage = [r.sentence, ...r.options].filter(hasTamilScript).length;
    if (tamilCoverage < 2) {
      localFlags.push("low_tamil_script_coverage");
      needsHumanReview = true;
    }

    if (localFlags.length) {
      flags.push(`round_${r.senseId}:${localFlags.join(",")}`);
    }

    sanitizedRounds.push({ ...r });
  }

  const ok = !needsHumanReview && flags.length === 0;
  return { ok, flags, needsHumanReview, sanitizedRounds };
}
