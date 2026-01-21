import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpotTheDifferenceProps {
  onSolve: () => void;
  isSolved: boolean;
}

// Immagini caricate da URL
const originalImage = "https://i.imgur.com/OYnhj4D.jpeg";
const modifiedImage = "https://i.imgur.com/ljyszrr.jpeg";

// Differenze con nuove coordinate percentuali
const DIFFERENCES = [
  { id: 1, x: 70.41, y: 60.95, radius: 8 },
  { id: 2, x: 66.24, y: 78.26, radius: 8 },
  { id: 3, x: 15.28, y: 61.11, radius: 8 },
  { id: 4, x: 60.95, y: 22.01, radius: 8 },
  { id: 5, x: 62.07, y: 57.43, radius: 8 },
];

const TOTAL = DIFFERENCES.length;

const SpotTheDifference = ({ onSolve, isSolved }: SpotTheDifferenceProps) => {
  const [found, setFound] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (found.length === TOTAL && !isSolved) {
      onSolve();
    }
  }, [found, isSolved, onSolve]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSolved) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setAttempts((a) => a + 1);

    // Trova se il click ha centrato una differenza
    const hit = DIFFERENCES.find((d) => !found.includes(d.id) && Math.hypot(x - d.x, y - d.y) <= d.radius);

    // Log dei click e debug
    if (hit) {
      setFound((prev) => [...prev, hit.id]);
      console.log(`Click su: x=${x.toFixed(2)}%, y=${y.toFixed(2)}%`);
      console.log(`✅ Differenza trovata! ID=${hit.id}`);
    } else {
      console.log(`Click su: x=${x.toFixed(2)}%, y=${y.toFixed(2)}%`);
      console.log(`❌ Nessuna differenza centrata`);
      DIFFERENCES.forEach((d) => {
        const distance = Math.hypot(x - d.x, y - d.y);
        console.log(`Distanza da ID=${d.id}: ${distance.toFixed(2)}%`);
      });
    }
  };

  const reset = () => {
    setFound([]);
    setAttempts(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-victorian text-sherlock-brown text-sm">
        Differenze trovate: {found.length}/{TOTAL}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[700px]">
        {[originalImage, modifiedImage].map((img, i) => (
          <div
            key={i}
            className="relative cursor-crosshair border-2 border-sherlock-brown/30 rounded-lg overflow-hidden"
            onClick={handleClick}
          >
            <img src={img} className="w-full h-auto" />

            {/* Cerchi verdi sulle differenze trovate */}
            {found.map((id) => {
              const d = DIFFERENCES.find((x) => x.id === id);
              if (!d) return null;
              return (
                <motion.div
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute w-6 h-6 border-2 border-green-500 rounded-full bg-green-500/20"
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Check className="w-4 h-4 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-xs text-sherlock-brown/60">Tentativi: {attempts}</p>

      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        Ricomincia
      </Button>
    </div>
  );
};

export default SpotTheDifference;
