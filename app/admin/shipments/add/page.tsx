'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Save, X, Truck, MapPin, Calendar, Clock, User, Mail, Phone, Navigation, Home, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddShipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [shipment, setShipment] = useState({
    tracking_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    origin_state: '',
    origin_address: '',
    destination_state: '',
    destination_address: '',
    estimated_days: 5,
    scheduled_pickup: new Date().toISOString().split('T')[0],
    scheduled_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending' as const,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate tracking number if not provided
      const trackingNumber = shipment.tracking_number || 
        `PRIME-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Prepare the shipment data with the two new fields
      const shipmentData = {
        tracking_number: trackingNumber,
        customer_name: shipment.customer_name,
        customer_email: shipment.customer_email || null,
        customer_phone: shipment.customer_phone || null,
        origin_state: shipment.origin_state,
        origin_address: shipment.origin_address,
        destination_state: shipment.destination_state,
        destination_address: shipment.destination_address,
        estimated_days: shipment.estimated_days,
        scheduled_pickup: shipment.scheduled_pickup ? new Date(shipment.scheduled_pickup).toISOString() : null,
        scheduled_delivery: new Date(shipment.scheduled_delivery).toISOString(),
        status: shipment.status,
        notes: shipment.notes || null,
      };

      console.log('Submitting shipment data:', shipmentData);

      const { data, error } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(error.message || 'Failed to add shipment');
      }

      console.log('Shipment added successfully:', data);
      alert('Shipment added successfully!');
      router.push('/admin/shipments');
      router.refresh();
    } catch (error: any) {
      console.error('Error adding shipment:', error);
      alert(`Failed to add shipment: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShipment(prev => ({
      ...prev,
      [name]: name === 'estimated_days' ? parseInt(value) || 1 : value
    }));
  };

  // US States for dropdown
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Add New Shipment</h1>
            <p className="text-gray-400">Create a new shipment with customer details and route information</p>
          </div>
          <Link
            href="/admin/shipments"
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="ml-2">Cancel</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Customer Information
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customer_name"
                value={shipment.customer_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Email
              </label>
              <input
                type="email"
                name="customer_email"
                value={shipment.customer_email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Phone
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={shipment.customer_phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tracking Number (Auto-generate if empty)
              </label>
              <input
                type="text"
                name="tracking_number"
                value={shipment.tracking_number}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty for auto-generation"
              />
            </div>

            {/* Route Information */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Navigation className="w-5 h-5 mr-2 text-green-400" />
                Route Information
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Origin State *
              </label>
              <select
                name="origin_state"
                value={shipment.origin_state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Origin State</option>
                {usStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination State *
              </label>
              <select
                name="destination_state"
                value={shipment.destination_state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Destination State</option>
                {usStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Home className="w-4 h-4 mr-2 text-green-400" />
                Origin Address *
              </label>
              <input
                type="text"
                name="origin_address"
                value={shipment.origin_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main St, City, ZIP Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Building className="w-4 h-4 mr-2 text-red-400" />
                Destination Address *
              </label>
              <input
                type="text"
                name="destination_address"
                value={shipment.destination_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="456 Oak Ave, City, ZIP Code"
              />
            </div>

            {/* Scheduling */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
                Scheduling & Transit
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Transit Days *
              </label>
              <input
                type="number"
                name="estimated_days"
                value={shipment.estimated_days}
                onChange={handleChange}
                min="1"
                max="30"
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled Pickup Date
              </label>
              <input
                type="date"
                name="scheduled_pickup"
                value={shipment.scheduled_pickup}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled Delivery Date *
              </label>
              <input
                type="date"
                name="scheduled_delivery"
                value={shipment.scheduled_delivery}
                onChange={handleChange}
                required
                min={shipment.scheduled_pickup}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Status
              </label>
              <select
                name="status"
                value={shipment.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delayed">Delayed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                Additional Information
              </h2>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes & Instructions
              </label>
              <textarea
                name="notes"
                value={shipment.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any special instructions, notes, or details about this shipment..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/shipments"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Add Shipment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}