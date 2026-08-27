import React from 'react';
import { 
  Users, 
  UserCheck, 
  Award, 
  Trophy, 
  RotateCw, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  School,
  Sparkles
} from 'lucide-react';
import { CompetitionCategory, Participant, Judge, JudgeEvaluation, School as SchoolType } from '../types';

interface SummaryStatsRowProps {
  categories: CompetitionCategory[];
  participants: Participant[];
  judges: Judge[];
  evaluations: JudgeEvaluation[];
  schools: SchoolType[];
  onRefresh?: () => void;
}

export const SummaryStatsRow: React.FC<SummaryStatsRowProps> = ({
  categories,
  participants,
  judges,
  evaluations,
  schools,
  onRefresh,
}) => {
  // Calculations
  const evaluatedCount = participants.filter((p) => p.status === 'evaluated' || p.status === 'finalized').length;
  const pendingCount = participants.filter((p) => p.status === 'registered' || p.status === 'ready' || p.status === 'performing').length;

  return (
    <div className="space-y-4">
      {/* Section Header: Matching "Ringkasan Sekolah • Senin, 24 Agustus 2026..." + Refresh button in screenshot */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Lomba & Partisipasi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Senin, 24 Agustus 2026 • Kecamatan Pekutatan • 7 Cabang Lomba
          </p>
        </div>

        {/* Circular Refresh Button (matching screenshot [ 🔄 ]) */}
        <button
          onClick={onRefresh}
          className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 shadow-xs flex items-center justify-center cursor-pointer transition-colors"
          title="Sinkronisasi Data"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Cards Row Layout: Matching screenshot exactly */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        
        {/* Card 1: Partisipasi Peserta (Matches Presensi Murid Card - width: 4.5 cols) */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Partisipasi Peserta FTBI
              </h4>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-semibold">
                <span>7 Cabang Lomba</span>
                <span>•</span>
                <span className="text-emerald-600">Terverifikasi</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-2xl bg-slate-50">
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {participants.length}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                TOTAL
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-emerald-50">
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                {evaluatedCount}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">
                TERNILAI
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-amber-50">
              <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
                {pendingCount}
              </div>
              <div className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">
                PENDING
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Dewan Juri */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Dewan Juri Terdaftar
              </h4>
              <div className="text-[10px] text-teal-700 font-bold uppercase mt-0.5">
                3 JURI PER CABANG LOMBA
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-2xl bg-slate-50">
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {judges.length}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                TOTAL JURI
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-teal-50">
              <div className="text-xl sm:text-2xl font-black text-teal-700 font-mono">
                {categories.length}
              </div>
              <div className="text-[10px] font-bold text-teal-600 uppercase mt-0.5">
                CABANG
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-emerald-50">
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                {schools.length}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">
                SD ASAL
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Cabang Lomba (Matches Surat Masuk Card - width: 2 cols) */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              7
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              Cabang Lomba
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              3 Luring • 4 Daring
            </div>
          </div>
        </div>

        {/* Card 4: Sekolah Asal */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {schools.length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              Satuan Pendidikan
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Sekolah Terdaftar
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
