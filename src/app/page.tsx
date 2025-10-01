import { Button } from "@/components/ui/button";
import { listings, categories } from "@/lib/data";
import { ListingCard } from "@/components/listing-card";
import { MapPlaceholder } from "@/components/map-placeholder";
import {
  Car,
  ChevronRight,
  Dog,
  Edit,
  Gamepad,
  Handshake,
  Home as HomeIcon,
  Laptop,
  Paintbrush,
  PlusCircle,
  Search,
  CheckCircle,
  Shirt,
  Utensils,
  Wrench,
  Laptop2 as LaptopCode,
  GraduationCap as UserGraduate,
  Baby,
  Box,
  Scissors,
  Dumbbell,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from "next/link";
import { SafetySection } from "@/components/safety-section";


export default function Home() {
  const productCategories = [
    { name: "Tecnologia", icon: Laptop },
    { name: "Casa", icon: HomeIcon },
    { name: "Moda", icon: Shirt },
    { name: "Games", icon: Gamepad },
    { name: "Alimentos", icon: Utensils },
    { name: "Automóveis", icon: Car },
    { name: "Infantil", icon: Baby },
    { name: "Procura-se", icon: Search },
  ];

  const serviceCategories = [
    { name: "Reparos", icon: Wrench },
    { name: "Jardinagem", icon: Scissors },
    { name: "Pet Care", icon: Dog },
    { name: "Reformas", icon: Paintbrush },
    { name: "Mecânica", icon: Car },
    { name: "TI", icon: LaptopCode },
    { name: "Aulas", icon: UserGraduate },
    { name: "Estética", icon: Sparkles },
    { name: "Fitness", icon: Dumbbell },
    { name: "Denúncias", icon: ShieldAlert },
  ];

  return (
    <>
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
              className="bg-white text-blue-600 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105 h-auto"
              asChild
            >
              <Link href="/post-request">
                <PlusCircle className="mr-2" /> Criar Pedido
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-blue-600 text-white font-bold py-4 px-10 rounded-full hover:bg-blue-700 transition duration-300 shadow-lg transform hover:scale-105 h-auto border-blue-600"
            >
              <Search className="mr-2" /> Ver Pedidos
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="products" className="container mx-auto px-4 mt-10">
        <TabsList className="border-b border-gray-200 bg-transparent p-0 justify-start h-auto rounded-none">
          <TabsTrigger
            value="products"
            className="py-3 px-6 font-medium data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none text-gray-600"
          >
            <Box className="mr-2 h-5 w-5" /> Produtos
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="py-3 px-6 font-medium data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none text-gray-600"
          >
            <Wrench className="mr-2 h-5 w-5" /> Serviços
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <section className="py-8 bg-white">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Categorias de Produtos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {productCategories.map((cat, index) => {
                   const colors = [
                    "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    "bg-green-50 text-green-600 hover:bg-green-100",
                    "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
                    "bg-purple-50 text-purple-600 hover:bg-purple-100",
                    "bg-red-50 text-red-600 hover:bg-red-100",
                    "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
                    "bg-pink-50 text-pink-600 hover:bg-pink-100",
                     "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  ];
                  return (
                  <div
                    key={cat.name}
                    className={`${colors[index % colors.length]} p-4 rounded-lg text-center cursor-pointer transition`}
                  >
                    <cat.icon className="mx-auto text-2xl mb-2" />
                    <p>{cat.name}</p>
                  </div>
                )})}
              </div>
            </div>
          </section>
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  Pedidos Recentes de Produtos
                </h3>
                <Link
                  href="#"
                  className="text-blue-600 hover:underline font-medium flex items-center"
                >
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="services">
           <section className="py-8 bg-white">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Categorias de Serviços
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {serviceCategories.map((cat, index) => {
                  const colors = [
                    "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    "bg-green-50 text-green-600 hover:bg-green-100",
                    "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
                    "bg-purple-50 text-purple-600 hover:bg-purple-100",
                    "bg-red-50 text-red-600 hover:bg-red-100",
                    "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
                    "bg-pink-50 text-pink-600 hover:bg-pink-100",
                    "bg-teal-50 text-teal-600 hover:bg-teal-100",
                    "bg-orange-50 text-orange-600 hover:bg-orange-100",
                    "bg-gray-50 text-gray-600 hover:bg-gray-100",
                  ];
                  return (
                  <div
                    key={cat.name}
                     className={`${colors[index % colors.length]} p-4 rounded-lg text-center cursor-pointer transition`}
                  >
                    <cat.icon className="mx-auto text-2xl mb-2" />
                    <p>{cat.name}</p>
                  </div>
                )})}
              </div>
            </div>
          </section>
           <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  Pedidos Recentes de Serviços
                </h3>
                <Link
                  href="#"
                  className="text-blue-600 hover:underline font-medium flex items-center"
                >
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {listings.filter(l => l.category.id === 'home-services' || l.category.id === 'repairs').map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Pedidos Ativos no Mapa</h2>
          <MapPlaceholder />
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Como funciona o iNeed?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="text-2xl" />
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
                <Handshake className="text-2xl" />
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
                <CheckCircle className="text-2xl" />
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
      <SafetySection />
    </>
  );
}
