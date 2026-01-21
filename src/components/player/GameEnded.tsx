import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Medal, Users, Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PlayerScore {
  id: string;
  nickname: string;
  score: number;
  solved_enigmas: number[];
  completed_at: string | null;
}

interface GameEndedProps {
  playerToken: string;
  playerName: string;
}

const GameEnded = ({ playerToken, playerName }: GameEndedProps) => {
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayerRank, setCurrentPlayerRank] = useState<number | null>(null);
  const [currentPlayerScore, setCurrentPlayerScore] = useState<number>(0);
  const [currentPlayerSolvedEnigmas, setCurrentPlayerSolvedEnigmas] = useState<number>(0);
  
  // Feedback state
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSendFeedback = async () => {
    if (rating === 0) {
      toast.error("Seleziona almeno una stella!");
      return;
    }

    setIsSending(true);
    try {
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      
      const { error } = await supabase.functions.invoke("send-feedback", {
        body: {
          playerName,
          feedback,
          solvedEnigmas: currentPlayerSolvedEnigmas,
          totalEnigmas: 10,
          rating: stars,
        },
      });

      if (error) throw error;
      
      setFeedbackSent(true);
      toast.success("Grazie per il tuo feedback!");
    } catch (err) {
      console.error("Error sending feedback:", err);
      toast.error("Errore nell'invio del feedback");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await supabase.functions.invoke("player-session", {
          body: { action: "get-players", playerToken }
        });

        if (data?.players) {
          const sortedPlayers = data.players.sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);
          setLeaderboard(sortedPlayers);
          
          const playerIndex = sortedPlayers.findIndex((p: PlayerScore) => p.nickname === playerName);
          if (playerIndex !== -1) {
            setCurrentPlayerRank(playerIndex + 1);
            setCurrentPlayerScore(sortedPlayers[playerIndex].score);
            setCurrentPlayerSolvedEnigmas(sortedPlayers[playerIndex].solved_enigmas?.length || 0);
          }
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [playerToken, playerName]);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400";
      case 2: return "text-gray-300";
      case 3: return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className={`w-6 h-6 ${getMedalColor(rank)}`} />;
    }
    return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-medium">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4"
          >
            <Clock className="w-10 h-10 text-primary" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground"
          >
            Tempo Scaduto!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            La sessione di gioco è terminata
          </motion.p>
        </div>

        {/* Player Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Il tuo punteggio:</span>
            <span className="text-2xl font-bold text-primary">{currentPlayerScore} pt</span>
          </div>
          
          {currentPlayerRank && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">La tua posizione:</span>
              <div className="flex items-center gap-2">
                {getMedalIcon(currentPlayerRank)}
                <span className="text-xl font-semibold">{currentPlayerRank}°</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Classifica Finale</h2>
            <Users className="w-4 h-4 text-muted-foreground ml-auto" />
            <span className="text-sm text-muted-foreground">{leaderboard.length}</span>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Caricamento...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nessun giocatore
              </div>
            ) : (
              <div className="divide-y divide-border">
                {leaderboard.slice(0, 10).map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`flex items-center gap-3 p-3 ${
                      player.nickname === playerName ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getMedalIcon(index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        player.nickname === playerName ? "text-primary" : ""
                      }`}>
                        {player.nickname}
                        {player.nickname === playerName && " (tu)"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {player.solved_enigmas?.length || 0} enigmi risolti
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{player.score}</span>
                      <span className="text-sm text-muted-foreground ml-1">pt</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-center">Lascia un feedback</h3>
          
          {feedbackSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-primary font-medium">Grazie per il tuo feedback!</p>
            </motion.div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              
              {/* Comment */}
              <Textarea
                placeholder="Scrivi un commento (opzionale)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none"
                rows={3}
              />
              
              <Button
                onClick={handleSendFeedback}
                disabled={isSending || rating === 0}
                className="w-full"
              >
                {isSending ? (
                  "Invio in corso..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Feedback
                  </>
                )}
              </Button>
            </>
          )}
        </motion.div>

        {/* Footer message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          Grazie per aver giocato! 🎉
        </motion.p>
      </motion.div>
    </div>
  );
};

export default GameEnded;
