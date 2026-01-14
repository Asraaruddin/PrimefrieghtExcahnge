'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  PhoneCall, Search, Edit, Trash2, RefreshCw, Eye,Bell, 
  Mail, Building, Calendar, User, Clock, CheckCircle,
  AlertCircle, ChevronDown, MoreVertical, X, Check, 
  Filter, Download, Phone, MessageSquare, ExternalLink,
  Send, Archive, Shield
} from 'lucide-react';

interface ConsultationRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  follow_up_date: string | null;
  assigned_to: string | null;
}

interface BulkActionState {
  isSelecting: boolean;
  selectedIds: Set<string>;
}

export default function ConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionState>({
    isSelecting: false,
    selectedIds: new Set()
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0
  });

  useEffect(() => {
    fetchRequests();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('consultation-requests-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consultation_requests' }, 
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [requests]);

  const calculateStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const contacted = requests.filter(r => r.status === 'contacted').length;
    const scheduled = requests.filter(r => r.status === 'scheduled').length;
    const completed = requests.filter(r => r.status === 'completed').length;

    setStats({ total, pending, contacted, scheduled, completed });
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data);
    } catch (error) {
      console.error('Error fetching consultation requests:', error);
      showNotification('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('consultation_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showNotification('Request deleted successfully', 'success');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      showNotification('Failed to delete request', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (bulkAction.selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${bulkAction.selectedIds.size} selected requests?`)) return;

    try {
      const { error } = await supabase
        .from('consultation_requests')
        .delete()
        .in('id', Array.from(bulkAction.selectedIds));

      if (error) throw error;
      
      showNotification(`${bulkAction.selectedIds.size} requests deleted successfully`, 'success');
      setBulkAction({ isSelecting: false, selectedIds: new Set() });
      fetchRequests();
    } catch (error) {
      console.error('Error bulk deleting requests:', error);
      showNotification('Failed to delete requests', 'error');
    }
  };

  const toggleSelectRequest = (id: string) => {
    const newSelectedIds = new Set(bulkAction.selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setBulkAction(prev => ({ ...prev, selectedIds: newSelectedIds }));
  };

  const toggleSelectAll = () => {
    if (bulkAction.selectedIds.size === filteredRequests.length) {
      setBulkAction(prev => ({ ...prev, selectedIds: new Set() }));
    } else {
      setBulkAction(prev => ({
        ...prev,
        selectedIds: new Set(filteredRequests.map(r => r.id))
      }));
    }
  };

  const handleStatusChange = async (id: string, newStatus: ConsultationRequest['status']) => {
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      showNotification(`Status updated to ${newStatus}`, 'success');
      fetchRequests();
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

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'contacted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'scheduled': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const openDetailsModal = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900/50 min-h-screen">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading consultation requests...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900/50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Consultation Requests
            </h1>
            <p className="text-gray-400 mt-2">Manage and respond to client consultation requests in real-time</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchRequests}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400 mt-1">Total Requests</div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <PhoneCall className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.pending}</div>
                <div className="text-sm text-gray-400 mt-1">Pending</div>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.contacted}</div>
                <div className="text-sm text-gray-400 mt-1">Contacted</div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.scheduled}</div>
                <div className="text-sm text-gray-400 mt-1">Scheduled</div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.completed}</div>
                <div className="text-sm text-gray-400 mt-1">Completed</div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkAction.selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 mb-6">
          <div className="flex items-center justify-between">
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
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, company, or phone..."
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
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Requests Overview</h3>
              <p className="text-sm text-gray-400">{filteredRequests.length} requests found</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button 
                onClick={fetchRequests}
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
                        checked={bulkAction.selectedIds.size === filteredRequests.length && filteredRequests.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Client Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Message
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
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-700/20 transition-all duration-300 group">
                  {bulkAction.isSelecting && (
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bulkAction.selectedIds.has(request.id)}
                          onChange={() => toggleSelectRequest(request.id)}
                          className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">{request.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{request.company}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${request.email}`}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {request.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`tel:${request.phone}`}
                          className="text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                          {request.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {request.message}
                      </p>
                      <button
                        onClick={() => openDetailsModal(request)}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value as ConsultationRequest['status'])}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(request.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailsModal(request)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`mailto:${request.email}`}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Send Email"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
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
        {filteredRequests.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-600">
              <PhoneCall className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">No consultation requests found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'No consultation requests have been submitted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Request Details</h3>
                <p className="text-sm text-gray-400">ID: {selectedRequest.id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Client Name</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{selectedRequest.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <a 
                        href={`mailto:${selectedRequest.email}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {selectedRequest.email}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                      <Phone className="w-4 h-4 text-green-400" />
                      <a 
                        href={`tel:${selectedRequest.phone}`}
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        {selectedRequest.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span className="text-white">{selectedRequest.company}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>
              
              {/* Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <div className={`px-3 py-2 inline-flex text-sm font-semibold rounded-lg border ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Submitted</label>
                  <div className="text-white">
                    {formatDateTime(selectedRequest.created_at)}
                  </div>
                </div>
                
                {selectedRequest.follow_up_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Follow-up Date</label>
                    <div className="text-white">
                      {formatDate(selectedRequest.follow_up_date)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-yellow-300 text-sm">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-700/50 flex justify-between">
              <div className="flex space-x-3">
                <a
                  href={`mailto:${selectedRequest.email}?subject=Re: Your Consultation Request&body=Hi ${selectedRequest.name},%0A%0A`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
                <a
                  href={`tel:${selectedRequest.phone}`}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
              </div>
              <button
                onClick={() => {
                  handleDeleteRequest(selectedRequest.id);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Delete Request
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