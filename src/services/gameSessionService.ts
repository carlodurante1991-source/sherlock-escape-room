import { supabase } from "@/integrations/supabase/client";

const SESSION_STORAGE_KEY = "game_session_token";

interface SessionResponse {
  success?: boolean;
  error?: string;
  sessionToken?: string;
  remainingSeconds?: number;
  expiresAt?: string;
  expired?: boolean;
  isActive?: boolean;
  gameRemainingSeconds?: number;
}

export const gameSessionService = {
  // Get stored session token
  getStoredToken(): string | null {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  },

  // Store session token
  setStoredToken(token: string): void {
    localStorage.setItem(SESSION_STORAGE_KEY, token);
  },

  // Clear stored session token
  clearStoredToken(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  // Login with password (creates 5 hour main session)
  async login(password: string): Promise<SessionResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("manage-session", {
        body: {
          action: "login",
          password,
        },
      });

      if (error) {
        console.error("Login error:", error);
        return { error: "Errore di connessione" };
      }

      if (data.sessionToken) {
        this.setStoredToken(data.sessionToken);
      }

      return data;
    } catch (err) {
      console.error("Login exception:", err);
      return { error: "Errore di connessione al server" };
    }
  },

  // Start game session
  async startGame(durationMinutes: number): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    if (!sessionToken) {
      return { error: "No session", expired: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-session", {
        body: {
          action: "start-game",
          sessionToken,
          gameDurationMinutes: durationMinutes,
        },
      });

      if (error) {
        console.error("Start game error:", error);
        return { error: "Errore di connessione" };
      }

      return data;
    } catch (err) {
      console.error("Start game exception:", err);
      return { error: "Errore di connessione" };
    }
  },

  // Stop game session
  async stopGame(): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    if (!sessionToken) {
      return { error: "No session", expired: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-session", {
        body: {
          action: "stop-game",
          sessionToken,
        },
      });

      if (error) {
        console.error("Stop game error:", error);
        return { error: "Errore di connessione" };
      }

      return data;
    } catch (err) {
      console.error("Stop game exception:", err);
      return { error: "Errore di connessione" };
    }
  },

  // Reset game - clears rooms, players, scores, timer
  async resetGame(): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    if (!sessionToken) {
      return { error: "No session", expired: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-session", {
        body: {
          action: "reset-game",
          sessionToken,
        },
      });

      if (error) {
        console.error("Reset game error:", error);
        return { error: "Errore di connessione" };
      }

      return data;
    } catch (err) {
      console.error("Reset game exception:", err);
      return { error: "Errore di connessione" };
    }
  },

  async heartbeat(isGameActive: boolean = false): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    if (!sessionToken) {
      return { error: "No session", expired: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-session", {
        body: {
          action: "heartbeat",
          sessionToken,
          isGameActive,
        },
      });

      if (error) {
        console.error("Heartbeat error:", error);
        return { error: "Errore di connessione" };
      }

      if (data.expired) {
        this.clearStoredToken();
      }

      return data;
    } catch (err) {
      console.error("Heartbeat exception:", err);
      return { error: "Errore di connessione" };
    }
  },

  // Check remaining time without updating
  async getRemainingTime(): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    if (!sessionToken) {
      return { error: "No session", expired: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-session", {
        body: {
          action: "get-remaining",
          sessionToken,
        },
      });

      if (error) {
        return { error: "Errore di connessione" };
      }

      if (data.expired) {
        this.clearStoredToken();
      }

      return data;
    } catch (err) {
      return { error: "Errore di connessione" };
    }
  },

  // Logout
  async logout(): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    try {
      if (sessionToken) {
        await supabase.functions.invoke("manage-session", {
          body: {
            action: "logout",
            sessionToken,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      this.clearStoredToken();
    }

    return { success: true };
  },

  // Check if there's an existing valid session
  async checkExistingSession(): Promise<SessionResponse> {
    const sessionToken = this.getStoredToken();
    
    if (!sessionToken) {
      return { expired: true };
    }

    return this.getRemainingTime();
  },
};
