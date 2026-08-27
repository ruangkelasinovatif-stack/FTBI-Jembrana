import React, { useState, useEffect } from 'react';
import { Sidebar, AppTabType } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { BannerCard } from './components/BannerCard';
import { AdminOverview } from './components/AdminOverview';
import { RegistrationPortal } from './components/RegistrationPortal';
import { JudgeRegistrationPortal } from './components/JudgeRegistrationPortal';
import { JudgingBooth } from './components/JudgingBooth';
import { LeaderboardAndReports } from './components/LeaderboardAndReports';
import { ProfileSettingsPortal } from './components/ProfileSettingsPortal';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { ShareRegistrationModal } from './components/ShareRegistrationModal';
import { PublicRegistrationPage } from './components/PublicRegistrationPage';
import {
  INITIAL_CATEGORIES,
  INITIAL_SCHOOLS,
  INITIAL_JUDGES,
  INITIAL_PARTICIPANTS,
  INITIAL_EVALUATIONS,
  INITIAL_EVENT_PROFILE,
  INITIAL_ADMIN_CREDENTIALS,
  INITIAL_REGISTRATION_SCHEDULE,
  getEffectiveJudgesForParticipant,
} from './data/initialData';
import { School, CompetitionCategory, Judge, Participant, JudgeEvaluation, CurrentUserSession, EventProfile, AdminCredentials, RegistrationSchedule } from './types';
import {
  subscribeParticipants,
  subscribeSchools,
  subscribeJudges,
  subscribeEvaluations,
  subscribeCategories,
  subscribeAppConfig,
  saveParticipantToFirestore,
  deleteParticipantFromFirestore,
  saveSchoolToFirestore,
  deleteSchoolFromFirestore,
  saveJudgeToFirestore,
  saveJudgesBatchToFirestore,
  deleteJudgeFromFirestore,
  saveEvaluationToFirestore,
  deleteEvaluationFromFirestore,
  saveEventProfileToFirestore,
  saveRegistrationScheduleToFirestore,
  saveAdminCredentialsToFirestore,
  seedInitialFirestoreData,
} from './lib/firebase';

const STORAGE_KEYS = {
  CATEGORIES: 'ftbi_sd_categories_v8',
  SCHOOLS: 'ftbi_sd_schools_v8',
  JUDGES: 'ftbi_sd_judges_v9_clean',
  PARTICIPANTS: 'ftbi_sd_participants_v9_clean',
  EVALUATIONS: 'ftbi_sd_evaluations_v9_clean',
  USER_SESSION: 'ftbi_user_session_v8',
  IS_LOGGED_IN: 'ftbi_is_logged_in_v8',
  EVENT_PROFILE: 'ftbi_event_profile_v1',
  ADMIN_CREDENTIALS: 'ftbi_admin_credentials_v1',
  REGISTRATION_SCHEDULE: 'ftbi_registration_schedule_v1',
};

export default function App() {
  // Authentication Gate State (Web Login Gate)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // User session state
  const [currentUserSession, setCurrentUserSession] = useState<CurrentUserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<AppTabType>('admin');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('cat-nyurat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Check if URL has ?form=pendaftaran (from QR Code scan)
  const [isPublicRegistrationMode, setIsPublicRegistrationMode] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('form') === 'pendaftaran' || params.get('mode') === 'daftar';
    } catch {
      return false;
    }
  });

  // App state with automatic sanitization against stale caches
  const [categories, setCategories] = useState<CompetitionCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length === 7 &&
          parsed.some((c) => c.id === 'cat-nyurat' && c.name === 'Lomba Nyurat Aksara Bali di Kertas') &&
          parsed.some((c) => c.id === 'cat-babanyolan' && c.name === 'Lomba Babanyolan Tunggal')
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CATEGORIES;
  });

  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
      if (saved) {
        const parsed: School[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If the saved data contains legacy dummy preset schools (e.g. 'sch-1' or 'SD Negeri 1 Medewi'), purge them
          const isLegacyDummy = parsed.some(
            (s) => s.id === 'sch-1' || s.name === 'SD Negeri 1 Medewi'
          );
          if (!isLegacyDummy) {
            return parsed;
          } else {
            localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
          }
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SCHOOLS;
  });

  const [judges, setJudges] = useState<Judge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JUDGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((j: any) => j.role !== 'Juri Cadangan');
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_JUDGES;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PARTICIPANTS;
  });

  const [evaluations, setEvaluations] = useState<JudgeEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_EVALUATIONS;
  });

  const [eventProfile, setEventProfile] = useState<EventProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENT_PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_EVENT_PROFILE;
  });

  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_ADMIN_CREDENTIALS;
  });

  const [registrationSchedule, setRegistrationSchedule] = useState<RegistrationSchedule>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlStart = params.get('start');
      const urlEnd = params.get('end');

      const saved = localStorage.getItem(STORAGE_KEYS.REGISTRATION_SCHEDULE);
      let baseSchedule = INITIAL_REGISTRATION_SCHEDULE;
      if (saved) {
        baseSchedule = JSON.parse(saved);
      }

      if (urlToken || urlStart || urlEnd) {
        return {
          ...baseSchedule,
          registrationToken: urlToken || baseSchedule.registrationToken,
          startDate: urlStart || baseSchedule.startDate,
          endDate: urlEnd || baseSchedule.endDate,
          enabled: true,
        };
      }
      return baseSchedule;
    } catch {
      // Fallback
    }
    return INITIAL_REGISTRATION_SCHEDULE;
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUserSession && isLoggedIn) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(currentUserSession));
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    }
  }, [currentUserSession, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JUDGES, JSON.stringify(judges));
  }, [judges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENT_PROFILE, JSON.stringify(eventProfile));
  }, [eventProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_SCHEDULE, JSON.stringify(registrationSchedule));
  }, [registrationSchedule]);

  // =========================================================================
  // FIREBASE FIRESTORE REAL-TIME SYNCHRONIZATION
  // =========================================================================
  useEffect(() => {
    // 1. Seed initial master data to Firestore if cloud is empty
    seedInitialFirestoreData(
      INITIAL_SCHOOLS,
      INITIAL_CATEGORIES,
      INITIAL_EVENT_PROFILE,
      INITIAL_REGISTRATION_SCHEDULE,
      INITIAL_ADMIN_CREDENTIALS
    );

    // 2. Real-time Subscribers
    const unsubParticipants = subscribeParticipants((cloudParticipants) => {
      setParticipants(cloudParticipants);
    });

    const unsubSchools = subscribeSchools((cloudSchools) => {
      if (cloudSchools && cloudSchools.length > 0) {
        // If the cloud database contains legacy dummy preset schools, clean them from Firestore and clear state
        const isLegacyDummy = cloudSchools.some(
          (s) => s.id === 'sch-1' || s.name === 'SD Negeri 1 Medewi'
        );
        if (isLegacyDummy) {
          cloudSchools.forEach((s) => {
            if (s.id.startsWith('sch-') || s.name.includes('Medewi') || s.name.includes('Pulukan')) {
              deleteSchoolFromFirestore(s.id);
            }
          });
          setSchools([]);
          localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
        } else {
          setSchools(cloudSchools);
        }
      } else {
        setSchools([]);
      }
    });

    const unsubJudges = subscribeJudges((cloudJudges) => {
      const cleanJudges = (cloudJudges || []).filter((j) => (j.role as string) !== 'Juri Cadangan');
      setJudges(cleanJudges as Judge[]);
    });

    const unsubEvaluations = subscribeEvaluations((cloudEvaluations) => {
      setEvaluations(cloudEvaluations);
    });

    const unsubCategories = subscribeCategories((cloudCategories) => {
      if (cloudCategories && cloudCategories.length > 0) {
        setCategories(cloudCategories);
      }
    });

    const unsubAppConfig = subscribeAppConfig(({ eventProfile: ep, registrationSchedule: rs, adminCredentials: ac }) => {
      if (ep) setEventProfile(ep);
      if (rs) setRegistrationSchedule(rs);
      if (ac) setAdminCredentials(ac);
    });

    return () => {
      unsubParticipants();
      unsubSchools();
      unsubJudges();
      unsubEvaluations();
      unsubCategories();
      unsubAppConfig();
    };
  }, []);

  // Protect restricted tabs against judge roles
  useEffect(() => {
    if (currentUserSession?.role === 'judge') {
      if (
        activeTab === 'leaderboard' || 
        activeTab === 'registration' || 
        activeTab === 'judge_registration' ||
        activeTab === 'profile_settings'
      ) {
        setActiveTab('judging');
      }
    }
  }, [currentUserSession, activeTab]);

  // Handlers for School CRUD
  const handleAddSchool = (newSchoolData: Omit<School, 'id'>) => {
    const newSchool: School = {
      ...newSchoolData,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSchools((prev) => [...prev, newSchool]);
    saveSchoolToFirestore(newSchool);
  };

  const handleUpdateSchool = (updatedSchool: School) => {
    setSchools((prev) => prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s)));
    saveSchoolToFirestore(updatedSchool);

    // Otomatis sinkronkan nomor undian (lotNo) seluruh siswa dari sekolah tersebut
    if (updatedSchool.lotteryNumber !== undefined && updatedSchool.lotteryNumber !== null) {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.schoolId === updatedSchool.id) {
            const lotPadded = updatedSchool.lotteryNumber! < 10 ? `0${updatedSchool.lotteryNumber}` : `${updatedSchool.lotteryNumber}`;
            const updatedRegNo = p.registrationNo ? p.registrationNo.replace(/-[LP]\d+$/, `-${p.gender}${lotPadded}`) : p.registrationNo;
            const updatedP = {
              ...p,
              lotNo: updatedSchool.lotteryNumber!,
              registrationNo: updatedRegNo,
            };
            saveParticipantToFirestore(updatedP);
            return updatedP;
          }
          return p;
        })
      );
    }
  };

  const handleDeleteSchool = (schoolId: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== schoolId));
    deleteSchoolFromFirestore(schoolId);
  };

  const handleDeleteAllSchools = () => {
    schools.forEach((s) => deleteSchoolFromFirestore(s.id));
    setSchools([]);
    localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
  };

  const handleUpdateEventProfile = (updatedProfile: EventProfile) => {
    setEventProfile(updatedProfile);
    saveEventProfileToFirestore(updatedProfile);
  };

  const handleUpdateAdminCredentials = (updatedCreds: AdminCredentials) => {
    setAdminCredentials(updatedCreds);
    saveAdminCredentialsToFirestore(updatedCreds);
  };

  const handleUpdateRegistrationSchedule = (updatedSchedule: RegistrationSchedule) => {
    setRegistrationSchedule(updatedSchedule);
    saveRegistrationScheduleToFirestore(updatedSchedule);
  };

  // Auth Handlers
  const handleLoginJudge = (judge: Judge) => {
    const newSession: CurrentUserSession = {
      role: 'judge',
      judgeId: judge.id,
      username: judge.username,
      name: judge.name,
      categoryId: judge.categoryId,
      schoolId: judge.schoolId,
      judgeRole: judge.role,
    };
    setCurrentUserSession(newSession);
    setIsLoggedIn(true);
    setActiveCategoryId(judge.categoryId);
    setActiveTab('judging');
  };

  const handleLoginSuperAdmin = () => {
    const newSession: CurrentUserSession = {
      role: 'superadmin',
      name: 'Super Admin (Panitia FTBI)',
    };
    setCurrentUserSession(newSession);
    setIsLoggedIn(true);
    setActiveTab('admin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserSession(null);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
  };

  // Handlers for Participants
  const handleAddParticipant = (newParticipant: Omit<Participant, 'id' | 'registrationNo' | 'lotNo' | 'registeredAt' | 'status'>) => {
    const school = schools.find((s) => s.id === newParticipant.schoolId);
    const catObj = categories.find((c) => c.id === newParticipant.categoryId);
    const catCode = catObj?.code || 'LMB';
    
    // Nomor undi diambil murni dari nomor undi sekolah (diundi manual per sekolah)
    const schoolIndex = schools.findIndex((s) => s.id === newParticipant.schoolId) + 1;
    const schoolLot = school?.lotteryNumber ?? schoolIndex;
    const lotPadded = schoolLot < 10 ? `0${schoolLot}` : `${schoolLot}`;
    const regNo = `FTBI-26-${catCode}-${newParticipant.gender}${lotPadded}`;

    const fullParticipant: Participant = {
      ...newParticipant,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      registrationNo: regNo,
      lotNo: schoolLot,
      status: 'registered',
      registeredAt: new Date().toISOString(),
    };

    setParticipants((prev) => [fullParticipant, ...prev]);
    saveParticipantToFirestore(fullParticipant);
  };

  const handleUpdateParticipant = (updatedParticipant: Participant) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === updatedParticipant.id ? updatedParticipant : p))
    );
    saveParticipantToFirestore(updatedParticipant);
  };

  const handleDeleteParticipant = (participantId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    setEvaluations((prev) => prev.filter((e) => e.participantId !== participantId));
    deleteParticipantFromFirestore(participantId);
    // Also delete associated evaluations from Firestore
    evaluations.filter((e) => e.participantId === participantId).forEach((e) => {
      deleteEvaluationFromFirestore(e.id);
    });
  };

  const handleDeleteAllParticipants = () => {
    participants.forEach((p) => deleteParticipantFromFirestore(p.id));
    evaluations.forEach((e) => deleteEvaluationFromFirestore(e.id));
    setParticipants([]);
    setEvaluations([]);
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
  };

  // Handlers for Judges
  const handleAddJudge = (newJudge: Judge) => {
    setJudges((prev) => [newJudge, ...prev]);
    saveJudgeToFirestore(newJudge);
  };

  const handleUpdateJudge = (updatedJudge: Judge) => {
    setJudges((prev) => prev.map((j) => (j.id === updatedJudge.id ? updatedJudge : j)));
    saveJudgeToFirestore(updatedJudge);
  };

  const handleSaveJudgesBatch = async (judgesToSave: Judge[], judgeIdsToDelete: string[] = []) => {
    setJudges((prev) => {
      let next = [...prev];
      if (judgeIdsToDelete.length > 0) {
        next = next.filter((j) => !judgeIdsToDelete.includes(j.id));
      }
      for (const judge of judgesToSave) {
        const idx = next.findIndex((j) => j.id === judge.id);
        if (idx >= 0) {
          next[idx] = judge;
        } else {
          next.push(judge);
        }
      }
      return next;
    });
    try {
      await saveJudgesBatchToFirestore(judgesToSave, judgeIdsToDelete);
    } catch (err) {
      console.error('Error saving judges batch to Firestore:', err);
    }
  };

  const handleUpdateAllJudges = async (updatedJudges: Judge[]) => {
    setJudges(updatedJudges);
    try {
      await saveJudgesBatchToFirestore(updatedJudges);
    } catch (err) {
      console.error('Error updating all judges in Firestore:', err);
    }
  };

  const handleDeleteJudge = (judgeId: string) => {
    setJudges((prev) => prev.filter((j) => j.id !== judgeId));
    deleteJudgeFromFirestore(judgeId);
  };

  const handleDeleteAllJudges = () => {
    judges.forEach((j) => deleteJudgeFromFirestore(j.id));
    setJudges([]);
    localStorage.removeItem(STORAGE_KEYS.JUDGES);
  };

  // Evaluation & Scoring Handlers
  const handleSaveEvaluation = (newEval: JudgeEvaluation) => {
    setEvaluations((prev) => {
      const existingIndex = prev.findIndex(
        (e) => e.participantId === newEval.participantId && e.judgeId === newEval.judgeId
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = newEval;
        return copy;
      }
      return [...prev, newEval];
    });

    saveEvaluationToFirestore(newEval);

    // Check if participant has completed all 3 effective judges
    const participant = participants.find((p) => p.id === newEval.participantId);
    if (participant) {
      const catJudges = judges.filter((j) => j.categoryId === participant.categoryId);
      const judgePairs = getEffectiveJudgesForParticipant(participant, catJudges);
      const effectiveJudges = judgePairs.map((jp) => jp.effectiveJudge);

      const allParticipantEvals = [
        ...evaluations.filter((e) => e.participantId === participant.id && e.judgeId !== newEval.judgeId),
        newEval,
      ];

      const effectiveEvals = allParticipantEvals.filter((e) =>
        effectiveJudges.some((j) => j.id === e.judgeId)
      );

      if (effectiveEvals.length === effectiveJudges.length) {
        handleParticipantStatusChange(participant.id, 'evaluated');
      }
    }
  };

  const handleParticipantStatusChange = (
    participantId: string,
    status: Participant['status']
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          const updated = { ...p, status };
          saveParticipantToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // 1. RESET NILAI PER CABANG LOMBA
  const handleResetCategoryScores = (categoryId: string) => {
    const targetCategory = categories.find((c) => c.id === categoryId);
    const categoryParticipantIds = new Set(
      participants.filter((p) => p.categoryId === categoryId).map((p) => p.id)
    );

    // Delete evaluations in Firestore
    evaluations
      .filter((e) => categoryParticipantIds.has(e.participantId))
      .forEach((e) => deleteEvaluationFromFirestore(e.id));

    // Filter out only evaluations for this category
    setEvaluations((prev) =>
      prev.filter((e) => !categoryParticipantIds.has(e.participantId))
    );

    // Reset status only for participants in this category
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.categoryId === categoryId) {
          const updated = { ...p, status: 'registered' as const };
          saveParticipantToFirestore(updated);
          return updated;
        }
        return p;
      })
    );

    alert(`Seluruh nilai juri pada cabang "${targetCategory?.name || 'Cabang Lomba'}" berhasil dikosongkan. Seluruh peserta di cabang ini kembali ke status "Belum Dinilai".`);
  };

  // 2. RESET TOTAL DATA (MASTER RESET KE DATA DEFAULT)
  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
    localStorage.removeItem(STORAGE_KEYS.JUDGES);
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);

    setCategories(INITIAL_CATEGORIES);
    setSchools(INITIAL_SCHOOLS);
    setJudges(INITIAL_JUDGES);
    setParticipants(INITIAL_PARTICIPANTS);
    setEvaluations(INITIAL_EVALUATIONS);
    handleLoginSuperAdmin();
  };

  // ==========================================
  // 1. PUBLIC REGISTRATION FORM (FROM QR CODE SCAN / LINK)
  // ==========================================
  if (isPublicRegistrationMode) {
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('cabang') || undefined;

    return (
      <PublicRegistrationPage
        schools={schools}
        categories={categories}
        registrationSchedule={registrationSchedule}
        onAddParticipant={handleAddParticipant}
        onBackToMain={() => {
          setIsPublicRegistrationMode(false);
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('form');
            url.searchParams.delete('cabang');
            url.searchParams.delete('mode');
            window.history.replaceState({}, '', url.pathname);
          } catch {
            // ignore
          }
        }}
        initialCategoryId={initialCategory}
      />
    );
  }

  // ==========================================
  // 2. STANDALONE LOGIN GATEWAY (IF NOT LOGGED IN)
  // ==========================================
  if (!isLoggedIn || !currentUserSession) {
    return (
      <LoginPage
        judges={judges}
        categories={categories}
        schools={schools}
        eventProfile={eventProfile}
        adminCredentials={adminCredentials}
        onLoginSuperAdmin={handleLoginSuperAdmin}
        onLoginJudge={handleLoginJudge}
      />
    );
  }

  // ==========================================
  // 2. MAIN WEBSITE / SYSTEM DASHBOARD (LOGGED IN)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Outer Shell */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-5 items-start">
        
        {/* Left: Floating Sidebar Card */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-5 self-start h-[calc(100vh-2.5rem)]">
          <Sidebar
            categories={categories}
            participants={participants}
            evaluations={evaluations}
            judges={judges}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeCategoryId={activeCategoryId}
            onSelectCategory={(catId) => {
              if (currentUserSession?.role === 'judge' && currentUserSession.categoryId !== catId) {
                return;
              }
              setActiveCategoryId(catId);
              setActiveTab('judging');
            }}
            onResetData={handleResetData}
            currentUserSession={currentUserSession}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        </div>

        {/* Right: Main Content Panels */}
        <div className="flex-1 w-full min-w-0 space-y-5">
          
          {/* 1. Top Bar */}
          <TopNavbar
            currentSession={currentUserSession}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
            onResetData={handleResetData}
          />

          {/* 2. Welcome Banner (Hanya muncul di Beranda / Dashboard Utama) */}
          {activeTab === 'admin' && <BannerCard eventProfile={eventProfile} />}

          {/* 3. Main Active Views Container */}
          <div className="space-y-5">
            
            {/* View: Dashboard & Status 7 Cabang Lomba */}
            {activeTab === 'admin' && (
              <AdminOverview
                categories={categories}
                participants={participants}
                evaluations={evaluations}
                judges={judges}
                currentUserSession={currentUserSession}
                onSelectCategory={
                  currentUserSession?.role === 'judge'
                    ? undefined
                    : (catId) => {
                        setActiveCategoryId(catId);
                        setActiveTab('judging');
                      }
                }
              />
            )}

            {/* View: Pendaftaran Peserta (Hanya Super Admin) */}
            {activeTab === 'registration' && currentUserSession.role === 'superadmin' && (
              <RegistrationPortal
                schools={schools}
                categories={categories}
                participants={participants}
                registrationSchedule={registrationSchedule}
                onAddParticipant={handleAddParticipant}
                onUpdateParticipant={handleUpdateParticipant}
                onDeleteParticipant={handleDeleteParticipant}
                onDeleteAllParticipants={handleDeleteAllParticipants}
                onOpenShareModal={() => setIsShareModalOpen(true)}
              />
            )}

            {/* View: Pendaftaran Juri (Hanya Super Admin) */}
            {activeTab === 'judge_registration' && currentUserSession.role === 'superadmin' && (
              <JudgeRegistrationPortal
                schools={schools}
                categories={categories}
                judges={judges}
                onAddJudge={handleAddJudge}
                onUpdateJudge={handleUpdateJudge}
                onDeleteJudge={handleDeleteJudge}
                onDeleteAllJudges={handleDeleteAllJudges}
                onSaveJudgesBatch={handleSaveJudgesBatch}
                onUpdateAllJudges={handleUpdateAllJudges}
              />
            )}

            {/* View: Penilaian Cabang Lomba */}
            {activeTab === 'judging' && (
              <JudgingBooth
                categories={categories}
                schools={schools}
                judges={judges}
                participants={participants}
                evaluations={evaluations}
                selectedCategoryId={activeCategoryId}
                currentUserSession={currentUserSession}
                onSelectCategory={(catId) => setActiveCategoryId(catId)}
                onSaveEvaluation={handleSaveEvaluation}
                onStatusChange={handleParticipantStatusChange}
                onResetCategoryScores={handleResetCategoryScores}
              />
            )}

            {/* View: Leaderboard & Rekapitulasi (Hanya Super Admin / Panitia) */}
            {activeTab === 'leaderboard' && currentUserSession.role === 'superadmin' && (
              <LeaderboardAndReports
                categories={categories}
                schools={schools}
                judges={judges}
                participants={participants}
                evaluations={evaluations}
                selectedCategoryId={activeCategoryId}
                eventProfile={eventProfile}
                onSelectCategory={(catId) => setActiveCategoryId(catId)}
              />
            )}

            {/* View: Edit Profil & Pengaturan Instansi (Hanya Super Admin) */}
            {activeTab === 'profile_settings' && currentUserSession.role === 'superadmin' && (
              <ProfileSettingsPortal
                schools={schools}
                eventProfile={eventProfile}
                adminCredentials={adminCredentials}
                participants={participants}
                judges={judges}
                onAddSchool={handleAddSchool}
                onUpdateSchool={handleUpdateSchool}
                onDeleteSchool={handleDeleteSchool}
                onDeleteAllSchools={handleDeleteAllSchools}
                onUpdateEventProfile={handleUpdateEventProfile}
                onUpdateAdminCredentials={handleUpdateAdminCredentials}
              />
            )}

          </div>

        </div>

      </div>

      {/* Mobile Drawer (Overlay) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col p-3 bg-white">
            <Sidebar
              categories={categories}
              participants={participants}
              evaluations={evaluations}
              judges={judges}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeCategoryId={activeCategoryId}
              onSelectCategory={(catId) => {
                if (currentUserSession?.role === 'judge' && currentUserSession.categoryId !== catId) {
                  return;
                }
                setActiveCategoryId(catId);
                setActiveTab('judging');
                setIsMobileSidebarOpen(false);
              }}
              onResetData={handleResetData}
              currentUserSession={currentUserSession}
              onOpenLoginModal={() => {
                setIsMobileSidebarOpen(false);
                setIsLoginModalOpen(true);
              }}
              onLogout={() => {
                setIsMobileSidebarOpen(false);
                handleLogout();
              }}
              onOpenShareModal={() => {
                setIsMobileSidebarOpen(false);
                setIsShareModalOpen(true);
              }}
              isOpenMobile={true}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-4 px-6 sm:px-8 text-xs text-slate-500 mt-auto text-center">
        <p className="font-semibold text-slate-600">
          Sistem FTBI Jenjang SD - Developed by I Gede Anom Apriliawan
        </p>
      </footer>

      {/* Share Registration & QR Code Modal */}
      <ShareRegistrationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        categories={categories}
        registrationSchedule={registrationSchedule}
        onUpdateRegistrationSchedule={handleUpdateRegistrationSchedule}
        onOpenPublicForm={() => {
          setIsShareModalOpen(false);
          setIsPublicRegistrationMode(true);
        }}
      />

      {/* Login & Role Switcher Modal (Bisa dipanggil jika butuh berganti peran cepat saat login) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        judges={judges}
        categories={categories}
        schools={schools}
        currentSession={currentUserSession}
        onLoginSuperAdmin={handleLoginSuperAdmin}
        onLoginJudge={handleLoginJudge}
        onLogout={handleLogout}
      />

    </div>
  );
}
