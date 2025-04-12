import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // <-- We read the passed state here
import { Send, Bot, User, Package, ShoppingCart, BarChart2, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import axios from 'axios';

// Example: create an Axios instance (optional)
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

function GrabAssistant({ merchantData }) {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. React Router location for reading data from navigate(..., { state: {...} })
  const location = useLocation();

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with a "bot welcome" message
  useEffect(() => {
    const initialMessages = [
      {
        id: Date.now(),
        text: 'Welcome to your shop dashboard! How can I help you today?',
        sender: 'bot'
      }
    ];
    setMessages(initialMessages);
  }, []);

  // 2. Check if we arrived from a chart click => auto-inject a bot message about the product
  useEffect(() => {
    if (location.state?.fromChart) {
      const clickedItem = location.state.item;
      const chartType = location.state.chartType;
      const allItems = location.state.topSellingItems || merchantData.topSellingItems;

      if (clickedItem && allItems) {
        // Calculate item's ranking based on sales
        const sortedItems = [...allItems].sort((a, b) => b.num_sales - a.num_sales);
        const itemRank = sortedItems.findIndex(item => item.item_name === clickedItem.item_name);
        
        // Calculate how many items this sells better than
        const totalItems = sortedItems.length;
        const itemsBelow = totalItems - itemRank - 1;
        let popularity = 0;
        
        if (totalItems > 1) {
          popularity = Math.min(100, Math.max(0, Math.round((itemsBelow / (totalItems - 1)) * 100)));
        }
        
        // For debugging
        console.log('Item:', clickedItem.item_name);
        console.log('Sales:', clickedItem.num_sales);
        console.log('Rank:', itemRank + 1, 'out of', sortedItems.length);
        console.log('Items below:', itemsBelow);
        console.log('Total items:', totalItems);
        console.log('Items sorted by sales:', sortedItems.map(i => `${i.item_name}: ${i.num_sales}`));

        const botWelcomeMsg = {
          id: Date.now() + 1,
          text: `Here's how "${clickedItem.item_name}" is doing:\n• Total sold: ${clickedItem.num_sales} items\n• Sells better than ${popularity}% of your items\n\nWhat would you like to know?`,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botWelcomeMsg]);
        // Set product-specific suggestions
        setSuggestions([
          'How is this item selling compared to others?',
          'When is the best time to sell this item?',
          'Should I change the price?',
          'How can I sell more of this item?'
        ]);
      }
    }
  }, [location.state]);

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
      // Example: call your backend
      const response = await api.post('ask-gemini/', {
        query: `You are helping a shop owner with their sales. Use simple words and short sentences. Do not use any special formatting like asterisks (*) or markdown.\n\nHere is their shop data: ${JSON.stringify(merchantData.topSellingItems)}\n\nTheir question is: ${inputMessage}\n\nGive them practical advice in simple text with numbers or bullet points.`
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

  // Example Quick Actions
  const handleBusinessInsight = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('ask-gemini/', {
        query: `You are helping a shop owner understand their sales. Use simple words and short sentences. Do not use any special formatting like asterisks (*) or markdown.\n\nTell them:\n1. Which items sell well and which don't\n2. Quick ways to make more sales\n3. Simple ideas for discounts or promotions\n4. What items to stock up on\n\nKeep it simple and practical. Use normal text with numbers or bullet points. Data: ${JSON.stringify(location.state?.topSellingItems || merchantData.topSellingItems)}`
      });

      let botResponse = response.data.response;
      
      // Format numbers in the response for better readability
      // Remove any markdown formatting
      botResponse = botResponse.replace(/[*_]/g, '');
      
      // Format numbers
      botResponse = botResponse.replace(/\b\d+\b/g, (match) => {
        const num = parseInt(match);
        if (num >= 1000) {
          return num.toLocaleString();
        }
        return match;
      });

      // Update suggestions
      const newSuggestions = [
        'How can I sell more of my best items?',
        'What prices should I set for my items?',
        'Should I put slow-selling items on sale?',
        'Which items should I buy more of?',
        'When do my items sell the most?',
        'What items are not selling well?',
        'How can I make more profit?'
      ].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      setSuggestions(newSuggestions);

      const botMessage = {
        id: Date.now(),
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: Date.now(),
        text: error.response?.data?.error || 'Sorry, I encountered an error analyzing the business insights. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const [quickActions] = useState([
    {
      id: 'business-insight',
      icon: <BarChart2 size={20} />,
      label: 'Business Insights',
      onClick: handleBusinessInsight
    },
    {
      id: 'orders',
      icon: <ShoppingCart size={20} />,
      label: 'Order Management',
      description: 'View and manage your orders'
    },
    {
      id: 'products',
      icon: <Package size={20} />,
      label: 'Product Insights',
      description: 'Get product performance analytics'
    },
    {
      id: 'analytics',
      icon: <BarChart2 size={20} />,
      label: 'Sales Analytics',
      description: 'View sales and performance metrics'
    },
    {
      id: 'alerts',
      icon: <AlertCircle size={20} />,
      label: 'Alerts',
      description: 'View important notifications'
    }
  ]);

  // Send quick action
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

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Grab Assistant</h1>
        <p className="text-sm text-gray-400">Your personal shop assistant</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            className="flex flex-col items-center p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <div className="text-blue-500 mb-2">{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
            <span className="text-xs text-gray-400 mt-1">
              {action.description}
            </span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex items-start gap-2 max-w-[70%] ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              >
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div
                className={`p-3 rounded-lg ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Area */}
      {suggestions.length > 0 && (
        <div className="sticky bottom-[88px] bg-gray-950 border-t border-gray-800 p-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInputMessage(suggestion);
                handleSendMessage(new Event('submit'));
              }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

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
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373
                      0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0
                      3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
