const { pool } = require('../db');

exports.get = async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    const [stats] = await connection.query(
      'SELECT lost_items, found_items FROM user_stats WHERE user_id = ?',
      [userId]
    );
    await connection.release();

    if (stats.length === 0) {
      return res.json({ success: true, stats: { lost_items: 0, found_items: 0 } });
    }

    res.json({
      success: true,
      stats: {
        lostItems: stats[0].lost_items,
        foundItems: stats[0].found_items
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
