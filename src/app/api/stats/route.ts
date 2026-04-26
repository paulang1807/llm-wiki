import { NextResponse } from 'next/server';
import { countFiles, WIKI_DIR, RAW_DIR } from '@/lib/engine';

export async function GET() {
  const wikiPages = await countFiles(WIKI_DIR);
  const rawSources = await countFiles(RAW_DIR);
  return NextResponse.json({ wikiPages, rawSources });
}
