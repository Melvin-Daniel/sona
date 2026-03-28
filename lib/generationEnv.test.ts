import { describe, expect, it } from "vitest";
import { envFlagTrue } from "./generationEnv";

describe("envFlagTrue", () => {
  it("is false for empty/undefined", () => {
    expect(envFlagTrue(undefined)).toBe(false);
    expect(envFlagTrue("")).toBe(false);
  });
  it("accepts common truthy strings", () => {
    expect(envFlagTrue("1")).toBe(true);
    expect(envFlagTrue("true")).toBe(true);
    expect(envFlagTrue("TRUE")).toBe(true);
    expect(envFlagTrue("yes")).toBe(true);
    expect(envFlagTrue("On")).toBe(true);
  });
  it("rejects other values", () => {
    expect(envFlagTrue("0")).toBe(false);
    expect(envFlagTrue("false")).toBe(false);
    expect(envFlagTrue("no")).toBe(false);
  });
});
