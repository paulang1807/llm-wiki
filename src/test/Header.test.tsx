import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/Header';

describe('Header Component', () => {
  it('calls onToggleChat when Assistant button is clicked', () => {
    const onToggleChat = vi.fn();
    render(
      <Header 
        view="welcome" 
        setView={() => {}} 
        onToggleChat={onToggleChat} 
        isChatOpen={false} 
        onToggleSidebar={() => {}} 
      />
    );
    
    const assistantBtn = screen.getByText(/Assistant/i);
    fireEvent.click(assistantBtn);
    
    expect(onToggleChat).toHaveBeenCalledTimes(1);
  });

  it('highlights the active view button', () => {
    render(
      <Header 
        view="graph" 
        setView={() => {}} 
        onToggleChat={() => {}} 
        isChatOpen={false} 
        onToggleSidebar={() => {}} 
      />
    );
    
    const graphBtn = screen.getByTitle('Graph View');
    expect(graphBtn.className).toContain('active');
  });
});
