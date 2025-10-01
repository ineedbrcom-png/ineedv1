
"use client";

import { PostRequestForm } from "./post-request-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PostRequestPage() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Card className="w-full max-w-lg p-8">
            <CardTitle className="text-2xl mb-2">Acesso Negado</CardTitle>
            <CardDescription className="mb-6">
              Você precisa estar logado para criar um novo pedido.
            </CardDescription>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Fazer Login ou Cadastrar
            </Button>
          </Card>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          onLoginSuccess={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Criar um novo pedido</CardTitle>
          <CardDescription>
            Detalhe o que você precisa e deixe que o fornecedor certo encontre
            você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
