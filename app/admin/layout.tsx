'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  LogOut, Globe, Shield, MessageSquare, PhoneCall, 
  Briefcase, MessageCircle, Home, Activity, RefreshCw,
  Menu, X, Package, Database, BarChart, Users,
  ChevronRight, TrendingUp, FileText, Settings,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'warehouse_staff';
  phone: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!profile) throw new Error('Profile not found');

      if (!['admin', 'warehouse_staff'].includes(profile.role)) {
        router.push('/unauthorized');
        return;
      }

      setUserProfile(profile as UserProfile);
    } catch (error) {
      console.error('Error checking user role:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const togglePartnerDropdown = () => {
    setPartnerDropdownOpen(!partnerDropdownOpen);
  };

  // Close sidebar on mobile when clicking a link
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Check if any partner dropdown items are active
  const isPartnerDropdownActive = 
    pathname.startsWith('/admin/consultation-requests') ||
    pathname.startsWith('/admin/partner-applications');

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/admin'
    },
    {
      href: '/admin/shipments',
      label: 'Shipments',
      icon: Package,
      active: pathname.startsWith('/admin/shipments')
    },
    {
      href: '/admin/contact-forms',
      label: 'Contact Forms',
      icon: MessageSquare,
      active: pathname.startsWith('/admin/contact-forms')
    },
    {
      href: '/admin/freight-forms',
      label: 'Freight Forms',
      icon: FileText,
      active: pathname.startsWith('/admin/freight-forms')
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
      active: pathname.startsWith('/admin/users')
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart,
      active: pathname.startsWith('/admin/analytics')
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700/50 z-50">
        <div className="h-full px-4 lg:px-6">
          <div className="flex items-center justify-between h-full">
            
            {/* Left Section: Logo & Menu Toggle */}
            <div className="flex items-center space-x-4">
              {/* Menu Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-700/60 transition-all duration-200"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-300" />
                )}
              </button>

              {/* Logo & Brand */}
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.png"
                    alt="Central Freight Express"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold tracking-tight">Central Freight Express</h1>
                  <p className="text-xs text-gray-400 font-medium">Admin Dashboard</p>
                </div>
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg hover:bg-gray-700/60 transition-all duration-200"
                title="Refresh"
                aria-label="Refresh page"
              >
                <RefreshCw className="w-4 h-4 text-gray-300" />
              </button>

              {/* Status Badge */}
              <div className="hidden md:flex items-center px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs font-medium">System Active</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600/90 hover:bg-red-700 rounded-lg transition-all duration-200 text-sm font-medium group"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-800/95 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-4 h-full flex flex-col">
            
            {/* User Info in Sidebar */}
            <div className="mb-6 p-3 bg-gray-700/40 rounded-xl border border-gray-600/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {userProfile?.full_name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium truncate">
                    {userProfile?.full_name || userProfile?.email}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-400 capitalize">
                      {userProfile?.role === 'admin' ? 'Administrator' : 'Staff'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 px-3">
                Navigation
              </h2>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      item.active
                        ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500'
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mr-3 ${item.active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.active && (
                      <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />
                    )}
                  </Link>
                ))}

                {/* Partner With Us Dropdown */}
                <div className="mt-4">
                  <button
                    onClick={togglePartnerDropdown}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isPartnerDropdownActive
                        ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500'
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Briefcase className={`w-4 h-4 mr-3 ${isPartnerDropdownActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                      <span className="text-sm font-medium">Partner With Us</span>
                    </div>
                    {partnerDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    )}
                  </button>
                  
                  {/* Dropdown Items */}
                  {partnerDropdownOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Link
                        href="/admin/consultation-requests"
                        onClick={handleNavClick}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                          pathname.startsWith('/admin/consultation-requests')
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 mr-3 text-gray-400 group-hover:text-white" />
                        <span className="text-sm">Consultation</span>
                      </Link>
                      
                      <Link
                        href="/admin/partner-applications"
                        onClick={handleNavClick}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                          pathname.startsWith('/admin/partner-applications')
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5 mr-3 text-gray-400 group-hover:text-white" />
                        <span className="text-sm">Partner Apps</span>
                      </Link>
                    </div>
                  )}
                </div>
                
              </nav>
            </div>
            
            {/* Footer Links */}
            <div className="mt-auto pt-6 border-t border-gray-700/50">
              <Link
                href="/"
                onClick={handleNavClick}
                className="flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-700/60 hover:text-white rounded-lg transition-all duration-200 group"
              >
                <Globe className="w-4 h-4 mr-3 text-gray-400 group-hover:text-white" />
                <span className="text-sm font-medium">Back to Website</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : ''
        } bg-gradient-to-br from-gray-900 to-gray-800`}
      >
        {/* Content Wrapper */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}