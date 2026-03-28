import type { LexifydGameMode } from "@/lib/types";

export type ModeSplashTheme = {
  id: LexifydGameMode;
  badge: string;
  icon: string;
  name: string;
  kicker: string;
  subtitle: string;
  tamilWord: string;
  tamilMeaning: string;
  desc: string;
  quote: string;
  tags: string[];
  bg: string;
  ringColor: string;
  particleColor: string;
  sealBg: string;
  sealBorder: string;
  titleColor: string;
  kickerColor: string;
  quoteColor: string;
  quoteBorder: string;
  btnBg: string;
  btnShadow: string;
  tagColor: string;
  cancelColor: string;
  textColor: string;
};

export const MODE_SPLASH_THEMES: Record<LexifydGameMode, ModeSplashTheme> = {
  daily: {
    id: "daily",
    badge: "STREAK",
    icon: "☀️",
    name: "Daily Quest",
    kicker: "Path of the Scholar",
    subtitle: "STREAK MODE · 5 WORDS",
    tamilWord: "நாள்",
    tamilMeaning: "nāḷ · the day",
    desc: "Five carefully chosen words arrive each dawn, drawn from the living corpus of Tamil. Complete all five before midnight to keep your streak alive — the same discipline that Sangam scholars brought to their craft.",
    quote: '"The scholar who reads one word deeply knows more than one who reads a thousand shallowly."',
    tags: ["streak", "5 words", "curated", "daily reset", "badge rewards"],
    bg: "linear-gradient(160deg,#080d08 0%,#0a1008 40%,#06100a 100%)",
    ringColor: "rgba(31,122,74,0.25)",
    particleColor: "#2a6a50",
    sealBg: "rgba(31,122,74,0.15)",
    sealBorder: "rgba(42,138,80,0.4)",
    titleColor: "#a8e0c0",
    kickerColor: "rgba(168,224,192,0.6)",
    quoteColor: "rgba(168,224,192,0.35)",
    quoteBorder: "rgba(42,138,80,0.3)",
    btnBg: "linear-gradient(135deg,#1f7a4a,#1a6040)",
    btnShadow: "rgba(31,122,74,0.4)",
    tagColor: "rgba(42,138,80,0.5)",
    cancelColor: "rgba(168,224,192,0.3)",
    textColor: "rgba(200,240,220,0.65)",
  },
  arcade: {
    id: "arcade",
    badge: "TIMED",
    icon: "⚡",
    name: "Arcade",
    kicker: "Path of Lightning",
    subtitle: "SPEED MODE · 90 SEC TIMER",
    tamilWord: "வேகம்",
    tamilMeaning: "vēgam · speed",
    desc: "Five words. Ninety seconds. Every correct answer multiplies your score — every wrong one resets your combo. Tamil's ancient verses were memorised at speed; now you decode them at speed.",
    quote: '"The river does not pause to consider its direction — it flows."',
    tags: ["timed", "multipliers", "high score", "combo system", "speed"],
    bg: "linear-gradient(160deg,#0a0a06 0%,#100e04 40%,#0e0c02 100%)",
    ringColor: "rgba(212,160,48,0.2)",
    particleColor: "#c49a2a",
    sealBg: "rgba(196,154,42,0.12)",
    sealBorder: "rgba(212,160,48,0.4)",
    titleColor: "#f0d080",
    kickerColor: "rgba(240,208,128,0.6)",
    quoteColor: "rgba(240,208,128,0.35)",
    quoteBorder: "rgba(196,154,42,0.3)",
    btnBg: "linear-gradient(135deg,#a06808,#c49a2a)",
    btnShadow: "rgba(196,154,42,0.4)",
    tagColor: "rgba(196,154,42,0.5)",
    cancelColor: "rgba(240,208,128,0.3)",
    textColor: "rgba(240,220,160,0.65)",
  },
  boss: {
    id: "boss",
    badge: "HARD",
    icon: "💀",
    name: "Boss Mode",
    kicker: "Path of the Master",
    subtitle: "ELITE MODE · NO HINTS",
    tamilWord: "வீரம்",
    tamilMeaning: "vīram · valour",
    desc: "Seven of the most ambiguous words in the Tamil lexicon. No hints. A strict timer. One wrong answer drops your combo to zero. This is the mode that separates scholars from masters — entered by few, completed by fewer.",
    quote: '"The warrior who fears the sword cannot wield it."',
    tags: ["no hints", "7 words", "strict timer", "elite", "max XP"],
    bg: "linear-gradient(160deg,#0e0606 0%,#120404 40%,#0e0404 100%)",
    ringColor: "rgba(192,57,43,0.2)",
    particleColor: "#c0392b",
    sealBg: "rgba(192,57,43,0.12)",
    sealBorder: "rgba(192,57,43,0.4)",
    titleColor: "#f08080",
    kickerColor: "rgba(240,128,128,0.6)",
    quoteColor: "rgba(240,128,128,0.35)",
    quoteBorder: "rgba(192,57,43,0.3)",
    btnBg: "linear-gradient(135deg,#c0392b,#a0302a)",
    btnShadow: "rgba(192,57,43,0.4)",
    tagColor: "rgba(192,57,43,0.5)",
    cancelColor: "rgba(240,128,128,0.3)",
    textColor: "rgba(240,200,200,0.65)",
  },
  custom: {
    id: "custom",
    badge: "FREE",
    icon: "✏️",
    name: "Custom",
    kicker: "Path of Discovery",
    subtitle: "FREE MODE · YOUR WORD",
    tamilWord: "தேர்வு",
    tamilMeaning: "tērvu · choice",
    desc: "Choose any word from the Tamil WordNet and receive an instant polysemy challenge built around it. Explore obscure roots, regional usages, or classical vocabulary — the entire lexicon is your canvas.",
    quote: '"The scholar who chooses their own question finds the deepest answer."',
    tags: ["any word", "wordnet", "custom", "exploration", "no timer"],
    bg: "linear-gradient(160deg,#08080e 0%,#0a0a12 40%,#080810 100%)",
    ringColor: "rgba(100,100,180,0.2)",
    particleColor: "#8080c0",
    sealBg: "rgba(80,80,160,0.12)",
    sealBorder: "rgba(100,100,180,0.4)",
    titleColor: "#c0c0f0",
    kickerColor: "rgba(192,192,240,0.6)",
    quoteColor: "rgba(192,192,240,0.35)",
    quoteBorder: "rgba(100,100,180,0.3)",
    btnBg: "linear-gradient(135deg,#4a4a90,#5a5aa0)",
    btnShadow: "rgba(100,100,180,0.4)",
    tagColor: "rgba(100,100,180,0.5)",
    cancelColor: "rgba(192,192,240,0.3)",
    textColor: "rgba(200,200,240,0.65)",
  },
};
