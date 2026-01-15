'use client';

import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Truck, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
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


  return (
    <main className="min-h-screen">
      {/* Hero Section */}
           <section id="home" className="relative min-h-screen pt-24 md:pt-32">
        <div className="absolute inset-0">
          <Image
            src="/fright.avif"
            alt="Modern freight trucks on highway"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your Freight <span className="text-blue-400">First</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed max-w-xl">
                <span className="font-bold">Premium LTL Transportation & Logistics Solutions</span>. 
                World-class network, advanced technology, and tailored services that put your 
                shipping needs first.
              </p>

              {/* Tracking Input */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-1 max-w-md mb-8 border border-white/20">
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-0">
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
                <div className="max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/20 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-white/20 rounded w-1/4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Result - Horizontal Layout */}
              {trackingResult && !isLoading && (
                <div className="max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20 shadow-2xl animate-fadeIn">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Left Section - Status & ID */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          trackingResult.status === 'delivered' ? 'bg-green-500/20' :
                          trackingResult.status === 'delayed' ? 'bg-red-500/20' :
                          trackingResult.status === 'in_transit' ? 'bg-blue-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          <Truck className={`w-6 h-6 ${
                            trackingResult.status === 'delivered' ? 'text-green-400' :
                            trackingResult.status === 'delayed' ? 'text-red-400' :
                            trackingResult.status === 'in_transit' ? 'text-blue-400' :
                            'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {trackingResult.status === 'delivered' ? 'Delivered Successfully' :
                             trackingResult.status === 'delayed' ? 'Delivery Delayed' :
                             trackingResult.status === 'in_transit' ? 'In Transit' :
                             'Processing'}
                          </h3>
                          <div className="text-sm text-blue-200">
                            Tracking ID: {trackingResult.tracking_number}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Route */}
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

                    {/* Right Section - Delivery Info */}
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

                  {/* Status Details - Full Width */}
                  {trackingResult.status === 'delayed' && trackingResult.delay_reason && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
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

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">99.8%</div>
                  <div className="text-xs md:text-sm text-gray-300">On-Time</div>
                </div>
                <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">Support</div>
                </div>
                <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">1,500+</div>
                  <div className="text-xs md:text-sm text-gray-300">Trucks</div>
                </div>
                <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">50+</div>
                  <div className="text-xs md:text-sm text-gray-300">States</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* Empower Your Freight Management */}
<section className="py-24 bg-gradient-to-b from-gray-50 via-white to-white overflow-hidden">
  <div className="container mx-auto px-6">

    {/* Heading */}
    <div className="max-w-4xl mx-auto text-center mb-20">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Empower Your <span className="text-blue-600">Freight Management</span>
      </h2>
      <p className="text-xl text-gray-600">
        Comprehensive logistics solutions designed to optimize your supply chain efficiency
      </p>
    </div>

    {/* Content + Image */}
    <div className="grid lg:grid-cols-2 gap-16 items-center">

      {/* LEFT CONTENT */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
          Mission-Critical LTL Freight Solutions
        </h3>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
          Precision-engineered logistics with guaranteed on-time pick-up and delivery,
          ensuring your shipments arrive exactly when needed.
        </p>

        <ul className="space-y-5">
          {[
            "Real-time GPS tracking and monitoring",
            "Damage-free freight shipping guarantee",
            "Transparent, accurate invoicing system",
          ].map((item, i) => (
            <li key={i} className="flex items-start text-gray-700 text-lg">
              <svg
                className="w-5 h-5 text-green-500 mt-1 mr-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 max-w-xl">
          <p className="text-gray-700 text-lg">
            We’ve built a national LTL freight network powered by advanced technology
            and operated by logistics experts focused on reliability, speed, and scale.
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE — BLENDED / TRANSPARENT */}
      <div className="relative">
        <div className="relative w-full max-w-2xl mx-auto">
          <Image
            src="/truck_new.png"
            alt="Prime FX Freight Truck"
            width={900}
            height={500}
            className="w-full h-auto object-contain "
            priority
            quality={100}
          />
        </div>
      </div>

    </div>
  </div>
</section>



      {/* Coast-to-Coast Network */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/coastal.avif"
                alt="Coast-to-coast network coverage"
                fill
                className="object-cover"
                quality={100}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Coast-to-Coast <span className="text-blue-400">Network</span>
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                We are a premier LTL freight provider across North America, offering extensive 
                coverage throughout the US and Canada. Our expansive network ensures reliable 
                service and comprehensive logistics solutions tailored to meet diverse shipping needs.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl font-bold text-blue-400 mb-2">1,000+</div>
                  <div className="text-gray-300">Professional Drivers</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl font-bold text-blue-400 mb-2">1,500+</div>
                  <div className="text-gray-300">Tractors & Trailers</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                  <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
                  <div className="text-gray-300">US ZIP Codes Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Versatile Capacity Solutions */}
      <section id="partner" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Versatile Capacity Solutions for <span className="text-blue-600">Every Load</span>
            </h2>
            <p className="text-xl text-gray-600">
              We're expanding our capacity to accommodate all customer needs, ensuring reliable 
              service regardless of shipment size. Our growth strategy prioritizes flexibility 
              and responsiveness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl font-bold text-blue-600 mb-4">80+</div>
              <div className="text-xl font-bold text-gray-900 mb-3">Service Centers</div>
              <p className="text-gray-600">Nationwide network of modern facilities</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl font-bold text-blue-600 mb-4">250+</div>
              <div className="text-xl font-bold text-gray-900 mb-3">Tractors Added</div>
              <p className="text-gray-600">Expanded fleet in 2023 for increased capacity</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl font-bold text-blue-600 mb-4">500+</div>
              <div className="text-xl font-bold text-gray-900 mb-3">Trailers Produced</div>
              <p className="text-gray-600">State-of-the-art equipment manufactured in 2023</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-3xl">
              <h3 className="text-3xl font-bold mb-6">Commitment to Customer Accountability</h3>
              <p className="text-xl mb-8">
                Our local representatives are intimately familiar with your market and industry, 
                collaborating closely with you to provide tailored services that align perfectly 
                with your unique timing and handling requirements.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold">Personalized Account Management</div>
                  <div className="text-blue-200">Dedicated support for your business</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 space-y-24">

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image */}
            <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/techno2.avif"
                alt="AI powered logistics optimization"
                fill
                className="object-cover"
                quality={100}
              />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Intelligent Tools Built for Scale
              </h3>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Easy-to-Use Shipper Tools
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>✔ Real-time tracking & shipment control</li>
                    <li>✔ Instant quotes and pickup requests</li>
                    <li>✔ Automated shipment data entry</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    AI-Powered Optimization
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>✔ Machine-learning route optimization</li>
                    <li>✔ Real-time freight flow management</li>
                    <li>✔ Dynamic pricing algorithms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      
      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <Image
                  src="/commitment.avif"
                  alt="Team commitment to excellence"
                  fill
                  className="object-cover"
                  quality={100}
                />
              </div>
              
              <div className="text-white">
                <div className="text-4xl font-bold mb-8 leading-tight">
                  "Our team's commitment creates exceptional value for customers"
                </div>
                <p className="text-xl mb-8">
                  PrimeFreight Logistics distinguishes itself through proactive problem-solving 
                  and preemptive initiatives, demonstrating an unwavering commitment to 
                  optimizing logistics operations and exceeding customer expectations.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold">AhmedKhan</div>
                    <div className="text-blue-200">Chief Operations Officer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Add CSS animation
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

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}