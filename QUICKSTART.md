# 🚀 Quick Start Guide - M&A Platform

This guide will help you get the M&A Platform up and running in just a few minutes!

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ Node.js 18 or higher installed ([Download here](https://nodejs.org/))
- ✅ PostgreSQL 14+ installed OR Docker installed

**Check your Node.js version:**
```bash
node --version
# Should show v18.x.x or higher
```

## 🎯 Three Simple Steps

### Step 1: Start the Database

**Option A - Using Docker (Recommended):**
```bash
docker-compose up -d
```

**Option B - Using Local PostgreSQL:**
Create a database named `ma_platform`:
```bash
psql -U postgres -c "CREATE DATABASE ma_platform;"
```

### Step 2: Start the Backend Server

Open a terminal and run:

```bash
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

**You should see:**
```
🚀 Server running on port 5000
📊 Environment: development
🔗 API: http://localhost:5000/api
```

✅ **Backend is ready at http://localhost:5000**

### Step 3: Start the Frontend

Open a **NEW** terminal (keep the backend running) and run:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

**You should see:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ **Frontend is ready at http://localhost:5173**

## 🌐 Open the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You should see the login page!

### 🔑 Default Login Credentials

Use these credentials to log in:

```
Email:    admin@ma-platform.com
Password: Admin123!
```

## 🎉 You're Done!

You should now see the M&A Platform dashboard with:
- 📊 Statistics cards showing deal metrics
- 📈 Deal pipeline by stage chart
- 📝 Recent activities feed

## 🗺️ Explore the Platform

After logging in, you can explore:

1. **Dashboard** (`/dashboard`) - Overview of your M&A activities
2. **Companies** (`/companies`) - Manage company profiles
3. **Contacts** (`/contacts`) - Manage contact information
4. **Deals** (`/deals`) - Kanban board to track deals through stages

## 🛑 Stopping the Application

To stop the servers:

1. Press `Ctrl+C` in the terminal running the frontend
2. Press `Ctrl+C` in the terminal running the backend
3. Stop the database (if using Docker):
   ```bash
   docker-compose down
   ```

## 🔧 Troubleshooting

### Port Already in Use

If you see "Port 5000 already in use" or "Port 5173 already in use":

**Backend (port 5000):**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

**Frontend (port 5173):**
```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error

Make sure PostgreSQL is running:
```bash
# Check if Docker container is running
docker ps

# Or check local PostgreSQL
pg_isready
```

### Dependencies Issues

If you encounter dependency errors:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Errors

Reset the database and migrations:
```bash
cd server
npx prisma migrate reset
npx prisma generate
npm run prisma:seed
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API endpoints at http://localhost:5000/api
- Explore the codebase in the `client/` and `server/` directories

## 💡 Development Tips

- Keep both terminal windows open to see logs
- The frontend has hot-reload enabled (changes reflect automatically)
- The backend has nodemon (auto-restarts on file changes)
- Use Prisma Studio to view the database: `npm run prisma:studio`

## 🆘 Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Make sure all prerequisites are installed
4. Try restarting from Step 1

---

**Happy M&A tracking! 🎯**
