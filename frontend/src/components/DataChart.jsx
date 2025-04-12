import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DataChart = ({ data }) => {
  const navigate = useNavigate();
  if (!data || !data.chartData) return null;

  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const dataIndex = elements[0].index;
      const clickedItem = data.chartData.datasets[0].data[dataIndex];
      const itemName = data.chartData.labels[dataIndex];
      
      // Navigate to chat with the clicked item data
      navigate('/grab-assistant', {
        state: {
          fromChart: true,
          chartType: data.chartType,
          item: {
            item_id: dataIndex + 1,
            item_name: itemName,
            value: clickedItem
          },
          topSellingItems: data.chartData.labels.map((label, idx) => ({
            item_id: idx + 1,
            item_name: label,
            value: data.chartData.datasets[0].data[idx],
            num_sales: data.chartData.datasets[0].data[idx],
            popularity: ((data.chartData.datasets[0].data[idx] / Math.max(...data.chartData.datasets[0].data)) * 100).toFixed(1)
          }))
        }
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff'
        }
      },
      title: {
        display: true,
        text: data.title || '',
        color: '#ffffff'
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        }
      },
      y: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        }
      }
    }
  };

  switch (data.chartType) {
    case 'bar':
      return <Bar data={data.chartData} options={options} />;
    case 'line':
      return <Line data={data.chartData} options={options} />;
    case 'pie':
      return <Pie data={data.chartData} options={options} />;
    default:
      return <Bar data={data.chartData} options={options} />;
  }
};

export default DataChart;