
"use client";

import { Suspense } from 'react';
import { ProfileClient } from './profile-client';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';

function ProfileLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// This page will be for the logged-in user's own profile.
// It will redirect to /profile/[uid]
export default function ProfilePage() {
    const { user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return <ProfileLoading />;
    }

    if (!user) {
        // Redirect to login or show a message, but for now we'll handle this inside the client component
        return (
             <Suspense fallback={<ProfileLoading />}>
                <ProfileClient />
             </Suspense>
        )
    }

    // Redirect to the dynamic route for the user's own profile
    redirect(`/profile/${user.uid}`);
}
