export type AppTabId = "play" | "summary" | "explore";

export const MAIN_NAV: { id: AppTabId; label: string; hint: string }[] = [
  { id: "play", label: "Play", hint: "Challenge & modes" },
  { id: "summary", label: "Summary", hint: "Last session, history & tips" },
  { id: "explore", label: "Explore", hint: "Graph & senses" },
];
