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

    // 🔄 Auto refresh every 30 sec (real monitoring behavior)
    const interval = setInterval(() => {
      fetchHealthSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchHealthSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://sz02nvjz-3000.inc1.devtunnels.ms/api/health",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔐 backend auth
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch health summary");
      }

      const data = await res.json();
      console.log("Health Summary:", data);

      // 🔥 Calculate total servers from systems -> services
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
    <div className="bg-[#0f172a] text-white border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-28 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left Content */}
        <div>
          <h1 className="text-2xl lg:text-4xl font-semibold tracking-wide">
            Central Server Health Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitor and manage system infrastructure in real time
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col sm:flex-row items-end sm:items-end gap-6">

          {/* Dynamic Stats */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Total Servers */}
            <div className="bg-[#1e293b] rounded-xl px-5 py-3 border border-slate-600">
              <p className="text-xs text-gray-400">Total Servers</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? "..." : stats.total}
              </p>
            </div>

            {/* Healthy */}
            <div className="bg-[#1e293b] rounded-xl px-5 py-3 border border-green-500/20">
              <p className="text-xs text-gray-400">Healthy</p>
              <p className="text-xl font-semibold text-green-400 mt-1">
                {loading ? "..." : stats.healthy}
              </p>
            </div>

            {/* Unhealthy */}
            <div className="bg-[#1e293b] rounded-xl px-5 py-3 border border-red-500/20">
              <p className="text-xs text-gray-400">Unhealthy</p>
              <p className="text-xl font-semibold text-red-400 mt-1">
                {loading ? "..." : stats.unhealthy}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-3 justify-end mr-36 mb-4">
        <button
          onClick={() => navigate("/add-system")}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium shadow-md"
        >
          + Add System
        </button>

        <button
          onClick={() => navigate("/add-server")}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-medium shadow-md"
        >
          + Add Server
        </button>
      </div>
    </div>
  );
}

export default StatusBadge;
