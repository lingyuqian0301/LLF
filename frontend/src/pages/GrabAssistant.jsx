import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Package, ShoppingCart, BarChart2, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  }
});

function GrabAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    setMessages([{
      id: Date.now(),
      text: 'Welcome to your shop dashboard! How can I help you today?',
      sender: 'bot'
    }]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to Django backend
      const response = await api.post('ask-gemini/', {
        query: inputMessage
      });

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (actionId) => {
    let query = '';
    switch (actionId) {
      case 'orders':
        query = 'Show me recent orders and status updates';
        break;
      case 'products':
        query = 'Provide product performance insights';
        break;
      case 'analytics':
        query = 'Show sales analytics and metrics';
        break;
      case 'alerts':
        query = 'List important alerts and notifications';
        break;
      default:
        query = 'Help with dashboard features';
    }

    // Add quick action message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: query,
      sender: 'user'
    }]);

    try {
      const response = await api.post('ask-gemini/', { query });
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.response?.data?.error || 'Failed to fetch data',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const [quickActions] = useState([
    { id: 'orders', icon: <ShoppingCart size={20} />, label: 'Order Management', description: 'View and manage your orders' },
    { id: 'products', icon: <Package size={20} />, label: 'Product Insights', description: 'Get product performance analytics' },
    { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Sales Analytics', description: 'View sales and performance metrics' },
    { id: 'alerts', icon: <AlertCircle size={20} />, label: 'Alerts', description: 'View important notifications' },
  ]);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Grab Assistant</h1>
        <p className="text-sm text-gray-400">Your personal shop assistant</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            className="flex flex-col items-center p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <div className="text-blue-500 mb-2">{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
            <span className="text-xs text-gray-400 mt-1">{action.description}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
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
                <p className="text-sm whitespace-pre-line">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gray-950 border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 disabled:opacity-50"
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <Send size={18} />
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-4 border-t border-gray-800 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} />
          <span>Need help? Type your question</span>
        </div>
        <div className="flex items-center gap-2">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}

export default GrabAssistant;