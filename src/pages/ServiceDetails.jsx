import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";



function ServiceDetails() {
  const navigate = useNavigate();
  const location = useLocation();
const serviceUrl = location.state?.url;


  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  if (!serviceUrl) {
    setError("No service URL provided. Please open from dashboard.");
    setLoading(false);
    return;
  }

  fetchServiceHealth();

  const interval = setInterval(() => {
    fetchServiceHealth();
  }, 30000);

  return () => clearInterval(interval);
}, [serviceUrl]);


  const fetchServiceHealth = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(serviceUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
        },
      });

      if (!res.ok) throw new Error(`Service not reachable (${res.status})`);

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0b0f14] to-[#020617] text-white font-sora">
  
  {/* Responsive Container */}
  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">

    {/* 🔷 HEADER (Mobile Optimized) */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
        >
          <FiArrowLeft className="text-base sm:text-lg" />
          <span className="font-medium tracking-wide">
            Back
          </span>
        </button>

        <div className="hidden sm:block h-6 w-px bg-slate-700" />

        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide leading-tight">
          Service Health Monitor
        </h1>
      </div>

       
      </div>

      {/* 🔹 STATES */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-pulse text-sm tracking-wide">
            Fetching Service Metrics...
          </div>
        </div>
      )}

      {/* 🔷 MAIN CONTENT */}
      {data && (
        <>
          {/* 🔥 HERO STATUS (FULL WIDTH) */}
          <HeroStatus data={data} />

          {/* 📊 ROW 2 — METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <MiniCard
              label="CPU User"
              value={data.system.cpu.user}
              label2="CPU System"
              value2={data.system.cpu.system}
            />

            <MiniCard
              label="Free Memory"
              value={data.system.freeMemory}
              label2="Total Memory"
              value2={data.system.totalMemory}
            />

            <MiniCard
              label="Load Average"
              value={data.system.loadAverage.join(", ")}
              label2="Uptime"
              value2={data.uptime}
            />
          </div>

          {/* 🧠 ROW 3 — SYSTEM PANELS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* MEMORY PANEL */}
            <div className="bg-[#020617]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs text-gray-400 mb-5 uppercase tracking-[0.2em] font-medium">
                Memory Overview
              </h3>

              <div className="space-y-4">
                <Metric label="RSS" value={data.system.memory.rss} />
                <Metric label="Heap Used" value={data.system.memory.heapUsed} />
                <Metric label="Heap Total" value={data.system.memory.heapTotal} />
                <Metric label="External" value={data.system.memory.external} />
              </div>
            </div>

            {/* SYSTEM PANEL */}
            <div className="bg-[#020617]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs text-gray-400 mb-5 uppercase tracking-[0.2em] font-medium">
                System Overview
              </h3>

              <div className="space-y-4">
                <Metric label="Platform" value={data.system.platform} />
                <Metric label="Node Version" value={data.system.nodeVersion} />
                <Metric label="PID" value={data.system.pid} />
                <Metric label="System Uptime" value={data.system.uptime} />
                <Metric label="Environment" value={data.environment} />
                <Metric label="Version" value={data.version} />
                <Metric
                  label="Timestamp"
                  value={new Date(data.timestamp).toLocaleString()}
                />
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  </div>
);

}

export default ServiceDetails;

/* ================= HERO STATUS ================= */

const HeroStatus = ({ data }) => {
  const isHealthy =
    data.success === true ||
    data.status === "OK" ||
    data.status === "UP";

  return (
    <div
      className={`relative rounded-2xl p-6 sm:p-8 mb-8 border backdrop-blur-xl overflow-hidden shadow-xl ${
        isHealthy
          ? "border-emerald-500/20"
          : "border-red-500/20"
      }`}
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 opacity-10 blur-3xl ${
          isHealthy ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
            Service Status
          </p>
<h2
  className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide ${
    isHealthy ? "text-emerald-400" : "text-red-400"
  }`}
>
  {isHealthy ? "HEALTHY" : "UNHEALTHY"}
</h2>

<p className="text-gray-400 mt-2 text-xs sm:text-sm max-w-md leading-relaxed">
  {data.message || "Monitoring service health in real-time"}
</p>

        </div>

        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full animate-pulse ${
              isHealthy ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <span className="text-xs text-gray-400 tracking-wide">
            Live Status
          </span>
        </div>
      </div>
    </div>
  );
};

/* ================= METRIC ================= */

const Metric = ({ label, value }) => (
  <div className="flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
    <span className="text-gray-500 whitespace-nowrap">
      {label}
    </span>
    <span className="font-medium text-right break-words">
      {value ?? "—"}
    </span>
  </div>
);


const MiniCard = ({ label, value, label2, value2 }) => (
  <div className="bg-[#020617]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
    
    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
      {label}
    </p>

    <p className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide break-words">
      {value ?? "—"}
    </p>

    <p className="text-[10px] sm:text-xs mt-3 sm:mt-4 text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
      {label2}
    </p>

    <p className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide break-words">
      {value2 ?? "—"}
    </p>
  </div>
);

