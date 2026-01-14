'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  Users, Search, Edit, Trash2, RefreshCw, Eye,
  Mail, Building, Calendar, User, Clock, CheckCircle,
  AlertCircle, ChevronDown, MoreVertical, X, Check,
  Filter, Download, Phone, ExternalLink, Send, Archive,
  Shield, Globe, FileText, Bell, Copy, Link, Briefcase,
  Award, Target, TrendingUp, GlobeIcon, FileCheck
} from 'lucide-react';

interface PartnerApplication {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  website: string | null;
  company_overview: string | null;
  message: string;
  source: string | null;
  status: 'new' | 'reviewed' | 'approved' | 'rejected' | 'on_hold' | 'contacted';
}

interface BulkActionState {
  isSelecting: boolean;
  selectedIds: Set<string>;
}

export default function PartnerApplicationsPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionState>({
    isSelecting: false,
    selectedIds: new Set()
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
    on_hold: 0,
    contacted: 0
  });

  useEffect(() => {
    fetchApplications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('partner-applications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'partner_applications' }, 
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [applications]);

  const calculateStats = () => {
    const total = applications.length;
    const newCount = applications.filter(a => a.status === 'new').length;
    const reviewed = applications.filter(a => a.status === 'reviewed').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const on_hold = applications.filter(a => a.status === 'on_hold').length;
    const contacted = applications.filter(a => a.status === 'contacted').length;

    setStats({ total, new: newCount, reviewed, approved, rejected, on_hold, contacted });
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setApplications(data);
    } catch (error) {
      console.error('Error fetching partner applications:', error);
      showNotification('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner application?')) return;

    try {
      const { error } = await supabase
        .from('partner_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showNotification('Application deleted successfully', 'success');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      showNotification('Failed to delete application', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (bulkAction.selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${bulkAction.selectedIds.size} selected applications?`)) return;

    try {
      const { error } = await supabase
        .from('partner_applications')
        .delete()
        .in('id', Array.from(bulkAction.selectedIds));

      if (error) throw error;
      
      showNotification(`${bulkAction.selectedIds.size} applications deleted successfully`, 'success');
      setBulkAction({ isSelecting: false, selectedIds: new Set() });
      fetchApplications();
    } catch (error) {
      console.error('Error bulk deleting applications:', error);
      showNotification('Failed to delete applications', 'error');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: PartnerApplication['status']) => {
    if (bulkAction.selectedIds.size === 0) return;
    
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(bulkAction.selectedIds));

      if (error) throw error;
      
      showNotification(`${bulkAction.selectedIds.size} applications updated to ${newStatus}`, 'success');
      setBulkAction({ isSelecting: false, selectedIds: new Set() });
      fetchApplications();
    } catch (error) {
      console.error('Error bulk updating status:', error);
      showNotification('Failed to update applications', 'error');
    }
  };

  const toggleSelectApplication = (id: string) => {
    const newSelectedIds = new Set(bulkAction.selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setBulkAction(prev => ({ ...prev, selectedIds: newSelectedIds }));
  };

  const toggleSelectAll = () => {
    if (bulkAction.selectedIds.size === filteredApplications.length && filteredApplications.length > 0) {
      setBulkAction(prev => ({ ...prev, selectedIds: new Set() }));
    } else {
      setBulkAction(prev => ({
        ...prev,
        selectedIds: new Set(filteredApplications.map(a => a.id))
      }));
    }
  };

  const handleStatusChange = async (id: string, newStatus: PartnerApplication['status']) => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      showNotification(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-600' :
      type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white flex items-center space-x-2`;
    
    notification.innerHTML = `
      ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      `${application.first_name} ${application.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.phone.includes(searchQuery) ||
      application.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'reviewed': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'on_hold': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'contacted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const openDetailsModal = (application: PartnerApplication) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
    
    // Mark as reviewed if status is new
    if (application.status === 'new') {
      handleStatusChange(application.id, 'reviewed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  const getSourceDisplay = (source: string | null) => {
    if (!source) return 'Unknown';
    return source.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 min-h-screen">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading partner applications...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Partner Applications
            </h1>
            <p className="text-gray-400 mt-2">Manage and review partnership requests in real-time</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchApplications}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400 mt-1">Total</div>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.new}</div>
                <div className="text-xs text-gray-400 mt-1">New</div>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            {stats.new > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-xs text-blue-400">Needs review</div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.reviewed}</div>
                <div className="text-xs text-gray-400 mt-1">Reviewed</div>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.contacted}</div>
                <div className="text-xs text-gray-400 mt-1">Contacted</div>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <Send className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.approved}</div>
                <div className="text-xs text-gray-400 mt-1">Approved</div>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.on_hold}</div>
                <div className="text-xs text-gray-400 mt-1">On Hold</div>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.rejected}</div>
                <div className="text-xs text-gray-400 mt-1">Rejected</div>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                <X className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkAction.selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-white font-semibold">
                {bulkAction.selectedIds.size} selected
              </div>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>
              <div className="relative group">
                <select
                  onChange={(e) => handleBulkStatusUpdate(e.target.value as PartnerApplication['status'])}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer"
                >
                  <option value="">Update Status</option>
                  <option value="reviewed">Mark as Reviewed</option>
                  <option value="contacted">Mark as Contacted</option>
                  <option value="approved">Mark as Approved</option>
                  <option value="rejected">Mark as Rejected</option>
                  <option value="on_hold">Mark as On Hold</option>
                </select>
              </div>
              <button
                onClick={() => setBulkAction({ isSelecting: false, selectedIds: new Set() })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-blue-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Bulk actions active</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, company, email, or website..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-white transition-all duration-300 hover:border-gray-600"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setBulkAction(prev => ({ ...prev, isSelecting: !prev.isSelecting }))}
              className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                bulkAction.isSelecting 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Check className="w-5 h-5" />
            </button>
            
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Partner Applications</h3>
              <p className="text-sm text-gray-400">{filteredApplications.length} applications found</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button 
                onClick={fetchApplications}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors" 
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/30">
              <tr>
                {bulkAction.isSelecting && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={bulkAction.selectedIds.size === filteredApplications.length && filteredApplications.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-700/20 transition-all duration-300 group">
                  {bulkAction.isSelecting && (
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bulkAction.selectedIds.has(application.id)}
                          onChange={() => toggleSelectApplication(application.id)}
                          className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">
                          {application.first_name} {application.last_name}
                        </span>
                        {application.status === 'new' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(application.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Source: {getSourceDisplay(application.source)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-white">{application.company_name}</span>
                      </div>
                      {application.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a 
                            href={application.website.startsWith('http') ? application.website : `https://${application.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[150px]"
                          >
                            {application.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => copyToClipboard(application.email)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group/email"
                        >
                          {application.email}
                          <Copy className="w-3 h-3 opacity-0 group-hover/email:opacity-100 transition-opacity" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => copyToClipboard(application.phone)}
                          className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 group/phone"
                        >
                          {application.phone}
                          <Copy className="w-3 h-3 opacity-0 group-hover/phone:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-300 line-clamp-2 mb-1">
                        {application.message}
                      </p>
                      {application.company_overview && (
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {application.company_overview}
                        </p>
                      )}
                      <button
                        onClick={() => openDetailsModal(application)}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View Full Application
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application.id, e.target.value as PartnerApplication['status'])}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(application.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailsModal(application)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`mailto:${application.email}?subject=Regarding Your Partnership Application&body=Hi ${application.first_name},%0A%0AThank you for your interest in partnering with us. We have reviewed your application from ${application.company_name} and would like to discuss further.%0A%0A`}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Reply via Email"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                      {application.website && (
                        <a
                          href={application.website.startsWith('http') ? application.website : `https://${application.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Visit Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteApplication(application.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-600">
              <Users className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">No partner applications found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'No partnership applications have been submitted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between sticky top-0 bg-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white">Partner Application Details</h3>
                <p className="text-sm text-gray-400">ID: {selectedApplication.id.substring(0, 8)}...</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Applicant Name</label>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">
                          {selectedApplication.first_name} {selectedApplication.last_name}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${selectedApplication.first_name} ${selectedApplication.last_name}`)}
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <a 
                          href={`mailto:${selectedApplication.email}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {selectedApplication.email}
                        </a>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedApplication.email)}
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-400" />
                        <span className="text-white">{selectedApplication.phone}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedApplication.phone)}
                        className="text-gray-400 hover:text-green-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-white">
                        {getSourceDisplay(selectedApplication.source)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Company Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-400" />
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">{selectedApplication.company_name}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedApplication.company_name)}
                        className="text-gray-400 hover:text-purple-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {selectedApplication.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                      <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <GlobeIcon className="w-4 h-4 text-blue-400" />
                          <a 
                            href={selectedApplication.website.startsWith('http') ? selectedApplication.website : `https://${selectedApplication.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {selectedApplication.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedApplication.website!)}
                          className="text-gray-400 hover:text-blue-400"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedApplication.company_overview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Company Overview</label>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedApplication.company_overview}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Application Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    Application Message
                  </h4>
                  <button
                    onClick={() => copyToClipboard(selectedApplication.message)}
                    className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Message
                  </button>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedApplication.message}</p>
                </div>
              </div>
              
              {/* Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => {
                        handleStatusChange(selectedApplication.id, e.target.value as PartnerApplication['status']);
                        setSelectedApplication({
                          ...selectedApplication,
                          status: e.target.value as PartnerApplication['status']
                        });
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(selectedApplication.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Submitted</label>
                  <div className="text-white p-3 bg-gray-700/30 rounded-lg">
                    {formatDateTime(selectedApplication.created_at)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                  <div className="text-white p-3 bg-gray-700/30 rounded-lg">
                    {formatDateTime(selectedApplication.updated_at)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedApplication.email}?subject=Regarding Your Partnership Application&body=Hi ${selectedApplication.first_name},%0A%0AThank you for your interest in partnering with us. We have reviewed your application from ${selectedApplication.company_name} and would like to discuss further.%0A%0ABest regards,%0A[Your Name]`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Response</span>
                </a>
                <a
                  href={`tel:${selectedApplication.phone}`}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Applicant</span>
                </a>
                {selectedApplication.website && (
                  <a
                    href={selectedApplication.website.startsWith('http') ? selectedApplication.website : `https://${selectedApplication.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  handleDeleteApplication(selectedApplication.id);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Delete Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Status Banner */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30 flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live Updates Active</span>
          <Bell className="w-4 h-4 text-blue-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}