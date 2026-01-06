import { useState } from 'react'
import { useEffect, useRef } from "react";
import './App.css'

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const MAX_MESSAGE_LENGTH = 1000;
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
  if (!sessionId) return;
  if (!API_URL) {
    console.error("VITE_API_URL not set");
  }
  fetch(`${API_URL}/chat/history/${sessionId}`)
    .then(res => res.json())
    .then(data => {
      if (data.messages) {
        setMessages(
          data.messages.map((m, index) => ({
            id: index,
            role: m.sender,
            text: m.text
          }))
        );
      }
    })
    .catch(err => {
      console.error("Failed to load history", err);
    });
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  if (input.length > MAX_MESSAGE_LENGTH) {
    alert(`Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`);
    return;
  }
  
  const userText = input;
  setIsLoading(true);
  setInput("");

  setMessages(prev => [
    ...prev,
    {
      id: Date.now(),
      role: "user",
      text: userText
    }
  ]);

  try {
    const res = await fetch(`${API_URL}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText,
        sessionId
      })
    });
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();

    if (data.sessionId && data.sessionId !== sessionId) {
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "ai",
        text: data.reply
      }
    ]);
  } catch (err) {
    console.error(err);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "ai",
        text: "Sorry, something went wrong. Please try again."
      }
    ]);
  } finally {
    setIsLoading(false);
  }
  };


  return (
    <>
      <div className="chat-container">

      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role}`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="typing">Agent is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === "Enter" && !isLoading) sendMessage();
          }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={isLoading}>Send</button>
      </div>
    </div>
    </>
  )
}

export default App
