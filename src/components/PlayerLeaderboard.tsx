import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Clock, Target, Medal, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Player {
  id: string;
  nickname: string;
  score: number;
  current_phase: string;
  current_enigma: number;
  solved_enigmas: number[] | null;
  completed_at: string | null;
  last_activity_at: string;
  room_id: string | null;
}

interface PlayerLeaderboardProps {
  roomId?: string | null;
}

const PHASE_LABELS: Record<string, string> = {
  waiting: "In attesa",
  envelopes: "Selezione busta",
  enigma: "Risolve enigma",
  roulette: "Roulette",
  "final-enigma": "Enigma finale",
  congratulations: "Completato! 🎉",
};

const PlayerLeaderboard = ({ roomId }: PlayerLeaderboardProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await supabase.functions.invoke("player-session", {
          body: { action: "get-players", roomId },
        });
        if (data?.players) {
          setPlayers(data.players);
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    // Set up realtime subscription for player updates
    const channel = supabase
      .channel("players-leaderboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          // Refetch on any player change
          fetchPlayers();
        }
      )
      .subscribe();

    // Also poll every 3 seconds for more reliable updates
    const interval = setInterval(fetchPlayers, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [roomId]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-muted-foreground font-mono">{index + 1}</span>;
  };

  const formatPhase = (player: Player) => {
    const phase = player.current_phase || "waiting";
    const label = PHASE_LABELS[phase] || phase;
    
    if (phase === "enigma" && player.current_enigma) {
      return `${label} #${player.current_enigma}`;
    }
    return label;
  };

  const getProgressBar = (player: Player) => {
    const solved = player.solved_enigmas?.length || 0;
    const total = 10;
    const percentage = (solved / total) * 100;
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              player.completed_at 
                ? "bg-primary" 
                : "bg-primary/70"
            }`}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {solved}/{total}
        </span>
      </div>
    );
  };

  // Sort players: completed first (by completion time), then by score
  const sortedPlayers = [...players].sort((a, b) => {
    // Completed players first
    if (a.completed_at && !b.completed_at) return -1;
    if (!a.completed_at && b.completed_at) return 1;
    
    // Among completed, sort by completion time (earliest first)
    if (a.completed_at && b.completed_at) {
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    }
    
    // Among non-completed, sort by score
    return b.score - a.score;
  });

  if (loading) {
    return (
      <div className="neon-border rounded-xl p-6 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-primary">
          CLASSIFICA & PROGRESSO
        </h2>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          {players.length} giocatori
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nessun giocatore connesso</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary/20">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Giocatore</TableHead>
                <TableHead className="text-center">Fase</TableHead>
                <TableHead className="text-center">Progresso</TableHead>
                <TableHead className="text-right">Punti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {sortedPlayers.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-primary/10 ${
                      player.completed_at 
                        ? "bg-primary/10" 
                        : index === 0 
                          ? "bg-yellow-500/5" 
                          : ""
                    }`}
                  >
                    <TableCell className="text-center">
                      {getRankIcon(index)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {player.nickname}
                        </span>
                        {player.completed_at && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                            ✓ Finito
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-muted-foreground">
                        {formatPhase(player)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getProgressBar(player)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-primary">
                        {player.score}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerLeaderboard;
