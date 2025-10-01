
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ExploreClientPage } from './explore-client-page';

function ExploreLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// ✅ CORREÇÃO 1: Removido o "Promise" da tipagem de params.
// A função da página pode ser "async", mas os parâmetros que ela recebe não são uma Promise.
export default function ExploreCategoryPage({ params }: { params: { slug: string } }) {
  // ✅ CORREÇÃO 2: Removido o "await" daqui.
  const { slug } = params;

  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreClientPage slug={slug} />
    </Suspense>
  );
}
