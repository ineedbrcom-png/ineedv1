
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  HandHeart,
  MessageCircle,
  Home,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


export function Header() {
  const { user: authUser, isLoggedIn: authIsLoggedIn, isAuthLoading, auth } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  
  // SIMULATE LOGGED IN STATE
  const isLoggedIn = true;
  const user = authUser || { 
      displayName: 'Usuário Convidado', 
      email: 'guest@example.com', 
      photoURL: 'https://i.pravatar.cc/150?u=guest' 
  };


  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsSheetOpen(false);
  };

  const handleLinkClick = (path: string) => {
    if (!isLoggedIn) {
      openAuthModal("login");
    } else {
      router.push(path);
    }
    setIsSheetOpen(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchTerm.trim()){
        router.push(`/explore/all?q=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        router.push('/explore/all');
      }
      setSearchTerm("");
  }

  const handleLogout = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Serviço de autenticação não disponível.",
      });
      return;
    }
    try {
      await signOut(auth);
      router.push("/");
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
      })
    }
    setIsSheetOpen(false);
  };
  
  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
  }

  const navLinks = (
    <>
      <Button
        variant="link"
        className="text-white hover:underline font-medium flex items-center gap-1 justify-start p-0 h-auto text-base md:text-sm"
        onClick={() => { router.push('/'); setIsSheetOpen(false); }}
      >
        <Home className="h-4 w-4" /> Início
      </Button>
      {isLoggedIn && (
        <>
          <Button
            variant="link"
            className="text-white hover:underline font-medium flex items-center gap-1 justify-start p-0 h-auto text-base md:text-sm"
            onClick={() => handleLinkClick("/messages")}
          >
            <MessageCircle className="h-4 w-4" /> Mensagens
          </Button>
          <Button
            variant="link"
            className="text-white hover:underline font-medium flex items-center gap-1 justify-start p-0 h-auto text-base md:text-sm"
            onClick={() => handleLinkClick("/profile")}
          >
            <User className="h-4 w-4" /> Perfil
          </Button>
        </>
      )}
    </>
  );

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  }

  return (
    <>
      <header className="gradient-bg text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <HandHeart className="text-2xl" />
              <h1 className="text-2xl font-bold">iNeed</h1>
            </Link>

            <form className="relative w-1/2 hidden md:block" onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Buscar pedidos..."
                className="w-full py-2 px-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-gray-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center gap-4">
              {isAuthLoading ? null : isLoggedIn ? (
                <>
                  <nav className="hidden md:flex space-x-6 items-center">
                    {navLinks}
                  </nav>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden md:flex hover:bg-white/10 p-2 rounded-full h-auto"
                      >
                        <Avatar className="h-8 w-8">
                          {user?.photoURL && (
                            <AvatarImage
                              src={user.photoURL}
                              alt={user.displayName || 'User Avatar'}
                            />
                          )}
                          <AvatarFallback className="bg-blue-300 text-blue-800">
                           {getInitials(user?.displayName)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.displayName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex space-x-4">
                  <nav className="hidden md:flex space-x-6 items-center">
                    {navLinks}
                  </nav>
                  <Button
                    onClick={() => openAuthModal("login")}
                    className="px-4 py-2 text-white hover:bg-blue-700 rounded-lg transition duration-300"
                    variant="ghost"
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => openAuthModal("register")}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300"
                  >
                    Cadastrar
                  </Button>
                </div>
              )}
               <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="gradient-bg text-white border-l-0">
                     <nav className="flex flex-col gap-6 mt-10">
                      {isLoggedIn && user ? (
                        <>
                          <div className="flex items-center gap-3 border-b border-white/20 pb-6">
                            <Avatar className="h-12 w-12">
                              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />}
                              <AvatarFallback className="bg-blue-300 text-blue-800 text-xl">{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="text-lg font-medium leading-none">{user.displayName}</p>
                               <p className="text-sm leading-none text-white/80">{user.email}</p>
                            </div>
                          </div>
                          {navLinks}
                          <Button variant="ghost" className="justify-start p-0 h-auto text-base" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
                        </>
                      ) : (
                        <>
                           {navLinks}
                          <Button onClick={() => openAuthModal("login")} className="justify-center" variant="ghost" size="lg">Entrar</Button>
                          <Button onClick={() => openAuthModal("register")} className="justify-center bg-white text-blue-600" size="lg">Cadastrar</Button>
                        </>
                      )}
                     </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
