export const sendMessage = async (msg) => {
  try {
    // This relative path works ONLY if you have the proxy configured above
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    if (!res.ok) {
      // Log the status code to help debugging (e.g., 404, 500)
      console.error(`Server responded with status: ${res.status}`);
      throw new Error("Backend error: " + res.statusText);
    }

    return await res.json();
  } catch (err) {
    console.error("Chat service error:", err);
    // Return a structured object so your UI doesn't crash
    return { response: "⚠️ Unable to reach chatbot backend. Please check if the server is running on port 5000." };
  }
};