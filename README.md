# Task Management System

A comprehensive MERN stack task management application with user authentication, task assignment, file uploads, and real-time updates.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Task Management**: Create, update, delete, and assign tasks
- **File Uploads**: Attach files to tasks with secure storage
- **User Management**: Admin panel for user management
- **Real-time Updates**: Live task status updates
- **Responsive Design**: Mobile-friendly interface
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Swagger** for API documentation
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Axios** for API calls

## 📦 Project Structure

```
├── backend/                 # Node.js/Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   └── uploads/           # File upload directory
├── frontend/              # React frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── store/        # Redux store
│       ├── types/        # TypeScript types
│       └── utils/        # Utility functions
└── README.md
```

## 🚀 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables (see .env.example)

### Frontend (Render/Netlify/Vercel)
1. Create a new Static Site
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variables (see .env.example)

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend-url.com
MAX_FILE_UPLOAD=5242880
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_APP_NAME=Task Management System
REACT_APP_VERSION=1.0.0
```

## 👥 Default Users

After deployment, you can create users or use the seeder script:

```bash
npm run seed:users
```

## 📚 API Documentation

Once deployed, visit `/api-docs` on your backend URL to view the Swagger documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.