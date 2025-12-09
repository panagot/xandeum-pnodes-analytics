'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
      <div className="glass-strong rounded-2xl p-8 max-w-md w-full border border-red-500/50 backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-display font-bold text-white">
            Something went wrong!
          </h2>
          
          <p className="text-white/60 text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
          
          {error.digest && (
            <p className="text-white/40 text-xs font-mono">
              Error ID: {error.digest}
            </p>
          )}
          
          <button
            onClick={reset}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

