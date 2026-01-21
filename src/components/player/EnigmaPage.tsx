import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Check } from "lucide-react"; // Rimosse icone navigazione
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAnswer, checkFinalAnswer } from "@/data/enigmaAnswers";
import FifteenPuzzle from "./FifteenPuzzle";
import JigsawPuzzle from "./JigsawPuzzle";
import MemoryGame from "./MemoryGame";
import VictorianSafe from "./VictorianSafe";
import SpotTheDifference from "./SpotTheDifference";

// Navigazione disabilitata per il gioco finale
const DEV_MODE = false; 

interface EnigmaPageProps {
  envelopeNumber: number;
  onBack: () => void;
  onSolve: () => void;
  gameRemainingSeconds: number;
  playerName: string;
  isSolved: boolean;
  // onNavigate rimosso per pulizia
}

const ENIGMAS: Record<
  number,
  {
    title: string;
    content: string;
    hint?: string;
    isPuzzle?: boolean;
    puzzleType?: "fifteen" | "jigsaw" | "memory" | "safe" | "differences";
  }
> = {
  1: { title: "Decesso in codice", content: "Domenica scorsa un uomo venne trovato morto nel suo studio. Sulla scrivania c'era un biglietto con scritto: 'Il colpevole è 4-15-18-1-14, 8-1-20-20-25'. Decodifica il messaggio per scoprire l'assassino." },
  2: { title: "Ricerca la veritá", content: "Lo studio del detective nasconde segreti. Trova le 5 differenze tra queste due immagini.", isPuzzle: true, puzzleType: "differences" },
  3: { title: "Molti indagati", content: "Maggiordomo, cuoco e domestica... a chi appartiene ogni armadietto?" },
  4: { title: "Ordine dal caos", content: "Ordinaria fu la morte? C'è un segno, una prova, in ogni delitto..." },
  5: { title: "Riordina le idee", content: "Ricomponi l'immagine per rivelare l'indizio nascosto.", isPuzzle: true, puzzleType: "jigsaw" },
  6: { title: "Indizi", content: "Individua tutte le coppie di oggetti legati a Sherlock Holmes.", isPuzzle: true, puzzleType: "memory" },
  7: { title: "A due passi dalla morte", content: "Una delle due coppie muore durante il tango, come è stato ucciso?" },
  8: { title: "Ritornare indietro nel tempo", content: "Ritrovato questo messaggio al momento ancora non decifrato: IB ZXPZXQB AF OBFZEBKYXZE -3" },
  9: { title: "Tenta Ancora", content: "Tranne l'ordine giusto non vi è soluzione.", isPuzzle: true, puzzleType: "fifteen" },
  10: { title: "Yes can", content: "Una cassaforte vittoriana custodisce l'ultimo segreto...", isPuzzle: true, puzzleType: "safe" },
  11: { title: "Enigma Finale", content: "Chi è il vero nemico di Sherlock Holmes?" },
};

const isPuzzleEnigma = (envelopeNumber: number): boolean => ENIGMAS[envelopeNumber]?.isPuzzle === true;
const getPuzzleType = (envelopeNumber: number) => ENIGMAS[envelopeNumber]?.puzzleType;

const EnigmaPage = ({
  envelopeNumber,
  onBack,
  onSolve,
  gameRemainingSeconds,
  playerName,
  isSolved,
}: EnigmaPageProps) => {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  const enigma = ENIGMAS[envelopeNumber] || {
    title: `Enigma ${envelopeNumber}`,
    content: "Questo enigma non è ancora stato scritto...",
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    let correct = envelopeNumber === 11 ? checkFinalAnswer(answer) : checkAnswer(envelopeNumber, answer);

    if (correct) {
      setError(false);
      onSolve();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen sherlock-bg">
      {/* Header - Solo tasto indietro e timer */}
      <div className="sherlock-border-bottom py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-sherlock-cream hover:text-sherlock-gold hover:bg-sherlock-brown/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-victorian">Torna ai fascicoli</span>
          </Button>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sherlock-gold" />
            <span className="font-sherlock text-sherlock-gold">{formatTime(gameRemainingSeconds)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="sherlock-ornament text-sherlock-gold/60 mb-4">❧ ✦ ❧</div>
            <span className="font-victorian text-sherlock-cream/60 text-sm block mb-2">
              Fascicolo Segreto N° {envelopeNumber.toString().padStart(2, "0")}
            </span>
            <h1 className="font-sherlock text-2xl md:text-3xl text-sherlock-gold">{enigma.title}</h1>
          </div>

          <motion.div className="sherlock-paper rounded-sm p-6 md:p-8 relative">
            <div className="relative z-10">
              {isPuzzleEnigma(envelopeNumber) ? (
                <>
                  {getPuzzleType(envelopeNumber) === "jigsaw" && <JigsawPuzzle onSolve={onSolve} isSolved={isSolved} />}
                  {getPuzzleType(envelopeNumber) === "memory" && <MemoryGame onSolve={onSolve} isSolved={isSolved} />}
                  {getPuzzleType(envelopeNumber) === "safe" && <VictorianSafe onSolve={onSolve} isSolved={isSolved} />}
                  {getPuzzleType(envelopeNumber) === "differences" && <SpotTheDifference onSolve={onSolve} isSolved={isSolved} />}
                  {getPuzzleType(envelopeNumber) === "fifteen" && <FifteenPuzzle onSolve={onSolve} isSolved={isSolved} />}
                </>
              ) : (
                <p className="font-victorian text-sherlock-brown text-lg leading-relaxed mb-6">{enigma.content}</p>
              )}
            </div>

            {!isSolved && !isPuzzleEnigma(envelopeNumber) && (
              <div className="mt-6 space-y-4">
                <div className="sherlock-paper rounded-sm p-4 space-y-4 bg-white/50">
                  <p className="font-victorian text-sherlock-brown text-center text-sm">
                    Inserisci la tua risposta, Detective {playerName}
                  </p>
                  <Input
                    type="text"
                    placeholder="La tua risposta..."
                    value={answer}
                    onChange={(e) => { setAnswer(e.target.value); setError(false); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                    className={`bg-sherlock-cream border-sherlock-brown/30 text-sherlock-brown font-victorian text-center ${error ? "border-red-500 border-2" : ""}`}
                  />
                  {error && <p className="text-red-600 text-sm font-victorian text-center">Risposta errata, riprova!</p>}
                  <div className="flex justify-center">
                    <Button onClick={handleSubmitAnswer} disabled={!answer.trim()} className="bg-sherlock-gold hover:bg-sherlock-gold/80 text-sherlock-dark font-victorian">
                      Conferma risposta
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isSolved && !isPuzzleEnigma(envelopeNumber) && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-green-700/20 text-green-400 px-4 py-2 rounded-full">
                  <Check className="w-5 h-5" />
                  <span className="font-victorian">Enigma già risolto</span>
                </div>
              </div>
            )}
          </motion.div>

          <div className="text-center mt-8">
            <div className="sherlock-ornament text-sherlock-gold/30">═══════ ✦ ═══════</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnigmaPage;