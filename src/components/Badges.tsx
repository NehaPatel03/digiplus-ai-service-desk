import React from 'react';
import { TicketStatus, TicketPriority, TicketCategory } from '@/lib/types';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, { bg: string; text: string; border: string; emoji: string }> = {
    'Open': {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      emoji: '🔵'
    },
    'In Progress': {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      emoji: '🟡'
    },
    'Resolved': {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      emoji: '🟢'
    },
    'Closed': {
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      emoji: '⚪'
    }
  };

  const current = styles[status] || styles['Open'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}>
      <span>{current.emoji}</span>
      <span>{status}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, { bg: string; text: string; emoji: string }> = {
    'Urgent': {
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      text: 'text-rose-400',
      emoji: '🚨'
    },
    'High': {
      bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      text: 'text-orange-400',
      emoji: '🔴'
    },
    'Medium': {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      text: 'text-amber-400',
      emoji: '🟡'
    },
    'Low': {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      text: 'text-emerald-400',
      emoji: '🟢'
    }
  };

  const current = styles[priority] || styles['Medium'];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${current.bg}`}>
      <span>{current.emoji}</span>
      <span>{priority}</span>
    </span>
  );
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  const emojiMap: Record<string, string> = {
    'Hardware': '🖥️',
    'Software': '💾',
    'Network': '🌐',
    'Access & Security': '🔒',
    'Email & Communication': '✉️',
    'Cloud & Infrastructure': '☁️',
    'Billing & Accounts': '💳',
    'Other': '📦'
  };

  const emoji = emojiMap[category] || '📌';

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
      <span>{emoji}</span>
      <span>{category}</span>
    </span>
  );
}
