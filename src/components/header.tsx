"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  HandHeart,
  MessageCircle,
  Home,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/lib/data";
import { findImage } from "@/lib/placeholder-images";
import { AuthModal } from "@/components/auth/auth-modal";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userAvatar = isLoggedIn ? findImage(currentUser.avatarId) : null;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="gradient-bg text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <HandHeart className="text-2xl" />
              <h1 className="text-2xl font-bold">iNeed</h1>
            </Link>

            <div className="relative w-1/2 hidden md:block">
              <Input
                type="text"
                placeholder="Buscar pedidos..."
                className="w-full py-2 px-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 h-9"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-gray-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn && currentUser ? (
                <>
                  <nav className="hidden md:flex space-x-6 items-center">
                    <Link
                      href="/"
                      className="hover:underline font-medium flex items-center gap-1"
                    >
                      <Home className="h-4 w-4" /> Início
                    </Link>
                    <Link
                      href="#"
                      className="hover:underline font-medium flex items-center gap-1"
                    >
                      <Bell className="h-4 w-4" /> Notificações
                    </Link>
                    <Link
                      href="/messages"
                      className="hover:underline font-medium flex items-center gap-1"
                    >
                      <MessageCircle className="h-4 w-4" /> Mensagens
                    </Link>
                  </nav>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hover:bg-white/10 p-2 rounded-full h-auto"
                      >
                        <Avatar className="h-8 w-8">
                          {userAvatar && (
                            <AvatarImage
                              src={userAvatar.imageUrl}
                              alt={userAvatar.description}
                            />
                          )}
                          <AvatarFallback className="bg-blue-300 text-blue-800">
                            {currentUser.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:inline ml-2">
                          {currentUser.name.split(" ")[0]}
                        </span>
                        <ChevronDown className="ml-1 h-4 w-4 hidden lg:inline" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {currentUser.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {currentUser.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Ver Meu Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Meus Pedidos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Configurações</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex space-x-4">
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
            </div>
          </div>
        </div>
      </header>
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        initialMode={authMode}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
    </>
  );
}
