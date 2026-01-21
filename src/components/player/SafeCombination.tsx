import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafeCombinationProps {
  onSolve: () => void;
  isSolved: boolean;
  correctCode?: string;
}

// Codice corretto nascosto nell'immagine
const CORRECT_CODE = "1893";

const SafeCombination = ({ onSolve, isSolved, correctCode = CORRECT_CODE }: SafeCombinationProps) => {
  const [digits, setDigits] = useState<number[]>([0, 0, 0, 0]);
  const [isUnlocked, setIsUnlocked] = useState(isSolved);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isSolved) {
      setIsUnlocked(true);
    }
  }, [isSolved]);

  const rotateDigit = (index: number, direction: "up" | "down") => {
    if (isUnlocked) return;

    setDigits((prev) => {
      const newDigits = [...prev];
      if (direction === "up") {
        newDigits[index] = (newDigits[index] + 1) % 10;
      } else {
        newDigits[index] = (newDigits[index] - 1 + 10) % 10;
      }
      return newDigits;
    });
  };

  const checkCombination = () => {
    const currentCode = digits.join("");
    if (currentCode === correctCode) {
      setIsUnlocked(true);
      onSolve();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const resetCombination = () => {
    if (isUnlocked) return;
    setDigits([0, 0, 0, 0]);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Immagine con codice nascosto */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-sherlock-brown/20 rounded-lg p-4 border-2 border-sherlock-brown/30">
          <p className="font-victorian text-sherlock-brown text-center mb-4 text-sm">
            L'indizio è nascosto nell'immagine...
          </p>
          {/* Immagine contenente il codice nascosto */}
          <div className="relative bg-sherlock-cream rounded border border-sherlock-brown/20 overflow-hidden">
            <svg viewBox="0 0 400 200" className="w-full h-auto" style={{ minHeight: "150px" }}>
              {/* Sfondo vintage */}
              <defs>
                <pattern id="oldPaper" patternUnits="userSpaceOnUse" width="100" height="100">
                  <rect width="100" height="100" fill="#f5e6d3" />
                  <circle cx="50" cy="50" r="1" fill="#d4c5b3" opacity="0.5" />
                  <circle cx="20" cy="30" r="0.5" fill="#c9b8a5" opacity="0.3" />
                  <circle cx="80" cy="70" r="0.8" fill="#d4c5b3" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#oldPaper)" />

              {/* Vecchia mappa/documento */}
              <text x="200" y="30" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#5d4a37" opacity="0.8">
                Scotland Yard - Archivio Segreto
              </text>

              {/* Linee decorative */}
              <line x1="50" y1="45" x2="350" y2="45" stroke="#5d4a37" strokeWidth="0.5" opacity="0.4" />
              <line x1="50" y1="180" x2="350" y2="180" stroke="#5d4a37" strokeWidth="0.5" opacity="0.4" />

              {/* Elementi decorativi che nascondono i numeri */}
              {/* Numero 4 nascosto nella forma di una finestra */}
              <g transform="translate(60, 70)">
                <rect width="40" height="50" fill="none" stroke="#5d4a37" strokeWidth="1.5" />
                <line x1="20" y1="0" x2="20" y2="50" stroke="#5d4a37" strokeWidth="1" />
                <line x1="0" y1="25" x2="40" y2="25" stroke="#5d4a37" strokeWidth="1" />
                <text x="15" y="20" fontSize="8" fill="#5d4a37" opacity="0.15">
                  4
                </text>
              </g>

              {/* Numero 8 nascosto in un orologio */}
              <g transform="translate(140, 75)">
                <circle r="25" fill="none" stroke="#5d4a37" strokeWidth="1.5" />
                <line x1="0" y1="-20" x2="0" y2="-17" stroke="#5d4a37" strokeWidth="1" />
                <line x1="0" y1="20" x2="0" y2="17" stroke="#5d4a37" strokeWidth="1" />
                <line x1="-20" y1="0" x2="-17" y2="0" stroke="#5d4a37" strokeWidth="1" />
                <line x1="20" y1="0" x2="17" y2="0" stroke="#5d4a37" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="-12" stroke="#5d4a37" strokeWidth="1.5" />
                <line x1="0" y1="0" x2="8" y2="0" stroke="#5d4a37" strokeWidth="1.5" />
                <text x="-3" y="3" fontSize="6" fill="#5d4a37" opacity="0.2">
                  8
                </text>
              </g>

              {/* Numero 2 nelle impronte */}
              <g transform="translate(220, 80)">
                <ellipse rx="8" ry="12" fill="#5d4a37" opacity="0.3" />
                <ellipse cx="15" cy="-5" rx="8" ry="12" fill="#5d4a37" opacity="0.25" />
                <text x="5" y="5" fontSize="10" fill="#5d4a37" opacity="0.15">
                  2
                </text>
              </g>

              {/* Numero 7 in una pipa */}
              <g transform="translate(290, 70)">
                <path
                  d="M0,0 L30,0 L30,10 L15,10 L15,40 L5,40 L5,10 L0,10 Z"
                  fill="none"
                  stroke="#5d4a37"
                  strokeWidth="1.5"
                />
                <ellipse cx="35" cy="5" rx="15" ry="12" fill="none" stroke="#5d4a37" strokeWidth="1.5" />
                <text x="18" y="8" fontSize="8" fill="#5d4a37" opacity="0.12">
                  7
                </text>
              </g>

              {/* Scritta misteriosa */}
              <text
                x="200"
                y="160"
                textAnchor="middle"
                fontFamily="serif"
                fontSize="10"
                fill="#5d4a37"
                opacity="0.6"
                fontStyle="italic"
              >
                "Le quattro cifre rivelano la verità nascosta..."
              </text>

              {/* Numeri nascosti più visibili ma integrati */}
              <text x="80" y="165" fontSize="16" fill="#5d4a37" opacity="0.08" fontFamily="serif">
                IV
              </text>
              <text x="150" y="165" fontSize="16" fill="#5d4a37" opacity="0.08" fontFamily="serif">
                VIII
              </text>
              <text x="230" y="165" fontSize="16" fill="#5d4a37" opacity="0.08" fontFamily="serif">
                II
              </text>
              <text x="310" y="165" fontSize="16" fill="#5d4a37" opacity="0.08" fontFamily="serif">
                VII
              </text>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Cassaforte meccanica */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        style={{
          animation: shake ? "shake 0.5s ease-in-out" : undefined,
        }}
      >
        {/* Corpo cassaforte */}
        <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg p-6 shadow-2xl border-4 border-gray-600">
          {/* Decorazione superiore */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-600 rounded-t-lg" />

          {/* Pannello combinazione */}
          <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700 shadow-inner">
            {/* Rotelle */}
            <div className="flex justify-center gap-2 md:gap-3">
              {digits.map((digit, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Freccia su */}
                  <button
                    onClick={() => rotateDigit(index, "up")}
                    disabled={isUnlocked}
                    className="w-10 h-8 md:w-12 md:h-10 flex items-center justify-center text-gray-400 hover:text-sherlock-gold transition-colors disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M12 4l-8 8h6v8h4v-8h6z" />
                    </svg>
                  </button>

                  {/* Display numero */}
                  <div className="relative">
                    <div className="w-12 h-16 md:w-14 md:h-20 bg-black rounded border-2 border-gray-600 flex items-center justify-center overflow-hidden">
                      {/* Effetto ruota */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50" />
                      <motion.span
                        key={digit}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="font-mono text-3xl md:text-4xl text-sherlock-gold font-bold relative z-10"
                      >
                        {digit}
                      </motion.span>
                    </div>
                    {/* Linee decorative */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-600" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-600" />
                  </div>

                  {/* Freccia giù */}
                  <button
                    onClick={() => rotateDigit(index, "down")}
                    disabled={isUnlocked}
                    className="w-10 h-8 md:w-12 md:h-10 flex items-center justify-center text-gray-400 hover:text-sherlock-gold transition-colors disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M12 20l8-8h-6V4h-4v8H4z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Maniglia e pulsanti */}
          <div className="flex items-center justify-center mt-4 gap-4">
            {/* Pulsante reset */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetCombination}
              disabled={isUnlocked}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Maniglia/leva */}
            <button
              onClick={checkCombination}
              disabled={isUnlocked}
              className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
                isUnlocked
                  ? "bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                  : "bg-gradient-to-b from-gray-500 to-gray-700 hover:from-gray-400 hover:to-gray-600 shadow-lg active:shadow-inner"
              }`}
            >
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center">
                {isUnlocked ? <Unlock className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-gray-800" />}
              </div>
            </button>
          </div>

          {/* Stato */}
          <div className="text-center mt-4">
            {isUnlocked ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-400 font-victorian text-lg"
              >
                ✓ Cassaforte Aperta!
              </motion.p>
            ) : (
              <p className="text-gray-500 font-victorian text-sm">Inserisci la combinazione corretta</p>
            )}
          </div>
        </div>

        {/* Ombra base */}
        <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black/30 blur-md rounded-full" />
      </motion.div>

      {/* Stile shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default SafeCombination;
