/**
 * Device-local “scholar” account: one profile per browser.
 * Passphrase is hashed (SHA-256); not suitable for real security — concept only.
 */
const ACCOUNT_KEY = "lexifyd_local_account_v1";
const SESSION_KEY = "lexifyd_session_v1";
const PEPPER = "lexifyd-local-pepper-v1";

export type LocalScholarAccount = {
  displayName: string;
  passHash: string;
};

export type ScholarSession = {
  displayName: string;
  loggedInAt: string;
};

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassphrase(pass: string): Promise<string> {
  return sha256Hex(`${PEPPER}:${pass}`);
}

export function loadLocalAccount(): LocalScholarAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<LocalScholarAccount>;
    if (typeof o.displayName !== "string" || typeof o.passHash !== "string") return null;
    return { displayName: o.displayName.trim(), passHash: o.passHash };
  } catch {
    return null;
  }
}

export function saveLocalAccount(account: LocalScholarAccount): void {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    /* ignore */
  }
}

export function loadScholarSession(): ScholarSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<ScholarSession>;
    if (typeof o.displayName !== "string") return null;
    return {
      displayName: o.displayName.trim(),
      loggedInAt: typeof o.loggedInAt === "string" ? o.loggedInAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveScholarSession(displayName: string): ScholarSession {
  const s: ScholarSession = {
    displayName: displayName.trim(),
    loggedInAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}

export function clearScholarSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Removes saved scholar credentials so a new profile can be registered on this device. */
export function clearLocalScholarAccount(): void {
  try {
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export async function registerScholar(displayName: string, passphrase: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = displayName.trim();
  if (name.length < 2) {
    return { ok: false, error: "Display name needs at least 2 characters." };
  }
  if (passphrase.length < 6) {
    return { ok: false, error: "Passphrase must be at least 6 characters." };
  }
  if (loadLocalAccount()) {
    return { ok: false, error: "This device already has a scholar profile. Sign in instead." };
  }
  const passHash = await hashPassphrase(passphrase);
  saveLocalAccount({ displayName: name, passHash });
  saveScholarSession(name);
  return { ok: true };
}

export async function signInScholar(displayName: string, passphrase: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const acc = loadLocalAccount();
  if (!acc) {
    return { ok: false, error: "No profile on this device yet. Create one below." };
  }
  const name = displayName.trim();
  if (name !== acc.displayName) {
    return { ok: false, error: "That name doesn’t match this device’s profile." };
  }
  const passHash = await hashPassphrase(passphrase);
  if (passHash !== acc.passHash) {
    return { ok: false, error: "Incorrect passphrase." };
  }
  saveScholarSession(name);
  return { ok: true };
}
