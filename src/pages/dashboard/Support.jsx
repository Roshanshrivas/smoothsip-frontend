import React, { useState, useEffect } from 'react';
import { LifeBuoy, Mail, Phone, MessageCircle, Clock, Send, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Mock data – replace with real API
      const data = [
        {
          id: 1,
          subject: 'Order not received',
          message: 'My order #ORD-ABC123 was supposed to arrive yesterday but hasn\'t.',
          status: 'Resolved',
          priority: 'high',
          createdAt: '2026-07-03T14:30:00',
          updatedAt: '2026-07-04T10:00:00',
        },
        {
          id: 2,
          subject: 'Request for exchange',
          message: 'I received the wrong size tumbler and would like to exchange it.',
          status: 'In Progress',
          priority: 'medium',
          createdAt: '2026-07-04T09:15:00',
          updatedAt: '2026-07-04T11:30:00',
        },
        {
          id: 3,
          subject: 'Coupon not working',
          message: 'I tried to apply coupon SAVE20 but it says invalid.',
          status: 'Open',
          priority: 'low',
          createdAt: '2026-07-05T08:00:00',
          updatedAt: '2026-07-05T08:00:00',
        },
      ];
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    // Simulate API call
    toast.success('Support ticket submitted! We\'ll get back to you soon.');
    setShowForm(false);
    setFormData({ subject: '', message: '', priority: 'medium' });
    // Add to list (mock)
    const newTicket = {
      id: Date.now(),
      ...formData,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets([newTicket, ...tickets]);
  };

  const statusConfig = {
    Open: { label: 'Open', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20', icon: Clock },
    'In Progress': { label: 'In Progress', color: 'text-[#14C6D8]', bg: 'bg-[#E6F9FA] dark:bg-[#14C6D8]/20', icon: AlertCircle },
    Resolved: { label: 'Resolved', color: 'text-[#22C55E]', bg: 'bg-[#DCFCE7] dark:bg-[#22C55E]/20', icon: CheckCircle },
  };

  const getStatus = (status) => statusConfig[status] || statusConfig.Open;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[#14C6D8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EEF2] dark:border-[#18212A]/30 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18212A] dark:text-white flex items-center gap-2">
            <LifeBuoy size={24} className="text-[#14C6D8]" />
            Support Center
          </h2>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B]">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#18212A] rounded-xl border border-[#E8EEF2] dark:border-[#18212A]/30 p-4 text-center hover:shadow-md transition-all group">
          <Mail size={24} className="mx-auto text-[#14C6D8] mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-[#18212A] dark:text-white">Email</p>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B]">support@tumblerstudio.com</p>
          <p className="text-xs text-[#5F6C7B]/60">Response within 24h</p>
        </div>
        <div className="bg-white dark:bg-[#18212A] rounded-xl border border-[#E8EEF2] dark:border-[#18212A]/30 p-4 text-center hover:shadow-md transition-all group">
          <Phone size={24} className="mx-auto text-[#14C6D8] mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-[#18212A] dark:text-white">Phone</p>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B]">+91 98765 43210</p>
          <p className="text-xs text-[#5F6C7B]/60">Mon–Sat, 10 AM – 7 PM</p>
        </div>
        <div className="bg-white dark:bg-[#18212A] rounded-xl border border-[#E8EEF2] dark:border-[#18212A]/30 p-4 text-center hover:shadow-md transition-all group">
          <MessageCircle size={24} className="mx-auto text-[#14C6D8] mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-[#18212A] dark:text-white">Live Chat</p>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B]">Available now</p>
          <button className="text-xs text-[#14C6D8] hover:text-[#0FB2C3] font-medium transition">
            Start Chat
          </button>
        </div>
      </div>

      {/* Ticket Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 shadow-sm p-6">
          <h3 className="font-semibold text-[#18212A] dark:text-white mb-4">Create Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                Message *
              </label>
              <textarea
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                className="w-full px-4 py-2 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm resize-none focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#E8EEF2] dark:border-[#18212A]/30 text-[#5F6C7B] dark:text-[#5F6C7B] rounded-xl font-medium hover:bg-[#F8FBFC] dark:hover:bg-[#18212A]/50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white rounded-xl font-medium transition shadow-sm flex items-center justify-center gap-2"
              >
                <Send size={16} /> Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 shadow-sm">
          <LifeBuoy size={48} className="mx-auto text-[#5F6C7B]/40 dark:text-[#5F6C7B]/30 mb-3" />
          <h3 className="text-lg font-semibold text-[#18212A] dark:text-white">No support tickets</h3>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-1">
            Have a question? Create a ticket and we'll help you out.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = getStatus(ticket.status);
            const StatusIcon = status.icon;
            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#18212A] dark:text-white">{ticket.subject}</h4>
                    <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-0.5 line-clamp-2">{ticket.message}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#5F6C7B] dark:text-[#5F6C7B]">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                      <span className="capitalize">Priority: {ticket.priority}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info('Viewing ticket details...')}
                    className="text-xs text-[#14C6D8] hover:text-[#0FB2C3] font-medium transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Support;