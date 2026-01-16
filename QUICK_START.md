# Quick Start - Backend Setup

## Step 1: Start MySQL
- Open **Services** (Win + R → services.msc)
- Find **MySQL80** and click **Start**
- OR use XAMPP → Click **Start** for MySQL

## Step 2: Install Dependencies & Start Backend

```bash
cd backend
npm install
npm run dev
```

**Wait for:** `✅ Database initialized successfully` and `🚀 Server running on http://localhost:5000`

## Step 3: Start Frontend (New Terminal)

```bash
npm run dev
```

## Step 4: Test the App

1. Go to http://localhost:5173
2. Sign up with test account
3. Go to dashboard and report an item
4. Check database with DevTools → Application → Local Storage

## View Database

### Option A: DevTools (Easiest)
1. F12 in browser
2. Application → Local Storage
3. You'll see `token` and `currentUser` stored

### Option B: MySQL Workbench
1. Open MySQL Workbench
2. Double-click your local connection
3. Database → lost_found_db
4. Right-click tables → Select Rows

### Option C: Command Line
```bash
mysql -u root -p
use lost_found_db;
select * from users;
select * from items;
```

## What's Different Now?

| Feature | Location |
|---------|----------|
| Users | MySQL `users` table |
| Items | MySQL `items` table |
| Notifications | MySQL `notifications` table |
| Stats | MySQL `user_stats` table |
| Images | Base64 in MySQL `items.image` |
| Token | JWT stored in localStorage |

## Backend Files Created

```
backend/
├── index.js                    (Server entry point)
├── db.js                       (Database connection & init)
├── package.json               (Dependencies)
├── .env                       (Config)
├── middleware/
│   └── auth.js               (JWT verification)
└── routes/
    ├── auth.js               (Login/Signup)
    ├── items.js              (Report/View items)
    ├── notifications.js       (Notifications)
    └── userStats.js          (User statistics)
```

## API Base URL
`http://localhost:5000/api`

All requests automatically use this URL from `src/services/api.js`

## Common Issues

| Issue | Fix |
|-------|-----|
| Port 5000 in use | Change PORT in `.env` |
| MySQL won't connect | Check password in `.env` |
| Database not created | Let backend run, it creates automatically |
| Token expired | Log out and log back in |
