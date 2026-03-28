"use client";

import type { AchievementDef } from "@/lib/achievements";
import { useEffect } from "react";

type Props = {
  items: AchievementDef[];
  onDismiss: () => void;
};

export function AchievementToast({ items, onDismiss }: Props) {
  useEffect(() => {
    if (!items.length) return;
    const t = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(t);
  }, [items, onDismiss]);

  if (!items.length) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] flex max-w-md -translate-x-1/2 flex-col gap-2 px-4"
      role="status"
    >
      {items.map((a) => (
        <div
          key={a.id}
          className="lex-card border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-4 py-3 shadow-xl"
        >
          <p className="text-xs text-[var(--accent)]">Achievement unlocked</p>
          <p className="font-semibold text-[var(--text)]">{a.title}</p>
          <p className="text-xs text-[var(--muted)]">{a.desc}</p>
        </div>
      ))}
    </div>
  );
}
