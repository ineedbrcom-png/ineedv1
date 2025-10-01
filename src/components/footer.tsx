
"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthModal } from "./auth/auth-modal";


export function Footer() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleLinkClick = (path: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
    } else {
      router.push(path);
    }
  };


  return (
    <>
      <footer className="bg-gray-800 text-white py-8 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">iNeed</h3>
              <p className="text-gray-400">
                Conectando necessidades a soluções desde 2023.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Termos de serviço
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Política de privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Central de ajuda
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">contato@ineed.com.br</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white text-xl">
                  <Facebook />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-xl">
                  <Instagram />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-xl">
                  <Linkedin />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} iNeed. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50">
        <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-primary">
          <Home className="h-6 w-6" />
          <span className="text-xs">Início</span>
        </Link>
        <Link href="/explore/all" className="flex flex-col items-center text-gray-600 hover:text-primary">
          <Search className="h-6 w-6" />
          <span className="text-xs">Explorar</span>
        </Link>
        <button onClick={() => handleLinkClick('/post-request')} className="flex flex-col items-center text-white -mt-8">
           <div className="bg-primary rounded-full p-4 shadow-lg">
             <PlusCircle className="h-8 w-8" />
           </div>
        </button>
        <button onClick={() => handleLinkClick('/messages')} className="flex flex-col items-center text-gray-600 hover:text-primary">
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs">Mensagens</span>
        </button>
        <button onClick={() => handleLinkClick('/profile')} className="flex flex-col items-center text-gray-600 hover:text-primary">
          <User className="h-6 w-6" />
          <span className="text-xs">Perfil</span>
        </button>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onLoginSuccess={() => {
          setIsAuthModalOpen(false)
        }}
      />
    </>
  );
}
