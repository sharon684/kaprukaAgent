export default function WelcomeScreen() {
  return (
    <div className="welcome-container">
      <div className="welcome-icon">👋</div>
      <h2>Ayubowan! Let's find the perfect gift.</h2>
      <p>I'm your Kapruka shopping assistant. I can help you search our catalog, check delivery dates to anywhere in Sri Lanka, and arrange a surprise gift!</p>
      
      <div className="suggestions">
        <div className="suggestion-chip">🎂 Search for birthday cakes</div>
        <div className="suggestion-chip">🚚 Can you deliver to Kandy?</div>
        <div className="suggestion-chip">🌸 Show me anniversary flowers</div>
      </div>

      <style jsx>{`
        .welcome-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 60px 20px;
          animation: fade-in 0.5s ease-out;
        }
        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        h2 {
          color: var(--color-accent);
          margin-bottom: 12px;
        }
        p {
          color: var(--color-text-secondary);
          max-width: 400px;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
        }
        .suggestion-chip {
          background: #fff;
          border: 1px solid var(--color-border);
          padding: 14px;
          border-radius: var(--border-radius);
          color: var(--color-accent);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .suggestion-chip:hover {
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(64, 41, 112, 0.08);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
