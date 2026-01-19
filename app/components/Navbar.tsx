'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Mail,
  Menu,
  X,
  MapPin
} from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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

            {/* LOGO */}
           <Link href="/" className="flex items-center">
  <div
    className="
      h-11 flex items-center
      transition-all duration-300 ease-out
    "
  >
    <Image
      src="/logo.png"
      alt="Central Freight Express"
      height={32}
      width={50}
      priority
      className="
        object-contain
        transition-all duration-300 ease-out
        hover:scale-[1.03]
        hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]
      "
    />
  </div>
</Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink href="/" label="Home" active={pathname === '/'} />

              <NavLink
                href="/track-shipment"
                label="Track Shipment"
                icon={<MapPin className="w-4 h-4" />}
                active={pathname === '/track-shipment'}
              />

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

            {/* HAMBURGER */}
            <button
              aria-label="Toggle Menu"
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
              onClick={() => setMobileMenuOpen(v => !v)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950
        backdrop-blur-xl transition-transform duration-300 pt-20
        ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="container mx-auto px-4 pt-6 pb-8 space-y-3">

          <MobileLink href="/" label="Home" active={pathname === '/'} />

          <MobileLink
            href="/track-shipment"
            label="Track Shipment"
            icon={<MapPin />}
            active={pathname === '/track-shipment'}
          />

          <MobileLink
            href="/become-a-partner"
            label="Be a Partner"
            icon={<Shield />}
            active={pathname === '/become-a-partner'}
          />

          <MobileLink
            href="/contact-us"
            label="Contact Us"
            icon={<Mail />}
            active={pathname === '/contact-us'}
          />
        </div>
      </div>
    </>
  );
}

/* ---------- HELPERS ---------- */

function NavLink({ href, label, icon, active }: any) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
        active
          ? 'text-blue-100 bg-white/10'
          : 'text-white hover:text-blue-300 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({ href, label, icon, active }: any) {
  return (
    <Link
      href={href}
      className={`px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all duration-200 ${
        active
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
          : 'text-white hover:bg-white/10'
      }`}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </Link>
  );
}
