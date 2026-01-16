# Lost & Found Application - Full Setup Guide

## ✅ Backend Setup

### 1. Install Node.js Dependencies

```bash
cd c:\Users\DELL PC\Desktop\Eric-Noela\backend
npm install
```

### 2. Verify MySQL is Running

**Windows with MySQL Service:**
```bash
# Check if MySQL service is running in Services
# Or start from command line if using XAMPP:
"C:\xampp\mysql\bin\mysqld.exe"
```

### 3. Update Database Credentials

Edit `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root  # Change if different
DB_NAME=lost_found_db
JWT_SECRET=your_jwt_secret_key_change_this
PORT=5000
```

### 4. Start Backend Server

```bash
cd c:\Users\DELL PC\Desktop\Eric-Noela\backend
npm run dev
```

**Expected Output:**
```
✅ Database initialized successfully
🚀 Server running on http://localhost:5000
```

---

## ✅ Frontend Setup (Already Complete)

The frontend API (`src/services/api.js`) has been updated to use real HTTP requests to the backend.

### 1. Start Frontend (in new terminal)

```bash
cd c:\Users\DELL PC\Desktop\Eric-Noela
npm run dev
```

---

## 📊 Database Structure

### Tables Created Automatically:

#### `users`
- id (INT, Primary Key, Auto-increment)
- email (VARCHAR, Unique)
- password (VARCHAR, hashed)
- name (VARCHAR)
- created_at (TIMESTAMP)

#### `items`
- id (INT, Primary Key)
- type (ENUM: 'lost' or 'found')
- category (VARCHAR)
- item_name (VARCHAR)
- description (TEXT)
- location (VARCHAR)
- date (DATE)
- contact_info (VARCHAR)
- user_id (INT, Foreign Key)
- status (VARCHAR)
- image (LONGBLOB - stores base64 image data)
- created_at (TIMESTAMP)

#### `notifications`
- id (INT, Primary Key)
- user_id (INT, Foreign Key)
- item_id (INT)
- item_name (VARCHAR)
- location (VARCHAR)
- type (VARCHAR: 'lost', 'found', 'location-risk')
- date (DATE)
- image (LONGBLOB)
- message (TEXT)
- read_status (BOOLEAN)
- created_at (TIMESTAMP)

#### `user_stats`
- id (INT, Primary Key)
- user_id (INT, Foreign Key, Unique)
- lost_items (INT)
- found_items (INT)
- created_at (TIMESTAMP)

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email & password
- `POST /api/auth/signup` - Register new user

### Items
- `GET /api/items` - Get all active items
- `POST /api/items` - Create new item (requires token)
- `GET /api/items/user` - Get user's items (requires token)
- `POST /api/items/resolve` - Mark item as resolved (requires token)

### Notifications
- `GET /api/notifications` - Get user's notifications (requires token)
- `POST /api/notifications/read` - Mark notification as read (requires token)

### User Stats
- `GET /api/user-stats` - Get user's statistics (requires token)

---

## 🧪 Testing the Backend

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

---

## 🔐 How It Works

1. **User Signup/Login**: Frontend sends credentials → Backend validates → Returns JWT token
2. **Token Storage**: JWT stored in localStorage
3. **Authenticated Requests**: Each request includes `Authorization: Bearer {token}`
4. **Database Persistence**: All data stored in MySQL
5. **Image Storage**: Images converted to base64 and stored as LONGBLOB in database
6. **Notifications**: Automatic broadcast when items are reported

---

## 📝 Key Changes from Mock API

| Feature | Before (Mock) | After (Real) |
|---------|------|------|
| Storage | localStorage | MySQL Database |
| Authentication | Fake tokens | JWT with bcrypt |
| User Stats | localStorage | Persistent DB |
| Notifications | In-memory | Database |
| Images | Base64 in localStorage | MySQL LONGBLOB |
| Multi-user | Single user | Full multi-user support |

---

## ⚙️ Environment Variables

**Backend `.env` file:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=lost_found_db
JWT_SECRET=your_secret_key
PORT=5000
```

**Frontend**: No changes needed (uses http://localhost:5000/api)

---

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Start MySQL service
- Windows: Services → MySQL80 → Start
- XAMPP: Click "Start" for MySQL
- Command: `mysqld.exe`

### Database Already Exists Error
**Solution**: Backend will skip database creation. This is normal.

### Port 5000 Already in Use
**Solution**: Change PORT in `.env` or kill existing process
```bash
netstat -ano | findstr :5000
taskkill /PID {PID} /F
```

### Token Expired Error
**Solution**: Logout and login again to refresh token

---

## 🚀 Ready to Use!

1. ✅ MySQL database running
2. ✅ Backend started on port 5000
3. ✅ Frontend connected to backend
4. ✅ All data persists in database

Your Lost & Found app now has a complete backend with MySQL!
