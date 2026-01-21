import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import CollectedPieces from "./CollectedPieces";

interface EnvelopeSelectionProps {
  onSelectEnvelope: (envelopeNumber: number) => void;
  gameRemainingSeconds: number;
  playerName: string;
  solvedEnigmas: number[];
  isBlocked?: boolean;
  blockedSecondsRemaining?: number;
}

const EnvelopeSelection = ({ 
  onSelectEnvelope, 
  gameRemainingSeconds, 
  playerName, 
  solvedEnigmas, 
  isBlocked = false, 
  blockedSecondsRemaining = 0 
}: EnvelopeSelectionProps) => {
  const [hoveredEnvelope, setHoveredEnvelope] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const envelopes = Array.from({ length: 10 }, (_, i) => i + 1);
  const allSolved = solvedEnigmas.length >= 10;

  return (
    <div className="min-h-screen sherlock-bg">
      {/* Victorian decorative header */}
      <div className="sherlock-border-bottom py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="sherlock-ornament mb-2">❧ ✦ ❧</div>
          <h1 className="font-sherlock text-3xl md:text-4xl text-sherlock-gold mb-2">
            L'Archivio dei Misteri
          </h1>
          <p className="font-victorian text-sherlock-cream/80 text-sm">
            Detective {playerName}, scegli un fascicolo da esaminare
          </p>
        </motion.div>
      </div>

      {/* Room blocked overlay */}
      {isBlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/90 py-4 px-4 border-b-2 border-red-700"
        >
          <div className="flex items-center justify-center gap-3">
            <Lock className="w-6 h-6 text-red-300 animate-pulse" />
            <div className="text-center">
              <p className="font-sherlock text-red-300 text-lg">STANZA BLOCCATA!</p>
              <p className="font-victorian text-red-200 text-sm">
                Riprova tra {formatTime(blockedSecondsRemaining)}
              </p>
            </div>
            <Lock className="w-6 h-6 text-red-300 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Timer and progress */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-4 space-y-2"
      >
        <div>
          <span className="font-victorian text-sherlock-cream/60 text-sm">Tempo rimanente: </span>
          <span className="font-sherlock text-sherlock-gold text-lg">{formatTime(gameRemainingSeconds)}</span>
        </div>
        <div>
          <span className="font-victorian text-sherlock-cream/60 text-sm">Enigmi risolti: </span>
          <span className="font-sherlock text-sherlock-gold">{solvedEnigmas.length}/10</span>
        </div>
      </motion.div>

      {/* Collected puzzle pieces */}
      <CollectedPieces solvedEnigmas={solvedEnigmas} />

      {/* Envelopes Grid */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {envelopes.map((num, index) => {
            const isSolved = solvedEnigmas.includes(num);
            
            return (
              <motion.button
                key={num}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={!isSolved && !isBlocked ? { 
                  y: -8, 
                  scale: 1.05,
                  transition: { duration: 0.2 } 
                } : {}}
                whileTap={!isSolved && !isBlocked ? { scale: 0.95 } : {}}
                onHoverStart={() => !isSolved && !isBlocked && setHoveredEnvelope(num)}
                onHoverEnd={() => setHoveredEnvelope(null)}
                onClick={() => !isBlocked && onSelectEnvelope(num)}
                className={`envelope-card group ${isSolved ? 'opacity-60' : ''} ${isBlocked && !isSolved ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={allSolved || isBlocked}
              >
                {/* Envelope body */}
                <div className="relative aspect-[4/3] sherlock-paper rounded-sm overflow-hidden">
                  {/* Solved checkmark overlay */}
                  {isSolved && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-sherlock-brown/30 z-20 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  )}

                  {/* Wax seal */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <motion.div 
                      className={`wax-seal w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${isSolved ? 'opacity-50' : ''}`}
                      animate={hoveredEnvelope === num ? { 
                        boxShadow: "0 0 20px rgba(139, 69, 19, 0.6)"
                      } : {}}
                    >
                      <span className="font-sherlock text-sherlock-cream text-xl md:text-2xl font-bold">
                        {num}
                      </span>
                    </motion.div>
                  </div>

                  {/* Envelope flap */}
                  <div className={`absolute top-0 left-0 right-0 h-1/2 envelope-flap ${isSolved ? 'opacity-50' : ''}`}
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      transformOrigin: "top center"
                    }}
                  />

                  {/* Hover text */}
                  {!isSolved && !isBlocked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredEnvelope === num ? 1 : 0 }}
                      className="absolute bottom-2 left-0 right-0 text-center"
                    >
                      <span className="font-victorian text-xs text-sherlock-brown/80">
                        Apri fascicolo
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Case number label */}
                <div className="mt-2 text-center">
                  <span className={`font-victorian text-xs ${isSolved ? 'text-green-400' : 'text-sherlock-cream/70'}`}>
                    {isSolved ? '✓ Risolto' : `Caso N° ${num.toString().padStart(2, '0')}`}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer ornament */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pb-6"
      >
        <div className="sherlock-ornament text-sherlock-gold/50">
          ═══════ ✦ ═══════
        </div>
        <p className="font-victorian text-sherlock-cream/50 text-xs mt-2">
          "Quando hai eliminato l'impossibile, ciò che resta, per quanto improbabile, deve essere la verità."
        </p>
      </motion.div>
    </div>
  );
};

export default EnvelopeSelection;
