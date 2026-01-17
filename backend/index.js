const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const notificationsRoutes = require('./routes/notifications');
const userStatsRoutes = require('./routes/userStats');
const { verifyToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Initialize database
initializeDatabase();

// Routes
app.post('/api/auth/signup', authRoutes.signup);
app.post('/api/auth/login', authRoutes.login);

// Protected routes
app.get('/api/items', itemsRoutes.getAll);
app.post('/api/items', verifyToken, itemsRoutes.create);
app.get('/api/items/user', verifyToken, itemsRoutes.getByUserId);
app.post('/api/items/resolve', verifyToken, itemsRoutes.markAsResolved);

app.get('/api/notifications', verifyToken, notificationsRoutes.getAll);
app.get('/api/notifications/unread', verifyToken, notificationsRoutes.getUnread);
app.post('/api/notifications/mark-read', verifyToken, notificationsRoutes.markAsRead);
app.post('/api/notifications/mark-all-read', verifyToken, notificationsRoutes.markAllAsRead);

app.get('/api/user-stats', verifyToken, userStatsRoutes.get);

// Debug endpoints
app.get('/api/debug/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pool } = require('./db');
    const connection = await pool.getConnection();
    
    const [notifications] = await connection.query(
      'SELECT id, user_id, item_id, item_name, message, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [allNotifs] = await connection.query('SELECT COUNT(*) as count FROM notifications');
    
    await connection.release();
    
    res.json({
      debug: {
        totalUsers: users[0].count,
        totalNotifications: allNotifs[0].count,
        userNotifications: notifications.length,
        notifications: notifications
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/users', async (req, res) => {
  try {
    const { pool } = require('./db');
    const connection = await pool.getConnection();
    
    const [users] = await connection.query('SELECT id, email, name, registered_at FROM users');
    
    await connection.release();
    
    res.json({
      debug: {
        totalUsers: users.length,
        users: users
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
