import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./navbar.css";
import Logo from "./e-gram-logo.jpeg";
import API from "../services/api"; 
import AutoTranslateWidget from "./AutoTranslateWidget";

const Navbar = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const isAdmin = localStorage.getItem("isAdmin");
  const isUser = localStorage.getItem("token");
  // 🚀 REPLACED: isWorker is now isDepartment
  const isDepartment = localStorage.getItem("departmentToken"); 

  const [pendingComplaints, setPendingComplaints] = useState(0);

  // 🚀 UPDATED: Fetch active complaints count for the logged-in Department
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/department/my-complaints", {
          headers: { Authorization: `Bearer ${isDepartment}` }
        });
        
        // Count how many complaints are NOT completed yet
        const complaints = res.data.complaints || [];
        const activeCount = complaints.filter(c => c.status !== "Completed").length;
        setPendingComplaints(activeCount);
      } catch (err) {
        console.error("Error fetching pending complaints", err);
      }
    };

    if (isDepartment) {
      fetchComplaints();
    }
  }, [isDepartment]);

  const handleLogout = () => {
    if (isAdmin) localStorage.removeItem("isAdmin");
    if (isUser) localStorage.removeItem("token");
    if (isDepartment) localStorage.removeItem("departmentToken"); // ✅ Clear Dept token
    navigate("/");
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <img src={Logo} alt="E Gram Panchayat" className="logo-img" />
          <span className="project-title">{t("projectTitle")}</span>
        </Link>
      </div>

      <div className="navbar-links">
        {/* ✅ Citizen/User Links */}
        {!isAdmin && isUser && (
          <>
            <Link to="/raise-complaint" className="nav-link">
              {t("raiseComplaint")}
            </Link>
            <Link to="/my-complaints" className="nav-link">
              {t("myComplaints")}
            </Link>
          </>
        )}

        {/* ✅ Admin Links */}
        {isAdmin && (
          <>
            <Link to="/admin/dashboard" className="nav-link">
              {t("dashboard")}
            </Link>
            <Link to="/admin/complaints" className="nav-link">
              {t("complaints")}
            </Link>
            
            {/* 🚀 NEW: Departments creation link for Admin */}
            <Link to="/admin/departments" className="nav-link">
               {t("Departments") || "Departments"}
            </Link>

            <Link to="/admin/statistics" className="nav-link">
              {t("Statistics")}
            </Link>
            <Link to="/admin/users" className="nav-link">
              {t("users")}
            </Link>
          </>
        )}

        {/* 🚀 UPDATED: Department Portal Links (Replaced Worker) */}
        {isDepartment && (
          <>
            <Link to="/department/dashboard" className="nav-link">
               {/*{t("departmentDashboard") || "Dept Dashboard"}*/}
            </Link>
            
            <Link to="/department/dashboard" className="nav-link" style={{ position: "relative" }}>
               {/*{t("assignedComplaints") || "Assigned Tasks"}*/}
              {/* 🔴 Notification Badge */}
              {pendingComplaints > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-8px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "4px 6px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    animation: "pulse 1.5s infinite"
                  }}
                >
                  {pendingComplaints}
                </span>
              )}
            </Link>
          </>
        )}

        {/* ✅ Auth Links for Guests */}
        {!isAdmin && !isUser && !isDepartment && (
          <>
            <Link to="/" className="navbar-right">{t("home")}</Link>
            <Link to="/register" className="navbar-right">{t("register")}</Link>
            <Link to="/login" className="navbar-right">{t("login")}</Link>
            <Link to="/admin/login" className="navbar-right">{t("admin")}</Link>
            
            {/* 🚀 UPDATED: Department Login Link */}
            <Link to="/department/login" className="navbar-right">
               {t("Department") || "Department"}
            </Link>
            
            <Link to="/public-info" className="nav-link">{t("PublicInfo")}</Link>
          </>
        )}

        {/* 🌐 Language Selector 
        <select
          onChange={handleLanguageChange}
          defaultValue={localStorage.getItem("lang") || "en"}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #2e4d2c",
            backgroundColor: "#f8f9fa",
            color: "#2e4d2c",
            fontWeight: "600",
            cursor: "pointer",
            marginLeft: "1rem",
            transition: "all 0.3s ease",
            outline: "none",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#e3f2fd")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
        >
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
        </select> */}
  <AutoTranslateWidget />
        {/* ✅ Logout */}
        {(isAdmin || isUser || isDepartment) && (
          <button onClick={handleLogout} className="nav-logout">
            {t("logout")}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;