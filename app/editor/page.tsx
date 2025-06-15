'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';

function EditorRedirect() {
  const router = useRouter();

  // Redirect to dashboard - this page should not be accessed directly
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
}

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorRedirect />
    </ProtectedRoute>
  );
}
