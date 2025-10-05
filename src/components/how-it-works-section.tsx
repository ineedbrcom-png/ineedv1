
"use client";

import { Edit, Handshake, CheckCircle } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Como funciona o iNeed?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              1. Crie seu pedido
            </h3>
            <p className="text-gray-600">
              Descreva o que você precisa, seja um produto ou serviço, com o
              máximo de detalhes possível.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              2. Receba ofertas
            </h3>
            <p className="text-gray-600">
              Pessoas interessadas em atender seu pedido entrarão em contato
              com propostas e valores.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              3. Feche o acordo
            </h3>
            <p className="text-gray-600">
              Escolha a melhor oferta, combine os detalhes e finalize com
              segurança através da plataforma.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
