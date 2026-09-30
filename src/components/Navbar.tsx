import React, { useState, useEffect } from 'react';
import {
  Car,
  LayoutDashboard,
  LogIn,
  LogOut,
  Calendar,
  Zap,
  History,
  BarChart3,
  Settings,
  Bell,
  Sun,
  Moon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SystemNotification, UserSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  notifications: SystemNotification[];
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  notifications,
  darkMode,
  setDarkMode,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard & Map', icon: LayoutDashboard },
    { id: 'entry', label: 'Vehicle Entry', icon: LogIn },
    { id: 'exit', label: 'Vehicle Exit', icon: LogOut },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'ev', label: 'EV Station', icon: Zap },
    { id: 'history', label: 'History & Search', icon: History },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin Panel', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                Smart Parking System
              </span>
            </div>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center space-x-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' • '}
                <strong className="text-blue-300">{currentTime.toLocaleTimeString('en-IN')}</strong>
              </span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-semibold text-xs text-slate-200 uppercase tracking-wider">System Alerts</span>
                    <span className="text-[11px] text-blue-400">{notifications.length} events</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                    {notifications.map(n => (
                      <div key={n.id} className="py-2 px-1 text-xs">
                        <div className="flex items-center space-x-1.5 font-medium text-slate-200">
                          {n.type === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.created_at}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>

            {/* Active User Pill & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
                {currentUser.role === 'admin' ? 'AD' : 'ST'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-medium text-slate-200 truncate max-w-[130px]">{currentUser.full_name}</div>
                <div className="text-[10px] text-blue-400 font-mono flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 inline" />
                  <span>{currentUser.role.toUpperCase()}</span>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm ml-1"
                  title="Sign out / Switch account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 min-w-max">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-950 rounded uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
