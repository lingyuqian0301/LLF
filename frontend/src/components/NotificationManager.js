import React, { useState } from 'react';
import AnalyticsNotification from './AnalyticsNotification';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { ...notification, id }]);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Example usage - you can call this from anywhere in your app
  // eslint-disable-next-line no-unused-vars
  const showAnalyticsNotification = (type, title, message, data) => {
    addNotification({
      type,
      title,
      message,
      data,
      onClose: () => removeNotification(Date.now()),
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <AnalyticsNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationManager; 