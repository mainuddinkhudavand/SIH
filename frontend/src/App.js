import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import KYC from './pages/KYC';
import MyComplaints from './pages/MyComplaints';
import RaiseComplaint from './pages/RaiseComplaint';
import ForgotPassword from "./pages/ForgotPassword"; // 🚀 NEW
import ResetPassword from "./pages/ResetPassword"; // 🚀 NEW
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminUsers from "./pages/admin/AdminUsers";
import GrievanceSelection from './components/GrievanceSelection';
import { GrievanceProvider } from './context/GrievanceContext';
import PublicInfoPage from "./pages/PublicInfoPage";
import AdminStatistics from './pages/admin/AdminStatistics';
import Chatbot from "./components/Chatbot";
import { ToastProvider } from "./context/ToastContext"; 
import ComplaintDetails from "./pages/admin/ComplaintDetails";
import AdminDepartments from "./pages/admin/AdminDepartments"; 
import AdminEscalations from "./pages/admin/AdminEscalations"; // 🚀 NEW

//department imports
import DepartmentLogin from "./pages/department/DepartmentLogin";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import WorkerManagement from './pages/department/WorkerManagement';

// NEW imports for Worker role
import WorkerLogin from "./pages/worker/WorkerLogin";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerProfile from "./pages/worker/WorkerProfile"; // 🚀 NEW

// 🚀 NEW imports for Manager and Profile
import ManagerLogin from "./pages/ManagerLogin";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminManagers from "./pages/admin/AdminManagers";
import Profile from "./pages/Profile";

const Private = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// NEW: Worker-specific private route
const WorkerPrivate = ({ children }) => {
  const workerToken = localStorage.getItem('workerToken');
  return workerToken ? children : <Navigate to="/worker/login" />;
};

export default function App() {
  return (
    <ToastProvider>
      <GrievanceProvider>
        <>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/public-info" element={<PublicInfoPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* User Routes */}
            <Route path="/kyc" element={<Private><KYC /></Private>} />
            <Route path="/grievance" element={<Private><GrievanceSelection /></Private>} />
            <Route path="/raise-complaint" element={<Private><RaiseComplaint /></Private>} />
            <Route path="/my-complaints" element={<Private><MyComplaints /></Private>} />
            <Route path="/profile" element={<Private><Profile /></Private>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/complaints/:id" element={<Private><ComplaintDetails /></Private>} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/statistics" element={<AdminStatistics />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/managers" element={<AdminManagers />} />
            <Route path="/admin/escalations" element={<AdminEscalations />} />

            {/* Department routes */}
            <Route path="/department/login" element={<DepartmentLogin />} />
            <Route path="/department/dashboard" element={<DepartmentDashboard />} />
            <Route path="/department/workers" element={<WorkerManagement />} />

            {/* Manager routes */}
            <Route path="/manager/login" element={<ManagerLogin />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />

            {/* Worker Routes */}
            <Route path="/worker/login" element={<WorkerLogin />} />
            <Route path="/worker/dashboard" element={<WorkerPrivate><WorkerDashboard /></WorkerPrivate>} />
            <Route path="/worker/profile" element={<WorkerPrivate><WorkerProfile /></WorkerPrivate>} />

            {/* Chatbot Route */}
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </>
      </GrievanceProvider>
    </ToastProvider>
  );
}