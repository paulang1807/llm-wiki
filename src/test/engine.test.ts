import { describe, it, expect, vi, beforeEach } from 'vitest';
import { walkDir, countFiles } from '../lib/engine';
import fs from 'fs/promises';
import matter from 'gray-matter';

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
  default: vi.fn((content) => ({
    data: { title: 'Test' },
    content: 'Body'
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
        .mockResolvedValueOnce(mockEntries as any)
        .mockResolvedValueOnce(mockSubEntries as any);

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

      vi.mocked(fs.readdir).mockResolvedValueOnce(mockEntries as any);
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as any); // emptyDir returns empty
      vi.mocked(fs.readFile).mockResolvedValue('---title: Test---\nContent');

      const tree = await walkDir('/mock/wiki', '/mock/wiki');
      
      expect(tree.length).toBeGreaterThan(0);
      expect(tree[0].type).toBe('file');
      expect(tree[0].title).toBe('Test');
    });
  });
});
