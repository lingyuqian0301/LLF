import React from 'react';
import { TrendingUp, Search, ExternalLink } from 'react-feather';

const KeywordRecommendations = ({ recommendations, onKeywordClick }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Keyword Recommendations</h2>
          <p className="text-gray-400 text-sm">Popular search terms for your items</p>
        </div>
        <div className="flex items-center gap-2">
          <Search size={20} className="text-green-500" />
          <span className="text-gray-400 text-sm">Based on search trends</span>
          <button className="ml-2 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs flex items-center gap-1 transition-colors">
            <ExternalLink size={12} />
            <span>View All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {Object.entries(recommendations).map(([product, keywords]) => (
          <div key={product} className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-white">{product}</h3>
            <div className="space-y-3">
              {keywords.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-700/30 rounded-md cursor-pointer transition-colors"
                  onClick={() => onKeywordClick && onKeywordClick(product, item)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-300">{item.keyword}</div>
                      <div className="text-xs text-gray-500">
                        {item.order.toLocaleString()} orders • {item.checkout.toLocaleString()} checkouts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className={item.score > 0.7 ? "text-green-500" : "text-yellow-500"} />
                    <span className={`text-sm font-medium ${item.score > 0.7 ? "text-green-500" : "text-yellow-500"}`}>
                      {Math.round(item.score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordRecommendations;
