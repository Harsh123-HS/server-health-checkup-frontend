import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import {
  FiChevronDown,
  FiChevronRight,
  FiServer,
} from "react-icons/fi";

import BASE_URL from "../BaseUrl";

import { useNavigate } from "react-router-dom";

function ServerTable({ searchTerm = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSystems, setExpandedSystems] = useState({});
  const [viewUrl, setViewUrl] = useState(null); // 🔹 Modal state
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);

  const refreshData = async () => {
    setTimeLeft(30);
    await fetchHealthData();
  };

  const handleGlobalRefresh = () => {
    refreshData();

    // 2️⃣ Notify other pages/components
    localStorage.setItem("globalRefresh", Date.now().toString());
  };
  useEffect(() => {
    // Initial load
    refreshData();

    const handleStorageChange = (event) => {
      if (event.key === "globalRefresh") {
        refreshData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 0) {
          refreshData(); // 🔥 guaranteed trigger at 0
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdown);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchHealthData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/health`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
      });

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
      const services = system.services || []; // 🔥 safety fix

      const filteredServices = services.filter(
        (service) =>
          service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          system.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      // If searching → show system even if no services
      if (searchTerm) {
        if (
          system.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          filteredServices.length > 0
        ) {
          return {
            ...system,
            services: filteredServices, // may be empty but system still visible
          };
        }
        return null;
      }

      // 🔥 ALWAYS return system (even if services = [])
      return {
        ...system,
        services: services,
      };
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
      {/* 🔷 Header (Responsive) */}
      <div
        className="px-4 sm:px-6 py-4 border-b border-slate-800 
    flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">
          System Health Overview
        </h2>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={handleGlobalRefresh}
            className="flex items-center justify-center px-4 sm:px-6 py-2 
          rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 
          hover:from-emerald-700 hover:to-green-700 
          transition font-medium shadow-lg shadow-emerald-900/30 text-white"
          >
            <FiRefreshCw size={16} />
          </button>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            Auto refresh in:
            <span className="text-cyan-400 font-semibold ml-1">
              {timeLeft}s
            </span>
          </span>
        </div>
      </div>

      {/* 🔥 Scroll Container (Critical for Mobile) */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-gray-300">
          {/* Table Head */}
          <thead className="bg-[#020617] text-gray-400 uppercase text-xs border-b border-slate-800">
            <tr>
              {/* Give more space to service */}
              <th className="px-4 sm:px-6 py-4 text-left w-[55%]">Service</th>

              {/* Always visible */}
              <th className="px-2 sm:px-6 py-4 text-left w-[20%]">Status</th>

              {/* Hide on mobile */}
              <th className="px-6 py-4 text-left hidden md:table-cell w-[15%]">
                Last Checked
              </th>

              {/* Hide on mobile */}
              <th className="px-6 py-4 text-left hidden md:table-cell w-[10%]">
                Response Time
              </th>

              {/* ALWAYS keep visible on mobile */}
              <th className="px-2 sm:px-6 py-4 text-center md:text-right w-[15%]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredSystems?.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No systems or services found
                </td>
              </tr>
            )}

            {filteredSystems?.map((system, sysIndex) => {
              const isExpanded = expandedSystems[system.name];

              return (
                <React.Fragment key={system.name}>
                  {/* 🔷 SYSTEM ROW */}
                  <tr className="bg-[#020617] border-b border-slate-800">
                    {/* Service Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-cyan-400">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => toggleSystem(system.name)}
                          className="text-cyan-400 hover:text-white transition mt-1 sm:mt-0"
                        >
                          {isExpanded ? (
                            <FiChevronDown size={18} />
                          ) : (
                            <FiChevronRight size={18} />
                          )}
                        </button>

                        <FiServer
                          className="text-cyan-400 shrink-0"
                          size={18}
                        />

                        <div className="flex flex-col">
                          <span className="uppercase tracking-wide text-sm sm:text-base break-words">
                            {system.name}
                          </span>
                          <span className="text-[11px] sm:text-xs text-gray-500">
                            (Up: {system.summary?.up} | Down:{" "}
                            {system.summary?.down})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Empty columns to preserve layout */}
                    <td></td>
                    <td className="hidden md:table-cell"></td>
                    <td className="hidden md:table-cell"></td>
                    <td></td>
                  </tr>

                  {/* 🔷 SERVICES */}
                  {/* 🔷 SERVICES */}
                  {isExpanded &&
                    system.services?.length > 0 &&
                    system.services.map((service, srvIndex) => (
                      <tr
                        key={service.url || `${system.name}-${srvIndex}`}
                        className="border-b border-slate-900 hover:bg-[#0f172a] transition"
                      >
                        {/* Service Name */}
                        <td className="px-3 sm:px-14 py-2 sm:py-4 text-gray-200 font-medium text-sm break-words">
                          {service.name}
                        </td>

                        {/* Status */}
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                              service.status === "up"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {service.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Hidden on Mobile */}
                        <td className="px-6 py-4 text-gray-400 whitespace-nowrap hidden md:table-cell">
                          {formatTime(service.checkedAt)}
                        </td>

                        <td className="px-6 py-4 font-medium hidden md:table-cell">
                          {service.responseTimeMs !== null
                            ? `${service.responseTimeMs} ms`
                            : "N/A"}
                        </td>

                        {/* View Button */}
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center md:text-right">
                          <button
                            onClick={() =>
                              navigate("/service-details", {
                                state: { url: service.url },
                              })
                            }
                            className="px-3 py-1.5 text-[11px] sm:text-xs rounded-lg 
          bg-blue-600 hover:bg-blue-700 transition font-medium whitespace-nowrap"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                  {/* 🔥 SHOW THIS IF NO SERVICES */}
                  {isExpanded &&
                    (!system.services || system.services.length === 0) && (
                      <tr className="border-b border-slate-900">
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-gray-500 text-sm italic"
                        >
                          No servers/services added for this system
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServerTable;
