import { describe, it, expect, vi, beforeEach } from 'vitest';
import { countMdFiles, getFirstMdPage } from '../lib/engine';
import fs from 'fs/promises';

type ReaddirResult = Awaited<ReturnType<typeof fs.readdir>>;

vi.mock('fs/promises', () => {
  const mockFs = {
    readdir: vi.fn(),
  };
  return {
    ...mockFs,
    default: mockFs
  };
});

describe('Domain hierarchy utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('countMdFiles', () => {
    it('should count only .md files recursively', async () => {
      vi.mocked(fs.readdir).mockImplementation(async (dirPath) => {
        const p = String(dirPath);
        if (p === '/AI') {
          return [
            { name: 'NLP', isDirectory: () => true, isFile: () => false },
            { name: 'config.json', isDirectory: () => false, isFile: () => true },
          ] as unknown as ReaddirResult;
        }
        if (p === '/AI/NLP') {
          return [
            { name: 'note1.md', isDirectory: () => false, isFile: () => true },
            { name: 'Sub', isDirectory: () => true, isFile: () => false },
          ] as unknown as ReaddirResult;
        }
        if (p === '/AI/NLP/Sub') {
          return [
            { name: 'note2.md', isDirectory: () => false, isFile: () => true },
          ] as unknown as ReaddirResult;
        }
        return [] as unknown as ReaddirResult;
      });

      const count = await countMdFiles('/AI');
      expect(count).toBe(2);
    });
  });

  describe('getFirstMdPage', () => {
    it('should find the first .md file deep in the hierarchy', async () => {
      vi.mocked(fs.readdir).mockImplementation(async (dirPath) => {
        const p = String(dirPath);
        if (p === '/AI') {
          return [{ name: 'DeepDir', isDirectory: () => true, isFile: () => false }] as unknown as ReaddirResult;
        }
        if (p === '/AI/DeepDir') {
          return [{ name: 'DeepestDir', isDirectory: () => true, isFile: () => false }] as unknown as ReaddirResult;
        }
        if (p === '/AI/DeepDir/DeepestDir') {
          return [{ name: 'finally.md', isDirectory: () => false, isFile: () => true }] as unknown as ReaddirResult;
        }
        return [] as unknown as ReaddirResult;
      });

      const pathResult = await getFirstMdPage('/AI', '/');
      expect(pathResult).toBe('AI/DeepDir/DeepestDir/finally.md');
    });

    it('should prefer files in current directory over subdirectories', async () => {
      vi.mocked(fs.readdir).mockImplementation(async (dirPath) => {
        const p = String(dirPath);
        if (p === '/AI') {
          return [
            { name: 'Sub', isDirectory: () => true, isFile: () => false },
            { name: 'top.md', isDirectory: () => false, isFile: () => true },
          ] as unknown as ReaddirResult;
        }
        if (p === '/AI/Sub') {
          return [{ name: 'deep.md', isDirectory: () => false, isFile: () => true }] as unknown as ReaddirResult;
        }
        return [] as unknown as ReaddirResult;
      });

      const pathResult = await getFirstMdPage('/AI', '/');
      expect(pathResult).toBe('AI/top.md');
    });
  });
});
