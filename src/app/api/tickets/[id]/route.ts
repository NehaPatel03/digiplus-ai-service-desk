import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, deleteTicket } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    
    if (isNaN(ticketId)) {
      return NextResponse.json({ success: false, error: 'Invalid ticket ID.' }, { status: 400 });
    }

    const ticket = getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Failed to get ticket:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    
    if (isNaN(ticketId)) {
      return NextResponse.json({ success: false, error: 'Invalid ticket ID.' }, { status: 400 });
    }

    const body = await request.json();
    const updated = updateTicket(ticketId, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ticket not found or update failed.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    
    if (isNaN(ticketId)) {
      return NextResponse.json({ success: false, error: 'Invalid ticket ID.' }, { status: 400 });
    }

    const success = deleteTicket(ticketId);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully.' });
  } catch (error: any) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
