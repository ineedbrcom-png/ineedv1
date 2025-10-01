
"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { listings } from "@/lib/data";
import { findImage } from "@/lib/placeholder-images";
import { getServiceProviderRecommendations, ServiceProviderRecommendationOutput } from "@/ai/flows/service-provider-recommendation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Handshake, MapPin, Calendar, Tag, Wallet, Bot, Loader2, User, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [recommendations, setRecommendations] = useState<ServiceProviderRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const listing = listings.find((l) => l.id === params.id);

  if (!listing) {
    notFound();
  }

  const listingImage = findImage(listing.imageId);
  const authorAvatar = findImage(listing.author.avatarId);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await getServiceProviderRecommendations({
        listingDescription: `${listing.title}: ${listing.description}`,
      });
      setRecommendations(result);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar recomendações",
        description: "Não foi possível obter sugestões da IA neste momento. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2">
          <Card>
            {listingImage && (
              <Image
                src={listingImage.imageUrl}
                alt={listing.title}
                width={800}
                height={400}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            )}
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{listing.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base pt-2">
                <span className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {listing.location}</span>
                <span className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> Publicado há {Number(listing.id) * 2} horas</span>
                <span className="flex items-center"><Tag className="mr-1 h-4 w-4" /> Categoria: {listing.category.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-base">
                {listing.description}
              </p>
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Recomendações da IA</h3>
                <p className="text-gray-600 mb-4">
                  Clique no botão abaixo para que nossa inteligência artificial encontre os melhores fornecedores para o seu pedido.
                </p>
                <Button onClick={handleGetRecommendations} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Buscando..." : "Encontrar Fornecedores com IA"}
                </Button>
                
                {recommendations && recommendations.recommendations.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {recommendations.recommendations.map((rec, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <User className="h-5 w-5" /> {rec.providerName}
                                </CardTitle>
                                <CardDescription className="mt-1">{rec.providerDescription}</CardDescription>
                              </div>
                              <Badge className="flex items-center gap-1 text-base py-1 px-3 bg-blue-100 text-blue-800 border-blue-200">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 
                                  {(rec.matchScore * 100).toFixed(0)}%
                                  <span className="hidden sm:inline-block ml-1">Compatível</span>
                              </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                            <Button>Ver Perfil</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                 {recommendations && recommendations.recommendations.length === 0 && (
                   <p className="mt-6 text-gray-600">Nenhuma recomendação encontrada.</p>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-3xl font-bold text-primary">
                <Wallet className="mr-2 h-8 w-8" />
                <span>R$ {listing.budget.toFixed(2)}</span>
              </div>
              <p className="text-muted-foreground mt-1">Valor estimado/máximo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações do Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {authorAvatar && (
                <Avatar className="h-14 w-14">
                  <AvatarImage src={authorAvatar.imageUrl} alt={listing.author.name} />
                  <AvatarFallback>{listing.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h4 className="font-bold">{listing.author.name}</h4>
                <Button variant="link" className="p-0 h-auto">Ver Perfil</Button>
              </div>
            </CardContent>
          </Card>
          
           <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Pronto para ajudar?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Se você pode atender a este pedido, envie sua proposta agora mesmo.</p>
                <Button className="w-full bg-white text-primary hover:bg-gray-100">
                   <Handshake className="mr-2 h-4 w-4" /> Enviar Proposta
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
