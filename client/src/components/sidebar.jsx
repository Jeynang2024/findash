import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl">☰</button>
      
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transition-transform duration-300 z-50 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 font-bold text-xl border-b border-gray-700">Crypto Dashboard</div>
        <nav className="flex flex-col gap-4 p-6">
          <Link to="/dashboard" className="hover:text-cyan-400">📊 Dashboard</Link>
          <Link to="/users" className="hover:text-cyan-400">👥 Users</Link>
          <Link to="/settings" className="hover:text-cyan-400">⚙️ Settings</Link>
          <Link to="/logout" className="hover:text-red-400">🚪 Logout</Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
