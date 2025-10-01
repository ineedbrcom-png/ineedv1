
import { type Message } from "@/lib/data";
import { cn } from "@/lib/utils";
import { findImage } from "@/lib/placeholder-images";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { format } from 'date-fns';
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";

interface MessageBubbleProps {
  message: Message;
  userAvatarUrl?: string;
}

export function MessageBubble({ message, userAvatarUrl }: MessageBubbleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [proposalStatus, setProposalStatus] = useState(message.proposalDetails?.status);

  const isMe = message.sender === user?.uid;

  useEffect(() => {
    setProposalStatus(message.proposalDetails?.status);
  }, [message.proposalDetails?.status])

  const handleUpdateProposal = async (newStatus: 'accepted' | 'rejected') => {
    if (!message.proposalDetails || !user) return;
    
    // The client should not be able to accept their own proposal
    if (isMe) {
        toast({ variant: "destructive", title: "Ação não permitida", description: "Você não pode aceitar ou recusar sua própria proposta." });
        return;
    }

    setIsUpdating(true);
    try {
        const messageRef = doc(db, `conversations/${message.conversationId}/messages/${message.id}`);

        await updateDoc(messageRef, {
            'proposalDetails.status': newStatus
        });
        setProposalStatus(newStatus);
        
        // Also reject all other pending proposals in the conversation
        if (newStatus === 'accepted') {
             const messagesRef = collection(db, `conversations/${message.conversationId}/messages`);
             const q = query(messagesRef, where('type', '==', 'proposal'), where('proposalDetails.status', '==', 'pending'));
             const otherProposalsSnapshot = await getDocs(q);
             const batch = [];
             otherProposalsSnapshot.forEach(docSnap => {
                 if (docSnap.id !== message.id) {
                     batch.push(updateDoc(docSnap.ref, { 'proposalDetails.status': 'rejected' }));
                 }
             });
             await Promise.all(batch);
        }

        toast({ title: `Proposta ${newStatus === 'accepted' ? 'aceita' : 'recusada'}!`, description: `O status da proposta foi atualizado.`});
    } catch (error) {
        console.error("Error updating proposal:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status da proposta."})
    } finally {
        setIsUpdating(false);
    }
  }
  
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
        <div className="inline-block bg-blue-50 rounded-lg p-4 text-center border border-blue-100 max-w-sm w-full">
          <h4 className="font-bold mb-2">Proposta Formal</h4>
          <div className="text-left space-y-1">
            <p><span className="font-semibold">Valor:</span> R$ {message.proposalDetails.value.toFixed(2)}</p>
            <p><span className="font-semibold">Prazo:</span> {message.proposalDetails.deadline}</p>
            <p><span className="font-semibold">Condições:</span> {message.proposalDetails.conditions}</p>
          </div>
          <div className="mt-4">
            {proposalStatus === 'pending' && !isMe && (
              <div className="flex justify-center gap-4">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateProposal('accepted')} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Check className="mr-1 h-4 w-4" />} Aceitar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleUpdateProposal('rejected')} disabled={isUpdating}>
                  <X className="mr-1 h-4 w-4" /> Recusar
                </Button>
              </div>
            )}
            {proposalStatus === 'pending' && isMe && (
                 <p className="font-medium text-yellow-600 text-sm">Aguardando resposta do cliente...</p>
            )}
            {proposalStatus === 'accepted' && <p className="font-medium text-green-600">Proposta aceita!</p>}
            {proposalStatus === 'rejected' && <p className="font-medium text-red-600">Proposta recusada.</p>}
          </div>
        </div>
      </div>
    );
  }
  
  const getTimestamp = () => {
      if(message.timestamp?.toDate) {
          return format(message.timestamp.toDate(), 'HH:mm');
      }
      return '';
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
          <p className="text-left">{message.content}</p>
          {message.images && message.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {message.images.map(imageId => {
                const img = findImage(imageId);
                return img ? <Image key={imageId} src={img.imageUrl} alt={img.description} width={100} height={100} className="rounded-md" /> : null
              })}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{getTimestamp()} {isMe && '✓✓'}</p>
      </div>
    </div>
  );
}
