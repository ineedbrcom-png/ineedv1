
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { onAuthStateChanged, User, getAuth, Auth } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // getFirebaseClient will initialize the app if it's not already
    const { auth } = getFirebaseClient();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
