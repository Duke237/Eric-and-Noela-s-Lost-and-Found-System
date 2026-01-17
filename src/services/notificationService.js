// Enhanced Notification Service with Real-Time Support
import { getAuthToken, API_BASE_URL } from './api.js';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.unreadCount = 0;
    this.pollInterval = null;
    this.isPolling = false;
  }

  /**
   * Subscribe to notification updates
   * @param {Function} callback - Called when new notifications arrive
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all subscribers of new notifications
   */
  notifySubscribers(notifications) {
    this.listeners.forEach(callback => {
      try {
        callback(notifications);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  /**
   * Fetch all notifications for current user
   */
  async fetchAll() {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token available for notifications');
        return { success: false, notifications: [] };
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, notifications: [], error: error.message };
    }
  }

  /**
   * Fetch only unread notifications
   */
  async fetchUnread() {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, notifications: [], count: 0 };
      }

      const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch unread notifications: ${response.statusText}`);
      }

      const data = await response.json();
      this.unreadCount = data.count || 0;
      return data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return { success: false, notifications: [], count: 0, error: error.message };
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      const token = getAuthToken();
      if (!token) return { success: false };

      const response = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read`);
      }

      const data = await response.json();
      if (data.success && this.unreadCount > 0) {
        this.unreadCount--;
      }
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const token = getAuthToken();
      if (!token) return { success: false };

      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read`);
      }

      this.unreadCount = 0;
      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start polling for new notifications
   * @param {number} intervalMs - Poll interval in milliseconds (default: 5000)
   */
  startPolling(intervalMs = 5000) {
    if (this.isPolling) {
      console.warn('Polling already started');
      return;
    }

    this.isPolling = true;
    let lastNotificationCount = 0;
    let seenNotificationIds = new Set();

    const poll = async () => {
      try {
        const data = await this.fetchUnread();
        if (data.success && data.notifications) {
          console.log(`📬 Polled: Found ${data.notifications.length} unread notifications (previous count: ${lastNotificationCount})`);
          
          // Track new notifications by ID
          const newNotifications = data.notifications.filter(n => !seenNotificationIds.has(n.id));
          
          if (newNotifications.length > 0) {
            console.log(`🔔 New notifications detected: ${newNotifications.length}`);
            newNotifications.forEach(n => seenNotificationIds.add(n.id));
            this.unreadCount = data.count || data.notifications.length;
            this.notifySubscribers(newNotifications);
          }
          
          // Update count
          lastNotificationCount = data.notifications.length;
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    };

    // Initial poll
    console.log('🔄 Starting notification polling...');
    poll();

    // Set up interval
    this.pollInterval = setInterval(poll, intervalMs);

    console.log(`✅ Notification polling started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop polling for new notifications
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.isPolling = false;
      console.log('Notification polling stopped');
    }
  }

  /**
   * Get current unread count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.listeners = [];
    this.unreadCount = 0;
    this.stopPolling();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
