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

export default function ExploreCategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreClientPage slug={slug} />
    </Suspense>
  );
}
