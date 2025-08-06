#!/bin/bash

# Task Management System Setup Verification Script

echo "🔍 Checking Task Management System Setup..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js is installed: $NODE_VERSION"
else
    print_status 1 "Node.js is not installed"
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm is installed: $NPM_VERSION"
else
    print_status 1 "npm is not installed"
fi

# Check MongoDB
echo "Checking MongoDB..."
if command -v mongod &> /dev/null; then
    print_status 0 "MongoDB is installed"
    if pgrep -x "mongod" > /dev/null; then
        print_status 0 "MongoDB is running"
    else
        print_warning "MongoDB is installed but not running"
        print_info "Start MongoDB with: brew services start mongodb/brew/mongodb-community"
    fi
else
    print_status 1 "MongoDB is not installed"
    print_info "Install MongoDB with: brew install mongodb/brew/mongodb-community"
fi

# Check Docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status 0 "Docker is installed: $DOCKER_VERSION"
    if docker info &> /dev/null; then
        print_status 0 "Docker is running"
    else
        print_warning "Docker is installed but not running"
    fi
else
    print_status 1 "Docker is not installed"
fi

# Check Docker Compose
echo "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status 0 "Docker Compose is installed: $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose is not installed"
fi

echo ""
echo "📁 Checking Project Structure..."

# Check backend structure
if [ -d "backend" ]; then
    print_status 0 "Backend directory exists"
    
    if [ -f "backend/package.json" ]; then
        print_status 0 "Backend package.json exists"
    else
        print_status 1 "Backend package.json missing"
    fi
    
    if [ -f "backend/server.js" ]; then
        print_status 0 "Backend server.js exists"
    else
        print_status 1 "Backend server.js missing"
    fi
    
    if [ -f "backend/.env" ]; then
        print_status 0 "Backend .env file exists"
    else
        print_warning "Backend .env file missing (copy from .env.example)"
    fi
    
    if [ -d "backend/node_modules" ]; then
        print_status 0 "Backend dependencies installed"
    else
        print_warning "Backend dependencies not installed (run: cd backend && npm install)"
    fi
else
    print_status 1 "Backend directory missing"
fi

# Check frontend structure
if [ -d "frontend" ]; then
    print_status 0 "Frontend directory exists"
    
    if [ -f "frontend/package.json" ]; then
        print_status 0 "Frontend package.json exists"
    else
        print_status 1 "Frontend package.json missing"
    fi
    
    if [ -f "frontend/src/App.tsx" ]; then
        print_status 0 "Frontend App.tsx exists"
    else
        print_status 1 "Frontend App.tsx missing"
    fi
    
    if [ -f "frontend/.env" ]; then
        print_status 0 "Frontend .env file exists"
    else
        print_warning "Frontend .env file missing"
    fi
    
    if [ -d "frontend/node_modules" ]; then
        print_status 0 "Frontend dependencies installed"
    else
        print_warning "Frontend dependencies not installed (run: cd frontend && npm install)"
    fi
else
    print_status 1 "Frontend directory missing"
fi

# Check Docker files
if [ -f "docker-compose.yml" ]; then
    print_status 0 "docker-compose.yml exists"
else
    print_status 1 "docker-compose.yml missing"
fi

if [ -f "backend/Dockerfile" ]; then
    print_status 0 "Backend Dockerfile exists"
else
    print_status 1 "Backend Dockerfile missing"
fi

if [ -f "frontend/Dockerfile" ]; then
    print_status 0 "Frontend Dockerfile exists"
else
    print_status 1 "Frontend Dockerfile missing"
fi

echo ""
echo "🚀 Setup Instructions:"
echo "================================================"

print_info "To run with Docker:"
echo "   ./start.sh"
echo ""

print_info "To run in development mode:"
echo "   ./start-dev.sh"
echo ""

print_info "Manual setup:"
echo "   1. Start MongoDB: brew services start mongodb/brew/mongodb-community"
echo "   2. Backend: cd backend && npm install && npm run dev"
echo "   3. Frontend: cd frontend && npm install && npm start"
echo ""

print_info "Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo "   API Docs: http://localhost:5001/api-docs"
echo ""

print_info "Default admin credentials:"
echo "   Email: admin@taskmanagement.com"
echo "   Password: Admin123!"

echo ""
echo "✅ Setup verification complete!"