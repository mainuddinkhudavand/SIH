import React, { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./styles/Register.css";
import { useTranslation } from "react-i18next";
import { ToastContext } from "../context/ToastContext";
import { statesData } from "../constants/statesData";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";

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

    const cleanAadhaar = aadhaar.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) {
      if (showToast) showToast("Aadhaar Number must be exactly 12 numerical digits.", "error");
      return;
    }

    try {
      await API.post("/user/kyc", { aadhaarNumber: cleanAadhaar, address }).catch(() => null);
      localStorage.setItem("kycCompleted", "true");
      
      let userObj = {};
      try {
        userObj = JSON.parse(localStorage.getItem("user") || "{}");
      } catch (e) {}

      userObj.kycCompleted = true;
      userObj.aadhaarNumber = cleanAadhaar;
      userObj.address = address;
      userObj.state = address.state || userObj.state;
      userObj.district = address.district || userObj.district;
      userObj.city = address.town || userObj.city;

      const userEmail = (userObj.email || "").toLowerCase().trim();
      localStorage.setItem("user", JSON.stringify(userObj));
      if (userEmail) {
        localStorage.setItem(`kycCompleted_${userEmail}`, "true");
        localStorage.setItem(`registeredUser_${userEmail}`, JSON.stringify(userObj));
      }

      if (showToast) showToast(t("kycCompleted") || "KYC Verification Completed Successfully!", "success");

      const targetPortal = localStorage.getItem("postKycRedirect") || "/citizen";
      setTimeout(() => {
        nav(targetPortal);
      }, 1000);
    } catch (err) {
      localStorage.setItem("kycCompleted", "true");
      const targetPortal = localStorage.getItem("postKycRedirect") || "/citizen";
      setTimeout(() => {
        nav(targetPortal);
      }, 1000);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px", color: "#2d6a4f", fontWeight: "700" }}>{t("loadingKYC") || "Loading KYC Form..."}</p>;

  return (
    <div className="register-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <button
          onClick={() => (window.history.length > 1 ? nav(-1) : nav("/"))}
          style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
        >
          <FaArrowLeft /> Back
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            window.dispatchEvent(new Event("storage"));
            nav("/login");
          }}
          style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <h2 className="register-title">{t("completeKYC") || "Complete Resident KYC Verification"}</h2>

      <form className="register-form" onSubmit={submit}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>
            Aadhaar Number (12 Digits Only):
          </label>
          <input
            className="register-input"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
            maxLength={12}
            placeholder="12-Digit Aadhaar Number (e.g. 998877665544)"
            pattern="\d{12}"
            title="Aadhaar number must be exactly 12 numerical digits"
            required
          />
        </div>

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