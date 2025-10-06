"use client";

import { type Message, type Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, FileText, User, Phone, Home, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { format } from 'date-fns';
import { getFirebaseClient } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs, query, where, writeBatch, Timestamp } from "firebase/firestore";
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
        toast({ variant: "destructive", title: "Action not allowed", description: "You cannot accept or reject your own proposal." });
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
        toast({ title: `Proposal ${newStatus === 'accepted' ? 'accepted' : 'rejected'}!`, description: `The proposal status has been updated.`});
    } catch (error) {
        console.error("Error updating proposal:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update the proposal status."})
    } finally {
        setIsUpdating(false);
    }
  }

  const handleUpdateContract = async (newStatus: 'accepted' | 'rejected') => {
    if (!message.contractDetails || !user) return;
    
    if (isMe) {
        toast({ variant: "destructive", title: "Action not allowed", description: "You cannot accept or reject a contract that you sent." });
        return;
    }

    setIsUpdating(true);
    try {
        const { db } = getFirebaseClient();
        const messageRef = doc(db, `conversations/${message.conversationId}/messages/${message.id}`);

        await updateDoc(messageRef, {
            'contractDetails.status': newStatus
        });

        if (newStatus === 'accepted') {
            const conversationRef = doc(db, "conversations", message.conversationId);
            await updateDoc(conversationRef, {
                contractAccepted: true
            });
        }
        
        setContractStatus(newStatus);

        toast({ title: `Contract ${newStatus === 'accepted' ? 'accepted' : 'rejected'}!`, description: `The contract status has been updated.`});
    } catch (error) {
        console.error("Error updating contract:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update the contract status."})
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
                <h4 className="font-bold mb-2 flex items-center justify-center gap-2"><Star className="text-amber-500"/> Pending Review</h4>
                <p className="mb-4 text-sm">The job has been completed! Please rate your experience to help the community.</p>
                <div className="space-y-2">
                    {hasUserReviewed ? (
                        <p className="text-sm font-medium text-green-600">You have already reviewed {otherParticipant?.name}.</p>
                    ) : (
                        <Button onClick={() => setIsReviewModalOpen(true)}>Review {otherParticipant?.name}</Button>
                    )}
                    
                    {hasOtherUserReviewed ? (
                         <p className="text-sm text-muted-foreground">{otherParticipant?.name} has already reviewed you.</p>
                    ) : (
                         <p className="text-sm text-muted-foreground">Waiting for review from {otherParticipant?.name}.</p>
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
          <h4 className="font-bold mb-3 text-center">Contact Details Shared</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><User className="h-4 w-4 mr-2 text-green-700" /><strong>Name:</strong><span className="ml-2">{message.contactDetails.name}</span></li>
            <li className="flex items-center"><Phone className="h-4 w-4 mr-2 text-green-700" /><strong>Phone:</strong><span className="ml-2">{message.contactDetails.phone}</span></li>
            <li className="flex items-center"><Home className="h-4 w-4 mr-2 text-green-700" /><strong>Address:</strong><span className="ml-2">{message.contactDetails.address}</span></li>
          </ul>
        </div>
      </div>
    );
  }

  if (message.type === 'proposal' && message.proposalDetails) {
    return (
      <div className="text-center my-4">
        <div className="inline-block bg-blue-50 rounded-lg p-4 text-center border border-blue-100 max-w-sm w-full">
          <h4 className="font-bold mb-2">Formal Proposal</h4>
          <div className="text-left space-y-1">
            <p><span className="font-semibold">Value:</span> $ {message.proposalDetails.value.toFixed(2)}</p>
            <p><span className="font-semibold">Deadline:</span> {message.proposalDetails.deadline}</p>
            <p><span className="font-semibold">Conditions:</span> {message.proposalDetails.conditions}</p>
          </div>
          <div className="mt-4">
            {proposalStatus === 'pending' && !isMe && (
              <div className="flex justify-center gap-4">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateProposal('accepted')} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Check className="mr-1 h-4 w-4" />} Accept
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleUpdateProposal('rejected')} disabled={isUpdating}>
                  <X className="mr-1 h-4 w-4" /> Decline
                </Button>
              </div>
            )}
            {proposalStatus === 'pending' && isMe && (
                 <p className="font-medium text-yellow-600 text-sm">Waiting for customer response...</p>
            )}
            {proposalStatus === 'accepted' && <p className="font-medium text-green-600">Proposal accepted!</p>}
            {proposalStatus === 'rejected' && <p className="font-medium text-red-600">Proposal rejected.</p>}
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
          <h4 className="font-bold mb-2 flex items-center justify-center gap-2"><FileText /> Contract Generated</h4>
          <p className="mb-4 text-sm">{isMe ? "You sent a contract." : "You received a contract proposal."}</p>
          <Button onClick={() => setIsContractModalOpen(true)}>View Contract Details</Button>
          <div className="mt-4">
            {contractStatus === 'pending' && !isMe && (
              <div className="flex justify-center gap-4">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateContract('accepted')} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Check className="mr-1 h-4 w-4" />} Accept Contract
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleUpdateContract('rejected')} disabled={isUpdating}>
                  <X className="mr-1 h-4 w-4" /> Decline Contract
                </Button>
              </div>
            )}
            {contractStatus === 'pending' && isMe && (
                 <p className="font-medium text-yellow-600 text-sm mt-2">Waiting for the other party's response...</p>
            )}
            {contractStatus === 'accepted' && <p className="font-medium text-green-600 mt-2">Contract accepted by both parties!</p>}
            {contractStatus === 'rejected' && <p className="font-medium text-red-600 mt-2">Contract rejected.</p>}
          </div>
        </div>
      </div>
      <ContractModal 
        isOpen={isContractModalOpen} 
        onOpenChange={setIsContractModalOpen}
        conversation={conversation}
        contractDetails={message.contractDetails}
        isSigner={!isMe}
      />
      </>
    );
  }
  
  const getTimestamp = () => {
      const ts = message.timestamp as unknown as Timestamp;
      if(ts?.toDate) {
          return format(ts.toDate(), 'HH:mm');
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
