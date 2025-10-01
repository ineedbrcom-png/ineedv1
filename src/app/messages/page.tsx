
"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Conversation, Message } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox } from "lucide-react";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MessagesPage() {
  const { user, isLoggedIn, isAuthLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!user) return;

    setIsLoadingConversations(true);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(convos);
      setIsLoadingConversations(false);
      if (!activeConversation && convos.length > 0) {
        setActiveConversation(convos[0]);
      }
    });

    return () => unsubscribe();
  }, [user, activeConversation]);

  useEffect(() => {
    if (!activeConversation) {
        setMessages([]);
        return;
    };

    setIsLoadingMessages(true);
    const messagesCol = collection(
      db,
      "conversations",
      activeConversation.id,
      "messages"
    );
    const q = query(messagesCol, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, conversationId: activeConversation.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [activeConversation]);


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
          conversations={conversations}
          activeConversationId={activeConversation?.id || ''}
          onConversationSelect={setActiveConversation}
          isLoading={isLoadingConversations}
        />
        {isLoadingConversations ? (
          <div className="w-full lg:w-2/3 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : activeConversation ? (
          <ChatWindow
            key={activeConversation.id}
            conversation={activeConversation}
            messages={messages}
            isLoading={isLoadingMessages}
          />
        ) : (
          <div className="w-full lg:w-2/3 flex flex-col items-center justify-center text-center p-8">
            <Inbox className="h-16 w-16 text-gray-300 mb-4" />
            <CardTitle className="text-xl">Você não tem mensagens</CardTitle>
            <CardDescription className="mt-2">
              Quando você iniciar uma conversa, ela aparecerá aqui.
            </CardDescription>
          </div>
        )}
      </Card>
    </div>
  );
}
