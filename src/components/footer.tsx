import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
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
                <Twitter />
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
  );
}
