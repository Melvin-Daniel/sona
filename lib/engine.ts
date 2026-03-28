import type { EngineOutput, PipelineResult } from "./types";
import { getSeed, listSeedWords } from "./seed";
import { validateEngineOutput, shuffleRound } from "./guardrails";
import { buildSemanticGraph } from "./graphUtils";
import {
  isLlmGenerationDisabled,
  isRemoteApiGenerationBlocked,
} from "./generationEnv";
import {
  type LLMJson,
  llmJsonToEngineOutput,
} from "./llmJsonPipeline";
import { getLocalWordNetPipeline } from "./wordnet/pipeline";

const SYSTEM_PROMPT = `You are a Tamil linguistics assistant for Lexifyd polysemy games.
Return ONLY valid JSON (no markdown). The JSON must match this shape:
{
  "senses": [
    {
      "id": "string_snake_case",
      "pos": "Noun" | "Verb" | "Adj" | "Other",
      "glossEn": "short English gloss",
      "meaningTa": "Tamil meaning phrase for learner",
      "sentence": "A natural Tamil sentence using the target word in this sense.",
      "correctFragment": "Exact substring from sentence (target word/inflection).",
      "morphForms": ["optional", "2-4", "other", "surface", "forms"]
    }
  ],
  "distractorsBySense": [
    {
      "senseId": "must match senses[].id",
      "wrongs": [
        {
          "text": "Tamil distractor",
          "taxonomy": "wrong_POS" | "same_POS_wrong_sense" | "collocation_break" | "near_synonym",
          "explainTa": "One short Tamil line why this is wrong here",
          "explainEn": "One short English line"
        }
      ]
    }
  ]
}
Rules:
- At least 2 senses (different meaning or POS).
- Each sentence must disambiguate that sense.
- Each "wrongs" array must have exactly 3 items; texts must be unique and distinct from correctFragment.
- morphForms: optional but preferred (2-4 related inflections or spellings).`;

async function callOpenAI(word: string): Promise<LLMJson | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Ambiguous Tamil word: "${word}"\nGenerate the JSON described.`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    console.error("OpenAI error", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;
  return JSON.parse(text) as LLMJson;
}

async function callGemini(word: string): Promise<LLMJson | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + `\n\nAmbiguous Tamil word: "${word}"\nReturn JSON only.` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    console.error("Gemini error", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return JSON.parse(text) as LLMJson;
}

export async function generateFromLLM(word: string): Promise<EngineOutput | null> {
  const trimmed = word.trim();
  if (!trimmed) return null;

  let json: LLMJson | null = await callOpenAI(trimmed);
  if (!json) json = await callGemini(trimmed);
  if (!json?.senses?.length) return null;

  return llmJsonToEngineOutput(trimmed, json, "llm", "Generated via LLM; validated by guardrails.");
}

export function generatePipeline(word: string): PipelineResult {
  const seed = getSeed(word.trim());
  if (seed) {
    const guardrails = validateEngineOutput(seed);
    const rounds = guardrails.sanitizedRounds.map(shuffleRound);
    return {
      ...seed,
      rounds,
      guardrails,
    };
  }

  const t = word.trim();
  return {
    inputWord: t,
    normalizedWord: t,
    senses: [],
    rounds: [],
    graph: {
      rootLabel: t,
      nodes: t ? [{ id: "root", label: t, type: "root" }] : [],
      links: [],
    },
    source: "error",
    generationNotes:
      "No seed for this word. Use local Tamil WordNet bundle (lexicon.json + seeds), or enable remote LLM with API keys (if allowed).",
    guardrails: {
      ok: false,
      flags: ["no_seed_for_word", "use_local_wordnet_or_llm"],
      needsHumanReview: true,
      sanitizedRounds: [],
    },
  };
}

export async function generatePipelineAsync(word: string): Promise<PipelineResult> {
  const trimmed = word.trim();

  if (isRemoteApiGenerationBlocked()) {
    const local = getLocalWordNetPipeline(trimmed);
    if (local) {
      const guardrails = validateEngineOutput(local);
      const rounds = guardrails.sanitizedRounds.map(shuffleRound);
      return { ...local, rounds, guardrails };
    }
    const fallback = generatePipeline(trimmed);
    return {
      ...fallback,
      generationNotes:
        "No remote APIs (DISABLE_LLM, LEXIFYD_OFFLINE, or LEXIFYD_NO_REMOTE_API). No local WordNet/seed entry for this word — add to lib/wordnet/lexicon.json or lib/seed.ts.",
    };
  }

  const seed = getSeed(trimmed);
  const llm = isLlmGenerationDisabled() ? null : await generateFromLLM(trimmed);
  if (llm) {
    const guardrails = validateEngineOutput(llm);
    const rounds = guardrails.sanitizedRounds.map(shuffleRound);
    return {
      ...llm,
      rounds,
      guardrails,
      source: seed ? "hybrid" : "llm",
      generationNotes: seed
        ? "LLM generation; seed available for same word as reference."
        : llm.generationNotes,
    };
  }

  if (seed) {
    const guardrails = validateEngineOutput(seed);
    const rounds = guardrails.sanitizedRounds.map(shuffleRound);
    return { ...seed, rounds, guardrails };
  }

  const fallback = generatePipeline(trimmed);
  if (isLlmGenerationDisabled() && fallback.source === "error") {
    return {
      ...fallback,
      generationNotes:
        "Offline / judge mode: LLM disabled (DISABLE_LLM or LEXIFYD_OFFLINE). Use Demo or a seed word — see README.",
    };
  }
  return fallback;
}

export { listSeedWords };
