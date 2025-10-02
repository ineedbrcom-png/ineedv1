
import { Suspense } from 'react';
import { ProfileClient } from '../profile-client';
import { Loader2 } from 'lucide-react';

function ProfileLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileClient profileId={id} />
    </Suspense>
  );
}
