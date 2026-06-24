import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  level: string;
  webAuthnEnabled: boolean;
  managementLevel?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.user) return null;
    return json.user as User;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: async () => {
    const user = await fetchCurrentUser();
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },
}));
