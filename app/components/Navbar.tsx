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
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-900/95 backdrop-blur-md py-3 shadow-xl border-b border-white/10'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            
            {/* LOGO (UNCHANGED) */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-300" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg flex items-center justify-center shadow">
                  <Truck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                Prime<span className="text-blue-500">FX</span>
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink href="/" label="Home" active={pathname === '/'} />
              <NavLink
                href="/become-a-partner"
                label="Be a Partner"
                icon={<Shield className="w-4 h-4" />}
                active={pathname === '/become-a-partner'}
              />
              <NavLink
                href="/contact-us"
                label="Contact"
                icon={<Mail className="w-4 h-4" />}
                active={pathname === '/contact-us'}
              />
            </div>

            {/* HAMBURGER (FIXED, NOT MOVED) */}
            <button
              aria-label="Toggle Menu"
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors relative z-[60]"
              onClick={() => setMobileMenuOpen(prev => !prev)}
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

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-gray-900/95 backdrop-blur-md
        transition-transform duration-300 pt-20
        ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="container mx-auto px-4 pt-6 pb-8">
          <div className="flex flex-col space-y-4">
            <MobileLink href="/" label="Home" />
            <MobileLink href="/become-a-partner" label="Be a Partner" icon={<Shield />} />
            <MobileLink href="/contact-us" label="Contact Us" icon={<Mail />} />

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/become-a-partner"
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Partner With Us</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */

function NavLink({ href, label, icon, active }: any) {
  return (
    <Link
      href={href}
      className={`font-bold transition-colors duration-300 text-base px-3 py-2 rounded-lg flex items-center space-x-2 ${
        active
          ? 'text-blue-400 bg-white/5'
          : 'text-white hover:text-blue-300 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({ href, label, icon }: any) {
  return (
    <Link
      href={href}
      className="font-bold text-lg px-4 py-3 rounded-lg flex items-center space-x-3 text-white hover:bg-white/10"
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
