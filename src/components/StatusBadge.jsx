import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StatusBadge() {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    unhealthy: 0,
  });
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Initial load
  fetchHealthSummary();
  fetchSystems();

  // 🔄 Listen for global refresh from other pages
  const handleStorageChange = (event) => {
    if (event.key === "globalRefresh") {
      fetchHealthSummary();
      fetchSystems();
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // ⏱ Auto refresh every 30s
  const interval = setInterval(() => {
    fetchHealthSummary();
    fetchSystems();
  }, 30000);

  // Cleanup
  return () => {
    clearInterval(interval);
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);


  const fetchHealthSummary = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "https://unsensational-unthickly-alonzo.ngrok-free.dev/api/health",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
           "ngrok-skip-browser-warning": "true",
        },
      }
    ); 

    

    // 🔍 Check content type BEFORE parsing JSON
    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("❌ Expected JSON but got HTML:", text);
      throw new Error("API returned HTML instead of JSON (ngrok issue)");
    }

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();

    let totalServers = 0;
    data.systems?.forEach((system) => {
      totalServers += system.services?.length || 0;
    });

    setStats({
      total: totalServers,
      healthy: data.summary?.up || 0,
      unhealthy: data.summary?.down || 0,
    });

  } catch (error) {
    console.error("Status Badge Error:", error);
  } finally {
    setLoading(false);
  }

  
};

const fetchSystems = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("https://unsensational-unthickly-alonzo.ngrok-free.dev/api/systems", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch systems");
    }

    const data = await res.json();

    // Supports both formats
    if (Array.isArray(data)) {
      setSystems(data);
    } else if (data.systems) {
      setSystems(data.systems);
    } else {
      setSystems([]);
    }

  } catch (err) {
    console.error("Fetch Systems Error:", err);
  }
};



  return (
  <div className="md:w-full bg-gradient-to-b from-[#0b1225] via-[#0f172a] to-[#020617] text-white border-b border-slate-800">
    
    <div className="md:max-w-7xl md:mx-auto md:px-6 md:py-5 px-4 mb-4 items-center  flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
      
      {/* 🔹 Left Content (Title Section) */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-wide text-white">
          Central Server Health Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Monitor and manage system infrastructure in real time
        </p>
      </div>

      {/* 🔹 Right Section (Stats + Buttons) */}
      <div className="flex flex-col items-end gap-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">

          
           <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          rounded-2xl px-6 py-4 border border-slate-700 shadow-lg 
          backdrop-blur-md md:min-w-[120px]">
            <p className="text-xs text-gray-400">Total System</p>
            <p className="text-2xl font-bold mt-1">
              {loading ? "..." : systems.length}
            </p>
          </div>

          {/* Total Servers */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          rounded-2xl px-6 py-4 border border-slate-700 shadow-lg 
          backdrop-blur-md md:min-w-[120px]">
            <p className="text-xs text-gray-400">Total Servers</p>
            <p className="text-2xl font-bold mt-1">
              {loading ? "..." : stats.total}
            </p>
          </div>

          {/* Healthy */}
          <div className="bg-gradient-to-br from-green-900/20 to-[#0f172a] 
          rounded-2xl px-6 py-4 border border-green-500/20 shadow-lg 
          backdrop-blur-md min-w-[120px]">
            <p className="text-xs text-gray-400">Healthy</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {loading ? "..." : stats.healthy}
            </p>
          </div>

          {/* Unhealthy */}
          <div className="bg-gradient-to-br from-red-900/20 to-[#0f172a] 
          rounded-2xl px-6 py-4 border border-red-500/20 shadow-lg 
          backdrop-blur-md min-w-[120px]">
            <p className="text-xs text-gray-400">Unhealthy</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {loading ? "..." : stats.unhealthy}
            </p>
          </div>
        </div>

        {/* Action Buttons (Aligned like your reference UI) */}
        <div className="flex gap-5  ">
          <button
            onClick={() => navigate("/add-system")}
            className="md:px-5 px-2 py-2.5 rounded-xl bg-gradient-to-r 
            from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
            transition font-medium shadow-lg shadow-blue-900/30"
          >
            + Add System
          </button>

          <button
            onClick={() => navigate("/add-server")}
            className="md:px-5 px-2 py-2.5 rounded-xl bg-gradient-to-r 
            from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 
            transition font-medium shadow-lg shadow-emerald-900/30"
          >
            + Add Server
          </button>
        </div>

        
      </div>
    </div>
  </div>
);

}

export default StatusBadge;
