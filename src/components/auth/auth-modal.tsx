
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
  onLoginSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onOpenChange,
  initialMode = "login",
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const { setIsLoggedIn } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    if(onLoginSuccess) {
      onLoginSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            {mode === "login" ? "Entrar na sua conta" : "Criar nova conta"}
          </DialogTitle>
        </DialogHeader>
        {mode === "login" ? (
          <LoginForm
            onSwitchToRegister={() => setMode("register")}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode("login")} />
        )}
      </DialogContent>
    </Dialog>
  );
}
