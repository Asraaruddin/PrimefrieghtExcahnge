'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  Package, MessageSquare, PhoneCall, Briefcase, 
  MessageCircle, Users, Truck, BarChart,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  Plus, X
} from 'lucide-react';
import Link from 'next/link';

// Define types for the counts
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
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShipment, setNewShipment] = useState({
    tracking_number: '',
    customer_name: '',
    customer_email: '',
    origin_state: '',
    destination_state: '',
    status: 'pending' as const,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all counts
      const [
        shipmentsRes,
        contactFormsRes,
        consultationRequestsRes,
        partnerApplicationsRes,
        freightFormsRes,
        usersRes,
      ] = await Promise.all([
        supabase.from('shipments').select('*', { count: 'exact', head: true }),
        supabase.from('contact_page_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('consultation_requests').select('*', { count: 'exact', head: true }),
        supabase.from('partner_application').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submission_freight').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      // Fetch shipment stats
      const { data: shipments } = await supabase
        .from('shipments')
        .select('status');

      const shipmentStats = {
        total: shipments?.length || 0,
        delivered: shipments?.filter(s => s.status === 'delivered').length || 0,
        inTransit: shipments?.filter(s => s.status === 'in_transit').length || 0,
        delayed: shipments?.filter(s => s.status === 'delayed').length || 0,
      };

      setCounts({
        shipments: shipmentsRes.count || 0,
        contactForms: contactFormsRes.count || 0,
        consultationRequests: consultationRequestsRes.count || 0,
        partnerApplications: partnerApplicationsRes.count || 0,
        freightForms: freightFormsRes.count || 0,
        users: usersRes.count || 0,
      });

      setStats(shipmentStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const quickLinks = [
    { title: 'Shipments', count: counts.shipments, icon: Package, color: 'bg-blue-500', href: '/admin/shipments' },
    { title: 'Contact Forms', count: counts.contactForms, icon: MessageSquare, color: 'bg-green-500', href: '/admin/contact-forms' },
    { title: 'Consultation', count: counts.consultationRequests, icon: PhoneCall, color: 'bg-purple-500', href: '/admin/consultation-requests' },
    { title: 'Partner Apps', count: counts.partnerApplications, icon: Briefcase, color: 'bg-yellow-500', href: '/admin/partner-applications' },
    { title: 'Freight Forms', count: counts.freightForms, icon: MessageCircle, color: 'bg-red-500', href: '/admin/freight-forms' },
    { title: 'Users', count: counts.users, icon: Users, color: 'bg-indigo-500', href: '/admin/users' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
            <p className="text-gray-400">Welcome to your admin dashboard. Here's what's happening.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Shipment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Shipments</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <div className="text-sm text-gray-400">Delivered</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold">{stats.delayed}</div>
              <div className="text-sm text-gray-400">Delayed</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <div className="text-sm text-gray-400">In Transit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">{link.count}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{link.title}</h3>
              <p className="text-gray-400 text-sm">View and manage {link.title.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <div className="flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>Live Updates</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">New shipment created</p>
                <p className="text-sm text-gray-400">Tracking #TRK-{Math.random().toString().slice(2, 8)}</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium">Contact form submitted</p>
                <p className="text-sm text-gray-400">New inquiry from customer</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">15 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}