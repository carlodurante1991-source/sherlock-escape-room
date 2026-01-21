// Risposte corrette agli enigmi - SOLO PER IL GAME MASTER
export const ENIGMA_ANSWERS: Record<number, string> = {
  1: "Doran Hatty", // 7-8-5 = THE, 3-15-12-16-5-22-15-12-5 = COLPEVOLE
  2: "DIFFERENCES_COMPLETE", // Solved by finding all differences
  3: "maggiordomo 8 cuoco 7 domestica 9 ", // Il veleno può entrare anche in stanza chiusa
  4: "Tossina di vipera", // Se solo uno mente, il terzo dice la verità, quindi uno tra primo e secondo mente
  5: "JIGSAW_COMPLETE", // Solved by completing the jigsaw puzzle
  6: "MEMORY_COMPLETE", // Solved by completing the memory game
  7: "la rosa era avvelenata", // Il veleno era nel ghiaccio, uno ha bevuto prima che si sciogliesse
  8: "Le cascate di reichenbach", // I mancini tagliano da destra verso sinistra
  9: "PUZZLE_COMPLETE", // Solved by completing the fifteen puzzle
  10: "SAFE_COMPLETE", // Solved by opening the Victorian safe with code 1893
};

// Risposta enigma finale
export const FINAL_ENIGMA_ANSWER = "Dr Moriarty";

// Funzione per verificare la risposta (case insensitive, trim spaces)
export const checkAnswer = (enigmaNumber: number, answer: string): boolean => {
  const correctAnswer = ENIGMA_ANSWERS[enigmaNumber];
  if (!correctAnswer) return false;
  return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
};

export const checkFinalAnswer = (answer: string): boolean => {
  return answer.toLowerCase().trim() === FINAL_ENIGMA_ANSWER.toLowerCase().trim();
};
