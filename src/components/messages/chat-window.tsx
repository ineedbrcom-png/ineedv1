import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findImage } from "@/lib/placeholder-images";
import { type Conversation, type Message } from "@/lib/data";
import { MessageInput } from "./message-input";
import { MessageBubble } from "./message-bubble";
import Link from "next/link";


interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
}

export function ChatWindow({ conversation, messages }: ChatWindowProps) {
  const userAvatar = findImage(conversation.userAvatarId);

  return (
    <div className="w-full lg:w-2/3 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        {userAvatar && (
            <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={userAvatar.imageUrl} alt={conversation.userName} />
                <AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback>
            </Avatar>
        )}
        <div>
          <div className="flex items-center">
            <h3 className="font-bold">{conversation.userName}</h3>
            <Link href="/profile" className="ml-2 text-sm text-blue-600 hover:underline">(ver perfil)</Link>
          </div>
          <p className="text-sm text-gray-600">
            Esta conversa é sobre o pedido: <Link href="#" className="text-blue-600 hover:underline">{conversation.listingTitle.replace('Re: ', '')}</Link>
          </p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} userAvatarUrl={userAvatar?.imageUrl} />
        ))}
      </div>
      <MessageInput />
    </div>
  );
}
