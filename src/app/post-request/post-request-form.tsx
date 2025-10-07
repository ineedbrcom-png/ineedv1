
"use client";

import { useState, useRef, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Upload, X } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Subcategory } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  categoryId: z.string({ required_error: "Por favor, selecione uma categoria." }),
  subcategoryId: z.string().optional(),
  description: z.string().min(50, "A descrição deve ter pelo menos 50 caracteres."),
  budget: z.coerce.number().positive("O orçamento deve ser um número positivo."),
  location: z.string().min(2, "A localização é obrigatória."),
  images: z.array(z.instanceof(File)).max(4).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PostRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      images: [],
    },
  });

  const categoryId = form.watch("categoryId");

  useEffect(() => {
    if (categoryId) {
      const selectedCategory = allCategories.find(c => c.id === categoryId);
      setSubcategories(selectedCategory?.subcategories || []);
      form.setValue("subcategoryId", undefined);
    } else {
      setSubcategories([]);
    }
  }, [categoryId, form]);

  // Lógica para lidar com imagens
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

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Erro de autenticação", description: "Você precisa estar logado." });
      return;
    }
    setIsSubmitting(true);
    
    const { db, storage } = getFirebaseClient();
    let imageUrls: string[] = [];
    
    try {
      if (values.images && values.images.length > 0) {
        const uploadPromises = values.images.map(async (image) => {
          const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const docData = {
        title: values.title,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId || null,
        description: values.description,
        budget: values.budget,
        location: values.location,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        imageUrls: imageUrls,
        status: 'pendente' as const,
      };

      await addDoc(collection(db, "listings"), docData);

      toast({ title: "Pedido Enviado para Análise!", description: "Seu pedido foi recebido e está sendo analisado." });
      router.push(`/`);

    } catch (e) {
      console.error("Error adding document: ", e);
      toast({ variant: "destructive", title: "Erro ao publicar", description: "Não foi possível salvar seu pedido." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... (Campos de Título, Descrição, etc.) */}
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Título do Pedido</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Preciso de um logo moderno" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="space-y-6"> {/* Agrupador para os seletores */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria principal" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {subcategories.length > 0 && (
            <FormField
              control={form.control}
              name="subcategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione a subcategoria" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        {/* ... (Restante do formulário) */}
         <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
            {isSubmitting ? "Publicando..." : "Publicar Pedido"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
