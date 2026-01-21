import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VictorianSafeProps {
  onSolve: () => void;
  isSolved: boolean;
}

const CORRECT_CODE = "1893";
const IMAGE_URL = " https://i.imgur.com/v94tkBX.jpeg";

const VictorianSafe = ({ onSolve, isSolved }: VictorianSafeProps) => {
  const [code, setCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(isSolved);
  const [error, setError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (isSolved) {
      setIsUnlocked(true);
      setShowSuccess(true);
    }
  }, [isSolved]);

  const handleSubmit = () => {
    if (code === CORRECT_CODE) {
      setError(false);
      setIsUnlocked(true);
      setShowSuccess(true);
      setTimeout(onSolve, 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  /** doppio tap / doppio click → chiude zoom */
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setZoomOpen(false);
    }
    lastTap.current = now;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* TITOLO */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="font-sherlock text-xl md:text-2xl text-sherlock-gold mb-2">La Cassaforte Segreta</h2>
        <p className="font-victorian text-sherlock-brown/80 text-sm italic">
          "Il segreto più oscuro giace oltre questa porta di ferro..."
        </p>
      </motion.div>

      {/* IMMAGINE (tap = zoom) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md cursor-zoom-in"
        onClick={() => setZoomOpen(true)}
      >
        <div className="bg-sherlock-brown/10 rounded-lg p-4 border-2 border-sherlock-brown/30">
          <p className="font-victorian text-sherlock-brown text-center mb-3 text-sm">
            Esamina attentamente questo documento...
          </p>

          <div className="relative rounded border-2 border-sherlock-brown/40 overflow-hidden">
            <img
              src={IMAGE_URL}
              alt="Documento con codice nascosto"
              className="w-full h-auto select-none"
              draggable={false}
            />
          </div>

          <p className="font-victorian text-sherlock-brown/60 text-center mt-3 text-xs italic">
            Tocca per ingrandire, doppio tap per chiudere
          </p>
        </div>
      </motion.div>

      {/* MODAL ZOOM */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
          >
            <div
              className="w-full h-full overflow-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
              onClick={(e) => e.stopPropagation()}
              onTouchEnd={handleDoubleTap}
              onDoubleClick={handleDoubleTap}
            >
              <img
                src={IMAGE_URL}
                alt="Zoom documento"
                draggable={false}
                style={{
                  width: "160vw",
                  maxWidth: "none",
                  height: "auto",
                  touchAction: "pan-x pan-y pinch-zoom",
                  userSelect: "none",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CASSAFORTE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`relative ${error ? "animate-[shake_0.5s]" : ""}`}
      >
        <div className="bg-gradient-to-b from-amber-900 via-amber-950 to-stone-900 rounded-lg p-6 shadow-2xl border-4 border-amber-800">
          <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-lg p-5 border-2 border-amber-700/50 shadow-inner">
            <p className="font-victorian text-amber-200/80 text-center text-sm mb-4">
              Inserisci la combinazione segreta
            </p>

            <div className="flex justify-center">
              <Input
                maxLength={4}
                value={code}
                disabled={isUnlocked}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-32 text-center font-mono text-2xl tracking-[0.5em]"
              />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button onClick={handleSubmit} disabled={isUnlocked || code.length < 4}>
              {isUnlocked ? (
                <>
                  <Unlock className="mr-2" /> Aperta
                </>
              ) : (
                <>
                  <Lock className="mr-2" /> Apri la cassaforte
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* SUCCESSO */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sherlock-paper rounded-lg p-6 max-w-md text-center"
        >
          <h3 className="font-sherlock text-xl text-sherlock-gold mb-3">La Cassaforte si Apre!</h3>
          <p className="font-victorian text-sherlock-brown">Il codice 1893 era nascosto sotto i vostri occhi…</p>
        </motion.div>
      )}

      {/* SHAKE */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default VictorianSafe;
