'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the record page which is the main entry point
    router.push('/record');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Health Story</h1>
        <p className="text-lg text-slate-600 mb-8">
          Loading...
        </p>
      </div>
    </main>
  );
}
