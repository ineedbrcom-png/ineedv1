
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
import { type Proposal, type Contract, type Conversation } from "@/lib/types";

const contractSchema = z.object({
    terms: z.string().min(50, "The contract terms must be at least 50 characters."),
});

type ContractFormValues = z.infer<typeof contractSchema>;


interface ContractModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversation?: Conversation;
  acceptedProposal?: Proposal | null;
  onContractSent?: () => void;
  contractDetails?: Contract;
  isSigner?: boolean;
}

export function ContractModal({ 
    isOpen, 
    onOpenChange, 
    conversation,
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

    const finalContractValue = acceptedProposal?.value || contractDetails?.value;

    useEffect(() => {
        if(acceptedProposal) {
            const terms = `This contract formalizes the agreement for the provision of the service/product based on the accepted proposal.\n\nValue: $${acceptedProposal.value.toFixed(2)}\nDeadline: ${acceptedProposal.deadline}\nConditions: ${acceptedProposal.conditions}\n\nBoth parties agree to comply with the terms set forth herein.`;
            form.setValue('terms', terms);
        } else if (contractDetails) {
            form.setValue('terms', contractDetails.terms);
        }
    }, [acceptedProposal, contractDetails, form]);


    const onSubmit = async (data: ContractFormValues) => {
        if (!user || !conversation) {
            toast({ variant: "destructive", title: "Error", description: "Could not send the contract. Please try again."});
            return;
        }
        if (!acceptedProposal) {
            toast({ variant: "destructive", title: "No accepted proposal", description: "A contract can only be generated based on an accepted proposal."});
            return;
        }

        setIsSubmitting(true);
        try {
            const { db } = getFirebaseClient();
            const messagesCol = collection(db, "conversations", conversation.id, "messages");
            const otherParticipantId = conversation.participants.find(p => p !== user.uid);
            
            await addDoc(messagesCol, {
                content: `Contract generated based on the proposal.`,
                sender: user.uid,
                timestamp: serverTimestamp(),
                type: 'contract',
                readBy: [],
                contractDetails: {
                    value: acceptedProposal.value,
                    terms: data.terms,
                    status: 'pending'
                }
            });

            const conversationRef = doc(db, "conversations", conversation.id);
             if (otherParticipantId) {
                await updateDoc(conversationRef, {
                    lastMessage: "A contract has been generated for review.",
                    lastMessageTimestamp: serverTimestamp(),
                    unreadBy: [otherParticipantId]
                });
             }
            
            toast({ title: "Contract Sent!", description: "The contract has been sent in the conversation for review and acceptance."});
            if(onContractSent) onContractSent();
            onOpenChange(false);
            form.reset();

        } catch (error) {
             console.error("Error sending contract:", error);
             toast({ variant: "destructive", title: "Error sending contract." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePrint = () => {
      const printContent = document.getElementById("contractPrintContent")?.innerHTML;
      if (printContent) {
        const originalContent = document.body.innerHTML;
        const title = "Service Contract - iNeed";
        document.body.innerHTML = `<html><head><title>${title}</title></head><body>${printContent}</body></html>`;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); 
      }
    };


    if (contractDetails) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><FileText /> Contract Details</DialogTitle>
                         <DialogDescription>
                            Review the contract terms below. If you are the recipient, you can accept or decline it in the chat window.
                         </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 py-4" id="contractPrintContent">
                        <h3 className="font-bold">SERVICE/PRODUCT CONTRACT</h3>
                        {finalContractValue !== undefined && (
                            <div>
                                <strong>Value:</strong>
                                <p>$ {finalContractValue.toFixed(2)}</p>
                            </div>
                        )}
                        <div>
                            <strong>Terms and Conditions:</strong>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">{contractDetails.terms}</p>
                        </div>

                        <div className="border-t pt-4 mt-4 text-xs text-muted-foreground">
                            <p className="font-semibold">Legal Validity and Digital Signature:</p>
                            <p>This document, once accepted by both parties on the iNeed platform, constitutes a binding agreement.</p>
                            <p>Optionally, for greater formality, the parties may download this contract and use a qualified digital signature, such as that offered free of charge by the GOV.BR portal, which has legal validity under Law No. 14,063/2020.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText /> Generate Contract</DialogTitle>
          <DialogDescription>
            Review and send the contract based on the accepted proposal. This contract will be sent in the conversation for the other party's acceptance.
          </DialogDescription>
        </DialogHeader>
        {acceptedProposal ? (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-sm">
                        <p className="flex items-center gap-2 font-semibold"><CheckCircle /> Proposal accepted!</p>
                        <p>Value: $ {acceptedProposal.value.toFixed(2)}</p>
                        <p>Deadline: {acceptedProposal.deadline}</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contract Terms</FormLabel>
                                <FormControl>
                                    <Textarea className="min-h-48" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="border-t pt-4 text-xs text-muted-foreground">
                        <p className="font-semibold">Legal Validity and Digital Signature:</p>
                        <p>This document, once accepted by both parties on the iNeed platform, constitutes a binding agreement.</p>
                        <p>Optionally, for greater formality, the parties may download this contract and use a qualified digital signature, such as that offered free of charge by the GOV.BR portal, which has legal validity under Law No. 14,063/2020.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                            {isSubmitting ? "Sending..." : "Send Contract for Acceptance"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        ) : (
             <div className="py-8 text-center text-muted-foreground">
                <p>No proposal has been accepted in this conversation yet.</p>
                <p>To generate a contract, a proposal must first be sent and accepted.</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
