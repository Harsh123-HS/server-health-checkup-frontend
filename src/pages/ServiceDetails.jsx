import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

function ServiceDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceUrl = searchParams.get("url");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  if (!serviceUrl) {
    setError("No service URL provided");
    setLoading(false);
    return;
  }

  fetchServiceHealth();

  const interval = setInterval(() => {
    fetchServiceHealth();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [serviceUrl]);


  const fetchServiceHealth = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(serviceUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
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
    <div className="min-h-screen bg-[#0b0f14] text-white px-8 py-6">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <FiArrowLeft className="text-lg" />
          <span className="text-sm font-medium">
            Back to Dashboard
          </span>
        </button>

        <div className="h-6 w-px bg-slate-700" />

        <h1 className="text-2xl font-semibold tracking-wide">
          Service Health Monitor
        </h1>
      </div>

      {error && <div className="text-red-400">{error}</div>}
      {loading && <div>Loading...</div>}

      {data && (
        <>
          {/* ROW 1 → HERO FULL WIDTH */}
          <HeroStatus data={data} />

          {/* ROW 2 → CPU FULL WIDTH */}
          {/* ROW 2 → CPU CARDS */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <MiniCard
    label="CPU User"
    value={data.system.cpu.user}
  />

  <MiniCard
    label="CPU System"
    value={data.system.cpu.system}
  />

  <MiniCard
    label="Load Average"
    value={data.system.loadAverage.join(", ")}
  />

</div>


          {/* ROW 3 → MEMORY (LEFT) + SYSTEM (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT → MEMORY */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">
                Memory Overview
              </h3>

              <div className="space-y-3">
                <Metric label="RSS" value={data.system.memory.rss} />
                <Metric label="Heap Used" value={data.system.memory.heapUsed} />
                <Metric label="Heap Total" value={data.system.memory.heapTotal} />
                <Metric label="External" value={data.system.memory.external} />
                <Metric label="Free Memory" value={data.system.freeMemory} />
                <Metric label="Total Memory" value={data.system.totalMemory} />
              </div>
            </div>

            {/* RIGHT → SYSTEM */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">
                System Overview
              </h3>

              <div className="space-y-3">
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
      className={`relative rounded-xl p-8 mb-8 border backdrop-blur-md overflow-hidden ${
        isHealthy
          ? "border-emerald-500/30"
          : "border-red-500/30"
      }`}
    >
      {/* Subtle Glow Background */}
      <div
        className={`absolute inset-0 opacity-20 blur-2xl ${
          isHealthy
            ? "bg-emerald-500"
            : "bg-red-500"
        }`}
      />

      <div className="relative flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400 mb-2">
            Service Status
          </p>

          <h2
            className={`text-4xl font-bold tracking-wide ${
              isHealthy
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {isHealthy ? "HEALTHY" : "UNHEALTHY"}
          </h2>

          <p className="text-gray-400 mt-3 text-sm">
            {data.message || "Monitoring service health in real-time"}
          </p>
        </div>

        {/* Animated Dot */}
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full animate-pulse ${
              isHealthy
                ? "bg-emerald-400"
                : "bg-red-400"
            }`}
          />
          
        </div>

      </div>
    </div>
  );
};

/* ================= METRIC ================= */

const Metric = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value ?? "—"}</span>
  </div>
);

const MiniCard = ({ label, value }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-2xl font-semibold">
      {value ?? "—"}
    </p>
  </div>
);
