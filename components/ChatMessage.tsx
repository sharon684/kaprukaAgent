import { UIMessage } from 'ai';

interface ChatMessageProps {
  message: UIMessage;
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
        {message.parts.map((part, index) => {
          // Render text parts
          if (part.type === 'text') {
            return (
              <div key={index} className="text-bubble">
                {part.text}
              </div>
            );
          }

          // Render tool invocations with rich UI
          if (part.type.startsWith('tool-')) {
            const toolPart = part as any;
            const toolName = part.type.replace('tool-', '');

            // Tool is still loading
            if (toolPart.state === 'input-streaming' || toolPart.state === 'input-available') {
              return (
                <div key={index} className="tool-loading">
                  <span className="spinner">🔄</span>
                  <span className="tool-text">
                    {toolName === 'kapruka_search_products' ? 'Searching Kapruka catalog...' :
                     toolName === 'kapruka_check_delivery' ? 'Checking delivery options...' :
                     toolName === 'kapruka_get_product' ? 'Getting product details...' :
                     toolName === 'kapruka_create_order' ? 'Creating your order...' :
                     'Working on it...'}
                  </span>
                </div>
              );
            }

            // Tool result is available
            if (toolPart.state === 'output-available') {
              const result = toolPart.output as any;

              // Search Results → Product Cards
              if (toolName === 'kapruka_search_products' && Array.isArray(result)) {
                if (result.length === 0) return null;
                return (
                  <div key={index} className="products-carousel">
                    {result.slice(0, 6).map((product: any, i: number) => (
                      <div key={i} className="product-card">
                        <div className="product-image">
                          <img src={product.image_url || product.imageUrl || ''} alt={product.name || product.title || ''} />
                        </div>
                        <div className="product-info">
                          <h4 className="product-name">{product.name || product.title}</h4>
                          <div className="product-price">Rs. {Number(product.price).toLocaleString()}</div>
                          {(product.url || product.productUrl) && (
                            <a href={product.url || product.productUrl} target="_blank" rel="noopener noreferrer" className="btn-view">
                              View on Kapruka
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Delivery Check → Status Card
              if (toolName === 'kapruka_check_delivery' && result) {
                return (
                  <div key={index} className="delivery-card">
                    <div className="delivery-icon">{result.deliverable ? '🚚' : '❌'}</div>
                    <div className="delivery-info">
                      <strong>{result.deliverable ? 'Delivery Available!' : 'Delivery Not Available'}</strong>
                      {result.deliverable && result.rate && <p>Estimated rate: Rs. {result.rate}</p>}
                      {result.perishable_warning && <p className="warning">⚠️ {result.perishable_warning}</p>}
                    </div>
                  </div>
                );
              }

              // Order Created → Checkout Card
              if (toolName === 'kapruka_create_order' && result?.pay_url) {
                return (
                  <div key={index} className="checkout-card">
                    <h3>🎉 Order Ready: {result.order_number}</h3>
                    <p>Total: Rs. {result.total}</p>
                    <a href={result.pay_url} target="_blank" rel="noopener noreferrer" className="btn-primary checkout-btn">
                      💳 Secure Checkout
                    </a>
                    {result.expires_in_minutes && (
                      <small>Link expires in {result.expires_in_minutes} minutes</small>
                    )}
                  </div>
                );
              }

              // Product Details Card
              if (toolName === 'kapruka_get_product' && result) {
                return (
                  <div key={index} className="product-detail-card">
                    {(result.image_url || result.imageUrl) && (
                      <img src={result.image_url || result.imageUrl} alt={result.name || result.title || ''} className="detail-image" />
                    )}
                    <div className="detail-info">
                      <h3>{result.name || result.title}</h3>
                      <div className="product-price">Rs. {Number(result.price).toLocaleString()}</div>
                      {result.description && <p className="detail-desc">{result.description}</p>}
                      {(result.url || result.productUrl) && (
                        <a href={result.url || result.productUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                          View on Kapruka
                        </a>
                      )}
                    </div>
                  </div>
                );
              }
            }

            // Error state
            if (toolPart.state === 'output-error') {
              return (
                <div key={index} className="tool-error">
                  ⚠️ Something went wrong. Please try again.
                </div>
              );
            }
          }

          return null;
        })}
      </div>
    </div>
  );
}
