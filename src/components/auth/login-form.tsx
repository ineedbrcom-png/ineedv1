
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SocialLogins } from "./social-logins";
import { Separator } from "@/components/ui/separator";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login bem-sucedido!",
        description: "Que bom te ver de novo!",
      });
      onLoginSuccess();
    } catch (error: any) {
      console.error("Login failed:", error);
      let description = "Ocorreu um erro ao tentar fazer login.";
      if (error.code === 'auth/invalid-credential') {
        description = "E-mail ou senha inválidos. Por favor, tente novamente.";
      } else if (error.code === 'auth/configuration-not-found') {
        description = "O login por e-mail não está habilitado. Por favor, contate o suporte.";
      }
      toast({
        variant: "destructive",
        title: "Falha no login",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <SocialLogins />
      <div className="flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">ou</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="text-right text-sm">
            <Button variant="link" type="button" className="p-0 h-auto">
              Esqueceu sua senha?
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {!isLoading && "Entrar"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-gray-600 text-sm">
        Não tem uma conta?{" "}
        <Button
          variant="link"
          type="button"
          onClick={onSwitchToRegister}
          className="p-0 h-auto"
        >
          Cadastre-se
        </Button>
      </div>
    </div>
  );
}
