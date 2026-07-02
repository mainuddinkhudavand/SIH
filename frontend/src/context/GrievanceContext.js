import React, { createContext, useState, useEffect } from "react";

export const GrievanceContext = createContext();

export const GrievanceProvider = ({ children }) => {
  const [selectedGrievance, setSelectedGrievance] = useState(() => {
    return localStorage.getItem("selectedGrievance") || "";
  });

  useEffect(() => {
    if (selectedGrievance) {
      localStorage.setItem("selectedGrievance", selectedGrievance);
    }
  }, [selectedGrievance]);

  const clearGrievance = () => {
    setSelectedGrievance("");
    localStorage.removeItem("selectedGrievance");
  };

  return (
    <GrievanceContext.Provider
      value={{ selectedGrievance, setSelectedGrievance, clearGrievance }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};