 "use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, FileSignature, Handshake, X } from "lucide-react";
import Image from "next/image";
import { ContractModal } from "./contract-modal";
import { ProposalModal } from "./proposal-modal";

export function MessageInput() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || file) {
      console.log("Sending message:", { message, file });
      setMessage("");
      removeAttachment();
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
            <Button asChild variant="ghost" size="icon">
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
            />
            <Button type="submit" size="icon" className="rounded-full">
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
