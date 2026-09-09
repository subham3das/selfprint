import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Printer } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header / Navbar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-sky-600">
            <Printer className="w-6 h-6" />
            <span>Self-Print</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-sky-600 transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Self-Print. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
