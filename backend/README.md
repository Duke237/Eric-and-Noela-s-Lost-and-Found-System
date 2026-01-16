# Lost & Found Backend

Backend API for the Lost & Found application built with Node.js, Express, and MySQL.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lost_found_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

3. Update database credentials in `db.js`

4. Start the server:
```bash
npm run dev
```

## Database Setup

The database will be created automatically on first run. Tables include:
- users
- items
- notifications
- user_stats
