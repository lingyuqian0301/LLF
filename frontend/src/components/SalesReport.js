import React, { useState } from 'react';
import { BarChart2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockData = {
  "merchant_id": "2e8a5",
  "merchant_name": "Burger Barn",
  "metrics": {
    "average_basket_size": 1.01,
    "average_order_value": 124.32,
    "average_delivery_time": 38.61,
    "top_items": [
      { "item_id": 9, "item_name": "Double Patty Burger", "num_sales": 6462 },
      { "item_id": 31, "item_name": "Fries", "num_sales": 6431 },
      { "item_id": 19, "item_name": "Classic Cheeseburger", "num_sales": 5389 },
      { "item_id": 58, "item_name": "Bacon Mushroom Burger", "num_sales": 4508 }
    ],
    "underperforming_items": [
      { "item_id": 58, "item_name": "Bacon Mushroom Burger", "num_sales": 4508 },
      { "item_id": 19, "item_name": "Classic Cheeseburger", "num_sales": 5389 },
      { "item_id": 31, "item_name": "Fries", "num_sales": 6431 },
      { "item_id": 9, "item_name": "Double Patty Burger", "num_sales": 6462 }
    ],
    "peak_hours": {
      "14": 1409,
      "7": 1388,
      "20": 1373,
      "21": 1367,
      "6": 1356
    },
    "peak_days": {
      "Friday": 3335,
      "Saturday": 3307,
      "Wednesday": 3287,
      "Thursday": 3245,
      "Monday": 3234
    }
  },
  recommendations: `[
    {
      "title": "Optimize Menu Based on Performance Discrepancies",
      "rationale": "While the top-selling items are 'Double Patty Burger', 'Fries', 'Classic Cheeseburger', 'Bacon Mushroom Burger', the data shows all of them are also underperforming. This suggests a potential issue with presentation, pricing, or customer expectation. Focus on enhancing the appeal and perceived value of these items.",
      "action_steps": [
        "Conduct customer surveys or feedback sessions specifically targeting these items to understand the reason behind the underperformance despite their popularity.",
        "Analyze competitor pricing and offerings for similar items. Adjust pricing or bundle configurations to be more competitive.",
        "Review item descriptions and photographs on the Grab platform to ensure they are appealing and accurately represent the product. Consider professional photography.",
        "Implement a limited-time promotion for these items to gauge price sensitivity and potential demand shifts."
      ],
      "expected_impact": "Increased order frequency and improved customer satisfaction by addressing the discrepancy between popularity and perceived value."
    },
    {
      "title": "Increase Average Basket Size through Bundling",
      "rationale": "An average basket size of 1.01 items is extremely low. Customers are essentially only ordering one item per order. Bundling popular items can significantly increase this number.",
      "action_steps": [
        "Create bundled meals featuring a burger (Double Patty or Classic Cheeseburger, given their high order volume) with Fries and a drink at a discounted price compared to ordering individually.",
        "Offer 'Upsize' options, such as a larger portion of Fries or an additional patty, at a minimal cost to encourage customers to increase their order value.",
        "Prominently display bundle options and upsize opportunities on the GrabFood menu with attractive visuals and clear pricing."
      ],
      "expected_impact": "Significant increase in average basket size and overall revenue per order."
    },
    {
      "title": "Improve Delivery Time During Peak Hours",
      "rationale": "An average delivery time of 38.61 minutes is relatively high and could deter customers, especially during peak ordering hours (14:00, 7:00, 20:00, 21:00, 6:00). Reducing delivery time will improve customer satisfaction and encourage repeat orders.",
      "action_steps": [
        "Analyze kitchen workflow during peak hours to identify bottlenecks and inefficiencies. Implement strategies to streamline food preparation processes.",
        "Optimize delivery driver allocation and route planning to minimize travel time. Consider designating specific drivers for peak hour deliveries.",
        "Explore partnerships with additional delivery services or expand the in-house delivery team to handle increased demand during peak periods.",
        "Communicate estimated delivery times accurately to customers and provide updates on order status."
      ],
      "expected_impact": "Increased customer satisfaction, higher order volume during peak hours, and improved overall restaurant rating on the Grab platform."
    },
    {
      "title": "Leverage Peak Day Data for Targeted Promotions",
      "rationale": "Orders are highest on Friday, Saturday, Wednesday, Thursday, and Monday. Implement day-specific promotions to further boost sales on these days or to incentivize orders on slower days.",
      "action_steps": [
        "Offer a 'Burger of the Day' promotion on Wednesdays and Thursdays to drive traffic during mid-week.",
        "Create a 'Weekend Feast' bundle available on Fridays and Saturdays targeting family or group orders.",
        "Implement a 'Monday Blues Buster' promotion, offering a discount on specific items to encourage orders on the start of the week."
      ],
      "expected_impact": "Increased sales on peak days and potential to shift some demand to slower days, optimizing kitchen and staffing resources."
    }
  ]`
};

const SalesReport = ({ merchantId }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(mockData);
  
  const { merchant_name, recommendations } = data;
  const parsedRecommendations = JSON.parse(recommendations);

  const handleRecommendationClick = (recommendation) => {
    navigate('/grab-assistant', {
      state: {
        fromRecommendation: true,
        recommendation: recommendation,
        metrics: data.metrics,
        message: `Tell me more about: ${recommendation.title}`,
        suggestions: [
          'What steps should I take first?',
          'Show me the data behind this recommendation',
          'How can I implement this?',
          'What is the expected ROI?',
          'Generate an implementation plan'
        ],
        contextData: {
          topItems: data.metrics.top_items,
          underperformingItems: data.metrics.underperforming_items,
          peakHours: data.metrics.peak_hours,
          peakDays: data.metrics.peak_days,
          averages: {
            basketSize: data.metrics.average_basket_size,
            orderValue: data.metrics.average_order_value,
            deliveryTime: data.metrics.average_delivery_time
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
