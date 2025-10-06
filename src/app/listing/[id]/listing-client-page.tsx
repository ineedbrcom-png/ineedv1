
"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { getServiceProviderRecommendations, ServiceProviderRecommendationOutput } from "@/ai/flows/service-provider-recommendation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Handshake, MapPin, Calendar, Tag, Wallet, Bot, Loader2, User, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/lib/data";
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useAuth } from "@/hooks/use-auth";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link";

export default function ListingDetailPage({ listing: initialListing }: { listing: Listing }) {
  const [recommendations, setRecommendations] = useState<ServiceProviderRecommendationOutput | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(initialListing);

  useEffect(() => {
    if (initialListing && typeof initialListing.createdAt === 'string') {
        setListing({
            ...initialListing,
            createdAt: new Date(initialListing.createdAt)
        });
    }
  }, [initialListing]);


  if (!listing) {
    notFound();
  }
  
  const handleStartConversation = () => {
      if (!isLoggedIn) {
          toast({ variant: "destructive", title: "Please login to start a conversation."});
          return;
      }
      if (user?.uid === listing.authorId) {
          toast({ variant: "destructive", title: "You cannot start a conversation with yourself."});
          return;
      }
      router.push(`/messages?listingId=${listing.id}&userId=${listing.authorId}`);
  }

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
        title: "Error fetching recommendations",
        description: "Could not get AI suggestions at this time. Please try again later.",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  const getPostTime = () => {
    if (listing.createdAt instanceof Date) {
      return formatDistanceToNow(listing.createdAt, { addSuffix: true, locale: enUS });
    }
    return 'a while ago';
  }

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            {listing.imageUrls && listing.imageUrls.length > 0 ? (
                <Carousel className="w-full rounded-t-lg overflow-hidden">
                  <CarouselContent>
                    {listing.imageUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <Image
                          src={url}
                          alt={`${listing.title} - Image ${index + 1}`}
                          width={800}
                          height={450}
                          className="w-full aspect-video object-cover"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {listing.imageUrls.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="w-full h-64 bg-muted flex items-center justify-center rounded-t-lg">
                  <p className="text-muted-foreground">No image provided</p>
                </div>
              )
            }
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{listing.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base pt-2">
                <span className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {listing.location}</span>
                <span className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {getPostTime()}</span>
                <span className="flex items-center"><Tag className="mr-1 h-4 w-4" /> Category: {listing.category?.name || 'Not specified'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-base">
                {listing.description}
              </p>
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-bold mb-4">AI Recommendations</h3>
                <p className="text-gray-600 mb-4">
                  Click the button below for our AI to find the best providers for your request.
                </p>
                <Button onClick={handleGetRecommendations} disabled={isLoadingRecommendations}>
                  {isLoadingRecommendations ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  {isLoadingRecommendations ? "Searching..." : "Find Providers with AI"}
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
                                  <span className="hidden sm:inline-block ml-1">Compatible</span>
                              </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" disabled>
                                <Link href="#">View Profile (demo)</Link>
                            </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                 {recommendations && recommendations.recommendations.length === 0 && (
                   <p className="mt-6 text-gray-600">No recommendations found.</p>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-3xl font-bold text-primary">
                <Wallet className="mr-2 h-8 w-8" />
                <span>$ {listing.budget.toFixed(2)}</span>
              </div>
              <p className="text-muted-foreground mt-1">Estimated/maximum value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Requester Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    {listing.author?.photoURL && <AvatarImage src={listing.author.photoURL} alt={listing.author.name} />}
                    <AvatarFallback>{getInitials(listing.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{listing.author.name}</h4>
                    <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/profile/${listing.author.id}`}>View Profile</Link>
                    </Button>
                  </div>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleStartConversation}>
                  <MessageSquare className="h-4 w-4"/> Start Conversation
              </Button>
            </CardContent>
          </Card>
          
           <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Ready to help?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">If you can fulfill this request, send your proposal now.</p>
                <Button className="w-full bg-white text-primary hover:bg-gray-100" onClick={handleStartConversation}>
                   <Handshake className="mr-2 h-4 w-4" /> Send Proposal
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
