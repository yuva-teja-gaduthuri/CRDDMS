// layouts/MainLayout.jsx
// Shared shell: sidebar on left, topbar on top, page content in the rest.

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar  from '../components/TopBar';
import { useState } from 'react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-bgpage">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-screen-xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
