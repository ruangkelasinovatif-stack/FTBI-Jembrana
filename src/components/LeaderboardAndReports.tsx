import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Medal, 
  Printer, 
  Download,
  CheckCircle, 
  AlertTriangle, 
  FileCheck, 
  Users, 
  Award,
  Crown,
  School as SchoolIcon,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Info,
  X,
  FileSpreadsheet,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { CompetitionCategory, School, Judge, Participant, JudgeEvaluation, EventProfile } from '../types';
import { getEffectiveJudgesForParticipant } from '../data/initialData';
import { 
  exportJuaraPutraToExcel,
  exportJuaraPutriToExcel,
  exportRekapJuaraUmumSekolahToExcel,
  getAllCategoryResults
} from '../utils/excelExport';

interface LeaderboardAndReportsProps {
  categories: CompetitionCategory[];
  schools: School[];
  judges: Judge[];
  participants: Participant[];
  evaluations: JudgeEvaluation[];
  eventProfile?: EventProfile;
  selectedCategoryId?: string;
  onSelectCategory?: (categoryId: string) => void;
  onOpenReconciliation?: (participantId: string) => void;
}

export interface SchoolMedalStanding {
  school: School;
  goldCount: number; // Juara 1
  silverCount: number; // Juara 2
  bronzeCount: number; // Juara 3
  totalMedals: number;
  totalParticipants: number; // Kriteria pemecah seri ke-4 (Total Peserta yang didaftarkan)
  details: {
    category: CompetitionCategory;
    gender: 'L' | 'P';
    rank: 1 | 2 | 3;
    participant: Participant;
    score: number;
  }[];
}

export const LeaderboardAndReports: React.FC<LeaderboardAndReportsProps> = ({
  categories,
  schools,
  judges,
  participants,
  evaluations,
  eventProfile,
  selectedCategoryId: propCategoryId,
  onSelectCategory,
  onOpenReconciliation,
}) => {
  // Main view mode: 'categories' (Per Cabang Lomba) or 'overall' (Juara Umum Sekolah)
  const [viewMode, setViewMode] = useState<'categories' | 'overall'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    propCategoryId || categories[0]?.id || ''
  );
  const [activeGenderTab, setActiveGenderTab] = useState<'all' | 'L' | 'P'>('all');
  const [showBeritaAcara, setShowBeritaAcara] = useState<boolean>(false);
  const [showBeritaAcaraJuaraUmum, setShowBeritaAcaraJuaraUmum] = useState<boolean>(false);

  // Dynamic Event Profile values
  const districtName = eventProfile?.districtName || 'Pekutatan';
  const regencyName = eventProfile?.regencyName || 'Jembrana';
  const eventName = eventProfile?.eventName || 'Festival Tunas Bahasa Ibu (FTBI)';
  const targetLevel = eventProfile?.targetLevel || 'Jenjang Sekolah Dasar (SD)';
  const committeeChairman = eventProfile?.committeeChairman || 'I Made Suardana, S.Pd., M.Pd.';
  const committeeChairmanNip = eventProfile?.committeeChairmanNip || '19700101 199503 1 005';
  const educationCoordinator = eventProfile?.educationCoordinator || 'I Wayan Suarna, S.Pd., M.Pd.';
  const educationCoordinatorNip = eventProfile?.educationCoordinatorNip || '19680512 199103 1 008';
  const logoUrl = eventProfile?.logoUrl || '';
  const customKopUrl = eventProfile?.customKopUrl || '';
  const useImageKop = eventProfile?.useImageKop && customKopUrl;
  const kopHeader1 = eventProfile?.kopTextHeader1 || 'PEMERINTAH KABUPATEN JEMBRANA';
  const kopHeader2 = eventProfile?.kopTextHeader2 || 'DINAS PENDIDIKAN, KEPEMUDAAN DAN OLAHRAGA';
  const kopHeader3 = eventProfile?.kopTextHeader3 || `PANITIA FESTIVAL TUNAS BAHASA IBU (FTBI) KECAMATAN ${districtName.toUpperCase()}`;
  const kopAddress = eventProfile?.kopTextAddress || `Sekretariat: Kantor Koordinator Wilayah Pendidikan Kecamatan ${districtName} • ${schools.length} SD Negeri`;

  // Dynamic current calendar date formatted in Indonesian locale
  const currentDateFormatted = useMemo(() => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const yearNum = now.getFullYear();

    return {
      openingDateText: `${dayName} tanggal ${dateNum} ${monthName} ${yearNum}`,
      settingDateText: `${dateNum} ${monthName} ${yearNum}`,
    };
  }, []);

  React.useEffect(() => {
    if (propCategoryId && propCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(propCategoryId);
    }
  }, [propCategoryId]);

  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const categoryJudges = judges.filter((j) => j.categoryId === activeCategory?.id);
  const categoryParticipants = participants.filter((p) => p.categoryId === activeCategory?.id);

  // Helper function to evaluate participants for ANY category
  const getCategoryResults = (cat: CompetitionCategory) => {
    const catJudges = judges.filter((j) => j.categoryId === cat.id);
    const catParticipants = participants.filter((p) => p.categoryId === cat.id);

    return catParticipants.map((participant) => {
      const school = schools.find((s) => s.id === participant.schoolId) || {
        id: participant.schoolId,
        name: `SD (${participant.schoolId})`,
        npsn: '-',
        village: '-',
        district: 'Pekutatan',
        headmaster: '-',
        contactPhone: '-',
      };
      const effectiveJudges = getEffectiveJudgesForParticipant(participant, catJudges);

      const activeJudgeEvaluations = effectiveJudges.map((ej) => {
        const evaluation = evaluations.find(
          (e) => e.participantId === participant.id && e.judgeId === ej.effectiveJudge.id
        );
        return {
          ...ej,
          evaluation,
        };
      });

      const completedEvaluations = activeJudgeEvaluations.filter((ae) => ae.evaluation !== undefined);
      const isCompleted = completedEvaluations.length === 3;

      const totalScore = completedEvaluations.reduce(
        (sum, item) => sum + (item.evaluation?.totalWeightedScore || 0),
        0
      );
      const finalScore = isCompleted ? parseFloat((totalScore / 3).toFixed(2)) : 0;

      const isEligibleForChampionship = participant.grade === 'Kelas 5' || participant.grade === 'Kelas 6';

      return {
        participant,
        school,
        category: cat,
        effectiveJudges: activeJudgeEvaluations,
        completedCount: completedEvaluations.length,
        isCompleted,
        finalScore,
        isEligibleForChampionship,
      };
    });
  };

  // Computed results for all 7 categories
  const allCategoryResults = useMemo(() => {
    return categories.map((cat) => {
      const results = getCategoryResults(cat);
      const putra = results
        .filter((r) => r.participant.gender === 'L')
        .sort((a, b) => {
          if (a.isCompleted && !b.isCompleted) return -1;
          if (!a.isCompleted && b.isCompleted) return 1;
          return b.finalScore - a.finalScore;
        });
      const putri = results
        .filter((r) => r.participant.gender === 'P')
        .sort((a, b) => {
          if (a.isCompleted && !b.isCompleted) return -1;
          if (!a.isCompleted && b.isCompleted) return 1;
          return b.finalScore - a.finalScore;
        });
      return {
        category: cat,
        results,
        putra,
        putri,
      };
    });
  }, [categories, judges, participants, evaluations, schools]);

  // Computed results for active category
  const activeCategoryResults = useMemo(() => {
    return getCategoryResults(activeCategory);
  }, [activeCategory, judges, participants, evaluations, schools]);

  // Sort and rank Putra (Laki-laki) - Strictly Juara 1, 2, 3
  const putraResults = useMemo(() => {
    return activeCategoryResults
      .filter((r) => r.participant.gender === 'L')
      .sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.finalScore - a.finalScore;
      });
  }, [activeCategoryResults]);

  // Sort and rank Putri (Perempuan) - Strictly Juara 1, 2, 3
  const putriResults = useMemo(() => {
    return activeCategoryResults
      .filter((r) => r.participant.gender === 'P')
      .sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.finalScore - a.finalScore;
      });
  }, [activeCategoryResults]);

  // Calculate Overall School Standings (Juara Umum) across ALL 7 categories
  const schoolStandings: SchoolMedalStanding[] = useMemo(() => {
    // Map to accumulate achievements
    const standingsMap = new Map<string, SchoolMedalStanding>();

    // Initialize map for all schools
    schools.forEach((sch) => {
      const schParticipants = participants.filter((p) => p.schoolId === sch.id);
      standingsMap.set(sch.id, {
        school: sch,
        goldCount: 0,
        silverCount: 0,
        bronzeCount: 0,
        totalMedals: 0,
        totalParticipants: schParticipants.length,
        details: [],
      });
    });

    // Evaluate Juara 1, 2, 3 for every category and gender
    categories.forEach((cat) => {
      const catResults = getCategoryResults(cat);

      // Putra Top 3
      const catPutra = catResults
        .filter((r) => r.participant.gender === 'L' && r.isCompleted)
        .sort((a, b) => b.finalScore - a.finalScore);

      if (catPutra[0]) {
        const item = standingsMap.get(catPutra[0].school.id);
        if (item) {
          item.goldCount += 1;
          item.totalMedals += 1;
          item.details.push({
            category: cat,
            gender: 'L',
            rank: 1,
            participant: catPutra[0].participant,
            score: catPutra[0].finalScore,
          });
        }
      }
      if (catPutra[1]) {
        const item = standingsMap.get(catPutra[1].school.id);
        if (item) {
          item.silverCount += 1;
          item.totalMedals += 1;
          item.details.push({
            category: cat,
            gender: 'L',
            rank: 2,
            participant: catPutra[1].participant,
            score: catPutra[1].finalScore,
          });
        }
      }
      if (catPutra[2]) {
        const item = standingsMap.get(catPutra[2].school.id);
        if (item) {
          item.bronzeCount += 1;
          item.totalMedals += 1;
          item.details.push({
            category: cat,
            gender: 'L',
            rank: 3,
            participant: catPutra[2].participant,
            score: catPutra[2].finalScore,
          });
        }
      }

      // Putri Top 3
      const catPutri = catResults
        .filter((r) => r.participant.gender === 'P' && r.isCompleted)
        .sort((a, b) => b.finalScore - a.finalScore);

      if (catPutri[0]) {
        const item = standingsMap.get(catPutri[0].school.id);
        if (item) {
          item.goldCount += 1;
          item.totalMedals += 1;
          item.details.push({
            category: cat,
            gender: 'P',
            rank: 1,
            participant: catPutri[0].participant,
            score: catPutri[0].finalScore,
          });
        }
      }
      if (catPutri[1]) {
        const item = standingsMap.get(catPutri[1].school.id);
        if (item) {
          item.silverCount += 1;
          item.totalMedals += 1;
          item.details.push({
            category: cat,
            gender: 'P',
            rank: 2,
            participant: catPutri[1].participant,
            score: catPutri[1].finalScore,
          });
        }
      }
      if (catPutri[2]) {
        const item = standingsMap.get(catPutri[2].school.id);
        if (item) {
          item.bronzeCount += 1;
          item.totalMedals += 1;
          item.details.push({
            category: cat,
            gender: 'P',
            rank: 3,
            participant: catPutri[2].participant,
            score: catPutri[2].finalScore,
          });
        }
      }
    });

    // Hierarchical Sorting Rules (Aturan Penentuan Juara Umum):
    // 1. Juara 1 (Emas) terbanyak
    // 2. Jika sama -> Juara 2 (Perak) terbanyak
    // 3. Jika sama -> Juara 3 (Perunggu) terbanyak
    // 4. Jika masih sama -> Jumlah peserta yang didaftarkan dalam lomba oleh sekolah (terbanyak)
    const sortedList = Array.from(standingsMap.values()).sort((a, b) => {
      // 1. Gold count
      if (b.goldCount !== a.goldCount) {
        return b.goldCount - a.goldCount;
      }
      // 2. Silver count
      if (b.silverCount !== a.silverCount) {
        return b.silverCount - a.silverCount;
      }
      // 3. Bronze count
      if (b.bronzeCount !== a.bronzeCount) {
        return b.bronzeCount - a.bronzeCount;
      }
      // 4. Total participants registered (Tie-breaker)
      if (b.totalParticipants !== a.totalParticipants) {
        return b.totalParticipants - a.totalParticipants;
      }
      // Alphabetical as last resort
      return a.school.name.localeCompare(b.school.name);
    });

    return sortedList;
  }, [categories, schools, participants, judges, evaluations]);

  // Rank badge for individual category results (Strictly Juara 1, 2, 3 only)
  const getRankBadge = (item: typeof activeCategoryResults[0], index: number, gender: 'L' | 'P') => {
    if (!item.isCompleted) {
      return <span className="text-xs text-slate-400 font-medium">Belum Lengkap ({item.completedCount}/3)</span>;
    }

    const rankNumber = index + 1;
    const genderLabel = gender === 'L' ? 'Putra' : 'Putri';

    if (rankNumber === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-900" /> Juara 1 {genderLabel}
        </span>
      );
    }
    if (rankNumber === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-slate-200 text-slate-900 font-black text-xs px-3 py-1 rounded-full shadow-xs border border-slate-300">
          <Medal className="w-3.5 h-3.5 text-slate-700" /> Juara 2 {genderLabel}
        </span>
      );
    }
    if (rankNumber === 3) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-700 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
          <Medal className="w-3.5 h-3.5 text-amber-200" /> Juara 3 {genderLabel}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        Peringkat {rankNumber}
      </span>
    );
  };

  const getRankTextOfficial = (isCompleted: boolean, index: number, gender: 'L' | 'P') => {
    if (!isCompleted) return '-';
    const rankNumber = index + 1;
    const genderLabel = gender === 'L' ? 'PUTRA' : 'PUTRI';
    if (rankNumber === 1) return `JUARA I ${genderLabel}`;
    if (rankNumber === 2) return `JUARA II ${genderLabel}`;
    if (rankNumber === 3) return `JUARA III ${genderLabel}`;
    return `Peringkat ${rankNumber}`;
  };

  // Helper component to render an individual category table for a specific gender
  const renderCategoryTable = (
    divisionResults: typeof activeCategoryResults,
    gender: 'L' | 'P',
    title: string,
    headerBadge: string
  ) => {
    const completedCount = divisionResults.filter((r) => r.isCompleted).length;

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xs ${
              gender === 'L' ? 'bg-blue-800 text-white' : 'bg-rose-700 text-white'
            }`}>
              {gender === 'L' ? '♂' : '♀'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {title}
                </h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  gender === 'L' 
                    ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {headerBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Peringkat Juara {gender === 'L' ? 'Putra' : 'Putri'} (Penentuan Juara 1, Juara 2, dan Juara 3)
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-mono self-start sm:self-auto font-semibold">
            {completedCount} / {divisionResults.length} Peserta Selesai Dinilai
          </div>
        </div>

        {divisionResults.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Belum ada peserta {gender === 'L' ? 'Putra' : 'Putri'} yang terdaftar pada cabang lomba ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 text-center w-28 sm:w-36">Kejuaraan</th>
                  <th className="py-3.5 px-3 w-16 text-center">Undian</th>
                  <th className="py-3.5 px-4">Nama Peserta & Sekolah</th>
                  <th className="py-3.5 px-3 text-center">Juri 1</th>
                  <th className="py-3.5 px-3 text-center">Juri 2</th>
                  <th className="py-3.5 px-3 text-center">Juri 3</th>
                  <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {divisionResults.map((item, index) => {
                  return (
                    <tr
                      key={item.participant.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center">
                        {getRankBadge(item, index, gender)}
                      </td>
                      
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 text-center">
                        #{item.participant.lotNo}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.participant.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.school?.name} • <span className="font-mono">{item.participant.grade}</span> • <span className="font-mono text-[11px]">{item.participant.registrationNo}</span>
                        </div>
                      </td>

                      {/* Scores from 3 Active Judges */}
                      {item.effectiveJudges.map((ej) => {
                        const scoreVal = ej.evaluation?.totalWeightedScore;
                        return (
                          <td key={ej.originalJudge.id} className="py-3.5 px-3 text-center border-l border-slate-100">
                            {scoreVal !== undefined ? (
                              <span className="font-mono font-bold text-sm text-slate-900">
                                {scoreVal.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 italic font-mono">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Final Score */}
                      <td className="py-3.5 px-4 text-center border-l border-slate-200">
                        {item.isCompleted ? (
                          <span className="font-mono text-base font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {item.finalScore.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono italic">
                            ({item.completedCount}/3 Juri)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center border-l border-slate-200">
                        {item.isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Sah
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Menunggu Penilaian</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Navigation Tabs: Per Cabang Lomba VS Juara Umum Sekolah */}
      <div className="bg-slate-900 rounded-3xl p-2 sm:p-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('categories')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'categories'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Per Cabang Lomba (Putra & Putri)</span>
          </button>

          <button
            onClick={() => setViewMode('overall')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'overall'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-950" />
            <span>Sub Menu: Juara Umum Sekolah</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium px-3 text-center sm:text-right">
          {viewMode === 'categories' ? '7 Cabang Lomba FTBI SD' : `Akumulasi ${schools.length} Satuan Pendidikan SD`}
        </div>
      </div>

      {/* PANEL TOMBOL UNDUH EXCEL RESMI FTBI */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-800/20 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor Format Microsoft Excel (.xlsx)</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Download Rekapitulasi Excel FTBI SD 2026
            </h3>
            <p className="text-xs text-slate-500">
              Unduh data hasil kejuaraan yang terbagi rapi dan terstruktur agar mudah dipahami:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            {/* Opsi 1: Rekap Juara Putra (7 Sheet) */}
            <button
              id="btn-download-excel-putra"
              onClick={() => exportJuaraPutraToExcel(categories, schools, judges, participants, evaluations, eventProfile)}
              className="px-4 py-3 bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-blue-700"
              title="Unduh File Excel Khusus Juara Putra (7 Sheet Cabang Lomba Lengkap Nilai Juri 1, 2, 3, Nilai Akhir, dan Peringkat)"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-200" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-blue-200 leading-none">File 1 (7 Sheet)</div>
                <div className="text-xs font-black">Unduh Excel Juara Putra</div>
              </div>
            </button>

            {/* Opsi 2: Rekap Juara Putri (7 Sheet) */}
            <button
              id="btn-download-excel-putri"
              onClick={() => exportJuaraPutriToExcel(categories, schools, judges, participants, evaluations, eventProfile)}
              className="px-4 py-3 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-rose-600"
              title="Unduh File Excel Khusus Juara Putri (7 Sheet Cabang Lomba Lengkap Nilai Juri 1, 2, 3, Nilai Akhir, dan Peringkat)"
            >
              <FileSpreadsheet className="w-4 h-4 text-rose-200" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-rose-200 leading-none">File 2 (7 Sheet)</div>
                <div className="text-xs font-black">Unduh Excel Juara Putri</div>
              </div>
            </button>

            {/* Opsi 3: Rekap Juara Umum Sekolah */}
            <button
              id="btn-download-excel-juara-umum"
              onClick={() => exportRekapJuaraUmumSekolahToExcel(schoolStandings, eventProfile)}
              className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-amber-500"
              title="Unduh Rekap Klasemen Juara Umum Sekolah (Peringkat Klasemen, Medali Emas, Perak, Perunggu, & Rincian Juara)"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-amber-200 leading-none">File 3 (Juara Umum)</div>
                <div className="text-xs font-black">Unduh Excel Juara Umum</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: PER CABANG LOMBA / SEMUA CABANG LOMBA */}
      {viewMode === 'categories' && (
        <div className="space-y-6">
          {/* Category selector dropdown and print buttons */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <label htmlFor="select-rekap-category" className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                Pilih Tampilan Dashboard Cabang Lomba:
              </label>
              <div className="relative">
                <select
                  id="select-rekap-category"
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    if (onSelectCategory && e.target.value !== 'ALL') {
                      onSelectCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border-2 border-emerald-700/60 hover:border-emerald-700 text-slate-900 font-extrabold text-sm sm:text-base rounded-2xl px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition cursor-pointer shadow-2xs"
                >
                  <option value="ALL" className="py-2 font-black text-emerald-950 bg-emerald-50">
                    🌟 TAMPILKAN SEMUA 7 CABANG LOMBA (PUTRA & PUTRI SEKALIGUS)
                  </option>
                  <option disabled className="text-slate-300">────────── PILIH PER CABANG ──────────</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="py-2 text-slate-900 font-medium">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 self-stretch md:self-end">
              <button
                id="btn-print-berita-acara"
                onClick={() => setShowBeritaAcara(true)}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                title="Buka Dokumen Resmi Berita Acara Penetapan Juara 1, 2, dan 3"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak Berita Acara</span>
              </button>
            </div>
          </div>

          {/* Gender Division Tabs Filter */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl max-w-fit shadow-2xs">
            <button
              onClick={() => setActiveGenderTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeGenderTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Semua Kategori</span>
            </button>

            <button
              onClick={() => setActiveGenderTab('L')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeGenderTab === 'L'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <span>♂ Juara Putra</span>
            </button>

            <button
              onClick={() => setActiveGenderTab('P')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeGenderTab === 'P'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-900'
              }`}
            >
              <span>♀ Juara Putri</span>
            </button>
          </div>

          {/* Leaderboard Tables by Gender */}
          {selectedCategoryId === 'ALL' ? (
            /* TAMPILAN SEMUA 7 CABANG LOMBA SEKALIGUS */
            <div className="space-y-10">
              {allCategoryResults.map((item, idx) => (
                <div key={item.category.id} className="space-y-6 pt-4 border-t-2 border-slate-200 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-black">
                        {item.category.name.toUpperCase()}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      Total {item.results.length} Peserta (Putra: {item.putra.length} | Putri: {item.putri.length})
                    </span>
                  </div>

                  <div className="space-y-6">
                    {(activeGenderTab === 'all' || activeGenderTab === 'L') && (
                      renderCategoryTable(
                        item.putra,
                        'L',
                        `Papan Skor & Peringkat Juara Putra: ${item.category.name}`,
                        'Kategori Putra'
                      )
                    )}

                    {(activeGenderTab === 'all' || activeGenderTab === 'P') && (
                      renderCategoryTable(
                        item.putri,
                        'P',
                        `Papan Skor & Peringkat Juara Putri: ${item.category.name}`,
                        'Kategori Putri'
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TAMPILAN 1 CABANG LOMBA TERTENTU */
            <div className="space-y-6">
              {(activeGenderTab === 'all' || activeGenderTab === 'L') && (
                renderCategoryTable(
                  putraResults,
                  'L',
                  `Papan Skor & Peringkat Juara Putra: ${activeCategory.name}`,
                  'Kategori Putra'
                )
              )}

              {(activeGenderTab === 'all' || activeGenderTab === 'P') && (
                renderCategoryTable(
                  putriResults,
                  'P',
                  `Papan Skor & Peringkat Juara Putri: ${activeCategory.name}`,
                  'Kategori Putri'
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: SUB MENU JUARA UMUM SEKOLAH */}
      {viewMode === 'overall' && (
        <div className="space-y-6">
          
          {/* Champion Banner / Top Spotlight */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-slate-950/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black text-amber-100 border border-amber-300/30">
                  <Crown className="w-3.5 h-3.5 text-amber-200" />
                  KLASEMEN AKHIR JUARA UMUM FTBI SD 2026
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {schoolStandings[0]?.goldCount > 0 ? (
                    <>Peringkat 1 Juara Umum: <span className="underline decoration-amber-300">{schoolStandings[0].school.name}</span></>
                  ) : (
                    'Perhitungan Perolehan Medali Juara Umum Sekolah'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  Penentuan Juara Umum dihitung dari akumulasi <strong>Juara 1</strong> terbanyak. Jika kembar, menggunakan jumlah <strong>Juara 2</strong>, lalu <strong>Juara 3</strong>, dan jika masih kembar menggunakan <strong>Jumlah Total Peserta yang Didaftarkan</strong> oleh sekolah.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  id="btn-print-juara-umum"
                  onClick={() => setShowBeritaAcaraJuaraUmum(true)}
                  className="px-5 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  Cetak Berita Acara Juara Umum
                </button>
              </div>
            </div>
          </div>

          {/* Tie-breaker Rules Information Bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold block">Aturan Penetapan Juara Umum Sekolah (Piala Bergilir):</span>
              <p className="text-blue-800 leading-relaxed">
                1. Sekolah dengan <strong>Raihan Juara 1 Terbanyak</strong> menempati posisi teratas. <br/>
                2. Jika raihan Juara 1 kembar, maka diperhitungkan <strong>Raihan Juara 2 Terbanyak</strong> di antara sekolah yang kembar tersebut. <br/>
                3. Jika masih kembar, maka diperhitungkan <strong>Raihan Juara 3 Terbanyak</strong>. <br/>
                4. Jika raihan Juara 1, 2, dan 3 tetap kembar, maka digunakan <strong>Jumlah Peserta Terbanyak yang Didaftarkan</strong> oleh sekolah.
              </p>
            </div>
          </div>

          {/* Standings Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Tabel Klasemen Perolehan Medali & Peringkat Sekolah
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Total {schools.length} Satuan Pendidikan SD
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-24">Peringkat</th>
                    <th className="py-3.5 px-4">Nama Sekolah (Satuan Pendidikan)</th>
                    <th className="py-3.5 px-3 text-center w-24 bg-amber-50/60 text-amber-950">
                      🥇 Juara 1
                    </th>
                    <th className="py-3.5 px-3 text-center w-24 bg-slate-100 text-slate-900">
                      🥈 Juara 2
                    </th>
                    <th className="py-3.5 px-3 text-center w-24 bg-amber-100/40 text-amber-900">
                      🥉 Juara 3
                    </th>
                    <th className="py-3.5 px-3 text-center w-28">Total Medali</th>
                    <th className="py-3.5 px-3 text-center w-32 bg-blue-50/50 text-blue-950" title="Kriteria Pemecah Seri Ke-4">
                      👥 Total Peserta
                    </th>
                    <th className="py-3.5 px-4 text-left">Rincian Perolehan Juara</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schoolStandings.map((st, idx) => {
                    const rank = idx + 1;
                    const isChampion = rank === 1 && st.goldCount > 0;
                    const isTopThree = rank <= 3 && st.totalMedals > 0;

                    return (
                      <tr 
                        key={st.school.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isChampion ? 'bg-amber-50/50 font-medium' : ''
                        }`}
                      >
                        <td className="py-4 px-4 text-center">
                          {rank === 1 && st.goldCount > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-2xs">
                              <Crown className="w-3.5 h-3.5 text-amber-900" /> Juara Umum
                            </span>
                          ) : rank === 2 && st.totalMedals > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-900 font-bold text-xs px-2.5 py-0.5 rounded-full">
                              Peringkat 2
                            </span>
                          ) : rank === 3 && st.totalMedals > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-bold text-xs px-2.5 py-0.5 rounded-full">
                              Peringkat 3
                            </span>
                          ) : (
                            <span className="font-mono text-slate-500 font-bold text-xs">
                              #{rank}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {st.school.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            NPSN: <span className="font-mono">{st.school.npsn}</span> • Desa {st.school.village}
                          </div>
                        </td>

                        {/* Gold */}
                        <td className="py-4 px-3 text-center bg-amber-50/30 border-l border-r border-slate-100">
                          <span className={`font-mono text-base font-black ${st.goldCount > 0 ? 'text-amber-700' : 'text-slate-300'}`}>
                            {st.goldCount}
                          </span>
                        </td>

                        {/* Silver */}
                        <td className="py-4 px-3 text-center border-r border-slate-100">
                          <span className={`font-mono text-base font-black ${st.silverCount > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                            {st.silverCount}
                          </span>
                        </td>

                        {/* Bronze */}
                        <td className="py-4 px-3 text-center bg-amber-50/20 border-r border-slate-100">
                          <span className={`font-mono text-base font-black ${st.bronzeCount > 0 ? 'text-amber-900' : 'text-slate-300'}`}>
                            {st.bronzeCount}
                          </span>
                        </td>

                        {/* Total Medals */}
                        <td className="py-4 px-3 text-center border-r border-slate-100">
                          <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {st.totalMedals}
                          </span>
                        </td>

                        {/* Total Registered Participants (Tie-breaker criteria) */}
                        <td className="py-4 px-3 text-center bg-blue-50/30 border-r border-slate-100">
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded-md" title="Digunakan sebagai pemecah seri jika jumlah medali kembar">
                            {st.totalParticipants} Peserta
                          </span>
                        </td>

                        {/* Details */}
                        <td className="py-4 px-4 text-xs">
                          {st.details.length === 0 ? (
                            <span className="text-slate-400 italic">Belum meraih kejuaraan</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {st.details.map((d, dIdx) => (
                                <span
                                  key={dIdx}
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                    d.rank === 1
                                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                                      : d.rank === 2
                                      ? 'bg-slate-200 text-slate-900 border-slate-300'
                                      : 'bg-amber-50 text-amber-900 border-amber-200'
                                  }`}
                                  title={`${d.participant.fullName} - Nilai: ${d.score.toFixed(2)}`}
                                >
                                  <span>{d.rank === 1 ? '🥇' : d.rank === 2 ? '🥈' : '🥉'}</span>
                                  <span>{d.category.name.replace('Lomba ', '')} ({d.gender === 'L' ? 'Pa' : 'Pi'})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Berita Acara Per Cabang Lomba Modal */}
      {showBeritaAcara && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 space-y-6 my-6 print:shadow-none print:border-none print:m-0 print:p-0">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 print:hidden gap-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Berita Acara Penetapan Kejuaraan (Per Cabang Lomba)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Format resmi penetapan Juara 1, 2, dan 3 Putra & Putri
                  </p>
                </div>
              </div>

              {/* Quick Category Switcher inside Modal */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={selectedCategoryId === 'ALL' ? categories[0]?.id : selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    if (onSelectCategory) {
                      onSelectCategory(e.target.value);
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 focus:outline-hidden cursor-pointer"
                  title="Ganti Cabang Lomba Berita Acara"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowBeritaAcara(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Tutup</span>
                </button>
              </div>
            </div>

            {/* Document Body (Standard Official Layout - 1 Page A4 Fit) */}
            <div id="berita-acara-print-area" className="text-slate-900 font-serif leading-snug text-[9.5pt] space-y-1.5 bg-white p-0.5">
              
              {/* 1. KOP SURAT RESMI */}
              {useImageKop ? (
                <div className="text-center border-b-2 border-slate-900 pb-1.5 mb-1.5">
                  <img 
                    src={customKopUrl} 
                    alt="KOP Surat Resmi" 
                    className="w-full max-h-24 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <table className="w-full border-collapse border-b-2 border-slate-900 pb-1.5 mb-1">
                  <tbody>
                    <tr>
                      <td className="w-16 text-center align-middle p-0 border-0">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt="Logo Instansi" 
                            className="w-14 h-14 object-contain mx-auto"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-emerald-800 text-white flex items-center justify-center mx-auto font-bold font-sans text-[10px]">
                            LOGO
                          </div>
                        )}
                      </td>
                      <td className="text-center align-middle px-2 border-0">
                        <div className="text-[9.5pt] font-bold uppercase tracking-wider text-slate-900 font-serif">
                          {kopHeader1}
                        </div>
                        <div className="text-[10.5pt] font-bold uppercase text-slate-950 leading-tight font-serif">
                          {kopHeader2}
                        </div>
                        <div className="text-[11.5pt] font-black uppercase text-slate-950 leading-tight font-serif">
                          {kopHeader3}
                        </div>
                        <div className="text-[8.5pt] font-sans text-slate-700 mt-0.5 leading-tight">
                          {kopAddress}
                        </div>
                      </td>
                      <td className="w-16 p-0 border-0"></td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* 2. JUDUL BERITA ACARA */}
              <div className="text-center pt-0.5 space-y-0.5">
                <h2 className="text-[11.5pt] font-black uppercase tracking-wide underline underline-offset-2 font-serif">
                  BERITA ACARA HASIL PENJURIAN DAN PENETAPAN KEJUARAAN
                </h2>
                <div className="text-[10pt] font-sans font-bold text-slate-900 uppercase">
                  CABANG LOMBA: {activeCategory?.name || 'Cabang Lomba'}
                </div>
                <div className="text-[8.5pt] font-sans text-slate-700 font-mono">
                  Nomor: 400.3.5.4 / {String(categories.findIndex(c => c.id === activeCategory?.id) + 1).padStart(3, '0')} / PAN-FTBI-SD-{districtName.toUpperCase()} / {eventProfile?.eventYear || '2026'}
                </div>
              </div>

              {/* 3. URAIAN PEMBUKA RESMI */}
              <div className="space-y-1 text-[9pt] font-serif leading-snug text-justify pt-0.5">
                <p>
                  Pada hari ini, <strong>{currentDateFormatted.openingDateText}</strong>, bertempat di <strong>{activeCategory?.location || eventProfile?.secretariatAddress || `Kecamatan ${districtName}`}</strong>, telah diselenggarakan penilaian dan musyawarah penetapan kejuaraan untuk cabang lomba <strong>{activeCategory?.name}</strong> dalam rangka kegiatan <strong>{eventName}</strong> {targetLevel} Tingkat Kecamatan <strong>{districtName}</strong> Kabupaten <strong>{regencyName}</strong> Tahun <strong>{eventProfile?.eventYear || '2026'}</strong>.
                </p>
                <p>
                  Penilaian dilaksanakan oleh Dewan Juri secara independen, profesional, objektif, dan berintegritas berdasarkan Petunjuk Teknis serta kriteria resmi. Berdasarkan rekapitulasi penilaian dan musyawarah mufakat, Dewan Juri memutuskan dan menetapkan <strong>Juara 1, Juara 2, dan Juara 3</strong> sebagai berikut:
                </p>
              </div>

              {/* Helper for top 3 rows */}
              {(() => {
                const getTop3 = (resList: typeof putraResults) => {
                  return [0, 1, 2].map((idx) => {
                    const r = resList[idx];
                    const rankLabel = idx === 0 ? 'JUARA 1' : idx === 1 ? 'JUARA 2' : 'JUARA 3';
                    
                    let formattedGrade = '-';
                    if (r?.participant?.grade) {
                      const gStr = String(r.participant.grade).trim();
                      formattedGrade = gStr.toLowerCase().startsWith('kelas') ? gStr : `Kelas ${gStr}`;
                    }

                    return {
                      no: idx + 1,
                      rankLabel,
                      lotNo: r?.participant?.lotNo ? `#${r.participant.lotNo}` : '-',
                      name: r?.participant?.fullName || '-',
                      grade: formattedGrade,
                      school: r?.school?.name || '-',
                      score: r?.isCompleted ? r.finalScore.toFixed(2) : (r ? 'Dalam Proses' : '-'),
                      status: r?.isCompleted ? 'Sah / Terpilih' : (r ? 'Menunggu Juri' : '-'),
                    };
                  });
                };

                const top3Putra = getTop3(putraResults);
                const top3Putri = getTop3(putriResults);

                return (
                  <div className="space-y-1.5 pt-0.5 font-sans">
                    {/* 4. TABEL HASIL KEJUARAAN PUTRA (JUARA 1, 2, DAN 3) */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[8.5pt] font-extrabold uppercase text-slate-900 bg-slate-100 border border-slate-400 px-2 py-0.5">
                        <span>A. HASIL KEJUARAAN KATEGORI PUTRA (JUARA 1, 2, DAN 3)</span>
                        <span className="text-[8pt] font-bold text-slate-700 font-mono">
                          Cabang: {activeCategory?.name}
                        </span>
                      </div>
                      <table className="w-full text-left border border-slate-900 border-collapse text-[8.5pt]">
                        <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                          <tr>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-7">No.</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-32">Peringkat / Juara</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-14">No. Undian</th>
                            <th className="py-1 px-1.5 border border-slate-900">Nama Pemenang Putra</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-14">Kelas</th>
                            <th className="py-1 px-1.5 border border-slate-900">Asal Satuan Pendidikan (SD)</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-16">Nilai Akhir</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-20">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {top3Putra.map((item, idx) => (
                            <tr key={idx} className={idx === 0 ? 'bg-amber-50/50' : ''}>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center font-bold">{item.no}</td>
                              <td className="py-0.5 px-1.5 border border-slate-400 font-black text-[8.5pt]">
                                {idx === 0 && <span className="text-amber-950">{item.rankLabel}</span>}
                                {idx === 1 && <span className="text-slate-800">{item.rankLabel}</span>}
                                {idx === 2 && <span className="text-amber-900">{item.rankLabel}</span>}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center font-mono font-bold">{item.lotNo}</td>
                              <td className="py-0.5 px-1.5 border border-slate-400 font-bold text-slate-950">
                                {item.name}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center text-slate-800 text-[8pt]">
                                {item.grade}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 font-semibold text-slate-900">
                                {item.school}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center font-mono font-black text-[9pt] text-slate-950">
                                {item.score}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center text-[8pt] font-bold text-emerald-800">
                                {item.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 5. TABEL HASIL KEJUARAAN PUTRI (JUARA 1, 2, DAN 3) */}
                    <div className="space-y-0.5 pt-0.5">
                      <div className="flex items-center justify-between text-[8.5pt] font-extrabold uppercase text-slate-900 bg-slate-100 border border-slate-400 px-2 py-0.5">
                        <span>B. HASIL KEJUARAAN KATEGORI PUTRI (JUARA 1, 2, DAN 3)</span>
                        <span className="text-[8pt] font-bold text-slate-700 font-mono">
                          Cabang: {activeCategory?.name}
                        </span>
                      </div>
                      <table className="w-full text-left border border-slate-900 border-collapse text-[8.5pt]">
                        <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                          <tr>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-7">No.</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-32">Peringkat / Juara</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-14">No. Undian</th>
                            <th className="py-1 px-1.5 border border-slate-900">Nama Pemenang Putri</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-14">Kelas</th>
                            <th className="py-1 px-1.5 border border-slate-900">Asal Satuan Pendidikan (SD)</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-16">Nilai Akhir</th>
                            <th className="py-1 px-1.5 border border-slate-900 text-center w-20">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {top3Putri.map((item, idx) => (
                            <tr key={idx} className={idx === 0 ? 'bg-amber-50/50' : ''}>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center font-bold">{item.no}</td>
                              <td className="py-0.5 px-1.5 border border-slate-400 font-black text-[8.5pt]">
                                {idx === 0 && <span className="text-amber-950">{item.rankLabel}</span>}
                                {idx === 1 && <span className="text-slate-800">{item.rankLabel}</span>}
                                {idx === 2 && <span className="text-amber-900">{item.rankLabel}</span>}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center font-mono font-bold">{item.lotNo}</td>
                              <td className="py-0.5 px-1.5 border border-slate-400 font-bold text-slate-950">
                                {item.name}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center text-slate-800 text-[8pt]">
                                {item.grade}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 font-semibold text-slate-900">
                                {item.school}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center font-mono font-black text-[9pt] text-slate-950">
                                {item.score}
                              </td>
                              <td className="py-0.5 px-1.5 border border-slate-400 text-center text-[8pt] font-bold text-emerald-800">
                                {item.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* 6. URAIAN PENUTUP */}
              <p className="text-[9pt] font-serif leading-snug text-justify pt-0.5">
                Demikian Berita Acara Hasil Penjurian dan Penetapan Kejuaraan ini dibuat dengan sebenar-benarnya dalam rangkap yang cukup untuk dapat dipergunakan sebagaimana mestinya. Keputusan Dewan Juri bersifat mutlak, final, dan tidak dapat diganggu gugat.
              </p>

              {/* 7. TANDA TANGAN JURI 1, 2, 3 DAN KETUA PANITIA */}
              {(() => {
                const catJudges = judges.filter((j) => j.categoryId === activeCategory?.id);
                const juri1 = catJudges.find((j) => j.role === 'Juri 1') || catJudges[0];
                const juri2 = catJudges.find((j) => j.role === 'Juri 2') || catJudges.find((j) => j.id !== juri1?.id);
                const juri3 = catJudges.find((j) => j.role === 'Juri 3') || catJudges.find((j) => j.id !== juri1?.id && j.id !== juri2?.id);

                const getJudgeSubtext = (judge?: Judge) => {
                  if (!judge) return 'NIP. -';
                  if (judge.nip && judge.nip.trim() !== '') return `NIP. ${judge.nip}`;
                  if (judge.schoolId === 'juri-tamu') return 'Juri Tamu';
                  const school = schools.find((s) => s.id === judge.schoolId);
                  return school?.name || 'Dewan Juri';
                };

                const catNameClean = (activeCategory?.name || '')
                  .replace(/^Lomba\s+/i, '')
                  .toUpperCase();

                return (
                  <div className="pt-1 font-serif space-y-1">
                    <div className="text-right text-[9pt] text-slate-900">
                      Ditetapkan di: {districtName}, {currentDateFormatted.settingDateText}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-center font-bold text-slate-950 uppercase tracking-wide text-[9.5pt] mb-1">
                        TIM DEWAN JURI CABANG LOMBA {catNameClean}
                      </div>
                      
                      {/* Tabel 3 Kolom Dewan Juri (Juri 1, Juri 2, Juri 3) */}
                      <table className="w-full border-collapse border-0 my-0.5">
                        <tbody>
                          <tr>
                            <td className="w-1/3 text-center align-top p-0.5 border-0">
                              <div className="text-slate-900 font-bold text-[9pt]">Juri I (Penilai),</div>
                              <div className="h-11"></div>
                              <div className="font-bold underline text-slate-950 text-[9.5pt]">
                                {juri1?.name || '(Belum Ditetapkan)'}
                              </div>
                              <div className="text-[8.5pt] text-slate-800 font-mono whitespace-nowrap">
                                {getJudgeSubtext(juri1)}
                              </div>
                            </td>
                            <td className="w-1/3 text-center align-top p-0.5 border-0">
                              <div className="text-slate-900 font-bold text-[9pt]">Juri II (Penilai),</div>
                              <div className="h-11"></div>
                              <div className="font-bold underline text-slate-950 text-[9.5pt]">
                                {juri2?.name || '(Belum Ditetapkan)'}
                              </div>
                              <div className="text-[8.5pt] text-slate-800 font-mono whitespace-nowrap">
                                {getJudgeSubtext(juri2)}
                              </div>
                            </td>
                            <td className="w-1/3 text-center align-top p-0.5 border-0">
                              <div className="text-slate-900 font-bold text-[9pt]">Juri III (Penilai),</div>
                              <div className="h-11"></div>
                              <div className="font-bold underline text-slate-950 text-[9.5pt]">
                                {juri3?.name || '(Belum Ditetapkan)'}
                              </div>
                              <div className="text-[8.5pt] text-slate-800 font-mono whitespace-nowrap">
                                {getJudgeSubtext(juri3)}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mengetahui Ketua Panitia (Tengah) */}
                    <table className="w-full border-collapse border-0 mt-1">
                      <tbody>
                        <tr>
                          <td className="w-1/4 border-0"></td>
                          <td className="w-1/2 text-center align-top p-0 border-0">
                            <div className="text-slate-900 text-[9pt]">Mengetahui & Menyetujui,</div>
                            <div className="font-bold text-slate-950 text-[9.5pt] mt-0.5 leading-snug">
                              Ketua Panitia Pelaksana {eventName}<br />Tingkat Kecamatan {districtName}
                            </div>
                            <div className="h-11"></div>
                            <div className="font-bold underline text-slate-950 text-[10pt]">
                              {committeeChairman || '(Belum Ditetapkan)'}
                            </div>
                            <div className="text-[8.5pt] text-slate-800 font-mono whitespace-nowrap">
                              {committeeChairmanNip ? `NIP. ${committeeChairmanNip}` : 'NIP. -'}
                            </div>
                          </td>
                          <td className="w-1/4 border-0"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}

            </div>

            {/* Bottom Footer Actions (Hidden on Print) */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <p className="text-xs text-slate-500">
                Dokumen Berita Acara resmi penetapan Juara 1, 2, dan 3 ({activeCategory?.name}).
              </p>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowBeritaAcara(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Tutup / Keluar
                </button>
                <button
                  type="button"
                  id="btn-download-berita-acara-cabang"
                  onClick={() => {
                    const printElem = document.getElementById('berita-acara-print-area');
                    const content = printElem ? printElem.innerHTML : '';
                    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Berita Acara - ${activeCategory?.name || 'Cabang Lomba'}</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 0; margin: 0; line-height: 1.25; font-size: 9.5pt; }
    table { width: 100%; border-collapse: collapse; margin: 2px 0; }
    th, td { border: 1px solid #000; padding: 2px 4px; font-size: 8.5pt; }
    th { background: #f1f5f9; text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-serif { font-family: 'Times New Roman', Times, serif; }
    .font-sans { font-family: Arial, Helvetica, sans-serif; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .underline { text-decoration: underline; }
    .uppercase { text-transform: uppercase; }
    .whitespace-nowrap { white-space: nowrap; }
    .border-0 { border: none !important; }
    .h-11 { height: 42px; min-height: 42px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Berita_Acara_${(activeCategory?.name || 'Cabang_Lomba').replace(/\s+/g, '_')}.html`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Unduh Berita Acara sebagai file Dokumen/PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen (HTML)</span>
                </button>
                <button
                  type="button"
                  id="btn-print-berita-acara-action"
                  onClick={() => {
                    const printElem = document.getElementById('berita-acara-print-area');
                    if (!printElem) {
                      window.print();
                      return;
                    }
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cetak Berita Acara - ${activeCategory?.name || 'Cabang Lomba'}</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 0; margin: 0; line-height: 1.25; font-size: 9.5pt; }
    table { width: 100%; border-collapse: collapse; margin: 2px 0; }
    th, td { border: 1px solid #000; padding: 2px 4px; font-size: 8.5pt; }
    th { background: #f1f5f9; text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-serif { font-family: 'Times New Roman', Times, serif; }
    .font-sans { font-family: Arial, Helvetica, sans-serif; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .underline { text-decoration: underline; }
    .uppercase { text-transform: uppercase; }
    .whitespace-nowrap { white-space: nowrap; }
    .border-0 { border: none !important; }
    .h-11 { height: 42px; min-height: 42px; }
  </style>
</head>
<body>
  ${printElem.innerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`);
                      printWindow.document.close();
                    } else {
                      window.print();
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Cetak Berita Acara (Print)</span>
                </button>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Official Berita Acara JUARA UMUM SEKOLAH Modal */}
      {showBeritaAcaraJuaraUmum && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 space-y-6 my-6 print:shadow-none print:border-none print:m-0 print:p-0">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Format Resmi Berita Acara Penetapan Juara Umum Sekolah</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBeritaAcaraJuaraUmum(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Tutup</span>
                </button>
              </div>
            </div>

            {/* Document Body (Standard Official Layout - 1 Page A4 Fit) */}
            <div id="berita-acara-juara-umum-print-area" className="text-slate-900 font-serif leading-normal text-[10pt] space-y-2 bg-white p-1">
              
              {/* 1. KOP SURAT RESMI */}
              {useImageKop ? (
                <div className="text-center border-b-2 border-slate-900 pb-2 mb-2">
                  <img 
                    src={customKopUrl} 
                    alt="KOP Surat Resmi" 
                    className="w-full max-h-24 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <table className="w-full border-collapse border-b-2 border-slate-900 pb-2 mb-1.5">
                  <tbody>
                    <tr>
                      <td className="w-16 text-center align-middle p-0 border-0">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt="Logo Instansi" 
                            className="w-14 h-14 object-contain mx-auto"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-emerald-800 text-white flex items-center justify-center mx-auto font-bold font-sans text-[10px]">
                            LOGO
                          </div>
                        )}
                      </td>
                      <td className="text-center align-middle px-2 border-0">
                        <div className="text-[10pt] font-bold uppercase tracking-wider text-slate-900 font-serif">
                          {kopHeader1}
                        </div>
                        <div className="text-[11pt] font-bold uppercase text-slate-950 leading-tight font-serif">
                          {kopHeader2}
                        </div>
                        <div className="text-[12pt] font-black uppercase text-slate-950 mt-0.5 leading-tight font-serif">
                          {kopHeader3}
                        </div>
                        <div className="text-[8.5pt] font-sans text-slate-700 mt-0.5 leading-tight">
                          {kopAddress}
                        </div>
                      </td>
                      <td className="w-16 p-0 border-0"></td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* 2. JUDUL BERITA ACARA JUARA UMUM */}
              <div className="text-center pt-0.5 space-y-0.5">
                <h2 className="text-[12pt] font-black uppercase tracking-wide underline underline-offset-2 font-serif">
                  BERITA ACARA PENETAPAN JUARA UMUM KONTINGEN SEKOLAH
                </h2>
                <div className="text-[10.5pt] font-sans font-bold text-slate-900 uppercase pt-0.5">
                  FESTIVAL TUNAS BAHASA IBU (FTBI) TINGKAT KECAMATAN {districtName.toUpperCase()}
                </div>
                <div className="text-[9pt] font-sans text-slate-700 font-mono">
                  Nomor: 400.3.5.4 / 085 / PAN-FTBI-SD-{districtName.toUpperCase()} / {eventProfile?.eventYear || '2026'}
                </div>
              </div>

              {/* 3. URAIAN PEMBUKA RESMI */}
              <div className="space-y-1 text-[10pt] font-serif leading-relaxed text-justify pt-0.5">
                <p>
                  Pada hari ini, <strong>{currentDateFormatted.openingDateText}</strong>, bertempat di <strong>{eventProfile?.secretariatAddress || `Sekretariat Panitia Kecamatan ${districtName}`}</strong>, Panitia Pelaksana dan Dewan Juri <strong>{eventName}</strong> {targetLevel} Tingkat Kecamatan <strong>{districtName}</strong> Kabupaten <strong>{regencyName}</strong> Tahun <strong>{eventProfile?.eventYear || '2026'}</strong> telah melaksanakan rekapitulasi akhir perolehan juara dari seluruh 7 (tujuh) cabang lomba putra dan putri.
                </p>
                <p>
                  Berdasarkan akumulasi perolehan juara resmi (Juara 1 terbanyak, disusul Juara 2, Juara 3, dan Jumlah Peserta Terdaftar), maka ditetapkan peringkat <strong>Juara Umum Kontingen Sekolah (Juara 1, 2, dan 3)</strong> sebagai berikut:
                </p>
              </div>

              {/* 4. HIGHLIGHT JUARA UMUM I */}
              {schoolStandings[0] && (
                <div className="border border-slate-900 p-2 bg-amber-50/70 text-center space-y-0.5 font-sans my-1 rounded-sm">
                  <div className="text-[9pt] font-black uppercase tracking-wider text-amber-950">
                    PERAIH JUARA UMUM 1 (PIALA BERGILIR KONTINGEN SEKOLAH)
                  </div>
                  <div className="text-[12.5pt] font-black text-slate-950 uppercase font-serif">
                    {schoolStandings[0].school.name}
                  </div>
                  <div className="text-[9pt] text-slate-900 font-medium">
                    Perolehan Juara: <strong>{schoolStandings[0].goldCount} Juara 1</strong>, <strong>{schoolStandings[0].silverCount} Juara 2</strong>, <strong>{schoolStandings[0].bronzeCount} Juara 3</strong> &bull; Total: <strong>{schoolStandings[0].totalMedals} Juara</strong> ({schoolStandings[0].totalParticipants} Peserta)
                  </div>
                </div>
              )}

              {/* 5. TABEL KLASEMEN AKHIR MEDALI JUARA 1, 2, DAN 3 */}
              {(() => {
                const top3Schools = schoolStandings.slice(0, 3);
                return (
                  <div className="space-y-1 pt-0.5 font-sans">
                    <div className="flex items-center justify-between text-[9pt] font-extrabold uppercase text-slate-900 bg-slate-100 border border-slate-400 px-2 py-1">
                      <span>DAFTAR PERAIH KEJUARAAN UMUM KONTINGEN SEKOLAH (JUARA 1, 2, DAN 3)</span>
                      <span className="text-[8.5pt] font-bold text-slate-700 font-mono">
                        Kecamatan {districtName}
                      </span>
                    </div>
                    <table className="w-full text-left border border-slate-900 border-collapse text-[9pt]">
                      <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                        <tr>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-10">No.</th>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-40">Peringkat / Juara</th>
                          <th className="py-1.5 px-2 border border-slate-900">Nama Satuan Pendidikan (SD)</th>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-20 bg-amber-100/50">Juara 1</th>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-20 bg-slate-200/50">Juara 2</th>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-20 bg-amber-200/40">Juara 3</th>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-24">Total Juara</th>
                          <th className="py-1.5 px-2 border border-slate-900 text-center w-24">Kontingen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top3Schools.map((st, idx) => {
                          const rankLabel = idx === 0 ? 'JUARA UMUM 1' : idx === 1 ? 'JUARA UMUM 2' : 'JUARA UMUM 3';
                          return (
                            <tr key={st.school.id} className={idx === 0 ? 'bg-amber-50/60 font-semibold' : ''}>
                              <td className="py-1.5 px-2 border border-slate-400 text-center font-bold">{idx + 1}</td>
                              <td className="py-1.5 px-2 border border-slate-400 text-center font-black text-[9pt]">
                                {idx === 0 && <span className="text-amber-950">{rankLabel}</span>}
                                {idx === 1 && <span className="text-slate-800">{rankLabel}</span>}
                                {idx === 2 && <span className="text-amber-900">{rankLabel}</span>}
                              </td>
                              <td className="py-1.5 px-2 border border-slate-400 font-bold text-slate-950">{st.school.name}</td>
                              <td className="py-1.5 px-2 border border-slate-400 text-center font-mono font-black text-amber-950 bg-amber-50/30">{st.goldCount}</td>
                              <td className="py-1.5 px-2 border border-slate-400 text-center font-mono font-black text-slate-800 bg-slate-100/30">{st.silverCount}</td>
                              <td className="py-1.5 px-2 border border-slate-400 text-center font-mono font-black text-amber-900 bg-amber-50/20">{st.bronzeCount}</td>
                              <td className="py-1.5 px-2 border border-slate-400 text-center font-mono font-black text-[9.5pt] text-slate-950">{st.totalMedals}</td>
                              <td className="py-1.5 px-2 border border-slate-400 text-center text-slate-800 text-[8.5pt]">{st.totalParticipants} Peserta</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* 6. URAIAN PENUTUP */}
              <p className="text-[10pt] font-serif leading-relaxed text-justify pt-1">
                Demikian Berita Acara Penetapan Juara Umum ini dibuat dengan sebenar-benarnya dalam rangkap yang cukup berdasarkan rekapitulasi data penilaian resmi untuk dapat dipergunakan sebagaimana mestinya.
              </p>

              {/* 7. TANDA TANGAN (KOORDINATOR WILAYAH & KETUA PANITIA) */}
              <div className="pt-2 font-serif space-y-2">
                <div className="text-right text-[10pt] text-slate-900">
                  Ditetapkan di: {districtName}, {currentDateFormatted.settingDateText}
                </div>

                <table className="w-full border-collapse border-0 my-1">
                  <tbody>
                    <tr>
                      <td className="w-1/2 text-center align-top p-2 border-0">
                        <div className="text-slate-900 text-[10pt]">Mengetahui,</div>
                        <div className="font-bold text-slate-950 text-[10.5pt] mt-0.5 leading-snug">
                          Koordinator Wilayah Pendidikan<br />Kecamatan {districtName}
                        </div>
                        <div className="h-14"></div>
                        <div className="font-bold underline text-slate-950 text-[11pt]">
                          {educationCoordinator || '(Belum Ditetapkan)'}
                        </div>
                        <div className="text-[9.5pt] text-slate-800 font-mono whitespace-nowrap">
                          {educationCoordinatorNip ? `NIP. ${educationCoordinatorNip}` : 'NIP. -'}
                        </div>
                      </td>
                      <td className="w-1/2 text-center align-top p-2 border-0">
                        <div className="text-slate-900 text-[10pt]">Menyetujui & Menetapkan,</div>
                        <div className="font-bold text-slate-950 text-[10.5pt] mt-0.5 leading-snug">
                          Ketua Panitia Pelaksana {eventName}<br />Tingkat Kecamatan {districtName}
                        </div>
                        <div className="h-14"></div>
                        <div className="font-bold underline text-slate-950 text-[11pt]">
                          {committeeChairman || '(Belum Ditetapkan)'}
                        </div>
                        <div className="text-[9.5pt] text-slate-800 font-mono whitespace-nowrap">
                          {committeeChairmanNip ? `NIP. ${committeeChairmanNip}` : 'NIP. -'}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Bottom Footer Actions (Hidden on Print) */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <p className="text-xs text-slate-500">
                Dokumen Berita Acara resmi penetapan Juara Umum FTBI SD 2026.
              </p>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowBeritaAcaraJuaraUmum(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Tutup / Keluar
                </button>
                <button
                  type="button"
                  id="btn-download-berita-acara-juara-umum"
                  onClick={() => {
                    const printElem = document.getElementById('berita-acara-juara-umum-print-area');
                    const content = printElem ? printElem.innerHTML : '';
                    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Berita Acara Penetapan Juara Umum - FTBI SD Pekutatan 2026</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 0; margin: 0; line-height: 1.3; font-size: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 3px 0; }
    th, td { border: 1px solid #000; padding: 3px 6px; font-size: 9pt; }
    th { background: #f1f5f9; text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-serif { font-family: 'Times New Roman', Times, serif; }
    .font-sans { font-family: Arial, Helvetica, sans-serif; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .underline { text-decoration: underline; }
    .uppercase { text-transform: uppercase; }
    .whitespace-nowrap { white-space: nowrap; }
    .border-0 { border: none !important; }
    .h-14 { height: 50px; min-height: 50px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Berita_Acara_Juara_Umum_FTBI_Pekutatan_2026.html`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Unduh Berita Acara Juara Umum format Dokumen/PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen (HTML)</span>
                </button>
                <button
                  type="button"
                  id="btn-print-berita-acara-juara-umum-action"
                  onClick={() => {
                    const printElem = document.getElementById('berita-acara-juara-umum-print-area');
                    if (!printElem) {
                      window.print();
                      return;
                    }
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cetak Berita Acara Juara Umum</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 0; margin: 0; line-height: 1.3; font-size: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 3px 0; }
    th, td { border: 1px solid #000; padding: 3px 6px; font-size: 9pt; }
    th { background: #f1f5f9; text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-serif { font-family: 'Times New Roman', Times, serif; }
    .font-sans { font-family: Arial, Helvetica, sans-serif; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .underline { text-decoration: underline; }
    .uppercase { text-transform: uppercase; }
    .whitespace-nowrap { white-space: nowrap; }
    .border-0 { border: none !important; }
    .h-14 { height: 50px; min-height: 50px; }
  </style>
</head>
<body>
  ${printElem.innerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`);
                      printWindow.document.close();
                    } else {
                      window.print();
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Cetak Berita Acara (Print)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
