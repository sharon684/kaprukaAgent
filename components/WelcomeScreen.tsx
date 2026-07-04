interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  const suggestions = [
    { emoji: '🎂', text: 'Search for birthday cakes' },
    { emoji: '🚚', text: 'Can you deliver to Kandy?' },
    { emoji: '🌸', text: 'Show me anniversary flowers' },
    { emoji: '🎁', text: 'Gift ideas under Rs. 5000' },
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-icon">👋</div>
      <h2>Ayubowan! Let&apos;s find the perfect gift.</h2>
      <p>I&apos;m your Kapruka shopping assistant. I can help you search our catalog, check delivery dates to anywhere in Sri Lanka, and arrange a surprise gift!</p>

      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => onSuggestion(`${s.emoji} ${s.text}`)}
          >
            {s.emoji} {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
