import { useState } from 'react';

interface ChatDrawerProps {
  onClose: () => void;
}

export default function ChatDrawer({ onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hi! I can help you search your knowledge base or answer questions based on your notes.' }
  ]);
  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-drawer" style={{ right: 0 }}>
      <div className="chat-header">
        <div className="chat-title"><i className="fa-solid fa-robot"></i> AI Assistant</div>
        <button className="icon-btn" onClick={onClose} aria-label="Close Assistant"><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <div className="chat-bubble">
              <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-bubble" style={{ opacity: 0.6 }}>
              <i className="fa-solid fa-ellipsis fa-fade"></i> AI is thinking...
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <textarea 
          className="chat-input" 
          placeholder="Ask something..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="chat-send" onClick={handleSend} aria-label="Send Message"><i className="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  );
}
