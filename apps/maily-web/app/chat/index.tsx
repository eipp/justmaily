import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/orchestration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: userMessage.text })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orchestration results.');
      }

      const data = await response.json();
      let botReply = `Orchestration result for campaign ${data.campaignId}:`;
      if (data.agents && Array.isArray(data.agents)) {
        data.agents.forEach((agent: any) => {
          botReply += `\n${agent.agent}: ${agent.details}`;
        });
      } else {
        botReply += '\nNo agents returned a response.';
      }
      const botMessage: Message = { sender: 'bot', text: botReply };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Interface</h1>
      <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-center text-gray-700">Processing...</div>}
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="Enter campaign ID or query"
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;