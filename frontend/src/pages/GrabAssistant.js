import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

function GrabAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    }]);

    // Clear input
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'I am processing your request. How can I assist you today?',
        sender: 'bot'
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-2 max-w-[70%] ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
              }`}>
                {message.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-3 rounded-lg ${
                message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-800'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default GrabAssistant; 