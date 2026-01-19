'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

export default function Footer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Simple validation
      if (!formData.name || !formData.email || !formData.message) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        message: formData.message,
        source: 'contact_form',
        status: 'new'
      };

      console.log('Submitting:', submissionData);

      // Insert into Supabase
      const { data, error: supabaseError } = await supabase
        .from('contact_submissions_frieght')
        .insert([submissionData])
        .select();

      console.log('Response:', { data, error: supabaseError });

      if (supabaseError) {
        console.error('Supabase Error:', supabaseError);
        setError(`Database error: ${supabaseError.message}. Please check RLS policies.`);
      } else {
        console.log('Success! Data:', data);
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      }

    } catch (err: any) {
      console.error('Catch Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Contact Section */}
      <div className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                {/* Central Freight Express Logo */}
                <Link href="/" className="flex items-center">
                  <div className="h-11 flex items-center transition-all duration-300 ease-out">
                    <Image
                      src="/logo.png"
                      alt="Central Freight Express"
                      width={50}
                      height={32}
                      priority
                      className="object-contain transition-all duration-300 ease-out hover:scale-[1.03] hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                    />
                  </div>
                </Link>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="text-blue-400">Ship?</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Get in touch with our logistics experts for customized solutions
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                
                {success && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-400 font-medium">Message sent successfully!</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-red-400 font-medium">{error}</p>
                        <p className="text-red-300 text-sm mt-1">
                          Please run the SQL commands in Supabase SQL Editor to fix RLS.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
                        placeholder="+1 682-254-6683"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
                        placeholder="Company Inc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
                      loading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">Address</div>
                        <div className="text-gray-300 mt-1">
                          6179 Wauconda Way West, Lake Worth, FL 33463
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">Email</div>
                        <a 
                          href="mailto:support@centralfreightexpress.com" 
                          className="text-blue-400 hover:text-blue-300 transition-colors mt-1 block"
                        >
                          support@centralfreightexpress.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                        <Phone className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">Phone</div>
                        <a 
                          href="tel:+16822546683" 
                          className="text-blue-400 hover:text-blue-300 transition-colors mt-1 block"
                        >
                          +1 682-254-6683,(973) 435-6887
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold">Business Hours</div>
                        <div className="text-gray-300 mt-1">
                          Mon-Fri: 8AM-8PM<br />
                          Sat: 9AM-5PM<br />
                          Sun: Emergency Only
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
{/* Footer Bottom - Real World / Pixel Perfect */}
<div className="bg-gray-900 border-t border-gray-800">
  <div className="container mx-auto px-4 py-6">

    <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6">

      {/* LEFT: Logo + Tagline */}
      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
        <Image
          src="/logo.png"
          alt="Central Freight Express"
          width={40}
          height={40}
          className="object-contain"
        />
        <p className="text-gray-400 text-sm font-medium tracking-wide text-center sm:text-left">
          Premium Freight Shipping Solutions
        </p>
      </div>

      {/* CENTER: Legal Links */}
      <div className="flex justify-center">
        <div className="flex items-center text-sm font-medium tracking-wide text-gray-400 whitespace-nowrap">
          <Link href="/PrivacyNotice" className="hover:text-blue-400 transition-colors">
            Privacy Notice
          </Link>

          <span className="mx-2 text-gray-600">•</span>

          <Link href="/TermsOfUse" className="hover:text-blue-400 transition-colors">
            Terms of Use
          </Link>

          <span className="mx-2 text-gray-600">•</span>

          <Link href="/legal-terms" className="hover:text-blue-400 transition-colors">
            Legal Terms
          </Link>
        </div>
      </div>

      {/* RIGHT: Copyright */}
      <div className="flex justify-center lg:justify-end">
        <p className="text-gray-500 text-sm font-medium tracking-wide whitespace-nowrap">
          © {currentYear} Central Freight Express
        </p>
      </div>

    </div>
  </div>
</div>

    </footer>
  );
}