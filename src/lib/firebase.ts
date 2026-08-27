import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Participant,
  School,
  Judge,
  JudgeEvaluation,
  CompetitionCategory,
  EventProfile,
  RegistrationSchedule,
  AdminCredentials,
} from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
const COLLECTIONS = {
  PARTICIPANTS: 'participants',
  SCHOOLS: 'schools',
  JUDGES: 'judges',
  EVALUATIONS: 'evaluations',
  CATEGORIES: 'categories',
  APP_CONFIG: 'app_config',
};

// ==========================================
// REAL-TIME SUBSCRIBERS
// ==========================================

export function subscribeParticipants(onData: (participants: Participant[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.PARTICIPANTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: Participant[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as Participant);
      });
      onData(data);
    },
    (err) => {
      console.error('Error fetching participants from Firestore:', err);
    }
  );
}

export function subscribeSchools(onData: (schools: School[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.SCHOOLS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: School[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as School);
      });
      data.sort((a, b) => (a.lotteryNumber || 0) - (b.lotteryNumber || 0));
      onData(data);
    },
    (err) => {
      console.error('Error fetching schools from Firestore:', err);
    }
  );
}

export function subscribeJudges(onData: (judges: Judge[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.JUDGES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: Judge[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as Judge);
      });
      onData(data);
    },
    (err) => {
      console.error('Error fetching judges from Firestore:', err);
    }
  );
}

export function subscribeEvaluations(onData: (evaluations: JudgeEvaluation[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.EVALUATIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: JudgeEvaluation[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as JudgeEvaluation);
      });
      onData(data);
    },
    (err) => {
      console.error('Error fetching evaluations from Firestore:', err);
    }
  );
}

export function subscribeCategories(onData: (categories: CompetitionCategory[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.CATEGORIES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: CompetitionCategory[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as CompetitionCategory);
      });
      if (data.length > 0) {
        onData(data);
      }
    },
    (err) => {
      console.error('Error fetching categories from Firestore:', err);
    }
  );
}

export function subscribeAppConfig(
  onData: (config: {
    eventProfile?: EventProfile;
    registrationSchedule?: RegistrationSchedule;
    adminCredentials?: AdminCredentials;
  }) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.APP_CONFIG);
  return onSnapshot(
    colRef,
    (snapshot) => {
      let eventProfile: EventProfile | undefined;
      let registrationSchedule: RegistrationSchedule | undefined;
      let adminCredentials: AdminCredentials | undefined;

      snapshot.forEach((docSnap) => {
        if (docSnap.id === 'event_profile') {
          eventProfile = docSnap.data() as EventProfile;
        } else if (docSnap.id === 'registration_schedule') {
          registrationSchedule = docSnap.data() as RegistrationSchedule;
        } else if (docSnap.id === 'admin_credentials') {
          adminCredentials = docSnap.data() as AdminCredentials;
        }
      });

      onData({ eventProfile, registrationSchedule, adminCredentials });
    },
    (err) => {
      console.error('Error fetching app config from Firestore:', err);
    }
  );
}

// ==========================================
// FIRESTORE CRUD OPERATIONS
// ==========================================

// Participants
export async function saveParticipantToFirestore(participant: Participant): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PARTICIPANTS, participant.id);
  await setDoc(docRef, participant, { merge: true });
}

export async function deleteParticipantFromFirestore(participantId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId);
  await deleteDoc(docRef);
}

// Schools
export async function saveSchoolToFirestore(school: School): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SCHOOLS, school.id);
  await setDoc(docRef, school, { merge: true });
}

export async function deleteSchoolFromFirestore(schoolId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SCHOOLS, schoolId);
  await deleteDoc(docRef);
}

// Judges
export async function saveJudgeToFirestore(judge: Judge): Promise<void> {
  const docRef = doc(db, COLLECTIONS.JUDGES, judge.id);
  await setDoc(docRef, judge, { merge: true });
}

export async function saveJudgesBatchToFirestore(
  judgesToSave: Judge[],
  judgeIdsToDelete: string[] = []
): Promise<void> {
  if (judgesToSave.length === 0 && judgeIdsToDelete.length === 0) return;
  const batch = writeBatch(db);
  for (const j of judgesToSave) {
    const docRef = doc(db, COLLECTIONS.JUDGES, j.id);
    batch.set(docRef, j, { merge: true });
  }
  for (const id of judgeIdsToDelete) {
    const docRef = doc(db, COLLECTIONS.JUDGES, id);
    batch.delete(docRef);
  }
  await batch.commit();
}

export async function deleteJudgeFromFirestore(judgeId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.JUDGES, judgeId);
  await deleteDoc(docRef);
}

// Evaluations
export async function saveEvaluationToFirestore(evaluation: JudgeEvaluation): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EVALUATIONS, evaluation.id);
  await setDoc(docRef, evaluation, { merge: true });
}

export async function deleteEvaluationFromFirestore(evaluationId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EVALUATIONS, evaluationId);
  await deleteDoc(docRef);
}

// Categories
export async function saveCategoryToFirestore(category: CompetitionCategory): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
  await setDoc(docRef, category, { merge: true });
}

// App Configs
export async function saveEventProfileToFirestore(eventProfile: EventProfile): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APP_CONFIG, 'event_profile');
  await setDoc(docRef, eventProfile, { merge: true });
}

export async function saveRegistrationScheduleToFirestore(schedule: RegistrationSchedule): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APP_CONFIG, 'registration_schedule');
  await setDoc(docRef, schedule, { merge: true });
}

export async function saveAdminCredentialsToFirestore(credentials: AdminCredentials): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APP_CONFIG, 'admin_credentials');
  await setDoc(docRef, credentials, { merge: true });
}

// ==========================================
// DATABASE BOOTSTRAPPING & INITIAL SEEDING
// ==========================================

export async function seedInitialFirestoreData(
  schools: School[],
  categories: CompetitionCategory[],
  eventProfile: EventProfile,
  schedule: RegistrationSchedule,
  adminCreds: AdminCredentials
): Promise<void> {
  try {
    // Check if schools collection needs initial seeding (only if non-empty array provided)
    if (schools && schools.length > 0) {
      const schoolsSnap = await getDocs(collection(db, COLLECTIONS.SCHOOLS));
      if (schoolsSnap.empty) {
        console.log('Seeding initial schools to Firestore...');
        const batch = writeBatch(db);
        for (const s of schools) {
          batch.set(doc(db, COLLECTIONS.SCHOOLS, s.id), s);
        }
        await batch.commit();
      }
    }

    // Check if categories collection is empty
    const catSnap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    if (catSnap.empty) {
      console.log('Seeding initial categories to Firestore...');
      const batch = writeBatch(db);
      for (const c of categories) {
        batch.set(doc(db, COLLECTIONS.CATEGORIES, c.id), c);
      }
      await batch.commit();
    }

    // Check if app_config is empty
    const configSnap = await getDocs(collection(db, COLLECTIONS.APP_CONFIG));
    if (configSnap.empty) {
      console.log('Seeding initial event settings to Firestore...');
      await saveEventProfileToFirestore(eventProfile);
      await saveRegistrationScheduleToFirestore(schedule);
      await saveAdminCredentialsToFirestore(adminCreds);
    }
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
  }
}
