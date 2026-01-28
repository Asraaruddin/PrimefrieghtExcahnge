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

  const getTrackingProgress = (status: string) => {
    const stages = [
      {
        id: 'processing',
        label: 'Processing',
        icon: <Clock className="w-6 h-6" />,
        position: 0
      },
      {
        id: 'picked_up',
        label: 'Picked Up',
        icon: <Package className="w-6 h-6" />,
        position: 1
      },
      {
        id: 'in_transit',
        label: 'In Transit',
        icon: <Truck className="w-6 h-6" />,
        position: 2
      },
      {
        id: 'out_for_delivery',
        label: 'Out for Delivery',
        icon: <MapPin className="w-6 h-6" />,
        position: 3
      },
      {
        id: 'delivered',
        label: 'Delivered',
        icon: <Check className="w-6 h-6" />,
        position: 4
      }
    ];

    let currentPosition = 0;
    let progressPercentage = 0;
    let isDelayed = false;

    // Map status to position and calculate progress
    switch (status) {
      case 'Pickup Pending':
        currentPosition = 0;
        progressPercentage = 12.5; // Halfway to Picked Up
        break;
      case 'Pick-up-complete':
        currentPosition = 1;
        progressPercentage = 37.5; // Picked Up + halfway to In Transit
        break;
      case 'in_transit':
        currentPosition = 2;
        progressPercentage = 62.5; // In Transit + halfway to Out for Delivery
        break;
      case 'Out for Delivery':
  currentPosition = 3;
  progressPercentage = 87.5; // Out for Delivery + halfway to Delivered
  break;
      case 'delivered':
        currentPosition = 4;
        progressPercentage = 100; // Complete
        break;
      case 'delayed':
        currentPosition = 2; // Stuck in transit
        progressPercentage = 50; // Only to In Transit, no halfway progress
        isDelayed = true;
        break;
      case 'cancelled':
        currentPosition = 0;
        progressPercentage = 0;
        break;
      default:
        currentPosition = 0;
        progressPercentage = 12.5;
    }

    return {
      stages: stages.map((stage) => ({
        ...stage,
        isCompleted: stage.position < currentPosition,
        isCurrent: stage.position === currentPosition,
        isPending: stage.position > currentPosition
      })),
      progressPercentage,
      isDelayed
    };
  };

  const trackingProgress = trackingResult ? getTrackingProgress(trackingResult.status) : null;

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
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-center">
                Track Your <span className="text-blue-400">Shipment</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed max-w-xl mx-auto text-center">
                Enter your tracking number to get real-time updates on your shipment
              </p>

              {/* Tracking Input */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-1 max-w-md mx-auto mb-12 border border-white/20">
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

              {/* Loading State */}
              {isLoading && !trackingResult && (
                <div className="max-w-5xl bg-white/95 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-gray-200 animate-pulse mx-auto">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              )}

             {/* Tracking Result - Slim Real-time Progress Timeline */}
{trackingResult && !isLoading && trackingProgress && (
  <div className="max-w-3xl mx-auto mb-6 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-md shadow-sm p-5 animate-fadeIn">

    {/* Tracking ID */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs uppercase tracking-wider text-gray-500">
        Tracking Number
      </span>
      <span className="font-mono text-sm font-semibold text-gray-900">
        {trackingResult.tracking_number}
      </span>
    </div>

    {/* Progress Timeline */}
    <div className="relative mb-6">

      {/* Background Line */}
      <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            trackingProgress.isDelayed ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${trackingProgress.progressPercentage}%` }}
        />
      </div>

      {/* Stages */}
      <div className="relative flex justify-between">
        {trackingProgress.stages.map((stage) => (
          <div
            key={stage.id}
            className="flex flex-col items-center w-1/5"
          >
            {/* Stage Circle */}
            <div
              className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-all
                ${
                  stage.isCompleted
                    ? trackingProgress.isDelayed
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-green-500 border-green-500 text-white'
                    : stage.isCurrent
                    ? trackingProgress.isDelayed
                      ? 'bg-red-500 border-red-500 text-white animate-pulse-slow'
                      : 'bg-white border-green-500 text-green-600 ring-2 ring-green-200 animate-pulse-slow'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
            >
              {stage.icon}
            </div>

            {/* Stage Label (UNCHANGED TEXT) */}
            <span
              className={`mt-2 text-[11px] text-center font-medium
                ${
                  stage.isCompleted || stage.isCurrent
                    ? trackingProgress.isDelayed
                      ? 'text-red-600'
                      : 'text-gray-900'
                    : 'text-gray-400'
                }`}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Status Messages - Slim Bars */}

    {trackingResult.status === 'delayed' && trackingResult.delay_reason && (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        <AlertCircle className="h-4 w-4" />
        <span>{trackingResult.delay_reason}</span>
      </div>
    )}

    {trackingResult.status === 'delivered' && trackingResult.actual_delivery && (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
        <CheckCircle className="h-4 w-4" />
        <span>
          Delivered on{' '}
          {new Date(trackingResult.actual_delivery).toLocaleDateString('en-US')}
        </span>
      </div>
    )}

    {trackingResult.status === 'cancelled' && (
      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
        <AlertCircle className="h-4 w-4" />
        <span>Shipment cancelled. Contact support.</span>
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

// Add CSS animations
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}