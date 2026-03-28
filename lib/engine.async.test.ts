import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("generatePipelineAsync + DISABLE_LLM", () => {
  const snapshot = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...snapshot };
  });

  it("uses local WordNet path for known word when DISABLE_LLM=1 (no LLM)", async () => {
    process.env = { ...snapshot, DISABLE_LLM: "1", OPENAI_API_KEY: "would-crash-if-used" };
    const { generatePipelineAsync } = await import("./engine");
    const r = await generatePipelineAsync("படி");
    expect(r.senses.length).toBeGreaterThanOrEqual(2);
    expect(r.rounds.length).toBeGreaterThanOrEqual(2);
    expect(r.source).toBe("wordnet");
  });

  it("uses local WordNet path when LEXIFYD_NO_REMOTE_API=1 (no LLM even with keys)", async () => {
    process.env = { ...snapshot };
    process.env.LEXIFYD_NO_REMOTE_API = "1";
    process.env.OPENAI_API_KEY = "would-crash-if-used";
    delete process.env.DISABLE_LLM;
    delete process.env.LEXIFYD_OFFLINE;
    const { generatePipelineAsync } = await import("./engine");
    const r = await generatePipelineAsync("கல்");
    expect(r.source).toBe("wordnet");
    expect(r.senses.length).toBeGreaterThanOrEqual(2);
  });

  it("returns offline hint for unknown word when DISABLE_LLM=1", async () => {
    process.env = { ...snapshot, DISABLE_LLM: "1" };
    const { generatePipelineAsync } = await import("./engine");
    const r = await generatePipelineAsync("not-a-valid-seed-word-xyz");
    expect(r.source).toBe("error");
    expect(r.generationNotes ?? "").toMatch(/Offline|judge|disabled/i);
  });
});
