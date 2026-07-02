// src/components/GrievanceSelection.js
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GrievanceContext } from "../context/GrievanceContext";
import "./GrievanceSelection.css";
import { useTranslation } from "react-i18next";
import { grievances } from "../constants/grievances"; // ✅ import shared list

const GrievanceSelection = () => {
  const { setSelectedGrievance } = useContext(GrievanceContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSelect = (grievanceKey) => {
    setSelectedGrievance(grievanceKey);
    navigate("/raise-complaint"); // ✅ go directly to complaint form
  };

  return (
    <div className="grievance-container">
      <h2>{t("selectGrievance")}</h2>
      <p>{t("selectGrievanceInstruction")}</p>
      <div className="card-grid">
        {grievances.map((g, idx) => (
          <div
            key={idx}
            className="grievance-card"
            onClick={() => handleSelect(g.key)}
          >
            <div className="icon">{g.icon}</div>
            <div className="label">{t(g.key)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrievanceSelection;