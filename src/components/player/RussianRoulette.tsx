import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RussianRouletteProps {
  onComplete: (gotBang: boolean) => void;
  playerName: string;
}

const RussianRoulette = forwardRef<HTMLDivElement, RussianRouletteProps>(
  ({ onComplete, playerName }, ref) => {
  const [phase, setPhase] = useState<"intro" | "spinning" | "result">("intro");
  const [result, setResult] = useState<"safe" | "bang" | null>(null);
  const [spinRotation, setSpinRotation] = useState(0);

  const handlePullTrigger = () => {
    setPhase("spinning");
    
    // Animate spinning
    const randomSpins = 3 + Math.random() * 3;
    setSpinRotation(randomSpins * 360);
    
    // Show result after spinning - calculate random INSIDE timeout to ensure fresh random
    setTimeout(() => {
      // Random result - 25% chance of "bang"
      const randomValue = Math.random();
      const gotBang = randomValue < 0.25;
      console.log(`[Roulette] Random: ${randomValue.toFixed(4)}, Bang: ${gotBang}`);
      
      setResult(gotBang ? "bang" : "safe");
      setPhase("result");
    }, 2000);
  };

  const handleContinue = () => {
    onComplete(result === "bang");
  };

  return (
    <div ref={ref} className="min-h-screen sherlock-bg flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 max-w-md"
          >
            <div className="sherlock-ornament text-sherlock-gold/60">❧ ✦ ❧</div>
            
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Target className="w-24 h-24 mx-auto text-sherlock-gold" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="font-sherlock text-3xl text-sherlock-gold">
                Roulette Russa
              </h1>
              <p className="font-victorian text-sherlock-cream/80">
                Hai risolto l'enigma, Detective {playerName}.
                <br />
                Ma il destino ha ancora una carta da giocare...
              </p>
              <p className="font-victorian text-sherlock-cream/60 text-sm italic">
                Se esce "BANG", la stanza sarà bloccata per 3 minuti.
              </p>
            </div>

            <Button
              onClick={handlePullTrigger}
              className="bg-sherlock-red hover:bg-sherlock-red/80 text-sherlock-cream font-victorian px-8 py-6 text-lg"
            >
              Premi il grilletto
            </Button>
          </motion.div>
        )}

        {phase === "spinning" && (
          <motion.div
            key="spinning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8"
          >
            <motion.div
              animate={{ rotate: spinRotation }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-sherlock-gold flex items-center justify-center bg-sherlock-dark">
                <div className="absolute w-4 h-4 bg-sherlock-gold rounded-full" />
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-sherlock-cream/30 rounded-full"
                    style={{
                      transform: `rotate(${i * 60}deg) translateY(-40px)`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            <p className="font-victorian text-sherlock-cream/60 animate-pulse">
              Il tamburo gira...
            </p>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 max-w-md"
          >
            {result === "bang" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl"
                >
                  💥
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-sherlock text-5xl text-sherlock-red"
                >
                  BANG!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-victorian text-sherlock-cream/80"
                >
                  Il destino ti è stato avverso!
                  <br />
                  <span className="text-sherlock-red">Stanza bloccata per 3 minuti!</span>
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl"
                >
                  🎯
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-sherlock text-4xl text-sherlock-gold"
                >
                  Click...
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-victorian text-sherlock-cream/80"
                >
                  La fortuna è dalla tua parte, Detective!
                  <br />
                  Nessuna penalità.
                </motion.p>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleContinue}
                className="bg-sherlock-brown hover:bg-sherlock-brown/80 text-sherlock-cream font-victorian px-8 py-4"
              >
                Continua
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

RussianRoulette.displayName = "RussianRoulette";

export default RussianRoulette;
