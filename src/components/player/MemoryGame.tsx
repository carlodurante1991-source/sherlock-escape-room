import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
interface MemoryGameProps {
  onSolve: () => void;
  isSolved: boolean;
}

// 32 oggetti iconici di Sherlock Holmes (32 paia = 64 carte)
const SHERLOCK_ITEMS = [
  {
    id: 1,
    icon: "🔍",
    name: "Lente",
  },
  {
    id: 2,
    icon: "🎩",
    name: "Cappello",
  },
  {
    id: 3,
    icon: "🎻",
    name: "Violino",
  },
  {
    id: 4,
    icon: "📋",
    name: "Appunti",
  },
  {
    id: 5,
    icon: "🕯️",
    name: "Candela",
  },
  {
    id: 6,
    icon: "🔑",
    name: "Chiave",
  },
  {
    id: 7,
    icon: "💀",
    name: "Teschio",
  },
  {
    id: 8,
    icon: "📰",
    name: "Giornale",
  },
  {
    id: 9,
    icon: "🗡️",
    name: "Pugnale",
  },
  {
    id: 10,
    icon: "⏱️",
    name: "Orologio",
  },
  {
    id: 11,
    icon: "🔒",
    name: "Lucchetto",
  },
  {
    id: 12,
    icon: "📜",
    name: "Pergamena",
  },
  {
    id: 13,
    icon: "🕵️",
    name: "Detective",
  },
  {
    id: 14,
    icon: "🐕",
    name: "Mastino",
  },
  {
    id: 15,
    icon: "💉",
    name: "Siringa",
  },
  {
    id: 16,
    icon: "🧪",
    name: "Provetta",
  },
  {
    id: 17,
    icon: "🎭",
    name: "Maschera",
  },
  {
    id: 18,
    icon: "⚗️",
    name: "Alambicco",
  },
  {
    id: 19,
    icon: "🏛️",
    name: "Scotland Yard",
  },
  {
    id: 20,
    icon: "🚂",
    name: "Treno",
  },
  {
    id: 21,
    icon: "🌫️",
    name: "Nebbia",
  },
  {
    id: 22,
    icon: "🎯",
    name: "Bersaglio",
  },
  {
    id: 23,
    icon: "📧",
    name: "Lettera",
  },
  {
    id: 24,
    icon: "🖋️",
    name: "Penna",
  },
  {
    id: 25,
    icon: "🔔",
    name: "Campanello",
  },
  {
    id: 26,
    icon: "🪞",
    name: "Specchio",
  },
  {
    id: 27,
    icon: "🕰️",
    name: "Pendolo",
  },
  {
    id: 28,
    icon: "🗝️",
    name: "Chiave antica",
  },
  {
    id: 29,
    icon: "📖",
    name: "Diario",
  },
  {
    id: 30,
    icon: "🎪",
    name: "Circo",
  },
  {
    id: 31,
    icon: "⚰️",
    name: "Bara",
  },
  {
    id: 32,
    icon: "👁️",
    name: "Occhio",
  },
];
interface Card {
  id: number;
  itemId: number;
  icon: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
const MemoryGame = ({ onSolve, isSolved }: MemoryGameProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const initializeGame = useCallback(() => {
    // Crea 64 carte (32 paia)
    const cardPairs: Card[] = [];
    SHERLOCK_ITEMS.forEach((item, index) => {
      // Prima carta della coppia
      cardPairs.push({
        id: index * 2,
        itemId: item.id,
        icon: item.icon,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
      // Seconda carta della coppia
      cardPairs.push({
        id: index * 2 + 1,
        itemId: item.id,
        icon: item.icon,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });
    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsResetting(false);
  }, []);
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  const handleCardClick = (cardId: number) => {
    if (isChecking || isResetting || isSolved) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Gira la carta
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              isFlipped: true,
            }
          : c,
      ),
    );
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Se abbiamo 2 carte girate, controlla se sono uguali
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);
      setTimeout(() => {
        if (firstCard && secondCard && firstCard.itemId === secondCard.itemId) {
          // Match trovato!
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? {
                    ...c,
                    isMatched: true,
                  }
                : c,
            ),
          );
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);

          // Controlla se il gioco è completato
          if (newMatchedPairs === SHERLOCK_ITEMS.length) {
            setTimeout(() => {
              onSolve();
            }, 500);
          }
        } else {
          // Nessun match - rigira le carte
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? {
                    ...c,
                    isFlipped: false,
                  }
                : c,
            ),
          );
        }
        setFlippedCards([]);
        setIsChecking(false);
      }, 800);
    }
  };
  if (isSolved) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center gap-2 bg-green-700/20 text-green-600 px-6 py-3 rounded-full mb-4">
          <Check className="w-6 h-6" />
          <span className="font-victorian text-lg">Memory completato!</span>
        </div>
        <p className="font-victorian text-sherlock-brown/70">Hai accoppiato tutte le carte con successo!</p>
      </motion.div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Header con info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sherlock-brown font-victorian">
          <span className="text-sm">Coppie trovate: </span>
          <span className="font-bold text-sherlock-gold">{matchedPairs}</span>
          <span className="text-sm"> / {SHERLOCK_ITEMS.length}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={initializeGame}
          className="text-sherlock-brown hover:text-sherlock-gold"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Ricomincia
        </Button>
      </div>

      {/* Griglia delle carte - 8x8 */}
      <div className="grid grid-cols-8 gap-1 md:gap-2">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{
              rotateY: 0,
            }}
            animate={{
              rotateY: card.isFlipped || card.isMatched ? 180 : 0,
              scale: card.isMatched ? 0.95 : 1,
            }}
            transition={{
              duration: 0.3,
            }}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square cursor-pointer perspective-1000 relative
              ${card.isMatched ? "opacity-60" : ""}
              ${isChecking || isResetting ? "pointer-events-none" : ""}
            `}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Retro della carta */}
            {/* Retro della carta con immagine */}
            <div className="absolute inset-0 rounded-md backface-hidden z-10" style={{ backfaceVisibility: "hidden" }}>
              <img
                src="https://i.imgur.com/AOP9NEs.jpeg"
                alt="Retro carta Sherlock"
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            {/* Fronte della carta */}
            <div
              className={`
                absolute inset-0 rounded-md flex items-center justify-center
                bg-sherlock-cream border-2 
                ${card.isMatched ? "border-green-500 bg-green-50" : "border-sherlock-gold"}
                backface-hidden rotate-y-180
                ${card.isFlipped || card.isMatched ? "z-10" : "z-0"}
              `}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-xl md:text-2xl">{card.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Istruzioni */}
      <p className="text-center font-victorian text-sherlock-brown/60 text-sm mt-4">
        Trova tutte le 32 coppie di oggetti legati a Sherlock Holmes!
      </p>
    </div>
  );
};
export default MemoryGame;
