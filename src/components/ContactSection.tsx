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
  BadgeCheck,
  RotateCcw,
  Sparkles,
  ArrowRight
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
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please provide a contact phone number.';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 7 || formData.phone.trim().length > 25) {
        newErrors.phone = 'Please provide a valid phone number (at least 7 digits).';
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select an inquiry subject.';
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

    const generatedId = `NXG-SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    let inquiryId = generatedId;
    let savedToSupabase = false;

    const formattedMessage = formData.organization.trim()
      ? `[Institutional Affiliation / Organization: ${formData.organization.trim()}]\n\n${formData.message.trim()}`
      : formData.message.trim();

    try {
      // 1. Supabase Cloud DB
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

      // 2. Server API
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

      // 3. Fallback Local Storage
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
        err.message || 'Unable to connect to the institutional gateway. Please verify your connection or contact NextGen directly.'
      );
      setStatus('idle');
    }
  };

  return (
    <section id="contact" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative bg-[#F7F6EC] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5 mb-10 sm:mb-14">
          <div className="biztop-eyebrow">
            <Sparkles className="w-3.5 h-3.5 text-[#06302B] shrink-0 fill-[#06302B]" />
            <span>Official Secretariat Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B2B26]">
            {contact.heading}
          </h2>
          <p className="text-base sm:text-lg text-[#5B6B66] leading-relaxed font-normal">
            {contact.subtext}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Official Contact Channels */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#5B6B66] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#06302B]" />
                <span>Verified Contact Secretariat</span>
              </h3>

              {contact.details.map((item) => (
                <div
                  key={item.label}
                  className="p-5 rounded-[20px] biztop-card space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#06302B] uppercase tracking-wider font-mono">
                      {item.label === 'Official Email' && <Mail className="w-4 h-4 text-[#06302B]" />}
                      {(item.label.includes('Phone') || item.label.includes('Contact')) && <Phone className="w-4 h-4 text-[#06302B]" />}
                      {item.label === 'Administrative Office' && <MapPin className="w-4 h-4 text-[#06302B]" />}
                      {item.label === 'Operating Hours' && <Clock className="w-4 h-4 text-[#06302B]" />}
                      <span>{item.label}</span>
                    </div>

                    {/* Quick Copy Buttons for Email and Office Address */}
                    {item.label === 'Official Email' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, 'email')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#06302B] hover:bg-[#B4F26B] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                        title="Copy official email"
                      >
                        {copiedType === 'email' ? (
                          <>
                            <Check className="w-3 h-3 text-[#06302B]" />
                            <span>Copied!</span>
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
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#06302B] hover:bg-[#B4F26B] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                        title="Copy office address"
                      >
                        {copiedType === 'address' ? (
                          <>
                            <Check className="w-3 h-3 text-[#06302B]" />
                            <span>Copied!</span>
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
                      className="block text-sm sm:text-base font-bold text-[#06302B] hover:underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : item.label.includes('Phone') ? (
                    <a
                      href={`tel:${item.value.replace(/\s+/g, '')}`}
                      className="block text-sm sm:text-base font-bold text-[#06302B] hover:underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-xs sm:text-sm font-medium text-[#5B6B66] whitespace-pre-line leading-relaxed">
                      {item.value}
                    </p>
                  )}

                  {item.isPlaceholder && (
                    <p className="text-xs text-amber-800 bg-amber-100 rounded-full px-3 py-0.5 inline-block font-mono break-words max-w-full">
                      {item.placeholderNote}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Official Response Protocol */}
            <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#06302B] shrink-0 mt-0.5" />
              <div className="text-xs text-[#5B6B66] leading-relaxed font-normal">
                <span className="font-bold text-[#0B2B26] block font-sans">Correspondence Response Protocol</span>
                Official submissions are formally logged and reviewed by the NextGen Secretarial Desk. Responses and acknowledgments are typically issued within 24 to 48 business hours.
              </div>
            </div>

            {/* Verification and Privacy Notice */}
            <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs text-xs text-[#5B6B66] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0B2B26]">
                <ShieldCheck className="w-4 h-4 text-[#06302B]" />
                <span>Verification & Security Standard</span>
              </div>
              <p className="leading-relaxed font-normal">
                NextGen maintains strict institutional confidentiality regarding official correspondence. We never solicit credentials, banking details, or informal contributions through unverified third parties.
              </p>
            </div>

          </div>

          {/* Right Column: Biztop 24px Rounded Card Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 lg:p-10 shadow-lg border border-slate-200/90 relative overflow-hidden">
              
              {/* Header Bar */}
              <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B4F26B]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#06302B]">
                    FORM NXG-SEC/2026-ENQ
                  </span>
                  <span className="text-slate-400 hidden sm:inline">&bull;</span>
                  <span className="text-xs text-[#5B6B66] hidden sm:inline">Secretariat Intake</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#06302B] bg-[#B4F26B]/30 px-3 py-1 rounded-full border border-[#B4F26B]">
                  <Lock className="w-3 h-3 text-[#06302B]" />
                  <span>256-Bit Encrypted Protocol</span>
                </div>
              </div>

              {/* Form Content / Success State */}
              <div>
                {status === 'success' ? (
                  <div className="py-10 px-4 sm:px-8 text-center space-y-5 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-[#B4F26B] text-[#06302B] flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-[#0B2B26] tracking-tight">
                        Successfully Submitted
                      </h4>
                      <p className="text-sm sm:text-base text-[#5B6B66] leading-relaxed">
                        Thank you for reaching out to NextGen. We have received your inquiry and our team will get back to you shortly.
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('idle');
                          setInquiryReceipt(null);
                        }}
                        className="btn-biztop-pill text-sm shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Send Another Message</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Anti-spam honeypot */}
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

                    {/* Friendly Soft Red Alert Banner */}
                    {serverError && (
                      <div className="p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 shadow-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-950">Transmission Issue</p>
                          <p className="text-rose-700 leading-relaxed">{serverError}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Name & Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[#06302B] mb-2 font-mono">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ayesha Rahman"
                          className={`biztop-input w-full ${
                            errors.name ? 'border-rose-400 bg-rose-50/50' : ''
                          }`}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                        {errors.name && (
                          <p id="name-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.name}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor="contact-org" className="block text-xs font-bold uppercase tracking-wider text-[#06302B] font-mono">
                            Organization
                          </label>
                          <span className="text-[10px] uppercase text-[#5B6B66] font-mono">Optional</span>
                        </div>
                        <input
                          id="contact-org"
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="e.g. Civic Trust / Institution"
                          className="biztop-input w-full"
                        />
                      </div>
                    </div>

                    {/* Email and Phone Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-[#06302B] mb-2 font-mono">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. name@domain.com"
                          className={`biztop-input w-full ${
                            errors.email ? 'border-rose-400 bg-rose-50/50' : ''
                          }`}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                          <p id="email-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-[#06302B] mb-2 font-mono">
                          Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className={`biztop-input w-full ${
                            errors.phone ? 'border-rose-400 bg-rose-50/50' : ''
                          }`}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                        {errors.phone && (
                          <p id="phone-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Subject Chips with Pill Radii & Professional Icons */}
                    <div className="space-y-2">
                      <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-[#06302B] font-mono">
                        Subject / Focus Discipline <span className="text-red-500">*</span>
                      </label>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
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
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#B4F26B] text-[#06302B] shadow-xs'
                                  : 'bg-[#F7F6EC] hover:bg-slate-200/60 text-[#0B2B26] border border-slate-200'
                              }`}
                            >
                              <ChipIcon className="w-3.5 h-3.5 text-[#06302B]" />
                              <span>{chip.label}</span>
                              {isSelected && <Check className="w-3 h-3 text-[#06302B] ml-0.5 stroke-[3]" />}
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
                        className={`biztop-input w-full ${
                          errors.subject ? 'border-rose-400' : ''
                        }`}
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                      >
                        <option value="">Select an inquiry category</option>
                        <option value="General Corporate Inquiry">General Corporate Inquiry</option>
                        <option value="Software Services">Software Services</option>
                        <option value="Education & Digital Skills">Education & Digital Skills</option>
                        <option value="Social Services & Public Assistance">Social Services & Public Assistance</option>
                        <option value="Community Development Collaboration">Community Development Collaboration</option>
                        <option value="Institutional Partnership">Institutional Partnership</option>
                      </select>
                      {errors.subject && (
                        <p id="subject-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.subject}</span>
                        </p>
                      )}
                    </div>

                    {/* Message Field with Live Character Counter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[#06302B] font-mono">
                          Inquiry Message <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-[11px] font-mono ${formData.message.length >= 15 ? 'text-[#5B6B66]' : 'text-amber-700 font-bold'}`}>
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
                        className={`w-full p-3.5 rounded-[14px] bg-[#F7F6EC] border text-sm text-[#0B2B26] placeholder:text-[#5B6B66] focus:outline-none focus:border-[#B4F26B] focus:ring-3 focus:ring-[#B4F26B]/50 focus:bg-white transition-all resize-y ${
                          errors.message ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300/80'
                        }`}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button: Biztop Pill with Circular Arrow Chip */}
                    <div>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="btn-biztop-pill w-full h-[52px] text-base font-bold shadow-md disabled:opacity-60"
                      >
                        {status === 'submitting' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#06302B]/40 border-t-[#06302B] rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit</span>
                            <span className="arrow-chip">
                              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#5B6B66] text-center pt-1 font-mono">
                      Submissions are handled securely by NextGen governance.
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
