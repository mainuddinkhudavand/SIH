import React, { useEffect, useState } from "react";
import axios from "axios";

export default function WorkerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem("workerToken");
      const res = await axios.get(`${BACKEND_URL}/api/worker/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    };
    fetchComplaints();
  }, []);

  const markCompleted = async (id) => {
    const message = prompt("Enter completion message:");
    const token = localStorage.getItem("workerToken");
    await axios.put(
      `${BACKEND_URL}/api/worker/complaints/${id}/complete`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComplaints((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div>
      <h2>Assigned Complaints</h2>
      {complaints.map((c) => (
        <div key={c._id} style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p>Status: {c.status}</p>
          <button onClick={() => markCompleted(c._id)}>Mark Completed</button>
        </div>
      ))}
    </div>
  );
}