import { NextResponse } from 'next/server';
import { buildGraph } from '@/lib/engine';

export async function GET() {
  const { nodes, edges } = await buildGraph();
  return NextResponse.json({ nodes, edges });
}
