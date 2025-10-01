
 "use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, FileSignature, Handshake, X } from "lucide-react";
import Image from "next/image";
import { ContractModal } from "./contract-modal";
import { ProposalModal } from "./proposal-modal";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
    conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

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
        const messagesCol = collection(db, "conversations", conversationId, "messages");
        await addDoc(messagesCol, {
            content: message,
            sender: user.uid,
            timestamp: serverTimestamp(),
            type: 'user',
            read: false,
            // image upload logic would go here
        });

        const conversationRef = doc(db, "conversations", conversationId);
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
            <div className="flex space-x-2">
                <Button type="button" variant="link" className="text-primary p-0 h-auto" onClick={() => setIsProposalModalOpen(true)}>
                    <Handshake className="mr-1 h-4 w-4" /> Enviar Proposta
                </Button>
                <Button type="button" variant="link" className="text-primary p-0 h-auto" onClick={() => setIsContractModalOpen(true)}>
                    <FileSignature className="mr-1 h-4 w-4" /> Criar Contrato
                </Button>
            </div>
            <span className="text-xs text-gray-500">{message.length}/500</span>
          </div>
        </form>
      </div>
      <ContractModal isOpen={isContractModalOpen} onOpenChange={setIsContractModalOpen} />
      <ProposalModal isOpen={isProposalModalOpen} onOpenChange={setIsProposalModalOpen} />
    </>
  );
}
