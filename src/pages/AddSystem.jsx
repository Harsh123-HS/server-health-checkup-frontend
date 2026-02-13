import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddSystem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    systemName: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!formData.systemName || !formData.description) {
    setError("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("token"); // 🔐 get JWT token

    const response = await fetch(
      "https://sz02nvjz-3000.inc1.devtunnels.ms/api/systems", // ✅ same backend as health/login
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 IMPORTANT (if API is protected)
        },
        body: JSON.stringify({
          name: formData.systemName,
          description: formData.description,
        }),
      }
    );

    const data = await response.json();
    console.log("Add System Response:", data); // debug

    if (response.status === 401) {
      // Token expired
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to add system");
    }

    // ✅ Success
    alert("System added successfully!");

    // Reset form (professional UX)
    setFormData({
      systemName: "",
      description: "",
    });

    // Redirect to dashboard to see new system
    navigate("/dashboard");

  } catch (err) {
    console.error("Add System Error:", err);
    setError(err.message || "Error adding system. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-8">
        
        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-2">
          Add New system
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Register a new system for monitoring in the dashboard
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-400 bg-red-900/20 border border-red-800 p-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* system Name */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              system Name
            </label>
            <input
              type="text"
              name="systemName"
              value={formData.systemName}
              onChange={handleChange}
              placeholder="e.g. Auth system"
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter system description or purpose..."
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition text-white font-medium shadow-md disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add system"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSystem;
