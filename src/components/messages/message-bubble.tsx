
"use client";

import { type Message, type Conversation } from "@/lib/data";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, FileText, User, Phone, Home, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { format } from 'date-fns';
import { getFirebaseClient } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { ContractModal } from "./contract-modal";
import { ReviewModal } from "./review-modal";

interface MessageBubbleProps {
  message: Message;
  conversation: Conversation;
}

export function MessageBubble({ message, conversation }: MessageBubbleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [proposalStatus, setProposalStatus] = useState(message.proposalDetails?.status);
  const [contractStatus, setContractStatus] = useState(message.contractDetails?.status);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const isMe = message.sender === user?.uid;
  const otherParticipant = conversation.participantsDetails.find(p => p.id !== user?.uid);

  const hasUserReviewed = conversation.reviewedBy?.includes(user?.uid || '');
  const hasOtherUserReviewed = conversation.reviewedBy?.includes(otherParticipant?.id || '');

  useEffect(() => {
    setProposalStatus(message.proposalDetails?.status);
  }, [message.proposalDetails?.status])

  useEffect(() => {
    setContractStatus(message.contractDetails?.status);
  }, [message.contractDetails?.status])


  const handleUpdateProposal = async (newStatus: 'accepted' | 'rejected') => {
    if (!message.proposalDetails || !user) return;
    
    if (isMe) {
        toast({ variant: "destructive", title: "Ação não permitida", description: "Você não pode aceitar ou recusar sua própria proposta." });
        return;
    }

    setIsUpdating(true);
    try {
        const { db } = getFirebaseClient();
        const batch = writeBatch(db);
        const messageRef = doc(db, `conversations/${message.conversationId}/messages/${message.id}`);
        batch.update(messageRef, { 'proposalDetails.status': newStatus });
        
        if (newStatus === 'accepted') {
             const messagesRef = collection(db, `conversations/${message.conversationId}/messages`);
             const q = query(messagesRef, where('type', '==', 'proposal'), where('proposalDetails.status', '==', 'pending'));
             const otherProposalsSnapshot = await getDocs(q);
             otherProposalsSnapshot.forEach(docSnap => {
                 if (docSnap.id !== message.id) {
                     batch.update(docSnap.ref, { 'proposalDetails.status': 'rejected' });
                 }
             });
        }
        await batch.commit();

        setProposalStatus(newStatus);
        toast({ title: `Proposta ${newStatus === 'accepted' ? 'aceita' : 'recusada'}!`, description: `O status da proposta foi atualizado.`});
    } catch (error) {
        console.error("Error updating proposal:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status da proposta."})
    } finally {
        setIsUpdating(false);
    }
  }

  const handleUpdateContract = async (newStatus: 'accepted' | 'rejected') => {
    if (!message.contractDetails || !user) return;
    
    // The sender of the contract cannot accept it
    if (isMe) {
        toast({ variant: "destructive", title: "Ação não permitida", description: "Você não pode aceitar ou recusar um contrato que você enviou." });
        return;
    }

    setIsUpdating(true);
    try {
        const { db } = getFirebaseClient();
        const messageRef = doc(db, `conversations/${message.conversationId}/messages/${message.id}`);

        await updateDoc(messageRef, {
            'contractDetails.status': newStatus
        });

        // If accepted, update the conversation as well
        if (newStatus === 'accepted') {
            const conversationRef = doc(db, "conversations", message.conversationId);
            await updateDoc(conversationRef, {
                contractAccepted: true
            });
        }
        
        setContractStatus(newStatus);

        toast({ title: `Contrato ${newStatus === 'accepted' ? 'aceito' : 'recusado'}!`, description: `O status do contrato foi atualizado.`});
    } catch (error) {
        console.error("Error updating contract:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status do contrato."})
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

  if (message.type === 'review_prompt') {
    return (
      <>
        <div className="text-center my-4">
            <div className="inline-block bg-amber-50 rounded-lg p-4 text-center border border-amber-200 max-w-sm w-full">
                <h4 className="font-bold mb-2 flex items-center justify-center gap-2"><Star className="text-amber-500"/> Avaliação Pendente</h4>
                <p className="mb-4 text-sm">O trabalho foi concluído! Por favor, avalie sua experiência para ajudar a comunidade.</p>
                <div className="space-y-2">
                    {hasUserReviewed ? (
                        <p className="text-sm font-medium text-green-600">Você já avaliou {otherParticipant?.name}.</p>
                    ) : (
                        <Button onClick={() => setIsReviewModalOpen(true)}>Avaliar {otherParticipant?.name}</Button>
                    )}
                    
                    {hasOtherUserReviewed ? (
                         <p className="text-sm text-muted-foreground">{otherParticipant?.name} já te avaliou.</p>
                    ) : (
                         <p className="text-sm text-muted-foreground">Aguardando avaliação de {otherParticipant?.name}.</p>
                    )}
                </div>
            </div>
        </div>
        <ReviewModal
            isOpen={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            conversation={conversation}
        />
      </>
    );
  }
  
  if (message.type === 'contact_details' && message.contactDetails) {
    return (
      <div className="text-center my-4">
        <div className="inline-block bg-green-50 rounded-lg p-4 text-left border border-green-200 max-w-sm w-full">
          <h4 className="font-bold mb-3 text-center">Dados de Contato Compartilhados</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><User className="h-4 w-4 mr-2 text-green-700" /><strong>Nome:</strong><span className="ml-2">{message.contactDetails.name}</span></li>
            <li className="flex items-center"><Phone className="h-4 w-4 mr-2 text-green-700" /><strong>Telefone:</strong><span className="ml-2">{message.contactDetails.phone}</span></li>
            <li className="flex items-center"><Home className="h-4 w-4 mr-2 text-green-700" /><strong>Endereço:</strong><span className="ml-2">{message.contactDetails.address}</span></li>
            <li className="flex items-center"><User className="h-4 w-4 mr-2 text-green-700" /><strong>Local:</strong><span className="ml-2">{message.contactDetails.location}</span></li>
          </ul>
        </div>
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

   if (message.type === 'contract' && message.contractDetails) {
    return (
      <>
      <div className="text-center my-4">
        <div className="inline-block bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200 max-w-sm w-full">
          <h4 className="font-bold mb-2 flex items-center justify-center gap-2"><FileText /> Contrato Gerado</h4>
          <p className="mb-4 text-sm">{isMe ? "Você enviou um contrato." : "Você recebeu uma proposta de contrato."}</p>
          <Button onClick={() => setIsContractModalOpen(true)}>Ver Detalhes do Contrato</Button>
          <div className="mt-4">
            {contractStatus === 'pending' && !isMe && (
              <div className="flex justify-center gap-4">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateContract('accepted')} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Check className="mr-1 h-4 w-4" />} Aceitar Contrato
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleUpdateContract('rejected')} disabled={isUpdating}>
                  <X className="mr-1 h-4 w-4" /> Recusar Contrato
                </Button>
              </div>
            )}
            {contractStatus === 'pending' && isMe && (
                 <p className="font-medium text-yellow-600 text-sm mt-2">Aguardando resposta da outra parte...</p>
            )}
            {contractStatus === 'accepted' && <p className="font-medium text-green-600 mt-2">Contrato aceito por ambas as partes!</p>}
            {contractStatus === 'rejected' && <p className="font-medium text-red-600 mt-2">Contrato recusado.</p>}
          </div>
        </div>
      </div>
      <ContractModal 
        isOpen={isContractModalOpen} 
        onOpenChange={setIsContractModalOpen} 
        contractDetails={message.contractDetails}
        isSigner={!isMe}
      />
      </>
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
      {!isMe && otherParticipant && (
        <Avatar className="w-8 h-8">
            <AvatarImage src={otherParticipant.photoURL} />
            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
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
          {message.imageUrls && message.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {message.imageUrls.map((url, index) => (
                <Image key={index} src={url} alt={`attachment ${index + 1}`} width={100} height={100} className="rounded-md object-cover" />
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{getTimestamp()} {isMe && '✓✓'}</p>
      </div>
    </div>
  );
}
