
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

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileClient profileId={params.id} />
    </Suspense>
  );
}
