import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./styles/Register.css"; // import CSS
import API from '../services/api';
import { useTranslation } from "react-i18next";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(''); // ✅ frontend error state
  const { t } = useTranslation();

  // ✅ Password validation (only 6+ characters)
  const validatePassword = (password) => password.length >= 6;

  const handleSubmit = async e => {
    e.preventDefault();

    // ✅ Frontend validation before API call
    if (!validatePassword(form.password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await API.post('/auth/register', form);
      setUserId(res.data.userId);
      setError(""); // clear error if successful
      if (res.data.otp) {
        alert(`${t("otpSent")} (OTP: ${res.data.otp})`);
      } else {
        alert(t("otpSent"));
      }
    } catch (err) {
      setError(err.response?.data?.message || t("error"));
    }
  };

  const verifyOtp = async () => {
    try {
      await API.post('/auth/verify-otp', { userId, otp });
      alert(t("otpVerified"));
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t("otpError"));
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">{t("register")}</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          className="register-input"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder={t("name")}
          required
        />
        <input
          className="register-input"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder={t("email")}
          type="email"
          required
        />
        <input
          className="register-input"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder={t("Phone")}
          pattern="\d{10}"
          required
        />
        <input
          className="register-input"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder={t("password")}
          type="password"
          required
        />

        {/* ✅ Show error message */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button className="register-button" type="submit">
          {t("register")}
        </button>
      </form>

      {userId && (
        <div className="otp-section">
          <h4 className="otp-title">{t("enterOtp")}</h4>
          <input
            className="otp-input"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder={t("otpPlaceholder")}
          />
          <button className="otp-button" onClick={verifyOtp}>
            {t("verify")}
          </button>
        </div>
      )}
    </div>
  );
}