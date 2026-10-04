// src/pages/admin/AdminBulkInquiries.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { bulkInquiryService } from '../../services/bulkInquiryService';
import toast from 'react-hot-toast';
import {
  FiMail, FiSearch, FiX, FiTrash2, FiUser, FiPhone,
  FiBriefcase, FiPackage, FiLoader, FiMessageSquare,
} from 'react-icons/fi';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'quoted', 'converted', 'closed'];

const STATUS_STYLE = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  quoted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  converted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TYPE_STYLE = {
  bulk: 'bg-teal-100 text-teal-700',
  corporate: 'bg-indigo-100 text-indigo-700',
  gifting: 'bg-pink-100 text-pink-700',
  collaboration: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
};

export default function AdminBulkInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bulkInquiryService.getInquiries({
        status: filter,
        type: typeFilter,
        search: activeSearch || undefined,
      });
      setInquiries(data.inquiries || []);
    } catch (err) {
      toast.error('Failed to load inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter, activeSearch]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const openInquiry = async (inquiry) => {
    setSelected(inquiry);
    setAdminNote(inquiry.adminNote || '');
    if (inquiry.status === 'new') {
      try {
        await bulkInquiryService.updateInquiry(inquiry._id, { status: 'contacted' });
        setInquiries((prev) =>
          prev.map((i) => (i._id === inquiry._id ? { ...i, status: 'contacted' } : i))
        );
        setSelected((prev) => (prev ? { ...prev, status: 'contacted' } : prev));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await bulkInquiryService.updateInquiry(id, { status });
      setInquiries((prev) => prev.map((i) => (i._id === id ? res.inquiry : i)));
      setSelected((prev) => (prev && prev._id === id ? res.inquiry : prev));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    try {
      const res = await bulkInquiryService.updateInquiry(selected._id, { adminNote });
      setSelected(res.inquiry);
      toast.success('Note saved');
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    try {
      await bulkInquiryService.deleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      setSelected((prev) => (prev && prev._id === id ? null : prev));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const typeLabel = (t) =>
    ({ bulk: 'Bulk', corporate: 'Corporate', gifting: 'Gifting', collaboration: 'Collaboration', other: 'Other' }[t] || t);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bulk & Custom Inquiries
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {inquiries.length} inquir{inquiries.length === 1 ? 'y' : 'ies'}
            {activeSearch && ` matching "${activeSearch}"`}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00C2D6]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#00C2D6] hover:bg-[#00A0B0] text-white rounded-lg text-sm font-medium transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
              filter === s
                ? 'bg-[#00C2D6] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'bulk', 'corporate', 'gifting', 'collaboration'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${
              typeFilter === t
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <FiLoader className="animate-spin mr-2" size={20} />
          Loading inquiries...
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <FiMessageSquare size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {activeSearch || filter !== 'all' ? 'No inquiries match your filters.' : 'No inquiries yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((item) => (
            <div
              key={item._id}
              onClick={() => openInquiry(item)}
              className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition ${
                item.status === 'new'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.status === 'new' ? (
                      <FiMail size={16} className="text-blue-600 flex-shrink-0" />
                    ) : (
                      <FiUser size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <span className="text-xs text-gray-500 truncate">· {item.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[item.inquiryType] || TYPE_STYLE.other}`}>
                      {typeLabel(item.inquiryType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">{item.message}</p>
                  <div className="flex gap-3 mt-1">
                    {item.company && (
                      <p className="text-xs text-gray-500 truncate">🏢 {item.company}</p>
                    )}
                    {item.quantity && (
                      <p className="text-xs text-gray-500 truncate">📦 {item.quantity}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${STATUS_STYLE[item.status]}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg bg-white dark:bg-gray-900 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_STYLE[selected.inquiryType] || TYPE_STYLE.other}`}>
                  {typeLabel(selected.inquiryType)}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiMail size={14} className="text-[#00C2D6]" />
                <a href={`mailto:${selected.email}`} className="text-[#00C2D6] hover:underline break-all">
                  {selected.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiPhone size={14} className="text-[#00C2D6]" />
                <a href={`tel:${selected.phone}`} className="hover:text-[#00C2D6]">
                  {selected.phone}
                </a>
              </div>
              {selected.company && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiBriefcase size={14} className="text-[#00C2D6]" />
                  {selected.company}
                </div>
              )}
              {selected.quantity && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiPackage size={14} className="text-[#00C2D6]" />
                  Quantity: {selected.quantity}
                </div>
              )}
              <div className="text-xs text-gray-400">
                Received: {new Date(selected.createdAt).toLocaleString('en-IN')}
              </div>
              {selected.contactedAt && (
                <div className="text-xs text-gray-400">
                  First Contacted: {new Date(selected.contactedAt).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 mb-4">
              {selected.message}
            </div>

            {/* Status buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['contacted', 'quoted', 'converted', 'closed'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(selected._id, s)}
                  disabled={selected.status === s}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-[#00C2D6] hover:text-white rounded-lg capitalize disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Mark {s}
                </button>
              ))}
            </div>

            {/* Admin note */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Internal Note
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Add an internal note for your team..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-[#00C2D6] resize-none"
              />
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="mt-2 px-4 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 hover:bg-gray-800 transition"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <a
                href={`mailto:${selected.email}?subject=Re: Your inquiry to Smooth Sip`}
                className="flex-1 text-center px-4 py-2.5 bg-[#00C2D6] hover:bg-[#00A0B0] text-white rounded-lg font-medium transition"
              >
                Reply via Email
              </a>
              <a
                href={`https://wa.me/${(selected.phone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 transition font-medium text-sm"
              >
                WhatsApp
              </a>
              <button
                onClick={() => handleDelete(selected._id)}
                className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}