
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
import { Sparkles, Loader2 } from "lucide-react";

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

  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Pedido Enviado!",
      description: "Seu pedido foi publicado com sucesso.",
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
                  disabled={isRefining}
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
          <Button type="submit" size="lg">
            Publicar Pedido
          </Button>
        </div>
      </form>
    </Form>
  );
}
