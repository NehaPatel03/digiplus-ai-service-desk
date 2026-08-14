import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, findRelevantKBArticles } from '@/lib/db';
import { analyzeTicketWithAI } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: 'ticketId is required' }, { status: 400 });
    }

    const ticket = getTicketById(Number(ticketId));
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    // Perform AI analysis
    const analysis = await analyzeTicketWithAI(ticket);

    // Save AI insights to the ticket record
    const updatedTicket = updateTicket(ticket.id, {
      ai_summary: analysis.summary,
      ai_cause: analysis.possibleCause,
      ai_solution: analysis.suggestedSolution,
      ai_suggested_category: analysis.suggestedCategory,
      ai_suggested_priority: analysis.suggestedPriority
    });

    // Find relevant knowledge base articles
    const matchedArticles = findRelevantKBArticles(
      ticket.title,
      ticket.description,
      analysis.suggestedCategory || ticket.category
    );

    return NextResponse.json({
      success: true,
      data: {
        ticket: updatedTicket,
        analysis,
        relevantArticles: matchedArticles
      }
    });
  } catch (error: any) {
    console.error('Error during AI analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI analysis failed' },
      { status: 500 }
    );
  }
}
