'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  Package, MessageSquare, PhoneCall, Briefcase, 
  MessageCircle, Users, Truck, BarChart,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  Plus, X, Search, Filter, ArrowUpRight, ArrowDownRight,
  ChevronRight, Eye, User, Mail, Calendar, MapPin,
  Loader2, RefreshCw, Activity
} from 'lucide-react';
import Link from 'next/link';

// Define types
interface DashboardCounts {
  shipments: number;
  contactForms: number;
  consultationRequests: number;
  partnerApplications: number;
  freightForms: number;
  users: number;
}

interface ShipmentStats {
  total: number;
  delivered: number;
  inTransit: number;
  delayed: number;
  pending: number;
  cancelled: number;
}

interface RecentShipment {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
  origin_state: string;
  destination_state: string;
}

interface RecentContactForm {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface RecentActivity {
  type: 'shipment' | 'contact_form' | 'consultation' | 'partner_application';
  id: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<DashboardCounts>({
    shipments: 0,
    contactForms: 0,
    consultationRequests: 0,
    partnerApplications: 0,
    freightForms: 0,
    users: 0,
  });
  
  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    delivered: 0,
    inTransit: 0,
    delayed: 0,
    pending: 0,
    cancelled: 0,
  });
  
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [recentContactForms, setRecentContactForms] = useState<RecentContactForm[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShipment, setNewShipment] = useState({
    tracking_number: '',
    customer_name: '',
    customer_email: '',
    origin_state: '',
    destination_state: '',
    status: 'pending' as const,
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch counts
      const [
        shipmentsRes,
        contactFormsRes,
        consultationRequestsRes,
        partnerApplicationsRes,
        freightFormsRes,
        usersRes,
      ] = await Promise.all([
        supabase.from('shipments').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions_frieght').select('*', { count: 'exact', head: true }),
        supabase.from('consultation_requests').select('*', { count: 'exact', head: true }),
        supabase.from('partner_applications').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions_frieght').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      // Fetch shipment stats
      const { data: shipments } = await supabase
        .from('shipments')
        .select('status');

      const shipmentStats = shipments?.reduce((acc: ShipmentStats, shipment) => {
        acc.total++;
        switch (shipment.status) {
          case 'delivered': acc.delivered++; break;
          case 'in_transit': acc.inTransit++; break;
          case 'delayed': acc.delayed++; break;
          case 'pending': acc.pending++; break;
          case 'cancelled': acc.cancelled++; break;
        }
        return acc;
      }, { total: 0, delivered: 0, inTransit: 0, delayed: 0, pending: 0, cancelled: 0 }) || {
        total: 0, delivered: 0, inTransit: 0, delayed: 0, pending: 0, cancelled: 0
      };

      // Fetch recent shipments (last 5)
      const { data: recentShipmentsData } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent contact forms (last 5)
      const { data: recentContactFormsData } = await supabase
        .from('contact_submissions_frieght')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Set state
      setCounts({
        shipments: shipmentsRes.count || 0,
        contactForms: contactFormsRes.count || 0,
        consultationRequests: consultationRequestsRes.count || 0,
        partnerApplications: partnerApplicationsRes.count || 0,
        freightForms: freightFormsRes.count || 0,
        users: usersRes.count || 0,
      });

      setStats(shipmentStats);
      setRecentShipments(recentShipmentsData || []);
      setRecentContactForms(recentContactFormsData || []);

      // Generate recent activity
      const activities: RecentActivity[] = [];
      
      // Add recent shipments to activities
      recentShipmentsData?.forEach(shipment => {
        activities.push({
          type: 'shipment',
          id: shipment.id,
          title: 'New Shipment Created',
          description: `Tracking #${shipment.tracking_number} for ${shipment.customer_name}`,
          timestamp: shipment.created_at,
          timeAgo: formatTimeAgo(shipment.created_at),
          icon: <Package className="w-4 h-4" />,
          color: 'text-blue-400',
          href: '/admin/shipments' // Changed to navigate to shipments page
        });
      });

      // Add recent contact forms to activities
      recentContactFormsData?.forEach(contact => {
        activities.push({
          type: 'contact_form',
          id: contact.id,
          title: 'Contact Form Submitted',
          description: `New inquiry from ${contact.name} (${contact.email})`,
          timestamp: contact.created_at,
          timeAgo: formatTimeAgo(contact.created_at),
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'text-green-400',
          href: '/admin/contact-forms' // Changed to navigate to contact forms page
        });
      });

      // Sort activities by timestamp and take 10 most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format time ago function
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  // Calculate percentage for stats
  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Handle add shipment
  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('shipments')
        .insert([{
          ...newShipment,
          tracking_number: newShipment.tracking_number || `CFE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          estimated_days: 3,
          scheduled_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        }]);
      
      if (error) throw error;
      
      setShowAddModal(false);
      setNewShipment({
        tracking_number: '',
        customer_name: '',
        customer_email: '',
        origin_state: '',
        destination_state: '',
        status: 'pending',
      });
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding shipment:', error);
    }
  };

  const quickLinks = [
    { title: 'Shipments', count: counts.shipments, icon: Package, color: 'bg-gradient-to-br from-blue-500 to-blue-600', href: '/admin/shipments' },
    { title: 'Contact Forms', count: counts.contactForms, icon: MessageSquare, color: 'bg-gradient-to-br from-green-500 to-green-600', href: '/admin/contact-forms' },
    { title: 'Consultation', count: counts.consultationRequests, icon: PhoneCall, color: 'bg-gradient-to-br from-purple-500 to-purple-600', href: '/admin/consultation-requests' },
    { title: 'Partner Apps', count: counts.partnerApplications, icon: Briefcase, color: 'bg-gradient-to-br from-yellow-500 to-yellow-600', href: '/admin/partner-applications' },
    { title: 'Freight Forms', count: counts.freightForms, icon: MessageCircle, color: 'bg-gradient-to-br from-red-500 to-red-600', href: '/admin/freight-forms' },
    { title: 'Users', count: counts.users, icon: Users, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', href: '/admin/users' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header Section */}
      <div className="p-4 lg:p-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-gray-400">
                Welcome back! Here's what's happening with your shipments and contacts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="flex items-center justify-center px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Shipment Statistics</h2>
            <div className="flex items-center text-green-400 text-sm">
              <Activity className="w-4 h-4 mr-2" />
              <span>Live Status</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Shipments */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Shipments</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 font-medium">
                    {calculatePercentage(stats.delivered, stats.total)}% Delivered
                  </span>
                </div>
              </div>
            </div>

            {/* Delivered */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-green-500/50 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.delivered}</div>
                  <div className="text-sm text-gray-400 mt-1">Delivered</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-300">
                  {stats.delivered === 0 ? 'No deliveries yet' : `${calculatePercentage(stats.delivered, stats.total)}% of total`}
                </div>
              </div>
            </div>

            {/* In Transit */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.inTransit}</div>
                  <div className="text-sm text-gray-400 mt-1">In Transit</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-300">
                  {stats.inTransit === 0 ? 'No shipments in transit' : 'Currently moving'}
                </div>
              </div>
            </div>

            {/* Delayed */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-red-500/50 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.delayed}</div>
                  <div className="text-sm text-gray-400 mt-1">Delayed</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-300">
                  {stats.delayed === 0 ? 'No delays' : `${calculatePercentage(stats.delayed, stats.total)}% of total`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Quick Links and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Links - Takes 2/3 on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Quick Access</h2>
                <div className="flex items-center text-gray-400 text-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <span>All Modules</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="group bg-gray-700/30 hover:bg-gray-700/50 rounded-xl p-5 border border-gray-600/50 hover:border-gray-500 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <link.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{link.count}</div>
                        <div className="text-xs text-gray-400">Total</div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{link.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-400">View Details</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity - Takes 1/3 on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <div className="flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>Real-time</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-1">Activity will appear here</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="group bg-gray-700/30 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 ${activity.color.replace('text-', 'bg-')}/20 rounded-lg flex items-center justify-center mt-1`}>
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {activity.timeAgo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600/50">
                        <span className="text-xs text-gray-500 capitalize">{activity.type.replace('_', ' ')}</span>
                        <Link
                          href={activity.href}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center group/link"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3 h-3 ml-1 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {recentActivity.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <Link
                    href="/admin/shipments"
                    className="flex items-center justify-center w-full py-2.5 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Activity
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Shipments Table */}
        <div className="mt-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Recent Shipments</h2>
                  <p className="text-sm text-gray-400 mt-1">Latest 5 shipments</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-auto"
                    />
                  </div>
                  <Link
                    href="/admin/shipments"
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {recentShipments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No shipments found</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first shipment to get started</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Create First Shipment
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Tracking #</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Route</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShipments.map((shipment) => (
                      <tr key={shipment.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-sm font-medium">{shipment.tracking_number}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{shipment.customer_name}</div>
                          <div className="text-xs text-gray-400">{shipment.customer_email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-3 h-3 text-green-400 mr-1" />
                            <span>{shipment.origin_state}</span>
                            <ChevronRight className="w-3 h-3 mx-2 text-gray-500" />
                            <MapPin className="w-3 h-3 text-red-400 mr-1" />
                            <span>{shipment.destination_state}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            shipment.status === 'in_transit' ? 'bg-yellow-500/20 text-yellow-400' :
                            shipment.status === 'delayed' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {shipment.status === 'in_transit' ? 'In Transit' : 
                             shipment.status === 'delivered' ? 'Delivered' :
                             shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(shipment.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimeAgo(shipment.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}