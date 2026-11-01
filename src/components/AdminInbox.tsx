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
  AlertCircle 
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface StoredInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  status: 'new' | 'reviewed' | 'responded';
  emailNotificationSent: boolean;
}

export const AdminInbox: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(
    localStorage.getItem('nextgen_admin_key') || 'nextgen-admin-secret-2026'
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'responded'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<StoredInquiry | null>(null);

  const fetchInquiries = async (keyToUse = adminKey) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: {
          Authorization: `Bearer ${keyToUse}`,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        throw new Error('Invalid Admin Key. Please verify and try again.');
      }

      if (!res.ok) {
        throw new Error(`Failed to load inquiries (${res.status}). Please verify your security key or server status.`);
      }

      const data = await res.json();
      setInquiries(data.inquiries || []);
      setIsAuthenticated(true);
      localStorage.setItem('nextgen_admin_key', keyToUse);

      // Select first if none selected
      if (!selectedInquiry && data.inquiries?.length > 0) {
        setSelectedInquiry(data.inquiries[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(adminKey);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'reviewed' | 'responded') => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry record?')) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });

      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete inquiry', err);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      inq.name.toLowerCase().includes(term) ||
      inq.email.toLowerCase().includes(term) ||
      inq.subject.toLowerCase().includes(term) ||
      inq.message.toLowerCase().includes(term) ||
      inq.id.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchInquiries()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
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
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
              <p className="text-xs text-slate-500">
                Enter your administrative key to view official correspondence received from the website.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchInquiries();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secret Admin Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin authorization key"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#125EA2] text-white text-sm font-semibold hover:bg-[#0E4F8B] transition-colors"
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
                    placeholder="Search by name, email, query..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#125EA2]/20"
                  />
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {(['all', 'new', 'reviewed', 'responded'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                        statusFilter === filter
                          ? 'bg-[#125EA2] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-slate-400 font-mono">
                    {filteredInquiries.length} total
                  </span>
                </div>
              </div>

              {/* Inquiries list */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[650px]">
                {filteredInquiries.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">No inquiries matching filter.</p>
                  </div>
                ) : (
                  filteredInquiries.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    const date = new Date(inq.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <button
                        key={inq.id}
                        type="button"
                        onClick={() => setSelectedInquiry(inq)}
                        className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 relative ${
                          isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#125EA2]" />
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {inq.name}
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                            {date}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-[#125EA2] truncate">
                          {inq.subject}
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {inq.message}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              inq.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : inq.status === 'reviewed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {inq.status}
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {inq.id}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Column: Selected Inquiry Detail View */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 min-h-[600px] flex flex-col justify-between">
              {selectedInquiry ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          {selectedInquiry.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            selectedInquiry.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedInquiry.status === 'reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {selectedInquiry.status}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {selectedInquiry.subject}
                      </h2>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Re: [NextGen] ${encodeURIComponent(
                          selectedInquiry.subject
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#125EA2] hover:bg-[#0E4F8B] text-white text-xs font-semibold transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply Email</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedInquiry.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sender Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold mb-0.5">Sender</span>
                      <strong className="text-slate-800 text-sm">{selectedInquiry.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold mb-0.5">Email</span>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="text-[#125EA2] hover:underline font-mono"
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold mb-0.5">Received Date</span>
                      <span className="text-slate-600">
                        {new Date(selectedInquiry.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Message Content
                    </span>
                    <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 font-medium">Update Status:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'new')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          selectedInquiry.status === 'new'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Mark as New
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'reviewed')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          selectedInquiry.status === 'reviewed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'responded')}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          selectedInquiry.status === 'responded'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Mark as Responded
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
    </div>
  );
};
