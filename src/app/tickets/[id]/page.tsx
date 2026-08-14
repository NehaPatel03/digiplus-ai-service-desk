'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Save, 
  Loader2, 
  RotateCcw,
  Zap,
  Tag,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, KnowledgeArticle, AIAnalysisResult } from '@/lib/types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/Badges';

const ALL_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
const ALL_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const ALL_CATEGORIES: TicketCategory[] = [
  'Network',
  'Software',
  'Hardware',
  'Access & Security',
  'Email & Communication',
  'Cloud & Infrastructure',
  'Billing & Accounts',
  'Other'
];

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [savingResolution, setSavingResolution] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [category, setCategory] = useState<TicketCategory>('Other');

  // AI & KB state
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [relevantArticles, setRelevantArticles] = useState<KnowledgeArticle[]>([]);
  const [expandedArticleId, setExpandedArticleId] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const t: Ticket = data.data;
        setTicket(t);
        setStatus(t.status);
        setPriority(t.priority);
        setCategory(t.category);
        setResolutionText(t.resolution || '');

        // If ticket already has AI analysis stored
        if (t.ai_summary) {
          setAiResult({
            summary: t.ai_summary,
            suggestedCategory: (t.ai_suggested_category as TicketCategory) || t.category,
            suggestedPriority: (t.ai_suggested_priority as TicketPriority) || t.priority,
            possibleCause: t.ai_cause || '',
            suggestedSolution: t.ai_solution || '',
            relevantArticleIds: [],
            keyTroubleshootingSteps: t.ai_solution ? t.ai_solution.split('\n').filter(Boolean) : []
          });
        }

        // Fetch relevant KB articles
        fetchRelevantArticles(t.title, t.description, t.category);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelevantArticles = async (title: string, desc: string, cat: string) => {
    try {
      const params = new URLSearchParams({
        ticketTitle: title,
        ticketDesc: desc,
        category: cat
      });
      const res = await fetch(`/api/knowledge-base?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRelevantArticles(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load matching KB articles:', err);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // Handle AI analysis trigger
  const handleAnalyzeWithAI = async () => {
    if (!ticket) return;
    try {
      setAnalyzing(true);
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id })
      });

      const data = await res.json();
      if (data.success) {
        setTicket(data.data.ticket);
        setAiResult(data.data.analysis);
        if (data.data.relevantArticles) {
          setRelevantArticles(data.data.relevantArticles);
        }
        showToast('AI Analysis completed successfully! 🤖⚡');
      } else {
        alert(data.error || 'Failed to complete AI analysis');
      }
    } catch (err: any) {
      alert(err.message || 'Error running AI analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  // Update Status / Metadata
  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
        setStatus(newStatus);
        showToast(`Status updated to ${newStatus} ✅`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Save Resolution & Mark Resolved
  const handleSaveResolution = async () => {
    if (!ticket) return;
    if (!resolutionText.trim()) {
      alert('Please enter resolution notes before saving.');
      return;
    }

    try {
      setSavingResolution(true);
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: resolutionText.trim(),
          status: 'Resolved'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
        setStatus('Resolved');
        showToast('Incident marked as Resolved with notes! 🟢');
      }
    } catch (err) {
      console.error('Error saving resolution:', err);
    } finally {
      setSavingResolution(false);
    }
  };

  // Apply AI solution to resolution text area
  const handleApplyAISolutionToResolution = () => {
    if (!aiResult) return;
    const formatted = `[AI Assisted Resolution]\nCause Identified: ${aiResult.possibleCause}\n\nApplied Solution:\n${aiResult.suggestedSolution}`;
    setResolutionText(formatted);
    showToast('AI solution copied into resolution box! 📋');
  };

  // Apply AI Category & Priority recommendations
  const handleApplyAIRecommendations = async () => {
    if (!aiResult || !ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: aiResult.suggestedCategory,
          priority: aiResult.suggestedPriority
        })
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
        setCategory(aiResult.suggestedCategory);
        setPriority(aiResult.suggestedPriority);
        showToast('Updated category and priority to AI recommendation! ⚡');
      }
    } catch (err) {
      console.error('Failed to apply AI recommendations:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-sm text-slate-400">The incident you requested could not be located in SQLite database.</p>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-2xl shadow-indigo-600/50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ticket ID:</span>
          <span className="font-mono font-bold text-sm text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-lg">
            #{ticket.id}
          </span>
        </div>
      </div>

      {/* Ticket Header & Status Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {ticket.title}
            </h1>
            <p className="text-xs text-slate-400">
              Submitted on{' '}
              {new Date(ticket.created_at).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Status Switcher Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 font-medium">Quick Status:</span>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  ticket.status === s
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s === 'Open' ? '🔵 Open' : s === 'In Progress' ? '🟡 In Progress' : s === 'Resolved' ? '🟢 Resolved' : '⚪ Closed'}
              </button>
            ))}
          </div>
        </div>

        {/* User Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Incident Description</span>
          </h3>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>
      </div>

      {/* Main 2-Column Workflow: AI Analysis (Left) & Knowledge Base + Resolution (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: AI Assistant 🤖 */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/50 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>AI Incident Analysis</span>
                    <span>🤖</span>
                  </h2>
                  <p className="text-xs text-indigo-300">Automated triage, root cause & solution generation</p>
                </div>
              </div>

              <button
                onClick={handleAnalyzeWithAI}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiResult ? 'Re-Analyze 🤖' : 'Analyze with AI 🤖'}</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Output Content */}
            {analyzing ? (
              <div className="py-12 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-indigo-900/40">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                  <div className="relative w-12 h-12 rounded-full bg-indigo-600/40 border border-indigo-500 flex items-center justify-center text-indigo-300">
                    <Bot className="w-6 h-6 animate-bounce" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">AI Engine Running Triage 🤖</h4>
                <p className="text-xs text-indigo-300 max-w-xs mx-auto">
                  Evaluating natural language symptoms, identifying root causes, and matching runbooks...
                </p>
              </div>
            ) : aiResult ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* AI Summary */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> AI Executive Summary
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {aiResult.summary}
                  </p>
                </div>

                {/* AI Recommendations (Category & Priority) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      AI Suggested Classification ⚡
                    </span>
                    {(ticket.category !== aiResult.suggestedCategory || ticket.priority !== aiResult.suggestedPriority) && (
                      <button
                        onClick={handleApplyAIRecommendations}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                      >
                        <Zap className="w-3 h-3" /> Apply to Ticket
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
                      <span className="text-slate-400">Category: </span>
                      <strong className="text-white">{aiResult.suggestedCategory}</strong>
                    </div>
                    <div className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
                      <span className="text-slate-400">Priority: </span>
                      <strong className="text-white">{aiResult.suggestedPriority}</strong>
                    </div>
                  </div>
                </div>

                {/* Root Cause */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Possible Root Cause 🔍
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiResult.possibleCause}
                  </p>
                </div>

                {/* Suggested Actionable Solution */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Step-by-Step Suggested Solution 🛠️
                    </span>
                    <button
                      onClick={handleApplyAISolutionToResolution}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Use as Resolution</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    {aiResult.suggestedSolution}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <Bot className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No AI analysis generated yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click the &quot;Analyze with AI 🤖&quot; button above to trigger full diagnostic reasoning.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Relevant Knowledge Base 🧠 & Resolution Panel 📝 */}
        <div className="space-y-6">
          
          {/* Relevant Support Articles Section 🧠 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>Relevant Knowledge Base Runbooks</span>
                    <span>🧠</span>
                  </h3>
                  <p className="text-xs text-slate-400">Contextual technical articles matching this issue</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                {relevantArticles.length} matched
              </span>
            </div>

            <div className="space-y-3">
              {relevantArticles.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No direct runbook matches found. You can browse all articles in the Knowledge Base tab.
                </p>
              ) : (
                relevantArticles.map((article) => {
                  const isExpanded = expandedArticleId === article.id;
                  return (
                    <div
                      key={article.id}
                      className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="space-y-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {article.category}
                            </span>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {article.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {article.summary}
                          </p>
                        </div>
                        <div className="text-slate-400 shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3 text-xs text-slate-300 animate-in fade-in duration-150">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-200">
                            {article.content}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              {article.tags.map((tag) => (
                                <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                setResolutionText(`[Applied KB Runbook: ${article.title}]\n\n${article.content}`);
                                showToast('Runbook steps copied into resolution box! 📋');
                              }}
                              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Apply to Resolution
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Record Outcome / Resolution Section 📝 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Incident Resolution & Outcome</span>
                  <span>✅</span>
                </h3>
                <p className="text-xs text-slate-400">Record final fix actions and complete incident lifecycle</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Resolution Notes 📝
              </label>
              <textarea
                rows={5}
                placeholder="Document the troubleshooting steps taken, root cause verified, and confirmation of resolution..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                {ticket.resolution ? '🟢 Outcome already saved' : '🔴 Resolution pending'}
              </span>

              <button
                onClick={handleSaveResolution}
                disabled={savingResolution}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                {savingResolution ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Mark Resolved ✅</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
