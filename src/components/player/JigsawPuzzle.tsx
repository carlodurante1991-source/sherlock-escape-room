import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Shuffle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JigsawPuzzleProps {
  onSolve: () => void;
  isSolved: boolean;
}

const GRID_SIZE = 8; // 10x10 = 100 pezzi
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

interface PuzzlePiece {
  id: number;
  currentPosition: number;
}

// Usa direttamente il link Imgur
const puzzleImage = "https://i.imgur.com/nkAa5qf.jpeg";

const JigsawPuzzle = ({ onSolve, isSolved }: JigsawPuzzleProps) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);

  // Inizializza puzzle con pezzi mescolati
  const initializePuzzle = useCallback(() => {
    const initialPieces: PuzzlePiece[] = Array.from({ length: TOTAL_PIECES }, (_, i) => ({
      id: i,
      currentPosition: i,
    }));

    // Fisher-Yates shuffle
    const shuffledPositions = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
    for (let i = shuffledPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
    }

    initialPieces.forEach((piece, index) => {
      piece.currentPosition = shuffledPositions[index];
    });

    setPieces(initialPieces);
    setSelectedPiece(null);
    setIsComplete(false);
    setMoves(0);
  }, []);

  useEffect(() => {
    if (!isSolved) initializePuzzle();
  }, [initializePuzzle, isSolved]);

  // Controlla se il puzzle è completato
  useEffect(() => {
    if (pieces.length === TOTAL_PIECES) {
      const solved = pieces.every((piece) => piece.id === piece.currentPosition);
      if (solved && !isComplete && !isSolved) {
        setIsComplete(true);
        onSolve();
      }
    }
  }, [pieces, isComplete, isSolved, onSolve]);

  const handlePieceClick = (clickedPieceIndex: number) => {
    if (isSolved || isComplete) return;
    if (selectedPiece === null) {
      setSelectedPiece(clickedPieceIndex);
    } else if (selectedPiece === clickedPieceIndex) {
      setSelectedPiece(null);
    } else {
      // Scambia i pezzi
      setPieces((prevPieces) => {
        const newPieces = [...prevPieces];
        const piece1 = newPieces.find((p) => p.currentPosition === selectedPiece)!;
        const piece2 = newPieces.find((p) => p.currentPosition === clickedPieceIndex)!;
        const tempPosition = piece1.currentPosition;
        piece1.currentPosition = piece2.currentPosition;
        piece2.currentPosition = tempPosition;
        return newPieces;
      });
      setMoves((m) => m + 1);
      setSelectedPiece(null);
    }
  };

  // Ordina i pezzi per posizione corrente
  const sortedPieces = [...pieces].sort((a, b) => a.currentPosition - b.currentPosition);

  if (isSolved || isComplete) {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 text-green-500"
        >
          <Check className="w-6 h-6" />
          <span className="font-sherlock text-xl">Puzzle completato!</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-lg shadow-lg"
          style={{
            width: "min(350px, 90vw)",
            aspectRatio: "1/1", // quadrato
          }}
        >
          <img src={puzzleImage} alt="Puzzle completato" className="w-full h-full object-cover" />
        </motion.div>
        {moves > 0 && <p className="font-victorian text-sherlock-brown/70 text-sm">Completato in {moves} mosse</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[350px]">
        <span className="font-victorian text-sherlock-brown text-sm">Mosse: {moves}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={initializePuzzle}
          className="border-sherlock-brown/30 text-sherlock-brown hover:bg-sherlock-brown/10"
        >
          <Shuffle className="w-4 h-4 mr-1" />
          Mescola
        </Button>
      </div>

      <p className="font-victorian text-sherlock-brown/70 text-sm text-center">
        Clicca due tessere per scambiarle di posizione
      </p>

      <div
        className="relative bg-sherlock-brown/20 rounded-lg overflow-hidden shadow-lg"
        style={{ width: "min(350px, 90vw)", aspectRatio: "1/1" }} // quadrato
      >
        <div
          className="grid gap-[1px] w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {sortedPieces.map((piece) => {
            const originalRow = Math.floor(piece.id / GRID_SIZE);
            const originalCol = piece.id % GRID_SIZE;
            const isSelected = selectedPiece === piece.currentPosition;
            return (
              <motion.div
                key={piece.id}
                onClick={() => handlePieceClick(piece.currentPosition)}
                className={`relative cursor-pointer overflow-hidden transition-all ${
                  isSelected ? "ring-2 ring-sherlock-gold z-10 scale-105" : "hover:brightness-110"
                }`}
                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  aspectRatio: "1/1", // tessera quadrata
                  backgroundImage: `url(${puzzleImage})`,
                  backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                  backgroundPosition: `${(originalCol * 100) / (GRID_SIZE - 1)}% ${
                    (originalRow * 100) / (GRID_SIZE - 1)
                  }%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Anteprima immagine */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <p className="font-victorian text-sherlock-brown/60 text-xs">Immagine di riferimento:</p>
        <div
          className="rounded border border-sherlock-brown/30 overflow-hidden opacity-70"
          style={{ width: "80px", aspectRatio: "1/1" }}
        >
          <img alt="Riferimento" className="w-full h-full object-cover" src={puzzleImage} />
        </div>
      </div>
    </div>
  );
};

export default JigsawPuzzle;
