import React, { useState, useEffect } from 'react';
import { BarChart2, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

const SalesReport = ({ merchantId = '2e8a5' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/merchant/${merchantId}/recommendations/`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantId]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 text-white min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 text-white min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { merchant_name, recommendations: recommendationsJson, metrics } = data;
  const parsedRecommendations = JSON.parse(recommendationsJson.replace(/```json\n|```/g, ''));

  const handleRecommendationClick = (recommendation) => {
    navigate('/grab-assistant', {
      state: {
        fromRecommendation: true,
        recommendation: recommendation,
        metrics: metrics,
        message: `Tell me more about: ${recommendation.title}`,
        suggestions: [
          'What steps should I take first?',
          'Show me the data behind this recommendation',
          'How can I implement this?',
          'What is the expected ROI?',
          'Generate an implementation plan'
        ],
        contextData: {
          topItems: metrics.top_items,
          underperformingItems: metrics.underperforming_items,
          peakHours: metrics.peak_hours,
          peakDays: metrics.peak_days,
          averages: {
            basketSize: metrics.average_basket_size,
            orderValue: metrics.average_order_value,
            deliveryTime: metrics.average_delivery_time
          }
        }
      }
    });
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">{merchant_name} - Recommendations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parsedRecommendations.map((rec, index) => (
          <div 
            key={index} 
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer relative group"
            onClick={() => handleRecommendationClick(rec)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold pr-8">{rec.title}</h3>
              <ArrowRight 
                size={20} 
                className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4"
              />
            </div>
            <p className="text-gray-300 text-sm mb-4">{rec.rationale}</p>
            <div className="space-y-2">
              {rec.action_steps.slice(0, 2).map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">•</span>
                  <span className="text-gray-400">{step}</span>
                </div>
              ))}
              {rec.action_steps.length > 2 && (
                <div className="text-sm text-blue-400">+{rec.action_steps.length - 2} more steps...</div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                <strong>Expected Impact:</strong> {rec.expected_impact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesReport;
