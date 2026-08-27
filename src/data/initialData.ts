import { School, CompetitionCategory, Judge, Participant, JudgeEvaluation, getScoreLevel, ParticipantResult, EventProfile, AdminCredentials, RegistrationSchedule } from '../types';

export const INITIAL_REGISTRATION_SCHEDULE: RegistrationSchedule = {
  enabled: true,
  startDate: '2026-08-20T08:00',
  endDate: '2026-08-31T23:59',
  registrationToken: 'reg-ftbi-2026-pekutatan',
  tokenCreatedAt: new Date().toISOString(),
};

export const INITIAL_EVENT_PROFILE: EventProfile = {
  eventName: 'Festival Tunas Bahasa Ibu (FTBI)',
  eventYear: '2026',
  targetLevel: 'Jenjang Sekolah Dasar (SD)',
  districtName: 'Pekutatan',
  regencyName: 'Jembrana',
  provinceName: 'Bali',
  committeeName: 'PANITIA FESTIVAL TUNAS BAHASA IBU (FTBI) TINGKAT KECAMATAN PEKUTATAN',
  secretariatAddress: 'Kantor Koordinator Wilayah Pendidikan Kecamatan Pekutatan, Kab. Jembrana - Bali',
  committeeChairman: 'I Made Suardana, S.Pd., M.Pd.',
  committeeChairmanNip: '19700101 199503 1 005',
  committeeSecretary: 'Ni Made Suarni, S.Pd.',
  committeeSecretaryNip: '19780412 200212 2 004',
  educationCoordinator: 'I Wayan Suarna, S.Pd., M.Pd.',
  educationCoordinatorNip: '19680512 199103 1 008',
  logoUrl: '',
  customKopUrl: '',
  useImageKop: false,
  kopTextHeader1: 'PEMERINTAH KABUPATEN JEMBRANA',
  kopTextHeader2: 'DINAS PENDIDIKAN, KEPEMUDAAN DAN OLAHRAGA',
  kopTextHeader3: 'PANITIA FESTIVAL TUNAS BAHASA IBU (FTBI) TINGKAT KECAMATAN PEKUTATAN',
  kopTextAddress: 'Sekretariat: Kantor Koordinator Wilayah Pendidikan Kec. Pekutatan • Telp. 081234567808 • Kode Pos 82262',
};

export const INITIAL_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
};

export const INITIAL_SCHOOLS: School[] = [];

export const INITIAL_CATEGORIES: CompetitionCategory[] = [
  {
    id: 'cat-nyurat',
    name: 'Lomba Nyurat Aksara Bali di Kertas',
    description: 'Lomba menyalin teks berbahasa Bali berhuruf latin ke aksara Bali di kertas (Luring) dengan durasi 60 menit.',
    location: 'Ruang Kelas SD Inti Pekutatan (Luring)',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-nyu-1', name: 'Bentuk dan komposisi tulisan (wangun, tatuek, kakuub)', description: 'Kerapian bentuk aksara, ketegasan goresan (tatuek), dan keserasian tata letak (kakuub).', weight: 0.35, minScore: 1, maxScore: 10 },
      { id: 'crit-nyu-2', name: 'Ketepatan ejaan (pasang aksara)', description: 'Kebenaran kaidah pasang aksara Bali (aksara wianjana, suara, pengangge, tengenan).', weight: 0.35, minScore: 1, maxScore: 10 },
      { id: 'crit-nyu-3', name: 'Kerapian dan kebersihan tulisan', description: 'Kerapian baris penulisan, kebersihan lembar kerja tanpa noda/coretan.', weight: 0.15, minScore: 1, maxScore: 10 },
      { id: 'crit-nyu-4', name: 'Ketuntasan', description: 'Kelengkapan dan ketuntasan dalam menyalin seluruh materi teks 100 kata.', weight: 0.15, minScore: 1, maxScore: 10 },
    ],
  },
  {
    id: 'cat-puisi',
    name: 'Lomba Ngripta lan Ngwacen Puisi Bali Anyar',
    description: 'Lomba menulis langsung puisi Bali Anyar (durasi 90 menit, minimal 2 bait @ 4 baris) lalu membacakan karya sendiri (Luring).',
    location: 'SD Negeri 2 Medewi',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-pui-1', name: 'Bahasa (diksi, rancang bangun, dan gaya bahasa)', description: 'Kekayaan kosa kata basa Bali, struktur estetika bait, dan gaya bahasa puisi.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-pui-2', name: 'Keaslian dan kesegaran ungkapan', description: 'Orisinalitas gagasan, kedalaman makna imajinatif, dan kesegaran ekspresi.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-pui-3', name: 'Wirama (vokal, artikulasi, dan intonasi)', description: 'Kekuatan resonansi vokal, ketepatan artikulasi pelafalan fonem, dan variasi intonasi.', weight: 0.20, minScore: 1, maxScore: 10 },
      { id: 'crit-pui-4', name: 'Wirasa (interpretasi)', description: 'Penjiwaan makna dan kedalaman penghayatan jiwa puisi.', weight: 0.15, minScore: 1, maxScore: 10 },
      { id: 'crit-pui-5', name: 'Wiraga (ekspresi, kreativitas, dan improvisasi)', description: 'Kesesuaian ekspresi mimik wajah, gestur tubuh yang wajar, dan kreativitas.', weight: 0.15, minScore: 1, maxScore: 10 },
    ],
  },
  {
    id: 'cat-cerpen',
    name: 'Lomba Ngripta Cerpen Berbahasa Bali',
    description: 'Lomba menulis cerita pendek berbahasa Bali 1—2 halaman folio bertema "Menabung untuk meraih mimpi" selama 120 menit (Luring).',
    location: 'Ruang Literasi SD Inti Pekutatan (Luring)',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-cer-1', name: 'Originalitas', description: 'Keaslian ide carita pendek dan terbebas dari unsur plagiarisme.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-cer-2', name: 'Kesesuaian tema', description: 'Kesesuaian alur cerita dengan tema "Menabung untuk meraih mimpi".', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-cer-3', name: 'Ide dan gagasan', description: 'Kekuatan plot, resolusi konflik, dan pesan moral mendidik.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-cer-4', name: 'Bahasa (diksi, kalimat, ragam bahasa, dan gaya bahasa)', description: 'Penerapan anggah-ungguhing basa Bali, kekayaan diksi, dan gaya bahasa.', weight: 0.15, minScore: 1, maxScore: 10 },
      { id: 'crit-cer-5', name: 'Teknik penulisan', description: 'Kerapian tata tulis paragraf dan penerapan ejaan bahasa Bali latin.', weight: 0.10, minScore: 1, maxScore: 10 },
    ],
  },
  {
    id: 'cat-masatua',
    name: 'Lomba Masatua Bali',
    description: 'Lomba bercerita / mendongeng bahasa Bali bertema "Penguatan jati diri melalui bahasa, aksara, dan sastra Bali" tanpa teks & tanpa alat peraga, durasi 8—10 menit (Daring).',
    location: 'Pengiriman Rekaman Video Daring (One Take Video 16:9 HD)',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-st-1', name: 'Bahasa (anggah-unggihing basa kalengutan basa)', description: 'Penerapan tata krama basa Bali yang tepat dan keindahan/keluwesan bahasa.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-st-2', name: 'Kemampuan bercerita (penampilan penguasaan ruang, narasi, karakter, penghayatan)', description: 'Penguasaan panggung/ruang, kelancaran narasi, penghayatan, dan karakterisasi tokoh.', weight: 0.30, minScore: 1, maxScore: 10 },
      { id: 'crit-st-3', name: 'Kesesuaian tema', description: 'Kesesuaian satua Bali yang dipilih dengan tema penguatan jati diri.', weight: 0.15, minScore: 1, maxScore: 10 },
      { id: 'crit-st-4', name: 'Vokal (kekuatan/ketepatan ucapan, variasi bunyi, dan nada)', description: 'Kekuatan suara, artikulasi fonem bahasa Bali, dan variasi intonasi.', weight: 0.15, minScore: 1, maxScore: 10 },
      { id: 'crit-st-5', name: 'Keutuhan satua', description: 'Kelengkapan struktur awal, tengah, dan akhir cerita yang tuntas.', weight: 0.15, minScore: 1, maxScore: 10 },
    ],
  },
  {
    id: 'cat-matembang',
    name: 'Lomba Matembang Sekar Alit',
    description: 'Lomba melantunkan Sekar Alit (Tembang Wajib: Pupuh Ginanti Pelog; Tembang Pilihan: Pupuh Mas Kumambang Pelog / Pupuh Pucung Selendro) rekaman daring (Daring).',
    location: 'Pengiriman Rekaman Video Daring (One Take Video 16:9 HD)',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-tem-1', name: 'Penampilan (tikas)', description: 'Sikap tubuh (tikas), kesopanan menembang, dan kerapian busana adat madia.', weight: 0.10, minScore: 1, maxScore: 10 },
      { id: 'crit-tem-2', name: 'Suara/vokal (Suara nantia di ujung lidah & Kemerduan/gregel suara)', description: 'Kejelasan suara di ujung lidah (suara nantia) dan kemerduan/gregel suara.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-tem-3', name: 'Guru Ding-dung', description: 'Ketepatan titi laras pelog/selendro dan aturan nada akhir bait (guru ding-dung).', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-tem-4', name: 'Wewiletan (Teknik Olah Nada)', description: 'Pengolahan renggong, cengkok wewiletan laras tembang Bali.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-tem-5', name: 'Ekspresi (raras: Mimik & Penjiwaan)', description: 'Kesesuaian mimik wajah dan kedalaman penjiwaan makna lirik pupuh.', weight: 0.15, minScore: 1, maxScore: 10 },
    ],
  },
  {
    id: 'cat-mapidarta',
    name: 'Lomba Mapidarta',
    description: 'Lomba pidato bahasa Bali bertema "Penguatan jati diri melalui bahasa, aksara, dan sastra Bali" waktu 8—10 menit (Daring).',
    location: 'Pengiriman Rekaman Video Daring (One Take Video 16:9 HD)',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-pid-1', name: 'Bahasa (tata bahasa dan anggah-ungguhing basa)', description: 'Kaidah tata bahasa Bali dan ketepatan tingkatan tutur anggah-ungguhing basa.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-pid-2', name: 'Penguasaan Materi', description: 'Kelancaran penyampaian, keruntutan ide (pamahbah, daging, pamuput).', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-pid-3', name: 'Kesesuaian Tema', description: 'Kesesuaian isi materi naskah pidarta dengan tema penguatan jati diri.', weight: 0.20, minScore: 1, maxScore: 10 },
      { id: 'crit-pid-4', name: 'Penampilan (tikas dan raras)', description: 'Penguasaan panggung, ketegasan sikap (tikas), dan kontak mata (raras).', weight: 0.15, minScore: 1, maxScore: 10 },
      { id: 'crit-pid-5', name: 'Amanat', description: 'Kejelasan pesan moral dan daya ajak/inspirasi bagi pendengar.', weight: 0.15, minScore: 1, maxScore: 10 },
    ],
  },
  {
    id: 'cat-babanyolan',
    name: 'Lomba Babanyolan Tunggal',
    description: 'Lomba lawakan komedi tunggal (stand up comedy) berbahasa Bali bertema "Penguatan jati diri melalui bahasa, aksara, dan sastra Bali" durasi 8—10 menit (Daring).',
    location: 'Pengiriman Rekaman Video Daring (One Take Video 16:9 HD)',
    targetLevel: 'SD Kelas V atau VI',
    criteria: [
      { id: 'crit-bab-1', name: 'Bahasa', description: 'Penerapan bahasa Bali yang komunikatif, segar, dan beretika budaya.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-bab-2', name: 'Penguasaan materi dan improvisasi', description: 'Kelancaran penguasaan alur cerita komedi dan kelenturan daya improvisasi.', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-bab-3', name: 'Gaya penyajian (wiraga, wirama, dan wirasa)', description: 'Gestur tubuh (wiraga), ketepatan ritme/timing punchline (wirama), dan penghayatan (wirasa).', weight: 0.25, minScore: 1, maxScore: 10 },
      { id: 'crit-bab-4', name: 'Materi: tingkat kelucuan, kesesuaian tema, dan amanat', description: 'Daya ledak tawa lelucon santun tanpa SARA/pornografi, sesuai tema, dan memuat amanat.', weight: 0.25, minScore: 1, maxScore: 10 },
    ],
  },
];

// 3 Juri per Kategori FTBI SD: Juri 1, Juri 2, Juri 3
export const INITIAL_JUDGES: Judge[] = [];

export const INITIAL_PARTICIPANTS: Participant[] = [];

// Evaluasi nilai dewan juri
export const INITIAL_EVALUATIONS: JudgeEvaluation[] = [];

/**
 * Calculates weighted score for an individual judge evaluation in 100-point scale
 */
export function calculateWeightedScore(
  scoresOrCriteria: Record<string, number> | CompetitionCategory['criteria'],
  criteriaOrScores?: CompetitionCategory['criteria'] | Record<string, number>
): number {
  let criteria: CompetitionCategory['criteria'] = [];
  let scores: Record<string, number> = {};

  if (Array.isArray(scoresOrCriteria)) {
    criteria = scoresOrCriteria;
    scores = (criteriaOrScores as Record<string, number>) || {};
  } else if (Array.isArray(criteriaOrScores)) {
    criteria = criteriaOrScores;
    scores = (scoresOrCriteria as Record<string, number>) || {};
  } else if (scoresOrCriteria && typeof scoresOrCriteria === 'object') {
    scores = scoresOrCriteria as Record<string, number>;
  }

  if (!Array.isArray(criteria) || criteria.length === 0) {
    return 0;
  }

  let total = 0;
  criteria.forEach((crit) => {
    const rawVal = scores ? (scores[crit.id] ?? 0) : 0;
    if (rawVal > 10) {
      total += rawVal * crit.weight;
    } else {
      total += rawVal * crit.weight * 10;
    }
  });
  return parseFloat(total.toFixed(2));
}

/**
 * Determines active 3 judges for a given participant
 */
export function getEffectiveJudgesForParticipant(
  _participant: Participant,
  categoryJudges: Judge[]
): {
  originalJudge: Judge;
  effectiveJudge: Judge;
  wasReplaced: boolean;
  replacementReason?: string;
}[] {
  if (!categoryJudges || !Array.isArray(categoryJudges)) {
    return [];
  }
  return categoryJudges.map((judge) => ({
    originalJudge: judge,
    effectiveJudge: judge,
    wasReplaced: false,
  }));
}

