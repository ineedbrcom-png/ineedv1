
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { MessagesClient } from './messages-client';

function MessagesLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesClient />
    </Suspense>
  );
}
