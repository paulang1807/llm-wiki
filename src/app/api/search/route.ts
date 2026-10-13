export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { searchFiles } from '@/lib/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  try {
    const results = await searchFiles(q);
    return NextResponse.json(results);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
