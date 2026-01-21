import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, Shield } from "lucide-react";

interface LoginPanelProps {
  onLogin: (password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const LoginPanel = ({ onLogin, isLoading, error }: LoginPanelProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onLogin(password);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary blur-2xl opacity-50" />
          <div className="relative w-24 h-24 rounded-2xl neon-border bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-12 h-12 text-primary animate-pulse-glow" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow mb-2">
          GAME CONTROL
        </h1>
        <p className="text-muted-foreground text-sm">
          Inserisci la password per accedere alla sessione
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="neon-border rounded-xl p-6 bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Inserisci password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="neon"
                className="pl-12"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="neon"
          size="lg"
          className="w-full"
          disabled={isLoading || !password.trim()}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : (
            <>
              <Lock className="w-5 h-5" />
              ACCEDI
            </>
          )}
        </Button>
      </motion.form>

      {/* Footer info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        La sessione principale dura 5 ore. Timer persistente.
      </motion.p>
    </motion.div>
  );
};

export default LoginPanel;
