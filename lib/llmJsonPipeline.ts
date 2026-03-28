/**
 * Shared parsing: LLM-shaped JSON → senses + rounds (used by remote LLM and local WordNet JSON bundle).
 */
import type {
  ChallengeRound,
  DistractorTaxonomy,
  EngineOutput,
  POS,
  SenseSlot,
} from "./types";
import { buildSemanticGraph } from "./graphUtils";

export type LLMWrong = {
  text: string;
  taxonomy: string;
  explainTa: string;
  explainEn: string;
};

export type LLMJson = {
  senses: Array<{
    id: string;
    pos: string;
    glossEn: string;
    meaningTa: string;
    sentence: string;
    correctFragment: string;
    morphForms?: string[];
  }>;
  distractorsBySense: Array<{
    senseId: string;
    wrongs?: LLMWrong[];
    wrongOptions?: string[];
  }>;
};

const TAXA: DistractorTaxonomy[] = [
  "wrong_POS",
  "same_POS_wrong_sense",
  "collocation_break",
  "near_synonym",
];

function normTax(s: string): DistractorTaxonomy {
  return TAXA.includes(s as DistractorTaxonomy)
    ? (s as DistractorTaxonomy)
    : "same_POS_wrong_sense";
}

export function llmJsonToSenseAndRounds(data: LLMJson): {
  senses: SenseSlot[];
  rounds: ChallengeRound[];
} | null {
  const senses: SenseSlot[] = [];
  const rounds: ChallengeRound[] = [];

  for (const s of data.senses) {
    const pos = (["Noun", "Verb", "Adj", "Other"].includes(s.pos)
      ? s.pos
      : "Other") as POS;
    if (!s.sentence?.includes(s.correctFragment)) {
      return null;
    }
    senses.push({
      id: s.id,
      pos,
      glossEn: s.glossEn,
      meaningTa: s.meaningTa,
      sentenceTemplate: s.sentence.replace(s.correctFragment, "_____"),
      wordForm: s.correctFragment,
      morphForms:
        Array.isArray(s.morphForms) && s.morphForms.length >= 2
          ? s.morphForms.slice(0, 6)
          : undefined,
    });

    const dist = data.distractorsBySense.find((d) => d.senseId === s.id);
    let wrongs: LLMWrong[] = [];

    if (dist?.wrongs?.length === 3) {
      wrongs = dist.wrongs;
    } else if (dist?.wrongOptions?.length === 3) {
      wrongs = dist.wrongOptions.map((text) => ({
        text,
        taxonomy: "same_POS_wrong_sense",
        explainTa: "இந்த வாக்கியத்தில் பொருந்தாது.",
        explainEn: "Does not fit this sentence sense.",
      }));
    } else {
      return null;
    }

    const options = [s.correctFragment, wrongs[0]!.text, wrongs[1]!.text, wrongs[2]!.text];
    const uniq = new Set(options.map((x) => x.trim()));
    if (uniq.size !== 4) {
      return null;
    }

    const optionRoles = [
      "correct" as const,
      normTax(wrongs[0]!.taxonomy),
      normTax(wrongs[1]!.taxonomy),
      normTax(wrongs[2]!.taxonomy),
    ];
    const explainWrongTa = [
      null,
      wrongs[0]!.explainTa,
      wrongs[1]!.explainTa,
      wrongs[2]!.explainTa,
    ];
    const explainWrongEn = [
      null,
      wrongs[0]!.explainEn,
      wrongs[1]!.explainEn,
      wrongs[2]!.explainEn,
    ];

    rounds.push({
      senseId: s.id,
      sentence: s.sentence,
      options,
      correctIndex: 0,
      optionRoles,
      explainWrongTa,
      explainWrongEn,
    });
  }

  return { senses, rounds };
}

export function llmJsonToEngineOutput(
  inputWord: string,
  json: LLMJson,
  source: EngineOutput["source"],
  generationNotes?: string
): EngineOutput | null {
  if (!json?.senses?.length) return null;
  const parsed = llmJsonToSenseAndRounds(json);
  if (!parsed) return null;
  const { senses, rounds } = parsed;
  if (senses.length < 2) return null;
  const graph = buildSemanticGraph(inputWord, senses, rounds);
  return {
    inputWord,
    normalizedWord: inputWord,
    senses,
    rounds,
    graph,
    source,
    generationNotes,
  };
}
