import React from 'react';
import { Layers, Rocket, Shield, Terminal } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-sky-100 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 mb-4">
          Production Scaffold Ready
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Self-Print Monorepo
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600 sm:text-lg">
          Scalable architecture powered by React 19, Vite, Tailwind CSS, TanStack Query, Express & Prisma.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20"
          >
            Launch Store Dashboard &rarr;
          </a>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">React 19 + Vite</h3>
          <p className="text-sm text-gray-500">Fast modern frontend bundle with TypeScript and instant HMR.</p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">Express & Helmet</h3>
          <p className="text-sm text-gray-500">Secure backend setup with CORS, Morgan logging, and validation.</p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">Prisma ORM</h3>
          <p className="text-sm text-gray-500">PostgreSQL schema ready for migrations and type-safe DB queries.</p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">TanStack Query</h3>
          <p className="text-sm text-gray-500">Configured query client and Axios interceptors for API calls.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
