import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const { t } = useTranslation(); // ✅ translation hook
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2 style={{ color: "red" }}>{t("pageNotFound")}</h2>
      <p>{t("pageNotFoundMessage")}</p>
      <button
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
        onClick={() => navigate("/")}
      >
        {t("goHome")}
      </button>
    </div>
  );
}