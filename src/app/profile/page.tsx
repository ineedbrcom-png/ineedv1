
"use client";

import { Suspense } from 'react';
import { ProfileClient } from './profile-client';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

function ProfileLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function ProfilePageContent() {
    const params = useParams();
    const profileId = params.id as string | undefined;
    
    return <ProfileClient key={profileId} />;
}


export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfilePageContent />
    </Suspense>
  );
}
