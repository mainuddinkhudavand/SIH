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

// 🏛️ Primary Federated Portals
import CitizenPortal from "./pages/citizen/CitizenPortal";
import GovConnectPlatform from "./pages/govconnect/GovConnectPlatform";
import OfficialPortal from "./pages/admin/OfficialPortal";

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

          {/* 🌟 1. CITIZEN PORTAL (Services, Dynamic Forms, Tracker, Dues Payment, Certificates) */}
          <Route path="/citizen/*" element={<CitizenPortal />} />

          {/* 🌟 2. 4-OFFICE WORKSPACES & OFFICIAL PORTAL (Municipality, Tehsildar, Revenue, Talati) */}
          <Route path="/official/*" element={<OfficialPortal />} />

          {/* 🌟 3. GOVCONNECT MIDDLEWARE PLATFORM */}
          <Route path="/govconnect" element={<GovConnectPlatform />} />

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