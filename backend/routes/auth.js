const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
require('dotenv').config();

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if user exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.release();
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await connection.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const userId = result.insertId;

    // Initialize user stats
    await connection.query(
      'INSERT INTO user_stats (user_id, lost_items, found_items) VALUES (?, 0, 0)',
      [userId]
    );

    // Create location-risk notification for new users
    const riskPercentage = Math.floor(Math.random() * (85 - 45 + 1)) + 45;
    const areas = ['downtown', 'shopping district', 'transit hub', 'park', 'university'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];

    await connection.query(
      `INSERT INTO notifications (user_id, type, message, read_status) 
       VALUES (?, 'location-risk', ?, FALSE)`,
      [userId, `⚠️ High Loss Risk Alert: You're in a high-risk area (${randomArea}). Loss probability: ${riskPercentage}%`]
    );

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    await connection.release();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query('SELECT id, email, password, name, registered_at FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      await connection.release();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      await connection.release();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await connection.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    await connection.release();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        registered_at: user.registered_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
