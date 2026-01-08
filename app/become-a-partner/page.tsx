'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { 
  Truck, Shield, Mail, Users, Building2, Globe, Target, BarChart, 
  CheckCircle, ArrowRight, Handshake, TrendingUp, Headphones, 
  Award, Clock, DollarSign, MapPin, Phone, FileText, Briefcase,
  Package, Warehouse, Route, Cpu, Network, Zap
} from 'lucide-react';

export default function BecomeAPartner() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    companyOverview: '',
    message: ''
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Partner application submitted:', formData);
    alert('Thank you for your partnership application! Our team will review it and contact you within 24 hours.');
    setFormData({
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      phone: '',
      website: '',
      companyOverview: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section - Simple, Clean, with Visible Background */}
        <section ref={heroRef} className="relative min-h-screen pt-24 md:pt-32">
          {/* Option 1: Using div with background image (no Next.js optimization) */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 transition-transform duration-1000 ease-out"
              style={{
                transform: `scale(${1 + scrollProgress * 0.03})`,
                backgroundImage: 'url(/business-partner2.avif)', // Renamed without space
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Very light overlay just for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </div>
          
          {/* Option 2: Using Next.js Image Component (Better Performance) */}
          {/* Uncomment this and comment out the above div if you want better image optimization */}
          {/*
          <div className="absolute inset-0">
            <Image
              src="/business-partner.avif"
              alt="Business partnership meeting"
              fill
              className="object-cover transition-transform duration-1000 ease-out"
              style={{
                transform: `scale(${1 + scrollProgress * 0.03})`,
              }}
              priority
              quality={100}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </div>
          */}
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                {/* Minimal strong content */}
                <div className="mb-8">
                  <span className="inline-block px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full text-white font-bold text-sm">
                    EXCLUSIVE PARTNERSHIP
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Grow <span className="text-blue-300">Together</span>
                </h1>
                
                <p className="text-xl text-white mb-10 leading-relaxed font-medium drop-shadow-lg">
                  Join the leading logistics network and transform your business.
                </p>

                {/* Simple CTA */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    href="#apply"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    Apply Now
                  </Link>
                  <Link
                    href="#benefits"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 border border-white/30 text-center"
                  >
                    Learn More
                  </Link>
                </div>

       
              </div>
            </div>
          </div>
        </section>

        {/* Rest of your page content remains the same */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Become a Partner with <span className="text-blue-600">PrimeLog Logistics</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Join our network of strategic partners and transform your logistics business
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <div>
                  <div className="text-5xl font-bold text-blue-600 mb-6">01</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Strategic Partnership Excellence
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    At PrimeLog Logistics, we understand the immense value of strategic partnerships 
                    in delivering exceptional service to our customers. That's why we're actively seeking 
                    dynamic partners—including individual entrepreneurs, sole proprietors, and established 
                    companies—to join our elite network.
                  </p>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    By joining forces with us, you can offer your customers competitive and reliable 
                    international and domestic small package service options. Together, we can expand 
                    your service offerings, enhance customer satisfaction, and drive mutual growth 
                    in the ever-evolving logistics industry. Let's collaborate to deliver excellence 
                    and stay ahead in the market.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        Access to premium LTL freight network
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        Real-time tracking and shipment management
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        Dedicated partner support team
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/fright3.avif"
                    alt="Modern freight operations with partners"
                    fill
                    className="object-cover"
                    quality={100}
                  />
                </div>
              </div>

              {/* Bridge the Gap Section */}
              <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-3xl p-8 md:p-12 mb-20">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="text-5xl font-bold text-blue-600 mb-6">02</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Bridge the Service Gap, Boost Your Revenue
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Many companies excel in offering comprehensive transportation solutions 
                      but often lack highly profitable international and domestic small package 
                      services. PrimeLog Logistics bridges this critical gap for you.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <p className="text-gray-600">
                      Our partnership allows you to seamlessly integrate these vital services 
                      into your portfolio, creating additional revenue streams while we handle 
                      the logistics. Focus on growing your core business while we manage your 
                      shipping needs with precision and reliability.
                    </p>
                    <div className="mt-4 flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="font-bold text-green-600">Average 40% Revenue Increase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner With Us - Business Explanation */}
        <section id="benefits" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  How We Help Your Business <span className="text-blue-600">Grow</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Our partnership model is designed to accelerate your success
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                    <Globe className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Expand Your Reach</h3>
                  <p className="text-gray-600 mb-6">
                    Access our extensive North American network with 95% US ZIP code coverage and 
                    international shipping capabilities.
                  </p>
                  <div className="text-blue-600 font-bold">1500+ Truck Fleet</div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl flex items-center justify-center mb-6 border border-green-100">
                    <DollarSign className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Increase Revenue</h3>
                  <p className="text-gray-600 mb-6">
                    Competitive commission structure with tiered rewards. Earn more as you grow 
                    with our partnership program.
                  </p>
                  <div className="text-green-600 font-bold">Up to 25% Commission</div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-xl flex items-center justify-center mb-6 border border-purple-100">
                    <Cpu className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Technology</h3>
                  <p className="text-gray-600 mb-6">
                    Utilize our proprietary logistics platform with real-time tracking, automated 
                    quoting, and API integration.
                  </p>
                  <div className="text-purple-600 font-bold">24/7 Tech Support</div>
                </div>
              </div>

              {/* Business Model Explanation */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-white">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold mb-6">
                      Our Business Model: <span className="text-blue-200">Partnership & Growth</span>
                    </h3>
                    <p className="text-blue-100 mb-8 leading-relaxed">
                      At PrimeLog Logistics, we believe in building lasting relationships that benefit 
                      both parties. Our partnership model is built on three key pillars:
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Shared Success</h4>
                          <p className="text-blue-200 text-sm">
                            Your growth is our growth. We succeed when you succeed.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Risk Management</h4>
                          <p className="text-blue-200 text-sm">
                            Comprehensive insurance and liability protection for all partnered shipments.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BarChart className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Performance Analytics</h4>
                          <p className="text-blue-200 text-sm">
                            Detailed reporting and insights to optimize your operations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h4 className="text-2xl font-bold mb-6">Partnership Benefits</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-blue-100">Commission Rate</span>
                        <span className="font-bold">15-25%</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-blue-100">Insurance Coverage</span>
                        <span className="font-bold">$5 Million</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-blue-100">Support Response</span>
                        <span className="font-bold">24/7 Available</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-blue-100">Training Provided</span>
                        <span className="font-bold">Complete Onboarding</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Tiers */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Partnership <span className="text-blue-600">Tiers</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Choose the partnership level that matches your business goals
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <div className="text-center mb-8">
                    <div className="text-sm font-bold text-blue-600 mb-2">TIER 1</div>
                    <h3 className="text-2xl font-bold text-gray-900">Emerging Partner</h3>
                    <div className="text-4xl font-bold text-gray-900 mt-4">$10K+</div>
                    <div className="text-gray-500">Annual Volume</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Basic LTL Services
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Online Tracking
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Standard Support
                    </li>
                  </ul>
                  <button className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors">
                    Learn More
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-2xl relative transform scale-105">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="text-center mb-8">
                    <div className="text-sm font-bold text-blue-600 mb-2">TIER 2</div>
                    <h3 className="text-2xl font-bold text-gray-900">Strategic Partner</h3>
                    <div className="text-4xl font-bold text-gray-900 mt-4">$50K+</div>
                    <div className="text-gray-500">Annual Volume</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      All LTL Services
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Advanced Tracking
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Dedicated Account Manager
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Volume Discounts
                    </li>
                  </ul>
                  <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <div className="text-center mb-8">
                    <div className="text-sm font-bold text-blue-600 mb-2">TIER 3</div>
                    <h3 className="text-2xl font-bold text-gray-900">Enterprise Partner</h3>
                    <div className="text-4xl font-bold text-gray-900 mt-4">$200K+</div>
                    <div className="text-gray-500">Annual Volume</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Full Service Suite
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      API Integration
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Custom Solutions
                    </li>
                    <li className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Priority Support
                    </li>
                  </ul>
                  <button className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Talk to Our Experts */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-950 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8">
                    Talk to Our <span className="text-blue-400">Experts</span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Schedule a consultation with our partnership development team to discuss 
                    how we can help grow your business.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                        <Headphones className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Dedicated Support</h4>
                        <p className="text-gray-300">
                          Your personal account manager will guide you through the entire process
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Growth Strategy</h4>
                        <p className="text-gray-300">
                          Customized growth plan based on your business objectives
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                        <Award className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Premium Training</h4>
                        <p className="text-gray-300">
                          Comprehensive onboarding and continuous training programs
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10">
                    <Link
                      href="tel:+13165551234"
                      className="inline-flex items-center space-x-3 text-white font-bold text-lg hover:text-blue-300 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call Now: (316) 555-1234</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6">Schedule a Consultation</h3>
                  <p className="text-gray-300 mb-8">
                    Fill out this quick form and we'll contact you within 24 hours to schedule 
                    a personalized consultation.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Your Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Business Email *</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="john@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                      Request Consultation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Application Form */}
        <section id="apply" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl mb-6">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Partner <span className="text-blue-600">Application</span>
                </h2>
                <p className="text-gray-600">
                  Complete the form below to start your partnership journey with PrimeLog Logistics
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                      Company Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your Company LLC"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="john@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Provide a Link to Your Website <span className="text-gray-400 text-sm">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.yourcompany.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Overview */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                      Business Overview
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Company Overview <span className="text-gray-400 text-sm">(Optional)</span>
                        </label>
                        <textarea
                          name="companyOverview"
                          value={formData.companyOverview}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Brief description of your company, services, and target market..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Comment or Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about your business goals and how we can work together..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Submission */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                      <div className="text-sm text-gray-500">
                        By submitting this form, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">Partnership Terms</a>.
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                      >
                        <span>Submit Application</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Next Steps */}
              <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">What Happens Next?</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="font-bold mb-2">Application Review</div>
                    <div className="text-blue-100 text-sm">Within 24 hours</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="font-bold mb-2">Initial Call</div>
                    <div className="text-blue-100 text-sm">Schedule discovery call</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="font-bold mb-2">Proposal</div>
                    <div className="text-blue-100 text-sm">Custom partnership proposal</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="font-bold mb-2">Onboarding</div>
                    <div className="text-blue-100 text-sm">Complete partnership setup</div>
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