'use client';

import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Truck, MapPin, Clock, ArrowRight, CheckCircle, AlertCircle, Package, Check } from 'lucide-react';

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTrackingResult(null);

    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Tracking ID not found. Please check and try again.');
        } else {
          setError('Error fetching tracking information.');
        }
        return;
      }

      if (data) {
        setTrackingResult(data);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTrackingNumber(value);
    setError('');
  };

  const resetTracking = () => {
    setTrackingNumber('');
    setTrackingResult(null);
    setError('');
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pickup Pending':
        return {
          title: 'Pickup Pending',
          bgColor: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          icon: <Package className="w-6 h-6" />
        };
      case 'Pick-up-complete':
        return {
          title: 'Pick-up Complete',
          bgColor: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          icon: <CheckCircle className="w-6 h-6" />
        };
      case 'in_transit':
        return {
          title: 'In Transit',
          bgColor: 'bg-purple-500/20',
          iconColor: 'text-purple-400',
          icon: <Truck className="w-6 h-6" />
        };
      case 'delayed':
        return {
          title: 'Delivery Delayed',
          bgColor: 'bg-red-500/20',
          iconColor: 'text-red-400',
          icon: <AlertCircle className="w-6 h-6" />
        };
      case 'delivered':
        return {
          title: 'Delivered Successfully',
          bgColor: 'bg-green-500/20',
          iconColor: 'text-green-400',
          icon: <Check className="w-6 h-6" />
        };
      case 'cancelled':
        return {
          title: 'Shipment Cancelled',
          bgColor: 'bg-gray-500/20',
          iconColor: 'text-gray-400',
          icon: <AlertCircle className="w-6 h-6" />
        };
      default:
        return {
          title: 'Processing',
          bgColor: 'bg-gray-500/20',
          iconColor: 'text-gray-400',
          icon: <Truck className="w-6 h-6" />
        };
    }
  };

  const statusInfo = trackingResult ? getStatusDisplay(trackingResult.status) : null;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen pt-24 md:pt-32">
        <div className="absolute inset-0">
          <Image
            src="/tracking.avif"
            alt="Premium freight tracking dashboard"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-900/50 to-gray-900/30"></div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-center">
                Track Your <span className="text-blue-400">Shipment</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed max-w-xl text-center">
                Enter your tracking number to get real-time updates on your shipment
              </p>

              {/* Tracking Input - EXACT SAME AS HOME */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-1 max-w-md mx-auto mb-8 border border-white/20">
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your tracking number"
                      className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      disabled={isLoading}
                    />
                    {trackingNumber && !isLoading && (
                      <button
                        type="button"
                        onClick={resetTracking}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !trackingNumber}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] whitespace-nowrap text-sm md:text-base min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tracking...
                      </span>
                    ) : 'Track'}
                  </button>
                </form>
                {error && (
                  <div className="mt-2 px-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Loading State - EXACT SAME AS HOME */}
              {isLoading && !trackingResult && (
                <div className="max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/20 animate-pulse mx-auto">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-white/20 rounded w-1/4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Result - EXACT SAME AS HOME */}
              {trackingResult && !isLoading && statusInfo && (
                <div className="max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20 shadow-2xl animate-fadeIn mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Left Section - Status & ID - UPDATED STATUS DISPLAY */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusInfo.bgColor}`}>
                          <div className={statusInfo.iconColor}>
                            {statusInfo.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {statusInfo.title}
                          </h3>
                          <div className="text-sm text-blue-200">
                            Tracking ID: {trackingResult.tracking_number}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Route - EXACT SAME AS HOME */}
                    <div className="flex-1 min-w-0 border-l border-r border-white/20 px-6">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <MapPin className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <div className="text-sm font-medium text-white">{trackingResult.origin_state}</div>
                          <div className="text-xs text-gray-300">From</div>
                        </div>
                        
                        <ArrowRight className="w-6 h-6 text-blue-300 mx-2" />
                        
                        <div className="text-center">
                          <MapPin className="w-6 h-6 text-red-400 mx-auto mb-2" />
                          <div className="text-sm font-medium text-white">{trackingResult.destination_state}</div>
                          <div className="text-xs text-gray-300">To</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Delivery Info - EXACT SAME AS HOME */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-400" />
                        <div>
                          <div className="text-lg font-bold text-white">
                            {trackingResult.estimated_days ? `${trackingResult.estimated_days} days` : 'Calculating...'}
                          </div>
                          <div className="text-sm text-blue-200">Estimated Delivery</div>
                          {trackingResult.scheduled_delivery && (
                            <div className="text-xs text-gray-300">
                              {new Date(trackingResult.scheduled_delivery).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Status Details - Full Width - EXACT SAME AS HOME */}
                  {trackingResult.status === 'delayed' && trackingResult.delay_reason && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-red-300 mb-1">Delay Alert</div>
                          <div className="text-sm text-gray-300">{trackingResult.delay_reason}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {trackingResult.status === 'delivered' && trackingResult.actual_delivery && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div className="text-sm text-green-300">
                          Delivered on {new Date(trackingResult.actual_delivery).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Add CSS animation - EXACT SAME AS HOME
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;

// Add styles to head - EXACT SAME AS HOME
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}