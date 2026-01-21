import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Skull, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkFinalAnswer } from "@/data/enigmaAnswers";

interface FinalEnigmaProps {
  onSolve: () => void;
  onBack?: () => void;
  gameRemainingSeconds: number;
  playerName: string;
}

const CASE_TITLES = [
  "Caso 1: Decesso in codice",
  "Caso 2: Ricerca la verità",
  "Caso 3: Molti indagati",
  "Caso 4: Ordine nel caos",
  "Caso 5: Riordina le idee",
  "Caso 6: Indizi",
  "Caso 7: A due passi dalla morte",
  "Caso 8: Ritornare sui suoi passi",
  "Caso 9: Tenta ancora",
  "Caso 10: Yes Can",
];

const FinalEnigma = ({ onSolve, onBack, gameRemainingSeconds, playerName }: FinalEnigmaProps) => {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      if (checkFinalAnswer(answer)) {
        setError(false);
        onSolve();
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className="min-h-screen sherlock-bg">
      <div className="sherlock-border-bottom py-4 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-sherlock-gold hover:text-sherlock-cream hover:bg-sherlock-gold/20"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-victorian text-sm">Indietro</span>
            </Button>
          )}
          <div className="flex items-center gap-2 mx-auto">
            <Clock className="w-5 h-5 text-sherlock-gold animate-pulse" />
            <span className="font-sherlock text-sherlock-gold text-2xl tracking-wider">
              {formatTime(gameRemainingSeconds)}
            </span>
          </div>
          {onBack && <div className="w-20" />}
        </div>
      </div>

      <div className="px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Skull className="w-16 h-16 mx-auto text-sherlock-gold mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
            </motion.div>
            <h1 className="font-sherlock text-3xl md:text-4xl text-white mb-2 tracking-widest">
              L'EPILOGO
            </h1>
            <p className="font-victorian text-sherlock-gold text-lg italic">
              Il momento della verità, Detective {playerName}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-black/40 border border-sherlock-gold/30 rounded-lg p-6 backdrop-blur-md shadow-xl"
          >
            <h2 className="font-sherlock text-sherlock-gold text-center text-xl mb-4 tracking-wider uppercase">
              I Casi Risolti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CASE_TITLES.map((title, index) => (
                <div
                  key={index}
                  className="font-victorian text-white/90 text-sm py-2 px-3 bg-white/5 rounded border-l-2 border-sherlock-gold/50 shadow-sm"
                >
                  {title}
                </div>
              ))}
            </div>
          </motion.div>

          {/* DOCUMENTO FINALE - TESTO NERO E LEGGIBILE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#f2e8cf] rounded-sm p-6 md:p-10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-sherlock-brown/40"
          >
            <div className="absolute inset-2 border border-sherlock-brown/10 pointer-events-none rounded-sm" />
            
            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-red-700 font-bold mb-4 bg-red-700/5 px-4 py-1 rounded-full border border-red-700/10">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-victorian text-sm uppercase tracking-widest">Messaggio Urgente</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-victorian text-black text-xl leading-relaxed text-center font-medium">
                  "Benissimo, avete risolto tutti i casi.
                </p>
                <p className="font-victorian text-black text-xl leading-relaxed text-center font-medium">
                  Ora non resta che risolvere il vostro.
                </p>
                <p className="font-victorian text-black text-xl leading-relaxed text-center font-medium">
                  Chi vi ha portati qui ed avvelenati con la belladonna?
                </p>
                
                <div className="py-6 border-y border-sherlock-brown/10 my-6">
                  <p className="font-sherlock text-black text-2xl text-center italic font-black tracking-tight">
                    "La risposta spesso è l'inizio di ogni enigma."
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="font-victorian text-black/70 text-center text-base italic font-bold">
                  Chi è il colpevole, Detective?
                </p>
                
                <Input
                  type="text"
                  placeholder="Scrivi il nome..."
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="h-14 bg-white/50 border-2 border-sherlock-brown text-black font-victorian text-center text-xl placeholder:text-black/20 focus:ring-sherlock-gold"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-700/10 border border-red-700/30 rounded p-3 text-center"
                  >
                    <p className="text-red-800 text-sm font-bold font-victorian italic">
                      "No, no! Questo non è il nome che cerco. Chi si cela nell'ombra?"
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="bg-sherlock-gold hover:bg-yellow-600 text-black font-bold px-10 py-6 text-lg shadow-lg border-b-4 border-yellow-800"
                  >
                    RIVELA IL COLPEVOLE
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-12 opacity-60">
            <p className="font-victorian text-sherlock-gold text-sm italic">
              "Quando hai eliminato l'impossibile, ciò che resta... deve essere la verità."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalEnigma;