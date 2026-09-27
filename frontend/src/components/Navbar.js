import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaBuilding,
  FaLandmark,
  FaFileInvoiceDollar,
  FaHome,
  FaUser,
  FaArrowLeft,
  FaSignOutAlt,
  FaUserCircle
} from "react-icons/fa";
import "./navbar.css";
import Logo from "./e-gram-logo.jpeg";
import AutoTranslateWidget from "./AutoTranslateWidget";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const checkSession = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        setCurrentUser({ name: "Logged User" });
      }
    } else if (token) {
      setCurrentUser({ name: "Logged User" });
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("faceRegistered");
    setCurrentUser(null);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const getActiveRoleWorkspaceLink = () => {
    const role = currentUser?.role?.toLowerCase() || "citizen";
    switch (role) {
      case "municipality":
        return (
          <Link to="/officer/municipality" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
            <FaBuilding style={{ marginRight: "4px" }} /> Municipality Workspace
          </Link>
        );
      case "tehsildar":
        return (
          <Link to="/officer/tehsildar" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
            <FaLandmark style={{ marginRight: "4px" }} /> Tehsildar Workspace
          </Link>
        );
      case "revenue":
        return (
          <Link to="/officer/revenue" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
            <FaFileInvoiceDollar style={{ marginRight: "4px" }} /> Revenue Workspace
          </Link>
        );
      case "talati":
        return (
          <Link to="/officer/talati" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
            <FaHome style={{ marginRight: "4px" }} /> Talati Workspace
          </Link>
        );
      case "resolver":
        return (
          <Link to="/resolver" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800", color: "#fca5a5" }}>
            ⚖️ Resolver Workspace
          </Link>
        );
      case "citizen":
      default:
        return (
          <Link to="/citizen" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
            <FaUser style={{ marginRight: "4px" }} /> Citizen Workspace
          </Link>
        );
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src={Logo} alt="E-Gov-Connect Platform" className="logo-img" />
          <span className="project-title">E-Gov-Connect</span>
        </Link>

        {/* ⬅️ UNIVERSAL BACK BUTTON (Only shown when not on Home Page '/') */}
        {location.pathname !== "/" && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#2d6a4f",
              color: "#ffffff",
              border: "1px solid #52b788",
              padding: "6px 14px",
              borderRadius: "8px",
              fontWeight: "800",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}
            title="Go back to previous page"
          >
            <FaArrowLeft /> Back
          </button>
        )}
      </div>

      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        {/* PUBLIC PORTAL LINKS (Shown ONLY when NOT Logged In) */}
        {!currentUser ? (
          <>
            {/* 1. Citizen Portal */}
            <Link to="/login?role=citizen" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800" }}>
              <FaUser style={{ marginRight: "4px" }} /> Citizen Portal
            </Link>

            {/* 2. Municipality Office */}
            <Link to="/login?role=municipality" className="nav-link" onClick={closeMenu}>
              <FaBuilding style={{ marginRight: "4px" }} /> Municipality
            </Link>

            {/* 3. Tehsildar Office */}
            <Link to="/login?role=tehsildar" className="nav-link" onClick={closeMenu}>
              <FaLandmark style={{ marginRight: "4px" }} /> Tehsildar
            </Link>

            {/* 4. Revenue Office */}
            <Link to="/login?role=revenue" className="nav-link" onClick={closeMenu}>
              <FaFileInvoiceDollar style={{ marginRight: "4px" }} /> Revenue
            </Link>

            {/* 5. Talati Office */}
            <Link to="/login?role=talati" className="nav-link" onClick={closeMenu}>
              <FaHome style={{ marginRight: "4px" }} /> Talati
            </Link>

            {/* 6. Resolver Portal */}
            <Link to="/login?role=resolver" className="nav-link" onClick={closeMenu} style={{ fontWeight: "800", color: "#fca5a5" }}>
              ⚖️ Resolver Portal
            </Link>
          </>
        ) : (
          /* LOGGED IN LINKS (Shows ONLY active role workspace, Profile & Logout) */
          <>
            {getActiveRoleWorkspaceLink()}

            <Link
              to="/profile"
              className="nav-link"
              onClick={closeMenu}
              style={{
                background: "#065f46",
                color: "#e0ffe0",
                padding: "6px 12px",
                borderRadius: "8px",
                fontWeight: "800",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                textDecoration: "none"
              }}
            >
              <FaUserCircle /> {currentUser.name || currentUser.email || "Profile"}
            </Link>

            <button
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontWeight: "800",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
              }}
              title="Logout from current session"
            >
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}

        <AutoTranslateWidget />
      </div>
    </nav>
  );
};

export default Navbar;