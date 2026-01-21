import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import EnvelopeSelection from "@/components/player/EnvelopeSelection";
import EnigmaPage from "@/components/player/EnigmaPage";
import RussianRoulette from "@/components/player/RussianRoulette";
import FinalPuzzle from "@/components/player/FinalPuzzle";
import FinalEnigma from "@/components/player/FinalEnigma";
import Congratulations from "@/components/player/Congratulations";
import PuzzlePieceReward from "@/components/player/PuzzlePieceReward";
import GameEnded from "@/components/player/GameEnded";
import PlayerLoading from "@/pages/player/PlayerLoading";
import PlayerNoSession from "@/pages/player/PlayerNoSession";
import PlayerLogin from "@/pages/player/PlayerLogin";
import PlayerWaitingGame from "@/pages/player/PlayerWaitingGame";
import PlayerDisconnected from "@/pages/player/PlayerDisconnected";

type PlayerState = "loading" | "no-session" | "login" | "waiting-game" | "playing" | "game-ended" | "disconnected";
type GameView = "envelopes" | "enigma" | "puzzle-reward" | "roulette" | "final-puzzle" | "final-enigma" | "congratulations";

const HEARTBEAT_INTERVAL = 5000;
const TOTAL_ENIGMAS = 10;
const ROOM_BLOCK_SECONDS = 180;

interface GameInfo {
  gameActive: boolean;
  gameRemainingSeconds: number;
  connectedPlayers: number;
}

interface RoomStatus {
  roomId: string | null;
  solvedEnigmas: number[];
  isBlocked: boolean;
  blockedSecondsRemaining: number;
  allEnigmasSolved: boolean;
  finalSolved: boolean;
}

const Player = () => {
  const [state, setState] = useState<PlayerState>("loading");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [savedNickname, setSavedNickname] = useState("");
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    gameActive: false,
    gameRemainingSeconds: 0,
    connectedPlayers: 0
  });
  const [gameView, setGameView] = useState<GameView>("envelopes");
  const [selectedEnvelope, setSelectedEnvelope] = useState<number | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>({
    roomId: null,
    solvedEnigmas: [],
    isBlocked: false,
    blockedSecondsRemaining: 0,
    allEnigmasSolved: false,
    finalSolved: false
  });

  const checkSessionStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("player-session", {
        body: { action: "check-session" }
      });
      if (error) return;
      if (!data.sessionActive) {
        setState("no-session");
        return;
      }

      const storedToken = localStorage.getItem("player_token");
      const storedNickname = localStorage.getItem("player_nickname");
      if (storedToken) {
        const { data: verifyData } = await supabase.functions.invoke("player-session", {
          body: { action: "heartbeat", playerToken: storedToken }
        });
        if (verifyData?.success) {
          setPlayerToken(storedToken);
          setSavedNickname(storedNickname || "");
          setGameInfo({
            gameActive: verifyData.gameActive || false,
            gameRemainingSeconds: verifyData.gameRemainingSeconds || 0,
            connectedPlayers: verifyData.connectedPlayers || 0
          });
          setState(verifyData.gameActive ? "playing" : "waiting-game");
          return;
        } else {
          localStorage.removeItem("player_token");
          localStorage.removeItem("player_nickname");
        }
      }
      setState("login");
    } catch (err) {
      setState("no-session");
    }
  }, []);

  useEffect(() => {
    checkSessionStatus();
  }, [checkSessionStatus]);

  const fetchRoomStatus = useCallback(async () => {
    if (!playerToken) return;
    try {
      const { data } = await supabase.functions.invoke("player-session", {
        body: { action: "get-room-status", playerToken }
      });
      if (data?.success) {
        const allSolved = data.allEnigmasSolved || false;
        const finalSolved = data.finalSolved || false;
        
        setRoomStatus({
          roomId: data.roomId,
          solvedEnigmas: data.solvedEnigmas || [],
          isBlocked: data.isBlocked || false,
          blockedSecondsRemaining: data.blockedSecondsRemaining || 0,
          allEnigmasSolved: allSolved,
          finalSolved
        });
        
        if (finalSolved) {
          setGameView("congratulations");
        } else if (allSolved) {
          setGameView(current => (current !== "final-puzzle" && current !== "final-enigma" && current !== "congratulations" ? "final-puzzle" : current));
        }
      }
    } catch (err) {}
  }, [playerToken]);

  useEffect(() => {
    if (state !== "waiting-game" && state !== "playing" || !playerToken) return;
    const heartbeat = async () => {
      const { data } = await supabase.functions.invoke("player-session", {
        body: { action: "heartbeat", playerToken }
      });
      if (data?.success) {
        setGameInfo(prev => ({
          gameActive: data.gameActive || false,
          connectedPlayers: data.connectedPlayers || 0,
          gameRemainingSeconds: Math.abs(prev.gameRemainingSeconds - data.gameRemainingSeconds) > 5 
            ? data.gameRemainingSeconds 
            : prev.gameRemainingSeconds
        }));
        if (data.gameActive && state === "waiting-game") {
          setState("playing");
          setGameView("envelopes");
        } else if (!data.gameActive && state === "playing") {
          setState("game-ended");
        }
      }
    };
    const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [state, playerToken]);

  useEffect(() => {
    if (state !== "playing" || !gameInfo.gameActive || gameInfo.gameRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setGameInfo(prev => ({
        ...prev,
        gameRemainingSeconds: prev.gameRemainingSeconds > 0 ? prev.gameRemainingSeconds - 1 : 0
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state, gameInfo.gameActive]);

  useEffect(() => {
    if (state !== "playing" || !playerToken) return;
    fetchRoomStatus();
    const interval = setInterval(fetchRoomStatus, 3000);
    return () => clearInterval(interval);
  }, [state, playerToken, fetchRoomStatus]);

  useEffect(() => {
    if (!roomStatus.isBlocked || roomStatus.blockedSecondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setRoomStatus(prev => ({
        ...prev,
        blockedSecondsRemaining: Math.max(0, prev.blockedSecondsRemaining - 1),
        isBlocked: prev.blockedSecondsRemaining > 1
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [roomStatus.isBlocked]);

  const handleJoin = async () => {
    if (!nickname.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke("player-session", {
        body: { action: "join", nickname: nickname.trim() }
      });
      if (data?.success) {
        setPlayerToken(data.playerToken);
        setSavedNickname(nickname.trim());
        localStorage.setItem("player_token", data.playerToken);
        setState(data.gameActive ? "playing" : "waiting-game");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = useCallback(async (phase: GameView, enigma: number | null) => {
    if (!playerToken) return;
    await supabase.functions.invoke("player-session", {
      body: { action: "update-progress", playerToken, currentPhase: phase, currentEnigma: enigma || 0 }
    });
  }, [playerToken]);

  const handleSelectEnvelope = (num: number) => {
    if (roomStatus.isBlocked) return;
    setSelectedEnvelope(num);
    setGameView("enigma");
    updateProgress("enigma", num);
  };

  const handleEnigmaSolved = async () => {
    if (!selectedEnvelope || !playerToken) return;
    const { data } = await supabase.functions.invoke("player-session", {
      body: { action: "mark-enigma-solved", playerToken, enigmaNumber: selectedEnvelope }
    });
    if (data?.success) {
      setGameView("puzzle-reward");
    }
  };

  const handleBackToEnvelopes = () => {
    setSelectedEnvelope(null);
    setGameView("envelopes");
    updateProgress("envelopes", null);
  };

  const handleRouletteComplete = async (gotBang: boolean) => {
    if (gotBang && playerToken) {
      try {
        const { data } = await supabase.functions.invoke("player-session", {
          body: { action: "block-room", playerToken }
        });
        if (data?.success) {
          setRoomStatus(prev => ({
            ...prev,
            isBlocked: true,
            blockedSecondsRemaining: data.blockedSeconds || ROOM_BLOCK_SECONDS
          }));
        }
      } catch (err) {
        console.error("Errore blocco stanza:", err);
      }
    }
    handleBackToEnvelopes();
  };

  // --- FUNZIONE TEMPORANEA PER TEST (SALTA AL FINALE) ---
  const skipToFinal = async () => {
    if (!playerToken) return;
    const allEnigmas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const num of allEnigmas) {
      await supabase.functions.invoke("player-session", {
        body: { action: "mark-enigma-solved", playerToken, enigmaNumber: num }
      });
    }
    setRoomStatus(prev => ({ ...prev, solvedEnigmas: allEnigmas, allEnigmasSolved: true }));
    setGameView("final-puzzle");
  };

  if (state === "loading") return <PlayerLoading />;
  if (state === "no-session") return <PlayerNoSession />;
  if (state === "login") return <PlayerLogin nickname={nickname} setNickname={setNickname} error={error} isLoading={isLoading} onJoin={handleJoin} />;
  if (state === "game-ended") return <GameEnded playerToken={playerToken!} playerName={savedNickname} />;
  if (state === "disconnected") return <PlayerDisconnected onReconnect={checkSessionStatus} />;
  if (state === "waiting-game") return <PlayerWaitingGame savedNickname={savedNickname} connectedPlayers={gameInfo.connectedPlayers} />;

  if (gameView === "puzzle-reward" && selectedEnvelope) return <PuzzlePieceReward enigmaNumber={selectedEnvelope} onContinue={() => setGameView("roulette")} />;
  if (gameView === "roulette") return <RussianRoulette onComplete={handleRouletteComplete} playerName={savedNickname} />;
  if (gameView === "final-puzzle") return <FinalPuzzle onSolve={() => setGameView("final-enigma")} onBack={handleBackToEnvelopes} gameRemainingSeconds={gameInfo.gameRemainingSeconds} playerName={savedNickname} />;
  if (gameView === "final-enigma") return <FinalEnigma onSolve={() => setGameView("congratulations")} onBack={handleBackToEnvelopes} gameRemainingSeconds={gameInfo.gameRemainingSeconds} playerName={savedNickname} />;
  if (gameView === "congratulations") return <Congratulations playerName={savedNickname} solvedEnigmas={roomStatus.solvedEnigmas.length} totalEnigmas={TOTAL_ENIGMAS} />;
  
  if (gameView === "enigma" && selectedEnvelope) {
    return (
      <EnigmaPage 
        envelopeNumber={selectedEnvelope} 
        onBack={handleBackToEnvelopes} 
        onSolve={handleEnigmaSolved} 
        gameRemainingSeconds={gameInfo.gameRemainingSeconds} 
        playerName={savedNickname} 
        isSolved={roomStatus.solvedEnigmas.includes(selectedEnvelope)} 
      />
    );
  }

  return (
    <>
      {/* PULSANTE INVISIBILE TEST (Angolo basso destra) */}
      <div 
        onClick={skipToFinal}
        className="fixed bottom-0 right-0 w-12 h-12 z-[9999] cursor-pointer opacity-0 hover:opacity-30 bg-red-500 flex items-center justify-center text-[10px] text-white font-bold"
      >
        TEST
      </div>

      <EnvelopeSelection 
        onSelectEnvelope={handleSelectEnvelope} 
        gameRemainingSeconds={gameInfo.gameRemainingSeconds} 
        playerName={savedNickname} 
        solvedEnigmas={roomStatus.solvedEnigmas} 
        isBlocked={roomStatus.isBlocked} 
        blockedSecondsRemaining={roomStatus.blockedSecondsRemaining} 
      />
    </>
  );
};

export default Player;