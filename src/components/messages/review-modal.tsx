
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, runTransaction, serverTimestamp, arrayUnion } from "firebase/firestore";
import { type Conversation } from "@/lib/data";

const reviewSchema = z.object({
  rating: z.number().min(1, "A avaliação é obrigatória.").max(5),
  comment: z.string().min(10, "O comentário deve ter pelo menos 10 caracteres.").max(500, "O comentário não pode exceder 500 caracteres."),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
}

export function ReviewModal({ isOpen, onOpenChange, conversation }: ReviewModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const otherParticipant = conversation.participantsDetails.find(p => p.id !== user?.uid);

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user || !otherParticipant) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível enviar a avaliação." });
      return;
    }
    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        const reviewedUserRef = doc(db, "users", otherParticipant.id);
        const conversationRef = doc(db, "conversations", conversation.id);
        const reviewCollectionRef = collection(db, "reviews");

        const reviewedUserDoc = await transaction.get(reviewedUserRef);

        if (!reviewedUserDoc.exists()) {
          throw new Error("Usuário a ser avaliado não encontrado.");
        }

        // Create new review
        const newReviewRef = doc(reviewCollectionRef);
        transaction.set(newReviewRef, {
            ...data,
            fromUserId: user.uid,
            toUserId: otherParticipant.id,
            conversationId: conversation.id,
            createdAt: serverTimestamp()
        });

        // Update user's rating
        const oldRating = reviewedUserDoc.data().rating || 0;
        const oldReviewCount = reviewedUserDoc.data().reviewCount || 0;
        const newReviewCount = oldReviewCount + 1;
        const newRating = (oldRating * oldReviewCount + data.rating) / newReviewCount;
        
        transaction.update(reviewedUserRef, {
            rating: newRating,
            reviewCount: newReviewCount
        });

        // Mark user as having reviewed in the conversation
        transaction.update(conversationRef, {
            reviewedBy: arrayUnion(user.uid)
        });
      });

      toast({ title: "Avaliação Enviada!", description: "Obrigado pelo seu feedback." });
      onOpenChange(false);
      form.reset();

    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ variant: "destructive", title: "Erro ao enviar avaliação." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRating = form.watch("rating");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar {otherParticipant?.name}</DialogTitle>
          <DialogDescription>
            Sua avaliação ajuda a construir uma comunidade mais segura.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota</FormLabel>
                  <FormControl>
                    <div
                      className="flex items-center gap-1"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`cursor-pointer h-8 w-8 ${
                            (hoverRating || currentRating) >= star
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva sua experiência..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
