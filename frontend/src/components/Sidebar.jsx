// components/Sidebar.jsx
// Navigation sidebar with all 13 page links and role-aware visibility.

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, Upload, Search, ScanText,
  ShieldCheck, CheckSquare, Archive, ScrollText, Users,
  BarChart3, UserCircle, LogOut, X, GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vault',      icon: FolderOpen,       label: 'Department Vault' },
  { to: '/upload',     icon: Upload,           label: 'Upload Document' },
  { to: '/search',     icon: Search,           label: 'Search Documents' },
  { to: '/compliance', icon: ShieldCheck,      label: 'Compliance Center' },
  { to: '/workflow',   icon: CheckSquare,      label: 'Approval Workflow' },
  { to: '/archive',    icon: Archive,          label: 'Archive Center' },
  { to: '/audit',      icon: ScrollText,       label: 'Audit Logs',  roles: ['admin','super_admin','compliance_reviewer'] },
  { to: '/users',      icon: Users,            label: 'User Management', roles: ['admin','super_admin'] },
  { to: '/reports',    icon: BarChart3,        label: 'Reports & Analytics' },
  { to: '/profile',    icon: UserCircle,       label: 'Profile Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col gradient-primary shadow-sidebar
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Institution branding */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="text-white" size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">CRDDMS</p>
            <p className="text-white/60 text-xs truncate">Document Management</p>
          </div>
          {/* Mobile close */}
          <button onClick={onClose} className="ml-auto lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-white/50 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-300 hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
