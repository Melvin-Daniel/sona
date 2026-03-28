import { meaningChipDisplayLabel } from "./senseDisplay";
import type { ChallengeRound, SemanticGraph, SenseSlot } from "./types";

export function buildSemanticGraph(
  root: string,
  senses: SenseSlot[],
  rounds: ChallengeRound[]
): SemanticGraph {
  const nodes: SemanticGraph["nodes"] = [
    { id: "root", label: root, type: "root" },
  ];
  const links: SemanticGraph["links"] = [];

  for (const s of senses) {
    nodes.push({
      id: s.id,
      label: (() => {
        const d = meaningChipDisplayLabel(s);
        return d.length > 40 ? d.slice(0, 39) + "…" : d;
      })(),
      type: "sense",
      senseEntityId: s.id,
    });
    links.push({ source: "root", target: s.id });
    const r = rounds.find((x) => x.senseId === s.id);
    if (r) {
      const exId = `ex_${s.id}`;
      nodes.push({
        id: exId,
        label: r.sentence.length > 36 ? r.sentence.slice(0, 35) + "…" : r.sentence,
        type: "example",
        senseEntityId: s.id,
        exampleSentence: r.sentence,
      });
      links.push({ source: s.id, target: exId });
    }
  }

  return { rootLabel: root, nodes, links };
}
