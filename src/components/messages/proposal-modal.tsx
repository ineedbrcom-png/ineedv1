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
import { type Conversation } from "@/lib/data";


const proposalSchema = z.object({
    value: z.coerce.number().positive("Value must be positive."),
    deadline: z.string().min(1, "Select a deadline."),
    conditions: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
}

export function ProposalModal({ isOpen, onOpenChange, conversation }: ProposalModalProps) {
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
            toast({ variant: "destructive", title: "You are not logged in."});
            return;
        }
        setIsSubmitting(true);
        try {
            const { db } = getFirebaseClient();
            const messagesCol = collection(db, "conversations", conversation.id, "messages");
            await addDoc(messagesCol, {
                content: `Proposal sent for $${data.value.toFixed(2)}`,
                sender: user.uid,
                timestamp: serverTimestamp(),
                type: 'proposal',
                proposalDetails: {
                    ...data,
                    conditions: data.conditions || "No special conditions",
                    status: 'pending'
                }
            });

             const conversationRef = doc(db, "conversations", conversation.id);
             const otherParticipantId = conversation.participants.find(p => p !== user.uid);

             if(otherParticipantId) {
                await updateDoc(conversationRef, {
                    lastMessage: "A new proposal has been sent.",
                    lastMessageTimestamp: serverTimestamp(),
                    unreadBy: [otherParticipantId]
                });
             }


            toast({ title: "Proposal Sent!", description: "Your proposal has been recorded in the conversation."});
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Error sending proposal:", error);
            toast({ variant: "destructive", title: "Error sending proposal." });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Formal Proposal</DialogTitle>
          <DialogDescription>
            The proposal will be sent in the conversation so that the other party can accept or decline it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Value ($)</Label>
                            <FormControl>
                                <Input type="number" placeholder="E.g., 2500.00" {...field} />
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
                             <Label>Delivery Time</Label>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the deadline" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="3 business days">Within 3 business days</SelectItem>
                                    <SelectItem value="1 week">1 week</SelectItem>
                                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                                    <SelectItem value="To be agreed">Other (to be agreed)</SelectItem>
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
                            <Label>Special Conditions (optional)</Label>
                            <FormControl>
                                <Textarea placeholder="Warranty, payment conditions, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                        {isSubmitting ? "Sending..." : "Send Proposal"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
