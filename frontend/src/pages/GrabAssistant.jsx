import React, { useState, useRef, useEffect } from 'react';
import { Send, BarChart2, Package, ShoppingCart } from 'lucide-react';
import DataChart from '../components/DataChart';

const GrabAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
    
    // Display welcome message
    setMessages([
      {
        type: 'assistant',
        content: "Hello! I'm your Grab Assistant. How can I help with your business today?",
        timestamp: new Date(),
        suggestions: [
          "Show me today's sales summary",
          "Check my inventory status",
          "Analyze my customer trends"
        ]
      }
    ]);
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: text }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Process and add assistant response
      const assistantMessage = {
        type: 'assistant',
        content: data.response || "I've analyzed your request.",
        timestamp: new Date(),
        data: data.data || null,
        suggestions: data.suggestions || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching from API:', error);
      // Add error message
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "I'm sorry, I couldn't process your request at the moment. Please try again.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    sendMessage(suggestion);
  };
  
  const contextBasedSuggestions = () => {
    // If there's a context (like which section they navigated from), you can add specific suggestions
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        <button 
          onClick={() => handleSuggestionClick("Generate sales report")}
          className="bg-green-900/50 hover:bg-green-900/70 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <BarChart2 size={16} />
          <span>Sales Report</span>
        </button>
        <button 
          onClick={() => handleSuggestionClick("Check inventory status")}
          className="bg-green-900/50 hover:bg-green-900/70 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Package size={16} />
          <span>Inventory Status</span>
        </button>
        <button 
          onClick={() => handleSuggestionClick("Analyze customer trends")}
          className="bg-green-900/50 hover:bg-green-900/70 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <ShoppingCart size={16} />
          <span>Customer Trends</span>
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-900 p-4 rounded-lg mb-4">
        <h1 className="text-2xl font-bold">Grab Assistant</h1>
        <p className="text-gray-400">Your AI-powered business companion</p>
        {contextBasedSuggestions()}
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-900 p-4 rounded-lg mb-4">
        {/* Messages container */}
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <Message key={index} message={message} onSuggestionClick={handleSuggestionClick} />
          ))}
          
          {isLoading && (
            <div className="self-start bg-gray-800 text-white rounded-lg p-3 max-w-[80%] flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
              </div>
              <span className="text-gray-400 text-sm">Analyzing data...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your business..."
            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Message component to handle different message types
const Message = ({ message, onSuggestionClick }) => {
  const { type, content, timestamp, data, suggestions, isError } = message;
  
  // Format the timestamp
  const formattedTime = timestamp ? new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp)) : '';
  
  // Render data snippets if available
  const renderDataSnippet = () => {
    if (!data) return null;
    
    return (
      <div className="mt-3 bg-gray-800/50 p-3 rounded-lg border-l-4 border-green-500">
        {data.type === 'metrics' ? (
          <div className="grid grid-cols-2 gap-3">
            {data.metrics.map((metric, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-gray-400 text-xs">{metric.label}</span>
                <span className={`font-bold ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-white'}`}>
                  {metric.value}
                  {metric.trend === 'up' ? ' ▲' : metric.trend === 'down' ? ' ▼' : ''}
                  {metric.percentage ? ` (${metric.percentage})` : ''}
                </span>
              </div>
            ))}
          </div>
        ) : data.type === 'chart' ? (
          <div className="h-40 w-full">
            <DataChart data={data} />
          </div>
        ) : (
          <div>
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-gray-700 py-1">
                <span className="text-gray-400">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render suggestions if available
  const renderSuggestions = () => {
    if (!suggestions || !suggestions.length) return null;
    
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button 
            key={idx}
            onClick={() => onSuggestionClick(suggestion)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`p-3 rounded-lg max-w-[80%] ${
          type === 'user' 
            ? 'bg-green-600 text-white' 
            : isError 
              ? 'bg-red-900/50 text-white' 
              : 'bg-gray-800 text-white'
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className="font-medium">
            {type === 'user' ? 'You' : 'Grab Assistant'}
          </span>
          <span className="text-xs opacity-70 ml-3">{formattedTime}</span>
        </div>
        
        <div className="text-sm md:text-base">{content}</div>
        
        {type === 'assistant' && renderDataSnippet()}
        {type === 'assistant' && renderSuggestions()}
      </div>
    </div>
  );
};

export default GrabAssistant;