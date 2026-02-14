import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { FiServer } from "react-icons/fi";

function Navbar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔐 Clear auth token
    localStorage.removeItem("token");

    // Redirect to login
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value); // send search text to dashboard
    }
  };

  return (
    <div className="w-full bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* 🔹 Left: Logo + Brand */}
        <div className="flex items-center gap-3 ">
          <img src="src/assets/whitelogo.png" alt="" className="w-28 h-9"/>
          <h1 className="text-xl font-semibold text-white tracking-wide">
            ServerMonitor
          </h1>
        </div>

        {/* 🔹 Center: Search Bar */}
        <div className="hidden md:flex items-center bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 w-96">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search system or server..."
            value={query}
            onChange={handleSearchChange}
            className="bg-transparent outline-none text-gray-200 w-full placeholder-gray-500"
          />
        </div>

        {/* 🔹 Right: Nav + Profile */}
        <div className="flex items-center gap-6 relative">
          
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive
                  ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                  : "text-gray-300 hover:text-white"
              }`
            }
          >
            Dashboard
          </NavLink>

         

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-full hover:border-cyan-500 transition"
            >
              <FaUserCircle className="text-cyan-400 text-xl" />
              <span className="text-sm text-gray-200">Admin</span>
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-3 w-40 bg-[#020617] border border-slate-700 rounded-xl shadow-xl">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-[#0f172a] rounded-xl transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
               <button
  onClick={() => navigate("/manage-systems")}
  className="w-full flex items-center gap-3 px-2 py-3 text-white hover:bg-[#0f172a] rounded-xl transition"
>
  <FiServer className="text-lg" />
  Manage System
</button>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Navbar;
