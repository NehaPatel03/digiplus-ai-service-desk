'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Ticket as TicketIcon, 
  Search, 
  Filter, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw,
  ArrowUpDown,
  Bot
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/lib/types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/Badges';
import { CreateTicketModal } from '@/components/CreateTicketModal';

const STATUS_TABS: { label: string; value: string; emoji: string }[] = [
  { label: 'All', value: 'All', emoji: '📁' },
  { label: 'Open', value: 'Open', emoji: '🔵' },
  { label: 'In Progress', value: 'In Progress', emoji: '🟡' },
  { label: 'Resolved', value: 'Resolved', emoji: '🟢' },
  { label: 'Closed', value: 'Closed', emoji: '⚪' },
];

const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];
const CATEGORIES = [
  'All',
  'Network',
  'Software',
  'Hardware',
  'Access & Security',
  'Email & Communication',
  'Cloud & Infrastructure',
  'Billing & Accounts',
  'Other'
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Support Incidents & Tickets</span>
            <span>🎫</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, view, manage lifecycle, and auto-diagnose issues with AI
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Ticket 🎫</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ticket title, description, or #ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Priorities ⚡</option>
              <option value="Urgent">🚨 Urgent</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories 📂</option>
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading incidents...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <TicketIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No matching tickets found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or create a new support incident.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setCategoryFilter('All');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all shadow-md group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800/40 px-2 py-0.5 rounded-md">
                    #{ticket.id}
                  </span>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <CategoryBadge category={ticket.category} />
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ticket.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {ticket.title}
              </h2>

              <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {ticket.description}
              </p>

              {/* AI Diagnosis Snippet */}
              {ticket.ai_summary ? (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-200">
                  <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-1">
                    <strong className="text-indigo-300 font-semibold">AI Summary: </strong>
                    {ticket.ai_summary}
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Click to run AI Diagnosis & matching runbooks 🤖</span>
                </div>
              )}

              {/* Card Footer */}
              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  {ticket.resolution ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : ticket.status === 'In Progress' ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Investigation underway
                    </span>
                  ) : (
                    <span className="text-blue-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Awaiting triage
                    </span>
                  )}
                </span>

                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform font-semibold flex items-center gap-1">
                  View & Resolve &rarr;
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={() => {
          fetchTickets();
        }}
      />
    </div>
  );
}
