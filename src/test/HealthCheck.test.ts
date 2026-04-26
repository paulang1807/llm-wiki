import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performHealthCheck, repairHealthIssue } from '../lib/engine';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises', () => {
  const mockFs = {
    readdir: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  };
  return {
    ...mockFs,
    default: mockFs
  };
});

vi.mock('gray-matter', () => {
  const matter: any = vi.fn((content) => {
    const data: any = {};
    const titleMatch = content.match(/title:\s*([^\n\r]+)/);
    if (titleMatch) data.title = titleMatch[1].trim();
    
    const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
    if (tagsMatch) {
      data.tags = tagsMatch[1].split(',').map((t: string) => t.trim());
    }
    
    const body = content.split('---').pop() || content;
    return { data, content: body };
  });
  matter.stringify = vi.fn((body, data) => `---\n${JSON.stringify(data)}\n---\n${body}`);
  return {
    default: matter
  };
});

describe('Health Check Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies broken wikilinks', async () => {
    // 1st call for buildPageIndex, 2nd for walk
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'broken.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    vi.mocked(fs.readFile).mockResolvedValue('[[nonexistent]]');
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as any);

    const issues = await performHealthCheck();
    const broken = issues.find(i => i.type === 'broken_link');
    expect(broken).toBeDefined();
    expect(broken?.severity).toBe('high');
  });

  it('identifies orphaned notes', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'orphan.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    vi.mocked(fs.readFile).mockResolvedValue('Some content');
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as any);

    const issues = await performHealthCheck();
    const orphan = issues.find(i => i.type === 'orphan');
    expect(orphan).toBeDefined();
  });

  it('repairs missing titles by adding them to frontmatter', async () => {
    const issue: any = {
      type: 'missing_title',
      file: 'test-note.md',
      details: { suggested: 'Test Note' }
    };
    vi.mocked(fs.readFile).mockResolvedValue('---\n---\nContent');
    
    await repairHealthIssue(issue);
    
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      expect.stringContaining('test-note.md'),
      expect.stringContaining('"title":"Test Note"'),
      'utf-8'
    );
  });

  it('identifies untagged pages', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'untagged.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    vi.mocked(fs.readFile).mockResolvedValue('---\ntitle: Untagged\n---\nContent');
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as any);

    const issues = await performHealthCheck();
    const untagged = issues.find(i => i.type === 'untagged');
    expect(untagged).toBeDefined();
  });

  it('identifies tag inconsistencies', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'a.md', isDirectory: () => false, isFile: () => true },
      { name: 'b.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    
    const contentA = '---\ntitle: A\ntags: [MLOps]\n---\nContent';
    const contentB = '---\ntitle: B\ntags: [mlops]\n---\nContent';
    
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(contentA) // index a
      .mockResolvedValueOnce(contentB) // index b
      .mockResolvedValueOnce(contentA) // walk a
      .mockResolvedValueOnce(contentB); // walk b
      
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as any);

    const issues = await performHealthCheck();
    const inc = issues.find(i => i.type === 'tag_inconsistency');
    expect(inc).toBeDefined();
    expect(inc?.details.tags).toContain('MLOps');
    expect(inc?.details.tags).toContain('mlops');
  });

  it('identifies missing connections', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'Target.md', isDirectory: () => false, isFile: () => true },
      { name: 'Source.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    
    const contentTarget = '---\ntitle: Target\n---\nContent';
    const contentSource = '---\ntitle: Source\n---\nI mention Target here.';

    // 1st pair for buildPageIndex, 2nd pair for walk
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(contentTarget) 
      .mockResolvedValueOnce(contentSource) 
      .mockResolvedValueOnce(contentTarget) 
      .mockResolvedValueOnce(contentSource); 
      
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as any);

    const issues = await performHealthCheck();
    const conn = issues.find(i => i.type === 'missing_connection' && i.file === 'Source.md');
    expect(conn).toBeDefined();
    expect(conn?.details.suggestedLink).toBe('Target');
  });

  it('continues to identify orphans even if tagged with needs-linking', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'acknowledged.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    
    const content = '---\ntitle: Acknowledged\ntags: [needs-linking]\n---\nContent';
    
    vi.mocked(fs.readFile).mockResolvedValue(content);
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as any);

    const issues = await performHealthCheck();
    const orphan = issues.find(i => i.type === 'orphan');
    expect(orphan).toBeDefined();
  });

  it('repairing an orphan creates links in other files if mentions exist', async () => {
    const issue: any = {
      type: 'orphan',
      file: 'Orphan.md'
    };
    
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'Orphan.md', isDirectory: () => false, isFile: () => true },
      { name: 'MentionsOrphan.md', isDirectory: () => false, isFile: () => true }
    ] as any);
    
    const orphanContent = '---\ntitle: MyOrphan\n---\nOrphan body';
    const mentionContent = '---\ntitle: Source\n---\nCheck out MyOrphan here.';
    
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(orphanContent) // build index Orphan
      .mockResolvedValueOnce(mentionContent) // build index Source
      .mockResolvedValueOnce(orphanContent); // repair read Orphan
      
    // The repair function will then loop through the index and read every file
    // In our case, it will read MentionsOrphan.md
    vi.mocked(fs.readFile).mockResolvedValueOnce(mentionContent); 
    
    const result = await repairHealthIssue(issue);
    
    expect(result.success).toBe(true);
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      expect.stringContaining('MentionsOrphan.md'),
      expect.stringContaining('[[MyOrphan]]'),
      'utf-8'
    );
  });
});
