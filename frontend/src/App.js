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

// 🏛️ Departmental Portals
import CitizenPortal from "./pages/citizen/CitizenPortal";
import GovConnectPlatform from "./pages/govconnect/GovConnectPlatform";
import MunicipalPortal from "./pages/portals/MunicipalPortal";
import RevenuePortal from "./pages/portals/RevenuePortal";
import HealthPortal from "./pages/portals/HealthPortal";
import EnergyPortal from "./pages/portals/EnergyPortal";
import OfficialPortal from "./pages/admin/OfficialPortal";
import SectorModulesPage from "./pages/citizen/SectorModulesPage";

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
          {/* Public Entry Landing Route */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* 🌟 1. CITIZEN PORTAL */}
          <Route path="/citizen/*" element={<CitizenPortal />} />

          {/* 🌟 2. GOVCONNECT MIDDLEWARE PLATFORM */}
          <Route path="/govconnect" element={<GovConnectPlatform />} />

          {/* 🌟 3. MUNICIPAL PORTAL */}
          <Route path="/portals/municipal" element={<MunicipalPortal />} />

          {/* 🌟 4. REVENUE PORTAL */}
          <Route path="/portals/revenue" element={<RevenuePortal />} />

          {/* 🌟 5. HEALTH / WELFARE PORTAL */}
          <Route path="/portals/health" element={<HealthPortal />} />

          {/* 🌟 6. RENEWABLE ENERGY PORTAL */}
          <Route path="/portals/energy" element={<EnergyPortal />} />

          {/* 🌟 7. ADMIN PORTAL */}
          <Route path="/official/*" element={<OfficialPortal />} />

          {/* Utility Routes */}
          <Route path="/modules/*" element={<SectorModulesPage />} />
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