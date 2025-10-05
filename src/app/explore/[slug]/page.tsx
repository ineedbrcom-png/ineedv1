
import { ExploreClientPage } from './explore-client-page';
import { getPaginatedListings } from '@/lib/data';
import { allCategories } from '@/lib/categories';
import { notFound } from 'next/navigation';

export default async function ExploreCategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const category = slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Fetch initial data on the server
  const initialData = await getPaginatedListings(null, 12, { categoryId: category.id === 'all' ? undefined : category.id });

  return <ExploreClientPage slug={slug} initialData={initialData} />;
}
