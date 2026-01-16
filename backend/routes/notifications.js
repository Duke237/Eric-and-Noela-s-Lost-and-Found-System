const { pool } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    const [notifications] = await connection.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    await connection.release();

    res.json({
      success: true,
      notifications: notifications.map(notif => ({
        ...notif,
        image: notif.image ? notif.image.toString('base64') : null,
        read: notif.read_status
      }))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
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
      'UPDATE notifications SET read_status = TRUE WHERE id = ?',
      [notificationId]
    );
    await connection.release();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
