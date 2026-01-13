'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Truck, Lock, Mail, Shield, UserPlus, Database, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('Auth successful, user:', authData.user?.id);

      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found after login');
      }

      console.log('Session established, checking profile...');

      // Check user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      console.log('Profile data:', profile);
      console.log('Profile error:', profileError);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Check if profile doesn't exist
        if (profileError.code === 'PGRST116') {
          setError('User profile not found. Please run the SQL setup script first.');
          await supabase.auth.signOut();
          return;
        }
        throw profileError;
      }

      if (!profile) {
        setError('Profile not found. Please setup the database first.');
        await supabase.auth.signOut();
        return;
      }

      console.log('User role:', profile.role);

      // Check if user has admin/warehouse staff role
      if (['admin', 'warehouse_staff'].includes(profile.role)) {
        console.log('Login successful, redirecting to dashboard...');
        // Use router for client-side navigation
        router.push('/admin/');
        router.refresh(); // Refresh to update auth state
      } else {
        setError('You do not have permission to access the dashboard');
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      
      // More specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please confirm your email first');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setError('Network error. Please check your connection');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Updated credentials based on the SQL setup
  const demoCredentials = [
    { 
      email: 'admin@primefx.com', 
      password: 'Admin@1234', 
      role: 'Admin',
      description: 'Full administrative access'
    },
    { 
      email: 'warehouse@primefx.com', 
      password: 'Warehouse@1234', 
      role: 'Warehouse Staff',
      description: 'Shipment and inventory management'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Main Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Sign In to Dashboard
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="admin@primefx.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center pt-4">
              <Link 
                href="/" 
                className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
              >
                ← Back to Main Website
              </Link>
            </div>
          </form>
        </div>

        {/* Debug/Setup Section */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">          
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Test Credentials
              </h4>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <div>
                      <span className="text-xs font-medium text-white">{cred.role}</span>
                      <p className="text-xs text-gray-400">{cred.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEmail(cred.email);
                        setPassword(cred.password);
                      }}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Fill
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
}