import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Mail, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Reply, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  AlertCircle,
  Download,
  Database,
  Check,
  Copy,
  ExternalLink,
  Settings,
  X,
  Radio,
  LogOut,
  Lock,
  Phone,
  PhoneCall
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  fetchInquiriesFromSupabase,
  updateInquiryStatusInSupabase,
  deleteInquiryFromSupabase,
  subscribeToInquiries,
  testSupabaseConnection,
  SUPABASE_SETUP_SQL,
  InquiryRecord,
} from '../lib/supabase';

type StoredInquiry = InquiryRecord;

export const AdminInbox: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return sessionStorage.getItem('nextgen_admin_key') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('nextgen_admin_authenticated') === 'true';
  });
  const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'responded'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<StoredInquiry | null>(null);

  // Supabase modal and status state
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState<string>(supabaseConfig.url || '');
  const [inputAnonKey, setInputAnonKey] = useState<string>(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    checking: boolean;
    success?: boolean;
    message?: string;
    tableReady?: boolean;
  } | null>(null);

  const fetchInquiries = async (keyToUse = adminKey) => {
    setIsLoading(true);
    setError(null);
    try {
      let supabaseList: StoredInquiry[] = [];
      let serverList: StoredInquiry[] = [];
      let localList: StoredInquiry[] = [];

      // 1. Fetch from Supabase Cloud if configured (primary global database)
      if (isSupabaseConfigured()) {
        try {
          supabaseList = await fetchInquiriesFromSupabase();
        } catch (sErr: any) {
          console.warn('[AdminInbox] Supabase fetch notice:', sErr?.message);
        }
      }

      // 2. Fetch from Backend Serverless / Express API if reachable
      try {
        const res = await fetch('/api/admin/inquiries', {
          headers: {
            Authorization: `Bearer ${keyToUse}`,
          },
        });

        if (res.status === 401 && !isSupabaseConfigured()) {
          setIsAuthenticated(false);
          sessionStorage.removeItem('nextgen_admin_authenticated');
          throw new Error('Invalid Admin Key. Please verify and try again.');
        }

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && Array.isArray(data.inquiries)) {
            serverList = data.inquiries;
          }
        }
      } catch (apiErr: any) {
        if (!isSupabaseConfigured() && apiErr?.message?.includes('Invalid Admin Key')) {
          throw apiErr;
        }
      }

      // 3. Fallback to localStorage
      try {
        localList = JSON.parse(localStorage.getItem('nextgen_local_inquiries') || '[]');
      } catch {
        localList = [];
      }

      // 4. Merge all sources by ID (Supabase takes precedence as single source of truth)
      const map = new Map<string, StoredInquiry>();
      [...localList, ...serverList, ...supabaseList].forEach((item) => {
        if (item?.id) {
          map.set(item.id, item);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setInquiries(merged);
      if (keyToUse) {
        sessionStorage.setItem('nextgen_admin_key', keyToUse);
      }

      // Select first if none selected
      if (!selectedInquiry && merged.length > 0) {
        setSelectedInquiry(merged[0]);
      } else if (selectedInquiry) {
        const updated = merged.find((i) => i.id === selectedInquiry.id);
        if (updated) setSelectedInquiry(updated);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = adminKey.trim();
    if (!entered) {
      setError('Please enter your admin verification key.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const validKey = (import.meta.env.VITE_ADMIN_KEY || 'nextgen-admin-secret-2026').trim();
    let isKeyValid = entered === validKey;

    // Check with backend API if alive
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: {
          Authorization: `Bearer ${entered}`,
        },
      });
      if (res.ok) {
        isKeyValid = true;
      } else if (res.status === 401 && !isKeyValid) {
        setIsLoading(false);
        setError('Invalid verification key. Access denied.');
        return;
      }
    } catch {
      // Backend unavailable; client-configured key is valid
    }

    if (!isKeyValid) {
      setIsLoading(false);
      setError('Invalid verification key. Access denied.');
      return;
    }

    sessionStorage.setItem('nextgen_admin_authenticated', 'true');
    sessionStorage.setItem('nextgen_admin_key', entered);
    // Clear old localStorage key so it never persists across new tabs/sessions automatically
    localStorage.removeItem('nextgen_admin_key');
    setIsAuthenticated(true);
    await fetchInquiries(entered);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nextgen_admin_authenticated');
    sessionStorage.removeItem('nextgen_admin_key');
    localStorage.removeItem('nextgen_admin_key');
    setIsAuthenticated(false);
    setAdminKey('');
    setInquiries([]);
    setSelectedInquiry(null);
    setError(null);
  };

  const handleExport = () => {
    if (inquiries.length === 0) return;
    const blob = new Blob([JSON.stringify(inquiries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nextgen-inquiries-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('nextgen_admin_authenticated') === 'true';
    const savedKey = sessionStorage.getItem('nextgen_admin_key');
    if (isAuth && savedKey) {
      fetchInquiries(savedKey);
    }
  }, []);

  // Real-time subscription to Supabase changes
  useEffect(() => {
    if (!isAuthenticated || !isSupabaseConfigured()) return;

    const unsubscribe = subscribeToInquiries(() => {
      fetchInquiries(adminKey);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, supabaseConfig.isConfigured]);

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'reviewed' | 'responded') => {
    // 1. Update in Supabase Cloud
    if (isSupabaseConfigured()) {
      await updateInquiryStatusInSupabase(id, newStatus);
    }

    // 2. Update locally in UI state immediately
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // 3. Update backend server if active
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}

    // 4. Update localStorage
    try {
      const local = JSON.parse(localStorage.getItem('nextgen_local_inquiries') || '[]');
      const updated = local.map((i: any) => (i.id === id ? { ...i, status: newStatus } : i));
      localStorage.setItem('nextgen_local_inquiries', JSON.stringify(updated));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry record?')) return;

    // 1. Delete from Supabase Cloud
    if (isSupabaseConfigured()) {
      await deleteInquiryFromSupabase(id);
    }

    // 2. Remove locally from UI state
    setInquiries((prev) => prev.filter((item) => item.id !== id));
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }

    // 3. Remove from backend server if active
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
    } catch {}

    // 4. Update localStorage
    try {
      const local = JSON.parse(localStorage.getItem('nextgen_local_inquiries') || '[]');
      const updated = local.filter((i: any) => i.id !== id);
      localStorage.setItem('nextgen_local_inquiries', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveSupabaseConfig = async () => {
    if (!inputUrl.trim() || !inputAnonKey.trim()) {
      alert('Please enter both Supabase Project URL and Anon API Key.');
      return;
    }

    saveSupabaseConfig(inputUrl.trim(), inputAnonKey.trim());
    const updated = getSupabaseConfig();
    setSupabaseConfigState(updated);

    // Test connection
    setTestResult({ checking: true });
    const res = await testSupabaseConnection(inputUrl.trim(), inputAnonKey.trim());
    setTestResult({
      checking: false,
      success: res.success,
      message: res.message,
      tableReady: res.tableReady,
    });

    if (res.success) {
      fetchInquiries(adminKey);
    }
  };

  const handleTestConnection = async () => {
    setTestResult({ checking: true });
    const res = await testSupabaseConnection(inputUrl.trim(), inputAnonKey.trim());
    setTestResult({
      checking: false,
      success: res.success,
      message: res.message,
      tableReady: res.tableReady,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      inq.name.toLowerCase().includes(term) ||
      inq.email.toLowerCase().includes(term) ||
      (inq.phone && inq.phone.toLowerCase().includes(term)) ||
      inq.subject.toLowerCase().includes(term) ||
      inq.message.toLowerCase().includes(term) ||
      inq.id.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#125EA2] transition-colors p-2 rounded-lg hover:bg-slate-100"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Main Site</span>
          </a>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-3">
            <BrandLogo variant="mark" size="sm" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                NextGen Inquiries Gateway
              </h1>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Official Corporate Correspondence Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Supabase Status Pill / Action */}
          <button
            type="button"
            onClick={() => {
              setSupabaseConfigState(getSupabaseConfig());
              setShowSupabaseModal(true);
            }}
            title="Configure Supabase cloud database backend"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isConfigured
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
            {isConfigured ? (
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline">Supabase Cloud</span>
                <span className="md:hidden">Cloud</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Connect Supabase</span>
              </span>
            )}
            <Settings className="w-3 h-3 text-slate-400 opacity-70" />
          </button>

          {isAuthenticated && inquiries.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              title="Download backup of all inquiries as JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              title="Lock and sign out of admin portal"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchInquiries()}
            disabled={isLoading || !isAuthenticated}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {!isAuthenticated ? (
          /* Authentication Card */
          <div className="max-w-md mx-auto my-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 w-full">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#125EA2]/10 text-[#125EA2] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
              <p className="text-xs text-slate-500">
                Please enter your official admin verification key to unlock the correspondence inbox.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secret Admin Verification Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin verification key"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#125EA2] text-white text-sm font-semibold hover:bg-[#0E4F8B] transition-colors cursor-pointer"
              >
                {isLoading ? 'Verifying...' : 'Unlock Messages'}
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            
            {/* Left Column: Filter & List */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[600px]">
              
              {/* Search & Tabs */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, subject, ID..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20"
                  />
                </div>

                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  {(['all', 'new', 'reviewed', 'responded'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={`flex-1 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                        statusFilter === tab
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiry List */}
              <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[650px]">
                {isLoading && inquiries.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    Loading correspondence...
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">No inquiries matching filter</p>
                    {!isConfigured && (
                      <p className="text-[11px] text-amber-600 max-w-xs mx-auto">
                        Connect Supabase to see inquiries submitted from all devices across the web.
                      </p>
                    )}
                  </div>
                ) : (
                  filteredInquiries.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    return (
                      <div
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`p-4 transition-colors cursor-pointer border-l-4 ${
                          isSelected
                            ? 'bg-[#125EA2]/5 border-[#125EA2]'
                            : inq.status === 'new'
                            ? 'border-emerald-500 hover:bg-slate-50'
                            : inq.status === 'reviewed'
                            ? 'border-blue-400 hover:bg-slate-50'
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {inq.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(inq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {inq.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                            <Phone className="w-3 h-3 text-[#125EA2] shrink-0" />
                            <span className="font-mono truncate">{inq.phone}</span>
                          </div>
                        )}

                        <p className="text-xs font-semibold text-slate-700 truncate mb-1">
                          {inq.subject}
                        </p>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {inq.message}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              inq.status === 'new'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inq.status === 'reviewed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {inq.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {inq.id}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Inquiry Details Viewer */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs p-6 min-h-[600px] flex flex-col">
              {selectedInquiry ? (
                <div className="flex-1 flex flex-col justify-between space-y-6">
                  
                  {/* Top Details */}
                  <div className="space-y-6">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              selectedInquiry.status === 'new'
                                ? 'bg-emerald-100 text-emerald-800'
                                : selectedInquiry.status === 'reviewed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {selectedInquiry.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {selectedInquiry.id}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedInquiry.subject}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(selectedInquiry.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sender Profile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                          Sender Name
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{selectedInquiry.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                          Email Address
                        </span>
                        <a
                          href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                          className="font-semibold text-[#125EA2] hover:underline break-all"
                        >
                          {selectedInquiry.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                          Phone Number
                        </span>
                        {selectedInquiry.phone ? (
                          <a
                            href={`tel:${selectedInquiry.phone}`}
                            className="font-semibold text-[#125EA2] hover:underline inline-flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#125EA2]" />
                            <span>{selectedInquiry.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                          Timestamp
                        </span>
                        <span className="text-slate-700 font-mono text-[11px]">
                          {new Date(selectedInquiry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                          Origin Client
                        </span>
                        <span className="text-slate-700 font-mono text-[11px]">
                          {selectedInquiry.ip || 'web'}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Inquiry Message
                      </span>
                      <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {selectedInquiry.message}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Re: NextGen Inquiry: ${encodeURIComponent(selectedInquiry.subject)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#125EA2] text-white font-semibold hover:bg-[#0E4F8B] transition-colors cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply via Email</span>
                      </a>

                      {selectedInquiry.phone && (
                        <a
                          href={`tel:${selectedInquiry.phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call {selectedInquiry.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-medium">Update Status:</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'new')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                          selectedInquiry.status === 'new'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        New
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'reviewed')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                          selectedInquiry.status === 'reviewed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'responded')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                          selectedInquiry.status === 'responded'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Responded
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="m-auto text-center text-slate-400 space-y-3">
                  <Mail className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm">Select an inquiry from the list to view its complete details.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Supabase Configuration & Quick Setup Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Supabase Cloud Backend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sync contact form submissions across all devices globally in real-time
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isConfigured
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isConfigured ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">
                    {isConfigured
                      ? 'Supabase Backend Connected'
                      : 'Supabase Not Configured Yet'}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">
                    {isConfigured
                      ? `Active backend configured via ${supabaseConfig.source}. Every form submission on any device is automatically written to Supabase and instantly visible here.`
                      : 'Currently, inquiries submitted on other devices cannot be shared because Supabase cloud credentials are not connected.'}
                  </p>
                </div>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Supabase Project URL</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      e.g. https://xyzcompany.supabase.co
                    </span>
                  </label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://your-project-ref.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Supabase Anon Public API Key</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Dashboard → Project Settings → API
                    </span>
                  </label>
                  <input
                    type="password"
                    value={inputAnonKey}
                    onChange={(e) => setInputAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20"
                  />
                </div>
              </div>

              {/* Test Results Output */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    testResult.checking
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {testResult.checking && <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />}
                  {!testResult.checking && testResult.success && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {!testResult.checking && !testResult.success && (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{testResult.checking ? 'Testing connection to Supabase...' : testResult.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  className="px-4 py-2.5 rounded-xl bg-[#125EA2] hover:bg-[#0E4F8B] text-white font-semibold transition-colors cursor-pointer"
                >
                  Save & Connect
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testResult?.checking}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  {testResult?.checking ? 'Testing...' : 'Test Connection'}
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear saved Supabase credentials from this browser?')) {
                        clearSupabaseConfig();
                        setInputUrl('');
                        setInputAnonKey('');
                        setSupabaseConfigState(getSupabaseConfig());
                        setTestResult(null);
                      }
                    }}
                    className="ml-auto px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {/* SQL Database Setup Snippet */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Required Supabase Database Table
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Run this in your Supabase project's SQL Editor once to set up the inquiries table
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied SQL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 rounded-b-3xl">
              <span>NextGen Multi-Device Sync • Powered by Supabase</span>
              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
