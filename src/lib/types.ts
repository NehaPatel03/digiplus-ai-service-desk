export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketCategory = 
  | 'Hardware' 
  | 'Software' 
  | 'Network' 
  | 'Access & Security' 
  | 'Email & Communication' 
  | 'Cloud & Infrastructure'
  | 'Billing & Accounts' 
  | 'Other';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  status: TicketStatus;
  resolution: string | null;
  ai_summary: string | null;
  ai_cause: string | null;
  ai_solution: string | null;
  ai_suggested_category: string | null;
  ai_suggested_priority: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  category: TicketCategory;
  summary: string;
  content: string;
  tags: string[]; // parsed from JSON string
  created_at: string;
}

export interface AIAnalysisResult {
  summary: string;
  suggestedCategory: TicketCategory;
  suggestedPriority: TicketPriority;
  possibleCause: string;
  suggestedSolution: string;
  relevantArticleIds: number[];
  keyTroubleshootingSteps: string[];
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  recentTickets: Ticket[];
  priorityBreakdown: { priority: TicketPriority; count: number }[];
  categoryBreakdown: { category: TicketCategory; count: number }[];
}
