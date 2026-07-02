import React, { useState } from "react";
import { sendMessage } from "../services/chatService";

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {
      const voiceInput = event.results[0][0].transcript;
      setTranscript(voiceInput);

      // Send to backend chatbot
      const data = await sendMessage(voiceInput);
      setReply(data.response);

      // Speak reply aloud
      const utterance = new SpeechSynthesisUtterance(data.response);
      window.speechSynthesis.speak(utterance);
    };

    recognition.onend = () => setListening(false);
  }

  const startListening = () => {
    if (recognition) {
      setListening(true);
      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
      <h3>Voice Assistant</h3>
      <button onClick={startListening} disabled={listening}>
        {listening ? "Listening..." : "🎤 Speak"}
      </button>
      <p><strong>You said:</strong> {transcript}</p>
      <p><strong>Bot reply:</strong> {reply}</p>
    </div>
  );
};

export default VoiceAssistant;