import { motion } from "framer-motion";

const PlayerLoading = () => {
  return (
    <div className="sherlock-bg flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-16 h-16 border-4 border-sherlock-gold border-t-transparent rounded-full"
      />
    </div>
  );
};

export default PlayerLoading;
