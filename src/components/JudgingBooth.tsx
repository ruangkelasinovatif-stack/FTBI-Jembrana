import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Award, 
  AlertTriangle, 
  Lock, 
  Sparkles, 
  Scale, 
  Info,
  User,
  ShieldCheck,
  MapPin,
  Clock,
  BookOpen,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  Participant, 
  CompetitionCategory, 
  Judge, 
  School, 
  JudgeEvaluation, 
  getScoreLevel, 
  SCORE_LEVELS,
  ScoreLevelInfo,
  CurrentUserSession 
} from '../types';
import { calculateWeightedScore } from '../data/initialData';

interface JudgingBoothProps {
  categories: CompetitionCategory[];
  schools: School[];
  judges: Judge[];
  participants: Participant[];
  evaluations: JudgeEvaluation[];
  selectedCategoryId?: string;
  currentUserSession?: CurrentUserSession;
  onSelectCategory?: (categoryId: string) => void;
  onSaveEvaluation: (evaluation: JudgeEvaluation) => void;
  onOpenReconciliation?: (participantId: string) => void;
  onStatusChange: (participantId: string, status: Participant['status']) => void;
  onResetCategoryScores?: (categoryId: string) => void;
}

export const JudgingBooth: React.FC<JudgingBoothProps> = ({
  categories,
  schools,
  judges,
  participants,
  evaluations,
  selectedCategoryId: propCategoryId,
  currentUserSession,
  onSelectCategory,
  onSaveEvaluation,
  onStatusChange,
  onResetCategoryScores,
}) => {
  // Modal state for resetting this specific category's scores
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Active Category is strictly driven by the one selected in the sidebar
  const selectedCategoryId = propCategoryId || (currentUserSession?.role === 'judge' && currentUserSession.categoryId ? currentUserSession.categoryId : categories[0]?.id || '');
  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const categoryJudges = judges.filter((j) => activeCategory ? j.categoryId === activeCategory.id : false);
  // Category participants strictly according to registration data
  const categoryParticipants = participants.filter((p) => activeCategory ? p.categoryId === activeCategory.id : false);

  // Active Judge logic: If logged in as judge, strictly locked to their judgeId. Otherwise default to first judge.
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>(() => {
    if (currentUserSession?.role === 'judge' && currentUserSession.judgeId) {
      return currentUserSession.judgeId;
    }
    return categoryJudges[0]?.id || '';
  });

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');

  // Keep selectedJudgeId synchronized with session or category change
  useEffect(() => {
    if (currentUserSession?.role === 'judge' && currentUserSession.judgeId) {
      setSelectedJudgeId(currentUserSession.judgeId);
    } else if (categoryJudges.length > 0) {
      if (!categoryJudges.some((j) => j.id === selectedJudgeId)) {
        setSelectedJudgeId(categoryJudges[0].id);
      }
    }
  }, [currentUserSession, selectedCategoryId, categoryJudges]);

  // Keep participant synchronized
  useEffect(() => {
    if (categoryParticipants.length > 0) {
      if (!categoryParticipants.some((p) => p.id === selectedParticipantId)) {
        setSelectedParticipantId(categoryParticipants[0].id);
      }
    } else {
      setSelectedParticipantId('');
    }
  }, [selectedCategoryId, categoryParticipants]);

  // Current form scores
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  const getJudgeSchoolName = (judge?: Judge) => {
    if (!judge) return '-';
    if (judge.schoolId === 'juri-tamu') return '🎭 Juri Tamu (Pihak Luar)';
    const school = schools.find((s) => s.id === judge.schoolId);
    return school?.name || judge.schoolId || '-';
  };

  const activeJudge = judges.find((j) => j.id === selectedJudgeId);
  const activeParticipant = participants.find((p) => p.id === selectedParticipantId);
  const participantSchool = schools.find((s) => s.id === activeParticipant?.schoolId);
  const judgeSchoolName = getJudgeSchoolName(activeJudge);

  const isJudgeUser = currentUserSession?.role === 'judge';
  const isSuperAdmin = currentUserSession?.role === 'superadmin';

  // Check Conflict of Interest (Informasi Asal Sekolah)
  const isJudgeFromSameSchool = Boolean(
    activeJudge &&
    activeParticipant &&
    activeJudge.schoolId !== 'juri-tamu' &&
    activeJudge.schoolId === activeParticipant.schoolId
  );

  // Existing evaluation for this judge + participant
  const existingEvaluation = evaluations.find(
    (e) => e.participantId === selectedParticipantId && e.judgeId === selectedJudgeId
  );

  // Category evaluation counts
  const categoryEvaluations = evaluations.filter((e) =>
    categoryParticipants.some((p) => p.id === e.participantId)
  );
  const categoryEvaluationsCount = categoryEvaluations.length;
  const categoryEvaluatedParticipantsCount = categoryParticipants.filter(
    (p) => p.status === 'evaluated' || p.status === 'finalized'
  ).length;

  // Initialize or load score form
  useEffect(() => {
    if (existingEvaluation) {
      // Normalize any existing scores > 10 down to 1-10 if needed
      const normalizedScores: Record<string, number> = {};
      Object.entries(existingEvaluation.scores).forEach(([k, v]) => {
        const numVal = Number(v) || 0;
        normalizedScores[k] = numVal > 10 ? Math.round(numVal / 10) : numVal;
      });
      setCurrentScores(normalizedScores);
    } else {
      // Clean empty scores for new/unevaluated participant (no default 8)
      setCurrentScores({});
    }
    setSubmittedFeedback(null);
  }, [selectedParticipantId, selectedJudgeId, activeCategory, existingEvaluation]);

  const handleScoreChange = (criteriaId: string, val: number | string) => {
    if (val === '' || isNaN(Number(val))) {
      setCurrentScores((prev) => {
        const next = { ...prev };
        delete next[criteriaId];
        return next;
      });
      return;
    }
    const num = Number(val);
    const clamped = Math.max(1, Math.min(10, num));
    setCurrentScores((prev) => ({
      ...prev,
      [criteriaId]: clamped,
    }));
  };

  // Check how many criteria are scored
  const totalCriteriaCount = activeCategory ? activeCategory.criteria.length : 0;
  const scoredCriteriaCount = activeCategory
    ? activeCategory.criteria.filter((c) => currentScores[c.id] !== undefined && currentScores[c.id] >= 1).length
    : 0;
  const isAllCriteriaScored = totalCriteriaCount > 0 && scoredCriteriaCount === totalCriteriaCount;

  const currentTotalWeighted = activeCategory
    ? calculateWeightedScore(currentScores, activeCategory.criteria)
    : 0;

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParticipant || !activeJudge) return;

    if (!isAllCriteriaScored) {
      alert(`Mohon lengkapi nilai untuk seluruh kriteria penilaian (baru terisi ${scoredCriteriaCount} dari ${totalCriteriaCount} kriteria) sebelum menyimpan dan mengunci nilai.`);
      return;
    }

    const newEval: JudgeEvaluation = {
      id: existingEvaluation?.id || `eval-${Date.now()}`,
      participantId: activeParticipant.id,
      judgeId: activeJudge.id,
      judgeRole: activeJudge.role,
      scores: currentScores,
      totalWeightedScore: currentTotalWeighted,
      notes: '',
      submittedAt: new Date().toISOString(),
      isSubstitute: false,
    };

    onSaveEvaluation(newEval);

    // Update status based on evaluation progress
    const allEvalsNow = [
      ...evaluations.filter((ev) => !(ev.participantId === activeParticipant.id && ev.judgeId === activeJudge.id)),
      newEval,
    ];
    const updatedPartEvals = allEvalsNow.filter((ev) => ev.participantId === activeParticipant.id);

    if (updatedPartEvals.length >= 3) {
      onStatusChange(activeParticipant.id, 'evaluated');
    } else {
      onStatusChange(activeParticipant.id, 'performing');
    }
    setSubmittedFeedback('Berhasil simpan nilai');

    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
    }, 3000);
  };

  const isLuring = activeCategory.id === 'cat-nyurat' || activeCategory.id === 'cat-puisi' || activeCategory.id === 'cat-cerpen';

  // Participant Navigation Helpers
  const currentParticipantIndex = categoryParticipants.findIndex((p) => p.id === selectedParticipantId);
  const hasPreviousParticipant = currentParticipantIndex > 0;
  const hasNextParticipant = currentParticipantIndex >= 0 && currentParticipantIndex < categoryParticipants.length - 1;

  const goToPreviousParticipant = () => {
    if (hasPreviousParticipant) {
      setSelectedParticipantId(categoryParticipants[currentParticipantIndex - 1].id);
    }
  };

  const goToNextParticipant = () => {
    if (hasNextParticipant) {
      setSelectedParticipantId(categoryParticipants[currentParticipantIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6 relative max-w-full overflow-hidden">
      
      {/* Toast Notifikasi Berhasil Simpan Nilai */}
      {showSaveToast && (
        <div 
          id="toast-save-score-success"
          className="fixed top-6 right-6 z-50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border bg-emerald-900 border-emerald-400/50"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
              Notifikasi Sistem
            </h4>
            <p className="text-sm font-bold text-white">
              Berhasil menyimpan dan memperbarui nilai
            </p>
          </div>
          <button 
            onClick={() => setShowSaveToast(false)}
            className="ml-2 text-white/70 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. HEADER BANNER CABANG LOMBA & INFO JURI */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          
          {/* Detail Cabang Lomba Terpilih */}
          <div className="space-y-2 flex-1 min-w-0">
            {/* Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Cabang Lomba</span>
              </span>

              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                isLuring 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300/80' 
                  : 'bg-teal-100 text-teal-900 border border-teal-300/80'
              }`}>
                Pelaksanaan: {isLuring ? 'Luring (Tatap Muka)' : 'Daring (Video/Audio)'}
              </span>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                {categoryParticipants.length} Peserta Terdaftar
              </span>
            </div>

            {/* Category Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {activeCategory.name}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              {activeCategory.description}
            </p>
          </div>

          {/* Sisi Kanan: Status & Bilik Juri */}
          <div className="w-full xl:w-auto shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            {isJudgeUser ? (
              // TAMPILAN JURI TERKUNCI (Juri tidak bisa berpindah peran ke juri lainnya)
              <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-4 shadow-2xs w-full xl:min-w-[300px]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Akun Juri Terkunci</span>
                  </div>
                  <span className="bg-emerald-800 text-white text-[10px] px-2.5 py-0.5 rounded-full font-extrabold shadow-2xs">
                    {activeJudge?.role}
                  </span>
                </div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">
                  {activeJudge?.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>{judgeSchoolName}</span>
                </div>
              </div>
            ) : (
              // TAMPILAN SUPER ADMIN (Bisa memantau dan memilih semua peran juri)
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 shadow-2xs w-full xl:min-w-[320px]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Mode Pengawas Panitia:</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Super Admin
                  </span>
                </div>
                <select
                  id="select-active-judge"
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer shadow-2xs"
                >
                  {categoryJudges.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.role} — {j.name} ({getJudgeSchoolName(j)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Panel Khusus Admin: Status Nilai Cabang Lomba & Tombol Reset Per Cabang */}
        {isSuperAdmin && onResetCategoryScores && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-bold text-slate-700">Status Penjurian Cabang Ini:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-xs">
                {categoryEvaluationsCount} Lembar Nilai Masuk
              </span>
              <span className="text-slate-500 font-medium">
                ({categoryEvaluatedParticipantsCount} dari {categoryParticipants.length} Peserta Selesai)
              </span>
            </div>

            {/* Tombol Reset Nilai Cabang Ini */}
            <button
              type="button"
              id={`btn-reset-category-scores-${activeCategory.id}`}
              onClick={() => setShowResetConfirmModal(true)}
              disabled={categoryEvaluationsCount === 0}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-2xs ${
                categoryEvaluationsCount > 0
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 cursor-pointer active:scale-95'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
              title={
                categoryEvaluationsCount > 0
                  ? `Kosongkan semua nilai juri khusus untuk cabang ${activeCategory.name}`
                  : 'Belum ada nilai juri yang masuk di cabang ini'
              }
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Nilai Cabang Ini</span>
            </button>
          </div>
        )}

      </div>

      {/* 2. DROPDOWN PILIH PESERTA DI ATAS (Bukan di Samping) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        
        {/* Label dan Kontrol Navigasi Peserta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <label htmlFor="select-participant-dropdown" className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Pilih Peserta yang Dinilai (Dropdown):</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan pilih peserta yang sedang tampil dari dropdown di bawah atau gunakan tombol navigasi.
            </p>
          </div>

          {/* Quick Prev / Next Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              id="btn-prev-participant"
              onClick={goToPreviousParticipant}
              disabled={!hasPreviousParticipant}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                hasPreviousParticipant
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 cursor-pointer active:scale-95'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-500 px-1">
              {currentParticipantIndex >= 0 ? `${currentParticipantIndex + 1} / ${categoryParticipants.length}` : '0'}
            </span>

            <button
              type="button"
              id="btn-next-participant"
              onClick={goToNextParticipant}
              disabled={!hasNextParticipant}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                hasNextParticipant
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 cursor-pointer active:scale-95'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
              }`}
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Select Element */}
        <div className="relative">
          <select
            id="select-participant-dropdown"
            value={selectedParticipantId}
            onChange={(e) => setSelectedParticipantId(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-2xl p-3.5 text-sm sm:text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer appearance-none pr-10 shadow-2xs"
          >
            {categoryParticipants.length === 0 ? (
              <option value="">(Belum ada peserta terdaftar di cabang lomba ini)</option>
            ) : (
              categoryParticipants.map((p) => {
                const school = schools.find((s) => s.id === p.schoolId);
                const hasJudged = evaluations.some(
                  (e) => e.participantId === p.id && e.judgeId === selectedJudgeId
                );
                const statusLabel = hasJudged
                  ? '✓ Sudah Dinilai'
                  : '— Belum Dinilai';

                return (
                  <option key={p.id} value={p.id}>
                    No. Undi #{p.lotNo} : {p.fullName || (p as any).name} — {school?.name || 'SD'} ({p.grade}, {p.gender === 'L' ? 'Putra' : 'Putri'}) [{statusLabel}]
                  </option>
                );
              })
            )}
          </select>
          <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3.5 top-4 pointer-events-none" />
        </div>

        {/* Selected Participant Information Card */}
        {activeParticipant && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-mono text-lg font-black shrink-0 shadow-2xs">
                #{activeParticipant.lotNo}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {activeParticipant.registrationNo}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {activeParticipant.grade} ({activeParticipant.gender === 'L' ? 'Putra' : 'Putri'})
                  </span>
                  {activeParticipant.grade === 'Kelas 3' || activeParticipant.grade === 'Kelas 4' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      Finalis-Hanya Dinilai
                    </span>
                  ) : null}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
                  {activeParticipant.fullName || (activeParticipant as any).name}
                </h3>
                <p className="text-xs font-semibold text-slate-600 truncate flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{participantSchool?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:text-right shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-emerald-100">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Guru Pembina:</div>
                <div className="text-xs font-bold text-slate-800">
                  {activeParticipant.mentorName || (activeParticipant as any).coachName || '-'}
                </div>
              </div>
              <div className="ml-auto md:ml-2">
                {existingEvaluation ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Sudah Dinilai</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs">
                    Belum Dinilai
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. FORM LEMBAR PENILAIAN JURI (Full-Width, No Overflow) */}
      {activeParticipant ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
          
          {/* Info Asal Sekolah Jika Sama */}
          {isJudgeFromSameSchool && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 text-xs leading-relaxed">
              <Info className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                <strong>Informasi Penilaian:</strong> Juri tercatat berasal dari <strong>{judgeSchoolName}</strong> (sekolah asal peserta). Sesuai ketentuan, juri tetap berhak dan berkewajiban memberikan penilaian secara penuh, profesional, dan objektif.
              </span>
            </div>
          )}

          {/* FORM KRITERIA SKORING */}
          <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              
              {/* Header Bar Kriteria Penilaian */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs sm:text-sm font-extrabold uppercase text-slate-800">
                    Kriteria Penilaian ({activeCategory.criteria.length} Komponen Sesuai Juknis SD)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
                  <span>Skala Skor: <strong className="text-emerald-800">1 - 10</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Skor Akhir: <strong className="text-slate-800">Skala 100</strong></span>
                </div>
              </div>

              {/* Keterangan Predikat Skala 1 - 10 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-100/90 rounded-2xl text-[11px] font-bold border border-slate-200">
                <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-center">
                  <span className="font-black font-mono">1, 2:</span> Sangat Kurang
                </div>
                <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-center">
                  <span className="font-black font-mono">3, 4:</span> Kurang
                </div>
                <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-center">
                  <span className="font-black font-mono">5, 6:</span> Cukup
                </div>
                <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-center">
                  <span className="font-black font-mono">7, 8:</span> Baik
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                  <span className="font-black font-mono">9, 10:</span> Sangat Baik
                </div>
              </div>

              {/* DAFTAR KARTU KRITERIA PENILAIAN */}
              <div className="space-y-4">
                {activeCategory.criteria.map((crit, idx) => {
                  const rawScore = currentScores[crit.id];
                  const isFilled = rawScore !== undefined && rawScore >= 1 && rawScore <= 10;
                  const score = isFilled ? rawScore : 0;
                  const level = isFilled ? getScoreLevel(score) : null;
                  const weightedContribution = isFilled ? (score * crit.weight * 10).toFixed(2) : '0.00';

                  return (
                    <div 
                      key={crit.id} 
                      className={`p-4 sm:p-5 rounded-2xl transition space-y-3.5 ${
                        isFilled
                          ? 'bg-slate-50/90 border border-slate-200/90 hover:border-emerald-300'
                          : 'bg-white border-2 border-dashed border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Baris Atas: Nomor, Judul Kriteria, Bobot, Predikat & Input Nilai */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                              isFilled 
                                ? 'bg-emerald-800 text-white' 
                                : 'bg-slate-300 text-slate-700'
                            }`}>
                              {idx + 1}
                            </span>
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                              {crit.name}
                            </h4>
                            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300 shrink-0">
                              Bobot: {(crit.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed pl-8 md:pl-8">
                            {crit.description}
                          </p>
                        </div>

                        {/* Nilai Input & Badge Predikat */}
                        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                          {isFilled && level ? (
                            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border shadow-2xs ${level.color} ${level.bgLight} ${level.border}`}>
                              {level.name}
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 italic">
                              Belum Dinilai
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={isFilled ? rawScore : ''}
                              placeholder="—"
                              onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                              className={`w-16 h-11 px-2 bg-white border-2 rounded-xl font-mono text-xl font-black text-center text-slate-900 focus:ring-2 focus:outline-hidden shadow-2xs ${
                                isFilled 
                                  ? 'border-emerald-500 focus:ring-emerald-500' 
                                  : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                              }`}
                            />
                            <span className="text-xs text-slate-400 font-mono font-semibold">/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Baris Tengah: Range Slider & Preset Buttons 1 - 10 */}
                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Slider Range */}
                          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">1</span>
                            <input
                              type="range"
                              min={1}
                              max={10}
                              step={1}
                              value={isFilled ? score : 5}
                              onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value) || 0)}
                              className={`w-full cursor-pointer h-2.5 rounded-lg ${
                                isFilled
                                  ? 'accent-emerald-700 bg-slate-200'
                                  : 'accent-slate-400 bg-slate-200 opacity-60'
                              }`}
                            />
                            <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">10</span>
                          </div>
                          
                          {/* Preset Tombol 1 - 10 */}
                          <div className="flex items-center gap-1 flex-wrap shrink-0">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                              const isSelected = isFilled && score === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => handleScoreChange(crit.id, num)}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black font-mono transition cursor-pointer flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-emerald-800 text-white ring-2 ring-emerald-500 shadow-xs scale-105'
                                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                  title={`Pilih skor ${num} (${getScoreLevel(num).name})`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>

                        </div>

                        {/* Rincian Kalkulasi Subtotal Nilai */}
                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                          <span className="text-slate-500 font-medium">
                            Kalkulasi Nilai Komponen:
                          </span>
                          {isFilled ? (
                            <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                              Skor <strong className="text-slate-900">{score}</strong> × Bobot {(crit.weight * 100).toFixed(0)}% = <strong className="text-emerald-800 text-sm">{weightedContribution}</strong> <span className="text-[10px] text-slate-400">poin</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                              Belum dinilai (silakan klik tombol 1 - 10 di atas)
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Ringkasan Nilai Total & Tombol Simpan */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      {isAllCriteriaScored ? 'Nilai Akhir Berbobot Juri:' : 'Nilai Sementara (Belum Lengkap):'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isAllCriteriaScored ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/60' : 'bg-amber-900/80 text-amber-300 border border-amber-500/60'
                    }`}>
                      {scoredCriteriaCount} / {totalCriteriaCount} Kriteria Terisi
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    {currentTotalWeighted.toFixed(2)}{' '}
                    <span className="text-sm font-sans text-slate-400 font-normal">/ 100.00</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                  {submittedFeedback && (
                    <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/50 animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {submittedFeedback}
                    </span>
                  )}
                  <button
                    type="submit"
                    id="btn-submit-judge-score"
                    disabled={!isAllCriteriaScored}
                    className={`px-6 py-3.5 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer active:scale-98 ${
                      isAllCriteriaScored
                        ? 'bg-emerald-700 hover:bg-emerald-600'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-not-allowed opacity-90'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isAllCriteriaScored ? 'Simpan & Kunci Nilai' : `Lengkapi Nilai (${scoredCriteriaCount}/${totalCriteriaCount})`}
                    </span>
                  </button>
                </div>
              </div>

            </form>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          Belum ada peserta yang dipilih pada cabang lomba ini.
        </div>
      )}

      {/* Confirmation Modal Reset Nilai Khusus Cabang Ini */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Konfirmasi Reset Nilai Cabang Lomba
              </h3>
              <div className="text-sm font-bold text-emerald-800 bg-emerald-50 py-1 px-3 rounded-lg border border-emerald-200 inline-block">
                {activeCategory.name}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini hanya akan mengosongkan penilaian juri pada <strong>cabang {activeCategory.name}</strong> dan mengembalikan {categoryParticipants.length} peserta di cabang ini ke status <strong>Belum Dinilai</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryEvaluationsCount} data nilai juri di cabang ini akan dikosongkan</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Nilai pada 6 cabang lomba lainnya TETAP AMAN</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Data pendaftaran peserta & akun juri tetap tersimpan</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-reset-category-scores"
                onClick={() => {
                  setShowResetConfirmModal(false);
                  if (onResetCategoryScores) {
                    onResetCategoryScores(activeCategory.id);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Reset Cabang Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
