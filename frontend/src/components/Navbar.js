import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes, FaNetworkWired, FaBuilding, FaLandmark, FaHeartbeat, FaSun, FaUserShield, FaUser } from "react-icons/fa";
import "./navbar.css";
import Logo from "./e-gram-logo.jpeg";
import AutoTranslateWidget from "./AutoTranslateWidget";

const Navbar = () => {
  const { t } = useTranslation();

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
          <span className="project-title">GovConnect Platform</span>
        </Link>
      </div>

      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        {/* 1. Citizen Portal */}
        <Link to="/citizen" className="nav-link" onClick={closeMenu}>
          <FaUser style={{ marginRight: "4px" }} /> Citizen Portal
        </Link>

        {/* 2. GovConnect Platform */}
        <Link to="/govconnect" className="nav-link" onClick={closeMenu} style={{ color: "#38bdf8", fontWeight: "800" }}>
          <FaNetworkWired style={{ marginRight: "4px" }} /> GovConnect
        </Link>

        {/* 3. Municipal Portal */}
        <Link to="/portals/municipal" className="nav-link" onClick={closeMenu}>
          <FaBuilding style={{ marginRight: "4px" }} /> Municipal
        </Link>

        {/* 4. Revenue Portal */}
        <Link to="/portals/revenue" className="nav-link" onClick={closeMenu}>
          <FaLandmark style={{ marginRight: "4px" }} /> Revenue
        </Link>

        {/* 5. Health Portal */}
        <Link to="/portals/health" className="nav-link" onClick={closeMenu}>
          <FaHeartbeat style={{ marginRight: "4px" }} /> Health
        </Link>

        {/* 6. Energy Portal */}
        <Link to="/portals/energy" className="nav-link" onClick={closeMenu}>
          <FaSun style={{ marginRight: "4px" }} /> Energy
        </Link>

        {/* 7. Admin Portal */}
        <Link to="/official" className="nav-link" onClick={closeMenu}>
          <FaUserShield style={{ marginRight: "4px" }} /> Admin Portal
        </Link>

        {!isCitizenSession && !isAdminSession && (
          <Link to="/register" className="nav-link btn-register" onClick={closeMenu}>
            Register
          </Link>
        )}

        <AutoTranslateWidget />
      </div>
    </nav>
  );
};

export default Navbar;