
"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { findImage } from "@/lib/placeholder-images";
import { getServiceProviderRecommendations, ServiceProviderRecommendationOutput } from "@/ai/flows/service-provider-recommendation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Handshake, MapPin, Calendar, Tag, Wallet, Bot, Loader2, User, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing } from "@/lib/data";
import { allCategories } from "@/lib/categories";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/hooks/use-auth";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [recommendations, setRecommendations] = useState<ServiceProviderRecommendationOutput | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!params.id) return;

    const fetchListing = async () => {
      setIsLoadingListing(true);
      const docRef = doc(db, "listings", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const category = allCategories.find(c => c.id === data.categoryId)!;
        
        // Fetch author details
        let author = { name: "Usuário", id: data.authorId, avatarId: 'avatar-1', rating: 0, reviewCount: 0 };
        const userDocRef = doc(db, "users", data.authorId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
           const userData = userDocSnap.data();
           author = {
              ...author,
              name: userData.displayName,
              rating: userData.rating || 0,
              reviewCount: userData.reviewCount || 0,
           }
        }

        setListing({
          id: docSnap.id,
          ...data,
          category: category,
          author: author,
        } as Listing);
      } else {
        notFound();
      }
      setIsLoadingListing(false);
    };

    fetchListing();
  }, [params.id]);

  if (isLoadingListing) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    notFound();
  }
  
  const handleStartConversation = () => {
      if (!isLoggedIn) {
          toast({ variant: "destructive", title: "Faça login para iniciar uma conversa."});
          return;
      }
      if (user?.uid === listing.authorId) {
          toast({ variant: "destructive", title: "Você não pode iniciar uma conversa com você mesmo."});
          return;
      }
      router.push(`/messages?listingId=${listing.id}&userId=${listing.authorId}`);
  }

  const listingImage = findImage(listing.imageId || "listing-1");
  const authorAvatar = findImage(listing.author.avatarId);

  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
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
      setIsLoadingRecommendations(false);
    }
  };
  
  const getPostTime = () => {
    if (listing.createdAt?.toDate) {
      return formatDistanceToNow(listing.createdAt.toDate(), { addSuffix: true, locale: ptBR });
    }
    return 'há um tempo';
  }

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  }

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
                <span className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {getPostTime()}</span>
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
                <Button onClick={handleGetRecommendations} disabled={isLoadingRecommendations}>
                  {isLoadingRecommendations ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  {isLoadingRecommendations ? "Buscando..." : "Encontrar Fornecedores com IA"}
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
            <CardContent className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={listing.author.name} />}
                    <AvatarFallback>{getInitials(listing.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{listing.author.name}</h4>
                    <Button variant="link" className="p-0 h-auto">Ver Perfil</Button>
                  </div>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleStartConversation}>
                  <MessageSquare className="h-4 w-4"/> Iniciar Conversa
              </Button>
            </CardContent>
          </Card>
          
           <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Pronto para ajudar?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Se você pode atender a este pedido, envie sua proposta agora mesmo.</p>
                <Button className="w-full bg-white text-primary hover:bg-gray-100" onClick={handleStartConversation}>
                   <Handshake className="mr-2 h-4 w-4" /> Enviar Proposta
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
