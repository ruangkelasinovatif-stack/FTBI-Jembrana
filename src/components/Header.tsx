import React from 'react';
import { Award, UserCheck, School as SchoolIcon, Scale, FileText, RotateCcw, Menu, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'admin' | 'registration' | 'judging' | 'leaderboard';
  setActiveTab: (tab: 'admin' | 'registration' | 'judging' | 'leaderboard') => void;
  activeCategoryName?: string;
  discrepancyCount: number;
  onResetData: () => void;
  onToggleMobileMenu?: () => void;
  participantCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCategoryName,
  discrepancyCount,
  onResetData,
  onToggleMobileMenu,
  participantCount = 0,
}) => {
  const getTabLabel = () => {
    switch (activeTab) {
      case 'registration':
        return 'Pendaftaran Peserta';
      case 'judging':
        return activeCategoryName ? `Penilaian: ${activeCategoryName}` : 'Bilik Penilaian Juri';
      case 'leaderboard':
        return 'Leaderboard & Rekapitulasi Nilai';
      case 'admin':
        return 'Panel Panitia & Harmonisasi Nilai';
      default:
        return '';
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-3">
          
          {/* Logo & Quick Info on Left */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  FTBI 2026
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">Tingkat Gugus / Kecamatan • Jenjang SD</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 tracking-tight leading-tight truncate">
                {getTabLabel()}
              </div>
            </div>
          </div>

          {/* Quick actions & mobile toggle */}
          <div className="flex items-center gap-2">
            
            {/* Quick status pill on desktop */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400">Terdaftar:</span>
              <span className="font-bold text-emerald-400">{participantCount} Peserta</span>
              {discrepancyCount > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-semibold">{discrepancyCount} Disparitas</span>
                </>
              )}
            </div>

            {/* Mobile Menu Trigger Button (Menu Kanan) */}
            <button
              id="btn-toggle-mobile-menu"
              onClick={onToggleMobileMenu}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
