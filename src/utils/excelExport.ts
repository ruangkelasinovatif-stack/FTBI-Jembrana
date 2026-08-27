import * as XLSX from 'xlsx';
import { CompetitionCategory, School, Judge, Participant, JudgeEvaluation, EventProfile } from '../types';
import { getEffectiveJudgesForParticipant } from '../data/initialData';
import { SchoolMedalStanding } from '../components/LeaderboardAndReports';

export interface CategoryResultItem {
  participant: Participant;
  school: School;
  category: CompetitionCategory;
  effectiveJudges: {
    originalJudge: Judge;
    effectiveJudge: Judge;
    wasReplaced: boolean;
    evaluation?: JudgeEvaluation;
  }[];
  completedCount: number;
  isCompleted: boolean;
  finalScore: number;
  isEligibleForChampionship: boolean;
}

export function getAllCategoryResults(
  categories: CompetitionCategory[],
  schools: School[],
  judges: Judge[],
  participants: Participant[],
  evaluations: JudgeEvaluation[]
) {
  const allResults: {
    category: CompetitionCategory;
    putra: CategoryResultItem[];
    putri: CategoryResultItem[];
  }[] = [];

  categories.forEach((cat) => {
    const catJudges = judges.filter((j) => j.categoryId === cat.id);
    const catParticipants = participants.filter((p) => p.categoryId === cat.id);

    const evaluated = catParticipants.map((participant) => {
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

    const putra = evaluated
      .filter((r) => r.participant.gender === 'L')
      .sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.finalScore - a.finalScore;
      });

    const putri = evaluated
      .filter((r) => r.participant.gender === 'P')
      .sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.finalScore - a.finalScore;
      });

    allResults.push({
      category: cat,
      putra,
      putri,
    });
  });

  return allResults;
}

/**
 * Format nama sheet agar valid di Excel (maksimal 31 karakter, tanpa karakter terlarang : \ / ? * [ ])
 */
function getSanitizedSheetName(categoryName: string, suffix: string = ''): string {
  // Bersihkan kata 'Lomba' di awal agar lebih ringkas dan muat nama aslinya
  let cleaned = categoryName.replace(/^Lomba\s+/i, '').trim();
  cleaned = cleaned.replace(/[:\\/?*\[\]]/g, '');
  if (suffix) {
    cleaned = `${cleaned} ${suffix}`.trim();
  }
  return cleaned.substring(0, 31);
}

/**
 * 1. EKSPOR REKAP JUARA PUTRA (FILE EXCEL TERPISAH DENGAN 7 SHEET CABANG LOMBA)
 * Masing-masing sheet berisi: Nama Peserta, Nilai Juri 1, Juri 2, Juri 3, Nilai Akhir, dan Peringkat Juara
 */
export function exportJuaraPutraToExcel(
  categories: CompetitionCategory[],
  schools: School[],
  judges: Judge[],
  participants: Participant[],
  evaluations: JudgeEvaluation[],
  eventProfile?: EventProfile
) {
  const district = eventProfile?.districtName || 'Pekutatan';
  const year = eventProfile?.eventYear || '2026';
  const allResults = getAllCategoryResults(categories, schools, judges, participants, evaluations);

  const wb = XLSX.utils.book_new();

  allResults.forEach((catItem, idx) => {
    const rows: any[] = [];

    // Header Judul Dokumen
    rows.push([`REKAPITULASI HASIL PENILAIAN & JUARA KATEGORI PUTRA`]);
    rows.push([`CABANG LOMBA: ${catItem.category.name.toUpperCase()}`]);
    rows.push([`FESTIVAL TUNAS BAHASA IBU (FTBI) SD KECAMATAN ${district.toUpperCase()} TAHUN ${year}`]);
    rows.push([]);

    // Header Tabel
    rows.push([
      'Peringkat',
      'Predikat Kejuaraan',
      'No. Undian',
      'No. Registrasi',
      'Nama Lengkap Siswa (Putra)',
      'Kelas',
      'Asal Satuan Pendidikan (SD)',
      'Nilai Juri 1',
      'Nilai Juri 2',
      'Nilai Juri 3',
      'Nilai Akhir',
      'Status Penilaian'
    ]);

    if (catItem.putra.length === 0) {
      rows.push(['-', 'Tidak ada peserta putra terdaftar', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
    } else {
      catItem.putra.forEach((res, pIdx) => {
        const rank = pIdx + 1;
        let predikat = `Peringkat ${rank}`;
        if (res.isCompleted) {
          if (rank === 1) predikat = 'JUARA 1 PUTRA (EMAS)';
          else if (rank === 2) predikat = 'JUARA 2 PUTRA (PERAK)';
          else if (rank === 3) predikat = 'JUARA 3 PUTRA (PERUNGGU)';
        } else {
          predikat = `Belum Selesai (${res.completedCount}/3 Juri)`;
        }

        const scoreJ1 = res.effectiveJudges[0]?.evaluation?.totalWeightedScore !== undefined 
          ? res.effectiveJudges[0].evaluation.totalWeightedScore.toFixed(2) : '-';
        const scoreJ2 = res.effectiveJudges[1]?.evaluation?.totalWeightedScore !== undefined 
          ? res.effectiveJudges[1].evaluation.totalWeightedScore.toFixed(2) : '-';
        const scoreJ3 = res.effectiveJudges[2]?.evaluation?.totalWeightedScore !== undefined 
          ? res.effectiveJudges[2].evaluation.totalWeightedScore.toFixed(2) : '-';

        rows.push([
          rank,
          predikat,
          `#${res.participant.lotNo}`,
          res.participant.registrationNo,
          res.participant.fullName,
          res.participant.grade,
          res.school.name,
          scoreJ1,
          scoreJ2,
          scoreJ3,
          res.isCompleted ? res.finalScore.toFixed(2) : '-',
          res.isCompleted ? 'Sah (Lengkap)' : `Belum Lengkap (${res.completedCount}/3)`
        ]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Atur lebar kolom agar proporsional dan mudah dibaca
    ws['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
      { wch: 28 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
    ];

    const sheetName = getSanitizedSheetName(catItem.category.name);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `Rekap_Juara_Putra_FTBI_${district}_${year}.xlsx`);
}

/**
 * 2. EKSPOR REKAP JUARA PUTRI (FILE EXCEL TERPISAH DENGAN 7 SHEET CABANG LOMBA)
 * Masing-masing sheet berisi: Nama Peserta, Nilai Juri 1, Juri 2, Juri 3, Nilai Akhir, dan Peringkat Juara
 */
export function exportJuaraPutriToExcel(
  categories: CompetitionCategory[],
  schools: School[],
  judges: Judge[],
  participants: Participant[],
  evaluations: JudgeEvaluation[],
  eventProfile?: EventProfile
) {
  const district = eventProfile?.districtName || 'Pekutatan';
  const year = eventProfile?.eventYear || '2026';
  const allResults = getAllCategoryResults(categories, schools, judges, participants, evaluations);

  const wb = XLSX.utils.book_new();

  allResults.forEach((catItem, idx) => {
    const rows: any[] = [];

    // Header Judul Dokumen
    rows.push([`REKAPITULASI HASIL PENILAIAN & JUARA KATEGORI PUTRI`]);
    rows.push([`CABANG LOMBA: ${catItem.category.name.toUpperCase()}`]);
    rows.push([`FESTIVAL TUNAS BAHASA IBU (FTBI) SD KECAMATAN ${district.toUpperCase()} TAHUN ${year}`]);
    rows.push([]);

    // Header Tabel
    rows.push([
      'Peringkat',
      'Predikat Kejuaraan',
      'No. Undian',
      'No. Registrasi',
      'Nama Lengkap Siswi (Putri)',
      'Kelas',
      'Asal Satuan Pendidikan (SD)',
      'Nilai Juri 1',
      'Nilai Juri 2',
      'Nilai Juri 3',
      'Nilai Akhir',
      'Status Penilaian'
    ]);

    if (catItem.putri.length === 0) {
      rows.push(['-', 'Tidak ada peserta putri terdaftar', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
    } else {
      catItem.putri.forEach((res, pIdx) => {
        const rank = pIdx + 1;
        let predikat = `Peringkat ${rank}`;
        if (res.isCompleted) {
          if (rank === 1) predikat = 'JUARA 1 PUTRI (EMAS)';
          else if (rank === 2) predikat = 'JUARA 2 PUTRI (PERAK)';
          else if (rank === 3) predikat = 'JUARA 3 PUTRI (PERUNGGU)';
        } else {
          predikat = `Belum Selesai (${res.completedCount}/3 Juri)`;
        }

        const scoreJ1 = res.effectiveJudges[0]?.evaluation?.totalWeightedScore !== undefined 
          ? res.effectiveJudges[0].evaluation.totalWeightedScore.toFixed(2) : '-';
        const scoreJ2 = res.effectiveJudges[1]?.evaluation?.totalWeightedScore !== undefined 
          ? res.effectiveJudges[1].evaluation.totalWeightedScore.toFixed(2) : '-';
        const scoreJ3 = res.effectiveJudges[2]?.evaluation?.totalWeightedScore !== undefined 
          ? res.effectiveJudges[2].evaluation.totalWeightedScore.toFixed(2) : '-';

        rows.push([
          rank,
          predikat,
          `#${res.participant.lotNo}`,
          res.participant.registrationNo,
          res.participant.fullName,
          res.participant.grade,
          res.school.name,
          scoreJ1,
          scoreJ2,
          scoreJ3,
          res.isCompleted ? res.finalScore.toFixed(2) : '-',
          res.isCompleted ? 'Sah (Lengkap)' : `Belum Lengkap (${res.completedCount}/3)`
        ]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Atur lebar kolom agar proporsional dan mudah dibaca
    ws['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
      { wch: 28 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
    ];

    const sheetName = getSanitizedSheetName(catItem.category.name);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `Rekap_Juara_Putri_FTBI_${district}_${year}.xlsx`);
}

/**
 * 3. EKSPOR REKAP JUARA UMUM SEKOLAH (FILE EXCEL KLASEMEN MEDALI & PERINGKAT SEKOLAH)
 */
export function exportRekapJuaraUmumSekolahToExcel(
  schoolStandings: SchoolMedalStanding[],
  eventProfile?: EventProfile
) {
  const district = eventProfile?.districtName || 'Pekutatan';
  const year = eventProfile?.eventYear || '2026';

  const wb = XLSX.utils.book_new();

  // SHEET 1: KLASEMEN AKHIR MEDALI JUARA UMUM
  const rows: any[] = [];
  rows.push(['KLASEMEN AKHIR PEROLEHAN MEDALI & REKAP JUARA UMUM SEKOLAH']);
  rows.push([`FESTIVAL TUNAS BAHASA IBU (FTBI) JENJANG SEKOLAH DASAR TAHUN ${year}`]);
  rows.push([`KECAMATAN ${district.toUpperCase()}`]);
  rows.push([]);

  rows.push([
    'Peringkat',
    'Status Predikat',
    'Nama Satuan Pendidikan (SD)',
    'NPSN',
    'Desa / Kelurahan',
    'Juara 1 (Emas)',
    'Juara 2 (Perak)',
    'Juara 3 (Perunggu)',
    'Total Medali',
    'Total Peserta Kontingen',
    'Rincian Prestasi Juara'
  ]);

  schoolStandings.forEach((st, idx) => {
    const rank = idx + 1;
    let predikat = `Peringkat ${rank}`;
    if (rank === 1 && st.goldCount > 0) predikat = 'JUARA UMUM (PIALA BERGILIR)';
    else if (rank === 2 && st.totalMedals > 0) predikat = 'Peringkat 2';
    else if (rank === 3 && st.totalMedals > 0) predikat = 'Peringkat 3';

    const detailsStr = st.details.length > 0 
      ? st.details.map(d => `${d.rank === 1 ? 'Juara 1 (Emas)' : d.rank === 2 ? 'Juara 2 (Perak)' : 'Juara 3 (Perunggu)'} ${d.category.name.replace(/^Lomba\s+/i, '')} [${d.gender === 'L' ? 'Putra' : 'Putri'} - Nilai: ${d.score.toFixed(2)}]`).join('\n')
      : 'Belum memperoleh medali';

    rows.push([
      rank,
      predikat,
      st.school.name,
      st.school.npsn,
      st.school.village,
      st.goldCount,
      st.silverCount,
      st.bronzeCount,
      st.totalMedals,
      st.totalParticipants,
      detailsStr
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 28 },
    { wch: 28 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 22 },
    { wch: 65 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Klasemen Juara Umum');

  // SHEET 2: RINCIAN DETAIL MEDALI PER SEKOLAH
  const medalRows: any[] = [];
  medalRows.push(['RINCIAN DETAIL PEROLEHAN MEDALI JUARA PER SEKOLAH']);
  medalRows.push([`FTBI SD KECAMATAN ${district.toUpperCase()} ${year}`]);
  medalRows.push([]);
  medalRows.push([
    'No',
    'Nama Sekolah',
    'Desa',
    'Cabang Lomba',
    'Kategori',
    'Medali / Juara',
    'Nilai Akhir',
    'Nama Peserta'
  ]);

  let detailIdx = 1;
  schoolStandings.forEach((st) => {
    if (st.details.length > 0) {
      st.details.forEach((d) => {
        const medalName = d.rank === 1 ? 'EMAS (Juara 1)' : d.rank === 2 ? 'PERAK (Juara 2)' : 'PERUNGGU (Juara 3)';
        medalRows.push([
          detailIdx++,
          st.school.name,
          st.school.village,
          d.category.name,
          d.gender === 'L' ? 'Putra' : 'Putri',
          medalName,
          d.score.toFixed(2),
          d.participant?.fullName || '-'
        ]);
      });
    }
  });

  const wsDetails = XLSX.utils.aoa_to_sheet(medalRows);
  wsDetails['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 16 },
    { wch: 28 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
    { wch: 26 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Rincian Medali Sekolah');

  XLSX.writeFile(wb, `Rekap_Juara_Umum_Sekolah_FTBI_${district}_${year}.xlsx`);
}
