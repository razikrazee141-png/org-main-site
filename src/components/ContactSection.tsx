import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Check, 
  Copy, 
  ShieldCheck, 
  Lock,
  Building2,
  CodeXml,
  GraduationCap,
  HeartHandshake,
  UsersRound,
  FileText,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { isSupabaseConfigured, submitInquiryToSupabase } from '../lib/supabase';
import { triggerConfetti } from '../lib/confetti';

const QUICK_SUBJECTS = [
  { label: 'Software Services', value: 'Software Services', icon: CodeXml },
  { label: 'Education & Digital Skills', value: 'Education & Digital Skills', icon: GraduationCap },
  { label: 'Social Services', value: 'Social Services & Public Assistance', icon: HeartHandshake },
  { label: 'Community Development', value: 'Community Development Collaboration', icon: UsersRound },
  { label: 'Institutional Partnership', value: 'Institutional Partnership', icon: Building2 },
];

interface FormData {
  name: string;
  organization: string;
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

interface SubmittedReceipt {
  inquiryId: string;
  timestamp: string;
  name: string;
  organization?: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const ContactSection: React.FC = () => {
  const { contact } = SITE_CONFIG;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    organization: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [copiedType, setCopiedType] = useState<'email' | 'address' | 'receipt' | null>(null);
  const [botCheck, setBotCheck] = useState('');
  const [inquiryReceipt, setInquiryReceipt] = useState<SubmittedReceipt | null>(null);
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

  const fallbackCopy = (text: string, type: 'email' | 'address' | 'receipt') => {
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

  const handleCopy = (text: string, type: 'email' | 'address' | 'receipt') => {
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
      newErrors.name = 'Please enter your full name or correspondent name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide an official or personal email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. correspondent@domain.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please provide a direct telephone or contact number.';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 7 || formData.phone.trim().length > 25) {
        newErrors.phone = 'Please provide a valid telephone number (at least 7 digits).';
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select a disciplinary classification or subject.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide the details or statement of your inquiry.';
    } else if (formData.message.trim().length < 15) {
      newErrors.message = 'Please provide a more descriptive brief (minimum 15 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setServerError(null);

    const generatedId = `NXG-SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    let inquiryId = generatedId;
    let savedToSupabase = false;

    // Compose formatted message including optional organization affiliation
    const formattedMessage = formData.organization.trim()
      ? `[Institutional Affiliation / Organization: ${formData.organization.trim()}]\n\n${formData.message.trim()}`
      : formData.message.trim();

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
            message: formattedMessage,
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

      // 2. Also invoke backend API if available (for server logging & email forwarding)
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: inquiryId,
            name: formData.name.trim(),
            organization: formData.organization.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject: formData.subject.trim(),
            message: formattedMessage,
            bot_check: botCheck,
          }),
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data?.inquiryId) inquiryId = data.inquiryId;
        } else if (!savedToSupabase) {
          const data = await response.json().catch(() => null);
          if (data?.details) {
            setErrors(data.details);
          }
          throw new Error(data?.error || `Unable to submit official communication (HTTP ${response.status}).`);
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
          organization: formData.organization.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formattedMessage,
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

      const receiptRecord: SubmittedReceipt = {
        inquiryId,
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        name: formData.name.trim(),
        organization: formData.organization.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      setInquiryReceipt(receiptRecord);
      setStatus('success');
      triggerConfetti();
      setFormData({ name: '', organization: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (err: any) {
      console.error('Official transmission failed:', err);
      setServerError(
        err.message || 'Unable to connect to the institutional gateway. Please verify network connectivity or contact the secretariat directly.'
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
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
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

            {/* Official Response Protocol */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#125EA2] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900 block">Correspondence Response Protocol</span>
                Official submissions are formally logged and routed through the NextGen Secretarial Desk. Responses and statutory acknowledgments are typically issued within 24 to 48 business hours.
              </div>
            </div>

            {/* Verification and Privacy Notice */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#125EA2]" />
                <span>Verification & Security Standard</span>
              </div>
              <p className="leading-relaxed font-normal">
                NextGen maintains strict institutional confidentiality regarding official correspondence. We never solicit credentials, banking details, or informal contributions through unverified third parties.
              </p>
            </div>

          </div>

          {/* Right Column: Super Official Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#FAF9F6] border border-slate-200/90 shadow-md relative overflow-hidden">
              
              {/* Official Institutional Document Header Strip */}
              <div className="bg-slate-900 text-white px-6 sm:px-8 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                      FORM NXG-SEC/2026-ENQ
                    </span>
                    <span className="text-xs text-slate-400 font-medium block">
                      NextGen Executive Secretariat Intake Protocol
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-slate-200 backdrop-blur-sm">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit Encrypted Protocol</span>
                </div>
              </div>

              {/* Form Content / Success State */}
              <div className="p-6 sm:p-8 lg:p-10">
                {status === 'success' && inquiryReceipt ? (
                  <div className="space-y-6">
                    {/* Official Receipt Header */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-5 text-left relative overflow-hidden">
                      {/* Top Accent Strip */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#125EA2] via-emerald-500 to-[#388E3C]" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                            <BadgeCheck className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                              Official Filing Acknowledgment
                            </span>
                            <h4 className="text-lg font-bold text-slate-900">
                              Enquiry Logged with Secretarial Registry
                            </h4>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[11px] font-mono text-slate-400 block">Transmission Timestamp</span>
                          <span className="text-xs font-semibold text-slate-700">{inquiryReceipt.timestamp}</span>
                        </div>
                      </div>

                      {/* Official Filing Details Table */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            Filing Reference Code
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-extrabold text-[#125EA2]">
                              {inquiryReceipt.inquiryId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(inquiryReceipt.inquiryId, 'receipt')}
                              className="text-[11px] font-semibold text-slate-600 hover:text-[#125EA2] flex items-center gap-1 cursor-pointer"
                              title="Copy Filing Reference"
                            >
                              {copiedType === 'receipt' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            Routing & Queue Status
                          </span>
                          <div className="font-semibold text-slate-800">
                            Executive Secretarial Desk &bull; Priority Intake
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            Correspondent Name
                          </span>
                          <div className="font-semibold text-slate-800 truncate">
                            {inquiryReceipt.name}
                            {inquiryReceipt.organization && (
                              <span className="text-slate-500 font-normal"> ({inquiryReceipt.organization})</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            Disciplinary Classification
                          </span>
                          <div className="font-semibold text-slate-800 truncate">
                            {inquiryReceipt.subject}
                          </div>
                        </div>
                      </div>

                      {/* Official NextGen Seal Notice */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Secretarial Acknowledgment Guarantee</span>
                        </span>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Your submission has been formally recorded in the NextGen registry. A designated secretarial officer will review the brief and contact you at <span className="font-semibold underline">{inquiryReceipt.email}</span> within 24–48 business hours.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-slate-500 italic">
                        Please save or copy your filing reference code for tracking purposes.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('idle');
                          setInquiryReceipt(null);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>File Another Official Enquiry</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
                          <p className="font-semibold text-red-950">Transmission Blocked</p>
                          <p className="text-xs text-red-700 leading-relaxed">{serverError}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Section 01: Correspondent Credentials */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                        <span className="w-5 h-5 rounded-full bg-[#125EA2]/10 text-[#125EA2] text-[11px] font-mono font-bold flex items-center justify-center">
                          01
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Correspondent Credentials & Identification
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                          <label htmlFor="contact-name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Full Name / Primary Correspondent <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Dr. Ayesha Rahman"
                            className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                              errors.name
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-300 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
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

                        {/* Organization / Affiliation (Optional) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="contact-org" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                              Organization / Institution
                            </label>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Optional</span>
                          </div>
                          <input
                            id="contact-org"
                            type="text"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            placeholder="e.g. Apex Welfare Trust / Civic Body"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20 focus:border-[#125EA2] transition-all"
                          />
                        </div>
                      </div>

                      {/* Email and Phone Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Official Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g. correspondent@domain.org"
                            className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                              errors.email
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-300 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
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
                          <label htmlFor="contact-phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Direct Telephone / Contact <span className="text-red-500">*</span>
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
                                : 'border-slate-300 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
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
                    </div>

                    {/* Section 02: Classification & Subject Matter */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                        <span className="w-5 h-5 rounded-full bg-[#125EA2]/10 text-[#125EA2] text-[11px] font-mono font-bold flex items-center justify-center">
                          02
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Disciplinary Classification & Subject Matter
                        </span>
                      </div>

                      {/* Quick Subject Chips with Professional Icons (No Emojis) */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-500 font-medium block">
                          Select applicable disciplinary domain:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_SUBJECTS.map((chip) => {
                            const isSelected = formData.subject === chip.value;
                            const ChipIcon = chip.icon;
                            return (
                              <button
                                key={chip.value}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, subject: chip.value }));
                                  setErrors((prev) => ({ ...prev, subject: undefined }));
                                }}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#125EA2] text-white shadow-sm ring-2 ring-[#125EA2]/30'
                                    : 'bg-white hover:bg-slate-100/90 text-slate-700 border border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                <ChipIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#125EA2]'}`} />
                                <span>{chip.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white ml-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-1">
                        <label htmlFor="contact-subject" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Enquiry Category Dropdown <span className="text-red-500">*</span>
                        </label>
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
                              : 'border-slate-300 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
                          }`}
                          aria-invalid={!!errors.subject}
                          aria-describedby={errors.subject ? 'subject-error' : undefined}
                        >
                          <option value="">-- Select Official Classification --</option>
                          <option value="General Corporate Inquiry">General Corporate / Institutional Inquiry</option>
                          <option value="Software Services">Software Services & Platform Support</option>
                          <option value="Education & Digital Skills">Education & Digital Skills Empowerment</option>
                          <option value="Social Services & Public Assistance">Social Services & Public Assistance Programs</option>
                          <option value="Community Development Collaboration">Community Development & Civic Collaboration</option>
                          <option value="Institutional Partnership">Institutional & Statutory Partnership</option>
                        </select>
                        {errors.subject && (
                          <p id="subject-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.subject}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section 03: Formal Statement */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                        <span className="w-5 h-5 rounded-full bg-[#125EA2]/10 text-[#125EA2] text-[11px] font-mono font-bold flex items-center justify-center">
                          03
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Formal Enquiry Statement & Narrative Brief
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="contact-message" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Enquiry Details / Brief <span className="text-red-500">*</span>
                          </label>
                          <span className={`text-[11px] font-mono ${formData.message.length >= 15 ? 'text-slate-400' : 'text-amber-600 font-semibold'}`}>
                            {formData.message.length}/5000 {formData.message.length < 15 && '(min 15 chars required)'}
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
                          placeholder="State the official purpose, scope, or operational assistance required from NextGen..."
                          className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-y ${
                            errors.message
                              ? 'border-red-400 focus:ring-red-200'
                              : 'border-slate-300 focus:ring-[#125EA2]/20 focus:border-[#125EA2]'
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
                    </div>

                    {/* Official Declaration Banner */}
                    <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/90 flex items-start gap-2.5 text-xs text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-[#125EA2] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        By transmitting this communication, you confirm that the provided information is submitted for official NextGen secretarial review. All records are archived under our institutional privacy code.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#125EA2] to-[#0E4F8B] hover:from-[#0E4F8B] hover:to-[#0A3D6E] shadow-md hover:shadow-lg hover:shadow-[#125EA2]/20 transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                      >
                        {status === 'submitting' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Secretariat protocol footnote */}
                    <p className="text-[11px] text-slate-400 text-center pt-1 font-mono">
                      NextGen Executive Secretariat &bull; Institutional Registry Portal
                    </p>

                  </form>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
