import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

// Candidate Pages
import CandidateDashboard from './pages/CandidateDashboard.jsx';
import Courses from './pages/Courses.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetails from './pages/CourseDetails.jsx';
import InstructorDetails from './pages/InstructorDetails.jsx';
import InternshipsPage from './pages/InternshipsPage.jsx';
import Internships from './pages/Internships.jsx';
import InternshipDetails from './pages/InternshipDetails.jsx';
import MyApplications from './pages/MyApplications.jsx';
import CartPage from './pages/CartPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import ApplicationHistory from './pages/ApplicationHistory.jsx';

// Manager Pages
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import ManagerRequests from './pages/ManagerRequests.jsx';
import ManageManagers from './pages/ManageManagers.jsx';
import ManageCandidates from './pages/ManageCandidates.jsx';
import AddCourse from './pages/manager/AddCourse.jsx';
import AddInternship from './pages/manager/AddInternship.jsx';
import ManageCourses from './pages/manager/ManageCourses.jsx';
import ManageInternships from './pages/manager/ManageInternships.jsx';
import ManageEnrollments from './pages/manager/ManageEnrollments.jsx';
import ManageApplications from './pages/manager/ManageApplications.jsx';
import ManageInstructors from './pages/manager/ManageInstructors.jsx';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />
        <Route
          path="/courses"
          element={
            <PrivateRoute role="candidate">
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses-old"
          element={
            <PrivateRoute role="candidate">
              <CoursesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={<CourseDetails />}
        />
        <Route
          path="/instructor/:courseId"
          element={<InstructorDetails />}
        />
        <Route
          path="/internships"
          element={
            <PrivateRoute role="candidate">
              <Internships />
            </PrivateRoute>
          }
        />
        <Route
          path="/internships-old"
          element={
            <PrivateRoute role="candidate">
              <InternshipsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/internships/:id"
          element={<InternshipDetails />}
        />
        <Route
          path="/my-applications"
          element={
            <PrivateRoute role="candidate">
              <MyApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute role="candidate">
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute role="candidate">
              <PaymentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/application-history"
          element={
            <PrivateRoute role="candidate">
              <ApplicationHistory />
            </PrivateRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute role="manager">
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/requests"
          element={
            <PrivateRoute role="manager">
              <ManagerRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/manage-managers"
          element={
            <PrivateRoute role="manager">
              <ManageManagers />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/manage-candidates"
          element={
            <PrivateRoute role="manager">
              <ManageCandidates />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/add-course"
          element={
            <PrivateRoute role="manager">
              <AddCourse />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/add-internship"
          element={
            <PrivateRoute role="manager">
              <AddInternship />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/manage-courses"
          element={
            <PrivateRoute role="manager">
              <ManageCourses />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/manage-internships"
          element={
            <PrivateRoute role="manager">
              <ManageInternships />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/manage-instructors"
          element={
            <PrivateRoute role="manager">
              <ManageInstructors />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/enrollments"
          element={
            <PrivateRoute role="manager">
              <ManageEnrollments />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/applications"
          element={
            <PrivateRoute role="manager">
              <ManageApplications />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
