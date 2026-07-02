import React, { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./styles/Register.css";
import { useTranslation } from "react-i18next";
import { ToastContext } from "../context/ToastContext"; // ✅ global toast

// ✅ States, districts, and towns mapping
import { statesData } from "../constants/statesData";

export default function KYC() {
  const [aadhaar, setAadhaar] = useState("");
  const [address, setAddress] = useState({
    state: "",
    district: "",
    town: "",
    pin: "",
    street: "",
  });
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useContext(ToastContext);

  // Fetch existing KYC details if available
  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const res = await API.get("/user/profile");
        const user = res.data;

        if (user?.kycCompleted) {
          setAadhaar(user.aadhaarNumber || "");
          setAddress(
            user.address || { state: "", district: "", town: "", pin: "", street: "" }
          );
        }
      } catch (err) {
        console.error("Error fetching KYC details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKYC();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/user/kyc", { aadhaarNumber: aadhaar, address });
      showToast(t("kycCompleted"), "success");

      setTimeout(() => {
        nav("/grievance"); // ✅ go to grievance selection
      }, 2000);
    } catch (err) {
      showToast(err.response?.data?.message || t("kycError"), "error");
    }
  };

  if (loading) return <p>{t("loadingKYC")}</p>;

  return (
    <div className="register-container">
      <h2 className="register-title">{t("completeKYC")}</h2>

      <form className="register-form" onSubmit={submit}>
        {/* Aadhaar */}
        <input
          className="register-input"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
          placeholder={t("aadhaarNumber")}
          pattern="\d{12}"
          required
        />

        {/* State Dropdown */}
        <select
          className="register-input"
          value={address.state}
          onChange={(e) =>
            setAddress({ ...address, state: e.target.value, district: "", town: "" })
          }
          required
        >
          <option value="">{t("Select State")}</option>
          {Object.keys(statesData).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* District Dropdown */}
        {address.state && statesData[address.state] && (
          <select
            className="register-input"
            value={address.district}
            onChange={(e) =>
              setAddress({ ...address, district: e.target.value, town: "" })
            }
            required
          >
            <option value="">{t("Select District")}</option>
            {Object.keys(statesData[address.state]).map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        )}

        {/* Town Dropdown */}
        {address.district &&
          statesData[address.state] &&
          statesData[address.state][address.district] && (
            <select
              className="register-input"
              value={address.town}
              onChange={(e) => setAddress({ ...address, town: e.target.value })}
              required
            >
              <option value="">{t("Select Town")}</option>
              {statesData[address.state][address.district].map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          )}

        {/* Pin Code */}
        <input
          className="register-input"
          value={address.pin}
          onChange={(e) => setAddress({ ...address, pin: e.target.value })}
          placeholder={t("pinCode")}
          required
        />

        {/* Street */}
        <input
          className="register-input"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          placeholder={t("streetArea")}
          required
        />

        <button className="register-button" type="submit">
          {t("submitKYC")}
        </button>
      </form>
    </div>
  );
}