
"use client";

import { useState }from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { conversations, messages } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const activeConversation = conversations[0];
  const activeMessages = messages;

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
             Você precisa estar logado para ver suas mensagens.
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
    <div className="container mx-auto py-6">
      <Card className="flex flex-col lg:flex-row shadow-md overflow-hidden bg-white h-[calc(100vh-140px)]">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation.id}
        />
        <ChatWindow
          conversation={activeConversation}
          messages={activeMessages}
        />
      </Card>
    </div>
  );
}
