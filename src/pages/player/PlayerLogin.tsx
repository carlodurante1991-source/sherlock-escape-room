import { motion, AnimatePresence } from "framer-motion";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlayerLoginProps {
  nickname: string;
  setNickname: (value: string) => void;
  error: string;
  isLoading: boolean;
  onJoin: () => void;
}

const PlayerLogin = ({
  nickname,
  setNickname,
  error,
  isLoading,
  onJoin
}: PlayerLoginProps) => {
  return (
    <div className="sherlock-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Decorative header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="w-20 h-20 mx-auto bg-sherlock-brown/80 rounded-full flex items-center justify-center border-4 border-sherlock-gold/60 shadow-lg">
              <Hourglass className="w-10 h-10 text-sherlock-gold" />
            </div>
          </motion.div>
          <h1 className="font-sherlock text-3xl font-bold text-sherlock-gold text-amber-500">
            Entra nel Mistero
          </h1>
          <p className="font-victorian text-sherlock-cream/70 text-lg italic">
            Inserisci il tuo nome per entrare
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="sherlock-paper rounded-lg p-6 space-y-4"
        >
          <div className="space-y-3">
            <Input
              placeholder="Il tuo nome"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="text-center text-lg font-victorian bg-white/50 border-sherlock-brown/30 text-sherlock-brown placeholder:text-sherlock-brown/50"
            />
          </div>


          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-sm font-victorian"
                style={{ color: 'hsl(0, 50%, 35%)' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            onClick={onJoin}
            disabled={isLoading}
            className="w-full font-sherlock text-lg bg-sherlock-brown hover:bg-sherlock-brown/80 text-sherlock-cream border-sherlock-gold/30"
            size="lg"
          >
            {isLoading ? "Connessione..." : "ENTRA"}
          </Button>
        </motion.div>

        {/* Decorative footer */}
        <p className="text-center font-victorian text-sherlock-cream/40 text-sm italic">
          "Il gioco è in piedi!"
        </p>
      </motion.div>
    </div>
  );
};

export default PlayerLogin;
