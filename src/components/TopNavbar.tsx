import React from 'react';
import { Menu, LogOut, KeyRound, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { CurrentUserSession } from '../types';

interface TopNavbarProps {
  currentSession: CurrentUserSession;
  onOpenLoginModal: () => void;
  onLogout?: () => void;
  onNavigateToLogin?: () => void;
  onToggleMobileMenu: () => void;
  onResetData: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentSession,
  onOpenLoginModal,
  onLogout,
  onNavigateToLogin,
  onToggleMobileMenu,
  onResetData,
}) => {
  const isSuperAdmin = currentSession.role === 'superadmin';

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 py-1">
      {/* Left: Mobile hamburger */}
      <button
        id="btn-open-sidebar-mobile"
        onClick={onToggleMobileMenu}
        className="lg:hidden p-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        title="Buka Menu"
      >
        <Menu className="w-4 h-4" />
        <span>Menu</span>
      </button>

      {/* Center/Left: Active Role & User Pill Indicator + Cloud Status */}
      <div className="flex items-center gap-2">
        <button
          id="btn-switch-account-role"
          onClick={onLogout || onNavigateToLogin || onOpenLoginModal}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            isSuperAdmin
              ? 'bg-white border-slate-200/90 text-slate-800 hover:bg-slate-50'
              : 'bg-emerald-800 text-white border-emerald-900 hover:bg-emerald-700'
          }`}
          title="Klik untuk Keluar atau Ganti Akun"
        >
          <div className={`p-1 rounded-lg ${isSuperAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'}`}>
            {isSuperAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </div>
          
          <div className="text-left">
            <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80 leading-none">
              {isSuperAdmin ? 'Akses Panitia' : 'Bilik Juri Terkunci'}
            </div>
            <div className="text-xs font-black truncate max-w-[180px] sm:max-w-[280px]">
              {currentSession.name}
            </div>
          </div>

          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ml-1 ${
            isSuperAdmin 
              ? 'bg-slate-100 text-slate-700 border-slate-200' 
              : 'bg-emerald-700 text-white border-emerald-600'
          }`}>
            Ganti / Keluar
          </span>
        </button>

        {/* Cloud Sync Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cloud Sync Online</span>
        </div>
      </div>

      {/* Right: Small compact actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          id="btn-logout-compact"
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else if (onNavigateToLogin) {
              onNavigateToLogin();
            } else {
              onOpenLoginModal();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 text-xs font-semibold shadow-2xs cursor-pointer transition-colors active:scale-95"
          title="Keluar dari sesi dan kembali ke Halaman Login"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  );
};
