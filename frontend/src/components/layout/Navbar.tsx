import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Check, Shield, User, HelpCircle, Clock, Sparkles, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatTimeAgo, getInitials } from '../../lib/utils';
import { CommandPalette } from '../common/CommandPalette';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const qc = useQueryClient();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const { data } = await api.get('/notifications'); return data; },
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.meta?.unread || 0;

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
    return { label, href };
  });

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-30 shadow-xs">
        {/* Breadcrumbs */}
        <nav className="flex-1 flex items-center gap-1.5 text-sm overflow-hidden">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">Home</Link>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.href}>
              <span className="text-slate-300">/</span>
              <Link
                to={b.href}
                className={i === breadcrumbs.length - 1 ? 'text-slate-800 font-semibold truncate' : 'text-slate-400 hover:text-slate-600 transition-colors truncate'}
              >
                {b.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* Live Clock Display */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-full text-xs font-semibold text-slate-600">
          <Clock size={13} className="text-blue-600" />
          <span>{liveTime || 'THU 10:45 AM'}</span>
        </div>

        {/* Search Command Palette Trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-500 transition-all cursor-pointer"
        >
          <Search size={14} className="text-slate-400" />
          <span className="hidden sm:inline">Search modules or press</span>
          <span className="flex items-center gap-0.5 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700 font-bold shadow-xs">
            <Command size={10} /> K
          </span>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markReadMutation.mutate('all')}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">No notifications</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && markReadMutation.mutate(n.id)}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{formatTimeAgo(n.createdAt)}</span>
                          </div>
                          {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                {getInitials(user?.name || '')}
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-sm"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    <span className="badge-info text-[10px] mt-1 inline-block">{user?.role}</span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Shield size={15} /> Workspace Settings
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
};
