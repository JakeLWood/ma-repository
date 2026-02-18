# M&A Platform

A full-stack Mergers & Acquisitions platform built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### 🔐 Authentication
- JWT-based authentication with secure password hashing
- User registration and login
- Protected routes and role-based access

### 👥 CRM Module
- **Companies Management**: Create, view, edit, and delete companies
- **Contacts Management**: Manage contacts with company associations
- Advanced search and filtering capabilities

### 💼 Deal Flow Pipeline
- **Kanban Board**: Visual deal pipeline with drag-and-drop
- **Deal Stages**: SOURCING → SCREENING → DUE_DILIGENCE → NEGOTIATION → CLOSING → CLOSED
- **Deal Tracking**: Monitor deal amount, valuation, probability, and close dates

### 📁 Diligence Platform
- **Document Management**: Upload, download, and organize documents by deal
- **Due Diligence Checklists**: Create and track checklist items
- Progress tracking for completion status

### 📊 Dashboard
- Real-time statistics and metrics
- Deal pipeline overview by stage
- Recent activity timeline

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons
- **Drag & Drop**: @dnd-kit

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: Zod
- **Security**: Helmet.js, CORS

## 🚀 Quick Start

**Want to get started quickly?** Check out our [**QUICKSTART.md**](QUICKSTART.md) guide for a step-by-step walkthrough!

### Easy Setup Script

We've included convenient setup scripts to help you get started:

**Unix/Mac/Linux:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

These scripts will:
- ✅ Check your Node.js installation
- ✅ Install dependencies for both backend and frontend
- ✅ Create .env files from examples
- ✅ Generate Prisma client
- ✅ Provide next steps to start the application

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (or use Docker)

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env

npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

npm run dev
```

Backend: http://localhost:5000

### 3. Setup Frontend

```bash
cd client
npm install
cp .env.example .env

npm run dev
```

Frontend: http://localhost:5173

### Default Login

```
Email: admin@ma-platform.com
Password: Admin123!
```

## Project Structure

```
ma-repository/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── server/          # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.ts
│   ├── prisma/
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/companies` - List companies
- `GET /api/contacts` - List contacts
- `GET /api/deals` - List deals
- `GET /api/deals/stats` - Pipeline stats
- `POST /api/deals/:dealId/documents` - Upload document
- `GET /api/deals/:dealId/checklists` - Get checklists

See full API documentation in the code.

## License

ISC
