import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Clock } from 'lucide-react';

function TodayInsights() {
  const [isVisible, setIsVisible] = useState(true);
  const [insights] = useState([
    {
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      title: "Sales Growth",
      value: "+15%",
      change: "vs yesterday",
      color: "text-green-500"
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: "New Users",
      value: "245",
      change: "+12% vs yesterday",
      color: "text-blue-500"
    },
    {
      icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
      title: "Orders",
      value: "1,234",
      change: "+8% vs yesterday",
      color: "text-purple-500"
    },
    {
      icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
      title: "Revenue",
      value: "$12,500",
      change: "+10% vs yesterday",
      color: "text-yellow-500"
    },
    {
      icon: <Clock className="w-5 h-5 text-red-500" />,
      title: "Processing Time",
      value: "2.5 mins",
      change: "-15% vs yesterday",
      color: "text-red-500"
    }
  ]);

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8 overflow-x-auto">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center space-x-3 min-w-[200px]">
                {insight.icon}
                <div>
                  <p className="text-sm text-gray-400">{insight.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold">{insight.value}</p>
                    <p className={`text-xs ${insight.color}`}>{insight.change}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodayInsights;