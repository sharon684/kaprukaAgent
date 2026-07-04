'use client';

import { useChat } from '@ai-sdk/react';
import ChatMessage from '@/components/ChatMessage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useRef, useEffect } from 'react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    maxSteps: 8,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          <WelcomeScreen />
        ) : (
          <div className="messages-list">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && (
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
            placeholder="Ask me anything..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </footer>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          background: var(--color-background);
          box-shadow: 0 0 20px rgba(0,0,0,0.05);
        }
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          z-index: 10;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .agent-title {
          font-weight: 600;
          color: var(--color-accent);
          font-size: 14px;
          padding: 4px 10px;
          background: var(--color-muted);
          border-radius: 50px;
        }
        .chat-main {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: var(--color-muted);
        }
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .chat-footer {
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid var(--color-border);
        }
        .input-form {
          display: flex;
          gap: 12px;
        }
        .chat-input {
          flex: 1;
          padding: 14px 20px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--color-border);
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus {
          border-color: var(--color-accent);
        }
        .loading-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: #fff;
          border-radius: 20px;
          width: fit-content;
          align-self: flex-start;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .dot {
          width: 8px;
          height: 8px;
          background: var(--color-text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
