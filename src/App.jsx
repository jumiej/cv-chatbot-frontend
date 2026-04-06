import { useState, useEffect, useRef } from "react";
import "./App.css";
import jumiePhoto from "./assets/jumiePhoto.png";

function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested questions
  const suggestedQuestions = [
    "What are Jumie's technical skills?",
    "Tell me about Jumie's research experience",
    "What projects has Jumie worked on?",
    "What is Jumie's educational background?",
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (messageText) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user", content: textToSend };
    const newMessages = [...messages, userMessage];

    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInputValue("");
    setLoading(true);

    try {
      // const response = await fetch(`${API_URL}/api/chat`, {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.content) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + data.content,
                  };
                  return updated;
                });
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, there was an error. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle suggested question click
  const handleSuggestedClick = (question) => {
    sendMessage(question);
  };

  useEffect(() => {
    console.log("messages updated:", messages);
  }, [messages]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <img src={jumiePhoto} alt="Jumie" />
          <div className="header-discription">
            <h1> Jumie's CV Assistant</h1>
            <p className="subtitle">
              Ask me anything about Ojumoola Akinyode (Jumie)
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome Screen (show when no messages) */}
        {messages.length === 0 && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <h2>👋 Welcome!</h2>
              <p>I'm an AI assistant trained on Jumie's CV. Ask me about:</p>
              <ul className="features-list">
                <li>🎓 Education & Qualifications</li>
                <li>💻 Technical Skills & Expertise</li>
                <li>🔬 Research & Publications</li>
                <li>💼 Work Experience</li>
                <li>🚀 Projects & Achievements</li>
              </ul>
              <p className="try-asking">Try asking:</p>
              <div className="suggested-questions">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="suggested-btn"
                    onClick={() => handleSuggestedClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        {messages.length > 0 && (
          <div className="messages-container">
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div className="message-content">
                    <div className="message-role">
                      {msg.role === "user" ? "You" : "Jumie's CV Assistant"}
                    </div>
                    <div className="message-text">{msg.content || "..."}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Ask about Jumie's experience, skills, research..."
            disabled={loading}
            className="message-input"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !inputValue.trim()}
            className="send-button"
          >
            {loading ? "⏳" : "Send"}
          </button>
        </div>
        <p className="disclaimer">
          💡 This AI assistant answers based only on Jumie's CV. Responses are
          AI-generated.
        </p>
      </div>
    </div>
  );
}

export default App;
