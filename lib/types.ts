/** Lexifyd polysemy challenge types */

export type POS = "Noun" | "Verb" | "Adj" | "Other";

/** Taxonomy for smart distractors (judge-facing). */
export type DistractorTaxonomy =
  | "wrong_POS"
  | "same_POS_wrong_sense"
  | "collocation_break"
  | "near_synonym";

export type OptionRole = "correct" | DistractorTaxonomy;

export interface SenseSlot {
  id: string;
  pos: POS;
  /** Short gloss in English for UI labels */
  glossEn: string;
  /** Tamil gloss / meaning phrase for the game */
  meaningTa: string;
  /** Sentence with _____ placeholder for the target word form */
  sentenceTemplate: string;
  /** The surface form of the ambiguous word as it appears in the sentence */
  wordForm: string;
  /** Optional: inflected / related surface forms (morphology showcase) */
  morphForms?: string[];
}

export interface ChallengeRound {
  senseId: string;
  sentence: string;
  /** Four Tamil options */
  options: string[];
  correctIndex: number;
  /** Parallel to options; defaults to inferred if missing */
  optionRoles?: OptionRole[];
  /** Short explanations when learner picks wrong (parallel to options; null for correct) */
  explainWrongTa?: (string | null)[];
  explainWrongEn?: (string | null)[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: "root" | "sense" | "example";
  /** Links graph sense node to SenseSlot.id for highlighting */
  senseEntityId?: string;
  /** Full example line when user taps an example node */
  exampleSentence?: string;
}

export interface EngineOutput {
  inputWord: string;
  normalizedWord: string;
  senses: SenseSlot[];
  rounds: ChallengeRound[];
  graph: SemanticGraph;
  source: "llm" | "seed" | "hybrid" | "wordnet" | "error";
  generationNotes?: string;
}

export interface SemanticGraph {
  rootLabel: string;
  nodes: GraphNode[];
  links: { source: string; target: string }[];
}

export interface GuardrailResult {
  ok: boolean;
  flags: string[];
  needsHumanReview: boolean;
  sanitizedRounds: ChallengeRound[];
}

export interface PipelineResult extends EngineOutput {
  guardrails: GuardrailResult;
}

/** Play modes for GameShell */
export type LexifydGameMode = "custom" | "daily" | "arcade" | "boss";
