import { Message } from '@ai-sdk/react';
import ProductCard from './ProductCard';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'assistant';

  return (
    <div className={`message-wrapper ${isAgent ? 'agent' : 'user'}`}>
      {isAgent && (
        <div className="avatar agent-avatar">
          <img src="https://www.kapruka.com/static/icons/favicon.ico" alt="K" width="16" />
        </div>
      )}
      
      <div className="message-content">
        {message.content && (
          <div className="text-bubble">
            {message.content}
          </div>
        )}

        {/* Render Rich UI for Tool Invocations */}
        {message.toolInvocations && message.toolInvocations.map(toolInvocation => {
          const { toolName, toolCallId, state } = toolInvocation;

          if (state !== 'result') {
            return (
              <div key={toolCallId} className="tool-loading">
                <span className="spinner">🔄</span>
                <span className="tool-text">
                  {toolName === 'kapruka_search_products' ? 'Searching Kapruka catalog...' : 
                   toolName === 'kapruka_check_delivery' ? 'Checking delivery options...' :
                   'Working on it...'}
                </span>
              </div>
            );
          }

          const { result } = toolInvocation;

          // Handle Search Results
          if (toolName === 'kapruka_search_products' && Array.isArray(result)) {
            if (result.length === 0) return null;
            return (
              <div key={toolCallId} className="products-carousel">
                {result.slice(0, 5).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          }

          // Handle Delivery Check
          if (toolName === 'kapruka_check_delivery') {
            return (
              <div key={toolCallId} className="delivery-card">
                <div className="delivery-icon">{result.deliverable ? '🚚' : '❌'}</div>
                <div className="delivery-info">
                  <strong>{result.deliverable ? 'Delivery Available!' : 'Delivery Not Available'}</strong>
                  {result.deliverable && <p>Estimated rate: Rs. {result.rate}</p>}
                  {result.perishable_warning && <p className="warning">⚠️ {result.perishable_warning}</p>}
                </div>
              </div>
            );
          }
          
          // Handle Create Order (Checkout Link)
          if (toolName === 'kapruka_create_order' && result.pay_url) {
            return (
              <div key={toolCallId} className="checkout-card">
                <h3>Order Ready: {result.order_number}</h3>
                <p>Total: {result.total}</p>
                <a href={result.pay_url} target="_blank" rel="noopener noreferrer" className="btn-primary checkout-btn">
                  Secure Checkout
                </a>
                <small>Link expires in {result.expires_in_minutes} minutes</small>
              </div>
            );
          }

          return null;
        })}
      </div>

      <style jsx>{`
        .message-wrapper {
          display: flex;
          gap: 12px;
          max-width: 90%;
        }
        .message-wrapper.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .agent-avatar {
          background: #fff;
          border: 1px solid var(--color-border);
        }
        .message-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }
        .text-bubble {
          padding: 12px 18px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .user .text-bubble {
          background: var(--color-accent);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .agent .text-bubble {
          background: #fff;
          color: var(--color-foreground);
          border: 1px solid var(--color-border);
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        
        .products-carousel {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 8px 4px 16px;
          margin: 0 -4px;
          scrollbar-width: thin;
        }
        .products-carousel::-webkit-scrollbar {
          height: 6px;
        }
        .products-carousel::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 10px;
        }

        .tool-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--color-text-secondary);
          background: #fff;
          padding: 8px 12px;
          border-radius: var(--border-radius-pill);
          width: fit-content;
          border: 1px solid var(--color-border);
        }
        .spinner {
          animation: spin 2s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .delivery-card, .checkout-card {
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          padding: 16px;
          display: flex;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .checkout-card {
          flex-direction: column;
          align-items: flex-start;
          border-color: var(--color-accent);
        }
        .delivery-icon {
          font-size: 24px;
        }
        .delivery-info p {
          margin: 4px 0 0;
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        .warning {
          color: var(--color-destructive) !important;
        }
        .checkout-btn {
          margin-top: 12px;
          text-decoration: none;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
