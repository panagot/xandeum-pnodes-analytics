import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
      <div className="glass-strong rounded-2xl p-8 max-w-md w-full border border-white/10 backdrop-blur-2xl text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-purple-500/20 rounded-full">
            <Search className="w-12 h-12 text-purple-400" />
          </div>
          
          <h2 className="text-2xl font-display font-bold text-white">
            404 - Page Not Found
          </h2>
          
          <p className="text-white/60 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <Link
            href="/"
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

