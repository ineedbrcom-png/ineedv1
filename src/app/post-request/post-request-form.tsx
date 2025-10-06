
"use client";

import { useState, useRef } from "react";
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
import { allCategories } from "@/lib/categories";
import { refineListingDescription } from "@/ai/flows/listing-description-refinement";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Upload, X } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

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
  images: z.array(z.instanceof(File)).max(4, "You can upload a maximum of 4 images.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PostRequestForm() {
  const [isRefining, setIsRefining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      images: [],
    },
  });
  
  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        form.setValue("location", place.formatted_address, { shouldValidate: true });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const currentFiles = form.getValues('images') || [];
      const combinedFiles = [...currentFiles, ...newFiles].slice(0, 4);

      form.setValue('images', combinedFiles, { shouldValidate: true });

      const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const currentFiles = form.getValues('images') || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue('images', updatedFiles, { shouldValidate: true });

    const updatedPreviews = updatedFiles.map(file => URL.createObjectURL(file));
    setPreviews(updatedPreviews);
  };

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
        description: "Your description has been improved by AI.",
      });
    } catch (error) {
      console.error("Failed to refine description:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not refine the description. The AI may be temporarily unavailable.",
      });
    } finally {
      setIsRefining(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be logged in to post a request.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const { db, storage } = getFirebaseClient();
      let imageUrls: string[] = [];

      // 1. Image Upload
      if (values.images && values.images.length > 0) {
        const uploadPromises = values.images.map(async (image) => {
          const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        });
        imageUrls = await Promise.all(uploadPromises);
      }
      
      // 2. Create Document with 'pending' status
      const docData = {
        title: values.title,
        categoryId: values.categoryId,
        description: values.description,
        budget: values.budget,
        location: values.location,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        imageUrls: imageUrls,
        status: 'pending' as const,
      };

      const docRef = await addDoc(collection(db, "listings"), docData);

      toast({
        title: "Request Submitted for Review!",
        description: "Your request has been received and will be reviewed shortly. You will be notified when it is published.",
      });

      router.push(`/`); // Redirect to the home page after submission.

    } catch (error: any) {
      console.error("Error publishing request: ", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.code === 'permission-denied') {
        errorMessage = "You do not have permission to publish a request. Please check your project's security rules.";
      } else if (error.code === 'unauthenticated') {
        errorMessage = "Your session has expired. Please log in again.";
      }

      toast({
        variant: "destructive",
        title: "Failed to Publish",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded) {
    return <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
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
                <Input placeholder="E.g., I need a modern logo" {...field} />
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
                  disabled={isRefining || isSubmitting}
                >
                  {isRefining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
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

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Photos (up to 4)</FormLabel>
              <FormControl>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 4MB per image)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} multiple accept="image/*" disabled={(form.getValues('images') || []).length >= 4} />
                    </label>
                </div> 
              </FormControl>
              <FormMessage />
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative aspect-video">
                      <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                    {allCategories.map((cat) => (
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
                  <Input type="number" placeholder="E.g., 500" {...field} />
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
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={handlePlaceChanged}
                  options={{
                    types: ["(regions)"],
                  }}
                >
                  <Input placeholder="E.g., Santa Maria, RS or 'Remote'" {...field} />
                </Autocomplete>
              </FormControl>
              <FormDescription>
                Enter your city and state, or specify "Remote".
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
            {isSubmitting ? "Publishing..." : "Publish Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
