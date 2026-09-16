// src/pages/admin/AdminContacts.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { contactService } from '../../services/contactService';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Trash2, Search, X, Loader2 } from 'lucide-react';

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactService.getMessages({
        status: filter,
        search: activeSearch || undefined,
      });
      setMessages(data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [filter, activeSearch]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    if (msg.status === 'new') {
      try {
        await contactService.markAsRead(msg._id);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, status: 'read' } : m))
        );
        setSelected((prev) => (prev ? { ...prev, status: 'read' } : prev));
      } catch (err) {
        console.error('Mark as read failed:', err);
      }
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await contactService.updateStatus(id, status);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
      setSelected((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await contactService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setSelected((prev) => (prev && prev._id === id ? null : prev));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contact Messages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {messages.length} message{messages.length === 1 ? '' : 's'}
            {activeSearch && ` matching "${activeSearch}"`}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, subject..."
              className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
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

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'new', 'read', 'replied', 'archived'].map((s) => (
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Mail size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {activeSearch ? 'No messages match your search.' : 'No messages yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => openMessage(msg)}
              className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition ${
                msg.status === 'new'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {msg.status === 'new' ? (
                      <Mail size={16} className="text-blue-600 flex-shrink-0" />
                    ) : (
                      <MailOpen size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {msg.name}
                    </p>
                    <span className="text-xs text-gray-500 truncate">· {msg.email}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{msg.message}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${
                      msg.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : msg.status === 'replied'
                        ? 'bg-green-100 text-green-700'
                        : msg.status === 'archived'
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-gray-900 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-4">
                {selected.subject}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <strong className="text-gray-900 dark:text-white">From:</strong>{' '}
                {selected.name}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Email:</strong>{' '}
                <a href={`mailto:${selected.email}`} className="text-[#00C2D6]">
                  {selected.email}
                </a>
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Received:</strong>{' '}
                {new Date(selected.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 mb-4">
              {selected.message}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['read', 'replied', 'archived'].map((s) => (
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

            <div className="flex gap-2">
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="flex-1 text-center px-4 py-2.5 bg-[#00C2D6] hover:bg-[#00A0B0] text-white rounded-lg font-medium transition"
              >
                Reply via Email
              </a>
              <button
                onClick={() => handleDelete(selected._id)}
                className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}