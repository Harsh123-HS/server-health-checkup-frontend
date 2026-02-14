import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StatusBadge() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    unhealthy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthSummary();

    const interval = setInterval(() => {
      fetchHealthSummary();
    }, 30000);

    return () => clearInterval(interval);
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
    console.log("Health Summary:", data);

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


  return (
  <div className="w-full bg-gradient-to-b from-[#0b1225] via-[#0f172a] to-[#020617] text-white border-b border-slate-800">
    
    <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
      
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
        <div className="grid grid-cols-3 gap-5">
          
          {/* Total Servers */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          rounded-2xl px-6 py-4 border border-slate-700 shadow-lg 
          backdrop-blur-md min-w-[120px]">
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
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/add-system")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r 
            from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
            transition font-medium shadow-lg shadow-blue-900/30"
          >
            + Add System
          </button>

          <button
            onClick={() => navigate("/add-server")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r 
            from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 
            transition font-medium shadow-lg shadow-emerald-900/30"
          >
            + Add Server
          </button>
        </div>

        {/* Auto Refresh Indicator (Premium Touch) */}
        <p className="text-xs text-gray-500">
          Auto-refresh every 30s • Live Monitoring
        </p>
      </div>
    </div>
  </div>
);

}

export default StatusBadge;
