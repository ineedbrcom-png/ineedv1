
"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Conversation, Message, User } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox } from "lucide-react";
import { 
  collection, query, where, getDocs, onSnapshot, 
  orderBy, doc, getDoc, addDoc, serverTimestamp, 
  updateDoc, DocumentReference, Firestore
} from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";


async function getOrCreateConversation(db: Firestore, currentUser: User, targetUserId: string, targetListingId: string): Promise<Conversation | null> {
    const listingRef = doc(db, "listings", targetListingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
        console.error("Listing not found");
        return null;
    }
    const listingData = listingSnap.data();

    // Check if a conversation already exists
    const q = query(
        collection(db, "conversations"),
        where("listingId", "==", targetListingId),
        where("participants", "array-contains", currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    let existingConversation: Conversation | null = null;

    querySnapshot.forEach(doc => {
        const conversation = doc.data() as Omit<Conversation, 'id'>;
        if(conversation.participants.includes(targetUserId)) {
            existingConversation = { id: doc.id, ...conversation } as Conversation;
        }
    });

    if (existingConversation) {
        return existingConversation;
    }

    // Create a new conversation if none exists
    const participants = [currentUser.uid, targetUserId];
    const user2Doc = await getDoc(doc(db, "users", targetUserId));

    if (!user2Doc.exists()) {
        console.error("Target user not found");
        return null;
    }
    
    const user1Data = currentUser;
    const user2Data = user2Doc.data();

    const newConversationData = {
        participants: participants,
        participantsDetails: [
            { id: user1Data.uid, name: user1Data.displayName, photoURL: user1Data.photoURL || "" },
            { id: user2Doc.id, name: user2Data?.displayName, photoURL: user2Data?.photoURL || "" },
        ],
        listingId: targetListingId,
        listingAuthorId: listingData.authorId,
        listingTitle: `Re: ${listingData.title}`,
        lastMessage: "Nova conversa iniciada!",
        lastMessageTimestamp: serverTimestamp(),
        unreadBy: [targetUserId],
        contractAccepted: false,
        status: 'open' as 'open' | 'completed',
        reviewedBy: [],
    };

    const docRef = await addDoc(collection(db, "conversations"), newConversationData);
    return { id: docRef.id, ...newConversationData } as Conversation;
}


export function MessagesClient() {
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

  const handleConversationSelect = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    // Mark as read
    if (user && conversation.unreadBy.includes(user.uid)) {
        const { db } = getFirebaseClient();
        const conversationRef = doc(db, 'conversations', conversation.id);
        updateDoc(conversationRef, {
            unreadBy: conversation.unreadBy.filter(id => id !== user.uid)
        });
    }
  }, [user]);

  useEffect(() => {
    if (user && targetListingId && targetUserId) {
        const { db } = getFirebaseClient();
        getOrCreateConversation(db, user, targetUserId, targetListingId).then(convo => {
            if (convo) {
                setActiveConversation(convo);
            }
        });
    }
  }, [targetListingId, targetUserId, user]);


  useEffect(() => {
    if (!user) {
        if (!isAuthLoading) setIsLoadingConversations(false);
        return;
    };
    
    setIsLoadingConversations(true);
    const { db } = getFirebaseClient();
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

      if (activeConversation) {
        const updatedActiveConvo = convos.find(c => c.id === activeConversation.id);
        if (updatedActiveConvo) {
          setActiveConversation(updatedActiveConvo);
        }
      } else if (convos.length > 0 && !targetListingId) {
        // Set first conversation as active if none is selected and not coming from a listing
        handleConversationSelect(convos[0]);
      }
    });

    return () => unsubscribe();
  }, [user, isAuthLoading, activeConversation, targetListingId, handleConversationSelect]);

  useEffect(() => {
    if (!activeConversation) {
        setMessages([]);
        return;
    };

    setIsLoadingMessages(true);
    const { db } = getFirebaseClient();
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
          onConversationSelect={handleConversationSelect}
          isLoading={isLoadingConversations}
        />
        {isLoadingConversations && !activeConversation ? (
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
