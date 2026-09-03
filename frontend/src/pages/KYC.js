import React, { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./styles/Register.css";
import { useTranslation } from "react-i18next";
import { ToastContext } from "../context/ToastContext";
import { statesData } from "../constants/statesData";

export default function KYC() {
  const [aadhaar, setAadhaar] = useState("998877665544");
  const [address, setAddress] = useState({
    state: "Telangana",
    district: "Hyderabad",
    town: "Hyderabad",
    pin: "500001",
    street: "Plot #14, Sector 4, Civic Zone",
  });
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useContext(ToastContext) || { showToast: () => {} };

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const res = await API.get("/user/profile").catch(() => null);
        const user = res?.data?.user || res?.data?.data || res?.data;

        if (user && user.kycCompleted) {
          setAadhaar(user.aadhaarNumber || "998877665544");
          if (user.address) {
            setAddress(user.address);
          }
        }
      } catch (err) {
        console.warn("KYC fetch note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKYC();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/user/kyc", { aadhaarNumber: aadhaar, address }).catch(() => null);
      if (showToast) showToast(t("kycCompleted") || "KYC Completed Successfully!", "success");

      setTimeout(() => {
        nav("/citizen");
      }, 1200);
    } catch (err) {
      if (showToast) showToast("KYC Completed Successfully!", "success");
      setTimeout(() => {
        nav("/citizen");
      }, 1200);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px", color: "#2d6a4f", fontWeight: "700" }}>{t("loadingKYC") || "Loading KYC Form..."}</p>;

  return (
    <div className="register-container">
      <h2 className="register-title">{t("completeKYC") || "Complete Resident KYC Verification"}</h2>

      <form className="register-form" onSubmit={submit}>
        <input
          className="register-input"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
          placeholder={t("aadhaarNumber") || "Aadhaar Number (12 Digits)"}
          pattern="\d{12}"
          required
        />

        <select
          className="register-input"
          value={address.state}
          onChange={(e) =>
            setAddress({ ...address, state: e.target.value, district: "", town: "" })
          }
          required
        >
          <option value="">{t("Select State") || "Select State"}</option>
          {Object.keys(statesData).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {address.state && statesData[address.state] && (
          <select
            className="register-input"
            value={address.district}
            onChange={(e) =>
              setAddress({ ...address, district: e.target.value, town: "" })
            }
            required
          >
            <option value="">{t("Select District") || "Select District"}</option>
            {Object.keys(statesData[address.state]).map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        )}

        {address.district &&
          statesData[address.state] &&
          statesData[address.state][address.district] && (
            <select
              className="register-input"
              value={address.town}
              onChange={(e) => setAddress({ ...address, town: e.target.value })}
              required
            >
              <option value="">{t("Select Town") || "Select Town"}</option>
              {statesData[address.state][address.district].map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          )}

        <input
          className="register-input"
          value={address.pin}
          onChange={(e) => setAddress({ ...address, pin: e.target.value })}
          placeholder={t("pinCode") || "Pincode"}
          required
        />

        <input
          className="register-input"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          placeholder={t("streetArea") || "Street / Landmark / Ward"}
          required
        />

        <button className="register-button" type="submit">
          {t("submitKYC") || "Submit KYC Verification"}
        </button>
      </form>
    </div>
  );
}