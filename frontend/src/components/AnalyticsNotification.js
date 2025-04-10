import React from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

const AnalyticsNotification = ({ 
  title, 
  message, 
  type = 'info', 
  onClose,
  data = {},
  timestamp = new Date().toLocaleTimeString()
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'trend_up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'trend_down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="mt-1">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
            {Object.keys(data).length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-700">{key}:</span>{' '}
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">{timestamp}</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Example usage with NotificationManager:
// <NotificationManager>
//   {notifications.map((notification, index) => (
//     <AnalyticsNotification
//       key={index}
//       title={notification.title}
//       message={notification.message} 
//       type={notification.type}
//       data={notification.data}
//       onClose={() => handleClose(index)}
//     />
//   ))}
// </NotificationManager>

export default AnalyticsNotification;