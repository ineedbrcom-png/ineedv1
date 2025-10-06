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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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
      const { auth } = getFirebaseClient();
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login successful!",
        description: "Glad to see you again!",
      });
      onLoginSuccess();
    } catch (error: any) {
      console.error("Login failed:", error);
      let description = "An error occurred while trying to log in.";
      if (error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/configuration-not-found') {
        description = "Email login is not enabled. Please contact support.";
      }
      toast({
        variant: "destructive",
        title: "Login failed",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
        toast({variant: "destructive", title: "Email not provided", description: "Please enter your email to reset your password."});
        return;
    }
    setIsResettingPassword(true);
    try {
        const { auth } = getFirebaseClient();
        await sendPasswordResetEmail(auth, resetEmail);
        toast({title: "Reset email sent", description: "Check your inbox to create a new password."});
    } catch (error: any) {
        console.error("Password reset error:", error);
        toast({variant: "destructive", title: "Failed to send email", description: "Could not send the reset email. Please check the email provided."});
    } finally {
        setIsResettingPassword(false);
    }
}


  return (
    <div className="space-y-4">
      <SocialLogins />
      <div className="flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="text-right text-sm">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="link" type="button" className="p-0 h-auto">Forgot your password?</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Reset your password</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter your email address below and we'll send you a link to reset your password.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        value={resetEmail} 
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordReset} disabled={isResettingPassword}>
                        {isResettingPassword ? <Loader2 className="animate-spin" /> : "Send Email"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {!isLoading && "Login"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-gray-600 text-sm">
        Don't have an account?{" "}
        <Button
          variant="link"
          type="button"
          onClick={onSwitchToRegister}
          className="p-0 h-auto"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
