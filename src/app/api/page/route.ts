export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { WIKI_DIR } from '@/lib/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagePath = searchParams.get('path');
  
  if (!pagePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const fullPath = path.join(WIKI_DIR, pagePath);
    // Security check
    if (!fullPath.startsWith(WIKI_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const { data, content: body } = matter(content);

    return NextResponse.json({
      frontmatter: data,
      content: body
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const { path: pagePath, content, frontmatter } = await request.json();
  
  if (!pagePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const fullPath = path.join(WIKI_DIR, pagePath);
    if (!fullPath.startsWith(WIKI_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const newFileContent = matter.stringify(content, frontmatter);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, newFileContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagePath = searchParams.get('path');
  
  if (!pagePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const fullPath = path.join(WIKI_DIR, pagePath);
    const archivePath = path.join(process.cwd(), 'archive', pagePath);
    
    if (!fullPath.startsWith(WIKI_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // Ensure archive directory exists
    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    
    // Move file to archive
    await fs.rename(fullPath, archivePath);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
