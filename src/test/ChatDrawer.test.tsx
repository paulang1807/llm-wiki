import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatDrawer from '../components/ChatDrawer';

global.fetch = vi.fn();

describe('ChatDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ role: 'assistant', content: 'Mock response' })
    });
  });

  it('renders initial assistant message', () => {
    render(<ChatDrawer onClose={() => {}} />);
    expect(screen.getByText(/I can help you search your knowledge base/i)).toBeDefined();
  });

  it('allows user to send a message', async () => {
    render(<ChatDrawer onClose={() => {}} />);
    
    const input = screen.getByPlaceholderText(/Ask something.../i);
    const sendBtn = screen.getByLabelText(/Send Message/i);
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendBtn);
    
    expect(screen.getByText('Hello')).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getByText('Mock response')).toBeDefined();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ChatDrawer onClose={onClose} />);
    
    const closeBtn = screen.getByLabelText(/Close Assistant/i);
    fireEvent.click(closeBtn);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
