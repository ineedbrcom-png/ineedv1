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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Login bem-sucedido!",
      description: "Que bom te ver de novo!",
    });
    onLoginSuccess();
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
          <Button type="submit" className="w-full">
            Entrar
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
