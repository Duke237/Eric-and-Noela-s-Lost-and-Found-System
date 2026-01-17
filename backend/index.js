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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
