// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useLocation, Link, useNavigate } from 'react-router-dom';
import "./styles/HomePage.css";
import "./styles/Notification.css";

// ----------------------------------------------------
// UNIQUE STYLES FOR VIDEO SECTION (Defined once)
// ----------------------------------------------------
const videoStyles = {
  projectVideoSection: {
    padding: "2rem",
    backgroundColor: "#f0f9ff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    margin: "2rem auto",
    maxWidth: "1100px",
    textAlign: "center",
  },
  videoWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  videoElement: {
    maxWidth: "720px",
    width: "100%", // Added for responsiveness
    height: "auto",
    borderRadius: "10px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
  videoBulletPointsWrapper: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
    maxWidth: "800px",
    margin: "0 auto",
  },
  videoBulletPoint: {
    flex: "1 1 200px",
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    textAlign: "left",
  },
  videoTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#075985",
    marginBottom: "0.5rem",
  },
  videoSubtitle: {
    color: "#334155",
    marginBottom: "1.5rem",
    fontSize: "1.1rem",
  },
};

// ---------- PROJECT VIDEO SECTION COMPONENT ----------
const ProjectVideoSection = ({ t }) => (
  <section
    id="project-video"
    className="project-video"
    style={videoStyles.projectVideoSection}
  >
    <h2 style={videoStyles.videoTitle}>
      {t("projectVideoTitle", {
        defaultValue: "Empowering Residency System: See It in Action! 🚀",
      })}
    </h2>
    <p style={videoStyles.videoSubtitle}>
      {t("projectVideoSubtitle", {
        defaultValue:
          "A quick review of how our platform facilitates complaint management and transparency.",
      })}
    </p>

    <div style={videoStyles.videoWrapper}>
      <video style={videoStyles.videoElement} controls>
        {/* Ensure the path to your video file is correct relative to the public directory */}
        <source
          src="/videos/whatsapp-video.mp4"
          type="video/mp4"
        />
        {t("videoNotSupported", {
          defaultValue: "Your browser does not support the video tag.",
        })}
      </video>
    </div>

    <div style={videoStyles.videoBulletPointsWrapper}>
      <div style={videoStyles.videoBulletPoint}>
        <strong>{t("citizenFocusTitle", { defaultValue: "Citizen Focus:" })}</strong>{" "}
        {t("citizenFocusDesc", {
          defaultValue: "Easy login and grievance selection (Water, Electricity, etc.).",
        })}
      </div>
      <div style={videoStyles.videoBulletPoint}>
        <strong>{t("adminControlTitle", { defaultValue: "Admin Control:" })}</strong>{" "}
        {t("adminControlDesc", {
          defaultValue:
            "Complete command center to track all complaints (Pending/Completed).",
        })}
      </div>
      <div style={videoStyles.videoBulletPoint}>
        <strong>{t("transparencyTitle", { defaultValue: "Transparency:" })}</strong>{" "}
        {t("transparencyDesc", {
          defaultValue:
            "Statistics dashboard shows visual data on community issues.",
        })}
      </div>
    </div>
  </section>
);

// ----------------------------------------------------

const HomePage = () => {
  const { t } = useTranslation(); // ✅ translation hook
  const location = useLocation();
  const navigate = useNavigate();

  // Notification + auth simulation (frontend-only)
  const [showNotification, setShowNotification] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Public info data (replace image paths with your real images in /public/images)
  const ministersVisits = [
    { name: "Minister A", date: "25 Nov 2025", time: "10:00 AM", img: "/images/ministerA.jpg", icon: "🧑‍⚖️" },
    { name: "Minister B", date: "26 Nov 2025", time: "2:00 PM", img: "/images/ministerB.jpg", icon: "🧑‍⚖️" },
  ];
  const schemes = [
    { title: "Health Scheme", desc: "Free health checkups for all", img: "/images/scheme-health.png", icon: "🩺" },
    { title: "Education Scheme", desc: "Scholarships for students", img: "/images/scheme-edu.png", icon: "🎓" },
    { title: "Agriculture Scheme", desc: "Subsidies & training for farmers", img: "/images/scheme-agri.png", icon: "🌾" },
  ];
  const events = [
    { title: "Village Fair", date: "28 Nov", img: "/images/event-fair.jpg", icon: "🎪" },
    { title: "Cleanliness Drive", date: "30 Nov", img: "/images/event-clean.jpg", icon: "🧹" },
  ];
  const panchayatInfo = {
    name: "Gram Panchayat XYZ",
    location: "Gadag, Karnataka",
    img: "/images/panchayat-office.jpg",
    icon: "🏛️",
    description: "Office timings: 10:00 AM - 5:00 PM. Contact: 080-XXXX-XXXX"
  };

  // Inline styles used for notification and public-info cards
  const cardStyle = {
    flex: "1 1 300px",
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
    background: "#fff",
    minWidth: "240px",
  };
  const imgStyle = { width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem" };
  const iconBadgeStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "10px", background: "#ecfeff", color: "#065f46", fontSize: "20px", marginRight: "0.5rem" };

  // Show notification only on homepage (not on /public-info)
  const isPublicInfoRoute = location.pathname === '/public-info';

  // Keep isLoggedIn in sync with localStorage (in case user logs in elsewhere)
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ---------- PUBLIC INFO PAGE (full view) ----------
  const PublicInfoPage = () => (
    <main style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0 }}>Public Information</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>Ministers visits, schemes, events and Panchayat details — visible to everyone</p>
          </div>
          <div>
            <input
              type="search"
              placeholder="Search schemes, events, ministers..."
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e6edf3', width: 320 }}
              onChange={() => {}}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
          {/* Ministers */}
          <section style={{ ...cardStyle, paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={iconBadgeStyle}>🧑‍⚖️</div>
              <div>
                <h3 style={{ margin: 0 }}>Ministers Visits</h3>
                <small style={{ color: '#6b7280' }}>Latest schedule</small>
              </div>
            </div>

            {ministersVisits.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                {v.img ? (
                  <img src={v.img} alt={v.name} style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 84, height: 84, borderRadius: 8, background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 28 }}>{v.icon}</span>
                  </div>
                )}
                <div>
                  <strong>{v.name}</strong>
                  <div style={{ color: '#6b7280' }}>{v.date} • {v.time}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Schemes */}
          <section style={{ ...cardStyle }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={iconBadgeStyle}>🗂️</div>
              <div>
                <h3 style={{ margin: 0 }}>Schemes</h3>
                <small style={{ color: '#6b7280' }}>Ongoing & new</small>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {schemes.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {s.img ? (
                    <img src={s.img} alt={s.title} style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 84, height: 84, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                    </div>
                  )}
                  <div>
                    <strong>{s.title}</strong>
                    <div style={{ color: '#6b7280' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Events */}
          <section style={{ ...cardStyle }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={iconBadgeStyle}>📅</div>
              <div>
                <h3 style={{ margin: 0 }}>Events</h3>
                <small style={{ color: '#6b7280' }}>Upcoming</small>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {events.map((ev, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {ev.img ? (
                    <img src={ev.img} alt={ev.title} style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 84, height: 84, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 24 }}>{ev.icon}</span>
                    </div>
                  )}
                  <div>
                    <strong>{ev.title}</strong>
                    <div style={{ color: '#6b7280' }}>{ev.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Panchayat Info */}
          <section style={{ ...cardStyle }}>
            {panchayatInfo.img && <img src={panchayatInfo.img} alt={panchayatInfo.name} style={imgStyle} />}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={iconBadgeStyle}>{panchayatInfo.icon}</div>
              <div>
                <h3 style={{ margin: 0 }}>{panchayatInfo.name}</h3>
                <small style={{ color: '#6b7280' }}>{panchayatInfo.location}</small>
              </div>
            </div>
            <p style={{ color: '#374151' }}>{panchayatInfo.description}</p>
          </section>
        </div>
      </div>
    </main>
  );

  // ---------- HOMEPAGE (original content preserved) ----------
  // The original homepage content (hero, about, features, contact, footer) remains unchanged.
  // Only an "Intro Cards" block is shown on the homepage (brief overview).
  return (
    <>
      {isPublicInfoRoute ? (
        <PublicInfoPage />
      ) : (
        <div className="homepage">
          {/* Hero Section */}
          <section
            className="hero"
            style={{
              backgroundImage: "url('/images/village-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#fff',
              textAlign: 'center',
              padding: '4rem 2rem',
            }}
          >
            <h1>{t("heroTitle")}</h1>
            <p>{t("heroSubtitle")}</p>
            <div className="login-section">
              <Link to="/login" className="login-citizen-btn">{t("loginCitizen")}</Link>
              <Link to="/admin/login" className="login-admin-btn">{t("loginAdmin")}</Link>
              <Link to="/department/login" className="login-department-btn">{t("loginDepartment") || "Login as Department"}</Link>
              <Link to="/worker/login" className="login-worker-btn">
                {t("loginWorker", { defaultValue: "Login as Worker" })}
              </Link>
              <Link to="/manager/login" className="login-manager-btn">{t("loginManager") || "Login as Manager"}</Link>
            </div>
          </section>

    {/* Intro Cards Section */}
      <section style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>

    {/* Quick Services */}
    <div className="intro-card">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div className="icon-badge">🧾</div>
        <div>
          <h3 style={{ margin: 0 }}>{t("publicInfo.quickTitle")}</h3>
          <small style={{ color: "#6b7280" }}>{t("publicInfo.quickSubtitle")}</small>
        </div>
      </div>
      <p style={{ color: "#374151" }}>
        {t("publicInfo.quickDescription")}
      </p>
    </div>

    {/* Announcements */}
    <div className="intro-card">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div className="icon-badge">📣</div>
        <div>
          <h3 style={{ margin: 0 }}>{t("publicInfo.announcementsTitle")}</h3>
          <small style={{ color: "#6b7280" }}>{t("publicInfo.announcementsSubtitle")}</small>
        </div>
      </div>
      <p style={{ color: "#374151" }}>
        {t("publicInfo.announcementsDescription")}
      </p>
    </div>

    {/* Local Info */}
   <div className="intro-card">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div className="icon-badge">📍</div>
        <div>
          <h3 style={{ margin: 0 }}>{t("publicInfo.localTitle")}</h3>
          <small style={{ color: "#6b7280" }}>{t("publicInfo.localSubtitle")}</small>
        </div>
      </div>
      <p style={{ color: "#374151" }}>
  {t("publicInfo.localDescription", { 
    name: t("publicInfo.panchayatName"), 
    location: t("publicInfo.panchayatLocation") 
  })}
</p>
    </div>
  </div>

</section>

          {/* About Section */}
          <section id="about" className="about">
            <h2>{t("aboutTitle")}</h2>
            <p>{t("aboutDescription")}</p>
            <div className="tech-icons">
              <span>🟢 MongoDB</span>
              <span>⚙️ Express</span>
              <span>⚛️ React</span>
              <span>🟩 Node.js</span>
            </div>
          </section>

          {/* ADDED: Project Video Section */}
          <ProjectVideoSection t={t} />

          <section id="features" className="features"
  style={{
    padding: "2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    margin: "2rem auto",
    maxWidth: "1100px",
    fontFamily: "Poppins, sans-serif"
  }}
>
  <h2
    style={{
      fontSize: "1.8rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "2rem",
      textAlign: "center"
    }}
  >
    {t("featuresTitle")}
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "1.5rem"
    }}
  >
    {/* Complaint Management */}
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🗂️</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827" }}>
        {t("featureComplaints")}
      </h3>
      <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.5rem" }}>
        {t("featureComplaintsDesc") || 
          "Citizens can submit complaints, track their status (Pending, Accepted, Rejected, Completed), and receive email notifications."}
      </p>
    </div>

    {/* Monthly Statistics */}
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer"
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📊</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827" }}>
        {t("featureStatistics")}
      </h3>
      <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.5rem" }}>
        {t("featureStatisticsDesc") || 
          "Admins can view monthly complaint breakdowns with charts and tables, helping in data‑driven decision making."}
      </p>
    </div>

    {/* Public Information */}
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer"
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🌐</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827" }}>
        {t("featurePublicInfo")}
      </h3>
      <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.5rem" }}>
        {t("featurePublicInfoDesc") || 
          "Provides citizens with access to ministers, schemes, events, and Panchayat details in one place."}
      </p>
    </div>

    {/* Multilingual Support */}
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer"
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🈯</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827" }}>
        {t("featureMultilingual")}
      </h3>
      <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.5rem" }}>
        {t("featureMultilingualDesc") || 
          "Supports English, Hindi, and Kannada to ensure inclusivity and accessibility for all citizens."}
      </p>
    </div>
  </div>
</section>


          {/* Contact Section */}
          <section id="contact" className="contact">
            <h2>{t("contactTitle")}</h2>
            <p>{t("contactSubtitle")}</p>
            <form>
              <input className="contact-style" type="text" placeholder={t("contactName")} required />
              <input className="contact-style" type="email" placeholder={t("contactEmail")} required />
              <textarea className="message-box" type="text" placeholder={t("contactMessage")} required></textarea>
              <button className="contact-style" type="submit">{t("contactSubmit")}</button>
            </form>
          </section>

          {/* Footer */}
          <footer>
            <p>© 2025 E-Gram Panchayat. {t("footerRights")}</p>
            <div className="footer-links">
              <a href="/">{t("home")}</a>
              <a href="#about">{t("aboutTitle")}</a>
              <a href="#services">{t("services")}</a>
            </div>
          </footer>

          {/* ✅ Notification Popup (homepage only) */}
{showNotification && !isPublicInfoRoute && (
  <div className="notification-popup">
    <div className="notification-header">
      <div>
        <strong>🔔 {t("notification.title", { defaultValue: "Important Update" })}</strong>
        <div style={{ color: "#7c2d12", marginTop: 6, fontWeight: "500" }}>
          👷 {t("notification.message", {
            defaultValue: "Workers are urgently needed to support community services. Join now and make a difference!"
          })}
        </div>
      </div>
      <button
        onClick={() => setShowNotification(false)}
        className="notification-close"
        aria-label={t("notification.closeLabel", { defaultValue: "Close notification" })}
      >
        ×
      </button>
    </div>

    <div style={{ marginTop: 12 }}>
      {!isLoggedIn ? (
        <button
          onClick={() => navigate('/worker/login')}
          className="notification-action"
          style={{
            backgroundColor: "#030a05",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b6f91")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7a9fca")}
        >
          {t("notification.loginPrompt", { defaultValue: "Login as Worker" })}
        </button>
      ) : (
        <div style={{ color: "#4b5563" }}>
          <strong>{t("notification.detailsTitle", { defaultValue: "Worker Opportunities" })}</strong>
          <div>
            {t("notification.detailsMessage", {
              defaultValue: "You are logged in. Check your dashboard for assigned tasks and updates."
            })}
          </div>
        </div>
      )}
    </div>
  </div>
)}
        </div>
      )}
    </>
  );
}
export default HomePage;