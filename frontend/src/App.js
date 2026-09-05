import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import KYC from './pages/KYC';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Chatbot from "./components/Chatbot";
import { ToastProvider } from "./context/ToastContext"; 
import Profile from "./pages/Profile";

// 🏛️ Primary Citizen & Official Portals
import CitizenPortal from "./pages/citizen/CitizenPortal";
import OfficialPortal from "./pages/admin/OfficialPortal";

// 🏢 4 Separate Dedicated Office Portals
import MunicipalityOfficePortal from "./pages/offices/MunicipalityOfficePortal";
import TehsildarOfficePortal from "./pages/offices/TehsildarOfficePortal";
import RevenueOfficePortal from "./pages/offices/RevenueOfficePortal";
import TalatiOfficePortal from "./pages/offices/TalatiOfficePortal";

const Private = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/citizen" />;
};

export default function App() {
  return (
    <ToastProvider>
      <>
        <Navbar />
        <Routes>
          {/* Public Landing Route */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* 🌟 1. CITIZEN PORTAL */}
          <Route path="/citizen/*" element={<CitizenPortal />} />

          {/* 🌟 2. UNIFIED 4-OFFICE WORKSPACES & OFFICIAL PORTAL */}
          <Route path="/official/*" element={<OfficialPortal />} />

          {/* 🌟 3. SEPARATE STANDALONE OFFICE PORTALS */}
          <Route path="/officer/municipality" element={<MunicipalityOfficePortal />} />
          <Route path="/officer/tehsildar" element={<TehsildarOfficePortal />} />
          <Route path="/officer/revenue" element={<RevenueOfficePortal />} />
          <Route path="/officer/talati" element={<TalatiOfficePortal />} />

          {/* Utility Routes */}
          <Route path="/kyc" element={<Private><KYC /></Private>} />
          <Route path="/profile" element={<Private><Profile /></Private>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/chatbot" element={<Chatbot />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </ToastProvider>
  );
}