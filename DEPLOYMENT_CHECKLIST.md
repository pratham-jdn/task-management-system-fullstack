# 📋 Render Deployment Checklist

## Before You Start
- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is created
- [ ] You have your MongoDB connection string

## Backend Service Setup
- [ ] Create new Web Service in Render
- [ ] Connect GitHub repository
- [ ] Set Environment to **Node** (not Docker)
- [ ] Set Root Directory to **backend** (exactly this, no slashes)
- [ ] Set Build Command to **npm install**
- [ ] Set Start Command to **npm start**
- [ ] Add all environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] MONGODB_URI=(your MongoDB Atlas connection string)
  - [ ] JWT_SECRET=pratham123
  - [ ] JWT_EXPIRE=30d
  - [ ] CLIENT_URL=(will add after frontend is deployed)
  - [ ] MAX_FILE_UPLOAD=5242880

## Frontend Service Setup
- [ ] Create new Static Site in Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory to **frontend** (exactly this, no slashes)
- [ ] Set Build Command to **npm install && npm run build**
- [ ] Set Publish Directory to **build**
- [ ] Add environment variables:
  - [ ] REACT_APP_API_URL=(will add after backend is deployed)
  - [ ] REACT_APP_APP_NAME=Task Management System
  - [ ] REACT_APP_VERSION=1.0.0

## After Deployment
- [ ] Backend deploys successfully
- [ ] Copy backend URL and update frontend REACT_APP_API_URL
- [ ] Frontend deploys successfully  
- [ ] Copy frontend URL and update backend CLIENT_URL
- [ ] Test backend health: https://your-backend-url.onrender.com/api/health
- [ ] Test frontend app: https://your-frontend-url.onrender.com
- [ ] Create first admin user
- [ ] Test login and task creation

## Common Issues & Solutions

### "Couldn't find package.json"
- ✅ Check Root Directory is set correctly
- ✅ Verify GitHub repo structure
- ✅ Clear build cache and redeploy

### "Dockerfile not found"
- ✅ Make sure Environment is "Node" not "Docker"
- ✅ Delete and recreate service if needed

### Build fails
- ✅ Check build logs in Render dashboard
- ✅ Verify all dependencies are in package.json
- ✅ Check Node.js version compatibility

### App loads but API calls fail
- ✅ Check CORS settings (CLIENT_URL in backend)
- ✅ Verify API URL in frontend environment variables
- ✅ Check if backend service is running

## Success URLs
Once everything is working:
- **Frontend**: https://your-frontend-name.onrender.com
- **Backend API**: https://your-backend-name.onrender.com/api
- **API Docs**: https://your-backend-name.onrender.com/api-docs
- **Health Check**: https://your-backend-name.onrender.com/api/health