import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { Card } from "@/components/ui/card";
import { conversations, messages } from "@/lib/data";

export default function MessagesPage() {
  const activeConversation = conversations[0];
  const activeMessages = messages;

  return (
    <div className="container mx-auto py-6">
      <Card className="flex flex-col lg:flex-row shadow-md overflow-hidden bg-white h-[calc(100vh-140px)]">
        <ConversationList conversations={conversations} activeConversationId={activeConversation.id}/>
        <ChatWindow conversation={activeConversation} messages={activeMessages} />
      </Card>
    </div>
  );
}
