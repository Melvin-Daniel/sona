/** Shared env parsing for judge/offline builds (no outbound LLM). */

export function envFlagTrue(v: string | undefined): boolean {
  if (v == null || v === "") return false;
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

/** When true, `generatePipelineAsync` must not call OpenAI or Gemini. */
export function isLlmGenerationDisabled(): boolean {
  return envFlagTrue(process.env.DISABLE_LLM) || envFlagTrue(process.env.LEXIFYD_OFFLINE);
}

/**
 * When true, use only the local Tamil WordNet bundle (`lib/wordnet/lexicon.json` + curated seeds).
 * No OpenAI, Gemini, or other remote generation APIs.
 */
export function isRemoteApiGenerationBlocked(): boolean {
  return (
    isLlmGenerationDisabled() || envFlagTrue(process.env.LEXIFYD_NO_REMOTE_API)
  );
}
