import { motion } from "framer-motion";
import { Users, Wifi, Hourglass } from "lucide-react";

interface PlayerWaitingGameProps {
  savedNickname: string;
  connectedPlayers: number;
}

const PlayerWaitingGame = ({ savedNickname, connectedPlayers }: PlayerWaitingGameProps) => {
  return (
    <div className="sherlock-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        {/* Connection status */}
        <div className="flex items-center justify-center gap-3 text-sherlock-gold">
          <Wifi className="w-5 h-5" />
          <span className="font-victorian text-lg">
            Connesso come <strong className="font-sherlock">{savedNickname}</strong>
          </span>
        </div>

        {/* Waiting animation - Victorian hourglass style */}
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="py-8"
        >
          <div className="w-24 h-24 mx-auto bg-sherlock-brown/80 rounded-full flex items-center justify-center border-4 border-sherlock-gold/60 shadow-lg">
            <Hourglass className="w-12 h-12 text-sherlock-gold animate-pulse" />
          </div>
        </motion.div>

        <div className="space-y-3">
          <h2 className="font-sherlock text-2xl font-bold text-sherlock-gold">
            In attesa del master...
          </h2>
          <p className="font-victorian text-sherlock-cream/70 text-lg italic">
            Il mistero avrà inizio quando il master lo deciderà
          </p>
        </div>

        {/* Players count */}
        <div className="flex items-center justify-center gap-2 text-sherlock-cream/50">
          <Users className="w-5 h-5" />
          <span className="font-victorian">{connectedPlayers} investigatori connessi</span>
        </div>

        {/* Decorative quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-victorian text-sherlock-cream/30 text-sm italic pt-4"
        >
          "Quando hai eliminato l'impossibile, ciò che resta,
          <br />per quanto improbabile, deve essere la verità."
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PlayerWaitingGame;
