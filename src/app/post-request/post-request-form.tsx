
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
import { allCategories } from "@/lib/categories";
import { refineListingDescription } from "@/ai/flows/listing-description-refinement";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Upload, X } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

const formSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  categoryId: z.string({ required_error: "Por favor, selecione uma categoria." }),
  description: z
    .string()
    .min(50, "A descrição deve ter pelo menos 50 caracteres."),
  budget: z.coerce
    .number()
    .positive("O orçamento deve ser um número positivo.")
    .min(1, "O orçamento deve ser de pelo menos R$1."),
  location: z.string().min(2, "A localização é obrigatória."),
  images: z.array(z.instanceof(File)).max(4, "Você pode enviar no máximo 4 imagens.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PostRequestForm() {
  const [isRefining, setIsRefining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      images: [],
    },
  });

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
        title: "Descrição muito curta",
        description: "Por favor, insira pelo menos 20 caracteres para refinar com IA.",
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
        title: "Descrição Refinada!",
        description: "Sua descrição foi melhorada pela IA.",
      });
    } catch (error) {
      console.error("Failed to refine description:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível refinar a descrição neste momento.",
      });
    } finally {
      setIsRefining(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para publicar um pedido.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // NOTE: Firebase Storage upload logic would go here.
      // For now, we will use placeholder URLs.
      const imageUrls = [`https://picsum.photos/seed/${Math.random()}/800/400`];
      
      const docData = {
        title: values.title,
        categoryId: values.categoryId,
        description: values.description,
        budget: values.budget,
        location: values.location,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        imageUrls: imageUrls,
      };

      const docRef = await addDoc(collection(db, "listings"), docData);

      toast({
        title: "Pedido Enviado!",
        description: "Seu pedido foi publicado com sucesso.",
      });
      router.push(`/listing/${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
      toast({
        variant: "destructive",
        title: "Erro ao publicar",
        description: "Não foi possível salvar seu pedido. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Descrição</FormLabel>
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
                  Refinar com IA
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Descreva o que você precisa em detalhes..."
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
              <FormLabel>Fotos do Pedido (até 4)</FormLabel>
              <FormControl>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG ou GIF (MAX. 800x400px)</p>
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
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
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
                <FormLabel>Orçamento (R$)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 500" {...field} />
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
              <FormLabel>Localização</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Santa Maria, RS ou 'Remoto'" {...field} />
              </FormControl>
              <FormDescription>
                Digite sua cidade e estado, ou especifique "Remoto".
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
