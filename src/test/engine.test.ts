import { describe, it, expect, vi, beforeEach } from 'vitest';
import { walkDir, countFiles, searchFiles, escapeRegExp, isSafeWikiPath, normalizeTags, isMeaningfulTag, WIKI_DIR } from '../lib/engine';
import fs from 'fs/promises';

type ReaddirResult = Awaited<ReturnType<typeof fs.readdir>>;

vi.mock('fs/promises', () => {
  const mockFs = {
    readdir: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    rename: vi.fn(),
  };
  return {
    ...mockFs,
    default: mockFs
  };
});

vi.mock('gray-matter', () => ({
  default: vi.fn(() => ({
    data: { title: 'Test' },
    content: 'Body with searchable keyword quantum'
  }))
}));

describe('engine logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('countFiles', () => {
    it('should count files in a directory recursively', async () => {
      const mockEntries = [
        { name: 'file1.md', isFile: () => true, isDirectory: () => false },
        { name: 'dir1', isFile: () => false, isDirectory: () => true },
      ];
      const mockSubEntries = [
        { name: 'file2.md', isFile: () => true, isDirectory: () => false },
      ];

      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(mockEntries as unknown as ReaddirResult)
        .mockResolvedValueOnce(mockSubEntries as unknown as ReaddirResult);

      const count = await countFiles('/mock/dir');
      expect(count).toBe(2);
    });
  });

  describe('walkDir', () => {
    it('should return a tree structure and prune empty dirs', async () => {
      const mockEntries = [
        { name: 'note.md', isFile: () => true, isDirectory: () => false },
        { name: 'emptyDir', isFile: () => false, isDirectory: () => true },
      ];

      vi.mocked(fs.readdir).mockResolvedValueOnce(mockEntries as unknown as ReaddirResult);
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as unknown as ReaddirResult);
      vi.mocked(fs.readFile).mockResolvedValue('---title: Test---\nContent');

      const tree = await walkDir('/mock/wiki', '/mock/wiki');

      expect(tree.length).toBeGreaterThan(0);
      expect(tree[0].type).toBe('file');
      expect(tree[0].title).toBe('Test');
    });
  });

  describe('searchFiles', () => {
    it('finds matching markdown notes without shell execution', async () => {
      const mockEntries = [
        { name: 'quantum.md', isFile: () => true, isDirectory: () => false },
      ];
      vi.mocked(fs.readdir).mockResolvedValueOnce(mockEntries as unknown as ReaddirResult);
      vi.mocked(fs.readFile).mockResolvedValue('---\ntitle: Test\n---\nBody with searchable keyword quantum');

      const results = await searchFiles('quantum');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test');
      expect(results[0].path).toBe('quantum.md');
    });

    it('returns empty array for blank query', async () => {
      const results = await searchFiles('   ');
      expect(results).toEqual([]);
    });
  });

  describe('escapeRegExp and isSafeWikiPath', () => {
    it('escapes regex metacharacters safely', () => {
      const escaped = escapeRegExp('C++ (Basics) [v1.0]');
      const regex = new RegExp(escaped);
      expect(regex.test('Learn C++ (Basics) [v1.0] today')).toBe(true);
    });

    it('blocks path traversal outside WIKI_DIR', () => {
      expect(isSafeWikiPath('Science/Physics.md', WIKI_DIR)).toBe(true);
      expect(isSafeWikiPath('../../etc/passwd', WIKI_DIR)).toBe(false);
    });

    it('normalizes tags and filters out single-character and punctuation tags', () => {
      expect(isMeaningfulTag('g')).toBe(false);
      expect(isMeaningfulTag(',')).toBe(false);
      expect(isMeaningfulTag('-')).toBe(false);
      expect(isMeaningfulTag('git')).toBe(true);

      const corrupted = ['g', 'i', 't', ',', '-', 'v', 'version-control', '#Git', 'git'];
      expect(normalizeTags(corrupted)).toEqual(['version-control', 'Git']);

      const stringTags = 'git, version-control, #force-push, a, -';
      expect(normalizeTags(stringTags)).toEqual(['git', 'version-control', 'force-push']);

      expect(normalizeTags(['x', '-'], 'Rewriting History')).toEqual(['rewriting-history']);
    });
  });
});
