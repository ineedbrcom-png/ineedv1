"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseClient } from "@/lib/firebase";
import { doc, runTransaction, serverTimestamp, arrayUnion, collection } from "firebase/firestore";
import { type Conversation } from "@/lib/data";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(500, "Comment cannot exceed 500 characters."),
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

  const handleReportUser = () => {
    console.log(`--- User Report ---
    Reported User ID: ${otherParticipant?.id}
    Reported User Name: ${otherParticipant?.name}
    Reporter User ID: ${user?.uid}
    Conversation ID: ${conversation.id}
    Listing ID: ${conversation.listingId}
    --- End Report ---
    Simulating email to ineed@ineedbr.com`);

    toast({
      title: "Complaint Sent",
      description: "Your complaint has been registered and will be reviewed by our team.",
    });
  }


  const onSubmit = async (data: ReviewFormValues) => {
    if (!user || !otherParticipant) {
      toast({ variant: "destructive", title: "Error", description: "Could not submit the review." });
      return;
    }
    setIsSubmitting(true);
    try {
      const { db } = getFirebaseClient();
      await runTransaction(db, async (transaction) => {
        const reviewedUserRef = doc(db, "users", otherParticipant.id);
        const conversationRef = doc(db, "conversations", conversation.id);
        const reviewCollectionRef = collection(db, "reviews");

        const reviewedUserDoc = await transaction.get(reviewedUserRef);

        if (!reviewedUserDoc.exists()) {
          throw new Error("User to be reviewed not found.");
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

      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      onOpenChange(false);
      form.reset();

    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ variant: "destructive", title: "Error submitting review." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRating = form.watch("rating");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {otherParticipant?.name}</DialogTitle>
          <DialogDescription>
            Your review helps build a safer and more reliable community.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
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
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your experience..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="justify-between items-center sm:justify-between sm:items-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="link" size="sm" className="p-0 text-xs text-muted-foreground h-auto hover:text-destructive">
                        <AlertTriangle className="h-4 w-4 mr-1"/> Report a problem
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>File a Complaint</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to file this complaint? The user and conversation data will be sent to our moderation team.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReportUser} className="bg-destructive hover:bg-destructive/90">Yes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
