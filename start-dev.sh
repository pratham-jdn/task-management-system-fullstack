#!/bin/bash

# Task Management System Development Startup Script

echo "🚀 Starting Task Management System in Development Mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "You can start MongoDB with: brew services start mongodb/brew/mongodb-community"
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

# Function to run backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    npm run dev &
    BACKEND_PID=$!
    cd ..
}

# Function to run frontend
start_frontend() {
    echo "🌐 Starting Frontend Server..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    npm start &
    FRONTEND_PID=$!
    cd ..
}

# Start both servers
start_backend
sleep 3
start_frontend

echo ""
echo "✅ Task Management System is now running in development mode!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "📚 API Documentation: http://localhost:5001/api-docs"
echo ""
echo "Default admin credentials:"
echo "Email: admin@taskmanagement.com"
echo "Password: Admin123!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait