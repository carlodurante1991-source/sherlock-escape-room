import { motion } from "framer-motion";
import { Puzzle } from "lucide-react";
import { getCollectedPieces } from "@/data/puzzlePieces";

interface CollectedPiecesProps {
  solvedEnigmas: number[];
}

const CollectedPieces = ({ solvedEnigmas }: CollectedPiecesProps) => {
  if (solvedEnigmas.length === 0) return null;

  const collectedPieces = getCollectedPieces(solvedEnigmas);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sherlock-paper rounded-sm p-4 mx-4 mb-4"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Puzzle className="w-4 h-4 text-sherlock-gold" />
        <span className="font-victorian text-sherlock-brown text-sm">
          Pezzi del puzzle raccolti (da riordinare!)
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {collectedPieces.map((piece, index) => (
          <motion.div
            key={piece?.enigmaNumber}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center
              bg-sherlock-gold/20 border-2 border-sherlock-gold/50"
          >
            <span className="text-lg">{piece?.emoji}</span>
            <span className="text-xs font-sherlock text-sherlock-gold -mt-1">
              {piece?.letter}
            </span>
          </motion.div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: 10 - solvedEnigmas.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-10 h-10 rounded-lg flex items-center justify-center
              bg-sherlock-brown/10 border border-sherlock-brown/20 opacity-30"
          >
            <span className="text-lg">?</span>
          </div>
        ))}
      </div>

      <p className="font-victorian text-sherlock-brown/60 text-xs text-center mt-2">
        {solvedEnigmas.length}/10 pezzi
      </p>
    </motion.div>
  );
};

export default CollectedPieces;
