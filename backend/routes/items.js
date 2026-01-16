const { pool } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      'SELECT * FROM items WHERE status = "active" ORDER BY created_at DESC'
    );
    await connection.release();

    res.json({
      success: true,
      items: items.map(item => ({
        ...item,
        image: item.image ? item.image.toString('base64') : null
      }))
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, category, itemName, description, location, date, contactInfo } = req.body;
    const userId = req.userId;
    const image = req.body.image || null;

    if (!type || !category || !itemName || !location || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Insert item
    const [result] = await connection.query(
      `INSERT INTO items (type, category, item_name, description, location, date, contact_info, user_id, image, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [type, category, itemName, description, location, date, contactInfo, userId, image ? Buffer.from(image, 'base64') : null]
    );

    const itemId = result.insertId;

    // Update user stats
    const statField = type === 'lost' ? 'lost_items' : 'found_items';
    await connection.query(
      `UPDATE user_stats SET ${statField} = ${statField} + 1 WHERE user_id = ?`,
      [userId]
    );

    // Broadcast notification to all users
    const [allUsers] = await connection.query('SELECT id FROM users');
    
    for (const user of allUsers) {
      await connection.query(
        `INSERT INTO notifications (user_id, item_id, item_name, location, type, date, image, message, read_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [
          user.id,
          itemId,
          itemName,
          location,
          type,
          date,
          image ? Buffer.from(image, 'base64') : null,
          `A ${type} item has been reported: ${itemName} at ${location}`
        ]
      );
    }

    await connection.release();

    res.status(201).json({
      success: true,
      message: 'Item reported successfully',
      item: { id: itemId, type, category, itemName, location, date }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    const [items] = await connection.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    await connection.release();

    res.json({
      success: true,
      items: items.map(item => ({
        ...item,
        image: item.image ? item.image.toString('base64') : null
      }))
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsResolved = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

    const connection = await pool.getConnection();

    // Verify ownership
    const [items] = await connection.query('SELECT user_id FROM items WHERE id = ?', [itemId]);
    if (items.length === 0 || items[0].user_id !== userId) {
      await connection.release();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await connection.query('UPDATE items SET status = ? WHERE id = ?', ['resolved', itemId]);
    await connection.release();

    res.json({ success: true, message: 'Item marked as resolved' });
  } catch (error) {
    console.error('Mark resolved error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
