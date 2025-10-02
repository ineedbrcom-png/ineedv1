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
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const formSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  cpf: z.string().length(14, "O CPF deve ter o formato 000.000.000-00."),
  phone: z.string().min(14, "O telefone deve ter o formato (00) 00000-0000.").optional(),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
  confirmPassword: z.string(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  terms: z.boolean().refine(val => val === true, "Você deve aceitar os termos de uso."),
  recaptcha: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
}).refine(data => {
    if (recaptchaSiteKey) {
        return !!data.recaptcha;
    }
    return true;
}, {
  message: "Por favor, complete o reCAPTCHA.",
  path: ["recaptcha"],
}).superRefine((data, ctx) => {
    if (data.cep && data.cep.length > 0) {
        if (!data.street) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A rua é obrigatória.", path: ["street"] });
        if (!data.number) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O número é obrigatório.", path: ["number"] });
        if (!data.neighborhood) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O bairro é obrigatório.", path: ["neighborhood"] });
        if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A cidade é obrigatória.", path: ["city"] });
        if (!data.state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O estado é obrigatório.", path: ["state"] });
    }
});


type FormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      cpf: "",
      phone: "",
      password: "",
      confirmPassword: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      terms: false,
      recaptcha: "",
    },
  });

  const handleCepBlur = async (cep: string) => {
    if (cep.length !== 9) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
      const data = await response.json();
      if (!data.erro) {
        form.setValue("street", data.logradouro, { shouldValidate: true });
        form.setValue("neighborhood", data.bairro, { shouldValidate: true });
        form.setValue("city", data.localidade, { shouldValidate: true });
        form.setValue("state", data.uf, { shouldValidate: true });
        form.setFocus("number");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  function formatCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  }

  function formatPhone(phone: string) {
      phone = phone.replace(/\D/g, '');
      if (phone.length > 10) {
          phone = phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else {
          phone = phone.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return phone;
  }

  function formatCEP(cep: string) {
    cep = cep.replace(/\D/g, '');
    cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
    return cep;
  }


  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const displayName = `${values.firstName} ${values.lastName}`;

      await updateProfile(user, {
        displayName: displayName,
      });

      const userDoc = {
        uid: user.uid,
        displayName: displayName,
        email: values.email,
        phone: values.phone || '',
        cpf: values.cpf,
        address: {
          cep: values.cep || '',
          street: values.street || '',
          number: values.number || '',
          neighborhood: values.neighborhood || '',
          city: values.city || '',
          state: values.state || '',
        },
        createdAt: serverTimestamp(),
        rating: 0,
        reviewCount: 0,
        isPhoneVerified: false,
        isDocumentVerified: false,
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso.",
      });
      onSwitchToLogin();
    } catch (error: any) {
      console.error("Registration failed:", error);
      let description = "Ocorreu um erro ao tentar se cadastrar.";
      if(error.code === 'auth/email-already-in-use') {
        description = "Este e-mail já está em uso por outra conta.";
      }
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description,
      });
    } finally {
      setIsLoading(false);
      recaptchaRef.current?.reset();
    }
  }
  
  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field}
                      onChange={(e) => field.onChange(formatCPF(e.target.value))}
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Crie uma senha" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirme sua senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00000-000" 
                      {...field}
                      onChange={(e) => field.onChange(formatCEP(e.target.value))}
                      onBlur={(e) => handleCepBlur(e.target.value)}
                      maxLength={9}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
               <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua rua, avenida..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="UF" {...field} maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-0 pt-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                     Concordo com os <Link href="#" className="text-blue-600 hover:underline">Termos de Serviço</Link> e a <Link href="#" className="text-blue-600 hover:underline">Política de Privacidade</Link>.
                  </FormLabel>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {recaptchaSiteKey && (
            <FormField
              control={form.control}
              name="recaptcha"
              render={({ field }) => (
                <FormItem>
                   <FormControl>
                      <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={recaptchaSiteKey}
                          onChange={field.onChange}
                      />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}


          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                {!isLoading && "Criar conta"}
            </Button>
          </div>
        </form>
      </Form>
      <div className="text-center text-gray-600 text-sm">
        Já tem uma conta?{" "}
        <Button
          variant="link"
          type="button"
          onClick={onSwitchToLogin}
          className="p-0 h-auto"
        >
          Faça login
        </Button>
      </div>
    </div>
  );
}

    