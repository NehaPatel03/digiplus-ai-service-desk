import { NextResponse } from 'next/server';
import { getAllKBArticles, findRelevantKBArticles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const ticketTitle = searchParams.get('ticketTitle') || undefined;
    const ticketDesc = searchParams.get('ticketDesc') || undefined;

    if (ticketTitle || ticketDesc) {
      const relevant = findRelevantKBArticles(ticketTitle || '', ticketDesc || '', category);
      return NextResponse.json({ success: true, data: relevant });
    }

    const articles = getAllKBArticles(search, category);
    return NextResponse.json({ success: true, count: articles.length, data: articles });
  } catch (error: any) {
    console.error('Failed to get knowledge base articles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
