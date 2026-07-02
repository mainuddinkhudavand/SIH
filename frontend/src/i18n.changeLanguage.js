import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function KYCForm() {
  const { i18n, t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    aadhaar: "",
    street: "",
    town: "",
    state: "",
    pin: ""
  });

  const subscriptionKey = "<YOUR_KEY>";     // from Azure portal
  const region = "<YOUR_REGION>";           // e.g. "centralindia"

  // Call Microsoft Translator API for transliteration
  const transliterate = async (text, lang) => {
    if (lang === "en") return text; // English stays as typed

    const toScript = lang === "hi" ? "Deva" : "Knda"; // Hindi → Devanagari, Kannada → Kannada script
    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/transliterate?api-version=3.0&language=${lang}&fromScript=Latn&toScript=${toScript}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([{ Text: text }])
      }
    );
    const data = await response.json();
    return data[0]?.text || text;
  };

  // Handle input changes
  const handleChange = async (field, value) => {
    const lang = i18n.language; // "en", "hi", or "kn"
    const output = await transliterate(value, lang);
    setForm({ ...form, [field]: output });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("KYC submitted:", form);
    alert(t("kycCompleted"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{t("completeKYC")}</h2>

      <div>
        <label>{t("name")}</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={t("name")}
        />
      </div>

      <div>
        <label>{t("aadhaarNumber")}</label>
        <input
          type="number"
          value={form.aadhaar}
          onChange={(e) => handleChange("aadhaar", e.target.value)}
          placeholder={t("aadhaarNumber")}
        />
      </div>

      <div>
        <label>{t("streetArea")}</label>
        <input
          type="text"
          value={form.street}
          onChange={(e) => handleChange("street", e.target.value)}
          placeholder={t("streetArea")}
        />
      </div>

      <div>
        <label>{t("town")}</label>
        <input
          type="text"
          value={form.town}
          onChange={(e) => handleChange("town", e.target.value)}
          placeholder={t("town")}
        />
      </div>

      <div>
        <label>{t("state")}</label>
        <input
          type="text"
          value={form.state}
          onChange={(e) => handleChange("state", e.target.value)}
          placeholder={t("state")}
        />
      </div>

      <div>
        <label>{t("pinCode")}</label>
        <input
          type="number"
          value={form.pin}
          onChange={(e) => handleChange("pin", e.target.value)}
          placeholder={t("pinCode")}
        />
      </div>

      <button type="submit">{t("submitKYC")}</button>
    </form>
  );
}