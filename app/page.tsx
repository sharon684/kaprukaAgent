'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import ChatMessage from '@/components/ChatMessage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useRef, useEffect, useState } from 'react';

const transport = new DefaultChatTransport({
  api: '/api/chat',
});

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isDisabled = status !== 'ready';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleSuggestion = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="logo-container">
          <img src="https://www.kapruka.com/static/image/send-online-logo.png?v5" alt="Kapruka" height="30" />
          <span className="agent-title">AI Agent</span>
        </div>
      </header>

      <main className="chat-main">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : (
          <div className="messages-list">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {(status === 'submitted' || status === 'streaming') && (
              <div className="loading-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="chat-footer">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            className="chat-input"
            value={input}
            placeholder="Ask me anything about Kapruka..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isDisabled}
          />
          <button type="submit" className="btn-primary send-btn" disabled={isDisabled || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
