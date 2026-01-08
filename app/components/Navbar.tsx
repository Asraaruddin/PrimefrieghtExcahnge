'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Shield, Mail, Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900/95 backdrop-blur-md py-3 shadow-xl border-b border-white/10' 
          : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo - Simple Version */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-300"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg flex items-center justify-center shadow">
                  <Truck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
  Prime<span className="text-blue-500">FX</span>
</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className={`font-bold transition-colors duration-300 text-base px-3 py-2 rounded-lg ${
                  pathname === '/' 
                    ? 'text-blue-400 bg-white/5' 
                    : 'text-white hover:text-blue-300 hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/become-a-partner" 
                className={`font-bold transition-colors duration-300 text-base px-3 py-2 rounded-lg flex items-center space-x-2 ${
                  pathname === '/become-a-partner'
                    ? 'text-blue-400 bg-white/5' 
                    : 'text-white hover:text-blue-300 hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Be a Partner</span>
              </Link>
              <Link 
                href="/contact-us" 
                className={`font-bold transition-colors duration-300 text-base px-3 py-2 rounded-lg flex items-center space-x-2 ${
                  pathname === '/contact'
                    ? 'text-blue-400 bg-white/5' 
                    : 'text-white hover:text-blue-300 hover:bg-white/5'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </Link>
              
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-20">
          <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md">
            <div className="container mx-auto px-4 pt-6 pb-8">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className={`font-bold text-lg px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    pathname === '/' 
                      ? 'text-blue-400 bg-white/10' 
                      : 'text-white hover:text-blue-300 hover:bg-white/5'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>Home</span>
                </Link>
                
                <Link 
                  href="/become-a-partner" 
                  className={`font-bold text-lg px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    pathname === '/become-a-partner'
                      ? 'text-blue-400 bg-white/10' 
                      : 'text-white hover:text-blue-300 hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Be a Partner</span>
                </Link>
                
                <Link 
                  href="/contact" 
                  className={`font-bold text-lg px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    pathname === '/contact'
                      ? 'text-blue-400 bg-white/10' 
                      : 'text-white hover:text-blue-300 hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact Us</span>
                </Link>
                
                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/become-a-partner"
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 px-6 rounded-lg w-full text-center block flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Partner With Us</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}