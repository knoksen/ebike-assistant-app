import React, { useState } from "react";
const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! What issue are you experiencing with your e-bike or scooter?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Replace this endpoint with your Azure Functions endpoint if needed.
    const res = await fetch("/.netlify/functions/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom: input })
    });
    const data = await res.json();
    setMessages([...newMessages, { sender: "ai", text: data.diagnosis }]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">AI Assistant</h2>
      <div className="h-64 overflow-y-auto border p-3 rounded mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={mb-2 }>
            <p className={inline-block px-3 py-2 rounded-lg }>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-grow rounded-l px-3 py-2 bg-gray-100 dark:bg-gray-700"
          placeholder="Describe the issue..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend} className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
};
export default ChatBot;
