"use client";

import {
  clearLocalScholarAccount,
  clearScholarSession,
  loadLocalAccount,
  loadScholarSession,
  type ScholarSession,
  registerScholar,
  saveScholarSession,
  signInScholar,
} from "@/lib/authLocal";
import { LexEntryIntro } from "@/components/seren/LexEntryIntro";
import {
  clearEntryIntroSession,
  isEntryIntroDoneInSession,
} from "@/lib/entryIntroStorage";
import { saveProgression } from "@/lib/progression";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { SerenLoginScreen } from "@/components/SerenLoginScreen";

type AuthContextValue = {
  session: ScholarSession | null;
  hasLocalProfile: boolean;
  signOut: () => void;
  refreshSession: () => void;
  /** Keep session label in sync when user edits nickname in the player strip */
  updateSessionDisplayName: (name: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

function syncProgressionNickname(name: string) {
  const n = name.trim();
  if (n) saveProgression({ nickname: n });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ScholarSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [hasLocalProfile, setHasLocalProfile] = useState(false);
  const [entryIntroDismissed, setEntryIntroDismissed] = useState(false);

  const refreshSession = useCallback(() => {
    setSession(loadScholarSession());
    setHasLocalProfile(!!loadLocalAccount());
  }, []);

  useEffect(() => {
    refreshSession();
    setHydrated(true);
  }, [refreshSession]);

  useLayoutEffect(() => {
    if (!session) {
      setEntryIntroDismissed(false);
      return;
    }
    setEntryIntroDismissed(isEntryIntroDoneInSession());
  }, [session]);

  const signOut = useCallback(() => {
    clearEntryIntroSession();
    clearScholarSession();
    setSession(null);
    setEntryIntroDismissed(false);
  }, []);

  const updateSessionDisplayName = useCallback((name: string) => {
    const n = name.trim();
    if (!n) return;
    const next = saveScholarSession(n);
    setSession(next);
    syncProgressionNickname(n);
  }, []);

  const onLoginSuccess = useCallback(() => {
    const s = loadScholarSession();
    setSession(s);
    setHasLocalProfile(!!loadLocalAccount());
    if (s?.displayName) syncProgressionNickname(s.displayName);
  }, []);

  const clearDeviceProfile = useCallback(() => {
    clearLocalScholarAccount();
    clearEntryIntroSession();
    setSession(null);
    setHasLocalProfile(false);
    setEntryIntroDismissed(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      hasLocalProfile,
      signOut,
      refreshSession,
      updateSessionDisplayName,
    }),
    [session, hasLocalProfile, signOut, refreshSession, updateSessionDisplayName]
  );

  if (!hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--bg)] font-body text-[var(--muted)]"
        aria-busy="true"
      >
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <SerenLoginScreen
        hasLocalProfile={hasLocalProfile}
        onClearDeviceProfile={clearDeviceProfile}
        onRegister={async (name, pw) => {
          const r = await registerScholar(name, pw);
          if (r.ok) onLoginSuccess();
          return r;
        }}
        onSignIn={async (name, pw) => {
          const r = await signInScholar(name, pw);
          if (r.ok) onLoginSuccess();
          return r;
        }}
      />
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!entryIntroDismissed ? (
        <LexEntryIntro onEnter={() => setEntryIntroDismissed(true)} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
