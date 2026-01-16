import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle, AlertCircle, MessageSquare, Trash2, CheckCheck, MapPin, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { notificationsAPI } from '@/services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await notificationsAPI.getAll(user.id || '1');
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    await notificationsAPI.markAsRead(notificationId);
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await notificationsAPI.markAllAsRead(user.id || '1');
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'lost':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'found':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'match':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-purple-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 sm:px-3 py-1 bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-full flex-shrink-0">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </motion.button>
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-600">Stay updated with your lost and found activities</p>
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 sm:p-12 rounded-xl shadow-sm text-center"
        >
          <Bell className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-sm sm:text-base text-gray-600">You'll see notifications here when there's activity on your reports</p>
        </motion.div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5 }}
              className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 ${
                notification.read ? 'border-gray-300' : (notification.type === 'lost' ? 'border-red-500' : 'border-green-500')
              } ${!notification.read ? (notification.type === 'lost' ? 'bg-red-50' : 'bg-green-50') : ''}`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                  notification.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {getIconForType(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{notification.title}</h3>
                    {!notification.read && (
                      <span className={`px-2 py-1 text-white text-xs font-semibold rounded-full flex-shrink-0 w-fit ${
                        notification.type === 'lost' ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Item Details Section */}
                  {notification.itemName && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 space-y-2">
                      {notification.itemImage && (
                        <div className="mb-3">
                          <img
                            src={notification.itemImage}
                            alt={notification.itemName}
                            className="w-full h-32 sm:h-40 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate"><strong>Item:</strong> {notification.itemName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">{notification.itemDate}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{notification.itemLocation}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-700 mb-3 text-sm sm:text-base">{notification.message}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                    <p className="text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors ${
                            notification.type === 'lost' 
                              ? 'text-red-600 hover:bg-red-100' 
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
