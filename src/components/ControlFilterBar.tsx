import React from 'react';
import { Filter, Search, RotateCcw, CheckCircle, ChevronDown, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CompetitionCategory, School } from '../types';
import { AppTabType } from './Sidebar';

interface ControlFilterBarProps {
  categories: CompetitionCategory[];
  schools: School[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  selectedSchoolId?: string;
  onSelectSchool?: (schoolId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeTab: AppTabType;
}

export const ControlFilterBar: React.FC<ControlFilterBarProps> = ({
  categories,
  schools,
  selectedCategoryId,
  onSelectCategory,
  selectedSchoolId = 'all',
  onSelectSchool,
  searchQuery = '',
  onSearchChange,
  activeTab,
}) => {
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div 
      id="control-filter-bar"
      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      {/* Left title & context */}
      <div>
        <div className="text-base font-extrabold text-slate-900 leading-tight">
          {activeTab === 'judging' 
            ? 'Bilik Penjurian FTBI' 
            : activeTab === 'registration' 
            ? 'Pendaftaran & Basis Data Peserta' 
            : activeTab === 'judge_registration'
            ? 'Pendaftaran & Rotasi Juri'
            : activeTab === 'leaderboard' 
            ? 'Rekapitulasi Juara & Berita Acara' 
            : 'Panel Monitoring & Harmonisasi'}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 font-medium">
          {activeTab === 'judge_registration'
            ? 'Kecamatan Pekutatan • Dewan Juri Lomba'
            : currentCategory ? currentCategory.name : 'Semua Cabang Lomba'}
        </div>
      </div>

      {/* Right Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        
        {/* Filter 1: Cabang Lomba */}
        <div className="flex flex-col gap-1 min-w-[190px] flex-1 sm:flex-initial">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Cabang Lomba
          </label>
          <div className="relative">
            <select
              value={selectedCategoryId}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none cursor-pointer transition"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter 2: Asal Sekolah */}
        {onSelectSchool && (
          <div className="flex flex-col gap-1 min-w-[190px] flex-1 sm:flex-initial">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Sekolah Asal
            </label>
            <div className="relative">
              <select
                value={selectedSchoolId}
                onChange={(e) => onSelectSchool(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none cursor-pointer transition"
              >
                <option value="all">Semua Sekolah ({schools.length})</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Action Button Badge */}
        <div className="flex flex-col gap-1 self-end">
          <label className="text-[10px] font-bold uppercase tracking-wider text-transparent select-none hidden sm:block">
            Aksi
          </label>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Juknis SD 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
};
