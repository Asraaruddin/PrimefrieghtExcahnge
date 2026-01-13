'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  Truck, Package, CheckCircle, AlertCircle, Clock,
  Search, Plus, RefreshCw, Eye, Edit, Trash2,
  MapPin, ChevronRight, Download, Filter, Calendar,
  X, Save, User, Mail, Phone, Info, ExternalLink,
  FileText, BarChart3, Shield, TrendingUp, Bell
} from 'lucide-react';
import Link from 'next/link';

interface Shipment {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  origin_state: string;
  destination_state: string;
  estimated_days: number;
  scheduled_pickup: string;
  scheduled_delivery: string;
  actual_delivery: string | null;
  status: 'pending' | 'in_transit' | 'delayed' | 'delivered' | 'cancelled';
  driver_id: string | null;
  vehicle_id: string | null;
  current_location: string | null;
  delay_reason: string | null;
  delay_updated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DelayModalData {
  shipmentId: string;
  trackingNumber: string;
  currentReason: string | null;
  currentDeliveryDate: string;
}

interface DeliveryModalData {
  shipmentId: string;
  trackingNumber: string;
  scheduledDelivery: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [delayData, setDelayData] = useState<DelayModalData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryModalData | null>(null);
  const [delayReason, setDelayReason] = useState('');
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    delayed: 0,
    delivered: 0
  });

  useEffect(() => {
    fetchShipments();
    // Set up real-time subscription
    const channel = supabase
      .channel('shipments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shipments' }, 
        () => {
          fetchShipments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [shipments]);

  const calculateStats = () => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const onTime = shipments.filter(s => 
      s.status === 'delivered' && 
      s.actual_delivery && 
      new Date(s.actual_delivery) <= new Date(s.scheduled_delivery)
    ).length;

    setStats({ total, onTime, delayed, delivered });
  };

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchShipments();
      alert('Shipment deleted successfully');
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('Failed to delete shipment');
    }
  };

  const openDelayModal = (shipment: Shipment) => {
    setDelayData({
      shipmentId: shipment.id,
      trackingNumber: shipment.tracking_number,
      currentReason: shipment.delay_reason,
      currentDeliveryDate: shipment.scheduled_delivery
    });
    setDelayReason(shipment.delay_reason || '');
    setNewDeliveryDate(shipment.scheduled_delivery);
    setDelayModalOpen(true);
  };

  const openDeliveryModal = (shipment: Shipment) => {
    setDeliveryData({
      shipmentId: shipment.id,
      trackingNumber: shipment.tracking_number,
      scheduledDelivery: shipment.scheduled_delivery
    });
    setNewDeliveryDate(shipment.scheduled_delivery);
    setDeliveryModalOpen(true);
  };

  const handleDelaySubmit = async () => {
    if (!delayData || !delayReason.trim()) return;

    try {
      const updates: any = {
        status: 'delayed',
        delay_reason: delayReason.trim(),
        delay_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (newDeliveryDate) {
        updates.scheduled_delivery = newDeliveryDate;
        // Recalculate estimated days
        const pickupDate = new Date(shipments.find(s => s.id === delayData.shipmentId)?.scheduled_pickup || '');
        const newDelivery = new Date(newDeliveryDate);
        const diffDays = Math.ceil((newDelivery.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
        updates.estimated_days = diffDays > 0 ? diffDays : 1;
      }

      const { error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', delayData.shipmentId);

      if (error) throw error;
      
      setDelayModalOpen(false);
      setDelayData(null);
      setDelayReason('');
      setNewDeliveryDate('');
      
      // Show success notification
      showNotification('Delay reason updated successfully', 'success');
      fetchShipments();
    } catch (error) {
      console.error('Error updating delay:', error);
      showNotification('Failed to update delay', 'error');
    }
  };

  const handleDeliveryUpdate = async () => {
    if (!deliveryData || !newDeliveryDate) return;

    try {
      const updates: any = {
        scheduled_delivery: newDeliveryDate,
        updated_at: new Date().toISOString()
      };

      // Recalculate estimated days
      const shipment = shipments.find(s => s.id === deliveryData.shipmentId);
      if (shipment) {
        const pickupDate = new Date(shipment.scheduled_pickup);
        const newDelivery = new Date(newDeliveryDate);
        const diffDays = Math.ceil((newDelivery.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
        updates.estimated_days = diffDays > 0 ? diffDays : 1;
      }

      const { error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', deliveryData.shipmentId);

      if (error) throw error;
      
      setDeliveryModalOpen(false);
      setDeliveryData(null);
      setNewDeliveryDate('');
      
      showNotification('Delivery date updated successfully', 'success');
      fetchShipments();
    } catch (error) {
      console.error('Error updating delivery date:', error);
      showNotification('Failed to update delivery date', 'error');
    }
  };

  const handleMarkAsDelivered = async (shipmentId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updates = {
        status: 'delivered',
        actual_delivery: today,
        scheduled_delivery: today, // Update scheduled delivery to today
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', shipmentId);

      if (error) throw error;
      
      showNotification('Shipment marked as delivered', 'success');
      fetchShipments();
    } catch (error) {
      console.error('Error marking as delivered:', error);
      showNotification('Failed to mark as delivered', 'error');
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

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin_state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination_state.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
      case 'in_transit': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
      case 'delayed': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      case 'pending': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading shipments...</p>
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
              Shipment Management
            </h1>
            <p className="text-gray-400 mt-2">Real-time tracking and management dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchShipments}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              href="/admin/shipments/add"
              className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold">New Shipment</span>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400 mt-1">Total Shipments</div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-400">Active: {shipments.filter(s => s.status === 'in_transit').length}</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.delivered}</div>
                <div className="text-sm text-gray-400 mt-1">Delivered</div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-400">On-time: {stats.onTime}</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stats.delayed}</div>
                <div className="text-sm text-gray-400 mt-1">Delayed</div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-400">Require attention</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 group hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">
                  {shipments.filter(s => s.status === 'in_transit').length}
                </div>
                <div className="text-sm text-gray-400 mt-1">In Transit</div>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-400">En route to destination</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search shipments by ID, customer, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-white transition-all duration-300 hover:border-gray-600"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delayed">Delayed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-5 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>

            <button className="px-5 py-3 bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Shipments Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Shipments Overview</h3>
              <p className="text-sm text-gray-400">{filteredShipments.length} shipments found</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tracking Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Route & Timing
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
              {filteredShipments.map((shipment) => {
                const statusColors = getStatusColor(shipment.status);
                return (
                  <tr key={shipment.id} className="hover:bg-gray-700/20 transition-all duration-300 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${statusColors.bg} ${statusColors.border}`}>
                          <Truck className={`w-5 h-5 ${statusColors.text}`} />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                            {shipment.tracking_number}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            Created: {formatDate(shipment.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-white">{shipment.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">{shipment.customer_email}</span>
                        </div>
                        {shipment.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{shipment.customer_phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium">{shipment.origin_state}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium">{shipment.destination_state}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                          <div className="text-sm text-gray-400">
                            Est. {shipment.estimated_days} days
                          </div>
                          <button
                            onClick={() => openDeliveryModal(shipment)}
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(shipment.scheduled_delivery)}
                          </button>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        {shipment.status === 'delayed' && shipment.delay_reason && (
                          <button
                            onClick={() => openDelayModal(shipment)}
                            className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 transition-colors"
                          >
                            <AlertCircle className="w-3 h-3" />
                            View Delay Reason
                          </button>
                        )}
                        
                        {shipment.status === 'delivered' && shipment.actual_delivery && (
                          <div className="text-xs text-green-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Delivered: {formatDate(shipment.actual_delivery)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMarkAsDelivered(shipment.id)}
                          className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Mark as Delivered"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openDelayModal(shipment)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Mark as Delayed"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        
                        <Link
                          href={`/admin/shipments/${shipment.id}`}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-300 hover:scale-110"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteShipment(shipment.id)}
                          className="p-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 hover:text-gray-300 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredShipments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-600">
              <Package className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">No shipments found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Start by adding your first shipment to the system.'}
            </p>
            <Link
              href="/admin/shipments/add"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Shipment
            </Link>
          </div>
        )}
      </div>

      {/* Delay Reason Modal */}
      {delayModalOpen && delayData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Update Delay Status</h3>
                <p className="text-sm text-gray-400">Tracking: {delayData.trackingNumber}</p>
              </div>
              <button
                onClick={() => setDelayModalOpen(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delay Reason *
                </label>
                <textarea
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500"
                  rows={4}
                  placeholder="Enter reason for delay (e.g., Weather conditions, Mechanical issues, Traffic congestion...)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Estimated Delivery Date
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={newDeliveryDate.split('T')[0]}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                  <div className="text-sm text-gray-400">
                    Current: {formatDate(delayData.currentDeliveryDate)}
                  </div>
                </div>
              </div>
              
              {delayData.currentReason && (
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-300 mb-1">Previous Delay Reason:</div>
                  <div className="text-sm text-gray-400">{delayData.currentReason}</div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-700/50 flex justify-end space-x-3">
              <button
                onClick={() => setDelayModalOpen(false)}
                className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelaySubmit}
                disabled={!delayReason.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Delay Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Date Modal */}
      {deliveryModalOpen && deliveryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Update Delivery Date</h3>
                <p className="text-sm text-gray-400">Tracking: {deliveryData.trackingNumber}</p>
              </div>
              <button
                onClick={() => setDeliveryModalOpen(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="text-sm text-gray-300 mb-4">
                  Update the scheduled delivery date for this shipment. This will automatically recalculate the estimated transit days.
                </div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Delivery Date *
                </label>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <input
                    type="date"
                    value={newDeliveryDate.split('T')[0]}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Current: {formatDate(deliveryData.scheduledDelivery)}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-700/50 flex justify-end space-x-3">
              <button
                onClick={() => setDeliveryModalOpen(false)}
                className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeliveryUpdate}
                disabled={!newDeliveryDate}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Delivery Date</span>
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