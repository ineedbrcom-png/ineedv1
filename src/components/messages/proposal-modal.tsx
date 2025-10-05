"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { useState } from "react";
import { Loader2 } from "lucide-react";


const proposalSchema = z.object({
    value: z.coerce.number().positive("O valor deve ser positivo."),
    deadline: z.string().min(1, "Selecione um prazo."),
    conditions: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
}

export function ProposalModal({ isOpen, onOpenChange, conversationId }: ProposalModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            conditions: "",
        }
    });

    const onSubmit = async (data: ProposalFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Você não está logado."});
            return;
        }
        setIsSubmitting(true);
        try {
            const { db } = getFirebaseClient();
            const messagesCol = collection(db, "conversations", conversationId, "messages");
            await addDoc(messagesCol, {
                content: `Proposta enviada no valor de R$ ${data.value.toFixed(2)}`,
                sender: user.uid,
                timestamp: serverTimestamp(),
                type: 'proposal',
                proposalDetails: {
                    ...data,
                    conditions: data.conditions || "Sem condições especiais",
                    status: 'pending'
                }
            });

             const conversationRef = doc(db, "conversations", conversationId);
             await updateDoc(conversationRef, {
                 lastMessage: "Uma nova proposta foi enviada.",
                 lastMessageTimestamp: serverTimestamp(),
                 unreadBy: [conversation.participants.find(p => p !== user.uid)]
             });

            toast({ title: "Proposta Enviada!", description: "Sua proposta foi registrada na conversa."});
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Error sending proposal:", error);
            toast({ variant: "destructive", title: "Erro ao enviar proposta." });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Proposta Formal</DialogTitle>
          <DialogDescription>
            A proposta será enviada na conversa para que a outra parte possa aceitar ou recusar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Valor (R$)</Label>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 2500.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem>
                             <Label>Prazo de Entrega</Label>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o prazo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="3 dias úteis">Em até 3 dias úteis</SelectItem>
                                    <SelectItem value="1 semana">1 semana</SelectItem>
                                    <SelectItem value="2 semanas">2 semanas</SelectItem>
                                    <SelectItem value="A combinar">Outro (a combinar)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Condições Especiais (opcional)</Label>
                            <FormControl>
                                <Textarea placeholder="Garantia, condições de pagamento, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                        {isSubmitting ? "Enviando..." : "Enviar Proposta"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
