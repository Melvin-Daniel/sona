import type { DistractorTaxonomy, OptionRole } from "./types";

export function taxonomyLabel(role: OptionRole): string {
  if (role === "correct") return "Correct";
  const m: Record<DistractorTaxonomy, string> = {
    wrong_POS: "Wrong POS / word class",
    same_POS_wrong_sense: "Same class, wrong sense",
    collocation_break: "Collocation break",
    near_synonym: "Near-form / distractor",
  };
  return m[role] ?? role;
}
