
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2, FileText, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { type Proposal, type Contract } from "@/lib/data";

const contractSchema = z.object({
    terms: z.string().min(50, "Os termos do contrato devem ter pelo menos 50 caracteres."),
});

type ContractFormValues = z.infer<typeof contractSchema>;


interface ContractModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
  acceptedProposal?: Proposal | null;
  onContractSent?: () => void;
  contractDetails?: Contract;
  isSigner?: boolean;
}

export function ContractModal({ 
    isOpen, 
    onOpenChange, 
    conversationId,
    acceptedProposal,
    onContractSent,
    contractDetails,
    isSigner,
}: ContractModalProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
    });

    const finalContractDetails = acceptedProposal || contractDetails;

    useEffect(() => {
        if(acceptedProposal) {
            const terms = `Este contrato formaliza o acordo para a prestação de serviço/produto com base na proposta aceita.\n\nValor: R$ ${acceptedProposal.value.toFixed(2)}\nPrazo: ${acceptedProposal.deadline}\nCondições: ${acceptedProposal.conditions}\n\nAmbas as partes concordam em cumprir os termos aqui estabelecidos.`;
            form.setValue('terms', terms);
        } else if (contractDetails) {
            form.setValue('terms', contractDetails.terms);
        }
    }, [acceptedProposal, contractDetails, form]);


    const onSubmit = async (data: ContractFormValues) => {
        if (!user || !conversationId) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível enviar o contrato. Tente novamente."});
            return;
        }
        if (!acceptedProposal) {
            toast({ variant: "destructive", title: "Nenhuma proposta aceita", description: "Um contrato só pode ser gerado com base em uma proposta aceita."});
            return;
        }

        setIsSubmitting(true);
        try {
            const { db } = getFirebaseClient();
            const messagesCol = collection(db, "conversations", conversationId, "messages");
            await addDoc(messagesCol, {
                content: `Contrato gerado com base na proposta.`,
                sender: user.uid,
                timestamp: serverTimestamp(),
                type: 'contract',
                contractDetails: {
                    value: acceptedProposal.value,
                    terms: data.terms,
                    status: 'pending'
                }
            });

            const conversationRef = doc(db, "conversations", conversationId);
             await updateDoc(conversationRef, {
                 lastMessage: "Um contrato foi gerado para revisão.",
                 lastMessageTimestamp: serverTimestamp(),
             });
            
            toast({ title: "Contrato Enviado!", description: "O contrato foi enviado na conversa para revisão e aceite."});
            if(onContractSent) onContractSent();
            onOpenChange(false);
            form.reset();

        } catch (error) {
             console.error("Error sending contract:", error);
             toast({ variant: "destructive", title: "Erro ao enviar contrato." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePrint = () => {
      const printContent = document.getElementById("contractPrintContent")?.innerHTML;
      if (printContent) {
        const originalContent = document.body.innerHTML;
        const title = "Contrato de Serviço - iNeed";
        document.body.innerHTML = `<html><head><title>${title}</title></head><body>${printContent}</body></html>`;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); 
      }
    };


    // If we are just viewing details of an existing contract
    if (contractDetails) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><FileText /> Detalhes do Contrato</DialogTitle>
                         <DialogDescription>
                            Revise os termos do contrato abaixo. Se você é o destinatário, pode aceitar ou recusar na janela de chat.
                         </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 py-4" id="contractPrintContent">
                        <h3 className="font-bold">CONTRATO DE SERVIÇO/PRODUTO</h3>
                        <div>
                            <strong>Valor:</strong>
                            <p>R$ {finalContractDetails?.value.toFixed(2)}</p>
                        </div>
                        <div>
                            <strong>Termos e Condições:</strong>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">{contractDetails.terms}</p>
                        </div>

                        <div className="border-t pt-4 mt-4 text-xs text-muted-foreground">
                            <p className="font-semibold">Validade Jurídica e Assinatura Digital:</p>
                            <p>Este documento, uma vez aceito por ambas as partes na plataforma iNeed, constitui um acordo vinculativo.</p>
                            <p>Opcionalmente, para maior formalidade, as partes podem baixar este contrato e utilizar uma assinatura digital qualificada, como a oferecida gratuitamente pelo portal GOV.BR, que possui validade jurídica nos termos da Lei nº 14.063/2020.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText /> Gerar Contrato</DialogTitle>
          <DialogDescription>
            Revise e envie o contrato com base na proposta aceita. Este contrato será enviado na conversa para aceite da outra parte.
          </DialogDescription>
        </DialogHeader>
        {acceptedProposal ? (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-sm">
                        <p className="flex items-center gap-2 font-semibold"><CheckCircle /> Proposta aceita!</p>
                        <p>Valor: R$ {acceptedProposal.value.toFixed(2)}</p>
                        <p>Prazo: {acceptedProposal.deadline}</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Termos do Contrato</FormLabel>
                                <FormControl>
                                    <Textarea className="min-h-48" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="border-t pt-4 text-xs text-muted-foreground">
                        <p className="font-semibold">Validade Jurídica e Assinatura Digital:</p>
                        <p>Este documento, uma vez aceito por ambas as partes na plataforma iNeed, constitui um acordo vinculativo.</p>
                        <p>Opcionalmente, para maior formalidade, as partes podem baixar este contrato e utilizar uma assinatura digital qualificada, como a oferecida gratuitamente pelo portal GOV.BR, que possui validade jurídica nos termos da Lei nº 14.063/2020.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                            {isSubmitting ? "Enviando..." : "Enviar Contrato para Aceite"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        ) : (
             <div className="py-8 text-center text-muted-foreground">
                <p>Nenhuma proposta foi aceita nesta conversa ainda.</p>
                <p>Para gerar um contrato, uma proposta deve ser enviada e aceita primeiro.</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
