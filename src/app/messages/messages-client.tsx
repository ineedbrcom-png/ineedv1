
"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Conversation, Message, User } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox } from "lucide-react";
import { 
  collection, query, where, getDocs, onSnapshot, 
  orderBy, doc, getDoc, addDoc, serverTimestamp, 
  updateDoc, Firestore, arrayRemove
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
            { id: user1Data.uid, name: user1Data.displayName || "User", photoURL: user1Data.photoURL || "" },
            { id: user2Doc.id, name: user2Data?.displayName || "User", photoURL: user2Data?.photoURL || "" },
        ],
        listingId: targetListingId,
        listingAuthorId: listingData.authorId,
        listingTitle: `Re: ${listingData.title}`,
        lastMessage: "New conversation started!",
        lastMessageTimestamp: serverTimestamp(),
        unreadBy: [targetUserId],
        contractAccepted: false,
        status: 'open' as 'open' | 'completed',
        reviewedBy: [],
    };

    const docRef = await addDoc(collection(db, "conversations"), newConversationData);
    const newConversationSnap = await getDoc(docRef);

    return { id: newConversationSnap.id, ...newConversationSnap.data() } as Conversation;
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
    if (user && conversation.unreadBy.includes(user.uid)) {
        const { db } = getFirebaseClient();
        const conversationRef = doc(db, 'conversations', conversation.id);
        updateDoc(conversationRef, {
            unreadBy: arrayRemove(user.uid)
        });
    }
  }, [user]);

  useEffect(() => {
    if (user && targetListingId && targetUserId) {
        const { db } = getFirebaseClient();
        getOrCreateConversation(db, user, targetUserId, targetListingId).then(convo => {
            if (convo) {
                setActiveConversation(convo);
                 setConversations(prev => {
                    const exists = prev.some(c => c.id === convo.id);
                    return exists ? prev : [convo, ...prev];
                 });
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
        handleConversationSelect(convos[0]);
      }
    });

    return () => unsubscribe();
  }, [user, isAuthLoading, activeConversation?.id, targetListingId, handleConversationSelect]);

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
            <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
            <CardDescription className="mb-6">
              You need to be logged in to view your messages.
            </CardDescription>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Login or Sign Up
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
            <CardTitle className="text-xl">You have no messages</CardTitle>
            <CardDescription className="mt-2">
              When you start a conversation, it will appear here.
            </CardDescription>
          </div>
        )}
      </Card>
    </div>
  );
}
