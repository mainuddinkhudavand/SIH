import React, { useEffect } from "react";

export default function AutoTranslateWidget() {
  useEffect(() => {
    // 1. Define the initialization function for Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en", // Your website's default language
          includedLanguages: "en,hi,kn", // Only show English, Hindi, and Kannada
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element" // The ID of the div where the widget renders
      );
    };

    // 2. Inject the Google Translate script into the page
    const addScript = document.createElement("script");
    addScript.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    addScript.async = true;
    document.body.appendChild(addScript);

    // Cleanup function in case the component unmounts
    return () => {
      document.body.removeChild(addScript);
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div 
      id="google_translate_element" 
      style={{ 
        padding: "5px", 
        borderRadius: "8px", 
        background: "#f8fafc",
        display: "inline-block"
      }}
    >
      {/* The Google dropdown will automatically appear inside this div */}
    </div>
  );
}