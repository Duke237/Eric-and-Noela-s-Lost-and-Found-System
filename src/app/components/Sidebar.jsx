import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertCircle, 
  CheckCircle, 
  Bell, 
  History, 
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsAPI } from '@/services/api';
import { notificationService } from '@/services/notificationService';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    // Subscribe to real-time notification updates
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      console.log('🔔 Sidebar: New notifications arrived:', newNotifications.length);
      setUnreadCount(prev => prev + newNotifications.length);
    });

    // Listen to unread count changes from notification service (every 1 second)
    const checkUnread = setInterval(() => {
      const count = notificationService.getUnreadCount();
      if (count > 0) {
        console.log(`🔔 Sidebar: Updated unread count to ${count}`);
        setUnreadCount(count);
      }
    }, 1000);

    // Start polling (1 second for aggressive real-time updates)
    notificationService.startPolling(1000);

    return () => {
      unsubscribe();
      clearInterval(checkUnread);
      notificationService.stopPolling();
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/unread`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count || 0);
            return;
          }
        } catch (apiError) {
          console.log('Real API not available, falling back to mock');
        }
      }

      // Fallback to mock API
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await notificationsAPI.getAll(user.id || '1');
      if (response.success) {
        const unread = response.notifications.filter(n => !n.read && !n.read_status).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const navItems = [
    {
      label: 'Dashboard Home',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'blue',
    },
    {
      label: 'Report Lost Item',
      icon: AlertCircle,
      path: '/dashboard/report-lost',
      color: 'red',
    },
    {
      label: 'Report Found Item',
      icon: CheckCircle,
      path: '/dashboard/report-found',
      color: 'green',
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/dashboard/notifications',
      color: 'yellow',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      label: 'History',
      icon: History,
      path: '/dashboard/history',
      color: 'purple',
    },
    {
      label: 'Chatbot',
      icon: MessageSquare,
      path: '/dashboard/chatbot',
      color: 'indigo',
    },
  ];

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 group-hover:bg-blue-600 group-hover:text-white',
    red: 'text-red-600 bg-red-100 group-hover:bg-red-600 group-hover:text-white',
    green: 'text-green-600 bg-green-100 group-hover:bg-green-600 group-hover:text-white',
    yellow: 'text-yellow-600 bg-yellow-100 group-hover:bg-yellow-600 group-hover:text-white',
    purple: 'text-purple-600 bg-purple-100 group-hover:bg-purple-600 group-hover:text-white',
    indigo: 'text-indigo-600 bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: isCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex md:flex-col h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-sm flex-shrink-0 overflow-y-auto"
      style={{ 
        width: isCollapsed ? '80px' : '280px',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">Menu</span>
                <ChevronLeft className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : colorClasses[item.color]
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>

                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex-1 flex items-center justify-between min-w-0"
                    >
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && !isActive && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex-shrink-0 ml-2">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {isCollapsed && item.badge && !isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Help Section */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 border-t border-gray-200 flex-shrink-0"
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Check out our help center for guides and tips.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                Visit Help Center
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}
