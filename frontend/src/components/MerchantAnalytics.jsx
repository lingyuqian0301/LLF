import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataChart from './DataChart';
import { BarChart2, Clock, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

const MerchantAnalytics = ({ merchantId }) => {
  const [analyticsData, setAnalyticsData] = useState({
    popularHours: null,
    popularDays: null,
    basketSize: null,
    orderValue: null,
    deliveryTime: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [hours, days, basket, value, delivery] = await Promise.all([
          api.get(`merchant/${merchantId}/popular-order-hours/`),
          api.get(`merchant/${merchantId}/popular-order-days/`),
          api.get(`merchant/${merchantId}/average-basket-size/`),
          api.get(`merchant/${merchantId}/average-order-value/`),
          api.get(`merchant/${merchantId}/average-delivery-time/`)
        ]);

        setAnalyticsData({
          popularHours: {
            chartType: 'line',
            title: 'Popular Order Hours',
            chartData: {
              labels: Object.keys(hours.data).map(hour => `${hour}:00`),
              datasets: [{
                label: 'Orders',
                data: Object.values(hours.data),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.4
              }]
            }
          },
          popularDays: {
            chartType: 'bar',
            title: 'Popular Order Days',
            chartData: {
              labels: days.data.map(d => d.day),
              datasets: [{
                label: 'Orders',
                data: days.data.map(d => d.count),
                backgroundColor: '#60A5FA'
              }]
            }
          },
          basketSize: {
            chartType: 'bar',
            title: 'Average Basket Size',
            chartData: {
              labels: ['Average Items per Order'],
              datasets: [{
                label: 'Items',
                data: [basket.data.average_items],
                backgroundColor: '#F59E0B'
              }]
            }
          },
          orderValue: {
            chartType: 'bar',
            title: 'Average Order Value',
            chartData: {
              labels: ['Average Order Value'],
              datasets: [{
                label: 'Value ($)',
                data: [value.data.average_value],
                backgroundColor: '#34D399'
              }]
            }
          },
          deliveryTime: {
            chartType: 'line',
            title: 'Average Delivery Time',
            chartData: {
              labels: delivery.data.map(d => d.date),
              datasets: [{
                label: 'Minutes',
                data: delivery.data.map(d => d.average_time),
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.5)'
              }]
            }
          }
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    if (merchantId) {
      fetchAnalytics();
    }
  }, [merchantId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Clock className="w-5 h-5 text-emerald-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Popular Hours</h3>
        </div>
        <div className="h-64">
          {analyticsData.popularHours && <DataChart data={analyticsData.popularHours} />}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Calendar className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Popular Days</h3>
        </div>
        <div className="h-64">
          {analyticsData.popularDays && <DataChart data={analyticsData.popularDays} />}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <ShoppingBag className="w-5 h-5 text-amber-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Basket Size</h3>
        </div>
        <div className="h-64">
          {analyticsData.basketSize && <DataChart data={analyticsData.basketSize} />}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <DollarSign className="w-5 h-5 text-emerald-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Order Value</h3>
        </div>
        <div className="h-64">
          {analyticsData.orderValue && <DataChart data={analyticsData.orderValue} />}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 md:col-span-2">
        <div className="flex items-center mb-2">
          <BarChart2 className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Delivery Time Trend</h3>
        </div>
        <div className="h-64">
          {analyticsData.deliveryTime && <DataChart data={analyticsData.deliveryTime} />}
        </div>
      </div>
    </div>
  );
};

export default MerchantAnalytics;
