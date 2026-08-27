export interface School {
  id: string;
  name: string;
  npsn: string;
  village: string;
  district?: string;
  headmaster: string;
  contactPhone: string;
  lotteryNumber?: number;
}

export interface EventProfile {
  eventName: string;
  eventYear: string;
  targetLevel: string;
  districtName: string;
  regencyName: string;
  provinceName: string;
  committeeName: string;
  secretariatAddress: string;
  committeeChairman: string;
  committeeChairmanNip: string;
  committeeSecretary: string;
  committeeSecretaryNip: string;
  educationCoordinator: string;
  educationCoordinatorNip: string;
  logoUrl?: string;
  customKopUrl?: string;
  useImageKop?: boolean;
  kopTextHeader1: string;
  kopTextHeader2: string;
  kopTextHeader3: string;
  kopTextAddress: string;
}

export interface RegistrationSchedule {
  enabled: boolean;
  startDate: string; // e.g. "2026-08-20T08:00"
  endDate: string; // e.g. "2026-08-31T23:59"
  registrationToken: string;
  tokenCreatedAt?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g. 20% (0.20) or 25% (0.25)
  minScore: number; // 1
  maxScore: number; // 10
}

export interface CompetitionCategory {
  id: string;
  name: string;
  description: string;
  location: string;
  targetLevel: string; // e.g. 'SD / MI'
  criteria: Criterion[];
}

export interface Judge {
  id: string;
  name: string;
  nip?: string;
  schoolId: string;
  categoryId: string;
  role: 'Juri 1' | 'Juri 2' | 'Juri 3';
  isBackup?: boolean;
  username?: string;
  password?: string;
  token?: string;
  generatedAt?: string;
}

export interface Participant {
  id: string;
  registrationNo: string;
  lotNo: number; // Nomor Undian / Tampil
  fullName: string;
  nisn: string;
  gender: 'L' | 'P';
  schoolId: string;
  categoryId: string;
  grade: string;
  mentorName: string;
  mentorPhone: string;
  registeredAt: string;
  status: 'registered' | 'ready' | 'performing' | 'evaluated' | 'finalized';
}

export interface EvaluationItem {
  criterionId: string;
  score: number; // 1 - 10
}

export interface JudgeEvaluation {
  id: string;
  participantId: string;
  judgeId: string;
  judgeRole: 'Juri 1' | 'Juri 2' | 'Juri 3';
  scores: Record<string, number>; // criterionId -> score (1-10)
  totalWeightedScore: number;
  notes?: string;
  submittedAt: string;
  isSubstitute?: boolean;
}

export interface ParticipantResult {
  participant: Participant;
  school: School;
  category: CompetitionCategory;
  activeJudges: {
    originalJudge: Judge;
    effectiveJudge: Judge;
    wasReplaced: boolean;
    replacementReason?: string;
    evaluation?: JudgeEvaluation;
  }[];
  finalScore: number;
  isCompleted: boolean;
  rank?: number;
}

// 5 TINGKAT PENILAIAN
export interface ScoreLevelInfo {
  level: number;
  name: string;
  range: [number, number];
  color: string;
  bgLight: string;
  border: string;
}

export type UserRole = 'superadmin' | 'judge';

export interface CurrentUserSession {
  role: UserRole;
  judgeId?: string;
  username?: string;
  name: string;
  categoryId?: string;
  schoolId?: string;
  judgeRole?: 'Juri 1' | 'Juri 2' | 'Juri 3';
}

export const SCORE_LEVELS: Record<number, ScoreLevelInfo> = {
  1: { level: 1, name: 'Sangat Kurang', range: [1, 2], color: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-300' },
  2: { level: 2, name: 'Kurang', range: [3, 4], color: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-300' },
  3: { level: 3, name: 'Cukup', range: [5, 6], color: 'text-yellow-700', bgLight: 'bg-yellow-50', border: 'border-yellow-300' },
  4: { level: 4, name: 'Baik', range: [7, 8], color: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-300' },
  5: { level: 5, name: 'Sangat Baik', range: [9, 10], color: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-300' },
};

export function getScoreLevel(score: number): ScoreLevelInfo {
  const norm = score > 10 ? score / 10 : score;
  if (norm <= 2) return SCORE_LEVELS[1];
  if (norm <= 4) return SCORE_LEVELS[2];
  if (norm <= 6) return SCORE_LEVELS[3];
  if (norm <= 8) return SCORE_LEVELS[4];
  return SCORE_LEVELS[5];
}
