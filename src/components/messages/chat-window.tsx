
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Conversation, type Message } from "@/lib/types";
import { MessageInput } from "./message-input";
import { MessageBubble } from "./message-bubble";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ conversation, messages, isLoading }: ChatWindowProps) {
  const { user } = useAuth();
  const otherParticipant = conversation.participantsDetails.find(p => p.id !== user?.uid);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages])

  return (
    <div className="w-full lg:w-2/3 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        {otherParticipant && (
            <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={otherParticipant.photoURL} alt={otherParticipant?.name} />
                <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
        )}
        <div>
          <div className="flex items-center">
            <h3 className="font-bold">{otherParticipant?.name}</h3>
            <Link href={`/profile/${otherParticipant?.id}`} className="ml-2 text-sm text-blue-600 hover:underline">(view profile)</Link>
          </div>
          <p className="text-sm text-gray-600">
            Regarding the request: <Link href={`/listing/${conversation.listingId}`} className="text-blue-600 hover:underline">{conversation.listingTitle.replace('Re: ', '')}</Link>
          </p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {isLoading ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        ) : (
            messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} conversation={conversation} />
            ))
        )}
      </div>
      <MessageInput conversation={conversation} />
    </div>
  );
}
