import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IngestView from '../components/IngestView';

global.fetch = vi.fn();

describe('IngestView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, path: 'Inbox/test.md' })
    });
  });

  it('renders metadata fields in Quick Note tab', () => {
    render(<IngestView />);
    
    // Switch to Quick Note tab
    fireEvent.click(screen.getByText(/Quick Note/i));
    
    expect(screen.getByLabelText(/TITLE \(OPTIONAL\)/i)).toBeDefined();
    expect(screen.getByLabelText(/DATE \(OPTIONAL\)/i)).toBeDefined();
  });

  it('sends title and date metadata when ingesting a note', async () => {
    render(<IngestView />);
    
    fireEvent.click(screen.getByText(/Quick Note/i));
    
    const titleInput = screen.getByPlaceholderText(/Note title.../i);
    const dateInput = screen.getByLabelText(/DATE \(OPTIONAL\)/i);
    const textArea = screen.getByPlaceholderText(/Type or paste your notes here/i);
    const ingestBtn = screen.getByText(/Ingest Note/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Note Title' } });
    fireEvent.change(dateInput, { target: { value: '2023-10-27' } });
    fireEvent.change(textArea, { target: { value: 'Some note content' } });
    
    fireEvent.click(ingestBtn);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ingest/paste',
        expect.objectContaining({
          body: JSON.stringify({
            text: 'Some note content',
            title: 'Test Note Title',
            date: '2023-10-27'
          })
        })
      );
    });
  });

  it('defaults to current date if no date is specified in the API (handled on server)', async () => {
    render(<IngestView />);
    fireEvent.click(screen.getByText(/Quick Note/i));
    
    const textArea = screen.getByPlaceholderText(/Type or paste your notes here/i);
    const ingestBtn = screen.getByText(/Ingest Note/i);
    
    fireEvent.change(textArea, { target: { value: 'Content' } });
    fireEvent.click(ingestBtn);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ingest/paste',
        expect.objectContaining({
          body: expect.stringContaining('"date":""')
        })
      );
    });
  });
});
