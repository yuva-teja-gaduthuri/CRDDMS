// components/TopBar.jsx
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-4 shadow-sm z-20 flex-shrink-0">
      {/* Menu toggle */}
      <button onClick={onMenuClick} className="btn-icon">
        <Menu size={20} />
      </button>

      {/* Institution name */}
      <div className="hidden md:block">
        <span className="text-primary font-semibold text-sm">
          College Records Digitalization & Document Management System
        </span>
      </div>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="btn-icon relative"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-card-hover border border-slate-100 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate">Notifications</p>
              </div>
              <div className="px-4 py-3 text-sm text-slate/60">
                3 documents pending approval
              </div>
              <div className="px-4 py-3 text-sm text-slate/60 border-t border-slate-50">
                OCR processing completed for 2 files
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate leading-tight">{user?.name}</p>
            <p className="text-xs text-slate/50 capitalize">{user?.role?.replace('_',' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
