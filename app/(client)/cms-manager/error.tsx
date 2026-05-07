"use client"

import ErrorComponent from '@/components/ErrorComponent';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react'

const ErrorClient = ({ error, reset }: any) => {
  const router = useRouter();

  const handleRetry = () => {
    startTransition(() => {
      router.refresh(); // Pide al servidor que re-ejecute el Server Component
      reset();          // Limpia el estado de error de Next.js
    });
  }

  return (
    <div className="globalStyle">
      <ErrorComponent error={error.message} onRetry={handleRetry} />
    </div>
  )
}

export default ErrorClient
