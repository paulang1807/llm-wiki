import { useState } from 'react';

interface ChatDrawerProps {
  onClose: () => void;
}

export default function ChatDrawer({ onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hi! I can help you search your knowledge base or answer questions based on your notes.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    
    // Stub for now. Will connect to an AI route later.
    setTimeout(() => {
      setMessages([...newMessages, { role: 'assistant', content: 'This is a stub response. The API is not yet connected.' }]);
    }, 1000);
  };

  return (
    <div className="chat-drawer" style={{ right: 0 }}>
      <div className="chat-header">
        <div className="chat-title"><i className="fa-solid fa-robot"></i> AI Assistant</div>
        <button className="icon-btn" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <div className="chat-bubble">
              <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
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
        <button className="chat-send" onClick={handleSend}><i className="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  );
}
