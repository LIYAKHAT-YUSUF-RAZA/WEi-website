# Deploying WEintegrity on Render

This guide walks you through deploying the WEintegrity full-stack application on Render.

## Prerequisites

1. A GitHub/GitLab/Bitbucket account with your repository
2. A Render account (sign up at https://render.com)
3. MongoDB Atlas account (or another MongoDB hosting service)
4. Email account credentials for nodemailer

## Deployment Options

### Option 1: Using render.yaml (Blueprint) - RECOMMENDED

This is the easiest method as it deploys both frontend and backend automatically.

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Create a New Blueprint on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to create both services

3. **Configure Environment Variables**
   
   For the **Backend Service** (weintegrity-backend):
   - Go to the backend service in your Render dashboard
   - Navigate to "Environment" tab
   - Add the following variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weintegrity
     JWT_SECRET=your_secure_random_string_here
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_specific_password
     NODE_ENV=production
     FRONTEND_URL=https://weintegrity-frontend.onrender.com
     ```
   
   For the **Frontend Service** (weintegrity-frontend):
   - The `VITE_API_URL` is already configured in render.yaml
   - Update it if your backend URL is different

4. **Update Frontend URL in render.yaml** (if needed)
   - After backend deploys, copy its URL
   - Update `VITE_API_URL` in render.yaml to match your backend URL
   - Commit and push changes

5. **Trigger Deployment**
   - Both services will automatically deploy
   - Backend typically takes 2-5 minutes
   - Frontend takes 1-3 minutes

### Option 2: Manual Deployment

#### Deploy Backend

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: weintegrity-backend
     - **Region**: Oregon (or closest to you)
     - **Branch**: main
     - **Root Directory**: (leave empty or specify `backend`)
     - **Runtime**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Plan**: Free

2. **Add Environment Variables** (see above)

3. **Deploy**

#### Deploy Frontend

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your repository
   - Configure:
     - **Name**: weintegrity-frontend
     - **Branch**: main
     - **Root Directory**: (leave empty)
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
     - **Plan**: Free

2. **Add Environment Variable**
   - `VITE_API_URL`: Your backend URL (e.g., https://weintegrity-backend.onrender.com)

3. **Add Rewrite Rule** (for React Router)
   - In the frontend service settings
   - Go to "Redirects/Rewrites"
   - Add: `/*` → `/index.html` (Rewrite)

4. **Deploy**

## Post-Deployment Steps

1. **Update CORS Settings**
   - The backend is already configured to accept requests from Render
   - If you use a custom domain, add it to the allowedOrigins in `backend/server.js`

2. **Test the Application**
   - Visit your frontend URL: https://weintegrity-frontend.onrender.com
   - Test login, registration, and API calls
   - Check browser console for any errors

3. **Configure Custom Domain** (Optional)
   - In Render dashboard, go to your service
   - Click "Settings" → "Custom Domain"
   - Follow instructions to add your domain
   - Update CORS settings in backend accordingly

## MongoDB Atlas Setup

If you don't have MongoDB Atlas set up:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) or Render's IPs
5. Get your connection string
6. Replace `<password>` with your database user password
7. Add the connection string to `MONGODB_URI` in Render

## Gmail App Password Setup

For the email service to work:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Use this password in the `EMAIL_PASS` environment variable

## Troubleshooting

### Backend Won't Start
- Check the logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` points to the correct backend URL
- Check CORS settings in backend
- Ensure backend is running (check backend service status)

### Database Connection Issues
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check if the connection string is correct
- Ensure the database user has proper permissions

### Email Not Sending
- Verify Gmail app password is correct
- Check if 2FA is enabled on your Google account
- Review backend logs for email errors

## Important Notes

1. **Free Tier Limitations**
   - Free services spin down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - Consider upgrading to paid plan for production use

2. **URLs**
   - Backend: https://weintegrity-backend.onrender.com
   - Frontend: https://weintegrity-frontend.onrender.com
   - Update these in your configuration if you use different names

3. **Auto-Deploy**
   - Both services are configured for automatic deployment
   - Pushing to main branch will trigger redeployment
   - You can disable this in service settings

4. **Environment Variables**
   - Never commit .env files to Git
   - Use Render's environment variable system
   - Reference: `.env.render.example` file

## Monitoring

- Check service logs in Render dashboard
- Set up status notifications in Render settings
- Monitor your MongoDB Atlas usage

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure custom domain if needed
4. Consider upgrading to paid tier for production
5. Set up database backups
6. Implement CI/CD pipeline for testing before deployment

## Support

- Render Documentation: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Report issues in your repository

---

**Last Updated**: January 2, 2026
