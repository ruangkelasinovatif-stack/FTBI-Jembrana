import React from 'react';
import { 
  UserPlus, 
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
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  School as SchoolIcon
} from 'lucide-react';
import { CompetitionCategory, Participant, JudgeEvaluation, Judge } from '../types';

interface RightSidebarMenuProps {
  categories: CompetitionCategory[];
  participants: Participant[];
  evaluations: JudgeEvaluation[];
  judges: Judge[];
  activeTab: 'admin' | 'registration' | 'judging' | 'leaderboard';
  setActiveTab: (tab: 'admin' | 'registration' | 'judging' | 'leaderboard') => void;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  discrepancyCount: number;
  onResetData: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

// Icon helper per competition category
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

export const RightSidebarMenu: React.FC<RightSidebarMenuProps> = ({
  categories,
  participants,
  evaluations,
  judges,
  activeTab,
  setActiveTab,
  activeCategoryId,
  onSelectCategory,
  discrepancyCount,
  onResetData,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    setActiveTab('judging');
    if (onCloseMobile) onCloseMobile();
  };

  const handleTabClick = (tab: 'admin' | 'registration' | 'judging' | 'leaderboard') => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside 
      id="right-sidebar-menu"
      className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col gap-5 sticky top-4 h-fit"
    >
      {/* 1. Header: Logo & Branding */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              Tahun 2026
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Jenjang SD</span>
          </div>
          <h2 className="text-sm font-bold text-white leading-tight tracking-tight">
            Sistem Penilaian FTBI SD
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            Tingkat Gugus / Tingkat Kecamatan
          </p>
        </div>
      </div>

      {/* 2. Menu Navigation Section */}
      <div className="space-y-4">
        
        {/* Section Label: MENU */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Menu Utama
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            FTBI 2026
          </span>
        </div>

        {/* Menu Item 1: Pendaftaran Peserta */}
        <button
          id="menu-btn-pendaftaran"
          onClick={() => handleTabClick('registration')}
          className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border text-left ${
            activeTab === 'registration'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-1 ring-emerald-400/50'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/70 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg ${activeTab === 'registration' ? 'bg-emerald-700 text-white' : 'bg-slate-700/70 text-emerald-400'}`}>
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-bold">Pendaftaran Peserta</div>
              <div className={`text-[10px] ${activeTab === 'registration' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Formulir Pendaftaran
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
            activeTab === 'registration' ? 'bg-emerald-950/60 text-emerald-200' : 'bg-slate-700 text-slate-300'
          }`}>
            {participants.length}
          </span>
        </button>

        {/* Menu Item 2: Penilaian (Dengan 7 Cabang Lomba sesuai nama aslinya) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Penilaian</span>
            </div>
            <span className="text-[10px] text-slate-400">7 Cabang Lomba</span>
          </div>

          <div className="space-y-1 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/90">
            {categories.map((cat, idx) => {
              const IconComp = getCategoryIcon(cat.id);
              const catParticipants = participants.filter(p => p.categoryId === cat.id);
              const isSelected = activeTab === 'judging' && activeCategoryId === cat.id;
              const isLuring = cat.id === 'cat-nyurat' || cat.id === 'cat-puisi' || cat.id === 'cat-cerpen';

              return (
                <button
                  key={cat.id}
                  id={`menu-btn-lomba-${cat.id}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  title={cat.name}
                  className={`w-full flex items-start gap-2 p-2 rounded-lg text-left transition-all cursor-pointer text-xs group ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-700'
                  }`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-100 leading-snug line-clamp-2">
                      {cat.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                        isLuring 
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-900/60' 
                          : 'bg-blue-950/70 text-blue-400 border border-blue-900/60'
                      }`}>
                        {isLuring ? 'Luring' : 'Daring'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {catParticipants.length} Peserta
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Item 3: Leaderboard */}
        <button
          id="menu-btn-leaderboard"
          onClick={() => handleTabClick('leaderboard')}
          className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border text-left ${
            activeTab === 'leaderboard'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-1 ring-purple-400/50'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/70 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg ${activeTab === 'leaderboard' ? 'bg-purple-700 text-white' : 'bg-slate-700/70 text-purple-400'}`}>
              <Trophy className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-bold">Leaderboard</div>
              <div className={`text-[10px] ${activeTab === 'leaderboard' ? 'text-purple-100' : 'text-slate-400'}`}>
                Rekap Juara & Berita Acara
              </div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${activeTab === 'leaderboard' ? 'text-purple-200' : 'text-slate-500'}`} />
        </button>

        {/* Secondary: Panel Panitia / Admin */}
        <button
          id="menu-btn-admin"
          onClick={() => handleTabClick('admin')}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer border text-left ${
            activeTab === 'admin'
              ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
              : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Panel Panitia & Harmonisasi Nilai</span>
          </div>
          {discrepancyCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              {discrepancyCount}
            </span>
          )}
        </button>

      </div>

      {/* 3. Footer System Info & Reset Control */}
      <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Juknis FTBI 2026</span>
        </div>
        <button
          id="btn-sidebar-reset"
          onClick={() => {
            if (window.confirm('Kembalikan seluruh data ke pengaturan awal?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
          title="Reset Data"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

    </aside>
  );
};
