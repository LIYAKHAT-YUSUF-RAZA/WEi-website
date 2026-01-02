# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

### Step 2: Start MongoDB
```powershell
# Make sure MongoDB is running
mongod
# or
net start MongoDB
```

### Step 3: Start Backend Server
```powershell
# Open Terminal 1
cd backend
npm run dev
```
✅ Backend running at http://localhost:5000

### Step 4: Start Frontend Server
```powershell
# Open Terminal 2
cd frontend
npm run dev
```
✅ Frontend running at http://localhost:5173

### Step 5: Access the Application
Open your browser and go to: **http://localhost:5173**

---

## 👤 Create Your First Users

### Register as Candidate
1. Click "Register" button
2. Fill in details
3. Select "Candidate" role
4. Use email: `candidate@example.com`
5. Login and explore courses/internships

### Register as Manager
1. Click "Register" button
2. Fill in details
3. Select "Manager" role
4. Use email: `manager@example.com`
5. Login and manage applications

---

## 🎯 Key Features to Test

### As Candidate:
- ✅ Browse courses and internships
- ✅ View detailed information
- ✅ Enroll in courses
- ✅ Apply for internships
- ✅ Track your applications

### As Manager:
- ✅ View all applications
- ✅ Accept/Reject applications
- ✅ Toggle email notifications
- ✅ View statistics
- ✅ Filter applications

---

## ⚙️ Important Configuration

Before running, update `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/weintegrity
JWT_SECRET=your_very_secure_secret_key_change_this
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

### How to Get Gmail App Password:
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate password for "Mail"
5. Copy and paste in `.env`

---

## 📝 Testing Workflow

1. **Register** as candidate
2. **Browse** courses and internships
3. **Apply** for a course
4. **Logout**
5. **Register** as manager
6. **View** applications
7. **Accept/Reject** the application
8. **Logout** and login as candidate
9. **Check** application status in "My Applications"

---

## 🛠️ Troubleshooting

### Backend won't start?
- Check MongoDB is running
- Verify `.env` file exists
- Run `npm install` in backend folder

### Frontend won't start?
- Run `npm install` in frontend folder
- Check port 5173 is available
- Clear browser cache

### Can't connect to database?
- Start MongoDB: `mongod`
- Check connection string in `.env`
- Verify MongoDB is running on port 27017

---

## 📦 Project Status
✅ Backend Setup Complete
✅ Frontend Setup Complete
✅ Authentication System Ready
✅ Role-Based Access Control
✅ Course Management
✅ Internship Management
✅ Application System
✅ Email Notifications
✅ Manager Dashboard
✅ Candidate Dashboard

---

**Need Help?** Check the full README.md for detailed documentation!
