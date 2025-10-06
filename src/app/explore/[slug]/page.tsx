
import { ExploreClientPage } from './explore-client-page';
import { getPaginatedListings } from '@/lib/data';
import { allCategories } from '@/lib/categories';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Componente filho que carrega os dados de forma assíncrona
async function ExploreListings({ categoryId, slug }: { categoryId: string | undefined, slug: string }) {
  const initialData = await getPaginatedListings(null, 12, { categoryId });
  return <ExploreClientPage slug={slug} initialData={initialData} />;
}

function LoadingSpinner() {
    return (
        <div className="flex h-full w-full items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

// Componente da página principal, agora SÍNCRONO
export default function ExploreCategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const category = slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Delega a busca de dados e a renderização para o componente filho assíncrono
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExploreListings categoryId={category.id === 'all' ? undefined : category.id} slug={slug} />
    </Suspense>
  );
}
