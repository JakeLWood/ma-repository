#!/bin/bash

# M&A Platform - Startup Script
# This script helps you start the M&A Platform quickly

set -e

echo "🚀 M&A Platform - Startup Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required (you have v$NODE_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if ports are available
echo "📡 Checking ports..."
if check_port 5000; then
    echo -e "${YELLOW}⚠️  Port 5000 is already in use${NC}"
    echo "   The backend may already be running, or another process is using this port"
fi

if check_port 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use${NC}"
    echo "   The frontend may already be running, or another process is using this port"
fi
echo ""

# Check for PostgreSQL
echo "🗄️  Checking database..."
if command -v docker &> /dev/null; then
    echo -e "${BLUE}🐳 Docker detected - you can use: docker-compose up -d${NC}"
elif command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL client detected${NC}"
else
    echo -e "${YELLOW}⚠️  Neither Docker nor PostgreSQL detected${NC}"
    echo "   You'll need one of these to run the database"
fi
echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd server

if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}   ✅ .env file created${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
    echo -e "${GREEN}   ✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}   ✅ Backend dependencies already installed${NC}"
fi

if [ ! -d "node_modules/.prisma" ]; then
    echo "   Generating Prisma client..."
    npx prisma generate
    echo -e "${GREEN}   ✅ Prisma client generated${NC}"
fi

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd client

if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}   ✅ .env file created${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}   ✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}   ✅ Frontend dependencies already installed${NC}"
fi

cd ..

# Instructions
echo ""
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Start the database:"
echo "   ${BLUE}docker-compose up -d${NC}"
echo ""
echo "2️⃣  In a new terminal, start the backend:"
echo "   ${BLUE}cd server && npm run dev${NC}"
echo ""
echo "3️⃣  In another terminal, start the frontend:"
echo "   ${BLUE}cd client && npm run dev${NC}"
echo ""
echo "4️⃣  Open your browser:"
echo "   ${BLUE}http://localhost:5173${NC}"
echo ""
echo "🔑 Default Login:"
echo "   Email:    admin@ma-platform.com"
echo "   Password: Admin123!"
echo ""
echo "💡 Tip: Check QUICKSTART.md for detailed instructions"
echo ""
