import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findImage } from "@/lib/placeholder-images";
import { type Conversation } from "@/lib/data";
import { Inbox, Search } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
}

export function ConversationList({ conversations, activeConversationId }: ConversationListProps) {
  return (
    <div className="w-full lg:w-1/3 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold flex items-center">
          <Inbox className="mr-2 h-5 w-5" /> Mensagens
        </h2>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Input type="text" placeholder="Buscar conversas..." className="pl-10"/>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {conversations.map((convo) => {
          const userAvatar = findImage(convo.userAvatarId);
          return (
            <Link
              href="#"
              key={convo.id}
              className={cn(
                "block p-4 border-b border-gray-200 hover:bg-gray-50 flex items-start relative",
                convo.id === activeConversationId && "bg-blue-50 hover:bg-blue-50"
              )}
            >
              {userAvatar && (
                 <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={userAvatar.imageUrl} alt={convo.userName} />
                    <AvatarFallback>{convo.userName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium truncate">{convo.userName}</p>
                  <span className="text-xs text-gray-500">{convo.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{convo.listingTitle}</p>
                <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
              </div>
              {convo.unread && <div className="w-2 h-2 rounded-full bg-blue-600 absolute right-4 top-1/2 -translate-y-1/2"></div>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
