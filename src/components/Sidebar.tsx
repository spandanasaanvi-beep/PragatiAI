import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Route, Globe, Upload, Sparkles, ClipboardCheck,
  FileBarChart, Award, Info, Mail, Menu, X, LogOut, Pencil,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProfileEditModal from './ProfileEditModal';

const LEARNER_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/competency-gaps', label: 'Competency & Skill Gaps', icon: ClipboardCheck },
  { to: '/learning-path', label: 'Learning Path', icon: Route },
  { to: '/igot', label: 'iGOT Karmayogi', icon: Globe },
  { to: '/upload', label: 'Upload Learning Material', icon: Upload },
  { to: '/quiz', label: 'Quiz / MCQs', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/certificate', label: 'Certificate', icon: Award },
];

const EXTRA_NAV_ITEMS = [
  { to: '/about', label: 'About Us', icon: Info },
  { to: '/contact', label: 'Contact Team', icon: Mail },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state, logout } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const user = state.user;
  const navItems = [...LEARNER_NAV_ITEMS, ...EXTRA_NAV_ITEMS];
  const isActive = (to: string) => location.pathname === to;

  const content = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <ChakraMark />
          </span>
          <span>
            <span className="block text-xl font-extrabold tracking-tight text-white leading-none">
              Pragati<span className="text-accent-300">AI</span>
            </span>
            <span className="block text-[10px] text-primary-200 leading-tight mt-1">
              For iGOT Karmayogi
            </span>
          </span>
        </Link>
      </div>

      {/* Profile card */}
      {user && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-primary-200 truncate">
                {user.role || 'Role pending'}
              </p>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              title="Edit profile"
              className="p-1.5 rounded-md hover:bg-white/10 text-primary-200 hover:text-white transition-colors"
            >
              <Pencil size={14} />
            </button>
          </div>
          <dl className="mt-3 space-y-1 text-[11px] text-primary-100">
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-primary-300">Age / DOB</dt><dd className="truncate">{user.age ? `${user.age} yrs` : '—'} · {user.dateOfBirth || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-primary-300">Qualification</dt><dd className="truncate">{user.qualification || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-primary-300">Organization</dt><dd className="truncate">{user.organization || '—'}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-primary-300">Experience</dt><dd className="truncate">{user.experienceYears}y {user.experienceMonths}m</dd></div>
          </dl>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3">
        <ul className="px-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-white text-primary-800 shadow-sm'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-[10px] text-primary-300 leading-relaxed mb-3">
          Prototype · Demo data only — not connected to a live iGOT API.
        </p>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
        >
          <LogOut size={15} /> Logout & Reset
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3.5 left-4 z-50 lg:hidden p-2 rounded-md bg-primary-800 text-white shadow-md"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 bg-primary-800 shadow-sidebar z-40">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-primary-800 shadow-sidebar transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            className="absolute top-4 right-4 p-1.5 text-primary-200 hover:text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
          {content}
        </aside>
      </div>

      {editOpen && user && <ProfileEditModal onClose={() => setEditOpen(false)} />}
    </>
  );
};

/** Ashoka-chakra style brand mark */
export const ChakraMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="16" r="15" fill="#173496" />
    <circle cx="16" cy="16" r="5.5" fill="none" stroke="#fff" strokeWidth="1.6" />
    <circle cx="16" cy="16" r="1.6" fill="#fff" />
    <g stroke="#fff" strokeWidth="1.4">
      <line x1="16" y1="2" x2="16" y2="10.5" />
      <line x1="16" y1="21.5" x2="16" y2="30" />
      <line x1="2" y1="16" x2="10.5" y2="16" />
      <line x1="21.5" y1="16" x2="30" y2="16" />
      <line x1="6.1" y1="6.1" x2="12" y2="12" />
      <line x1="20" y1="20" x2="25.9" y2="25.9" />
      <line x1="25.9" y1="6.1" x2="20" y2="12" />
      <line x1="12" y1="20" x2="6.1" y2="25.9" />
    </g>
  </svg>
);

export default Sidebar;
