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
import { getFirebaseClient } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
  cpf: z.string().refine((cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf), "CPF must be in the format 000.000.000-00."),
  phone: z.string().optional().refine(phone => !phone || phone.length === 0 || /^\(\d{2}\) \d{5}-\d{4}$/.test(phone), "Phone must be in the format (00) 00000-0000."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms of use."),
  recaptcha: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).refine(data => {
    if (recaptchaSiteKey) {
        return !!data.recaptcha && data.recaptcha.length > 0;
    }
    return true;
}, {
  message: "Please complete the reCAPTCHA.",
  path: ["recaptcha"],
}).superRefine((data, ctx) => {
    if (data.cep && data.cep.length > 0) {
        if (!data.street) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street is required.", path: ["street"] });
        if (!data.number) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Number is required.", path: ["number"] });
        if (!data.neighborhood) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Neighborhood is required.", path: ["neighborhood"] });
        if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required.", path: ["city"] });
        if (!data.state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "State is required.", path: ["state"] });
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
    if (cep?.length !== 9) return; // CEP has format 00000-000
    const formattedCep = cep.replace('-', '');
    if (formattedCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${formattedCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        form.setValue("street", data.logradouro, { shouldValidate: true });
        form.setValue("neighborhood", data.bairro, { shouldValidate: true });
        form.setValue("city", data.localidade, { shouldValidate: true });
        form.setValue("state", data.uf, { shouldValidate: true });
        form.setFocus("number");
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
    }
  };

  const formatCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  };

  const formatPhone = (phone: string) => {
      phone = phone.replace(/\D/g, '');
      if (phone.length > 10) {
          phone = phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else {
          phone = phone.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return phone;
  };

  const formatCEP = (cep: string) => {
    cep = cep.replace(/\D/g, '');
    cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
    return cep;
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const { auth, db } = getFirebaseClient();
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
        skills: [],
        about: ""
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully.",
      });
      onSwitchToLogin();
    } catch (error: any) {
      console.error("Registration failed:", error);
      let description = "An error occurred while trying to register.";
      if(error.code === 'auth/email-already-in-use') {
        description = "This email is already in use by another account.";
      }
      if (error.code === 'auth/firebase-app-check-token-is-invalid') {
        description = "App Check verification failed. Please reload the page and try again."
      }
      toast({
        variant: "destructive",
        title: "Registration failed",
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
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your first name" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your last name" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
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
                  <FormLabel>Phone (optional)</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Minimum of 8 characters.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
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
                  <FormLabel>CEP (optional)</FormLabel>
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
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="Your street, avenue..." {...field} />
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
                    <FormLabel>Number</FormLabel>
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
                    <FormLabel>Neighborhood</FormLabel>
                    <FormControl>
                      <Input placeholder="Your neighborhood" {...field} />
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
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Your city" {...field} />
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
                    <FormLabel>State</FormLabel>
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
                     I agree to the <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
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
                {!isLoading && "Create account"}
            </Button>
          </div>
        </form>
      </Form>
      <div className="text-center text-gray-600 text-sm">
        Already have an account?{" "}
        <Button
          variant="link"
          type="button"
          onClick={onSwitchToLogin}
          className="p-0 h-auto"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
