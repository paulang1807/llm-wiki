import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performHealthCheck, repairHealthIssue } from '../lib/engine';
import { HealthIssue } from '../lib/types';
import fs from 'fs/promises';

type ReaddirResult = Awaited<ReturnType<typeof fs.readdir>>;
type StatResult = Awaited<ReturnType<typeof fs.stat>>;

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
  const matterFn = vi.fn((content: string) => {
    const data: Record<string, unknown> = {};
    const titleMatch = content.match(/title:\s*([^\n\r]+)/);
    if (titleMatch) data.title = titleMatch[1].trim();

    const tagsArrayMatch = content.match(/tags:\s*\[([^\]]+)\]/);
    const tagsStringMatch = content.match(/tags:\s*"([^"]+)"/);
    if (tagsArrayMatch) {
      data.tags = tagsArrayMatch[1].split(',').map((t: string) => t.trim());
    } else if (tagsStringMatch) {
      data.tags = tagsStringMatch[1];
    }

    const body = content.split('---').pop() || content;
    return { data, content: body };
  });
  const matter = Object.assign(matterFn, {
    stringify: vi.fn((body: string, data: Record<string, unknown>) => `---\n${JSON.stringify(data)}\n---\n${body}`)
  });
  return {
    default: matter
  };
});

describe('Health Check Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies broken wikilinks', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'broken.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);
    vi.mocked(fs.readFile).mockResolvedValue('[[nonexistent]]');
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    const issues = await performHealthCheck();
    const broken = issues.find(i => i.type === 'broken_link');
    expect(broken).toBeDefined();
    expect(broken?.severity).toBe('high');
  });

  it('identifies orphaned notes', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'orphan.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);
    vi.mocked(fs.readFile).mockResolvedValue('Some content');
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    const issues = await performHealthCheck();
    const orphan = issues.find(i => i.type === 'orphan');
    expect(orphan).toBeDefined();
  });

  it('repairs missing titles by adding them to frontmatter', async () => {
    const issue: HealthIssue = {
      id: 'missing-title-1',
      type: 'missing_title',
      severity: 'medium',
      file: 'test-note.md',
      message: 'Missing title',
      fixable: true,
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
    ] as unknown as ReaddirResult);
    vi.mocked(fs.readFile).mockResolvedValue('---\ntitle: Untagged\n---\nContent');
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    const issues = await performHealthCheck();
    const untagged = issues.find(i => i.type === 'untagged');
    expect(untagged).toBeDefined();
  });

  it('identifies tag inconsistencies', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'a.md', isDirectory: () => false, isFile: () => true },
      { name: 'b.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);

    const contentA = '---\ntitle: A\ntags: [MLOps]\n---\nContent';
    const contentB = '---\ntitle: B\ntags: [mlops]\n---\nContent';

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(contentA)
      .mockResolvedValueOnce(contentB)
      .mockResolvedValueOnce(contentA)
      .mockResolvedValueOnce(contentB);

    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    const issues = await performHealthCheck();
    const inc = issues.find(i => i.type === 'tag_inconsistency');
    expect(inc).toBeDefined();
    expect(inc?.details?.tags).toContain('MLOps');
    expect(inc?.details?.tags).toContain('mlops');
  });

  it('identifies missing connections', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'Target.md', isDirectory: () => false, isFile: () => true },
      { name: 'Source.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);

    const contentTarget = '---\ntitle: Target\n---\nContent';
    const contentSource = '---\ntitle: Source\n---\nI mention Target here.';

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(contentTarget)
      .mockResolvedValueOnce(contentSource)
      .mockResolvedValueOnce(contentTarget)
      .mockResolvedValueOnce(contentSource);

    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    const issues = await performHealthCheck();
    const conn = issues.find(i => i.type === 'missing_connection' && i.file === 'Source.md');
    expect(conn).toBeDefined();
    expect(conn?.details?.suggestedLink).toBe('Target');
  });

  it('handles titles with regex metacharacters without throwing', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'cpp.md', isDirectory: () => false, isFile: () => true },
      { name: 'notes.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);

    const contentCpp = '---\ntitle: C++ (Programming)\n---\nBody';
    const contentNotes = '---\ntitle: Notes\n---\nLearning C++ (Programming) is fun.';

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(contentCpp)
      .mockResolvedValueOnce(contentNotes)
      .mockResolvedValueOnce(contentCpp)
      .mockResolvedValueOnce(contentNotes);

    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    await expect(performHealthCheck()).resolves.toBeDefined();
  });

  it('continues to identify orphans even if tagged with needs-linking', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'acknowledged.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);

    const content = '---\ntitle: Acknowledged\ntags: [needs-linking]\n---\nContent';

    vi.mocked(fs.readFile).mockResolvedValue(content);
    vi.mocked(fs.stat).mockResolvedValue({ mtimeMs: Date.now() } as unknown as StatResult);

    const issues = await performHealthCheck();
    const orphan = issues.find(i => i.type === 'orphan');
    expect(orphan).toBeDefined();
  });

  it('repairing an orphan creates links in other files if mentions exist', async () => {
    const issue: HealthIssue = {
      id: 'orphan-1',
      type: 'orphan',
      severity: 'low',
      file: 'Orphan.md',
      message: 'Orphan note',
      fixable: true
    };

    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'Orphan.md', isDirectory: () => false, isFile: () => true },
      { name: 'MentionsOrphan.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);

    const orphanContent = '---\ntitle: MyOrphan\n---\nOrphan body';
    const mentionContent = '---\ntitle: Source\n---\nCheck out MyOrphan here.';

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(orphanContent)
      .mockResolvedValueOnce(mentionContent)
      .mockResolvedValueOnce(orphanContent)
      .mockResolvedValueOnce(mentionContent);

    const result = await repairHealthIssue(issue);

    expect(result.success).toBe(true);
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      expect.stringContaining('MentionsOrphan.md'),
      expect.stringContaining('[[MyOrphan]]'),
      'utf-8'
    );
  });

  it('repairing an unmentioned orphan with comma-separated string tags preserves meaningful tags without spreading characters', async () => {
    const issue: HealthIssue = {
      id: 'orphan-git',
      type: 'orphan',
      severity: 'medium',
      file: 'RewritingHistory.md',
      message: 'Orphan note',
      fixable: true
    };

    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'RewritingHistory.md', isDirectory: () => false, isFile: () => true }
    ] as unknown as ReaddirResult);

    const orphanContent = '---\ntitle: Rewriting History\ntags: "git, version-control"\n---\nGit reset body';
    vi.mocked(fs.readFile).mockResolvedValue(orphanContent);

    const result = await repairHealthIssue(issue);

    expect(result.success).toBe(false);
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      expect.stringContaining('RewritingHistory.md'),
      expect.stringContaining('"tags":["git","version-control","needs-linking"]'),
      'utf-8'
    );
  });
});
