import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CongratulationsProps {
  playerName: string;
  solvedEnigmas: number;
  totalEnigmas: number;
}

const Congratulations = ({ playerName, solvedEnigmas, totalEnigmas }: CongratulationsProps) => {
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [rating, setRating] = useState(0); // Numero stelle da 0 a 5

  const handleSendFeedback = async () => {
    if (!feedback.trim() && rating === 0) {
      toast.error("Inserisci un messaggio o una valutazione prima di inviare");
      return;
    }

    setIsSending(true);
    try {
      // Converto le stelle in testo per email: ★★★☆☆
      const starText = "★".repeat(rating) + "☆".repeat(5 - rating);

      const { error } = await supabase.functions.invoke("send-feedback", {
        body: {
          playerName,
          feedback: feedback.trim(),
          solvedEnigmas,
          totalEnigmas,
          rating: starText, // <-- qui le stelle diventano testo
        },
      });

      if (error) throw error;

      setFeedbackSent(true);
      toast.success("Grazie per il tuo feedback!");
    } catch (err) {
      console.error("Errore invio feedback:", err);
      toast.error("Errore nell'invio del feedback. Riprova.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen sherlock-bg flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
              y: (typeof window !== "undefined" ? window.innerHeight : 800) + 50,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: -100,
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute"
          >
            <Star className="w-4 h-4 text-sherlock-gold/40" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-lg relative z-10 w-full"
      >
        {/* Trophy */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-24 h-24 md:w-32 md:h-32 mx-auto text-sherlock-gold" />
          </motion.div>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="sherlock-ornament text-sherlock-gold"
        >
          ═══════ ✦ ═══════
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <h1 className="font-sherlock text-3xl md:text-5xl text-sherlock-gold">Congratulazioni!</h1>
          <p className="font-victorian text-sherlock-cream text-lg md:text-xl">Detective {playerName}</p>
        </motion.div>

        {/* Achievement card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="sherlock-paper rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <p className="font-sherlock text-sherlock-brown text-lg">
              Hai risolto {solvedEnigmas}/{totalEnigmas} enigmi
            </p>
          </div>
        </motion.div>

        {/* Feedback & Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="sherlock-paper rounded-lg p-6 space-y-4"
        >
          <h3 className="font-sherlock text-sherlock-brown text-lg">Valuta l'Esperienza</h3>

          {feedbackSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
              <p className="font-victorian text-sherlock-brown">Grazie per il tuo prezioso feedback, Detective!</p>
            </motion.div>
          ) : (
            <>
              {/* Stelline selezionabili */}
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className={`text-2xl transition-colors ${i <= rating ? "text-yellow-400" : "text-yellow-200"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Scrivi i tuoi suggerimenti e commenti..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-sherlock-cream border-sherlock-brown/30 text-sherlock-brown font-victorian min-h-[100px] resize-none"
              />

              <Button
                onClick={handleSendFeedback}
                disabled={isSending || (feedback.trim() === "" && rating === 0)}
                className="w-full bg-sherlock-gold hover:bg-sherlock-gold/80 text-sherlock-dark font-victorian"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Feedback
                  </>
                )}
              </Button>
            </>
          )}
        </motion.div>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="font-victorian text-sherlock-cream/60 text-sm italic"
        >
          "Il gioco è finito, Watson. Ma la prossima avventura è sempre dietro l'angolo."
        </motion.p>

        {/* Bottom ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="sherlock-ornament text-sherlock-gold/40"
        >
          ❧ ✦ ❧
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Congratulations;
