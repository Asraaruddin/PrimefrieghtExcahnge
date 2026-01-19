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
          setError('User profile not found. Please contact your administrator.');
          await supabase.auth.signOut();
          return;
        }
        throw profileError;
      }

      if (!profile) {
        setError('Profile not found. Please contact your administrator.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Main Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Central Freight Express</h1>
                <p className="text-sm text-gray-400">Admin Dashboard</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white text-center mb-6">
            Sign In to Dashboard
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-red-300 text-sm">{error}</span>
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
                  placeholder="Enter your email address"
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all duration-200"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1 transition-colors"
              >
                ← Back to Main Website
              </Link>
            </div>
          </form>
        </div>

        {/* Security Information Footer */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-400">Secure Login</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Your credentials are encrypted and securely transmitted.
              <br />
              Unauthorized access is strictly prohibited.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Database className="w-3 h-3" />
              <span>Central Freight Express Admin Portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}