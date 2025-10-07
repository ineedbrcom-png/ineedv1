
import { ExploreClientPage } from './explore-client-page';
import { getPaginatedListings } from '@/lib/data';
import { allCategories } from '@/lib/categories';
import { notFound } from 'next/navigation';

// Define a interface para as props da página, exatamente como você recomendou.
interface ExplorePageProps {
  params: {
    slug: string; // O 'slug' corresponde ao nome da pasta [slug]
  };
  searchParams?: { [key: string]: string | string[] | undefined }; // Opcional para query params
}

// Usa a interface para tipar as props do componente da página.
export default async function ExploreCategoryPage({ params }: ExplorePageProps) {
  const { slug } = params;

  const category = slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Busca os dados iniciais no servidor.
  const initialData = await getPaginatedListings(null, 12, { categoryId: category.id === 'all' ? undefined : category.id });

  // Renderiza o componente do lado do cliente, passando os dados.
  return <ExploreClientPage slug={slug} initialData={initialData} />;
}
