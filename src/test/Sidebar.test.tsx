import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../components/Sidebar';

// Mock fetch
const mockTree = [
  { type: 'dir', name: 'Software Engineering', children: [
    { type: 'file', name: 'react.md', title: 'React Guide', path: 'Software Engineering/react.md' }
  ]}
];

global.fetch = vi.fn();

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => mockTree
    });
  });

  it('renders the knowledge base tree', async () => {
    render(<Sidebar isOpen={true} onToggle={() => {}} onSelectFile={() => {}} currentFile={null} treeVersion={0} />);
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineering')).toBeDefined();
    });
  });

  it('calls onSelectFile when a file is clicked', async () => {
    const onSelectFile = vi.fn();
    render(<Sidebar isOpen={true} onToggle={() => {}} onSelectFile={onSelectFile} currentFile={null} treeVersion={0} />);
    
    await waitFor(() => {
      const fileLink = screen.getByText('React Guide');
      fireEvent.click(fileLink);
      expect(onSelectFile).toHaveBeenCalledWith('Software Engineering/react.md');
    });
  });

  it('toggles directory visibility on click', async () => {
    render(<Sidebar isOpen={true} onToggle={() => {}} onSelectFile={() => {}} currentFile={null} treeVersion={0} />);
    
    await waitFor(() => {
      const dirHeader = screen.getByText('Software Engineering');
      fireEvent.click(dirHeader);
      // After click, the children should be hidden
      expect(screen.queryByText('React Guide')).toBeNull();
    });
  });
});
