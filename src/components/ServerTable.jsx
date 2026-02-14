import React, { useEffect, useState } from "react";
import { SiReact } from "react-icons/si";
import {
  FiChevronDown,
  FiChevronRight,
  FiServer,
  FiLink,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

function ServerTable({ searchTerm = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSystems, setExpandedSystems] = useState({});
  const [viewUrl, setViewUrl] = useState(null); // 🔹 Modal state
  const navigate = useNavigate();

  useEffect(() => {
  fetchHealthData();

  // 🔄 Auto refresh every 30 seconds (real monitoring)
  const interval = setInterval(() => {
    fetchHealthData();
  }, 30000);

  return () => clearInterval(interval);
}, []);


  const fetchHealthData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://unsensational-unthickly-alonzo.ngrok-free.dev/api/health",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const json = await res.json();
      setData(json);

      // Default all systems expanded
      const defaultExpanded = {};
      json.systems?.forEach((system) => {
        defaultExpanded[system.name] = true;
      });
      setExpandedSystems(defaultExpanded);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch server health data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSystem = (systemName) => {
    setExpandedSystems((prev) => ({
      ...prev,
      [systemName]: !prev[systemName],
    }));
  };

  const formatTime = (iso) => {
  if (!iso) return "N/A";

  const date = new Date(iso);

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit", // 🔥 THIS IS THE KEY
    hour12: true,
  });
};


  // 🔥 SMART FILTER LOGIC
  const filteredSystems = data?.systems
    ?.map((system) => {
      const filteredServices = system.services?.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          system.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      if (searchTerm) {
        if (
          system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          filteredServices.length > 0
        ) {
          return { ...system, services: filteredServices };
        }
        return null;
      }

      return system;
    })
    .filter(Boolean);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading systems...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="bg-[#020617] border border-slate-800 rounded-2xl shadow-2xl mt-6 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white tracking-wide">
          System Health Overview
        </h2>
        <span className="text-xs text-gray-500">Live Monitoring Table</span>
      </div>

      <table className="w-full text-sm text-gray-300 ">
        <thead className="bg-[#020617] text-gray-400 uppercase text-xs border-b border-slate-800">
          <tr>
            <th className="px-6 py-4 text-left w-[40%]">Service</th>
            <th className="px-6 py-4 text-left w-[15%]">Status</th>
            <th className="px-6 py-4 text-left w-[25%]">Last Checked</th>
            <th className="px-6 py-4 text-left w-[10%]">Response Time</th>
            <th className="px-6 py-4 text-right w-[10%]">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredSystems?.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-12 text-gray-500">
                No systems or services found
              </td>
            </tr>
          )}

          {filteredSystems?.map((system, sysIndex) => {
            const isExpanded = expandedSystems[system.name];

            return (
              <React.Fragment key={sysIndex}>
                {/* 🔷 SYSTEM ROW (ALIGNED - NO COLSPAN BREAK) */}
                <tr className="bg-[#020617] border-b border-slate-800">
                  {/* Service Column */}
                  <td className="px-6 py-4 font-semibold text-cyan-400">
                    <div className="flex items-center gap-3">
                      {/* Chevron Toggle (Professional UX) */}
                      <button
                        onClick={() => toggleSystem(system.name)}
                        className="text-cyan-400 hover:text-white transition"
                      >
                        {isExpanded ? (
                          <FiChevronDown size={18} />
                        ) : (
                          <FiChevronRight size={18} />
                        )}
                      </button>

                      {/* System Icon (Better than React logo) */}
                      <FiServer className="text-cyan-400" size={18} />

                      <span className="uppercase tracking-wide">
                        {system.name}
                      </span>

                      <span className="text-xs text-gray-500 ml-2">
                        (Up: {system.summary?.up} | Down: {system.summary?.down}
                        )
                      </span>
                    </div>
                  </td>

                  {/* Empty columns to maintain alignment */}
                  <td></td>
                  <td></td>
                  <td></td>

                  {/* Action Column */}
                  <td className="px-6 py-4 text-right">
                    
                  </td>
                </tr>

                {/* 🔹 SERVICES ROWS (Perfectly aligned now) */}
                {isExpanded &&
                  system.services?.map((service, srvIndex) => (
                    <tr
                      key={srvIndex}
                      className="border-b border-slate-900 hover:bg-[#0f172a] transition"
                    >
                      {/* Service Name (Indented properly) */}
                      <td className="px-14 py-4 text-gray-200 font-medium">
                        {service.name}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            service.status === "up"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {service.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Last Checked */}
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {formatTime(service.checkedAt)}
                      </td>

                      {/* Response Time */}
                      <td className="px-6 py-4 font-medium">
                        {service.responseTimeMs !== null
                          ? `${service.responseTimeMs} ms`
                          : "N/A"}
                      </td>

                      {/* View Button with Icon */}
                      <td className="px-6 py-4 text-right">
                       <button
onClick={() =>
  navigate(`/service-details?url=${encodeURIComponent(service.url)}`)
}

  className="px-3 py-1.5 text-xs rounded-lg 
  bg-blue-600 hover:bg-blue-700 transition font-medium"
>
  View
</button>

                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      
    </div>
  );
}

export default ServerTable;
