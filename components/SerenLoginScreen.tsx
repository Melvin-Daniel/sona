"use client";

import { loadProgression } from "@/lib/progression";
import { useEffect, useState } from "react";

type Props = {
  hasLocalProfile: boolean;
  /** Clears saved name + passphrase on this device so "Create profile" can run again. */
  onClearDeviceProfile: () => void;
  onRegister: (displayName: string, passphrase: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  onSignIn: (displayName: string, passphrase: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function SerenLoginScreen({ hasLocalProfile, onClearDeviceProfile, onRegister, onSignIn }: Props) {
  const [mode, setMode] = useState<"signin" | "register">("register");
  const [name, setName] = useState(() => loadProgression().nickname?.trim() || "");
  useEffect(() => {
    setMode(hasLocalProfile ? "signin" : "register");
  }, [hasLocalProfile]);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "register") {
      if (pw !== pw2) {
        setError("Passphrases don’t match.");
        return;
      }
    }
    setBusy(true);
    try {
      const fn = mode === "register" ? onRegister : onSignIn;
      const r = await fn(name.trim(), pw);
      if (!r.ok) setError(r.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] px-5 py-10 text-[var(--text)] md:px-12 md:py-14">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">Lexifyd</h1>
          <p className="mt-2 font-body text-sm text-[var(--muted)]">The Mindful Sanctuary — sign in to continue</p>
        </div>

        <div className="rounded-2xl border-[1.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-sm md:p-8">
          <div className="mb-6 flex rounded-xl border border-[var(--border)] bg-[var(--border-muted)] p-1">
            <button
              type="button"
              disabled={!hasLocalProfile}
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                mode === "signin"
                  ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--muted)] disabled:opacity-40"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--muted)]"
              }`}
            >
              Create profile
            </button>
          </div>
          {!hasLocalProfile && (
            <p className="mb-4 text-center text-xs leading-relaxed text-[var(--muted)]">
              One scholar profile is stored on this device. Choose a display name and passphrase you’ll remember.
            </p>
          )}
          {hasLocalProfile && mode === "signin" && (
            <p className="mb-4 text-center text-xs text-[var(--muted)]">Welcome back — enter the same name and passphrase.</p>
          )}
          {hasLocalProfile && mode === "register" && (
            <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--accent-ink)]/60 p-4 text-center">
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                This browser already has a saved scholar. Remove it first if you want to register a{" "}
                <strong className="text-[var(--text)]">new</strong> name and passphrase on this device.
              </p>
              <button
                type="button"
                className="lex-btn-segment mt-3 w-full border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] py-2.5 text-sm font-semibold text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(
                      "Remove the saved scholar from this browser? You can then create a new profile. Practice stats in this browser are not erased."
                    )
                  ) {
                    onClearDeviceProfile();
                    setMode("register");
                    setPw("");
                    setPw2("");
                    setError(null);
                  }
                }}
              >
                Remove saved profile…
              </button>
            </div>
          )}

          {!(hasLocalProfile && mode === "register") ? (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="lex-login-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Display name
                </label>
                <input
                  id="lex-login-name"
                  autoComplete="username"
                  className="lex-input w-full font-body"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vijay"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label htmlFor="lex-login-pw" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Passphrase
                </label>
                <input
                  id="lex-login-pw"
                  type="password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="lex-input w-full"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
              {mode === "register" && (
                <div>
                  <label htmlFor="lex-login-pw2" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Confirm passphrase
                  </label>
                  <input
                    id="lex-login-pw2"
                    type="password"
                    autoComplete="new-password"
                    className="lex-input w-full"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}
              {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
              <button type="submit" disabled={busy} className="lex-btn-primary w-full py-3.5">
                {busy ? "Please wait…" : mode === "register" ? "Create profile & enter" : "Sign in"}
              </button>
            </form>
          ) : null}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-[var(--muted)]">
          Progress, leaderboard, and mastery stay on this browser. Passphrase is hashed locally — not sent to a server.
        </p>
      </div>
    </div>
  );
}
