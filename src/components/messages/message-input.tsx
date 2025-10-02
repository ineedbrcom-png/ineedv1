
 "use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, FileSignature, Handshake, X, Share2, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { ContractModal } from "./contract-modal";
import { ProposalModal } from "./proposal-modal";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDocs, query, where, orderBy, limit, getDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Proposal, Conversation } from "@/lib/data";

interface MessageInputProps {
    conversation: Conversation;
}

export function MessageInput({ conversation }: MessageInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [acceptedProposal, setAcceptedProposal] = useState<Proposal | null>(null);
  const [canCreateContract, setCanCreateContract] = useState(false);
  const [isSharingContact, setIsSharingContact] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);


  // Determine if the current user is the author of the listing
  const isListingAuthor = user?.uid === conversation.listingAuthorId;
  
  useEffect(() => {
    // This effect runs when the conversation object changes
    setCanCreateContract(conversation.contractAccepted === false && !!acceptedProposal);
  }, [conversation.contractAccepted, acceptedProposal]);


  useEffect(() => {
    const conversationId = conversation.id;
    
    const checkAcceptedProposals = async () => {
        const { db } = getFirebaseClient();
        const messagesRef = collection(db, "conversations", conversationId, "messages");
        const q = query(
            messagesRef, 
            where('type', '==', 'proposal'), 
            where('proposalDetails.status', '==', 'accepted'),
            orderBy('timestamp', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setAcceptedProposal(doc.data().proposalDetails as Proposal);

            // Check if a contract already exists for this conversation
            const contractQuery = query(collection(db, "conversations", conversationId, "messages"), where('type', '==', 'contract'));
            const contractSnapshot = await getDocs(contractQuery);
            if(contractSnapshot.empty) {
                setCanCreateContract(true);
            } else {
                setCanCreateContract(false);
            }
        } else {
             setAcceptedProposal(null);
             setCanCreateContract(false);
        }
    }
    checkAcceptedProposals();
  }, [conversation.id]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeAttachment = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !file) return;
    if (!user) {
        toast({ variant: "destructive", title: "Você não está logado." });
        return;
    }

    setIsSending(true);
    try {
        const { db } = getFirebaseClient();
        const messagesCol = collection(db, "conversations", conversation.id, "messages");
        await addDoc(messagesCol, {
            content: message,
            sender: user.uid,
            timestamp: serverTimestamp(),
            type: 'user',
            read: false,
            // image upload logic would go here
        });

        const conversationRef = doc(db, "conversations", conversation.id);
        await updateDoc(conversationRef, {
            lastMessage: message,
            lastMessageTimestamp: serverTimestamp(),
        });

        setMessage("");
        removeAttachment();

    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: "destructive", title: "Erro ao enviar mensagem." });
    } finally {
        setIsSending(false);
    }
  };
  
  const handleShareContactInfo = async () => {
    if (!user) return;
    setIsSharingContact(true);
    try {
        const { db } = getFirebaseClient();
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
            throw new Error("User profile not found");
        }
        
        const userData = userDocSnap.data();
        const address = userData.address;
        const fullAddress = `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.cep}`;

        const messagesCol = collection(db, "conversations", conversation.id, "messages");
        await addDoc(messagesCol, {
            content: `${user.displayName} compartilhou suas informações de contato.`,
            sender: user.uid,
            timestamp: serverTimestamp(),
            type: 'contact_details',
            contactDetails: {
                name: userData.displayName,
                phone: userData.phone,
                address: fullAddress,
                location: conversation.listingTitle, // Using listing title as placeholder for location context
            }
        });
        
        const conversationRef = doc(db, "conversations", conversation.id);
        await updateDoc(conversationRef, {
            lastMessage: "Informações de contato compartilhadas.",
            lastMessageTimestamp: serverTimestamp(),
        });

        toast({ title: "Dados compartilhados!", description: "Suas informações de contato foram enviadas na conversa."});

    } catch (error) {
        console.error("Error sharing contact info:", error);
        toast({ variant: "destructive", title: "Erro ao compartilhar dados", description: "Não foi possível enviar suas informações." });
    } finally {
        setIsSharingContact(false);
    }
  }

  const handleMarkAsCompleted = async () => {
    if (!user) return;
    setIsCompleting(true);
    try {
        const { db } = getFirebaseClient();
        const conversationRef = doc(db, "conversations", conversation.id);
        await updateDoc(conversationRef, {
            status: "completed",
            lastMessage: "O pedido foi marcado como concluído.",
            lastMessageTimestamp: serverTimestamp(),
        });

        const messagesCol = collection(db, "conversations", conversation.id, "messages");
        await addDoc(messagesCol, {
            content: "Pedido marcado como concluído. Agora vocês podem deixar uma avaliação.",
            sender: user.uid,
            timestamp: serverTimestamp(),
            type: 'review_prompt',
        });
        
        toast({ title: "Pedido Concluído!", description: "O pedido foi marcado como concluído. Não se esqueça de avaliar o prestador."});
    } catch(error) {
        console.error("Error marking as complete:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível marcar o pedido como concluído." });
    } finally {
        setIsCompleting(false);
    }
  }

  return (
    <>
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-2">
          {preview && (
            <div className="relative w-24 h-24">
              <Image src={preview} alt="Preview" layout="fill" objectFit="cover" className="rounded-md" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeAttachment}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" disabled={isSending}>
              <label htmlFor="file-upload">
                <Paperclip />
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange}/>
              </label>
            </Button>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-full py-2 px-4 resize-none max-h-32"
              rows={1}
              disabled={isSending}
            />
            <Button type="submit" size="icon" className="rounded-full" disabled={isSending}>
              <Send />
            </Button>
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Button type="button" variant="link" className="text-primary p-0 h-auto" onClick={() => setIsProposalModalOpen(true)}>
                    <Handshake className="mr-1 h-4 w-4" /> Enviar Proposta
                </Button>
                <Button 
                    type="button" 
                    variant="link" 
                    className="text-primary p-0 h-auto" 
                    onClick={() => setIsContractModalOpen(true)}
                    disabled={!canCreateContract}
                    title={!canCreateContract ? "Um contrato só pode ser criado após uma proposta ser aceita." : "Criar Contrato com base na proposta aceita"}
                >
                    <FileSignature className="mr-1 h-4 w-4" /> Criar Contrato
                </Button>
                 {isListingAuthor && conversation.contractAccepted && (
                     <Button 
                        type="button" 
                        variant="link" 
                        className="text-green-600 p-0 h-auto font-bold" 
                        onClick={handleShareContactInfo}
                        disabled={isSharingContact}
                    >
                        {isSharingContact ? <Loader2 className="animate-spin mr-1" /> : <Share2 className="mr-1 h-4 w-4" />}
                        {isSharingContact ? "Compartilhando..." : "Compartilhar Dados de Contato"}
                    </Button>
                 )}
                 {isListingAuthor && conversation.contractAccepted && conversation.status === 'open' && (
                     <Button 
                        type="button" 
                        variant="link" 
                        className="text-blue-600 p-0 h-auto font-bold" 
                        onClick={handleMarkAsCompleted}
                        disabled={isCompleting}
                    >
                        {isCompleting ? <Loader2 className="animate-spin mr-1" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                        {isCompleting ? "Finalizando..." : "Marcar como Concluído"}
                    </Button>
                 )}
            </div>
            <span className="text-xs text-gray-500">{message.length}/500</span>
          </div>
        </form>
      </div>
      <ContractModal 
        isOpen={isContractModalOpen} 
        onOpenChange={setIsContractModalOpen} 
        conversationId={conversation.id} 
        acceptedProposal={acceptedProposal}
        onContractSent={() => setCanCreateContract(false)}
      />
      <ProposalModal isOpen={isProposalModalOpen} onOpenChange={setIsProposalModalOpen} conversationId={conversation.id} />
    </>
  );
}
