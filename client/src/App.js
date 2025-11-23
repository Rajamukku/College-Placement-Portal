import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- Common & Auth Pages ---
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import NotFound from './pages/NotFound';
// We are no longer using Home.js, so the import can be removed.
// import Home from './pages/Home';

// --- Student Pages ---
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseJobs from './pages/student/BrowseJobs';
import BrowseCompaniesPage from './pages/student/BrowseCompaniesPage';
import StudentCompanyProfilePage from './pages/student/CompanyProfilePage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import AIResumeBuilder from './pages/student/AIResumeBuilder';

// --- Company Pages ---
import CompanyDashboard from './pages/company/CompanyDashboard';
import ViewApplicants from './pages/company/ViewApplicants';
import PostJobPage from './pages/company/PostJobPage';
import MyPostingsPage from './pages/company/MyPostingsPage';
import EditJobPage from './pages/company/EditJobPage';
import CompanyOwnProfilePage from './pages/company/CompanyProfilePage';
import InterviewPipelinePage from './pages/company/InterviewPipelinePage';
import AnalyticsDashboardPage from './pages/company/AnalyticsDashboardPage';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageCompaniesPage from './pages/admin/ManageCompaniesPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* --- MODIFIED ROOT ROUTE --- */}
        {/* The application now automatically redirects to the login page */}
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* --- Auth Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* --- Student Routes (Protected) --- */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/jobs" element={<BrowseJobs />} />
          <Route path="/student/companies" element={<BrowseCompaniesPage />} />
          <Route path="/student/company/:companyId" element={<StudentCompanyProfilePage />} />
          <Route path="/student/applications" element={<MyApplicationsPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/ai-resume" element={<AIResumeBuilder />} />
        </Route>

        {/* --- Company Routes (Protected) --- */}
        <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/applicants" element={<ViewApplicants />} />
          <Route path="/company/post-job" element={<PostJobPage />} />
          <Route path="/company/postings" element={<MyPostingsPage />} />
          <Route path="/company/edit-job/:jobId" element={<EditJobPage />} />
          <Route path="/company/profile" element={<CompanyOwnProfilePage />} />
          <Route path="/company/pipeline" element={<InterviewPipelinePage />} />
          <Route path="/company/analytics" element={<AnalyticsDashboardPage />} />
        </Route>

        {/* --- Admin Routes (Protected) --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/companies" element={<ManageCompaniesPage />} />
          <Route path="/admin/jobs" element={<ManageJobsPage />} />
          <Route path="/admin/announcements" element={<AnnouncementsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/security" element={<AdminSecurityPage />} />
        </Route>

        {/* --- Redirects for old login paths --- */}
        <Route path="/student/login" element={<Navigate replace to="/login" />} />
        <Route path="/company/login" element={<Navigate replace to="/login" />} />

        {/* --- Catch-all 404 Not Found Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;