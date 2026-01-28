'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  X, Calendar, Clock, User, Mail, Phone, 
  Navigation, Home, Building, Eye, CheckCircle, Package, 
  AlertCircle, Loader2, FileText, Shield, Tag,
  RefreshCw, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Type definitions
type ShipmentStatus = 'Pickup Pending' | 'in_transit' | 'Out for Delivery' | 'delayed' | 'delivered' | 'cancelled' | 'Pick-up-complete';

interface ShipmentData {
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  origin_state: string;
  origin_address: string;
  destination_state: string;
  destination_address: string;
  estimated_days: number;
  scheduled_pickup: string;
  scheduled_delivery: string;
  status: ShipmentStatus;
  notes: string;
  delay_reason: string;
}

export default function AddShipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [generatingTracking, setGeneratingTracking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [shipment, setShipment] = useState<ShipmentData>({
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
    status: 'Pickup Pending',
    notes: '',
    delay_reason: ''
  });

  // Function to generate tracking number WITHOUT leading zeros
  const generateTrackingNumber = async (): Promise<string> => {
    try {
      setGeneratingTracking(true);
      setError(null);
      
      // Try to get the next tracking number from the database function
      const { data, error: rpcError } = await supabase
        .rpc('get_next_tracking_id');
      
      if (rpcError) {
        console.error('Error calling tracking number function:', rpcError);
        // Fallback: Generate based on existing records
        return await generateTrackingFromRecords();
      }
      
      if (data) {
        return data;
      }
      
      // If function returned null, use fallback
      return await generateTrackingFromRecords();
      
    } catch (error) {
      console.error('Error generating tracking number:', error);
      setError('Failed to generate tracking number. Please try again.');
      return await generateTrackingFromRecords();
    } finally {
      setGeneratingTracking(false);
    }
  };

  // Fallback: Generate based on existing records WITHOUT leading zeros
  const generateTrackingFromRecords = async (): Promise<string> => {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `CF24${currentYear}`;
      
      // Get all tracking numbers for this year
      const { data, error: queryError } = await supabase
        .from('shipments')
        .select('tracking_number')
        .like('tracking_number', `${prefix}%`);
      
      if (queryError) {
        console.error('Error querying shipments:', queryError);
        // Emergency fallback
        return generateEmergencyFallback();
      }
      
      if (!data || data.length === 0) {
        // Start with 1 for this year (no leading zeros)
        return `${prefix}1`;
      }
      
      // Extract sequence numbers and find the maximum
      let maxSequence = 0;
      
      data.forEach(item => {
        const tracking = item.tracking_number;
        if (tracking.startsWith(prefix)) {
          const sequenceStr = tracking.substring(prefix.length);
          const sequence = parseInt(sequenceStr);
          if (!isNaN(sequence) && sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      });
      
      const nextSequence = maxSequence + 1;
      
      // Check if we exceed 999
      if (nextSequence > 999) {
        setError('Warning: Sequence numbers for this year have exceeded 999. Using emergency fallback.');
        return generateEmergencyFallback();
      }
      
      return `${prefix}${nextSequence}`;
      
    } catch (error) {
      console.error('Error in generateTrackingFromRecords:', error);
      return generateEmergencyFallback();
    }
  };

  // Emergency fallback generation WITHOUT leading zeros
  const generateEmergencyFallback = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    // Generate random number between 100 and 999
    const random = Math.floor(Math.random() * 900) + 100;
    return `CF24${year}${random}`;
  };

  // Generate tracking number on component mount
  useEffect(() => {
    const generateInitialTracking = async () => {
      const trackingNumber = await generateTrackingNumber();
      setShipment(prev => ({
        ...prev,
        tracking_number: trackingNumber
      }));
    };
    
    generateInitialTracking();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to regenerate tracking number
  const handleRegenerateTracking = async () => {
    const newTracking = await generateTrackingNumber();
    setShipment(prev => ({
      ...prev,
      tracking_number: newTracking
    }));
  };

  // Handle form preview
  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    const requiredFields: (keyof ShipmentData)[] = [
      'customer_name',
      'origin_state',
      'origin_address',
      'destination_state',
      'destination_address',
      'estimated_days',
      'scheduled_delivery'
    ];
    
    const missingFields = requiredFields.filter(field => !shipment[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate tracking number format
    if (!shipment.tracking_number) {
      setError('Tracking number is required. Please wait for it to generate or regenerate.');
      return;
    }
    
    // Updated regex: CF24 + 4 digit year + 1-3 digit sequence (no leading zeros)
    const trackingRegex = /^CF24\d{4}\d{1,3}$/;
    if (!trackingRegex.test(shipment.tracking_number)) {
      setError('Tracking number format is invalid. Expected format: CF24YYYYNNN (no leading zeros)');
      return;
    }
    
    // Validate year in tracking number matches current year
    const currentYear = new Date().getFullYear();
    const yearFromTracking = parseInt(shipment.tracking_number.substring(4, 8));
    
    if (yearFromTracking !== currentYear) {
      setError(`Tracking number year (${yearFromTracking}) doesn't match current year (${currentYear}). Please regenerate.`);
      return;
    }
    
    // Validate sequence is between 1 and 999
    const sequenceStr = shipment.tracking_number.substring(8);
    const sequence = parseInt(sequenceStr);
    
    if (isNaN(sequence) || sequence < 1 || sequence > 999) {
      setError('Tracking number sequence must be between 1 and 999. Please regenerate.');
      return;
    }
    
    setReviewOpen(true);
  };

  // Handle form submission
  const handleConfirmSubmit = async () => {
    setSubmitLoading(true);
    setError(null);
    
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please log in again.');
        router.push('/login');
        return;
      }

      // Double-check if tracking number already exists
      const { data: existing, error: checkError } = await supabase
        .from('shipments')
        .select('id')
        .eq('tracking_number', shipment.tracking_number)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking tracking number:', checkError);
      }

      if (existing) {
        // Tracking number exists, generate a new one
        setError('This tracking number already exists. Generating a new one...');
        const newTracking = await generateTrackingNumber();
        setShipment(prev => ({
          ...prev,
          tracking_number: newTracking
        }));
        
        // Retry with new tracking number
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => handleConfirmSubmit(), 1000);
        return;
      }

      // Prepare the shipment data
      const shipmentData = {
        tracking_number: shipment.tracking_number,
        customer_name: shipment.customer_name,
        customer_email: shipment.customer_email || null,
        customer_phone: shipment.customer_phone || null,
        origin_state: shipment.origin_state,
        origin_address: shipment.origin_address || null,
        destination_state: shipment.destination_state,
        destination_address: shipment.destination_address || null,
        estimated_days: shipment.estimated_days,
        scheduled_pickup: shipment.scheduled_pickup ? new Date(shipment.scheduled_pickup).toISOString() : null,
        scheduled_delivery: new Date(shipment.scheduled_delivery).toISOString(),
        status: shipment.status,
        notes: shipment.notes || null,
        delay_reason: shipment.delay_reason || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select();

      if (insertError) {
        console.error('Supabase error details:', insertError);
        
        if (insertError.message.includes('JWT') || insertError.message.includes('auth')) {
          setError('Authentication error. Please log in again.');
          router.push('/login');
          return;
        }
        
        if (insertError.message.includes('tracking_number_key')) {
          setError('Tracking number already exists. Generating a new one...');
          const newTracking = await generateTrackingNumber();
          setShipment(prev => ({
            ...prev,
            tracking_number: newTracking
          }));
          setReviewOpen(false);
          setSubmitLoading(false);
          return;
        }
        
        if (insertError.message.includes('status_check')) {
          setError('Invalid status value. Please select a valid status.');
          setReviewOpen(false);
          setSubmitLoading(false);
          return;
        }
        
        throw new Error(insertError.message || 'Failed to add shipment');
      }

      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-green-600 text-white flex items-center space-x-2 animate-pulse';
      notification.innerHTML = `
        <span class="text-lg">✓</span>
        <span>Shipment ${shipment.tracking_number} added successfully!</span>
      `;
      document.body.appendChild(notification);
      
      // Redirect after 2 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        notification.remove();
        router.push('/admin/shipments');
        router.refresh();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error adding shipment:', error);
      setError(`Failed to add shipment: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setError(null);
    
    setShipment(prev => ({
      ...prev,
      [name]: name === 'estimated_days' ? parseInt(value) || 1 : value
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color for UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'in_transit': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Out for Delivery': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delayed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Pickup Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Pick-up-complete': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'cancelled': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Format status for display
  const getStatusDisplay = (status: string) => {
    return status.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

  // Handle clear all form data
  const handleClearAll = async () => {
    setReviewOpen(false);
    // Generate new tracking number first
    const newTracking = await generateTrackingNumber();
    // Reset form with new tracking number
    setShipment({
      tracking_number: newTracking,
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
      status: 'Pickup Pending',
      notes: '',
      delay_reason: ''
    });
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Add New Shipment
            </h1>
            <p className="text-gray-400">Create a new shipment with auto-generated tracking ID</p>
          </div>
          <Link
            href="/admin/shipments"
            className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <X className="w-5 h-5" />
            <span className="ml-2">Cancel</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handlePreview}>
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
                <span className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-400" />
                  Tracking Number (Auto-generated)
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateTracking}
                  disabled={generatingTracking || submitLoading}
                  className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg flex items-center transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${generatingTracking ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tracking_number"
                  value={shipment.tracking_number}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono cursor-not-allowed"
                />
                {generatingTracking && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: CF24YYYYN (Auto-generated, no leading zeros, e.g., CF2420261, CF2420262, ..., CF24202699, CF242026100)
              </p>
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-colors disabled:opacity-50"
              >
                <option value="Pickup Pending">Pickup Pending</option>
                <option value="Pick-up-complete">Pick-up Complete</option>
                <option value="in_transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="delayed">Delayed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Status & Delay Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-400" />
                Status Details
              </h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delay Reason (if delayed)
              </label>
              <textarea
                name="delay_reason"
                value={shipment.delay_reason}
                onChange={handleChange}
                rows={2}
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
                placeholder="Reason for delay (if applicable)"
              />
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
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
                disabled={submitLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 hover:border-gray-600 disabled:opacity-50"
                placeholder="Add any special instructions, notes, or details about this shipment..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/shipments"
            className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || generatingTracking || submitLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 hover:scale-105 flex items-center disabled:opacity-50"
          >
            {generatingTracking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Tracking ID...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Preview & Add
              </>
            )}
          </button>
        </div>
      </form>

      {/* Review Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-400" />
                  Review Shipment Details
                </h3>
                <p className="text-sm text-gray-400">Please review all details before confirming</p>
              </div>
              <button
                onClick={() => setReviewOpen(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                disabled={submitLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Header Info */}
                <div className="md:col-span-2 bg-blue-500/10 rounded-xl p-4 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-3 md:mb-0">
                      <div className="text-lg font-bold text-blue-400 font-mono">
                        {shipment.tracking_number}
                      </div>
                      <div className="text-sm text-gray-400">Tracking Number</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-4 py-2 rounded-lg border ${getStatusColor(shipment.status)}`}>
                        <span className="text-sm font-semibold">{getStatusDisplay(shipment.status)}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Est. {shipment.estimated_days} days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Customer Name</div>
                      <div className="text-white font-medium">{shipment.customer_name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white">{shipment.customer_email || 'Not provided'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Phone</div>
                      <div className="text-white">{shipment.customer_phone || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center">
                    <Navigation className="w-5 h-5 mr-2 text-green-400" />
                    Route Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Home className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Origin</div>
                        <div className="text-white font-medium">{shipment.origin_state}</div>
                        <div className="text-sm text-gray-400">{shipment.origin_address}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Building className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Destination</div>
                        <div className="text-white font-medium">{shipment.destination_state}</div>
                        <div className="text-sm text-gray-400">{shipment.destination_address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
                    Timing Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Scheduled Pickup</div>
                        <div className="text-white">{shipment.scheduled_pickup ? formatDate(shipment.scheduled_pickup) : 'Not scheduled'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Scheduled Delivery</div>
                        <div className="text-white">{formatDate(shipment.scheduled_delivery)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Estimated Transit</div>
                        <div className="text-white">{shipment.estimated_days} days</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Delay */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-400" />
                    Status Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(shipment.status).split(' ')[0]}`}>
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Status</div>
                        <div className={`font-semibold ${getStatusColor(shipment.status).split(' ')[1]}`}>
                          {getStatusDisplay(shipment.status)}
                        </div>
                      </div>
                    </div>
                    
                    {shipment.status === 'delayed' && shipment.delay_reason && (
                      <div className="bg-red-500/10 rounded-xl p-4 mt-2">
                        <div className="text-sm font-medium text-gray-300">Delay Reason:</div>
                        <div className="text-red-300 text-sm">{shipment.delay_reason}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {shipment.notes && (
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-400" />
                      Additional Notes
                    </h4>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                      <div className="text-gray-300 whitespace-pre-line">{shipment.notes}</div>
                    </div>
                  </div>
                )}

                {/* Summary Card */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Package className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-300">Shipment Summary</div>
                        <div className="text-white font-medium">Ready for Creation</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-700/50 flex justify-between space-x-3">
              <button
                onClick={() => setReviewOpen(false)}
                disabled={submitLoading}
                className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearAll}
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm & Create Shipment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}