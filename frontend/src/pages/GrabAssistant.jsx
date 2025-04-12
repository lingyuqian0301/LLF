import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, User, Package, ShoppingCart, BarChart2, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import MerchantAnalytics from '../components/MerchantAnalytics';
import axios from 'axios';

// Example: create an Axios instance (optional)
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

function GrabAssistant({ merchantData, merchantId }) {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. React Router location for reading data from navigate(..., { state: {...} })
  const location = useLocation();

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize based on context
  useEffect(() => {
    // Check if we should show analytics
    if (location.state?.showAnalytics) {
      setShowAnalytics(true);
    }

    // Handle recommendation context
    if (location.state?.fromRecommendation) {
      const { recommendation, contextData, metrics } = location.state;
      setActiveContext({
        type: 'recommendation',
        recommendation: recommendation,
        contextData: contextData,
        metrics: metrics
      });
      
      // Format the recommendation message with relevant data
      let recommendationText = `Let's discuss this recommendation: ${recommendation.title}\n\n${recommendation.rationale}\n\nRelevant Data:`;
      
      // Add contextual data based on recommendation type
      if (recommendation.title.includes('Menu') || recommendation.title.includes('Basket Size')) {
        recommendationText += `\n• Average Basket Size: ${contextData.averages.basketSize} items`;
        recommendationText += `\n• Average Order Value: $${contextData.averages.orderValue}`;
        recommendationText += '\n\nTop Selling Items:';
        contextData.topItems.forEach(item => {
          recommendationText += `\n• ${item.item_name}: ${item.num_sales} sales`;
        });
      } else if (recommendation.title.includes('Delivery Time')) {
        recommendationText += `\n• Average Delivery Time: ${contextData.averages.deliveryTime} minutes`;
        recommendationText += '\n\nPeak Hours:';
        Object.entries(contextData.peakHours)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .forEach(([hour, orders]) => {
            recommendationText += `\n• ${hour}:00: ${orders} orders`;
          });
      } else if (recommendation.title.includes('Peak Day')) {
        recommendationText += '\n\nPeak Days:';
        Object.entries(contextData.peakDays)
          .sort(([,a], [,b]) => b - a)
          .forEach(([day, orders]) => {
            recommendationText += `\n• ${day}: ${orders} orders`;
          });
      }
      
      setMessages([{
        id: Date.now(),
        text: recommendationText,
        sender: 'bot'
      }]);
      return;
    }

    // Handle product keyword context
    if (location.state?.fromKeyword) {
      const { product } = location.state;
      setActiveContext({
        type: 'product',
        product: product
      });
      setMessages([{
        id: Date.now(),
        text: `Let's analyze the keywords for ${product.name}. What would you like to know?`,
        sender: 'bot'
      }]);
      setSuggestions([
        'What are the trending keywords?',
        'How can I improve visibility?',
        'Show me similar products',
        'Analyze performance'
      ]);
      return;
    }

    // Default welcome message
    const initialMessages = [
      {
        id: Date.now(),
        text: 'Welcome to your shop dashboard! How can I help you today?',
        sender: 'bot'
      }
    ];
    setMessages(initialMessages);
  }, [location.state?.showAnalytics]);

  // 2. Check if we arrived from a chart click or keyword recommendation => auto-inject a bot message
  useEffect(() => {
    // Handle chart click navigation
    if (location.state?.fromChart) {
      const clickedItem = location.state.item;
      const chartType = location.state.chartType;
      const allItems = location.state.topSellingItems || merchantData.topSellingItems;

      if (clickedItem && allItems) {
        // Calculate ranking for internal use
        const sortedItems = [...allItems].sort((a, b) => b.num_sales - a.num_sales);
        const itemRank = sortedItems.findIndex(item => item.item_name === clickedItem.item_name) + 1;

        // Store the ranking info in state for use in chat responses
        window.itemAnalytics = {
          rank: itemRank,
          totalItems: sortedItems.length,
          topItems: sortedItems.slice(0, 3).map(i => i.item_name),
          bottomItems: sortedItems.slice(-3).map(i => i.item_name)
        };

        const botWelcomeMsg = {
          id: Date.now() + 1,
          text: `Here's how "${clickedItem.item_name}" is doing:\n• Total sold: ${clickedItem.num_sales} items\n\nWhat would you like to know?`,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botWelcomeMsg]);
        // Set product-specific suggestions
        setSuggestions([
          'How is this item selling compared to others?',
          'When is the best time to sell this item?',
          'Should I change the price?',
          'How can I sell more of this item?',
          'How is this selling compared to others?',
          'When do people buy this most?',
          'What are my top selling items?',
          'Which items need attention?'
        ]);
      }
    }

    // Handle keyword recommendation click navigation
    if (location.state?.fromKeyword) {
      const product = location.state.product;
      const keyword = location.state.keyword;
      const message = location.state.message;

      if (product && keyword) {
        // Store the keyword context for future messages
        setActiveContext({
          type: 'keyword',
          product: product,
          keyword: keyword.keyword,
          score: keyword.score,
          checkout: keyword.checkout,
          order: keyword.order
        });

        // Add user message with the query
        const userMessage = {
          id: Date.now(),
          text: message,
          sender: 'user'
        };

        // Add bot response about the keyword
        const botMessage = {
          id: Date.now() + 1,
          text: `Analyzing keyword "${keyword.keyword}" for your product "${product}":\n\n• Relevance score: ${Math.round(keyword.score * 100)}%\n• ${keyword.checkout.toLocaleString()} checkouts\n• ${keyword.order.toLocaleString()} orders\n\nWould you like to know more about how to optimize your product for this keyword?`,
          sender: 'bot'
        };

        setMessages(prev => [...prev, userMessage, botMessage]);

        // Set keyword-specific suggestions
        setSuggestions([
          `How can I optimize my product for "${keyword.keyword}"?`,
          `What makes "${keyword.keyword}" popular?`,
          `Show me similar keywords to "${keyword.keyword}"`,
          `How can I improve my product listing for "${keyword.keyword}"?`,
          `Compare "${keyword.keyword}" with my other keywords`
        ]);
      }
    }
  }, [location.state, merchantData.topSellingItems]);

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
      let response;
      
      // Handle different contexts
      if (location.state?.fromKeyword || activeContext?.type === 'product') {
        // Product keyword enhancement endpoint
        response = await api.post(`merchant/${merchantId || '2e8a5'}/enhanced-keyword-recommendations/`, {
          query: inputMessage
        });
      } else if (location.state?.fromRecommendation || activeContext?.type === 'recommendation') {
        // Recommendations endpoint
        response = await api.post('ask-gemini/', {
          query: inputMessage,
          merchant_id: merchantId || '2e8a5',
          context: activeContext
        });
      } else {
        // Default endpoint for general queries
        response = await api.post('ask-gemini/', {
          query: inputMessage,
          merchant_id: merchantId || '2e8a5'
        });
      }

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);

      // Update suggestions based on context
      if (location.state?.fromKeyword || activeContext?.type === 'product') {
        setSuggestions([
          'Tell me more about this product',
          'How can I improve its performance?',
          'Show me similar products',
          'What are the trending keywords?'
        ]);
      }
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

  // Enhanced Business Insights with Keyword Analysis
  const handleBusinessInsight = async () => {
    setIsLoading(true);
    try {
      // Fetch keyword recommendations
      const keywordResponse = await api.get(`merchant/2e8a5/enhanced-keyword-recommendations/`);
      const recommendations = keywordResponse.data.recommendations;

      // Prepare comprehensive analysis data
      const analysisData = {
        query: "Analyze my business performance and provide insights",
        merchant_id: '2e8a5',
        context: {
          sales_data: {
            top_items: merchantData.topSellingItems,
            least_items: merchantData.leastSellingItems,
            popular_hours: merchantData.popularHours,
            popular_days: merchantData.popularDays
          },
          keyword_insights: {
            recommendations: recommendations,
            trends: Object.entries(recommendations).map(([product, keywords]) => ({
              product,
              top_keywords: keywords.slice(0, 3),
              avg_score: keywords.reduce((sum, k) => sum + k.score, 0) / keywords.length,
              potential_reach: keywords.reduce((sum, k) => sum + k.checkout, 0)
            }))
          },
          metrics: {
            avg_order_value: merchantData.averageOrderValue,
            total_products: merchantData.activeProducts,
            delivery_time: merchantData.averageDeliveryTime
          }
        }
      };

      // Get enhanced insights from Gemini
      const response = await api.post('ask-gemini/', analysisData);

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
      const response = await api.post('ask-gemini/', {
        query,
        merchant_id: '2e8a5'  // Hardcoded merchant ID
      });
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

  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Grab Assistant</h1>
          <p className="text-sm text-gray-400">Your personal shop assistant</p>
        </div>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <BarChart2 size={20} />
          <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
        </button>
      </div>

      {showAnalytics ? (
        /* Analytics Section */
        <div className="flex-1 overflow-y-auto">
          <MerchantAnalytics merchantId={merchantId} />
        </div>
      ) : (
        /* Main Content */
        <>
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
        </>
      )}

      {!showAnalytics && (
        /* Footer */
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
      )}
    </div>
  );
}

export default GrabAssistant;
