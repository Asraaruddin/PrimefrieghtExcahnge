'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { 
  Phone, Mail, MapPin, Clock, Headphones, Users, MessageSquare, 
  Globe, Shield, Zap, CheckCircle, ArrowRight, Building2, 
  Target, TrendingUp, Award, HelpCircle, FileText, Calendar,
  Star, ThumbsUp, Truck, Package, Route, Warehouse, BarChart,
  Cpu, Network, Users2, Briefcase, Coffee, Wifi, ShieldCheck
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    department: '',
    urgency: 'normal',
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
    console.log('Contact form submitted:', formData);
    alert('Thank you for contacting us! Our team will get back to you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      department: '',
      urgency: 'normal',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: Headphones,
      title: "24/7 Support Hotline",
      description: "Immediate assistance for urgent shipments and emergencies",
      contact: "+1 (316) 555-1234",
      response: "Instant",
      color: "bg-blue-500",
      type: "Emergency"
    },
    {
      icon: Users,
      title: "Sales & Partnerships",
      description: "Get quotes, discuss partnerships, and explore new opportunities",
      contact: "+1 (316) 555-1234",
      response: "Within 2 hours",
      color: "bg-green-500",
      type: "Business"
    },
    {
      icon: MessageSquare,
      title: "Customer Support",
      description: "Track shipments, resolve issues, and get shipping assistance",
      contact: "+1 (316) 555-1234",
      response: "Within 4 hours",
      color: "bg-purple-500",
      type: "General"
    },
    {
      icon: Globe,
      title: "International Services",
      description: "Global shipping, customs clearance, and international logistics",
      contact: "+1 (316) 555-1234",
      response: "Within 6 hours",
      color: "bg-orange-500",
      type: "International"
    }
  ];

  const departments = [
    {
      name: "Sales & Business Development",
      description: "New business inquiries, partnership opportunities, and pricing",
      icon: TrendingUp,
      features: ["Custom Quotes", "Volume Discounts", "Contract Negotiations"]
    },
    {
      name: "Customer Success",
      description: "Account management, service optimization, and performance reviews",
      icon: Star,
      features: ["Dedicated Support", "Performance Analytics", "Strategic Planning"]
    },
    {
      name: "Operations & Logistics",
      description: "Shipment coordination, route planning, and operational support",
      icon: Route,
      features: ["Real-time Tracking", "Route Optimization", "Emergency Response"]
    },
    {
      name: "Technical Support",
      description: "Platform assistance, API integration, and technical issues",
      icon: Cpu,
      features: ["24/7 Tech Support", "API Documentation", "System Integration"]
    }
  ];

  const globalOffices = [
    {
      location: "North America HQ",
      address: "1441 S Hoover Rd, Wichita, KS 67209",
      phone: "+1 (316) 555-1000",
      email: "na@primelog.com",
      hours: "Mon-Fri: 8AM-8PM EST",
      icon: Building2
    },
    {
      location: "Europe Office",
      address: "123 Logistics Blvd, Amsterdam, Netherlands",
      phone: "+31 20 555 1234",
      email: "europe@primelog.com",
      hours: "Mon-Fri: 9AM-6PM CET",
      icon: Globe
    },
    {
      location: "Asia Pacific Hub",
      address: "456 Shipping Ave, Singapore 018989",
      phone: "+65 6555 1234",
      email: "asia@primelog.com",
      hours: "Mon-Fri: 9AM-7PM SGT",
      icon: MapPin
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen pt-24 md:pt-32">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 transition-transform duration-1000 ease-out"
              style={{
                transform: `scale(${1 + scrollProgress * 0.03})`,
                backgroundImage: 'url(/contact-us.avif)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                {/* Strong minimal content on image */}
                <div className="mb-8">
                  <span className="inline-block px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full text-white font-bold text-sm mb-4">
                    CONNECT WITH US
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Get in <span className="text-blue-300">Touch</span>
                </h1>
                
                <p className="text-xl text-white mb-10 leading-relaxed font-medium drop-shadow-lg max-w-xl">
                  Want to get in touch? We'd love to hear from you. Here's how you can reach us.
                </p>

                

                {/* Quick CTA */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#contact-form"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Send Message
                  </Link>
                  <Link
                    href="tel:+13165551234"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 border border-white/30 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          
          
        </section>

        {/* Contact Methods Section */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  How to <span className="text-blue-600">Reach Us</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Multiple channels for seamless communication. Choose the method that works best for your needs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
  {contactMethods.map((method, index) => (
    <div
      key={index}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 min-h-[340px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center`}>
          <method.icon className="w-6 h-6 text-white" />
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
          {method.type}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
        {method.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        {method.description}
      </p>

      {/* Spacer pushes contact info to bottom */}
      <div className="flex-grow" />

      {/* Contact Info */}
      <div className="space-y-4">
        {/* Contact */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-gray-600" />
          </div>

          <div className="max-w-full">
            <div className="font-semibold text-gray-900 text-sm break-all">
              {method.contact}
            </div>
            <div className="text-xs text-gray-500">
              Primary contact
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>

          <div>
            <div className="font-semibold text-green-600 text-sm">
              {method.response}
            </div>
            <div className="text-xs text-gray-500">
              Average response time
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>


              {/* Talk to Sales & Support Section */}
              <div className="grid lg:grid-cols-2 gap-12 mb-20">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Talk to Sales</h3>
                      <p className="text-blue-200">Expert guidance for your business</p>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-8 leading-relaxed">
                    Interested in PrimeLog's comprehensive logistics solutions? Just pick up the phone to chat with a member of our sales team. Whether you're looking for LTL services, freight forwarding, or customized logistics solutions, we're here to help.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold">North America</div>
                        <div className="text-blue-200 text-sm">Toll Free</div>
                      </div>
                      <div className="text-2xl font-bold mb-2">000-800-050-3669</div>
                      <div className="text-blue-200 text-sm">Available 24/7</div>
                    </div>
                    <div className="text-center">
                      <Link 
                        href="/global-numbers" 
                        className="text-white hover:text-blue-200 font-bold flex items-center justify-center gap-2"
                      >
                        View all global numbers
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Contact Customer Support</h3>
                      <p className="text-gray-300">We're here when you need us</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Sometimes you need a little help from your friends. Or a PrimeLog support representative. Don't worry... we're here for you. Our customer support team is trained to handle everything from tracking issues to complex logistics challenges.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Expert Support Team</h4>
                        <p className="text-gray-300 text-sm">Certified logistics professionals with 10+ years experience</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Multiple Languages</h4>
                        <p className="text-gray-300 text-sm">Support available in English, Spanish, French, and Mandarin</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors mt-8">
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Departments Section */}
              <div className="mb-20">
                <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  Connect with the Right <span className="text-blue-600">Department</span>
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {departments.map((dept, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <dept.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">{dept.name}</h4>
                      <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                      <div className="space-y-2">
                        {dept.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-gray-700 text-sm">
                            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Offices Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Global <span className="text-blue-600">Offices</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our worldwide network ensures support wherever your business takes you
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mb-20">
                {globalOffices.map((office, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mr-4">
                        <office.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{office.location}</h3>
                        <p className="text-blue-600 text-sm">Main Office</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">Address</div>
                          <div className="text-gray-600">{office.address}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">Phone</div>
                          <div className="text-gray-600">{office.phone}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">Email</div>
                          <div className="text-gray-600">{office.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">Business Hours</div>
                          <div className="text-gray-600">{office.hours}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-colors mt-8">
                      Get Directions
                    </button>
                  </div>
                ))}
              </div>

              {/* Why Contact Us Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-white">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold mb-6">
                      Why Contact <span className="text-blue-200">PrimeLog?</span>
                    </h3>
                    <p className="text-blue-100 mb-8 leading-relaxed">
                      We're not just another logistics company. We're your strategic partner in supply chain optimization. When you contact us, you're connecting with industry experts who understand the complexities of modern logistics.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Industry Expertise</h4>
                          <p className="text-blue-200 text-sm">
                            20+ years of logistics experience across multiple industries
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Rapid Response</h4>
                          <p className="text-blue-200 text-sm">
                            Average response time under 2 hours for critical inquiries
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-2">Dedicated Teams</h4>
                          <p className="text-blue-200 text-sm">
                            Specialized departments for different business needs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h4 className="text-2xl font-bold mb-6">Contact Success Metrics</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-blue-100">Customer Satisfaction</span>
                        <span className="font-bold text-green-300">98%</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-blue-100">Average Response Time</span>
                        <span className="font-bold">1.8 hours</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-blue-100">Issue Resolution Rate</span>
                        <span className="font-bold">96%</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-blue-100">Support Languages</span>
                        <span className="font-bold">12+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Form */}
        <section id="contact-form" className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl mb-8 shadow-2xl">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Send Us a <span className="text-blue-600">Message</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Fill out the form below and our team will get back to you with personalized solutions
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                        <p className="text-gray-500">Tell us who you are</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-3">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-3">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-3">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-3">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder="Your Company LLC"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Inquiry Details</h3>
                        <p className="text-gray-500">Tell us about your request</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-3">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder="What is this regarding?"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-3">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Select department</option>
                          <option value="sales">Sales & Business Development</option>
                          <option value="support">Customer Support</option>
                          <option value="technical">Technical Support</option>
                          <option value="operations">Operations & Logistics</option>
                          <option value="partnerships">Partnerships</option>
                          <option value="billing">Billing & Invoicing</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-3">
                        Urgency Level <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['low', 'normal', 'urgent'].map((level) => (
                          <label
                            key={level}
                            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.urgency === level
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="urgency"
                              value={level}
                              checked={formData.urgency === level}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full mb-2 ${
                                level === 'low' ? 'bg-green-500' :
                                level === 'normal' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}></div>
                              <span className="font-medium capitalize">{level}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-3">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Please provide details about your inquiry, including any specific requirements or deadlines..."
                      />
                    </div>
                  </div>

                  {/* Form Submission */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                      <div className="text-sm text-gray-500">
                        By submitting this form, you agree to our{' '}
                        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> and{' '}
                        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>.
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 flex items-center space-x-3"
                      >
                        <span>Send Message</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Contact Assurance */}
              <div className="mt-16 bg-gradient-to-r from-green-600/10 to-green-800/10 rounded-3xl p-8 md:p-12 border border-green-500/20">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Our Contact <span className="text-green-600">Promise</span>
                    </h3>
                    <p className="text-gray-600 mb-8">
                      When you reach out to PrimeLog, you can expect exceptional service at every touchpoint. We're committed to providing timely, relevant, and helpful responses to all inquiries.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Guanteed response within 24 hours</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Direct access to subject matter experts</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Personalized solutions, not template responses</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-full mb-6">
                      <ThumbsUp className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">98% Satisfaction Rate</h4>
                    <p className="text-gray-600">
                      Based on customer feedback from the past 12 months
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Frequently Asked <span className="text-blue-400">Questions</span>
                </h2>
                <p className="text-xl text-gray-300">
                  Quick answers to common questions about contacting us
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-3">What's the fastest way to get support?</h4>
                  <p className="text-gray-300">
                    For urgent matters, call our 24/7 support hotline at +1 (316) 555-1234. For non-urgent inquiries, email us at support@primelog.com with a guaranteed response within 4 hours.
                  </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-3">Do you offer support in languages other than English?</h4>
                  <p className="text-gray-300">
                    Yes! We provide support in 12+ languages including Spanish, French, German, Mandarin, Japanese, and Arabic. Our multilingual team is available 24/7 to assist you.
                  </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-3">What information should I include when contacting support?</h4>
                  <p className="text-gray-300">
                    Please include your tracking number (if applicable), shipment details, company name, contact information, and a detailed description of your issue or inquiry to help us serve you faster.
                  </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-3">Can I schedule a consultation with your logistics experts?</h4>
                  <p className="text-gray-300">
                    Absolutely! You can schedule a free consultation with our logistics experts through our contact form or by calling our sales department. We'll discuss your specific needs and provide tailored solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}