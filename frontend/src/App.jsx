import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/public/Navbar.jsx';

import ScrollToTop from './components/public/ScrollToTop.jsx';

// Import critical pages directly (no lazy loading for initial view)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CandidateDashboard from './pages/CandidateDashboard.jsx';

// Lazy load all other pages for better performance
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Courses = lazy(() => import('./pages/Courses.jsx'));
const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'));
const InstructorDetails = lazy(() => import('./pages/InstructorDetails.jsx'));
const Internships = lazy(() => import('./pages/Internships.jsx'));
const InternshipDetails = lazy(() => import('./pages/InternshipDetails.jsx'));
const MyApplications = lazy(() => import('./pages/MyApplications.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'));
const ApplicationHistory = lazy(() => import('./pages/ApplicationHistory.jsx'));
const EnrollmentHistory = lazy(() => import('./pages/EnrollmentHistory.jsx'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard.jsx'));
const ManageManagerRequests = lazy(() => import('./pages/ManagerRequests.jsx'));
const ManageServiceProviderRequests = lazy(() => import('./pages/ManagerRequestsSP.jsx'));
const ManageManagers = lazy(() => import('./pages/ManageManagers.jsx'));
const ManagerDetails = lazy(() => import('./pages/ManagerDetails.jsx'));
const ManageCandidates = lazy(() => import('./pages/ManageCandidates.jsx'));
const ManageCourseRequests = lazy(() => import('./pages/ManageCourseRequests.jsx'));
const AddCourse = lazy(() => import('./pages/manager/AddCourse.jsx'));
const AddInternship = lazy(() => import('./pages/manager/AddInternship.jsx'));
const ManageCourses = lazy(() => import('./pages/manager/ManageCourses.jsx'));
const ManageInternships = lazy(() => import('./pages/manager/ManageInternships.jsx'));
const ManageEnrollments = lazy(() => import('./pages/manager/ManageEnrollments.jsx'));
const ManageApplications = lazy(() => import('./pages/manager/ManageApplications.jsx'));
const ManageInstructors = lazy(() => import('./pages/manager/ManageInstructors.jsx'));
const ServiceProviderDashboard = lazy(() => import('./pages/service-provider/ServiceProviderDashboard.jsx'));
const ManageServices = lazy(() => import('./pages/service-provider/ManageServices.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails.jsx'));

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

// Permission-based route component
const PermissionRoute = ({ children, permission, requireFullAccess = false }) => {
  const { user, loading, hasPermission, hasFullAccess } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'manager') {
    return <Navigate to="/" />;
  }

  // If user has full access, always allow
  if (hasFullAccess) {
    return children;
  }

  // Check if full access is required
  if (requireFullAccess && !hasFullAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⛔ Access Denied</h2>
          <p className="text-gray-700 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mb-6">This feature requires full manager access.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⛔ Access Denied</h2>
          <p className="text-gray-700 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mb-6">Required permission: {permission.replace('can', '').replace(/([A-Z])/g, ' $1').toLowerCase().trim()}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Smart redirect component for /dashboard route
const SmartDashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'candidate') {
    return <Navigate to="/candidate/dashboard" replace />;
  } else if (user?.role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  } else if (user?.role === 'service_provider') {
    return <Navigate to="/service-provider/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <main className="pt-20 min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />

              {/* Smart Dashboard Route - redirects based on user role */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <SmartDashboardRedirect />
                  </PrivateRoute>
                }
              />

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
                  <PermissionRoute requireFullAccess={true}>
                    <ManageManagerRequests />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/manage-managers"
                element={
                  <PermissionRoute requireFullAccess={true}>
                    <ManageManagers />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/managers/:id"
                element={
                  <PermissionRoute requireFullAccess={true}>
                    <ManagerDetails />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/manage-candidates"
                element={
                  <PermissionRoute requireFullAccess={true}>
                    <ManageCandidates />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/course-requests"
                element={
                  <PermissionRoute requireFullAccess={true}>
                    <ManageCourseRequests />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/service-provider-requests"
                element={
                  <PermissionRoute requireFullAccess={true}>
                    <ManageServiceProviderRequests />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/add-course"
                element={
                  <PermissionRoute permission="canManageCourses">
                    <AddCourse />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/add-internship"
                element={
                  <PermissionRoute permission="canManageInternships">
                    <AddInternship />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/courses"
                element={
                  <PermissionRoute permission="canManageCourses">
                    <ManageCourses />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/internships"
                element={
                  <PermissionRoute permission="canManageInternships">
                    <ManageInternships />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/enrollments"
                element={
                  <PermissionRoute permission="canManageCourses">
                    <ManageEnrollments />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/applications"
                element={
                  <PermissionRoute permission="canViewAllApplications">
                    <ManageApplications />
                  </PermissionRoute>
                }
              />
              <Route
                path="/manager/instructors"
                element={
                  <PermissionRoute permission="canManageCourses">
                    <ManageInstructors />
                  </PermissionRoute>
                }
              />

              {/* Service Provider Routes */}
              <Route
                path="/service-provider/dashboard"
                element={
                  <PrivateRoute role="service_provider">
                    <ServiceProviderDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/service-provider/services"
                element={
                  <PrivateRoute role="service_provider">
                    <ManageServices />
                  </PrivateRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </Router>
    </CartProvider >
  );
}

export default App;
