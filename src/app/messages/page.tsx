
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
import { collection, query, where, getDocs, onSnapshot, orderBy, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { allCategories } from "@/lib/categories";

export default function MessagesPage() {
  const { user, isLoggedIn, isAuthLoading } = useAuth();
  const searchParams = useSearchParams();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const targetListingId = searchParams.get('listingId');
  const targetUserId = searchParams.get('userId');

  useEffect(() => {
    const createOrFindConversation = async () => {
      if (!user || !targetListingId || !targetUserId) return;

      const listingRef = doc(db, "listings", targetListingId);
      const listingSnap = await getDoc(listingRef);

      if (!listingSnap.exists()) return;
      
      const listingData = listingSnap.data();

      // Check if a conversation already exists
      const q = query(
        collection(db, "conversations"),
        where("listingId", "==", targetListingId),
        where("participants", "array-contains", user.uid)
      );

      const querySnapshot = await getDocs(q);
      let existingConversation = null;

      querySnapshot.forEach(doc => {
          const conversation = doc.data() as Conversation;
          if(conversation.participants.includes(targetUserId)) {
              existingConversation = { id: doc.id, ...conversation };
          }
      });

      if (existingConversation) {
        setActiveConversation(existingConversation);
      } else {
        // Create a new conversation
        const participants = [user.uid, targetUserId];
        const user1Doc = await getDoc(doc(db, "users", participants[0]));
        const user2Doc = await getDoc(doc(db, "users", participants[1]));

        if (!user1Doc.exists() || !user2Doc.exists()) return;

        const newConversationData = {
          participants: participants,
          participantsDetails: [
             { id: user1Doc.id, name: user1Doc.data()?.displayName, avatarId: 'avatar-1' },
             { id: user2Doc.id, name: user2Doc.data()?.displayName, avatarId: 'avatar-2' },
          ],
          listingId: targetListingId,
          listingAuthorId: listingData.authorId,
          listingTitle: `Re: ${listingData.title}`,
          lastMessage: "Nova conversa iniciada!",
          lastMessageTimestamp: serverTimestamp(),
          unreadBy: [targetUserId],
          contractAccepted: false,
        };

        const docRef = await addDoc(collection(db, "conversations"), newConversationData);
        setActiveConversation({ id: docRef.id, ...newConversationData } as Conversation);
      }
    };

    if(targetListingId && targetUserId && user) {
        createOrFindConversation();
    }
  }, [targetListingId, targetUserId, user]);


  useEffect(() => {
    if (!user) {
        if (!isAuthLoading) setIsLoadingConversations(false);
        return;
    };

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
      // If there's no active conversation and it's not being set by query params
      if (!activeConversation && convos.length > 0 && !targetListingId) {
        setActiveConversation(convos[0]);
      }
    });

    return () => unsubscribe();
  }, [user, isAuthLoading, activeConversation, targetListingId]);

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
