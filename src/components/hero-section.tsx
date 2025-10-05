
"use client";

import { Button } from "./ui/button";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  onPostRequestClick: () => void;
}

export function HeroSection({ onPostRequestClick }: HeroSectionProps) {
  return (
    <section className="gradient-bg text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-bounce-slow">
          Peça o que você precisa!
        </h2>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
          Conectamos quem precisa com quem pode oferecer. Seguro, rápido e
          confiável!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-primary font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105 h-auto"
            onClick={onPostRequestClick}
          >
            <PlusCircle className="mr-2" /> Criar Pedido
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent text-white font-bold py-4 px-10 rounded-full hover:bg-white hover:text-primary transition duration-300 shadow-lg transform hover:scale-105 h-auto border-white"
            asChild
          >
            <Link href="/explore/all">
              <Search className="mr-2" /> Ver Pedidos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
