import { useState } from 'react';
import { MessageSquare, X, TrendingUp, AlertTriangle, ShoppingBag } from 'lucide-react';

function GrabAssistantFab() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Sales",
      description: "View sales analytics and trends"
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Anomalies",
      description: "Check for unusual patterns"
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Merchandise",
      description: "Browse product catalog"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-all duration-200"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => {
                    // Handle menu item click
                    console.log(`Selected: ${item.label}`);
                    setIsOpen(false);
                  }}
                >
                  <div className="p-2 rounded-full bg-gray-800">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrabAssistantFab; 