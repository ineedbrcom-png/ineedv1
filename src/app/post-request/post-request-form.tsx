"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/data";
import { refineListingDescription } from "@/ai/flows/listing-description-refinement";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long."),
  categoryId: z.string({ required_error: "Please select a category." }),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters long."),
  budget: z.coerce
    .number()
    .positive("Budget must be a positive number.")
    .min(1, "Budget must be at least $1."),
  location: z.string().min(2, "Location is required."),
});

type FormValues = z.infer<typeof formSchema>;

export function PostRequestForm() {
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
    },
  });

  async function handleRefineDescription() {
    const description = form.getValues("description");
    if (!description || description.length < 20) {
      toast({
        variant: "destructive",
        title: "Description too short",
        description: "Please enter at least 20 characters to refine with AI.",
      });
      return;
    }

    setIsRefining(true);
    try {
      const result = await refineListingDescription({ description });
      form.setValue("description", result.refinedDescription, {
        shouldValidate: true,
      });
      toast({
        title: "Description Refined!",
        description: "Your description has been enhanced by AI.",
      });
    } catch (error) {
      console.error("Failed to refine description:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not refine the description at this time.",
      });
    } finally {
      setIsRefining(false);
    }
  }

  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Request Submitted!",
      description: "Your request has been posted successfully.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., I need a modern logo design" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Description</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefineDescription}
                  disabled={isRefining}
                >
                  {isRefining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4 text-accent" />
                  )}
                  Refine with AI
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe what you need in detail..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Brooklyn, NY or 'Remote'" {...field} />
              </FormControl>
              <FormDescription>
                Enter your city and state, or specify "Remote".
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Post Request
          </Button>
        </div>
      </form>
    </Form>
  );
}
