import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";

const PlayerNoSession = () => {
  return (
    <div className="sherlock-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-24 h-24 mx-auto bg-sherlock-brown/80 rounded-full flex items-center justify-center border-4 border-sherlock-gold/60 shadow-lg">
            <Hourglass className="w-12 h-12 text-sherlock-gold" />
          </div>
        </motion.div>
        <h1 className="font-sherlock text-3xl font-bold text-sherlock-gold">
          Nessuna sessione attiva
        </h1>
        <p className="font-victorian text-sherlock-cream/70 text-lg italic">
          Attendi che il master avvii una sessione di gioco
        </p>
        <div className="flex items-center justify-center gap-2 text-sherlock-cream/50">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-sherlock-gold rounded-full"
          />
          <span className="font-victorian">Ricerca in corso...</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerNoSession;
