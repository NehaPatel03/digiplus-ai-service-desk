'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Ticket as TicketIcon, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  PlusCircle, 
  ShieldAlert, 
  Bot, 
  RefreshCw,
  Zap,
  Tag
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '@/lib/types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/Badges';
import { CreateTicketModal } from '@/components/CreateTicketModal';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const total = stats?.totalTickets || 0;
  const resolvedCount = stats?.resolvedTickets || 0;
  const resolvedPct = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered Incident Response Platform 🤖</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              DigiPlus AI Service Desk 📊
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Triage natural language support issues, generate automated AI root-cause diagnostics, match technical runbooks, and record incident resolutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ticket 🎫</span>
            </button>

            <Link
              href="/knowledge-base"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Knowledge Base 🧠</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tickets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Incidents</p>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <TicketIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '-' : stats?.totalTickets ?? 0}
            </span>
            <span className="text-xs text-slate-400">tickets recorded</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <span>🎫 Lifetime support tickets</span>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Incidents</p>
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-400">
              {loading ? '-' : stats?.openTickets ?? 0}
            </span>
            <span className="text-xs text-slate-400">awaiting response</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <span>🔴 Action required</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">
              {loading ? '-' : stats?.inProgressTickets ?? 0}
            </span>
            <span className="text-xs text-slate-400">active triage</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span>🟡 Under investigation</span>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved Tickets</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {loading ? '-' : stats?.resolvedTickets ?? 0}
            </span>
            <span className="text-xs text-emerald-400/80 font-medium">
              ({resolvedPct}% resolution)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span>🟢 Outcome recorded</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Tickets & Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Recent Support Incidents</span>
                <span>🎫</span>
              </h2>
              {stats?.recentTickets && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                  {stats.recentTickets.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/tickets"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
              >
                View all tickets &rarr;
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading incidents...</p>
              </div>
            ) : !stats?.recentTickets || stats.recentTickets.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                <TicketIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No incidents found in the database.</p>
              </div>
            ) : (
              stats.recentTickets.map((ticket: Ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 transition-all shadow-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-md">
                        #{ticket.id}
                      </span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <CategoryBadge category={ticket.category} />
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {ticket.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* AI Diagnosis Pill if available */}
                  {ticket.ai_summary && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-200">
                      <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-1">
                        <strong className="text-indigo-300 font-semibold">AI Diagnosis: </strong>
                        {ticket.ai_summary}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      {ticket.resolution ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved with notes
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Resolution pending
                        </span>
                      )}
                    </span>
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform font-medium flex items-center gap-1">
                      Open Ticket 🔍 &rarr;
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Breakdown / Insights (1 Column) */}
        <div className="space-y-6">
          {/* Priority Breakdown Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>Incidents by Priority ⚡</span>
            </h3>

            <div className="space-y-2.5">
              {['Urgent', 'High', 'Medium', 'Low'].map((prio) => {
                const count = stats?.priorityBreakdown?.find((p: any) => p.priority === prio)?.count || 0;
                const safeTotal = total || 1;
                const pct = Math.round((count / safeTotal) * 100);
                const colorClass =
                  prio === 'Urgent'
                    ? 'bg-rose-500'
                    : prio === 'High'
                    ? 'bg-orange-500'
                    : prio === 'Medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';

                return (
                  <div key={prio} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-300">
                        {prio === 'Urgent' ? '🚨 Urgent' : prio === 'High' ? '🔴 High' : prio === 'Medium' ? '🟡 Medium' : '🟢 Low'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Knowledge Base Helper */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-indigo-900/40 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Knowledge Runbooks 🧠</h4>
                <p className="text-xs text-slate-400">Pre-loaded troubleshooting guides</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our AI engine matches incoming tickets directly with verified technical fix runbooks (VPN, Outlook 365, Database pools, AWS 403s, Printers).
            </p>
            <Link
              href="/knowledge-base"
              className="inline-flex items-center justify-center w-full gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-indigo-700/30 transition-colors"
            >
              Browse Support Articles &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={() => {
          fetchStats();
        }}
      />
    </div>
  );
}
