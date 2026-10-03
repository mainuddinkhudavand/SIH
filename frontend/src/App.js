import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Verify from "./pages/Verify";

// 🏛️ Primary Citizen & Official Portals
import CitizenPortal from "./pages/citizen/CitizenPortal";
import OfficialPortal from "./pages/admin/OfficialPortal";

// 🏢 4 Separate Dedicated Office Portals
import MunicipalityOfficePortal from "./pages/offices/MunicipalityOfficePortal";
import TehsildarOfficePortal from "./pages/offices/TehsildarOfficePortal";
import RevenueOfficePortal from "./pages/offices/RevenueOfficePortal";
import TalatiOfficePortal from "./pages/offices/TalatiOfficePortal";

import ResolverPortal from "./pages/ResolverPortal";

const Private = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login?role=citizen" replace />;
};

const ResolverPrivate = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isResolver = false;
  try {
    const user = JSON.parse(userStr);
    if (user?.role === 'resolver' || localStorage.getItem('isAdmin') === 'true') {
      isResolver = true;
    }
  } catch (e) {}

  if (token && isResolver) {
    return children;
  }
  return <Navigate to="/login?role=resolver" replace />;
};

function MainApp() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* 🎓 Academic & Hackathon Prototype Notice Banner */}
      <div style={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        fontSize: '0.78rem',
        padding: '6px 12px',
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: '0.3px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
          SIH 2026 PROTOTYPE
        </span>
        <span>
          Academic & Educational Research Project — Not an official government portal.
        </span>
      </div>

      {/* Navbar appears ONLY on HomePage '/'. Hides completely on all login & portal pages */}
      {isHomePage && <Navbar />}

      <Routes>
        {/* Public Landing & Login Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/offices/login" element={<Login />} />
        <Route path="/officer/login" element={<Login />} />

        {/* 🌟 1. CITIZEN PORTAL */}
        <Route path="/citizen/*" element={<CitizenPortal />} />

        {/* 🌟 2. UNIFIED 4-OFFICE WORKSPACES & OFFICIAL PORTAL */}
        <Route path="/official/*" element={<OfficialPortal />} />

        {/* 🌟 3. SEPARATE STANDALONE OFFICE PORTALS (Both /officer/ and /offices/ aliases) */}
        <Route path="/officer/municipality" element={<MunicipalityOfficePortal />} />
        <Route path="/offices/municipality" element={<MunicipalityOfficePortal />} />

        <Route path="/officer/tehsildar" element={<TehsildarOfficePortal />} />
        <Route path="/offices/tehsildar" element={<TehsildarOfficePortal />} />

        <Route path="/officer/revenue" element={<RevenueOfficePortal />} />
        <Route path="/offices/revenue" element={<RevenueOfficePortal />} />

        <Route path="/officer/talati" element={<TalatiOfficePortal />} />
        <Route path="/offices/talati" element={<TalatiOfficePortal />} />

        {/* ⚖️ 4. RESOLVER PORTAL (48-Hour SLA Escalation & Disciplinary Authority) */}
        <Route path="/resolver" element={<ResolverPrivate><ResolverPortal /></ResolverPrivate>} />
        <Route path="/resolver-portal" element={<ResolverPrivate><ResolverPortal /></ResolverPrivate>} />

        {/* Utility Routes */}
        <Route path="/verify" element={<Verify />} />
        <Route path="/kyc" element={<Private><KYC /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}