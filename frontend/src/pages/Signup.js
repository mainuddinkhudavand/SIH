import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(""); // ✅ frontend error state
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ✅ Password validation (only 6+ characters)
  const validatePassword = (password) => password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation before API call
    if (!validatePassword(form.password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await API.post("/auth/signup", form);
      setError(""); // clear error if successful
      alert(t("otpSent"));
      navigate("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.message || t("error"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{t("signup")}</h2>
      <input
        placeholder={t("name")}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        placeholder={t("email")}
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder={t("password")}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      {/* ✅ Show error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit">{t("signup")}</button>
    </form>
  );
}