
import { ExploreClientPage } from './explore-client-page';

export default async function ExploreCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // A lógica de Suspense foi removida pois o ExploreClientPage já gerencia seu próprio estado de carregamento.
  // Isso resolve um erro de hidratação.
  return <ExploreClientPage slug={slug} />;
}
