'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  MessageSquare, Search, Edit, Trash2, RefreshCw, Eye,
  Mail, Building, Calendar, User, Clock, CheckCircle,
  AlertCircle, ChevronDown, MoreVertical, X, Check,
  Filter, Download, Phone, ExternalLink, Send, Archive,
  Shield, Globe, FileText, Bell, Copy, Link, Briefcase,
  Tag, Flag, Folder, AlertTriangle, Target, Inbox
} from 'lucide-react';

interface ContactPageSubmission {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  subject: string;
  department: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string | null;
  status: 'new' | 'read' | 'replied' | 'in_progress' | 'resolved' | 'archived';
}

interface BulkActionState {
  isSelecting: boolean;
  selectedIds: Set<string>;
}

export default function ContactPageSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactPageSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactPageSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionState>({
    isSelecting: false,
    selectedIds: new Set()
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    in_progress: 0,
    resolved: 0,
    archived: 0
  });

  useEffect(() => {
    fetchSubmissions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('contact-page-submissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contact_page_submissions' }, 
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [submissions]);

  const calculateStats = () => {
    const total = submissions.length;
    const newCount = submissions.filter(s => s.status === 'new').length;
    const read = submissions.filter(s => s.status === 'read').length;
    const replied = submissions.filter(s => s.status === 'replied').length;
    const in_progress = submissions.filter(s => s.status === 'in_progress').length;
    const resolved = submissions.filter(s => s.status === 'resolved').length;
    const archived = submissions.filter(s => s.status === 'archived').length;

    setStats({ total, new: newCount, read, replied, in_progress, resolved, archived });
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_page_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSubmissions(data);
    } catch (error) {
      console.error('Error fetching contact page submissions:', error);
      showNotification('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('contact_page_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showNotification('Submission deleted successfully', 'success');
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      showNotification('Failed to delete submission', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (bulkAction.selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${bulkAction.selectedIds.size} selected submissions?`)) return;

    try {
      const { error } = await supabase
        .from('contact_page_submissions')
        .delete()
        .in('id', Array.from(bulkAction.selectedIds));

      if (error) throw error;
      
      showNotification(`${bulkAction.selectedIds.size} submissions deleted successfully`, 'success');
      setBulkAction({ isSelecting: false, selectedIds: new Set() });
      fetchSubmissions();
    } catch (error) {
      console.error('Error bulk deleting submissions:', error);
      showNotification('Failed to delete submissions', 'error');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: ContactPageSubmission['status']) => {
    if (bulkAction.selectedIds.size === 0) return;
    
    try {
      const { error } = await supabase
        .from('contact_page_submissions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(bulkAction.selectedIds));

      if (error) throw error;
      
      showNotification(`${bulkAction.selectedIds.size} submissions updated to ${newStatus.replace('_', ' ')}`, 'success');
      setBulkAction({ isSelecting: false, selectedIds: new Set() });
      fetchSubmissions();
    } catch (error) {
      console.error('Error bulk updating status:', error);
      showNotification('Failed to update submissions', 'error');
    }
  };

  const toggleSelectSubmission = (id: string) => {
    const newSelectedIds = new Set(bulkAction.selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setBulkAction(prev => ({ ...prev, selectedIds: newSelectedIds }));
  };

  const toggleSelectAll = () => {
    if (bulkAction.selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
      setBulkAction(prev => ({ ...prev, selectedIds: new Set() }));
    } else {
      setBulkAction(prev => ({
        ...prev,
        selectedIds: new Set(filteredSubmissions.map(s => s.id))
      }));
    }
  };

  const handleStatusChange = async (id: string, newStatus: ContactPageSubmission['status']) => {
    try {
      const { error } = await supabase
        .from('contact_page_submissions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      showNotification(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchSubmissions();
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.phone.includes(searchQuery) ||
      submission.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || submission.department === departmentFilter;
    const matchesUrgency = urgencyFilter === 'all' || submission.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesUrgency;
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
      case 'read': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'replied': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="w-3 h-3" />;
      case 'high': return <Flag className="w-3 h-3" />;
      case 'medium': return <AlertCircle className="w-3 h-3" />;
      case 'low': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getUrgencyDisplay = (urgency: string) => {
    return urgency.charAt(0).toUpperCase() + urgency.slice(1);
  };

  const getDepartmentDisplay = (department: string) => {
    return department.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const openDetailsModal = (submission: ContactPageSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
    
    // Mark as read if status is new
    if (submission.status === 'new') {
      handleStatusChange(submission.id, 'read');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  const getUniqueDepartments = () => {
    const departments = submissions.map(s => s.department).filter(Boolean) as string[];
    return Array.from(new Set(departments));
  };

  const getDepartmentIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case 'sales': return <Briefcase className="w-3 h-3" />;
      case 'support': return <Inbox className="w-3 h-3" />;
      case 'technical': return <Target className="w-3 h-3" />;
      case 'billing': return <FileText className="w-3 h-3" />;
      default: return <Folder className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 min-h-screen">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading contact submissions...</p>
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
              Contact Page Submissions
            </h1>
            <p className="text-gray-400 mt-2">Manage contact form submissions from the website contact page</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchSubmissions}
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
                <Inbox className="w-5 h-5 text-blue-400" />
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
                <div className="text-xs text-blue-400">Requires attention</div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.read}</div>
                <div className="text-xs text-gray-400 mt-1">Read</div>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.replied}</div>
                <div className="text-xs text-gray-400 mt-1">Replied</div>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <Send className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.in_progress}</div>
                <div className="text-xs text-gray-400 mt-1">In Progress</div>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.resolved}</div>
                <div className="text-xs text-gray-400 mt-1">Resolved</div>
              </div>
              <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-gray-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.archived}</div>
                <div className="text-xs text-gray-400 mt-1">Archived</div>
              </div>
              <div className="p-2 bg-gray-500/20 rounded-lg group-hover:bg-gray-500/30 transition-colors">
                <Archive className="w-5 h-5 text-gray-400" />
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
                  onChange={(e) => handleBulkStatusUpdate(e.target.value as ContactPageSubmission['status'])}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer"
                >
                  <option value="">Update Status</option>
                  <option value="read">Mark as Read</option>
                  <option value="replied">Mark as Replied</option>
                  <option value="in_progress">Mark as In Progress</option>
                  <option value="resolved">Mark as Resolved</option>
                  <option value="archived">Archive</option>
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
                placeholder="Search by name, email, company, subject, or message..."
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
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="relative group">
              <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors"
              >
                <option value="all">All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>
                    {getDepartmentDisplay(dept)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative group">
              <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Contact Submissions</h3>
              <p className="text-sm text-gray-400">{filteredSubmissions.length} submissions found</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button 
                onClick={fetchSubmissions}
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
                        checked={bulkAction.selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Subject & Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Urgency & Message
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
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-700/20 transition-all duration-300 group">
                  {bulkAction.isSelecting && (
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bulkAction.selectedIds.has(submission.id)}
                          onChange={() => toggleSelectSubmission(submission.id)}
                          className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">{submission.name}</span>
                        {submission.status === 'new' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => copyToClipboard(submission.email)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group/email"
                        >
                          {submission.email}
                          <Copy className="w-3 h-3 opacity-0 group-hover/email:opacity-100 transition-opacity" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => copyToClipboard(submission.phone)}
                          className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 group/phone"
                        >
                          {submission.phone}
                          <Copy className="w-3 h-3 opacity-0 group-hover/phone:opacity-100 transition-opacity" />
                        </button>
                      </div>
                      {submission.company && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">{submission.company}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {formatDate(submission.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white truncate max-w-[200px]">
                            {submission.subject}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDepartmentIcon(submission.department)}
                        <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(submission.department)}`}>
                          {getDepartmentDisplay(submission.department)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(submission.urgency)}
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getUrgencyColor(submission.urgency)}`}>
                          {getUrgencyDisplay(submission.urgency)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {submission.message}
                        </p>
                        <button
                          onClick={() => openDetailsModal(submission)}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View Full Message
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={submission.status}
                        onChange={(e) => handleStatusChange(submission.id, e.target.value as ContactPageSubmission['status'])}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(submission.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailsModal(submission)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject)}&body=Hi ${submission.name},%0A%0AThank you for contacting us regarding: "${submission.subject}".%0A%0A`}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-all duration-300 hover:scale-110"
                        title="Reply via Email"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteSubmission(submission.id)}
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
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-600">
              <MessageSquare className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">No contact submissions found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'No contact page submissions have been received yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between sticky top-0 bg-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white">Submission Details</h3>
                <p className="text-sm text-gray-400">ID: {selectedSubmission.id.substring(0, 8)}...</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{selectedSubmission.name}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedSubmission.name)}
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
                          href={`mailto:${selectedSubmission.email}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {selectedSubmission.email}
                        </a>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedSubmission.email)}
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
                        <span className="text-white">{selectedSubmission.phone}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedSubmission.phone)}
                        className="text-gray-400 hover:text-green-400"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-white">
                        {selectedSubmission.company || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submission Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">{selectedSubmission.subject}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedSubmission.subject)}
                      className="text-gray-400 hover:text-purple-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getDepartmentIcon(selectedSubmission.department)}
                      <span className="text-white">{getDepartmentDisplay(selectedSubmission.department)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Urgency</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(selectedSubmission.urgency)}
                      <span className={`text-sm font-semibold ${getUrgencyColor(selectedSubmission.urgency)}`}>
                        {getUrgencyDisplay(selectedSubmission.urgency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-400">Message</label>
                  <button
                    onClick={() => copyToClipboard(selectedSubmission.message)}
                    className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Message
                  </button>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>
              
              {/* Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => {
                        handleStatusChange(selectedSubmission.id, e.target.value as ContactPageSubmission['status']);
                        setSelectedSubmission({
                          ...selectedSubmission,
                          status: e.target.value as ContactPageSubmission['status']
                        });
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(selectedSubmission.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Submitted</label>
                  <div className="text-white p-3 bg-gray-700/30 rounded-lg">
                    {formatDateTime(selectedSubmission.created_at)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                  <div className="text-white p-3 bg-gray-700/30 rounded-lg">
                    {formatDateTime(selectedSubmission.updated_at)}
                  </div>
                </div>
              </div>
              
              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="text-white">
                    {selectedSubmission.source || 'contact_page'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(selectedSubmission.subject)}&body=Hi ${selectedSubmission.name},%0A%0AThank you for contacting us regarding "${selectedSubmission.subject}".%0A%0AWe have received your message and will get back to you shortly.%0A%0ABest regards,%0A[Your Name]`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Response</span>
                </a>
                <a
                  href={`tel:${selectedSubmission.phone}`}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
                {selectedSubmission.company && (
                  <button
                    onClick={() => copyToClipboard(selectedSubmission.company!)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Company</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  handleDeleteSubmission(selectedSubmission.id);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Delete Submission
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