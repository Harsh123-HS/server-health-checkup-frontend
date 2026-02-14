import React, { useEffect, useState } from "react";
import {
  FiTrash2,
  FiServer,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE =
  "https://unsensational-unthickly-alonzo.ngrok-free.dev/api";

function ManageSystems() {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 FETCH SYSTEMS + SERVICES (CORRECT FOR YOUR RESPONSE)
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [systemsRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE}/systems`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }),
        fetch(`${API_BASE}/services`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }),
      ]);

      if (!systemsRes.ok || !servicesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const systemsJson = await systemsRes.json();
      const servicesJson = await servicesRes.json();

      const systemsList = systemsJson.systems || [];
      const servicesList = servicesJson.services || [];

      // 🧠 MERGE USING system._id (VERY IMPORTANT)
      const mergedSystems = systemsList.map((system) => ({
        ...system,
        services: servicesList.filter(
          (service) => service.system?._id === system._id
        ),
      }));

      setSystems(mergedSystems);

      // Open all dropdowns by default
      const defaultExpanded = {};
      mergedSystems.forEach((sys) => {
        defaultExpanded[sys._id] = true;
      });
      setExpanded(defaultExpanded);
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Failed to load systems & services");
    } finally {
      setLoading(false);
    }
  };

  // 🔽 FIXED DROPDOWN (using _id instead of name)
  const toggleExpand = (systemId) => {
    setExpanded((prev) => ({
      ...prev,
      [systemId]: !prev[systemId],
    }));
  };

  // 🔴 DELETE SYSTEM (USING _id)
  const handleDeleteSystem = async (systemId, systemName) => {
    const confirmDelete = window.confirm(
      `Delete system "${systemName}" and all its services?`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(`system-${systemId}`);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/systems/${systemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete system");
      }

      // Optimistic UI update (professional UX)
      setSystems((prev) =>
        prev.filter((sys) => sys._id !== systemId)
      );
    } catch (error) {
      console.error("Delete System Error:", error);
      alert("Failed to delete system");
    } finally {
      setDeleting(null);
    }
  };

  // 🔴 DELETE SERVICE (USING _id)
  const handleDeleteService = async (serviceId, serviceName) => {
    const confirmDelete = window.confirm(
      `Delete service "${serviceName}"?`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(`service-${serviceId}`);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete service");
      }

      // Remove only that service (no full refetch needed)
      setSystems((prev) =>
        prev.map((sys) => ({
          ...sys,
          services: sys.services.filter(
            (srv) => srv._id !== serviceId
          ),
        }))
      );
    } catch (error) {
      console.error("Delete Service Error:", error);
      alert("Failed to delete service");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#020617] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-wide">
            Manage Systems & Services
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-gray-400 text-lg">
            Loading systems...
          </div>
        ) : systems.length === 0 ? (
          <div className="text-gray-400 text-lg">
            No systems found
          </div>
        ) : (
          <div className="space-y-6">
            {systems.map((system) => {
              const isOpen = expanded[system._id];

              return (
                <div
                  key={system._id}
                  className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* System Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <FiServer className="text-blue-400 text-xl" />
                      <div>
                        <h2 className="text-lg font-semibold capitalize">
                          {system.name}
                        </h2>
                        <p className="text-xs text-gray-400">
                          {system.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Services: {system.services?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(system._id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                      >
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                      </button>

                      {/* Delete System */}
                      <button
                        disabled={deleting === `system-${system._id}`}
                        onClick={() =>
                          handleDeleteSystem(system._id, system.name)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50"
                      >
                        <FiTrash2 />
                        {deleting === `system-${system._id}`
                          ? "Deleting..."
                          : "Delete System"}
                      </button>
                    </div>
                  </div>

                  {/* Services List */}
                  {isOpen && (
                    <div className="divide-y divide-slate-800">
                      {system.services?.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-[#020617] transition"
                        >
                          <div>
                            <p className="font-medium">
                              {service.name}
                            </p>
                            <p className="text-xs text-gray-400 break-all">
                              {service.healthUrl}
                            </p>
                          </div>

                          <button
                            disabled={
                              deleting === `service-${service._id}`
                            }
                            onClick={() =>
                              handleDeleteService(
                                service._id,
                                service.name
                              )
                            }
                            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50"
                          >
                            <FiTrash2 />
                            {deleting === `service-${service._id}`
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSystems;
