import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Gamepad2, Clock, Zap, Play, Square, Users, QrCode, Download, BookOpen, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { ENIGMA_ANSWERS, FINAL_ENIGMA_ANSWER } from "@/data/enigmaAnswers";
import DigitalTimer from "./DigitalTimer";
import PlayerLeaderboard from "./PlayerLeaderboard";
import RoomManager from "./RoomManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";

interface ControlPanelProps {
  remainingSeconds: number;
  isActive: boolean;
  onLogout: () => void;
  gameRemainingSeconds: number;
  isGameActive: boolean;
  onStartGame: (durationMinutes: number) => void;
  onStopGame: () => void;
  onNewSession?: () => void;
}

const GAME_DURATION_OPTIONS = [
  { value: "30", label: "30 minuti" },
  { value: "60", label: "1 ora" },
  { value: "120", label: "2 ore" },
];

const ControlPanel = ({ 
  remainingSeconds, 
  isActive, 
  onLogout,
  gameRemainingSeconds,
  isGameActive,
  onStartGame,
  onStopGame,
  onNewSession,
}: ControlPanelProps) => {
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [connectedPlayers, setConnectedPlayers] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const playerUrl = `${window.location.origin}/player`;

  // Fetch connected players count
  useEffect(() => {
    const fetchPlayerInfo = async () => {
      try {
        // Get connected players (always, even before game starts)
        const { data } = await supabase.functions.invoke("player-session", {
          body: { action: "get-players" },
        });
        if (data) {
          setConnectedPlayers(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching player info:", err);
      }
    };

    fetchPlayerInfo();
    const interval = setInterval(fetchPlayerInfo, 5000);
    return () => clearInterval(interval);
  }, [isGameActive]);

  const handleStartGame = () => {
    onStartGame(parseInt(selectedDuration));
  };

  const handleDownloadQR = () => {
    const svg = qrCodeRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qr-code-giocatori.png";
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const formatMainTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg neon-border bg-card/80 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-primary text-glow">
              GAME CONTROL
            </h1>
            <p className="text-xs text-muted-foreground">
              {isGameActive ? "Gioco in corso" : "Sessione attiva"}
            </p>
          </div>
        </div>

        <Button variant="neon-outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          ESCI
        </Button>
      </motion.div>

      {/* Game Timer - Only shown when game is active */}
      {isGameActive && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div>
            <div className="mb-2 text-center">
              <span className="text-xs uppercase tracking-wider text-accent font-display">
                ⏱️ Timer Gioco
              </span>
            </div>
            <DigitalTimer remainingSeconds={gameRemainingSeconds} isActive={isActive} />
            <div className="mt-4 flex justify-center">
              <Button variant="destructive" size="lg" onClick={onStopGame}>
                <Square className="w-5 h-5" />
                FERMA GIOCO
              </Button>
            </div>
          </div>

          {/* QR Code and Player Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* QR Code */}
            <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    QR Code Giocatori
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDownloadQR}
                  className="h-6 px-2"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
              <div ref={qrCodeRef} className="flex justify-center bg-white p-3 rounded-lg">
                <QRCodeSVG 
                  value={playerUrl} 
                  size={120}
                  level="M"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Scansiona per entrare
              </p>
            </div>

            {/* Connected Players */}
            <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Giocatori Connessi
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-primary text-glow text-center">
                {connectedPlayers}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Start Controls - Only shown when game is NOT active */}
      {!isGameActive && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="neon-border rounded-xl p-6 bg-card/50 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-primary text-glow mb-2">
                INIZIA PARTITA
              </h2>
              <p className="text-sm text-muted-foreground">
                Seleziona la durata e avvia il gioco
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Durata partita
                </label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger className="w-full bg-background/50 border-primary/30 focus:border-primary">
                    <SelectValue placeholder="Seleziona durata" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAME_DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="neon" 
                size="lg" 
                className="w-full text-lg"
                onClick={handleStartGame}
              >
                <Play className="w-6 h-6" />
                AVVIA GIOCO
              </Button>
            </div>
          </div>

          {/* QR Code and Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* QR Code */}
            <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    QR Code Giocatori
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDownloadQR}
                  className="h-6 px-2"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
              <div ref={qrCodeRef} className="flex justify-center bg-white p-4 rounded-lg">
                <QRCodeSVG 
                  value={playerUrl} 
                  size={120}
                  level="M"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Scansiona per entrare
              </p>
            </div>

            {/* Connected Players */}
            <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Giocatori in Attesa
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-primary text-glow text-center">
                {connectedPlayers}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <InfoCard
          icon={<Clock className="w-5 h-5" />}
          title="Sessione Principale"
          value={formatMainTimer(remainingSeconds)}
          description="Tempo rimanente (5h totali)"
        />
        <InfoCard
          icon={<Zap className="w-5 h-5" />}
          title="Stato"
          value={isGameActive ? "In Gioco" : isActive ? "Pronto" : "Pausa"}
          description={isGameActive ? "Partita in corso" : isActive ? "In attesa di avvio" : "Timer in pausa"}
          isActive={isActive}
        />
      </motion.div>

      {/* Warning messages */}
      {isGameActive && gameRemainingSeconds < 300 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-4 rounded-lg ${
            gameRemainingSeconds < 60
              ? "bg-destructive/20 border border-destructive/50"
              : "bg-yellow-500/20 border border-yellow-500/50"
          }`}
        >
          <p className={`font-display text-sm ${
            gameRemainingSeconds < 60 ? "text-destructive" : "text-yellow-500"
          }`}>
            {gameRemainingSeconds < 60
              ? "⚠️ ATTENZIONE: Meno di 1 minuto di gioco!"
              : "⏰ Meno di 5 minuti di gioco rimanenti"}
          </p>
        </motion.div>
      )}

      {remainingSeconds < 600 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-lg bg-orange-500/20 border border-orange-500/50"
        >
          <p className="font-display text-sm text-orange-500">
            ⏰ Sessione principale in scadenza ({formatMainTimer(remainingSeconds)})
          </p>
        </motion.div>
      )}

      {/* Room Manager */}
      <RoomManager 
        onRoomSelect={setSelectedRoomId}
        selectedRoomId={selectedRoomId}
      />

      {/* Player Leaderboard - Always visible */}
      <PlayerLeaderboard roomId={selectedRoomId} />

      {/* Answers Section - Only for Game Master */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm"
      >
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display text-sm uppercase tracking-wider text-primary">
              📋 Risposte Enigmi (Solo Master)
            </span>
          </div>
          {showAnswers ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
        </button>

        {showAnswers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-2 border-t border-primary/20 pt-4"
          >
            {Object.entries(ENIGMA_ANSWERS).map(([num, answer]) => (
              <div key={num} className="flex justify-between items-center py-1 border-b border-muted/20">
                <span className="text-sm text-muted-foreground">Enigma {num}:</span>
                <span className="font-mono text-sm text-primary">{answer}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 mt-2 bg-primary/10 rounded px-2">
              <span className="text-sm font-bold text-primary">Enigma Finale:</span>
              <span className="font-mono text-sm font-bold text-primary">{FINAL_ENIGMA_ANSWER}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* New Session Button */}
      {onNewSession && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm"
        >
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Vuoi iniziare una nuova sessione di gioco? Questo terminerà la sessione corrente.
            </p>
            <Button 
              variant="neon-outline" 
              size="lg" 
              className="w-full"
              onClick={onNewSession}
            >
              <RotateCcw className="w-5 h-5" />
              NUOVA SESSIONE
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const InfoCard = ({
  icon,
  title,
  value,
  description,
  isActive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  isActive?: boolean;
}) => (
  <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className={`font-display text-xl font-bold ${
          isActive === undefined ? "text-foreground" : isActive ? "text-primary text-glow" : "text-muted-foreground"
        }`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

export default ControlPanel;
