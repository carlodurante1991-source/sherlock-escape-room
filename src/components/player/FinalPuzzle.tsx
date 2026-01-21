import { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { Clock, Crown, ArrowRight, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUZZLE_LETTERS, checkPiecesOrder } from "@/data/puzzlePieces";

interface FinalPuzzleProps {
  onSolve: () => void;
  onBack?: () => void;
  gameRemainingSeconds: number;
  playerName: string;
}

interface PuzzlePiece {
  position: number;
  emoji: string;
  letter: string;
}

const FinalPuzzle = forwardRef<HTMLDivElement, FinalPuzzleProps>(
  ({ onSolve, onBack, gameRemainingSeconds, playerName }, ref) => {
    const [availablePieces, setAvailablePieces] = useState<PuzzlePiece[]>(() => {
      return [...PUZZLE_LETTERS].sort(() => Math.random() - 0.5);
    });
    
    const [gridSlots, setGridSlots] = useState<(PuzzlePiece | null)[]>(
      Array(10).fill(null)
    );
    
    const [error, setError] = useState("");
    const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
    const [dragSource, setDragSource] = useState<"available" | number | null>(null);

    // Stato per gestire il "Tap to Select" su Tablet
    const [selectedPiece, setSelectedPiece] = useState<{piece: PuzzlePiece, source: "available" | number} | null>(null);

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Logica universale di spostamento (usata sia da Drag che da Tap)
    const movePiece = (piece: PuzzlePiece, source: "available" | number, targetSlotIndex: number) => {
      const newGridSlots = [...gridSlots];
      const newAvailablePieces = [...availablePieces];
      const existingPiece = newGridSlots[targetSlotIndex];
      
      // Rimuovi il pezzo dalla sorgente
      if (source === "available") {
        const pieceIndex = newAvailablePieces.findIndex(p => p.position === piece.position);
        if (pieceIndex !== -1) newAvailablePieces.splice(pieceIndex, 1);
      } else {
        newGridSlots[source] = null;
      }

      // Se c'era già un pezzo nel target, rimettilo al posto della sorgente o negli disponibili
      if (existingPiece) {
        if (source === "available") {
          newAvailablePieces.push(existingPiece);
        } else {
          newGridSlots[source] = existingPiece;
        }
      }

      newGridSlots[targetSlotIndex] = piece;
      setGridSlots(newGridSlots);
      setAvailablePieces(newAvailablePieces);
      setSelectedPiece(null);
    };

    // Gestione Drag & Drop (Mouse)
    const handleDragStart = (piece: PuzzlePiece, source: "available" | number) => {
      setDraggedPiece(piece);
      setDragSource(source);
    };

    const handleDropOnSlot = (slotIndex: number) => {
      if (draggedPiece && dragSource !== null) {
        movePiece(draggedPiece, dragSource, slotIndex);
      }
      setDraggedPiece(null);
      setDragSource(null);
    };

    // Gestione Tap (Tablet/Touch)
    const handlePieceTap = (piece: PuzzlePiece, source: "available" | number) => {
      if (selectedPiece?.piece.position === piece.position) {
        setSelectedPiece(null); // Deseleziona se tocca di nuovo lo stesso
      } else {
        setSelectedPiece({ piece, source });
      }
    };

    const handleSlotTap = (slotIndex: number) => {
      if (selectedPiece) {
        movePiece(selectedPiece.piece, selectedPiece.source, slotIndex);
      }
    };

    const handleBackToAvailable = () => {
      if (selectedPiece && typeof selectedPiece.source === "number") {
        const newGridSlots = [...gridSlots];
        newGridSlots[selectedPiece.source] = null;
        setGridSlots(newGridSlots);
        setAvailablePieces([...availablePieces, selectedPiece.piece]);
        setSelectedPiece(null);
      }
    };

    const handleReset = () => {
      setAvailablePieces([...PUZZLE_LETTERS].sort(() => Math.random() - 0.5));
      setGridSlots(Array(10).fill(null));
      setError("");
      setSelectedPiece(null);
    };

    const handleCheckOrder = () => {
      if (gridSlots.some(slot => slot === null)) {
        setError("Posiziona tutte le lettere nella griglia!");
        return;
      }
      const currentOrder = gridSlots.map(p => p!.position);
      if (checkPiecesOrder(currentOrder)) {
        onSolve(); 
      } else {
        setError("L'ordine non è corretto! Riprova.");
      }
    };

    const currentWord = gridSlots.map(p => p?.letter || "_").join("");

    return (
      <div ref={ref} className="min-h-screen sherlock-bg pb-10 text-black">
        <div className="bg-black/40 backdrop-blur-md border-b border-sherlock-gold/30 py-4 px-4 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="text-sherlock-gold">
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="font-victorian text-sm">Indietro</span>
              </Button>
            )}
            <div className="flex items-center gap-3 bg-sherlock-dark/60 px-4 py-1.5 rounded-full border border-sherlock-gold/50 shadow-lg">
              <Clock className="w-5 h-5 text-sherlock-gold animate-pulse" />
              <span className="font-sherlock text-sherlock-gold text-xl tracking-wider">
                {formatTime(gameRemainingSeconds)}
              </span>
            </div>
            {onBack && <div className="w-20" />}
          </div>
        </div>

        <div className="px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            
            <div className="text-center mb-8">
              <Crown className="w-14 h-14 mx-auto text-sherlock-gold mb-3 drop-shadow-lg" />
              <h1 className="font-sherlock text-3xl md:text-4xl text-white tracking-widest uppercase">
                L'Anagramma
              </h1>
              <div className="bg-black/10 backdrop-blur-sm py-2 px-6 rounded-full inline-block border border-white/10 mt-2">
                <p className="font-victorian text-black text-lg italic">
                  "La risposta spesso è l'inizio di ogni enigma. Ordina le tessere, {playerName}"
                </p>
              </div>
            </div>

            <motion.div className="bg-[#f2e8cf] rounded-xl p-4 md:p-8 relative shadow-2xl border-2 border-sherlock-brown/40">
              <div className="relative z-10">
                {/* GRIGLIA SLOT */}
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
                  {gridSlots.map((piece, index) => (
                    <div
                      key={`slot-${index}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropOnSlot(index)}
                      onClick={() => handleSlotTap(index)}
                      className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer
                        ${piece ? "bg-white border-sherlock-brown shadow-md" : "bg-black/10 border-dashed border-sherlock-brown/40"}
                        ${selectedPiece && !piece ? "ring-2 ring-sherlock-gold animate-pulse" : ""}`}
                    >
                      {piece ? (
                        <motion.div
                          draggable
                          onDragStart={() => handleDragStart(piece, index)}
                          onClick={(e) => { e.stopPropagation(); handlePieceTap(piece, index); }}
                          className={`w-full h-full flex flex-col items-center justify-center p-1 
                            ${selectedPiece?.piece.position === piece.position ? "bg-sherlock-gold/20" : ""}`}
                        >
                          <span className="text-xl md:text-2xl mb-1">{piece.emoji}</span>
                          <span className="text-xl md:text-2xl font-black font-sherlock text-black leading-none">
                            {piece.letter}
                          </span>
                        </motion.div>
                      ) : (
                        <span className="text-black/30 font-bold">{index + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* PREVIEW */}
                <div className="bg-black/5 p-4 rounded-lg mb-8 border border-sherlock-brown/20 shadow-inner">
                  <div className="flex justify-center w-full">
                    <p className="font-sherlock text-black text-2xl md:text-3xl text-center tracking-[0.2em] font-black uppercase">
                      {currentWord.split('').map((l, i) => (
                        <span key={i} className={l === "_" ? "opacity-20" : "text-black"}>{l}</span>
                      ))}
                    </p>
                  </div>
                </div>

                {/* AREA PEZZI DISPONIBILI */}
                <div 
                  className={`bg-black/5 p-5 rounded-xl border border-sherlock-brown/20 min-h-[120px] transition-all
                    ${selectedPiece && typeof selectedPiece.source === "number" ? "ring-2 ring-sherlock-gold/50" : ""}`}
                  onClick={handleBackToAvailable}
                >
                  <div className="flex flex-wrap justify-center gap-3">
                    {availablePieces.map((piece) => (
                      <motion.div
                        key={piece.position}
                        draggable
                        onDragStart={() => handleDragStart(piece, "available")}
                        onClick={(e) => { e.stopPropagation(); handlePieceTap(piece, "available"); }}
                        whileHover={{ scale: 1.05 }}
                        className={`w-12 h-16 md:w-14 md:h-20 bg-white rounded-lg shadow-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-colors
                          ${selectedPiece?.piece.position === piece.position ? "border-sherlock-gold bg-sherlock-gold/10" : "border-sherlock-brown/40"}`}
                      >
                        <span className="text-xl">{piece.emoji}</span>
                        <span className="text-2xl font-black font-sherlock text-black">{piece.letter}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-700 font-bold text-center mt-4 animate-bounce">{error}</p>}

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="outline" onClick={handleReset} className="border-sherlock-brown text-sherlock-brown font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                  </Button>
                  <Button 
                    onClick={handleCheckOrder} 
                    disabled={gridSlots.filter(s => s !== null).length !== 10} 
                    className="bg-sherlock-gold hover:bg-yellow-600 text-black font-bold px-8 shadow-lg"
                  >
                    VERIFICA <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
);

FinalPuzzle.displayName = "FinalPuzzle";
export default FinalPuzzle;