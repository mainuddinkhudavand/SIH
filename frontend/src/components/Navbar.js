import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaNetworkWired, FaLandmark, FaUserShield, FaUser } from "react-icons/fa";
import "./navbar.css";
import Logo from "./e-gram-logo.jpeg";
import AutoTranslateWidget from "./AutoTranslateWidget";

const Navbar = () => {
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [isCitizenSession, setIsCitizenSession] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const adminToken = localStorage.getItem("adminToken");
      const isAdmin = localStorage.getItem("isAdmin");
      const citizenToken = localStorage.getItem("token");

      if (adminToken && isAdmin === "true") {
        setIsAdminSession(true);
        setIsCitizenSession(false);
      } else if (citizenToken) {
        setIsCitizenSession(true);
        setIsAdminSession(false);
      } else {
        setIsAdminSession(false);
        setIsCitizenSession(false);
      }
    };

    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src={Logo} alt="GovConnect Interoperability Platform" className="logo-img" />
          <span className="project-title">GovConnect E-Gram Platform</span>
        </Link>
      </div>

      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        {/* 1. Citizen Portal */}
        <Link to="/citizen" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
          <FaUser style={{ marginRight: "4px" }} /> Citizen Services
        </Link>

        {/* 2. 4-Office Workspaces & Official Admin */}
        <Link to="/official" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
          <FaLandmark style={{ marginRight: "4px" }} /> 4-Office Workspaces
        </Link>

        {/* 3. GovConnect Platform */}
        <Link to="/govconnect" className="nav-link" onClick={closeMenu} style={{ color: "#38bdf8", fontWeight: "800" }}>
          <FaNetworkWired style={{ marginRight: "4px" }} /> GovConnect Core
        </Link>

        {!isCitizenSession && !isAdminSession && (
          <Link to="/register" className="nav-link btn-register" onClick={closeMenu}>
            Register / KYC
          </Link>
        )}

        <AutoTranslateWidget />
      </div>
    </nav>
  );
};

export default Navbar;