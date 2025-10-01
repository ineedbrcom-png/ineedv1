
import { ExploreClientPage } from "./explore-client-page";

// Este é um Server Component. Sua única função é obter os parâmetros da URL
// e passá-los para o Client Component que fará a busca de dados.
export default function ExploreCategoryPage({ params }: any) {
  return <ExploreClientPage slug={params.slug} />;
}
