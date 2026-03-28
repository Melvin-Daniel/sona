/** Session tab: skip post-login intro after first dismiss until tab closes. Cleared on sign-out. */
export const ENTRY_INTRO_SESSION_KEY = "lexifyd_entry_intro_done";

export function isEntryIntroDoneInSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ENTRY_INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEntryIntroDoneInSession(): void {
  try {
    sessionStorage.setItem(ENTRY_INTRO_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearEntryIntroSession(): void {
  try {
    sessionStorage.removeItem(ENTRY_INTRO_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
