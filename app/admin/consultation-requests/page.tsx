'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { PhoneCall, Search, Edit, Trash2, RefreshCw, Eye } from 'lucide-react';

interface ConsultationRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  status: string;
}

export default function ConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => 
    request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading consultation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Consultation Requests</h2>
        <p className="text-gray-400">Manage and respond to consultation requests from potential clients.</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Requests ({filteredRequests.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{request.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{request.email}</div>
                    <div className="text-sm text-gray-400">{request.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{request.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      request.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                      request.status === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}