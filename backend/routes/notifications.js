const { pool } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    // Verify user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get all notifications for this user, ordered by most recent first
    const [notifications] = await connection.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    
    await connection.release();

    res.json({
      success: true,
      notifications: notifications.map(notif => ({
        ...notif,
        image: notif.image ? notif.image.toString('base64') : null,
        read: notif.read_status,
        viewed: notif.is_viewed
      }))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnread = async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    // Verify user exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get all unread notifications for this user
    const [notifications] = await connection.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? AND read_status = FALSE
       ORDER BY created_at DESC`,
      [userId]
    );
    
    await connection.release();

    res.json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(notif => ({
        ...notif,
        image: notif.image ? notif.image.toString('base64') : null,
        read: notif.read_status,
        viewed: notif.is_viewed
      }))
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.userId;

    const connection = await pool.getConnection();

    // Verify ownership
    const [notifications] = await connection.query(
      'SELECT user_id FROM notifications WHERE id = ?',
      [notificationId]
    );
    
    if (notifications.length === 0 || notifications[0].user_id !== userId) {
      await connection.release();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await connection.query(
      'UPDATE notifications SET read_status = TRUE, is_viewed = TRUE WHERE id = ?',
      [notificationId]
    );
    await connection.release();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE notifications SET read_status = TRUE, is_viewed = TRUE WHERE user_id = ? AND read_status = FALSE',
      [userId]
    );
    
    await connection.release();

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
