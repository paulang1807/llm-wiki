export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { walkDir, WIKI_DIR } from '@/lib/engine';

export async function GET() {
  const tree = await walkDir(WIKI_DIR, WIKI_DIR);
  return NextResponse.json(tree);
}
