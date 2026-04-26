import { NextResponse } from 'next/server';
import { buildGraph, countFiles, WIKI_DIR, RAW_DIR } from '@/lib/engine';

export async function GET() {
  const { nodes, edges } = await buildGraph();
  return NextResponse.json({ nodes, edges });
}
