#!/bin/bash

# Task Management System Startup Script

echo "🚀 Starting Task Management System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

# Start the application with Docker Compose
echo "📦 Building and starting containers..."
docker-compose up --build

echo "✅ Task Management System is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/api-docs"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "Default admin credentials:"
echo "Email: admin@taskmanagement.com"
echo "Password: admin123"