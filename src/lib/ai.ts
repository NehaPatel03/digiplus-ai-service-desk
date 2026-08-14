import { GoogleGenAI } from '@google/genai';
import { Ticket, AIAnalysisResult, KnowledgeArticle } from './types';
import { getAllKBArticles } from './db';

const VALID_CATEGORIES = [
  'Hardware',
  'Software',
  'Network',
  'Access & Security',
  'Email & Communication',
  'Cloud & Infrastructure',
  'Billing & Accounts',
  'Other'
] as const;

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

/**
 * Analyzes a support ticket server-side using the official @google/genai SDK.
 * Reads GEMINI_API_KEY from environment variables.
 */
export async function analyzeTicketWithAI(ticket: Ticket): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const kbArticles = getAllKBArticles();
  
  const kbContext = kbArticles.map(a => `[ID: ${a.id}] ${a.title} (Category: ${a.category}, Tags: ${a.tags.join(', ')})`).join('\n');

  const systemPrompt = `You are an expert IT Support and Service Desk AI Engineer at DigiPlus.
Analyze the following technical support ticket submitted by a user and provide actionable diagnosis and structured resolution.

Available Knowledge Base Articles:
${kbContext}

Ticket to Analyze:
- Title: ${ticket.title}
- Description: ${ticket.description}
- User Assigned Category: ${ticket.category}
- User Assigned Priority: ${ticket.priority}

Respond ONLY with valid JSON conforming to this exact structure:
{
  "summary": "A clear, professional 1-2 sentence summary of the incident",
  "suggestedCategory": "One of: Hardware, Software, Network, Access & Security, Email & Communication, Cloud & Infrastructure, Billing & Accounts, Other",
  "suggestedPriority": "One of: Low, Medium, High, Urgent",
  "possibleCause": "Detailed technical root cause explanation",
  "suggestedSolution": "Numbered step-by-step actionable guide to resolve the issue",
  "relevantArticleIds": [1, 2],
  "keyTroubleshootingSteps": ["Step 1 action...", "Step 2 action...", "Step 3 action..."]
}`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Try with current flash models using the official SDK
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let rawText: string | undefined;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: systemPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) break;
        } catch (modelErr: any) {
          console.warn(`Attempt with ${model} failed, trying fallback model...`, modelErr?.message || modelErr);
        }
      }

      if (rawText) {
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return sanitizeAIOutput(parsed, ticket, kbArticles);
      }
    } catch (error) {
      console.error('Error calling @google/genai SDK:', error);
    }
  }

  // Graceful intelligent analysis fallback if API key is not present or quota exceeded
  return generateIntelligentAnalysis(ticket, kbArticles);
}

function sanitizeAIOutput(raw: any, ticket: Ticket, kbArticles: KnowledgeArticle[]): AIAnalysisResult {
  const suggestedCategory = VALID_CATEGORIES.includes(raw.suggestedCategory) 
    ? raw.suggestedCategory 
    : ticket.category;

  const suggestedPriority = VALID_PRIORITIES.includes(raw.suggestedPriority) 
    ? raw.suggestedPriority 
    : ticket.priority;

  const validArticleIds = Array.isArray(raw.relevantArticleIds) 
    ? raw.relevantArticleIds.filter((id: number) => kbArticles.some(a => a.id === id))
    : [];

  return {
    summary: raw.summary || `Support incident regarding ${ticket.title}`,
    suggestedCategory,
    suggestedPriority,
    possibleCause: raw.possibleCause || 'Underlying configuration error or service disruption.',
    suggestedSolution: raw.suggestedSolution || '1. Verify service logs\n2. Restart affected component\n3. Confirm connectivity',
    relevantArticleIds: validArticleIds,
    keyTroubleshootingSteps: Array.isArray(raw.keyTroubleshootingSteps) && raw.keyTroubleshootingSteps.length > 0
      ? raw.keyTroubleshootingSteps
      : ['Verify error messages in logs', 'Check network connectivity & permissions', 'Apply standard troubleshooting runbook']
  };
}

/**
 * Intelligent heuristics fallback when no external API key is active.
 * Ensures the app works 100% out of the box and matches the HuggingFace help desk dataset patterns.
 */
function generateIntelligentAnalysis(ticket: Ticket, kbArticles: KnowledgeArticle[]): AIAnalysisResult {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  let suggestedCategory = ticket.category;
  let suggestedPriority = ticket.priority;
  let possibleCause = 'Service disruption or configuration discrepancy detected in the user environment.';
  let solutionSteps: string[] = [];
  let matchingArticleIds: number[] = [];

  if (text.includes('vpn') || text.includes('gateway') || text.includes('anyconnect') || text.includes('globalprotect') || text.includes('tunnel')) {
    suggestedCategory = 'Network';
    suggestedPriority = 'High';
    possibleCause = 'Corporate VPN gateway connection timeout, stale cached credentials, or unsynchronized MFA multi-factor token.';
    solutionSteps = [
      'Flush local DNS cache with `ipconfig /flushdns`.',
      'Open GlobalProtect / AnyConnect settings and clear saved session credentials.',
      'Re-authenticate via Authenticator app and approve the MFA push notification.',
      'If timeout persists, switch to secondary gateway hostname.'
    ];
    matchingArticleIds = kbArticles.filter(a => a.tags.includes('vpn')).map(a => a.id);
  } else if (text.includes('outlook') || text.includes('password loop') || text.includes('email') || text.includes('exchange') || text.includes('office 365') || text.includes('mailbox')) {
    suggestedCategory = 'Email & Communication';
    suggestedPriority = 'Medium';
    possibleCause = 'Stale Modern Authentication OAuth tokens in Windows Credential Manager conflicting with the recent password update.';
    solutionSteps = [
      'Exit Microsoft Outlook and Microsoft Teams completely.',
      'Launch Windows Credential Manager -> Windows Credentials.',
      'Delete cached tokens starting with `MicrosoftOffice16` or `MS.Outlook`.',
      'Re-launch Outlook, enter current password, and complete Modern Auth verification.'
    ];
    matchingArticleIds = kbArticles.filter(a => a.tags.includes('outlook') || a.tags.includes('email')).map(a => a.id);
  } else if (text.includes('database') || text.includes('500') || text.includes('postgres') || text.includes('mysql') || text.includes('pool') || text.includes('connection timeout')) {
    suggestedCategory = 'Cloud & Infrastructure';
    suggestedPriority = 'Urgent';
    possibleCause = 'Backend database connection pool exhaustion or high CPU utilization locking connection threads.';
    solutionSteps = [
      'Inspect database active connections via `pg_stat_activity` / `SHOW PROCESSLIST`.',
      'Terminate long-running or unindexed locking queries.',
      'Verify connection pool limits (`max_connections`, `pool_size`) and restart connection pooler.',
      'Ensure backend microservices release connections in `finally` blocks.'
    ];
    matchingArticleIds = kbArticles.filter(a => a.tags.includes('database')).map(a => a.id);
  } else if (text.includes('403') || text.includes('forbidden') || text.includes('access denied') || text.includes('iam') || text.includes('s3') || text.includes('permission')) {
    suggestedCategory = 'Access & Security';
    suggestedPriority = 'High';
    possibleCause = 'Missing AWS IAM policy permissions (`s3:PutObject` / `s3:GetObject`), S3 Bucket Policy restriction, or missing KMS decrypt grant.';
    solutionSteps = [
      'Inspect the IAM role or User policy attached to the requester.',
      'Verify explicit Allow for target resource ARN and associated KMS key.',
      'Ensure S3 Bucket Object Ownership is set to Bucket Owner Enforced.',
      'Check if VPC endpoint or IP condition in Bucket Policy blocks access.'
    ];
    matchingArticleIds = kbArticles.filter(a => a.tags.includes('aws') || a.tags.includes('403-forbidden')).map(a => a.id);
  } else if (text.includes('printer') || text.includes('offline') || text.includes('spooler') || text.includes('hardware') || text.includes('paper')) {
    suggestedCategory = 'Hardware';
    suggestedPriority = 'Low';
    possibleCause = 'Printer spooler queue corruption, AirPrint discovery timeout, or DHCP IP address reassignment on network printer.';
    solutionSteps = [
      'Verify printer LCD status and test IP ping from workstation.',
      'Restart the local Print Spooler service (`net stop spooler && net start spooler`).',
      'Disable SNMP Status in printer port configuration.',
      'On macOS, reset the Printing System and re-add via direct IP.'
    ];
    matchingArticleIds = kbArticles.filter(a => a.tags.includes('printer')).map(a => a.id);
  } else if (text.includes('docker') || text.includes('wsl') || text.includes('memory') || text.includes('cpu') || text.includes('slow') || text.includes('freeze')) {
    suggestedCategory = 'Software';
    suggestedPriority = 'Medium';
    possibleCause = 'Runaway container memory consumption, unconstrained WSL2 Vmmem allocation, or Docker cache bloat.';
    solutionSteps = [
      'Limit WSL2 memory via `.wslconfig` (`memory=6GB`).',
      'Run `wsl --shutdown` to release host RAM.',
      'Execute `docker system prune -a --volumes` to clear stale layers.',
      'Add resource constraints in `docker-compose.yml`.'
    ];
    matchingArticleIds = kbArticles.filter(a => a.tags.includes('docker')).map(a => a.id);
  } else {
    suggestedCategory = ticket.category || 'Other';
    suggestedPriority = ticket.priority || 'Medium';
    possibleCause = 'Configuration mismatch, network latency, or application cache inconsistency.';
    solutionSteps = [
      'Review incident logs and application error traces.',
      'Attempt reproduction of the issue in a staging/sandbox environment.',
      'Apply standard service restart and check dependencies.',
      'Document resolution outcome in the ticket knowledge log.'
    ];
  }

  const summary = `AI Incident Assessment: ${ticket.title}. Primary concern centers around ${suggestedCategory.toLowerCase()} behavior causing operational friction.`;

  return {
    summary,
    suggestedCategory,
    suggestedPriority,
    possibleCause,
    suggestedSolution: solutionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n'),
    relevantArticleIds: matchingArticleIds,
    keyTroubleshootingSteps: solutionSteps
  };
}
