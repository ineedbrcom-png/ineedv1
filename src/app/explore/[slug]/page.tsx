import { listings } from "@/lib/data";
import { allCategories } from "@/lib/categories";
import { ListingCard } from "@/components/listing-card";
import { notFound } from "next/navigation";

export default function ExploreCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const category =
    slug === "all"
      ? { name: "Todos os Pedidos", slug: "all" }
      : allCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredListings =
    slug === "all"
      ? listings
      : listings.filter((listing) => listing.category.slug === slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{category.name}</h1>
        <p className="text-lg text-gray-600 mt-2">
          {filteredListings.length} pedido(s) encontrado(s)
        </p>
      </div>
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">
            Nenhum pedido encontrado nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
}
