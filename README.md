# Task Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing tasks and projects with user authentication, role-based access control, and file attachments.

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Admin/User)
- Password change functionality
- Account activation/deactivation

### Task Management
- Create, read, update, and delete tasks
- Task status tracking (Pending, In Progress, Completed, Cancelled)
- Priority levels (Low, Medium, High, Urgent)
- Due date management with overdue detection
- File attachments (PDF support)
- Task comments and collaboration
- Advanced filtering and search
- Task statistics and analytics

### User Management (Admin Only)
- User CRUD operations
- User role management
- Account activation/deactivation
- User statistics

### Additional Features
- Responsive design with Tailwind CSS
- File upload with validation
- Real-time notifications
- Pagination and sorting
- Data validation and error handling
- API documentation with Swagger
- Docker containerization
- Comprehensive testing

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Swagger** - API documentation
- **Jest** - Testing framework

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Toastify** - Notifications

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for frontend

## Project Structure

```
task-management-system/
├── backend/
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── tests/              # Test files
│   ├── uploads/            # File uploads directory
│   ├── server.js           # Main server file
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main App component
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker composition
├── mongo-init.js          # MongoDB initialization
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- Docker and Docker Compose (optional)

### Installation

#### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   - Install and start MongoDB
   - The application will create necessary collections automatically

#### Option 2: Docker Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
MAX_FILE_UPLOAD=5242880
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

Once the backend is running, visit `http://localhost:5000/api-docs` to view the Swagger API documentation.

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

#### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `GET /api/tasks/stats` - Get task statistics

#### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

## Usage

### Default Admin Account
- Email: `admin@taskmanagement.com`
- Password: `admin123`

### Creating Tasks
1. Navigate to Tasks → Create Task
2. Fill in task details (title, description, due date, assignee)
3. Optionally add tags and file attachments
4. Submit to create the task

### Managing Users (Admin)
1. Navigate to Users section
2. View all users with filtering options
3. Create, edit, or deactivate user accounts
4. View user statistics and activity

### Task Filtering
- Filter by status, priority, assignee
- Search by title, description, or tags
- Sort by various criteria
- View overdue tasks

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with a web server
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File upload restrictions
- Rate limiting
- CORS configuration
- Security headers
- Role-based access control

## Performance Optimizations

- Database indexing
- Pagination for large datasets
- File size limitations
- Caching strategies
- Optimized queries
- Lazy loading
- Code splitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@taskmanagement.com or create an issue in the repository.

## Acknowledgments

- Built with MERN stack
- UI components inspired by modern design systems
- Icons from Heroicons
- Styling with Tailwind CSS