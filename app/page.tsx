'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold text-white mb-4">
          Jinja<span className="text-teal">SS</span>
        </h1>
        <p className="text-gray-medium font-body">Redirecting to login...</p>
      </div>
    </div>
  );
}