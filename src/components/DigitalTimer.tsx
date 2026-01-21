import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DigitalTimerProps {
  remainingSeconds: number;
  isActive: boolean;
}

const DigitalTimer = ({ remainingSeconds, isActive }: DigitalTimerProps) => {
  const [displayTime, setDisplayTime] = useState(remainingSeconds);

  useEffect(() => {
    setDisplayTime(remainingSeconds);
  }, [remainingSeconds]);

  const hours = Math.floor(displayTime / 3600);
  const minutes = Math.floor((displayTime % 3600) / 60);
  const seconds = displayTime % 60;

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const isLowTime = displayTime < 600; // Less than 10 minutes
  const isCritical = displayTime < 60; // Less than 1 minute

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 blur-3xl opacity-30 transition-colors duration-500 ${
          isCritical
            ? "bg-destructive"
            : isLowTime
            ? "bg-yellow-500"
            : "bg-primary"
        }`}
      />

      {/* Timer container */}
      <div className="relative neon-border rounded-2xl p-8 md:p-12 bg-card/50 backdrop-blur-sm">
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <motion.div
            animate={{
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? 1 : 0.5,
            }}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`w-3 h-3 rounded-full ${
              isActive ? "bg-primary box-glow" : "bg-muted"
            }`}
          />
          <span className="font-display text-sm tracking-widest text-muted-foreground uppercase">
            {isActive ? "Sessione Attiva" : "In Pausa"}
          </span>
        </div>

        {/* Timer digits */}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <TimerDigit value={formatNumber(hours)} label="ORE" isActive={isActive} isCritical={isCritical} isLowTime={isLowTime} />
          <Separator isActive={isActive} />
          <TimerDigit value={formatNumber(minutes)} label="MIN" isActive={isActive} isCritical={isCritical} isLowTime={isLowTime} />
          <Separator isActive={isActive} />
          <TimerDigit value={formatNumber(seconds)} label="SEC" isActive={isActive} isCritical={isCritical} isLowTime={isLowTime} />
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-colors duration-500 ${
                isCritical
                  ? "bg-destructive"
                  : isLowTime
                  ? "bg-yellow-500"
                  : "bg-primary"
              }`}
              style={{
                width: `${(displayTime / (5 * 60 * 60)) * 100}%`,
              }}
              animate={isActive ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2 font-display tracking-wider">
            {Math.round((displayTime / (5 * 60 * 60)) * 100)}% RIMANENTE
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TimerDigit = ({
  value,
  label,
  isActive,
  isCritical,
  isLowTime,
}: {
  value: string;
  label: string;
  isActive: boolean;
  isCritical: boolean;
  isLowTime: boolean;
}) => (
  <div className="text-center">
    <motion.div
      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold transition-colors duration-500 ${
        isCritical
          ? "text-destructive"
          : isLowTime
          ? "text-yellow-500"
          : "text-primary"
      } ${isActive ? "text-glow animate-flicker" : ""}`}
    >
      {value}
    </motion.div>
    <span className="text-xs md:text-sm text-muted-foreground font-display tracking-widest">
      {label}
    </span>
  </div>
);

const Separator = ({ isActive }: { isActive: boolean }) => (
  <motion.span
    animate={isActive ? { opacity: [1, 0.3, 1] } : { opacity: 0.5 }}
    transition={{ repeat: Infinity, duration: 1 }}
    className="font-display text-4xl md:text-6xl lg:text-7xl text-primary self-start mt-2"
  >
    :
  </motion.span>
);

export default DigitalTimer;
