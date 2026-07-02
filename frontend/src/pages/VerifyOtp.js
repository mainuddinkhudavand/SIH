import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VerifyOtp() {
  const [form, setForm] = useState({ email: "", otp: "" });
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✅ translation hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/verify-otp", form);
      alert(t("accountVerified")); // ✅ translated alert
      navigate("/"); // Redirect after OTP verification
    } catch (err) {
      alert(err.response?.data?.message || t("otpError")); // ✅ translated error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{t("verifyOtp")}</h2>
      <input
        placeholder={t("email")}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder={t("otp")}
        onChange={(e) => setForm({ ...form, otp: e.target.value })}
      />
      <button type="submit">{t("verify")}</button>
    </form>
  );
}