'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  User, Mail, Phone, Shield, Calendar,
  Search, Filter, RefreshCw, UserCog,
  Users, UserCheck, UserX, UserMinus,
  ChevronRight, MoreVertical, Download
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
  const [mobileView, setMobileView] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      case 'admin': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warehouse_staff': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'customer': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'warehouse_staff': return <UserCog className="w-3 h-3" />;
      case 'customer': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const stats = [
    {
      label: 'Total Users',
      value: profiles.length,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Admins',
      value: profiles.filter(p => p.role === 'admin').length,
      icon: Shield,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      label: 'Staff',
      value: profiles.filter(p => p.role === 'warehouse_staff').length,
      icon: UserCog,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Customers',
      value: profiles.filter(p => p.role === 'customer').length,
      icon: User,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading user profiles...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">User Profiles</h1>
              <p className="text-gray-400">Manage and view all system users</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProfiles}
                className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button className="hidden md:flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200">
                <Download className="w-4 h-4 mr-2" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Bar - Responsive Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-white transition-all duration-300"
                  />
                </div>
              </div>
              
              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 md:flex-none min-w-[180px]">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="warehouse_staff">Warehouse Staff</option>
                      <option value="customer">Customer</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <button className="md:hidden px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Content */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-700/50 bg-gray-800/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">All Users</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredProfiles.length} users • Updated just now
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 text-sm">
                  <span className="hidden sm:inline">Export CSV</span>
                  <Download className="w-4 h-4 sm:hidden" />
                </button>
              </div>
            </div>
          </div>

          {/* Profiles List - Mobile Card View */}
          {mobileView ? (
            <div className="divide-y divide-gray-700/50">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery ? 'Try adjusting your search' : 'No user profiles yet'}
                  </p>
                </div>
              ) : (
                filteredProfiles.map((profile) => (
                  <div key={profile.id} className="p-4 hover:bg-gray-700/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {profile.full_name || 'No Name Provided'}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-400 truncate max-w-[200px]">
                              {profile.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)} flex items-center space-x-1`}>
                            {getRoleIcon(profile.role)}
                            <span>{getRoleDisplay(profile.role)}</span>
                          </div>
                        </div>
                        
                        {profile.phone && (
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/30">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {formatDate(profile.created_at)}</span>
                        </div>
                        <span>ID: {profile.id.substring(0, 6)}...</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/30">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      User Profile
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Account Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 md:px-6 py-12">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-400">No users found</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchQuery ? 'Try adjusting your search' : 'No user profiles yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
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
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-white text-sm">{profile.email}</span>
                            </div>
                            {profile.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 text-sm">{profile.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getRoleColor(profile.role)} max-w-fit`}>
                            {getRoleIcon(profile.role)}
                            <span className="font-medium text-sm">{getRoleDisplay(profile.role)}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-300">
                                Joined {formatDate(profile.created_at)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Updated {formatDate(profile.updated_at)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination/Footer */}
          {filteredProfiles.length > 0 && (
            <div className="p-4 md:p-6 border-t border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-medium text-white">{filteredProfiles.length}</span> of{' '}
                  <span className="font-medium text-white">{profiles.length}</span> users
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Status Indicator */}
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}