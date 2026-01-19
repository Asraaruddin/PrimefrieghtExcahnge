'use client';

import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Truck, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const [currentImage] = useState('/fright.avif');

  return (
    <>
      {/* SEO Meta Tags and Structured Data */}
      <Head>
        <title>Central Freight Express | Premium LTL Shipping & Logistics Solutions</title>
        <meta 
          name="description" 
          content="Industry-leading LTL freight solutions with nationwide coverage, real-time tracking, and dedicated support for your shipping needs. 99.8% on-time delivery." 
        />
        <meta name="keywords" content="LTL shipping, freight logistics, nationwide shipping, freight management, logistics solutions, trucking services, freight transportation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.centralfreightexpress.com" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Central Freight Express | Premium LTL Shipping" />
        <meta property="og:description" content="Industry-leading LTL freight solutions with nationwide coverage and real-time tracking." />
        <meta property="og:url" content="https://www.centralfreightexpress.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/fright.avif" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Central Freight Express | Premium LTL Shipping" />
        <meta name="twitter:description" content="Nationwide LTL freight solutions with 99.8% on-time delivery." />
        
        {/* Structured Data for Logistics Business */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LogisticsBusiness",
            "name": "Central Freight Express",
            "alternateName": "PrimeLog",
            "url": "https://www.centralfreightexpress.com",
            "logo": "https://www.centralfreightexpress.com/logo.png",
            "description": "Premium LTL Transportation & Logistics Solutions with nationwide coverage.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "serviceArea": {
              "@type": "GeoShape",
              "description": "Nationwide coverage across United States"
            },
            "serviceType": ["LTL Shipping", "Freight Logistics", "Transportation"],
            "slogan": "Your Freight First"
          })}
        </script>
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen pt-24 md:pt-32">
          <div className="absolute inset-0">
            <Image
              src={currentImage}
              alt="Modern freight trucks on highway - Central Freight Express LTL shipping services"
              fill
              className="object-cover"
              priority
              quality={100}
              sizes="100vw"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/50 to-gray-900/40"></div>
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Your Freight <span className="text-blue-400">First</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed max-w-xl">
                  <strong>Premium LTL Transportation & Logistics Solutions</strong>. 
                  World-class network, advanced technology, and tailored services that put your 
                  shipping needs first.
                </p>

                {/* Stats with Schema.org compatibility */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl" itemScope itemType="https://schema.org/AggregateRating">
                  <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                    <div className="text-xl md:text-2xl font-bold text-white mb-1" itemProp="ratingValue">99.8%</div>
                    <div className="text-xs md:text-sm text-gray-300" itemProp="name">On-Time Delivery</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-white mb-1">Dedicated</div>
                    <div className="text-xs md:text-sm text-gray-300">Support Team</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-white mb-1" itemProp="itemReviewed">1,500+</div>
                    <div className="text-xs md:text-sm text-gray-300">Trucks Fleet</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-white mb-1">50+</div>
                    <div className="text-xs md:text-sm text-gray-300">States Coverage</div>
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
                        aria-hidden="true"
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
                    We've built a national LTL freight network powered by advanced technology
                    and operated by logistics experts focused on reliability, speed, and scale.
                  </p>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="relative">
                <div className="relative w-full max-w-2xl mx-auto">
                  <Image
                    src="/homepage.png"
                    alt="Central Freight Express LTL freight truck and logistics operations"
                    width={900}
                    height={500}
                    className="w-full h-auto object-contain"
                    priority={false}
                    quality={90}
                    loading="lazy"
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
                  alt="Central Freight Express nationwide coast-to-coast network coverage map"
                  fill
                  className="object-cover"
                  quality={90}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
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
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* IMAGE */}
              <div className="flex justify-center">
                <Image
                  src="/newpic.png"
                  alt="Central Freight Express AI-powered logistics optimization dashboard"
                  width={540}
                  height={440}
                  quality={90}
                  className="w-full max-w-xl object-contain"
                  loading="lazy"
                />
              </div>

              {/* CONTENT */}
              <div className="space-y-12">
                {/* Heading */}
                <div className="space-y-4">
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    Intelligent Tools Built for Scale
                  </h3>
                  <p className="text-gray-600 text-lg max-w-xl">
                    Purpose-built technology that simplifies shipping operations
                    while intelligently optimizing logistics at scale.
                  </p>
                </div>

                {/* Feature Block 1 */}
                <div className="space-y-4 border-l-4 border-blue-600 pl-6">
                  <h4 className="text-xl font-semibold text-gray-900">
                    Easy-to-Use Shipper Tools
                  </h4>
                  <ul className="space-y-3 text-gray-700 text-base">
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                      Real-time tracking & shipment control
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                      Instant quotes and pickup requests
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                      Automated shipment data entry
                    </li>
                  </ul>
                </div>

                {/* Feature Block 2 */}
                <div className="space-y-4 border-l-4 border-gray-300 pl-6">
                  <h4 className="text-xl font-semibold text-gray-900">
                    AI-Powered Optimization
                  </h4>
                  <ul className="space-y-3 text-gray-700 text-base">
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-500" />
                      Machine-learning route optimization
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-500" />
                      Real-time freight flow management
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-gray-500" />
                      Dynamic pricing algorithms
                    </li>
                  </ul>
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
                    alt="Central Freight Express team commitment to logistics excellence"
                    fill
                    className="object-cover"
                    quality={90}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                <div className="text-white">
                  <blockquote className="text-4xl font-bold mb-8 leading-tight">
                    "Our team's commitment creates exceptional value for customers"
                  </blockquote>
                  <p className="text-xl mb-8">
                    Central Freight Express distinguishes itself through proactive problem-solving 
                    and preemptive initiatives, demonstrating an unwavering commitment to 
                    optimizing logistics operations and exceeding customer expectations.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold">David John</div>
                      <div className="text-blue-200">Chief Operations Officer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}