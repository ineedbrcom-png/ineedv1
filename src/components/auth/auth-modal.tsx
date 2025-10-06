
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const handleLoginSuccess = () => {
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
            {mode === "login" ? "Login to your account" : "Create a new account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' ? 'Welcome back! Please login to continue.' : 'Complete the fields to register.'}
          </DialogDescription>
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
