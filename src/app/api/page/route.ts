export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { WIKI_DIR, ARCHIVE_DIR, buildPageIndex, isSafeWikiPath, normalizeTags } from '@/lib/engine';

function normalizeConfidence(raw: unknown, fallback = 0.85): number {
  const num = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseFloat(raw) : NaN;
  if (Number.isNaN(num) || num <= 0) return fallback;
  if (num > 1) return Math.min(1, num / 100);
  return num;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagePath = searchParams.get('path');
  
  if (!pagePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const fullPath = path.join(WIKI_DIR, pagePath);
    // Security check
    if (!isSafeWikiPath(fullPath, WIKI_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const [content, stats] = await Promise.all([
      fs.readFile(fullPath, 'utf-8'),
      fs.stat(fullPath).catch(() => null)
    ]);
    const { data, content: body } = matter(content);
    if (data.tags !== undefined) {
      data.tags = normalizeTags(data.tags);
    }
    data.confidence = normalizeConfidence(data.confidence);
    if (!data.last_updated) {
      if (data.date instanceof Date) {
        data.last_updated = data.date.toISOString().split('T')[0];
      } else if (typeof data.date === 'string' && data.date.trim()) {
        data.last_updated = data.date.split('T')[0];
      } else if (stats) {
        data.last_updated = new Date(stats.mtimeMs).toISOString().split('T')[0];
      }
    }
    const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);

    return NextResponse.json({
      frontmatter: data,
      content: body,
      index
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const { path: pagePath, content, frontmatter } = await request.json();
  
  if (!pagePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const fullPath = path.join(WIKI_DIR, pagePath);
    if (!isSafeWikiPath(fullPath, WIKI_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const sanitizedFrontmatter = { ...frontmatter };
    if (sanitizedFrontmatter.tags !== undefined) {
      sanitizedFrontmatter.tags = normalizeTags(sanitizedFrontmatter.tags, sanitizedFrontmatter.title);
    }
    sanitizedFrontmatter.confidence = normalizeConfidence(sanitizedFrontmatter.confidence);

    const newFileContent = matter.stringify(content, sanitizedFrontmatter);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, newFileContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const archivePath = path.join(ARCHIVE_DIR, pagePath);
    
    if (!isSafeWikiPath(fullPath, WIKI_DIR) || !isSafeWikiPath(archivePath, ARCHIVE_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // Ensure archive directory exists
    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    
    // Move file to archive
    await fs.rename(fullPath, archivePath);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
