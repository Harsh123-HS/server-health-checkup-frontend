import React, { useEffect, useState } from "react";

function ServerTable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSystems, setExpandedSystems] = useState({});

  useEffect(() => {
    fetchHealthData();

    const interval = setInterval(() => {
      fetchHealthData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const token = localStorage.getItem("token"); // 🔐 get token

      const res = await fetch(
        "https://sz02nvjz-3000.inc1.devtunnels.ms/api/health",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔥 IMPORTANT
          },
        }
      );

      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch health data");
      }

      const json = await res.json();
      console.log("Health API Response:", json); // Debug

      setData(json);

      // Keep already toggled systems state (do not reset every refresh)
      setExpandedSystems((prev) => {
        const updated = { ...prev };

        json.systems?.forEach((system) => {
          // If system not in state, default = open
          if (updated[system.name] === undefined) {
            updated[system.name] = true;
          }
        });

        return updated;
      });

      setError("");
    } catch (err) {
      console.error("Health Fetch Error:", err);
      setError("Unable to fetch server health data. Check API or token.");
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

  const formatTime = (isoTime) => {
    if (!isoTime) return "N/A";
    return new Date(isoTime).toLocaleString();
  };

  if (loading) {
    return <div className="p-6 text-gray-300">Loading systems...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="bg-[#0f172a] border border-slate-700 shadow-xl  overflow-hidden ">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs uppercase bg-[#020617] text-gray-400 border-b border-slate-700">
          <tr>
            <th className="px-6 py-3">System / Server Name</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Last Checked</th>
            <th className="px-6 py-3">Response Time (ms)</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {data?.systems?.map((system, sysIndex) => {
            const isExpanded = expandedSystems[system.name];

            return (
              <React.Fragment key={sysIndex}>
                {/* 🔷 System Header Row */}
                <tr className="bg-[#020617] border-b border-slate-800">
                  <td
                    colSpan="5"
                    className="px-6 py-3 font-semibold text-blue-400 text-sm tracking-wide uppercase"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {system.name}
                        <span className="ml-3 text-xs text-gray-400">
                          (Up: {system.summary?.up} | Down: {system.summary?.down})
                        </span>
                      </span>

                      {/* Hide / Show Button */}
                      <button
                        onClick={() => toggleSystem(system.name)}
                        className="text-xs px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600 transition text-gray-200"
                      >
                        {isExpanded ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* 🔹 Nested Services */}
                {isExpanded &&
                  system.services?.map((service, srvIndex) => (
                    <tr
                      key={srvIndex}
                      className="border-b border-slate-800 hover:bg-[#1e293b] transition"
                    >
                      <td className="px-6 py-3 pl-12">
                        {service.name}
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            service.status === "up"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {service.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-gray-400">
                        {formatTime(service.checkedAt)}
                      </td>

                      <td className="px-6 py-3">
                        {service.responseTimeMs !== null
                          ? `${service.responseTimeMs} ms`
                          : "N/A"}
                      </td>

                      <td className="px-6 py-3 text-sm text-blue-400">
                        View
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
