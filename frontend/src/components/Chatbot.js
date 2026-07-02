import React, { useState } from "react";
import { sendMessage } from "../services/chatService";

const Chatbot = ({ onVoiceInput }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;

    const newMessages = [...messages, { sender: "user", text: msg }];
    setMessages(newMessages);

    const data = await sendMessage(msg);
    const botReply = { sender: "bot", text: data.response };
    setMessages([...newMessages, botReply]);
    setInput("");

    // ✅ Speak bot reply aloud
    const utterance = new SpeechSynthesisUtterance(data.response);
    const selectedLang = localStorage.getItem("lang") || "en";
    const langMap = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    utterance.lang = langMap[selectedLang] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    const selectedLang = localStorage.getItem("lang") || "en";
    const langMap = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    recognition.lang = langMap[selectedLang] || "en-US";

    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setInput(voiceText);

      // ✅ Send voice text back to parent (RaiseComplaint textarea)
      if (onVoiceInput) {
        onVoiceInput(voiceText);
      }

      handleSendMessage(voiceText);
    };
  };

  return (
    <>
      <style>{`
        .chatbot-mic {
          background: linear-gradient(135deg, #457b9d, #1d3557);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s ease, background 0.3s ease;
        }
        .chatbot-mic:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, #1d3557, #0d1b2a);
        }
        .chatbot-mic:active {
          transform: scale(0.95);
        }
      `}</style>

      <div>
        {/* Your existing UI */}
        <button onClick={startVoiceInput} className="chatbot-mic">
          🎤
        </button>
      </div>
    </>
  );
};

export default Chatbot;