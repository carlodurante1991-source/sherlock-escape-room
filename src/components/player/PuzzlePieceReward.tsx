import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPieceForEnigma } from "@/data/puzzlePieces";

interface PuzzlePieceRewardProps {
  enigmaNumber: number;
  onContinue: () => void;
}

const PuzzlePieceReward = forwardRef<HTMLDivElement, PuzzlePieceRewardProps>(
  ({ enigmaNumber, onContinue }, ref) => {
    const piece = getPieceForEnigma(enigmaNumber);

    if (!piece) {
      onContinue();
      return null;
    }

    return (
      <div ref={ref} className="min-h-screen sherlock-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {/* Success ornament */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sherlock-ornament text-sherlock-gold/60 mb-4">❧ ✦ ❧</div>
            <h2 className="font-sherlock text-2xl text-sherlock-gold mb-2">
              Enigma Risolto!
            </h2>
            <p className="font-victorian text-sherlock-cream/70 text-sm mb-6">
              Hai ottenuto un pezzo del puzzle finale
            </p>
          </motion.div>

          {/* Puzzle piece card */}
          <motion.div
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
            className="sherlock-paper rounded-lg p-8 mb-6 mx-auto max-w-xs"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="text-6xl mb-4"
              >
                {piece.emoji}
              </motion.div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Puzzle className="w-5 h-5 text-sherlock-gold" />
                <span className="font-sherlock text-sherlock-gold text-lg">
                  Pezzo misterioso
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-sherlock-gold/20 rounded-full px-4 py-1 inline-block"
              >
                <span className="font-sherlock text-sherlock-gold text-2xl">
                  {piece.letter}
                </span>
              </motion.div>

              <p className="font-victorian text-sherlock-brown/60 text-xs mt-3 italic">
                Dove andrà posizionato?
              </p>
            </div>
          </motion.div>

          {/* Hint about the rebus */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="font-victorian text-sherlock-cream/50 text-xs mb-6"
          >
            Raccogli tutti i pezzi e riordinali per rivelare la soluzione...
          </motion.p>

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Button
              onClick={onContinue}
              className="bg-sherlock-gold hover:bg-sherlock-gold/80 text-sherlock-dark font-victorian px-8"
            >
              Continua
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

PuzzlePieceReward.displayName = "PuzzlePieceReward";

export default PuzzlePieceReward;
