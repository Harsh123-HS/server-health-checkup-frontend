import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseUrl from "../BaseUrl";

function StatusBadge() {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);

  const [stats, setStats] = useState({
    totalSystems: 0,
    total: 0,
    healthy: 0,
    unhealthy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    fetchHealthSummary();

    // 🔄 Listen for global refresh from other pages
    const handleStorageChange = (event) => {
      if (event.key === "globalRefresh") {
        fetchHealthSummary();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // ⏱ Auto refresh every 30s
    const interval = setInterval(() => {
      fetchHealthSummary();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchHealthSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BaseUrl}/api/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
      });

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

      let totalSystems = 0;
      data.systems?.forEach((system) => {
        totalSystems += 1; // count each system
        totalServers += system.services?.length || 0; // count services inside system
      });

      setStats({
        totalSystems: totalSystems,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* 🔹 Left Content (Title Section) */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-wide text-white leading-tight">
            Central Server Health Dashboard
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto lg:mx-0">
            Monitor and manage system infrastructure in real time
          </p>
        </div>

        {/* 🔹 Right Section (Stats + Buttons) */}
        <div className="flex flex-col items-center lg:items-end gap-5 w-full lg:w-auto">
          {/* 📊 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Total System */}
            <div
              className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 
          border border-slate-700 shadow-lg backdrop-blur-md text-center"
            >
              <p className="text-[10px] sm:text-xs text-gray-400">
                Total System
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {loading ? "..." : stats.totalSystems}
              </p>
            </div>

            {/* Total Servers */}
            <div
              className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 
          border border-slate-700 shadow-lg backdrop-blur-md text-center"
            >
              <p className="text-[10px] sm:text-xs text-gray-400">
                Total Servers
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {loading ? "..." : stats.total}
              </p>
            </div>

            {/* Healthy */}
            <div
              className="bg-gradient-to-br from-green-900/20 to-[#0f172a] 
          rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 
          border border-green-500/20 shadow-lg backdrop-blur-md text-center"
            >
              <p className="text-[10px] sm:text-xs text-gray-400">Healthy</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400 mt-1">
                {loading ? "..." : stats.healthy}
              </p>
            </div>

            {/* Unhealthy */}
            <div
              className="bg-gradient-to-br from-red-900/20 to-[#0f172a] 
          rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 
          border border-red-500/20 shadow-lg backdrop-blur-md text-center"
            >
              <p className="text-[10px] sm:text-xs text-gray-400">Unhealthy</p>
              <p className="text-xl sm:text-2xl font-bold text-red-400 mt-1">
                {loading ? "..." : stats.unhealthy}
              </p>
            </div>
          </div>

          {/* 🎯 Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/add-system")}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl 
            bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700 
            transition font-medium shadow-lg shadow-blue-900/30 text-sm sm:text-base"
            >
              + Add System
            </button>

            <button
              onClick={() => navigate("/add-server")}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl 
            bg-gradient-to-r from-emerald-600 to-green-600 
            hover:from-emerald-700 hover:to-green-700 
            transition font-medium shadow-lg shadow-emerald-900/30 text-sm sm:text-base"
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
