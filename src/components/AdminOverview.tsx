import React from 'react';
import { 
  CheckCircle, 
  ChevronRight,
  Eye,
  Lock
} from 'lucide-react';
import { CompetitionCategory, Participant, JudgeEvaluation, Judge, CurrentUserSession } from '../types';

interface AdminOverviewProps {
  categories: CompetitionCategory[];
  participants: Participant[];
  evaluations: JudgeEvaluation[];
  judges?: Judge[];
  currentUserSession?: CurrentUserSession;
  onSelectCategory?: (categoryId: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  categories,
  participants,
  evaluations,
  currentUserSession,
  onSelectCategory,
}) => {
  const isJudge = currentUserSession?.role === 'judge';

  return (
    <div className="space-y-2">
      
      {/* Header bar keterangan yang sejajar rapi dengan kartu */}
      <div className="flex items-center justify-between px-1 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span>7 Cabang Lomba FTBI 2026</span>
        </span>
        {isJudge ? (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 normal-case flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mode Tinjau Ringkasan (Hanya Lihat)</span>
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 normal-case">
            Klik cabang lomba untuk membuka bilik penilaian &rarr;
          </span>
        )}
      </div>

      {/* 7 Kartu Ramping Cabang Lomba Rata Kanan-Kiri */}
      <div className="space-y-2">
        {categories.map((category, idx) => {
          // Total participants in this category
          const categoryParticipants = participants.filter((p) => p.categoryId === category.id);
          const totalPeserta = categoryParticipants.length;

          // Evaluated participants in this category
          const sudahDinilai = categoryParticipants.filter((p) => {
            if (p.status === 'evaluated' || p.status === 'finalized') return true;
            const pEvals = evaluations.filter((e) => e.participantId === p.id);
            return pEvals.length > 0;
          }).length;

          const isComplete = totalPeserta > 0 && sudahDinilai === totalPeserta;
          const percentage = totalPeserta > 0 ? Math.round((sudahDinilai / totalPeserta) * 100) : 0;
          const isMyCategory = isJudge && currentUserSession?.categoryId === category.id;

          return (
            <div
              key={category.id}
              onClick={isJudge ? undefined : () => onSelectCategory && onSelectCategory(category.id)}
              className={`rounded-2xl px-4 py-3 border transition-all flex items-center justify-between gap-4 ${
                isJudge
                  ? isMyCategory
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs cursor-default'
                    : 'bg-white border-slate-200 shadow-2xs cursor-default'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group'
              }`}
            >
              {/* SISI KIRI: Nomor + Nama Lomba */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Nomor Urut */}
                <div className={`w-7 h-7 rounded-xl text-white font-black text-xs flex items-center justify-center font-mono shrink-0 shadow-2xs ${
                  isJudge
                    ? isMyCategory ? 'bg-emerald-800' : 'bg-slate-700'
                    : 'bg-emerald-800 group-hover:bg-emerald-700 transition-colors'
                }`}>
                  {idx + 1}
                </div>

                {/* Nama Cabang Lomba */}
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className={`text-xs sm:text-sm font-black truncate ${
                    isJudge
                      ? isMyCategory ? 'text-emerald-950 font-black' : 'text-slate-800 font-bold'
                      : 'text-slate-900 group-hover:text-emerald-800 transition-colors'
                  }`}>
                    {category.name}
                  </h3>
                  {isMyCategory && (
                    <span className="shrink-0 text-[10px] font-extrabold bg-emerald-800 text-white px-2 py-0.5 rounded-md shadow-2xs">
                      Tugas Anda
                    </span>
                  )}
                  {isJudge && !isMyCategory && (
                    <span className="shrink-0 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Hanya Lihat
                    </span>
                  )}
                </div>
              </div>

              {/* SISI KANAN: Kolom Info & Progress Bar */}
              <div className="flex items-center gap-3 shrink-0">
                
                {/* Kolom 1: Jumlah Peserta */}
                <div className="w-24 py-1 px-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-center">
                  <div className="text-[9px] font-extrabold uppercase text-slate-400 leading-tight">
                    Peserta
                  </div>
                  <div className="text-xs font-black text-slate-800 font-mono leading-tight mt-0.5">
                    {totalPeserta} <span className="text-[10px] font-normal text-slate-500">Siswa</span>
                  </div>
                </div>

                {/* Kolom 2: Sudah Dinilai */}
                <div className="w-28 py-1 px-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center flex flex-col justify-center">
                  <div className="text-[9px] font-extrabold uppercase text-emerald-700 leading-tight">
                    Dinilai
                  </div>
                  <div className="text-xs font-black text-emerald-800 font-mono leading-tight mt-0.5">
                    {sudahDinilai} <span className="text-[10px] font-normal text-emerald-600">/ {totalPeserta}</span>
                  </div>
                </div>

                {/* Kolom 3: Progress Bar & Status */}
                <div className="w-36 pl-1 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-emerald-600' : 'bg-emerald-700'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold font-mono text-slate-500 w-8 text-right shrink-0">
                    {percentage}%
                  </span>
                  <div className="w-4 flex items-center justify-center shrink-0">
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : isJudge ? (
                      <span className="text-[10px] text-slate-300">•</span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
