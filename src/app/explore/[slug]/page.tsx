
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ExploreClientPage } from './explore-client-page';

type ExploreCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

function ExploreLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default async function ExploreCategoryPage({ params }: ExploreCategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreClientPage slug={slug} />
    </Suspense>
  );
}
