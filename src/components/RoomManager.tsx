import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Users, DoorOpen, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Room {
  id: string;
  room_name: string;
  room_code: string;
  max_players: number;
  player_count: number;
  is_blocked: boolean;
  blocked_seconds_remaining: number;
}

interface Player {
  id: string;
  nickname: string;
  room_id: string | null;
}

interface RoomManagerProps {
  onRoomSelect: (roomId: string | null) => void;
  selectedRoomId: string | null;
}

const RoomManager = ({ onRoomSelect, selectedRoomId }: RoomManagerProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke("player-session", {
        body: { action: "get-rooms" },
      });
      if (data?.rooms) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  }, []);

  const fetchPlayers = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke("player-session", {
        body: { action: "get-players" },
      });
      if (data?.players) {
        setPlayers(data.players);
      }
    } catch (err) {
      console.error("Error fetching players:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchPlayers();

    // Set up realtime subscription
    const roomsChannel = supabase
      .channel("rooms-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        () => fetchRooms()
      )
      .subscribe();

    const playersChannel = supabase
      .channel("players-rooms-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => {
          fetchPlayers();
          fetchRooms();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchRooms();
      fetchPlayers();
    }, 5000);

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(playersChannel);
      clearInterval(interval);
    };
  }, [fetchRooms, fetchPlayers]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    setCreating(true);
    try {
      const { data } = await supabase.functions.invoke("player-session", {
        body: { action: "create-room", roomName: newRoomName.trim() },
      });
      if (data?.success) {
        setNewRoomName("");
        fetchRooms();
      }
    } catch (err) {
      console.error("Error creating room:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await supabase.functions.invoke("player-session", {
        body: { action: "delete-room", roomId },
      });
      if (selectedRoomId === roomId) {
        onRoomSelect(null);
      }
      fetchRooms();
      fetchPlayers();
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  const handleAssignPlayer = async (playerId: string, roomId: string | null) => {
    try {
      await supabase.functions.invoke("player-session", {
        body: { action: "assign-room", playerId, roomId },
      });
      fetchPlayers();
      fetchRooms();
    } catch (err) {
      console.error("Error assigning player:", err);
    }
  };

  const unassignedPlayers = players.filter((p) => !p.room_id);

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
      className="space-y-4"
    >
      {/* Create Room */}
      <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <DoorOpen className="w-5 h-5 text-primary" />
          <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wider">
            Gestione Stanze
          </h3>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nome nuova stanza..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
          />
          <Button
            onClick={handleCreateRoom}
            disabled={!newRoomName.trim() || creating}
            size="sm"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Crea
          </Button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* All Players option */}
        <motion.button
          onClick={() => onRoomSelect(null)}
          className={`p-4 rounded-lg border transition-all text-left ${
            selectedRoomId === null
              ? "neon-border bg-primary/10"
              : "border-muted hover:border-primary/50 bg-card/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">Tutti i Giocatori</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {players.length} giocatori
            </span>
          </div>
        </motion.button>

        {/* Rooms */}
        <AnimatePresence>
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-lg border transition-all ${
                selectedRoomId === room.id
                  ? "neon-border bg-primary/10"
                  : room.is_blocked
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-muted bg-card/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => onRoomSelect(room.id)}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span className="font-medium">{room.room_name}</span>
                  {room.is_blocked && (
                    <span className="flex items-center gap-1 text-xs text-destructive font-mono bg-destructive/20 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" />
                      {Math.floor(room.blocked_seconds_remaining / 60)}:{String(room.blocked_seconds_remaining % 60).padStart(2, '0')}
                    </span>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRoom(room.id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{room.room_code}</span>
                <span>
                  {room.player_count}/{room.max_players} giocatori
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && rooms.length > 0 && (
        <div className="neon-border rounded-xl p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Giocatori non assegnati ({unassignedPlayers.length})
            </span>
          </div>
          <div className="space-y-2">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-background/50 rounded"
              >
                <span className="text-sm">{player.nickname}</span>
                <Select
                  onValueChange={(value) =>
                    handleAssignPlayer(player.id, value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue placeholder="Assegna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RoomManager;
