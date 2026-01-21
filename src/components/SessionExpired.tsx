import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, RefreshCw, ShieldOff } from "lucide-react";

interface SessionExpiredProps {
  onRequestNewSession: () => void;
}

const SessionExpired = ({ onRequestNewSession }: SessionExpiredProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-destructive blur-2xl opacity-40" />
          <div className="relative w-24 h-24 rounded-2xl border-2 border-destructive/50 bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <ShieldOff className="w-12 h-12 text-destructive" />
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-destructive">
          SESSIONE SCADUTA
        </h1>
        <p className="text-muted-foreground">
          Il tempo è terminato. La password è stata cambiata automaticamente.
        </p>
      </motion.div>

      {/* Timer icon animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4 text-muted-foreground mb-8"
      >
        <Timer className="w-6 h-6" />
        <span className="font-display text-lg">00:00:00</span>
      </motion.div>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card/50 border border-border rounded-xl p-6 mb-8"
      >
        <p className="text-sm text-muted-foreground">
          Una nuova password è stata generata e inviata all'amministratore.
          Contatta l'admin per ricevere la nuova password di accesso.
        </p>
      </motion.div>

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="neon-outline"
          size="lg"
          onClick={onRequestNewSession}
          className="w-full"
        >
          <RefreshCw className="w-5 h-5" />
          TORNA AL LOGIN
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SessionExpired;
