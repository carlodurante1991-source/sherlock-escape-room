// Pezzi del puzzle - le lettere formano "TEMPO SCADO"
export const PUZZLE_LETTERS = [
  { position: 1, emoji: "⏰", letter: "N" },
  { position: 2, emoji: "🎭", letter: "O" },
  { position: 3, emoji: "🎵", letter: "A" },
  { position: 4, emoji: "📜", letter: "B" },
  { position: 5, emoji: "🔮", letter: "L" },
  { position: 6, emoji: "⚡", letter: "N" },
  { position: 7, emoji: "🗝️", letter: "A" },
  { position: 8, emoji: "💀", letter: "E" },
  { position: 9, emoji: "🕯️", letter: "L" },
  { position: 10, emoji: "⌛", letter: "D" },
];

// Ordine mescolato fisso: ogni enigma (1-10) dà un pezzo diverso
// Enigma 1 → pezzo in posizione 6 (S), Enigma 2 → pezzo in posizione 3 (M), etc.
export const ENIGMA_TO_PIECE_MAP: Record<number, number> = {
  1: 6, // N
  2: 3, // O
  3: 9, // A
  4: 1, // B
  5: 8, // L
  6: 5, // N
  7: 2, // A
  8: 10, // E
  9: 4, // L
  10: 7, // D
};

// Ottieni il pezzo assegnato a un enigma
export const getPieceForEnigma = (enigmaNumber: number) => {
  const piecePosition = ENIGMA_TO_PIECE_MAP[enigmaNumber];
  return PUZZLE_LETTERS.find((p) => p.position === piecePosition);
};

// Ottieni tutti i pezzi raccolti dagli enigmi risolti
export const getCollectedPieces = (solvedEnigmas: number[]) => {
  return solvedEnigmas
    .map((enigma) => {
      const piece = getPieceForEnigma(enigma);
      return piece ? { ...piece, enigmaNumber: enigma } : null;
    })
    .filter(Boolean);
};

// Risposta corretta del rebus
export const REBUS_ANSWER = "belladonna";

export const checkRebusAnswer = (answer: string): boolean => {
  const normalized = answer.toLowerCase().trim().replace(/\s+/g, '');
  return normalized === "belladonna";
};

// Verifica se l'ordine dei pezzi è corretto
export const checkPiecesOrder = (orderedPositions: number[]): boolean => {
  const requiredPieces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const uniquePieces = new Set(orderedPositions);

  return requiredPieces.every((piece) => uniquePieces.has(piece));
};
