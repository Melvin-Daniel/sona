/**
 * Local lexical pipeline: optional JSON lemmas + Tamil WordNet–aligned curated seeds.
 * No network calls.
 */
import type { EngineOutput } from "../types";
import { getSeed, listSeedWords } from "../seed";
import type { LLMJson } from "../llmJsonPipeline";
import { llmJsonToEngineOutput } from "../llmJsonPipeline";
import lexiconExtra from "./lexicon.json";

const SEED_WORDNET_NOTE =
  "Local Tamil WordNet–aligned lexicon (curated bundle; no remote APIs).";
const JSON_LEXICON_NOTE = "Local Tamil WordNet bundle entry (lib/wordnet/lexicon.json).";

function isLlmJsonRecord(v: unknown): v is LLMJson {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return Array.isArray(o.senses) && Array.isArray(o.distractorsBySense);
}

/**
 * Resolve a pipeline from bundled WordNet JSON and/or curated seeds (same shapes as LLM JSON output).
 */
export function getLocalWordNetPipeline(word: string): EngineOutput | null {
  const t = word.trim();
  if (!t) return null;

  const raw = (lexiconExtra as Record<string, unknown>)[t];
  if (raw && isLlmJsonRecord(raw)) {
    const out = llmJsonToEngineOutput(t, raw, "wordnet", JSON_LEXICON_NOTE);
    if (out) return out;
  }

  const seed = getSeed(t);
  if (seed) {
    return {
      ...seed,
      source: "wordnet",
      generationNotes: SEED_WORDNET_NOTE,
    };
  }

  return null;
}

/**
 * Lemmas available for Custom mode: curated seeds plus any valid entries in lexicon.json.
 * Sorted for Tamil locale (useful for dropdowns).
 */
export function listCustomPlayWords(): string[] {
  const fromJson = Object.entries(lexiconExtra as Record<string, unknown>)
    .filter(([k, v]) => k.trim().length > 0 && isLlmJsonRecord(v))
    .map(([k]) => k.trim());
  const seeds = listSeedWords();
  const set = new Set<string>([...seeds, ...fromJson]);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ta"));
}
