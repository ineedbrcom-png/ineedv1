
"use client";

import type { Category, Listing } from "@/lib/types";
import { Map } from "@/components/map";
import { Box, Wrench, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { SafetySection } from "@/components/safety-section";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { CategoryCard } from "@/components/category-card";
import { ListingGrid } from "@/components/listing-grid";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { HeroSection } from "@/components/hero-section";

interface HomeClientProps {
  productCategories: Category[];
  serviceCategories: Category[];
  initialListings: Listing[];
}

const categoryColors = [
  "bg-blue-50 text-blue-600 hover:bg-blue-100",
  "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
  "bg-purple-50 text-purple-600 hover:bg-purple-100",
  "bg-gray-50 text-gray-600 hover:bg-gray-100",
  "bg-orange-50 text-orange-600 hover:bg-orange-100",
  "bg-amber-50 text-amber-600 hover:bg-amber-100",
  "bg-pink-50 text-pink-600 hover:bg-pink-100",
  "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  "bg-red-50 text-red-600 hover:bg-red-100",
  "bg-green-50 text-green-600 hover:bg-green-100",
  "bg-rose-50 text-rose-600 hover:bg-rose-100",
];

export function HomeClient({ productCategories, serviceCategories, initialListings }: HomeClientProps) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePostRequestClick = () => {
    if (isLoggedIn) {
      router.push("/post-request");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const productListings = (initialListings || []).filter((l) => l.category?.type === "product").slice(0, 3);
  const serviceListings = (initialListings || []).filter((l) => l.category?.type === "service").slice(0, 3);

  return (
    <>
      <HeroSection onPostRequestClick={handlePostRequestClick} />

      {isClient && (
        <>
          <Tabs defaultValue="products" className="container mx-auto px-4 mt-10">
            <TabsList className="border-b border-gray-200 bg-transparent p-0 justify-start h-auto rounded-none">
              <TabsTrigger value="products" className="py-3 px-6 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-gray-600">
                <Box className="mr-2 h-5 w-5" /> Products
              </TabsTrigger>
              <TabsTrigger value="services" className="py-3 px-6 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-gray-600">
                <Wrench className="mr-2 h-5 w-5" /> Services
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <section className="py-8 bg-background">
                <div className="container mx-auto px-4">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">Product Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
                    {productCategories.map((cat, index) => (
                      <CategoryCard
                        key={cat.slug}
                        category={cat}
                        colorClassName={categoryColors[index % categoryColors.length]}
                      />
                    ))}
                  </div>
                </div>
              </section>
              <section className="py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800">Recent Product Requests</h3>
                    <Link href="/explore/all" className="text-primary hover:underline font-medium flex items-center">
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <ListingGrid
                    listings={productListings}
                    isLoading={isAuthLoading}
                    emptyStateType="product"
                    onPostRequestClick={handlePostRequestClick}
                  />
                </div>
              </section>
            </TabsContent>

            <TabsContent value="services">
              <section className="py-8 bg-background">
                <div className="container mx-auto px-4">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">Service Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-11 gap-4">
                    {serviceCategories.map((cat, index) => (
                      <CategoryCard
                        key={cat.slug}
                        category={cat}
                        colorClassName={categoryColors[index % categoryColors.length]}
                      />
                    ))}
                  </div>
                </div>
              </section>
              <section className="py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800">Recent Service Requests</h3>
                    <Link href="/explore/all" className="text-primary hover:underline font-medium flex items-center">
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <ListingGrid
                    listings={serviceListings}
                    isLoading={isAuthLoading}
                    emptyStateType="service"
                    onPostRequestClick={handlePostRequestClick}
                  />
                </div>
              </section>
            </TabsContent>
          </Tabs>

          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                Active Requests on the Map
              </h2>
              <Map />
            </div>
          </section>

          <HowItWorksSection />
          <SafetySection />
        </>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        initialMode={"login"}
        onLoginSuccess={() => router.push("/post-request")}
      />
    </>
  );
}
