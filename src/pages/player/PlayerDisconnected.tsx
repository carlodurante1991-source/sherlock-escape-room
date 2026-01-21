import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerDisconnectedProps {
  onReconnect: () => void;
}

const PlayerDisconnected = ({ onReconnect }: PlayerDisconnectedProps) => {
  return (
    <div className="sherlock-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-24 h-24 mx-auto wax-seal rounded-full flex items-center justify-center opacity-50">
          <WifiOff className="w-12 h-12 text-sherlock-cream" />
        </div>
        <h1 className="font-sherlock text-3xl font-bold text-sherlock-gold">
          Disconnesso
        </h1>
        <p className="font-victorian text-sherlock-cream/70 text-lg italic">
          La sessione è terminata o sei stato disconnesso
        </p>
        <Button
          onClick={onReconnect}
          className="font-sherlock bg-sherlock-brown hover:bg-sherlock-brown/80 text-sherlock-cream"
        >
          Riconnetti
        </Button>
      </motion.div>
    </div>
  );
};

export default PlayerDisconnected;
