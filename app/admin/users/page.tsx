'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  User, Mail, Phone, Shield, Calendar,
  Search, Filter, RefreshCw, UserCog,
  Users, UserCheck, UserX, UserMinus
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'warehouse_staff' | 'customer';
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchProfiles();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.phone?.includes(searchQuery);
    
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'warehouse_staff': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'customer': return 'text-green-400 border-green-400/30 bg-green-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'warehouse_staff': return <UserCog className="w-4 h-4" />;
      case 'customer': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 min-h-screen">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading user profiles...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              User Profiles
            </h1>
            <p className="text-gray-400 mt-1">Manage and view all system users</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProfiles}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">{profiles.length}</span>
                <span className="text-gray-400">Total Users</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="text-white font-semibold">
                  {profiles.filter(p => p.role === 'admin').length}
                </span>
                <span className="text-gray-400">Admins</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <UserCog className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">
                  {profiles.filter(p => p.role === 'warehouse_staff').length}
                </span>
                <span className="text-gray-400">Staff</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">
                  {profiles.filter(p => p.role === 'customer').length}
                </span>
                <span className="text-gray-400">Customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-white transition-all duration-300 hover:border-gray-600"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="warehouse_staff">Warehouse Staff</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">All Users</h3>
              <p className="text-sm text-gray-400">{filteredProfiles.length} users found</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User Profile
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Account Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-700/20 transition-all duration-300 group">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <User className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {profile.full_name || 'No Name Provided'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {profile.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRoleColor(profile.role)} max-w-fit`}>
                      {getRoleIcon(profile.role)}
                      <span className="font-medium">{getRoleDisplay(profile.role)}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          Joined: {formatDate(profile.created_at)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {formatDate(profile.updated_at)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProfiles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-600">
              <Users className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">No users found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'No users match your search criteria. Try adjusting your filters.' 
                : 'No user profiles have been created yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Real-time Status Banner */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30 flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live Updates Active</span>
        </div>
      </div>
    </div>
  );
}