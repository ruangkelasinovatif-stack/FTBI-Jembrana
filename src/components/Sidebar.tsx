import React, { useState } from 'react';
import { 
  LayoutDashboard,
  UserPlus, 
  UserCheck,
  Scale, 
  Trophy, 
  Award, 
  FileText, 
  Scroll, 
  BookOpen, 
  Mic2, 
  Music, 
  Smile, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  QrCode,
  Share2,
  Building2,
  Settings
} from 'lucide-react';
import { CompetitionCategory, Participant, JudgeEvaluation, Judge, CurrentUserSession } from '../types';

export type AppTabType = 'admin' | 'registration' | 'judge_registration' | 'judging' | 'leaderboard' | 'profile_settings';

interface SidebarProps {
  categories: CompetitionCategory[];
  participants: Participant[];
  evaluations: JudgeEvaluation[];
  judges: Judge[];
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onResetData: () => void;
  currentUserSession?: CurrentUserSession;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  onOpenShareModal?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'cat-nyurat':
      return Scroll;
    case 'cat-puisi':
      return BookOpen;
    case 'cat-cerpen':
      return FileText;
    case 'cat-masatua':
      return Mic2;
    case 'cat-matembang':
      return Music;
    case 'cat-mapidarta':
      return Scale;
    case 'cat-babanyolan':
      return Smile;
    default:
      return Scroll;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  participants,
  evaluations,
  judges,
  activeTab,
  setActiveTab,
  activeCategoryId,
  onSelectCategory,
  onResetData,
  currentUserSession,
  onOpenLoginModal,
  onLogout,
  onOpenShareModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [isLombaDropdownOpen, setIsLombaDropdownOpen] = useState(true);
  const isSuperAdmin = !currentUserSession || currentUserSession.role === 'superadmin';
  const isJudge = currentUserSession?.role === 'judge';

  const handleNavClick = (tab: AppTabType, catId?: string) => {
    // If Judge tries to access restricted tabs, ignore or redirect
    if (isJudge && (tab === 'registration' || tab === 'judge_registration' || tab === 'leaderboard' || tab === 'profile_settings')) {
      return;
    }
    if (isJudge && tab === 'judging' && catId && catId !== currentUserSession.categoryId) {
      return; // Cannot switch to other category
    }

    setActiveTab(tab);
    if (catId) {
      onSelectCategory(catId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside 
      id="main-sidebar-menu"
      className="w-full bg-white text-slate-800 flex flex-col h-full rounded-3xl border border-slate-200/80 shadow-sm p-4.5 select-none overflow-hidden"
    >
      {/* 1. Header Profile Block */}
      <div 
        onClick={onLogout || onOpenLoginModal}
        className="flex items-center gap-3.5 p-2 mb-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition cursor-pointer"
        title="Klik untuk Keluar / Ganti Akun"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-950/10 shrink-0">
          <div className="relative">
            {isSuperAdmin ? (
              <Scale className="w-5 h-5 text-amber-300 drop-shadow-sm" />
            ) : (
              <Lock className="w-5 h-5 text-emerald-300 drop-shadow-sm" />
            )}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 tracking-tight leading-tight truncate">
              FTBI Pekutatan
            </h2>
            <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              {isSuperAdmin ? 'Admin' : currentUserSession?.judgeRole || 'Juri'}
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-600 truncate mt-0.5">
            {isSuperAdmin ? 'Super Admin (Panitia)' : currentUserSession?.name}
          </div>
        </div>
      </div>

      {/* 2. Menu Section Label */}
      <div className="px-3 py-1 mb-1 flex items-center justify-between">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          MENU UTAMA
        </span>
        {isJudge && (
          <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Bilik Terkunci
          </span>
        )}
      </div>

      {/* 3. Scrollable Navigation Menu List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Menu Item 1: Dashboard Utama */}
        <button
          id="sidebar-btn-dashboard"
          onClick={() => handleNavClick('admin')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
            activeTab === 'admin'
              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'admin' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="truncate flex-1 font-medium">Dashboard Utama</span>
        </button>

        {/* Menu Item 2: Pendaftaran Peserta (Hanya Super Admin) */}
        <button
          id="sidebar-btn-pendaftaran-peserta"
          onClick={() => handleNavClick('registration')}
          disabled={!isSuperAdmin}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
            !isSuperAdmin
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : activeTab === 'registration'
              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs cursor-pointer'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'registration' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="truncate flex-1 font-medium">Pendaftaran Peserta</span>
          {isSuperAdmin ? (
            <span className="bg-slate-100 text-slate-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border border-slate-200">
              {participants.length}
            </span>
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Menu Item 3: Pendaftaran Juri (Hanya Super Admin) */}
        <button
          id="sidebar-btn-pendaftaran-juri"
          onClick={() => handleNavClick('judge_registration')}
          disabled={!isSuperAdmin}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
            !isSuperAdmin
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : activeTab === 'judge_registration'
              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs cursor-pointer'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'judge_registration' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="truncate flex-1">
            <div className="font-medium leading-tight">Pendaftaran Juri</div>
          </div>
          {isSuperAdmin ? (
            <span className="bg-slate-100 text-slate-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border border-slate-200">
              {judges.length}
            </span>
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Section: Penilaian Cabang Lomba */}
        <div className="pt-2">
          <div 
            onClick={() => setIsLombaDropdownOpen(!isLombaDropdownOpen)}
            className="flex items-center justify-between px-3 py-1.5 cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {isJudge ? 'CABANG LOMBA ANDA' : '7 CABANG LOMBA'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLombaDropdownOpen ? '' : '-rotate-90'}`} />
          </div>

          {isLombaDropdownOpen && (
            <div className="space-y-1 mt-1 pl-1">
              {categories.map((cat, idx) => {
                const IconComp = getCategoryIcon(cat.id);
                const isSelected = activeTab === 'judging' && activeCategoryId === cat.id;
                const catParticipants = participants.filter((p) => p.categoryId === cat.id);
                const isLuring = cat.id === 'cat-nyurat' || cat.id === 'cat-puisi' || cat.id === 'cat-cerpen';

                // If judge is logged in, only allow their assigned category
                const isJudgeAssignedCategory = isJudge && currentUserSession.categoryId === cat.id;
                const isLockedForThisJudge = isJudge && !isJudgeAssignedCategory;

                return (
                  <button
                    key={cat.id}
                    id={`sidebar-btn-lomba-${cat.id}`}
                    disabled={isLockedForThisJudge}
                    onClick={() => handleNavClick('judging', cat.id)}
                    title={isLockedForThisJudge ? 'Terkunci (Hanya untuk juri cabang ini)' : cat.name}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                      isLockedForThisJudge
                        ? 'opacity-35 cursor-not-allowed bg-transparent text-slate-400'
                        : isSelected
                        ? 'bg-emerald-800 text-white font-bold shadow-xs cursor-pointer'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isLockedForThisJudge
                        ? 'bg-slate-100 text-slate-400'
                        : isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isLockedForThisJudge ? <Lock className="w-3 h-3" /> : idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="leading-tight truncate font-medium">
                        {cat.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] mt-0.5 opacity-80">
                        <span>{isLuring ? 'Luring' : 'Daring'}</span>
                        <span>•</span>
                        <span>{catParticipants.length} Peserta</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu Item: Leaderboard (Khusus Panitia / Super Admin) */}
        {isSuperAdmin && (
          <div className="pt-2 space-y-1.5">
            <button
              id="sidebar-btn-leaderboard"
              onClick={() => handleNavClick('leaderboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'leaderboard' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Trophy className="w-4 h-4" />
              </div>
              <span className="truncate flex-1 font-medium">Leaderboard & Juara</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Menu Item: Edit Profil & Data Instansi (Khusus Super Admin) */}
            <button
              id="sidebar-btn-edit-profil"
              onClick={() => handleNavClick('profile_settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'profile_settings'
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'profile_settings' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate flex-1">
                <div className="font-medium leading-tight">Edit Profil & Instansi</div>
                <div className="text-[10px] text-slate-400 font-normal">Sekolah, KOP & Akun</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

      </div>

      {/* 4. Footer */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={onLogout || onOpenLoginModal}
          className="font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
          title="Kembali ke Halaman Login"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Keluar Akun</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => {
              if (window.confirm('Reset SEMUA data (peserta, sekolah, juri) kembali ke default awal?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-1 hover:text-rose-600 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer text-[10px]"
            title="Reset Semua Data ke Awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Total</span>
          </button>
        )}
      </div>
    </aside>
  );
};
