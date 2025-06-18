import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUsers } from './contexts/UserContext';

// Layouts and Pages
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import CompanyLayout from './layouts/CompanyLayout';
import ImpersonationLayout from './layouts/ImpersonationLayout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentDashboard from './pages/student/StudentDashboard';
import CreateResumePage from './pages/student/CreateResumePage';
import GenerateResumePage from './pages/student/GenerateResumePage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import JobsListPage from './pages/student/JobsListPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCompaniesPage from './pages/admin/ManageCompaniesPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';
import MyProfileAdmin from './pages/admin/MyProfileAdmin'; // <-- FIX: IMPORT THE RENAMED FILE
import CompanyDashboard from './pages/company/CompanyDashboard';
import PostJobPage from './pages/company/PostJobPage';
import Applicants from './pages/company/Applicants';

const AppContent = () => {
  const navigate = useNavigate();
  const { authenticatedUser, loginUser, logoutUser } = useUsers();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!authenticatedUser);
  }, [authenticatedUser]);

  const handleLogin = (role, username, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    loginUser(token);
    
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'company') navigate('/company/dashboard');
    else navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    logoutUser();
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {isAuth && <Route path="/generate-resume/:studentId" element={<GenerateResumePage />} />}

      {isAuth && authenticatedUser?.role === 'student' && (
        <Route path="/" element={<StudentLayout onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="jobs" element={<JobsListPage />} />
          <Route path="my-applications" element={<MyApplicationsPage />} />
          <Route path="create-resume" element={<CreateResumePage />} />
        </Route>
      )}

      {isAuth && authenticatedUser?.role === 'company' && (
        <Route path="/company" element={<CompanyLayout onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="jobs/:jobId/applicants" element={<Applicants />} />
        </Route>
      )}

      {isAuth && authenticatedUser?.role === 'admin' && (
        <>
          <Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<ManageUsers />} />
            <Route path="companies" element={<ManageCompaniesPage />} />
            <Route path="jobs" element={<ManageJobsPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="profile" element={<MyProfileAdmin />} /> {/* <-- FIX: USE THE RENAMED COMPONENT */}
          </Route>
          <Route path="/admin/view-as/:studentId" element={<ImpersonationLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-applications" element={<MyApplicationsPage />} />
          </Route>
          <Route path="/admin/view-as-company/:companyId" element={<CompanyLayout onLogout={() => {}} />}>
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="jobs/:jobId/applicants" element={<Applicants isAdminView={true} />} />
          </Route>
        </>
      )}

      <Route path="*" element={<Navigate to={isAuth ? (authenticatedUser?.role === 'admin' ? '/admin' : authenticatedUser?.role === 'company' ? '/company' : '/') : '/login'} replace />} />
    </Routes>
  );
};
export default AppContent;