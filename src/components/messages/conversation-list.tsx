
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Conversation } from "@/lib/types";
import { Inbox, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/hooks/use-auth";
import type { Timestamp } from "firebase/firestore";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (conversation: Conversation) => void;
  isLoading: boolean;
}

export function ConversationList({ conversations, activeConversationId, onConversationSelect, isLoading }: ConversationListProps) {
  const { user } = useAuth();
  
  const getTimestamp = (timestamp: Timestamp | any) => {
    if (!timestamp?.toDate) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ptBR });
  }

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
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
           <div className="text-center p-6 text-gray-500">
             <p>Nenhuma conversa encontrada.</p>
           </div>
        ) : (
          conversations.map((convo) => {
          const otherParticipant = convo.participantsDetails.find(p => p.id !== user?.uid);
          const isUnread = convo.unreadBy && convo.unreadBy.includes(user?.uid || '');
          return (
            <button
              key={convo.id}
              onClick={() => onConversationSelect(convo)}
              className={cn(
                "w-full text-left block p-4 border-b border-gray-200 hover:bg-gray-50 flex items-start relative",
                convo.id === activeConversationId && "bg-blue-50 hover:bg-blue-50"
              )}
            >
              {otherParticipant && (
                 <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={otherParticipant.photoURL} alt={otherParticipant?.name || ''} />
                    <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className={cn("font-medium truncate", isUnread && "font-bold")}>{otherParticipant?.name}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{getTimestamp(convo.lastMessageTimestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{convo.listingTitle}</p>
                <p className={cn("text-sm text-gray-500 truncate", isUnread && "text-gray-800 font-semibold")}>{convo.lastMessage}</p>
              </div>
              {isUnread && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute right-4 top-1/2 -translate-y-1/2"></div>}
            </button>
          );
        })
        )}
      </div>
    </div>
  );
}
