'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Tag, 
  Sparkles, 
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { KnowledgeArticle } from '@/lib/types';
import { CategoryBadge } from '@/components/Badges';

const CATEGORIES = [
  'All',
  'Network',
  'Software',
  'Hardware',
  'Access & Security',
  'Email & Communication',
  'Cloud & Infrastructure'
];

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/knowledge-base?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (err) {
      console.error('Failed to load KB articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchArticles();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Technical Knowledge Base</span>
            <span>🧠</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standard operating procedures, verified IT runbooks, and troubleshooting guides
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Auto-Match Enabled ⚡</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search runbooks by keyword, tag (e.g. vpn, 403, postgres, docker)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? '📂 All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading knowledge base...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No support articles found</h3>
            <p className="text-xs text-slate-500">Try changing your search terms or category filter.</p>
          </div>
        ) : (
          articles.map((article) => {
            const isExpanded = expandedId === article.id;
            return (
              <div
                key={article.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : article.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge category={article.category} />
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                        KB-00{article.id}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white">
                      {article.title}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                          Hide Runbook <ChevronUp className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
                          View Runbook <ChevronDown className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/90 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode className="w-4 h-4" /> Standard Operating Procedure
                      </span>
                      <button
                        onClick={() => handleCopy(article.id, article.content)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                      >
                        {copiedId === article.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Runbook</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {article.content}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500 font-medium">Tags:</span>
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] text-cyan-300 bg-cyan-950/50 border border-cyan-900/40 px-2.5 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
