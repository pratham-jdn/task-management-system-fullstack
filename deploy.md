# Deployment Guide for Render

## 🚀 Step-by-Step Deployment Instructions

### Prerequisites
1. ✅ GitHub repository with your code
2. ✅ MongoDB Atlas account (for database)
3. ✅ Render account

### Step 1: Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier)
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string

### Step 2: Deploy Backend on Render

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Service**:
   - **Name**: `taskmanagement-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex_panscience_2024
   JWT_EXPIRE=30d
   CLIENT_URL=https://your-frontend-url.onrender.com
   MAX_FILE_UPLOAD=5242880
   ```

4. **Deploy**: Click "Create Web Service"

### Step 3: Deploy Frontend on Render

1. **Create Static Site**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Site**:
   - **Name**: `taskmanagement-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_APP_NAME=Task Management System
   REACT_APP_VERSION=1.0.0
   ```

4. **Deploy**: Click "Create Static Site"

### Step 4: Update URLs

1. **After Backend Deploys**:
   - Copy the backend URL (e.g., `https://taskmanagement-backend.onrender.com`)
   - Update frontend environment variable `REACT_APP_API_URL`

2. **After Frontend Deploys**:
   - Copy the frontend URL (e.g., `https://taskmanagement-frontend.onrender.com`)
   - Update backend environment variable `CLIENT_URL`

### Step 5: Test Deployment

1. **Backend Health Check**:
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"success": true, "message": "Server is running"}`

2. **API Documentation**:
   - Visit: `https://your-backend-url.onrender.com/api-docs`

3. **Frontend Application**:
   - Visit: `https://your-frontend-url.onrender.com`
   - Test login and task creation

### Step 6: Create Initial Users

1. **Option 1: Use the API directly**:
   ```bash
   curl -X POST https://your-backend-url.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@taskmanagement.com",
       "password": "Admin123!",
       "role": "admin"
     }'
   ```

2. **Option 2: Use the frontend registration**:
   - Go to the registration page
   - Create your admin account

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**:
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

3. **CORS Errors**:
   - Verify CLIENT_URL matches your frontend URL
   - Check CORS configuration in backend

4. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify sensitive values are not exposed

### Performance Tips:

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds
   - Consider upgrading for production use

2. **Optimization**:
   - Enable gzip compression
   - Optimize images and assets
   - Use CDN for static assets

## 📞 Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Review MongoDB Atlas logs
3. Test API endpoints individually
4. Check browser console for frontend errors

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: `https://your-frontend-url.onrender.com`
- **Backend**: `https://your-backend-url.onrender.com`
- **API Docs**: `https://your-backend-url.onrender.com/api-docs`