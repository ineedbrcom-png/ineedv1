import { type Message } from "@/lib/data";
import { cn } from "@/lib/utils";
import { findImage } from "@/lib/placeholder-images";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: Message;
  userAvatarUrl?: string;
}

export function MessageBubble({ message, userAvatarUrl }: MessageBubbleProps) {
  const isMe = message.sender === 'me';
  
  if (message.type === 'system') {
    return (
      <div className="text-center my-4 text-sm text-gray-500 italic">
        <p>{message.content}</p>
      </div>
    );
  }

  if (message.type === 'proposal' && message.proposalDetails) {
    return (
      <div className="text-center my-4">
        <div className="inline-block bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
          <h4 className="font-bold mb-2">Proposta Formal</h4>
          <p className="mb-1"><span className="font-semibold">Valor:</span> R$ {message.proposalDetails.value.toFixed(2)}</p>
          <p className="mb-1"><span className="font-semibold">Prazo:</span> {message.proposalDetails.deadline}</p>
          <p className="mb-3"><span className="font-semibold">Condições:</span> {message.proposalDetails.conditions}</p>
          {message.proposalDetails.status === 'pending' && (
            <div className="flex justify-center gap-4">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Check className="mr-1 h-4 w-4" /> Aceitar
              </Button>
              <Button size="sm" variant="destructive">
                <X className="mr-1 h-4 w-4" /> Recusar
              </Button>
            </div>
          )}
          {message.proposalDetails.status === 'accepted' && <p className="font-medium text-green-600">Proposta aceita!</p>}
          {message.proposalDetails.status === 'rejected' && <p className="font-medium text-red-600">Proposta recusada.</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-start gap-3", isMe && "justify-end")}>
      {!isMe && (
        <Avatar className="w-8 h-8">
            <AvatarImage src={userAvatarUrl} />
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-xs lg:max-w-md", isMe && "text-right")}>
        <div
          className={cn(
            "px-4 py-2 rounded-lg inline-block",
            isMe
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted rounded-bl-none"
          )}
        >
          <p>{message.content}</p>
          {message.images && message.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {message.images.map(imageId => {
                const img = findImage(imageId);
                return img ? <Image key={imageId} src={img.imageUrl} alt={img.description} width={100} height={100} className="rounded-md" /> : null
              })}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{message.timestamp} {isMe && '✓✓'}</p>
      </div>
    </div>
  );
}
