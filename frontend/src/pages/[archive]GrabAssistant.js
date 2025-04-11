import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Package, ShoppingCart, BarChart2, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  }
});

function GrabAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const [quickActions] = useState([
    { id: 'orders', icon: <ShoppingCart size={20} />, label: 'Order Management', description: 'View and manage your orders' },
    { id: 'products', icon: <Package size={20} />, label: 'Product Insights', description: 'Get product performance analytics' },
    { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Sales Analytics', description: 'View sales and performance metrics' },
    { id: 'alerts', icon: <AlertCircle size={20} />, label: 'Alerts', description: 'View important notifications' },
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Add welcome message
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: 'Welcome to your shop dashboard! How can I help you today?',
          sender: 'bot'
        }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: 'Error connecting to the server. Please try again later.',
          sender: 'bot'
        }]);
      }
    };

    fetchInitialData();
  }, []);

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

  const handleQuickAction = (actionId) => {
    let message = '';
    switch (actionId) {
      case 'orders':
        message = 'Recent Orders:\n- Order #1234: Pending\n- Order #1235: Processing\n- Order #1236: Shipped';
        break;
      case 'products':
        message = 'Product Performance:\n- Top Seller: Product A (50 sales)\n- Low Stock: Product B (2 left)\n- Trending: Product C (+20% views)';
        break;
      case 'analytics':
        message = 'Sales Analytics:\n- Today: $1,234\n- This Week: $8,765\n- Conversion Rate: 3.2%';
        break;
      case 'alerts':
        message = 'Important Alerts:\n- Low stock alert: Product B\n- New order received: #1237\n- Customer review: 5 stars';
        break;
      default:
        message = 'I can help you with that. What specific information would you like?';
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: message,
      sender: 'bot'
    }]);
  };

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

      {/* Input Area - Fixed at bottom */}
      <div className="sticky bottom-0 bg-gray-950 border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="p-4">
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