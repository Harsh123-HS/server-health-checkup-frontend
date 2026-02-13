import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AddServer() {
  const navigate = useNavigate();

  const BASE_URL =
    "https://sz02nvjz-3000.inc1.devtunnels.ms";

  const [formData, setFormData] = useState({
    serverName: "",
    systemName: "",
    url: "",
  });

  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemsLoading, setSystemsLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Fetch systems from backend
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/api/systems`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔐 important
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch systems");
        }

        const data = await res.json();
        console.log("Systems API Response:", data);

        // Support both formats: [] OR { systems: [] }
        if (Array.isArray(data)) {
          setSystems(data);
        } else if (data.systems) {
          setSystems(data.systems);
        } else {
          setSystems([]);
        }
      } catch (err) {
        console.error("Fetch Systems Error:", err);
        setError("Unable to load systems");
      } finally {
        setSystemsLoading(false);
      }
    };

    fetchSystems();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!formData.serverName || !formData.systemName || !formData.url) {
    setError("Please fill all fields");
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    const response = await fetch(
      "https://sz02nvjz-3000.inc1.devtunnels.ms/api/services", // 🔥 services endpoint (important)
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔐 required if protected
        },
        body: JSON.stringify({
          system: formData.systemName,   // ✅ matches backend
          name: formData.serverName,     // ✅ matches backend
          healthUrl: formData.url,       // 🔥 FIXED KEY (was url before)
        }),
      }
    );

    const data = await response.json();
    console.log("Create Service Response:", data);

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to add service");
    }

    alert("Service (Server) added successfully!");

    // Reset form
    setFormData({
      serverName: "",
      systemName: "",
      url: "",
    });

    navigate("/dashboard");
  } catch (error) {
    console.error("Add Service Error:", error);
    setError(error.message || "Error adding server");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-8">
        
        <h2 className="text-2xl font-semibold text-white mb-2">
          Add New Server
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          Register a new server for health monitoring
        </p>

        {error && (
          <div className="mb-4 text-red-400 bg-red-900/20 border border-red-800 p-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Server Name */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Server Name
            </label>
            <input
              type="text"
              name="serverName"
              value={formData.serverName}
              onChange={handleChange}
              placeholder="Enter server name"
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* System Dropdown */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              System Name
            </label>
            <select
              name="systemName"
              value={formData.systemName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {systemsLoading ? "Loading systems..." : "Select System"}
              </option>

              {systems.map((system, index) => (
                <option key={system.id || index} value={system.name}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Server URL / Health Endpoint
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://api.example.com/health"
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || systemsLoading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddServer;
