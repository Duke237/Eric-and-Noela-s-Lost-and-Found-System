# Global Notification System

## Overview

This document describes the comprehensive global notification system implemented in the Lost & Found application. The system ensures real-time and persistent notification delivery for all users when items are reported.

## Architecture

### Frontend (`src/services/notificationService.js`)

The notification service provides:

- **Real-time polling**: Polls the backend every 5 seconds for new notifications
- **Subscription model**: Multiple components can subscribe to notification updates
- **Unread count tracking**: Maintains unread notification count
- **Automatic handling**: Differentiates between online and offline users

**Key Methods:**
```javascript
notificationService.subscribe(callback)    // Subscribe to updates
notificationService.fetchAll()             // Fetch all notifications
notificationService.fetchUnread()          // Fetch unread notifications
notificationService.markAsRead(id)         // Mark single notification as read
notificationService.markAllAsRead()        // Mark all as read
notificationService.startPolling(ms)       // Start polling for new notifications
notificationService.stopPolling()          // Stop polling
notificationService.getUnreadCount()       // Get current unread count
```

### Backend API Routes

#### GET `/api/notifications`
Fetches all notifications for the authenticated user created after their registration date.

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "user_id": 2,
      "item_id": 1,
      "item_name": "Blue Backpack",
      "location": "Downtown",
      "type": "lost",
      "message": "A 🔍 Lost item has been reported...",
      "read_status": false,
      "is_viewed": false,
      "created_at": "2026-01-17T10:30:00Z"
    }
  ]
}
```

#### GET `/api/notifications/unread`
Fetches only unread notifications with count.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "notifications": [...]
}
```

#### POST `/api/notifications/mark-read`
Marks a single notification as read.

**Request Body:**
```json
{
  "notificationId": 1
}
```

#### POST `/api/notifications/mark-all-read`
Marks all notifications as read for the current user.

## Key Features

### 1. Real-Time Delivery for Active Users

When a lost or found item is reported:
1. Item is saved to database
2. Notifications are created for all existing users
3. Frontend polling detects new notifications within 5 seconds
4. Notifications appear automatically without page refresh

**Implementation Details:**
- Uses polling every 5 seconds (configurable)
- Listeners in Notifications page and Sidebar receive updates
- Unread count updates in real-time in sidebar

### 2. Offline User Notification Retrieval

Users who are offline receive notifications when they:
1. **Log in again**: Notifications are fetched automatically
2. **Refresh the app**: Notifications are loaded from the API
3. **Visit Notifications page**: All notifications are displayed

**Filter Logic:**
- Only notifications created after user's `registered_at` timestamp are shown
- Prevents showing pre-registration item reports to new users

### 3. Registration Date Filtering

**Database Schema:**
```sql
-- Users table now tracks registration time
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table has unique constraint to prevent duplicates
CREATE TABLE notifications (
  ...
  UNIQUE KEY unique_user_item (user_id, item_id),
  ...
);
```

**Query with Registration Filter:**
```sql
SELECT * FROM notifications 
WHERE user_id = ? AND created_at >= ? 
ORDER BY created_at DESC
```

### 4. Duplicate Prevention

- **Database Level**: UNIQUE constraint on `(user_id, item_id)` prevents duplicate entries
- **Query Level**: INSERT IGNORE clause skips duplicate attempts
- **Frontend Level**: Deduplication in Notifications component by item_id

### 5. Notification Ordering

All notifications are ordered by creation time (most recent first):
```sql
ORDER BY created_at DESC
```

## User Flow Examples

### Scenario 1: Active User (Online)

```
User A is logged in at 2:00 PM
User B reports a lost item at 2:05 PM
  ↓
Backend creates notification for User A
  ↓
Frontend polling (every 5 seconds) fetches new notifications
  ↓
At 2:05:00-2:05:05: New notification appears for User A
  ↓
Notification badge appears in sidebar showing "1 unread"
```

### Scenario 2: Offline User

```
User A logs out at 1:00 PM
User B reports a lost item at 1:05 PM
  ↓
Backend creates notification for User A (with registered_at < 1:05 PM)
  ↓
User A logs back in at 2:00 PM
  ↓
Notifications page automatically loads all notifications from 1:05 PM onwards
  ↓
User A sees the notification about User B's item
```

### Scenario 3: New User

```
User C registers at 2:00 PM
User B reports a lost item at 1:50 PM (BEFORE User C registered)
  ↓
Backend does NOT create notification for User C
  ↓
User D reports a found item at 2:10 PM (AFTER User C registered)
  ↓
Backend creates notification for User C
  ↓
User C only sees the notification from 2:10 PM
```

## Components Integration

### 1. Notifications Page (`src/app/pages/Dashboard/Notifications.jsx`)

- Subscribes to real-time notification updates
- Automatically loads notifications on mount
- Shows unread count badge
- Supports marking as read (single and all)
- Auto-refreshes with manual refresh button

### 2. Sidebar (`src/app/components/Sidebar.jsx`)

- Displays unread notification count badge
- Updates in real-time as notifications arrive
- Subscribes to notification service for updates

### 3. Navbar (`src/app/components/Navbar.jsx`)

- Can display notification badge if needed
- Currently shows user info and logout

## Scalability Considerations

### Current Implementation
- Polling-based approach (suitable for up to 100+ concurrent users)
- 5-second polling interval (configurable)
- Efficient database queries with indexes

### Future Enhancements
1. **WebSocket Implementation**
   - Real-time push instead of polling
   - Lower latency notifications
   - Reduced server load

2. **Message Queue System**
   - Use Redis/RabbitMQ for notification broadcasting
   - Better horizontal scaling
   - Guaranteed delivery

3. **Notification Batching**
   - Group similar notifications
   - Reduce notification spam
   - Smart filtering by user preferences

## Configuration

### Polling Interval

Default: 5000ms (5 seconds)

To change:
```javascript
// In Notifications.jsx
notificationService.startPolling(3000); // 3 seconds
```

### API URL

Set in environment variable:
```
VITE_API_URL=http://localhost:5000/api
```

For production (Vercel):
```
VITE_API_URL=https://your-backend-api.com/api
```

## Testing the System

### Test 1: Real-Time Notification
1. Log in with User A
2. Open another browser/tab and log in with User B
3. Have User B report a lost item
4. Verify User A sees notification within 5 seconds

### Test 2: Offline Notification
1. Log in with User A
2. Log out
3. Have User B report a lost item
4. Log back in with User A
5. Verify User A sees the notification

### Test 3: New User Filter
1. Create User C
2. Note the exact registration time
3. Have User D report an item BEFORE User C registered
4. Log in with User C
5. Verify User C does NOT see the pre-registration item

### Test 4: Duplicate Prevention
1. Report same item twice (if possible)
2. Verify notification appears only once per user

## Troubleshooting

### Notifications Not Appearing
1. Check network tab - verify API calls are successful
2. Verify user's `registered_at` timestamp is before item's `created_at`
3. Check database for notifications table entries
4. Verify polling is started: `notificationService.isPolling`

### Duplicates Appearing
1. Check database constraint: `UNIQUE KEY unique_user_item`
2. Clear and reload notifications
3. Check frontend deduplication logic

### High Latency
1. Reduce polling interval if acceptable
2. Implement WebSocket for real-time delivery
3. Check database query performance
4. Add database indexes on `(user_id, created_at)`

## Database Queries for Debugging

### See all notifications for a user
```sql
SELECT * FROM notifications 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

### Check user's registration time
```sql
SELECT id, email, registered_at FROM users WHERE id = 1;
```

### Verify notification deduplication
```sql
SELECT user_id, item_id, COUNT(*) 
FROM notifications 
GROUP BY user_id, item_id 
HAVING COUNT(*) > 1;
```

### See recent items and their notifications
```sql
SELECT 
  i.id, i.item_name, i.type, i.created_at,
  COUNT(n.id) as notification_count
FROM items i
LEFT JOIN notifications n ON i.id = n.item_id
WHERE i.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY i.id
ORDER BY i.created_at DESC;
```

## API Response Examples

### Successful Notification Retrieval
```json
{
  "success": true,
  "notifications": [
    {
      "id": 5,
      "user_id": 1,
      "item_id": 3,
      "item_name": "Silver Watch",
      "location": "Central Park",
      "type": "found",
      "date": "2026-01-17",
      "image": "base64encodedimage...",
      "message": "A ✅ Found item has been reported: Silver Watch at Central Park",
      "read_status": false,
      "is_viewed": false,
      "created_at": "2026-01-17T14:30:00.000Z"
    }
  ]
}
```

### Mark as Read Response
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Summary

The global notification system provides:
✅ Real-time notifications for active users
✅ Persistent notifications for offline users
✅ Registration date filtering for new users
✅ Duplicate prevention
✅ Ordered by time (most recent first)
✅ Scalable architecture
✅ Fallback to mock API if backend unavailable
✅ Real-time unread count updates
