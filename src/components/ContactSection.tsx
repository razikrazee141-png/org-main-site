import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, Info, Sparkles, Database, Phone, Check, Copy, ShieldCheck, Lock } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { isSupabaseConfigured, submitInquiryToSupabase } from '../lib/supabase';
import { triggerConfetti } from '../lib/confetti';

const QUICK_SUBJECTS = [
  { label: 'Technology Solutions', value: 'Technology & Software Solutions', icon: '💻' },
  { label: 'Education & Digital Skills', value: 'Education & Digital Skills', icon: '🎓' },
  { label: 'Community Project', value: 'Community Development Collaboration', icon: '🤝' },
  { label: 'Social Services', value: 'Social Services & Public Assistance', icon: '❤️' },
  { label: 'Institutional Partnership', value: 'Institutional Partnership', icon: '🏢' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const { contact } = SITE_CONFIG;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [copiedType, setCopiedType] = useState<'email' | 'address' | null>(null);
  const [botCheck, setBotCheck] = useState('');
  const [inquiryResult, setInquiryResult] = useState<{ inquiryId: string; message: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    const handleSelectSubject = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setFormData((prev) => ({ ...prev, subject: customEvent.detail }));
        setErrors((prev) => ({ ...prev, subject: undefined }));
      }
    };
    window.addEventListener('nextgen_select_subject', handleSelectSubject);
    return () => window.removeEventListener('nextgen_select_subject', handleSelectSubject);
  }, []);

  const fallbackCopy = (text: string, type: 'email' | 'address') => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.warn('Copy fallback notice:', e);
    }
  };

  const handleCopy = (text: string, type: 'email' | 'address') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedType(type);
          setTimeout(() => setCopiedType(null), 2000);
        })
        .catch(() => {
          fallbackCopy(text, type);
        });
    } else {
      fallbackCopy(text, type);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please provide your contact phone number.';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 7 || formData.phone.trim().length > 25) {
        newErrors.phone = 'Please provide a valid phone number (at least 7 digits).';
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select or enter an inquiry subject.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 15) {
      newErrors.message = 'Please provide a little more detail (at least 15 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setServerError(null);

    const generatedId = `NG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    let inquiryId = generatedId;
    let savedToSupabase = false;
    let serverMessage = 'Your inquiry has been successfully transmitted and logged for official review.';

    try {
      // 1. If Supabase is connected, store directly in Supabase cloud database
      if (isSupabaseConfigured()) {
        try {
          const supabaseResult = await submitInquiryToSupabase({
            id: generatedId,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            ip: 'web',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'web',
          });
          if (supabaseResult?.id) {
            inquiryId = supabaseResult.id;
          }
          savedToSupabase = true;
        } catch (supabaseErr) {
          console.warn('Supabase cloud submission skipped or error:', supabaseErr);
        }
      }

      // 2. Also invoke backend API if available (for email notifications / server logging)
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: inquiryId,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            bot_check: botCheck,
          }),
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data?.inquiryId) inquiryId = data.inquiryId;
          if (data?.message) serverMessage = data.message;
        } else if (!savedToSupabase) {
          const data = await response.json().catch(() => null);
          if (data?.details) {
            setErrors(data.details);
          }
          throw new Error(data?.error || `Unable to submit inquiry (HTTP ${response.status}).`);
        }
      } catch (apiErr: any) {
        if (!savedToSupabase) {
          throw apiErr;
        }
      }

      // 3. Fallback cache in localStorage for instant offline access on this device
      try {
        const submittedItem = {
          id: inquiryId,
          createdAt: new Date().toISOString(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: 'new',
          ip: 'browser',
          emailNotificationSent: false,
        };
        const existing = JSON.parse(localStorage.getItem('nextgen_local_inquiries') || '[]');
        const updated = [submittedItem, ...existing.filter((i: any) => i.id !== submittedItem.id)];
        localStorage.setItem('nextgen_local_inquiries', JSON.stringify(updated.slice(0, 50)));
      } catch (storageErr) {
        console.warn('LocalStorage save skipped:', storageErr);
      }

      setInquiryResult({
        inquiryId,
        message: serverMessage,
      });
      setStatus('success');
      triggerConfetti();
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (err: any) {
      console.error('Inquiry transmission failed:', err);
      setServerError(
        err.message || 'Unable to connect to the inquiry gateway. Please check your connection or contact NextGen directly.'
      );
      setStatus('idle');
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#125EA2] bg-[#125EA2]/10 border border-[#125EA2]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#125EA2]" />
            <span>Official Secretariat Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            {contact.heading}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {contact.subtext}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Official Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#125EA2]" />
                <span>Verified Contact Secretariat</span>
              </h3>

              {contact.details.map((item) => (
                <div
                  key={item.label}
                  className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 space-y-2 hover:border-slate-300 transition-colors relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {item.label === 'Official Email' && <Mail className="w-4 h-4 text-[#125EA2]" />}
                      {(item.label.includes('Phone') || item.label.includes('Contact')) && <Phone className="w-4 h-4 text-[#125EA2]" />}
                      {item.label === 'Administrative Office' && <MapPin className="w-4 h-4 text-[#388E3C]" />}
                      {item.label === 'Operating Hours' && <Clock className="w-4 h-4 text-[#FFA726]" />}
                      <span>{item.label}</span>
                    </div>

                    {/* Quick Copy Buttons for Email and Office Address */}
                    {item.label === 'Official Email' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, 'email')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#125EA2] px-2 py-0.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                        title="Copy official email"
                      >
                        {copiedType === 'email' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}

                    {item.label === 'Administrative Office' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, 'address')}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#388E3C] px-2 py-0.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                        title="Copy office address"
                      >
                        {copiedType === 'address' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {item.label === 'Official Email' ? (
                    <a
                      href={`mailto:${item.value}`}
                      className="block text-base font-semibold text-[#125EA2] hover:underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : item.label.includes('Phone') ? (
                    <a
                      href={`tel:${item.value.replace(/\s+/g, '')}`}
                      className="block text-base font-semibold text-[#125EA2] hover:underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm sm:text-base font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                      {item.value}
                    </p>
                  )}

                  {item.isPlaceholder && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-0.5 inline-block font-mono break-words max-w-full">
                      {item.placeholderNote}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Official Response SLA Guarantee */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#125EA2] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900 block">Correspondence Response Protocol</span>
                Official submissions are formally reviewed by the NextGen secretarial desk. Acknowledgment and responses are typically issued within 24 to 48 business hours.
              </div>
            </div>

            {/* Verification and Privacy Notice */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#125EA2]" />
                <span>Verification & Security Standard</span>
              </div>
              <p className="leading-relaxed">
                NextGen maintains strict institutional standards regarding official correspondence. We never solicit credentials, banking details, or informal contributions through unverified third parties.
              </p>
            </div>

          </div>

          {/* Right Column: Accessible Official Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF9F6] border border-slate-200/90 shadow-sm relative">
              
              <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Transmit Official Message</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submissions are routed directly to NextGen executive administration.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 self-start sm:self-auto">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-bit Secure Gateway</span>
                </div>
              </div>

              {status === 'success' && inquiryResult ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-950">Inquiry Transmitted & Logged</h4>
                  <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                    {inquiryResult.message}
                  </p>
                  <div className="p-3 bg-white/95 rounded-xl border border-emerald-200/90 inline-block font-mono text-xs text-emerald-900 shadow-xs">
                    Inquiry Reference: <span className="font-bold text-[#125EA2]">{inquiryResult.inquiryId}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('idle');
                        setInquiryResult(null);
                      }}
                      className="inline-flex px-5 py-2.5 rounded-full text-xs font-semibold text-emerald-900 bg-emerald-200 hover:bg-emerald-300 transition-colors cursor-pointer shadow-2xs"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Anti-spam honeypot (hidden from human visitors) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="bot_check"
                      value={botCheck}
                      onChange={(e) => setBotCheck(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Server error alert banner */}
                  {serverError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-red-950">Transmission Issue</p>
                        <p className="text-xs text-red-700 leading-relaxed">{serverError}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Full Name Input */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ayesha Rahman"
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
                      }`}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email and Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. name@domain.com"
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-200 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
                        }`}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-200 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
                        }`}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject Dropdown / Input & Interactive Quick Chips */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700">
                        Subject / Focus Discipline <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Click quick tag or select below
                      </span>
                    </div>

                    {/* Quick Subject Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {QUICK_SUBJECTS.map((chip) => {
                        const isSelected = formData.subject === chip.value;
                        return (
                          <button
                            key={chip.value}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, subject: chip.value }));
                              setErrors((prev) => ({ ...prev, subject: undefined }));
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-[#125EA2] text-white shadow-xs font-semibold'
                                : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            <span>{chip.icon}</span>
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData({ ...formData, subject: e.target.value });
                        setErrors({ ...errors, subject: undefined });
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.subject
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
                      }`}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                    >
                      <option value="">Select an inquiry category</option>
                      <option value="General Corporate Inquiry">General Corporate Inquiry</option>
                      <option value="Technology & Software Solutions">Technology & Software Solutions</option>
                      <option value="Education & Digital Skills">Education & Digital Skills</option>
                      <option value="Social Services & Public Assistance">Social Services & Public Assistance</option>
                      <option value="Community Development Collaboration">Community Development Collaboration</option>
                      <option value="Institutional Partnership">Institutional Partnership</option>
                    </select>
                    {errors.subject && (
                      <p id="subject-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Message Field with Live Character Counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700">
                        Inquiry Message <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[11px] font-mono ${formData.message.length >= 15 ? 'text-slate-400' : 'text-amber-600'}`}>
                        {formData.message.length}/5000 {formData.message.length < 15 && '(min 15 chars)'}
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (e.target.value.trim().length >= 15) {
                          setErrors({ ...errors, message: undefined });
                        }
                      }}
                      placeholder="Please share details regarding your organization, proposal, or inquiry..."
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-y ${
                        errors.message
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
                      }`}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#125EA2] hover:bg-[#0E4F8B] shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                    >
                      {status === 'submitting' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Transmitting Inquiries...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Transmit Official Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Integration readiness note */}
                  <p className="text-[11px] text-slate-400 text-center pt-2">
                    Submissions are handled securely by NextGen governance. Verified contact responses will be delivered directly to your specified email.
                  </p>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};