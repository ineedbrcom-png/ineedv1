
"use client";

import { useState }from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { conversations as mockConversations, messages as mockMessages, Conversation } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(mockConversations[0]);
  
  // In a real app, this would be fetched based on activeConversation.id
  const activeMessages = mockMessages;

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          conversations={mockConversations}
          activeConversationId={activeConversation?.id || ''}
          onConversationSelect={setActiveConversation}
        />
        {activeConversation ? (
           <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
          />
        ) : (
          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center text-center p-8">
            <CardTitle className="text-xl">Selecione uma conversa</CardTitle>
            <CardDescription className="mt-2">Escolha uma conversa da lista para ver as mensagens.</CardDescription>
          </div>
        )}
      </Card>
    </div>
  );
}
