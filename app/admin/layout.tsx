'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  Truck, LogOut, Globe, Shield, MessageSquare, PhoneCall, 
  Briefcase, MessageCircle, Home, Activity, RefreshCw,
  Menu, X, Package, Database, BarChart, Users,
  ChevronRight, TrendingUp, FileText
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
  const pathname = usePathname();
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

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
      href: '/admin/consultation-requests',
      label: 'Consultation',
      icon: PhoneCall,
      active: pathname.startsWith('/admin/consultation-requests')
    },
    {
      href: '/admin/partner-applications',
      label: 'Partner Apps',
      icon: Briefcase,
      active: pathname.startsWith('/admin/partner-applications')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">PrimeLog Dashboard</h1>
                  <p className="text-sm text-gray-400">
                    {userProfile?.full_name || userProfile?.email}
                    <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs capitalize">
                      {userProfile?.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
                <Activity className="w-4 h-4 mr-2 text-green-400 animate-pulse" />
                <span className="text-sm font-medium">Live</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800/90 backdrop-blur-lg border-r border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out pt-16 h-screen`}>
        <div className="h-full overflow-y-auto">
          <div className="p-6 h-full flex flex-col">
            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                    item.active
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                  {item.active && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Footer Links */}
            <div className="mt-auto pt-6 border-t border-gray-700">
              <Link
                href="/"
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl transition-colors"
              >
                <Globe className="w-5 h-5 mr-3" />
                <span className="font-medium">Back to Website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-16 ${sidebarOpen ? 'lg:pl-64' : ''} min-h-screen bg-gray-900`}>
        {children}
      </div>
    </div>
  );
}