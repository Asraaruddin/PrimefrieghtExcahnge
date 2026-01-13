'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { 
  Phone, Mail, MapPin, Clock, Headphones, Users, MessageSquare, 
  Globe, Shield, Zap, CheckCircle, ArrowRight, Building2, 
  Target, TrendingUp, Award, HelpCircle, FileText, Calendar,
  Star, ThumbsUp, Truck, Package, Route, Warehouse, BarChart,
  Cpu, Network, Users2, Briefcase, Coffee, Wifi, ShieldCheck,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

interface AccordionItemProps {
  question: string;
  answer: string;
  index: number;
}

function AccordionItem({ question, answer, index }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex justify-between items-center bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <span className="font-bold text-lg text-white">{question}</span>
        <span className="text-2xl text-gray-300">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-5 bg-gray-800/50 border-t border-gray-700">
          <p className="text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
}

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    console.log('Submitting contact form:', formData);

    try {
      // Basic validation
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.subject.trim()) throw new Error('Subject is required');
      if (!formData.department.trim()) throw new Error('Department is required');
      if (!formData.message.trim()) throw new Error('Message is required');

      // Prepare data for Supabase
      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || null,
        subject: formData.subject.trim(),
        department: formData.department,
        urgency: formData.urgency,
        message: formData.message.trim(),
        source: 'contact_page',
        status: 'new'
      };

      console.log('Inserting into contact_page_submissions:', submissionData);

      // Insert into Supabase
      const { data, error: supabaseError } = await supabase
        .from('contact_page_submissions')
        .insert([submissionData])
        .select();

      console.log('Supabase response:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('Supabase Error:', supabaseError);
        throw new Error(`Database error: ${supabaseError.message}`);
      }

      if (!data) {
        throw new Error('No response from server');
      }

      console.log('✅ Contact form saved successfully:', data[0]);
      setSuccess(true);
      
      // Reset form
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

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err: any) {
      console.error('❌ Contact form submission error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
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

  const faqItems = [
    {
      question: "What's the fastest way to get support?",
      answer: "For urgent matters, call our 24/7 support hotline at +1 (316) 555-1234. For non-urgent inquiries, email us at support@primefreightexpress.com with a guaranteed response within 4 hours."
    },
    {
      question: "Do you offer support in languages other than English?",
      answer: "Yes! We provide support in 12+ languages including Spanish, French, German, Mandarin, Japanese, and Arabic. Our multilingual team is available 24/7 to assist you."
    },
    {
      question: "What information should I include when contacting support?",
      answer: "Please include your tracking number (if applicable), shipment details, company name, contact information, and a detailed description of your issue or inquiry to help us serve you faster."
    },
    {
      question: "Can I schedule a consultation with our logistics experts?",
      answer: "Absolutely! You can schedule a free consultation with our logistics experts through our contact form or by calling our sales department. We'll discuss your specific needs and provide tailored solutions."
    },
    {
      question: "What are your business hours for different departments?",
      answer: "Our 24/7 hotline operates round the clock. Sales department: Mon-Fri 8AM-8PM EST. Customer support: 24/7 via phone, 6AM-10PM via email. Technical support: 24/7."
    },
    {
      question: "How quickly can you respond to international shipping inquiries?",
      answer: "International department responds within 6 hours during business days. For urgent international shipping needs, use our 24/7 hotline for immediate assistance."
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section - Fixed visibility issue */}
        <section ref={heroRef} className="relative min-h-screen pt-24 md:pt-32">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 transition-transform duration-1000 ease-out"
              style={{
                transform: `scale(${1 + scrollProgress * 0.03})`,
                backgroundImage: 'url(/contact-us2.avif)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                <div className="mb-8">
                  <span className="inline-block px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full text-white font-bold text-sm mb-4">
                    CONNECT WITH US
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Get in <span className="text-blue-300">Touch</span>
                </h1>
                
                <p className="text-xl text-white/90 mb-10 leading-relaxed font-medium drop-shadow-2xl max-w-xl">
                  Want to get in touch? We'd love to hear from you. Here's how you can reach us.
                </p>

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
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                        {method.type}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {method.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {method.description}
                    </p>

                    <div className="flex-grow" />

                    <div className="space-y-4">
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
                    Interested in PrimeFreightExpress's comprehensive logistics solutions? Just pick up the phone to chat with a member of our sales team. Whether you're looking for LTL services, freight forwarding, or customized logistics solutions, we're here to help.
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
                    Sometimes you need a little help from your friends. Or a PrimeFreightExpress support representative. Don't worry... we're here for you. Our customer support team is trained to handle everything from tracking issues to complex logistics challenges.
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
                  <Link
                    href="#contact-form"
                    className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors mt-8 flex items-center justify-center"
                  >
                    Contact Support
                  </Link>
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

        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">  
              {/* Why Contact Us Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-white">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold mb-6">
                      Why Contact <span className="text-blue-200">PrimeFreightExpress?</span>
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

              {/* Success Message */}
              {success && (
                <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-700 mb-1">Message Sent Successfully!</h3>
                      <p className="text-green-600">
                        Thank you for contacting us. Our team will get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-700 mb-1">Error</h3>
                      <p className="text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

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
                          disabled={loading}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={loading}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={loading}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={loading}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={loading}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={loading}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="radio"
                              name="urgency"
                              value={level}
                              checked={formData.urgency === level}
                              onChange={handleChange}
                              disabled={loading}
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
                        disabled={loading}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
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
                        disabled={loading}
                        className={`font-bold py-4 px-12 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                          loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 hover:scale-105 shadow-lg hover:shadow-blue-500/30'
                        } text-white`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
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
                      When you reach out to PrimeFreightExpress, you can expect exceptional service at every touchpoint. We're committed to providing timely, relevant, and helpful responses to all inquiries.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Guaranteed response within 24 hours</span>
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

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    index={index}
                  />
                ))}
              </div>

              {/* Still have questions? */}
              <div className="mt-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mb-6">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Please chat with our friendly team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="mailto:support@primefreightexpress.com"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Email Us
                  </Link>
                  <Link
                    href="tel:+13165551234"
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}