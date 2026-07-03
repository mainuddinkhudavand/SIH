import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/PageInfo.css";

const PublicInfoPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [openDetail, setOpenDetail] = useState(null);

  // Example data (dynamic values remain as-is)
  const ministersVisits = [
    {
      name: "Minister A",
      date: "25 Nov 2025",
      time: "10:00 AM",
      venue: "Community Hall",
      purpose: "Review of health initiatives",
      contact: "Officer Kumar (080-123456)",
      img: "https://plus.unsplash.com/premium_photo-1683140837871-dafa9828c44a?w=1000",
      icon: "🧑‍⚖️",
    },
    {
      name: "Minister B",
      date: "26 Nov 2025",
      time: "2:00 PM",
      venue: "Town Square",
      purpose: "Launch of education scheme",
      contact: "Officer Patel (080-654321)",
      img: "https://plus.unsplash.com/premium_photo-1733266854650-2e5e227d8f88?w=1000",
      icon: "🧑‍⚖️",
    },
  ];

  const schemes = [
    {
      title: "Health Scheme",
      desc: "Free health checkups for all residents under PM-JAY",
      eligibility: "All citizens above 18",
      deadline: "31 Dec 2025",
      contact: "health-scheme@example.com",
      img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000",
      icon: "🩺",
      link: "https://www.myscheme.gov.in/schemes/pmjay",
      viewLink: "https://www.myscheme.gov.in/schemes/pmjay"
    },
    {
      title: "Education Scheme",
      desc: "Scholarships for primary & secondary students",
      eligibility: "Students from grade 6–12",
      deadline: "15 Jan 2026",
      contact: "edu-scheme@example.com",
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000",
      icon: "🎓",
      link: "https://www.myscheme.gov.in/search?category=Education",
      viewLink: "https://www.myscheme.gov.in/search?category=Education"
    },
    {
      title: "Agriculture Scheme",
      desc: "Subsidies, quality seeds & training for farmers",
      eligibility: "Registered farmers",
      deadline: "Ongoing",
      contact: "agri-scheme@example.com",
      img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000",
      icon: "🌾",
      link: "https://www.myscheme.gov.in/search?category=Agriculture",
      viewLink: "https://www.myscheme.gov.in/search?category=Agriculture"
    },
  ];

  const events = [
    {
      title: "Village Fair",
      date: "28 Nov",
      organizer: "Cultural Committee",
      registration: "Register at Panchayat office",
      img: "https://images.unsplash.com/photo-1659545403926-de716a2f8b0c?w=1000",
      icon: "🎪",
    },
    {
      title: "Cleanliness Drive",
      date: "30 Nov",
      organizer: "Youth Club",
      registration: "Join via WhatsApp group",
      img: "https://images.unsplash.com/photo-1618477462146-050d2767eac4?w=1000",
      icon: "🧹",
    },
  ];

  const panchayatInfo = {
    name: "Gram Panchayat XYZ",
    location: "Gadag, Karnataka",
    img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1000",
    icon: "🏛️",
    description: "Office timings: 10:00 AM - 5:00 PM",
    contact: "080-XXXX-XXXX | panchayat@example.com",
    officeBearers: [
      { role: "President", name: "Mr. Ramesh Kumar" },
      { role: "Secretary", name: "Ms. Anjali Patil" },
      { role: "Health Officer", name: "Dr. Suresh Rao" },
    ],
    quickLinks: [
      { label: t("publicInfo.quickSchemes"), href: "/public-info#schemes" },
      { label: t("publicInfo.quickEvents"), href: "/public-info#events" },
      { label: t("loginCitizen"), href: "/login" },
    ],
  };

  useEffect(() => {
    if (location.state && location.state.openDetail) {
      setOpenDetail(location.state.openDetail);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <main style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0 }}>{t("publicInfo.title")}</h1>
            <p style={{ margin: 0, color: "#6b7280" }}>{t("publicInfo.subtitle")}</p>
          </div>
          <div>
            <input
              type="search"
              placeholder={t("publicInfo.searchPlaceholder")}
              className="search-box"
              onChange={() => {}}
            />
          </div>
        </div>

        <div className="public-grid">
          {/* Ministers */}
          <section id="ministers" className="public-card">
            <div className="section-header">
              <div className="section-icon">🧑‍⚖️</div>
              <div>
                <h3 className="section-title">{t("publicInfo.ministersTitle")}</h3>
                <small className="section-subtitle">{t("publicInfo.ministersSubtitle")}</small>
              </div>
            </div>
            {ministersVisits.map((v, i) => (
              <div key={i} className="info-item">
                <img src={v.img} alt={v.name} className="info-img" />
                <div>
                  <strong>{v.name}</strong>
                  <div className="muted">{v.date} • {v.time}</div>
                  <div className="muted">{t("publicInfo.venue")}: {v.venue}</div>
                  <div className="muted">{t("publicInfo.purpose")}: {v.purpose}</div>
                  <div className="muted">{t("publicInfo.contact")}: {v.contact}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Schemes */}
          <section id="schemes" className="public-card">
            <div className="section-header">
              <div className="section-icon">🗂️</div>
              <div>
                <h3 className="section-title">{t("publicInfo.schemesTitle")}</h3>
                <small className="section-subtitle">{t("publicInfo.schemesSubtitle")}</small>
              </div>
            </div>
            {schemes.map((s, idx) => (
              <div key={idx} className="info-item">
                <img src={s.img} alt={s.title} className="info-img" />
                <div>
                  <strong>{s.title}</strong>
                  <div className="muted">{s.desc}</div>
                  <ul className="muted">
                    <li>{t("publicInfo.eligibility")}: {s.eligibility}</li>
                    <li>{t("publicInfo.deadline")}: {s.deadline}</li>
                    <li>{t("publicInfo.contact")}: {s.contact}</li>
                  </ul>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                    <a 
                      href={s.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="primary-btn" 
                      style={{ display: "inline-block", textAlign: "center", textDecoration: "none", flex: 1, minWidth: "100px", padding: "8px 12px", boxSizing: "border-box" }}
                    >
                      {t("publicInfo.applyNow") || "Apply Now"}
                    </a>
                    <a 
                      href={s.viewLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="secondary-btn" 
                      style={{ 
                        display: "inline-block", 
                        textAlign: "center", 
                        textDecoration: "none", 
                        flex: 1,
                        minWidth: "100px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "2px solid #065f46",
                        color: "#065f46",
                        backgroundColor: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        marginTop: "6px",
                        boxSizing: "border-box"
                      }}
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Events */}
          <section id="events" className="public-card">
            <div className="section-header">
              <div className="section-icon">📅</div>
              <div>
                <h3 className="section-title">{t("publicInfo.eventsTitle")}</h3>
                <small className="section-subtitle">{t("publicInfo.eventsSubtitle")}</small>
              </div>
            </div>
            {events.map((ev, idx) => (
              <div key={idx} className="info-item">
                <img src={ev.img} alt={ev.title} className="info-img" />
                <div>
                  <strong>{ev.title}</strong>
                  <div className="muted">{t("publicInfo.date")}: {ev.date}</div>
                  <div className="muted">{t("publicInfo.organizer")}: {ev.organizer}</div>
                  <div className="muted">{t("publicInfo.registration")}: {ev.registration}</div>
                </div>
              </div>
            ))}
          </section>

                   {/* Panchayat Info */}
          <section id="panchayat" className="public-card">
            <img src="https://images.unsplash.com/photo-1649836751538-f377a2b20884?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z3JhbSUyMHBhbmNoYXlhdGh8ZW58MHx8MHx8fDA%3D" alt={panchayatInfo.name} className="banner-img" />
            <div className="section-header">
              <div className="section-icon">{panchayatInfo.icon}</div>
              <div>
                <h3 className="section-title">{t("publicInfo.panchayatName")}</h3>
<small className="section-subtitle">{t("publicInfo.panchayatLocation")}</small>
              </div>
            </div>
            <p>{panchayatInfo.description}</p>
            <p className="muted">{t("publicInfo.contact")}: {panchayatInfo.contact}</p>

            <h4>{t("publicInfo.officeBearers")}</h4>
            <ul>
              {panchayatInfo.officeBearers.map((b, idx) => (
                <li key={idx}>{b.role}: {b.name}</li>
              ))}
            </ul>

            <h4>{t("publicInfo.quickTitle")}</h4>
            <ul>
              {panchayatInfo.quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="link-btn">{link.label}</a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Detail Section */}
        {openDetail && (
          <div style={{ marginTop: 20 }}>
            <h2>{t("publicInfo.detailHeading", { detail: openDetail })}</h2>
            <div style={{ padding: 12, borderRadius: 8, background: "#fff", border: "1px solid #eef2f2" }}>
              {openDetail === "quick" && (
                <p>{t("publicInfo.detailQuick")}</p>
              )}
              {openDetail === "announcements" && (
                <p>{t("publicInfo.detailAnnouncements")}</p>
              )}
              {openDetail === "local" && (
                <p>{t("publicInfo.detailLocal")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default PublicInfoPage;