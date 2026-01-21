import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FifteenPuzzleProps {
  onSolve: () => void;
  isSolved: boolean;
}

// The goal state: numbers 1-15 in order, 0 represents the empty space
const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

// Generate a solvable puzzle
const generateSolvablePuzzle = (): number[] => {
  // Start with goal state and make random valid moves
  let puzzle = [...GOAL_STATE];
  const moves = 100; // Number of random moves to shuffle
  
  for (let i = 0; i < moves; i++) {
    const emptyIndex = puzzle.indexOf(0);
    const row = Math.floor(emptyIndex / 4);
    const col = emptyIndex % 4;
    
    const possibleMoves: number[] = [];
    if (row > 0) possibleMoves.push(emptyIndex - 4); // up
    if (row < 3) possibleMoves.push(emptyIndex + 4); // down
    if (col > 0) possibleMoves.push(emptyIndex - 1); // left
    if (col < 3) possibleMoves.push(emptyIndex + 1); // right
    
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    [puzzle[emptyIndex], puzzle[randomMove]] = [puzzle[randomMove], puzzle[emptyIndex]];
  }
  
  return puzzle;
};

const FifteenPuzzle = ({ onSolve, isSolved }: FifteenPuzzleProps) => {
  const [tiles, setTiles] = useState<number[]>(() => generateSolvablePuzzle());
  const [moveCount, setMoveCount] = useState(0);
  const [justSolved, setJustSolved] = useState(false);

  // Check if puzzle is solved
  useEffect(() => {
    if (!isSolved && !justSolved) {
      const isSolvedNow = tiles.every((tile, index) => tile === GOAL_STATE[index]);
      if (isSolvedNow) {
        setJustSolved(true);
        setTimeout(() => {
          onSolve();
        }, 500);
      }
    }
  }, [tiles, isSolved, justSolved, onSolve]);

  const handleTileClick = (index: number) => {
    if (isSolved || justSolved) return;
    
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;
    
    // Check if the clicked tile is adjacent to the empty space
    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    
    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoveCount(prev => prev + 1);
    }
  };

  const handleShuffle = () => {
    if (isSolved) return;
    setTiles(generateSolvablePuzzle());
    setMoveCount(0);
    setJustSolved(false);
  };

  return (
    <div className="space-y-4">
      {/* Puzzle description */}
      <p className="font-victorian text-sherlock-brown text-lg leading-relaxed mb-6">
        Un antico puzzle è stato ritrovato sulla scena del crimine. L'assassino ha lasciato un messaggio: 
        "Solo chi riordina il caos può trovare la verità". 
        <br /><br />
        <span className="italic">Risolvi il puzzle a scorrimento mettendo i numeri in ordine da 1 a 15.</span>
      </p>

      {/* Move counter */}
      <div className="text-center font-victorian text-sherlock-brown/70">
        Mosse: <span className="font-bold text-sherlock-brown">{moveCount}</span>
      </div>

      {/* Puzzle grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-4 gap-1 bg-sherlock-brown/30 p-2 rounded-md shadow-inner">
          <AnimatePresence mode="popLayout">
            {tiles.map((tile, index) => (
              <motion.button
                key={tile === 0 ? 'empty' : tile}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  backgroundColor: tile === 0 ? 'transparent' : undefined
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  layout: { duration: 0.15 }
                }}
                onClick={() => handleTileClick(index)}
                disabled={tile === 0 || isSolved || justSolved}
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18
                  flex items-center justify-center
                  font-sherlock text-xl sm:text-2xl font-bold
                  rounded-sm
                  transition-colors duration-150
                  ${tile === 0 
                    ? 'bg-transparent cursor-default' 
                    : `bg-gradient-to-br from-sherlock-cream to-sherlock-cream/80 
                       text-sherlock-brown border border-sherlock-brown/20
                       hover:from-sherlock-gold/30 hover:to-sherlock-cream
                       active:scale-95 cursor-pointer
                       shadow-md hover:shadow-lg`
                  }
                  ${(isSolved || justSolved) && tile !== 0 ? 'bg-green-100 border-green-500' : ''}
                `}
              >
                {tile !== 0 && tile}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Already solved indicator */}
      {(isSolved || justSolved) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-700/20 text-green-400 px-4 py-2 rounded-full">
            <Check className="w-5 h-5" />
            <span className="font-victorian">Puzzle risolto!</span>
          </div>
        </motion.div>
      )}

      {/* Shuffle button - only show if not solved */}
      {!isSolved && !justSolved && (
        <div className="flex justify-center">
          <Button
            onClick={handleShuffle}
            variant="outline"
            className="border-sherlock-brown/30 text-sherlock-brown hover:bg-sherlock-cream font-victorian"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Mescola
          </Button>
        </div>
      )}
    </div>
  );
};

export default FifteenPuzzle;
