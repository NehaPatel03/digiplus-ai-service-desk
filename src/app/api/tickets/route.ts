import { NextResponse } from 'next/server';
import { getAllTickets, createTicket } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const tickets = getAllTickets({ status, priority, category, search });
    return NextResponse.json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    console.error('Failed to get tickets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required fields.' },
        { status: 400 }
      );
    }

    const newTicket = createTicket({
      title: body.title.trim(),
      description: body.description.trim(),
      priority: body.priority,
      category: body.category,
    });

    return NextResponse.json({ success: true, data: newTicket }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
