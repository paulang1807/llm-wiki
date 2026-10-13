import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../components/Header';
import PageView from '../components/PageView';

global.fetch = vi.fn();

describe('Header Search & PageView Wikilink Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Header queries /api/search and navigates to selected search result', async () => {
    vi.mocked(global.fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/status')) {
        return {
          ok: true,
          json: async () => ({ aiEnabled: true })
        } as Response;
      }
      if (url.includes('/api/search')) {
        return {
          ok: true,
          json: async () => ([
            {
              title: 'React Guide',
              path: 'Software Engineering/react.md',
              category: 'Software Engineering',
              snippet: 'Hooks and components'
            }
          ])
        } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    const onSelectFile = vi.fn();
    render(
      <Header
        view="welcome"
        setView={() => {}}
        onToggleChat={() => {}}
        isChatOpen={false}
        onToggleSidebar={() => {}}
        onSelectFile={onSelectFile}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search knowledge base/i);
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('React Guide')).toBeDefined();
    });

    fireEvent.click(screen.getByText('React Guide'));
    expect(onSelectFile).toHaveBeenCalledWith('Software Engineering/react.md');
  });

  it('PageView resolves and navigates wikilinks whose paths contain spaces and filters out single-character tags', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: 'See [[React Guide]] for more details.',
        frontmatter: { title: 'Index Page', category: 'General', tags: ['g', 'i', 't', ',', '-', 'frontend'] },
        index: { 'React Guide': 'Software Engineering/react.md' }
      })
    } as Response);

    const onSelectFile = vi.fn();
    render(
      <PageView
        filePath="General/index.md"
        onSelectFile={onSelectFile}
        onRefresh={() => {}}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('React Guide')).toBeDefined();
    });

    expect(screen.getByText('#frontend')).toBeDefined();
    expect(screen.queryByText('#g')).toBeNull();
    expect(screen.queryByText('#,')).toBeNull();
    expect(screen.getByText('85%')).toBeDefined();

    const link = screen.getByText('React Guide');
    fireEvent.click(link);
    expect(onSelectFile).toHaveBeenCalledWith('Software Engineering/react.md');
  });
});
