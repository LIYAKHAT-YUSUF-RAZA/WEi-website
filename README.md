# WEintegrity Company Website

A comprehensive company website built with the MERN stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS. This platform features role-based access for candidates and managers with complete course and internship management functionality.

## Features

### Public View (Unauthenticated Users)
- Company information display
- Services overview
- Featured courses and internships
- User registration and login

### Candidate View
- Dashboard with company information
- Browse available courses with filtering
- View detailed course information including:
  - Syllabus
  - Learning outcomes
  - Prerequisites
  - Instructor details
  - Duration and pricing
- Enroll in courses
- Browse internship opportunities
- Apply for internships with:
  - Resume submission
  - Cover letter
  - Education details
  - Experience information
- Track application status
- View feedback from managers

### Manager View
- Comprehensive dashboard with statistics
- View all applications (courses and internships)
- Filter applications by type and status
- Accept or reject applications
- Email notification system
- Toggle email notifications on/off
- Application analytics

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4 or higher)
- **Python** (for virtual environment)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd WEi-website
```

### 2. Create and Activate Virtual Environment
```powershell
# Create virtual environment
py -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

### 3. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit the .env file with your settings:
# - MongoDB connection string
# - JWT secret key
# - Email credentials (Gmail)
# - Client URL
```

**Important**: Update the `.env` file with your actual credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/weintegrity
JWT_SECRET=your_secure_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

### 4. Frontend Setup
```powershell
# Navigate to frontend directory (from root)
cd ../frontend

# Install dependencies
npm install
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```powershell
# Start MongoDB service (Windows)
net start MongoDB

# Or run mongod directly
mongod
```

## Running the Application

### Start Backend Server
```powershell
# In the backend directory
cd backend
npm run dev
```
Backend will run on http://localhost:5000

### Start Frontend Development Server
```powershell
# In the frontend directory (new terminal)
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Default User Accounts

For testing purposes, you can create users with the following email patterns:

### Candidate Account
- Email: `candidateemail@gmail.com` (or any email)
- Role: Candidate
- Registration: Use the /register page and select "Candidate" role

### Manager Account
- Email: `manageremail@gmail.com` (or any email)
- Role: Manager
- Registration: Use the /register page and select "Manager" role

## Project Structure

```
WEi-website/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── candidate/
│   │   │   └── candidateController.js
│   │   ├── manager/
│   │   │   └── managerController.js
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   ├── courseController.js
│   │   └── internshipController.js
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── Application.js
│   │   ├── CompanyInfo.js
│   │   ├── Course.js
│   │   ├── Internship.js
│   │   ├── NotificationSettings.js
│   │   └── User.js
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── internshipRoutes.js
│   │   └── managerRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── public/
    │   │       ├── Footer.jsx
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── CandidateDashboard.jsx
    │   │   ├── CourseDetails.jsx
    │   │   ├── CoursesPage.jsx
    │   │   ├── Home.jsx
    │   │   ├── InternshipDetails.jsx
    │   │   ├── InternshipsPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── ManagerDashboard.jsx
    │   │   ├── MyApplications.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx               # Main app component
    │   ├── index.css             # Global styles
    │   └── main.jsx              # Entry point
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Company
- `GET /api/company` - Get company information
- `PUT /api/company` - Update company info (Manager only)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses/:id/enroll` - Enroll in course (Candidate only)
- `POST /api/courses` - Create course (Manager only)

### Internships
- `GET /api/internships` - Get all internships
- `GET /api/internships/:id` - Get internship by ID
- `POST /api/internships/:id/apply` - Apply for internship (Candidate only)
- `POST /api/internships` - Create internship (Manager only)

### Applications
- `GET /api/applications/my-applications` - Get candidate's applications (Candidate only)

### Manager
- `GET /api/manager/applications` - Get all applications (Manager only)
- `PUT /api/manager/applications/:id` - Update application status (Manager only)
- `GET /api/manager/notification-settings` - Get notification settings (Manager only)
- `PUT /api/manager/notification-settings` - Update notification settings (Manager only)
- `GET /api/manager/stats` - Get dashboard statistics (Manager only)

## Email Notifications

The application uses Nodemailer to send email notifications. To enable this feature:

1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Update `.env` with your email and app password

## Development Tips

### Hot Reload
- Backend: Uses `nodemon` for automatic restart on file changes
- Frontend: Uses `Vite` for instant HMR (Hot Module Replacement)

### Database Seeding
You can manually add sample data through the MongoDB shell or use the manager account to create courses and internships through the API.

### Testing Authentication
1. Register as a candidate
2. Login and explore candidate features
3. Logout and register as a manager
4. Test manager functionalities

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Email Notification Issues
- Verify Gmail credentials in `.env`
- Ensure App Password is used (not regular password)
- Check "Less secure app access" is enabled (if not using App Password)

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change `server.port` in `vite.config.js`

### CORS Issues
- Ensure backend CORS is configured correctly
- Check frontend proxy settings in `vite.config.js`

## Production Deployment

### Backend
1. Set environment variables in production
2. Use a production MongoDB instance (MongoDB Atlas)
3. Set `NODE_ENV=production`
4. Use a process manager like PM2

### Frontend
```powershell
npm run build
```
Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

## Security Considerations

- Never commit `.env` files
- Use strong JWT secrets
- Implement rate limiting in production
- Use HTTPS in production
- Sanitize user inputs
- Implement proper error handling

## Future Enhancements

- File upload for resumes
- Real-time notifications using WebSockets
- Advanced search and filtering
- Course progress tracking
- Payment integration
- Admin panel for content management
- Analytics dashboard
- Multi-language support

## License

This project is created for educational purposes.

## Support

For issues and questions, please create an issue in the repository.

---

**Happy Coding! 🚀**
