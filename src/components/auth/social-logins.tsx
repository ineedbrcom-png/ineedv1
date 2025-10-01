
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
      <path d="M12.01,2.02c-1.29-.02-2.58,.47-3.65,1.27-.99,.74-1.9,1.8-2.52,2.94-.48,.88-.78,1.86-.93,2.88-.14,1-.09,2.07,.21,3.06,.29,.95,.76,1.84,1.38,2.62,.55,.68,1.21,1.27,1.94,1.74,.01,.01,1.52,1.05,3.56,.99,1.96-.06,2.63-1.19,4.6-1.19,1.9,0,2.51,1.19,4.52,1.13,2.1-.06,3.15-1.06,3.16-1.07,.78-.51,1.48-1.2,2.05-2.01,.59-.84,1.03-1.8,1.27-2.83,.25-1.07,.29-2.26,.09-3.41-.57-3.32-3.13-5.33-5.74-5.39-1.63-.04-3.17,.8-4.22,.81-1.05,.01-2.43-.88-3.8-.84Zm-1.89,14.62c-.44-1.34,.3-2.84,1.42-3.6,1.11-.75,2.63-1.05,3.95-.59,.3,.11,.66,.31,1.06,.56-.56,1.64-1.82,2.8-3.37,3.69-1.03,.59-2.19,.5-3.06-.06Z"/>
      <path d="M15.1,6.33c.96-.98,1.6-2.43,1.47-3.83-.93,.09-2.15,.69-3.12,1.66-.88,.88-1.7,2.26-1.57,3.66,.97-.03,2.26-.51,3.22-1.49Z" />
    </svg>
);


export function SocialLogins() {
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onLoginSuccess callback will be handled by the AuthModal via the useAuth hook
    } catch (error) {
      console.error("Google login failed:", error);
      toast({
        variant: "destructive",
        title: "Falha no login com Google",
        description: "Não foi possível autenticar com o Google. Tente novamente.",
      });
    }
  };

  const handleAppleLogin = () => {
     toast({
        title: "Em breve!",
        description: "O login com a Apple ainda não está disponível.",
      });
  }


  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
        <GoogleIcon />
        <span>Entrar com Google</span>
      </Button>
      <Button variant="outline" className="w-full" onClick={handleAppleLogin}>
        <AppleIcon />
        <span>Entrar com Apple</span>
      </Button>
    </div>
  );
}
