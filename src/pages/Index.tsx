import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPanel from "@/components/LoginPanel";
import ControlPanel from "@/components/ControlPanel";
import SessionExpired from "@/components/SessionExpired";
import { gameSessionService } from "@/services/gameSessionService";

type AppState = "loading" | "login" | "active" | "expired";

const HEARTBEAT_INTERVAL = 10000; // 10 seconds

const Index = () => {
  const [appState, setAppState] = useState<AppState>("loading");
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60 * 60); // 5 hours main session
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  // Game session state (separate from main session)
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameRemainingSeconds, setGameRemainingSeconds] = useState(0);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const response = await gameSessionService.checkExistingSession();
      
      if (response.expired) {
        setAppState("login");
      } else if (response.error && !response.expired) {
        console.warn("Session check failed:", response.error);
        setAppState("login");
      } else if (response.remainingSeconds !== undefined) {
        setRemainingSeconds(response.remainingSeconds);
        setAppState("active");
        setIsActive(true);
        
        // Check if there was an active game
        if (response.gameRemainingSeconds !== undefined && response.gameRemainingSeconds > 0) {
          setIsGameActive(true);
          setGameRemainingSeconds(response.gameRemainingSeconds);
        }
      } else {
        setAppState("login");
      }
    };

    checkSession();
  }, []);

  // Heartbeat to sync with server
  useEffect(() => {
    if (appState !== "active") return;

    const sendHeartbeat = async () => {
      const response = await gameSessionService.heartbeat(isGameActive);
      
      if (response.expired) {
        setAppState("expired");
        return;
      }
      
      if (response.error && !response.expired) {
        console.warn("Heartbeat failed:", response.error);
        return;
      }
      
      if (response.remainingSeconds !== undefined) {
        setRemainingSeconds(response.remainingSeconds);
      }
      
      // Sync game state from server
      if (response.gameRemainingSeconds !== undefined) {
        if (response.gameRemainingSeconds <= 0 && isGameActive) {
          setIsGameActive(false);
          setGameRemainingSeconds(0);
        } else if (response.gameRemainingSeconds > 0) {
          setGameRemainingSeconds(response.gameRemainingSeconds);
        }
      }
    };

    const heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => clearInterval(heartbeatInterval);
  }, [appState, isGameActive]);

  // Local countdown for main session
  useEffect(() => {
    if (appState !== "active" || !isActive) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          gameSessionService.heartbeat(isGameActive).then((response) => {
            console.log("Final heartbeat response:", response);
          });
          setAppState("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appState, isActive, isGameActive]);

  // Local countdown for game session
  useEffect(() => {
    if (!isGameActive || !isActive) return;

    const timer = setInterval(() => {
      setGameRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, isActive]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (appState !== "active") return;

      if (document.visibilityState === "hidden") {
        setIsActive(false);
      } else if (document.visibilityState === "visible") {
        const response = await gameSessionService.heartbeat(isGameActive);
        
        if (response.expired) {
          setAppState("expired");
          return;
        }
        
        if (response.error && !response.expired) {
          console.warn("Visibility resync failed:", response.error);
          setIsActive(true);
          return;
        }
        
        if (response.remainingSeconds !== undefined) {
          setRemainingSeconds(response.remainingSeconds);
        }
        
        if (response.gameRemainingSeconds !== undefined) {
          if (response.gameRemainingSeconds <= 0) {
            setIsGameActive(false);
            setGameRemainingSeconds(0);
          } else {
            setGameRemainingSeconds(response.gameRemainingSeconds);
          }
        }
        
        setIsActive(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [appState, isGameActive]);

  // Handle beforeunload
  useEffect(() => {
    if (appState === "active") {
      const handleBeforeUnload = async () => {
        await gameSessionService.heartbeat(isGameActive);
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [appState, isGameActive]);

  const handleLogin = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const response = await gameSessionService.login(password);

    if (response.error) {
      setError(response.error);
      setIsLoading(false);
      return false;
    }

    if (response.remainingSeconds !== undefined) {
      setRemainingSeconds(response.remainingSeconds);
    }
    
    setAppState("active");
    setIsActive(true);
    setIsGameActive(false);
    setGameRemainingSeconds(0);
    setIsLoading(false);
    return true;
  };

  const handleStartGame = async (durationMinutes: number) => {
    const response = await gameSessionService.startGame(durationMinutes);
    
    if (response.success && response.gameRemainingSeconds !== undefined) {
      setIsGameActive(true);
      setGameRemainingSeconds(response.gameRemainingSeconds);
    }
  };

  const handleStopGame = async () => {
    await gameSessionService.stopGame();
    setIsGameActive(false);
    setGameRemainingSeconds(0);
  };

  const handleLogout = async () => {
    await gameSessionService.logout();
    setAppState("login");
    setRemainingSeconds(5 * 60 * 60);
    setIsActive(false);
    setIsGameActive(false);
    setGameRemainingSeconds(0);
  };

  const handleResetGame = async () => {
    const response = await gameSessionService.resetGame();
    
    if (response.success) {
      setIsGameActive(false);
      setGameRemainingSeconds(0);
    }
  };

  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-background grid-bg scanline flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8"
      >
        <AnimatePresence mode="wait">
          {appState === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPanel
                onLogin={handleLogin}
                isLoading={isLoading}
                error={error}
              />
            </motion.div>
          )}

          {appState === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ControlPanel
                remainingSeconds={remainingSeconds}
                isActive={isActive}
                onLogout={handleLogout}
                gameRemainingSeconds={gameRemainingSeconds}
                isGameActive={isGameActive}
                onStartGame={handleStartGame}
                onStopGame={handleStopGame}
                onNewSession={handleResetGame}
              />
            </motion.div>
          )}

          {appState === "expired" && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SessionExpired onRequestNewSession={() => setAppState("login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-xs text-muted-foreground/50 font-display tracking-wider">
          GAME CONTROL SYSTEM v1.0
        </p>
      </footer>
    </div>
  );
};

export default Index;
