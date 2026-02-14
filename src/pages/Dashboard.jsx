import React, { useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import ServerTable from "../components/ServerTable";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* 🔹 Premium Navbar */}
      <Navbar onSearch={setSearchTerm} />

      {/* 🔹 Main Content Container (Fixes spacing issue) */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatusBadge />
        <ServerTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}

export default Dashboard;
