import React from "react";
import { useTranslation } from "react-i18next";

// ✅ go up one level from pages → components
import MinistersList from "../components/Public/MinistersList";
import SchemesList from "../components/Public/SchemesList";
import EventsList from "../components/Public/EventsList";
import PanchayatInfo from "../components/Public/PanchayatInfo";

export default function PublicInfo() {
  const { t } = useTranslation();

  return (
    <div className="public-info">
      <h1>{t("publicInformation")}</h1>
      <MinistersList />
      <SchemesList />
      <EventsList />
      <PanchayatInfo />
    </div>
  );
}