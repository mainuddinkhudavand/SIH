import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaBuilding, FaLandmark, FaFileInvoiceDollar, FaHome, FaUser } from "react-icons/fa";
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
          <img src={Logo} alt="E-Gov-Connect Platform" className="logo-img" />
          <span className="project-title">E-Gov-Connect</span>
        </Link>
      </div>

      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        {/* 1. Citizen Portal */}
        <Link to="/citizen" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
          <FaUser style={{ marginRight: "4px" }} /> Citizen Portal
        </Link>

        {/* 2. Municipality Office */}
        <Link to="/officer/municipality" className="nav-link" onClick={closeMenu}>
          <FaBuilding style={{ marginRight: "4px" }} /> Municipality
        </Link>

        {/* 3. Tehsildar Office */}
        <Link to="/officer/tehsildar" className="nav-link" onClick={closeMenu}>
          <FaLandmark style={{ marginRight: "4px" }} /> Tehsildar
        </Link>

        {/* 4. Revenue Office */}
        <Link to="/officer/revenue" className="nav-link" onClick={closeMenu}>
          <FaFileInvoiceDollar style={{ marginRight: "4px" }} /> Revenue
        </Link>

        {/* 5. Talati Office */}
        <Link to="/officer/talati" className="nav-link" onClick={closeMenu}>
          <FaHome style={{ marginRight: "4px" }} /> Talati
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