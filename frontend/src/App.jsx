import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Import critical pages directly (no lazy loading for initial view)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CandidateDashboard from './pages/CandidateDashboard.jsx';

// Lazy load all other pages for better performance
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Courses = lazy(() => import('./pages/Courses.jsx'));
const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx'));
const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'));
const InstructorDetails = lazy(() => import('./pages/InstructorDetails.jsx'));
const InternshipsPage = lazy(() => import('./pages/InternshipsPage.jsx'));
const Internships = lazy(() => import('./pages/Internships.jsx'));
const InternshipDetails = lazy(() => import('./pages/InternshipDetails.jsx'));
const MyApplications = lazy(() => import('./pages/MyApplications.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'));
const ApplicationHistory = lazy(() => import('./pages/ApplicationHistory.jsx'));
const EnrollmentHistory = lazy(() => import('./pages/EnrollmentHistory.jsx'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard.jsx'));
const ManagerRequests = lazy(() => import('./pages/ManagerRequests.jsx'));
const ManageManagers = lazy(() => import('./pages/ManageManagers.jsx'));
const ManageCandidates = lazy(() => import('./pages/ManageCandidates.jsx'));
const AddCourse = lazy(() => import('./pages/manager/AddCourse.jsx'));
const AddInternship = lazy(() => import('./pages/manager/AddInternship.jsx'));
const ManageCourses = lazy(() => import('./pages/manager/ManageCourses.jsx'));
const ManageInternships = lazy(() => import('./pages/manager/ManageInternships.jsx'));
const ManageEnrollments = lazy(() => import('./pages/manager/ManageEnrollments.jsx'));
const ManageApplications = lazy(() => import('./pages/manager/ManageApplications.jsx'));
const ManageInstructors = lazy(() => import('./pages/manager/ManageInstructors.jsx'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-xl font-semibold text-gray-700">Loading...</div>
  </div>
);

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Candidate Routes */}
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
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
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/instructor/:courseId" element={<InstructorDetails />} />
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
              element={
                <PrivateRoute role="candidate">
                  <InternshipDetails />
                </PrivateRoute>
              }
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
              path="/application-history"
              element={
                <PrivateRoute role="candidate">
                  <ApplicationHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/enrollment-history"
              element={
                <PrivateRoute role="candidate">
                  <EnrollmentHistory />
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
              path="/manager/courses"
              element={
                <PrivateRoute role="manager">
                  <ManageCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager/internships"
              element={
                <PrivateRoute role="manager">
                  <ManageInternships />
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
            <Route
              path="/manager/instructors"
              element={
                <PrivateRoute role="manager">
                  <ManageInstructors />
                </PrivateRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </CartProvider>
  );
}

export default App;
