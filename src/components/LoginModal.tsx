import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Award, 
  School as SchoolIcon,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Judge, CompetitionCategory, School, CurrentUserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  judges: Judge[];
  categories: CompetitionCategory[];
  schools: School[];
  currentSession: CurrentUserSession;
  onLoginSuperAdmin: () => void;
  onLoginJudge: (judge: Judge) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  judges,
  categories,
  schools,
  currentSession,
  onLoginSuperAdmin,
  onLoginJudge,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'superadmin' | 'judge'>('judge');
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleJudgeCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetJudge = judges.find(
      (j) => j.username?.toLowerCase() === usernameInput.trim().toLowerCase() && j.password === passwordInput.trim()
    );

    if (targetJudge) {
      onLoginJudge(targetJudge);
      onClose();
    } else {
      setLoginError('Username atau PIN password Juri tidak sesuai. Silakan periksa daftar akun juri atau gunakan pilihan cepat di bawah.');
    }
  };

  const handleQuickJudgeSelect = (judge: Judge) => {
    onLoginJudge(judge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-snug">
                Portal Masuk & Peran Akses
              </h3>
              <p className="text-xs text-slate-400">
                FTBI Kecamatan Pekutatan Tahun 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Status */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                Akun Sedang Aktif:
              </div>
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {currentSession.name}
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0 ${
            currentSession.role === 'superadmin' 
              ? 'bg-slate-900 text-white' 
              : 'bg-emerald-800 text-white'
          }`}>
            {currentSession.role === 'superadmin' ? 'Super Admin' : `${currentSession.judgeRole || 'Juri'}`}
          </span>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('judge');
              setLoginError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'judge'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Login Sebagai Dewan Juri</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('superadmin');
              setLoginError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'superadmin'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Super Admin (Panitia)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {activeTab === 'judge' ? (
            <div className="space-y-5">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">
                  Peraturan Akses Dewan Juri:
                </p>
                <p>
                  Setelah masuk, bilik penilaian otomatis <strong>terkunci ke nama & cabang lomba Anda</strong>. Juri tidak dapat berpindah peran menilai cabang atau juri lainnya demi integritas skor.
                </p>
              </div>

              {/* Quick One-Click Judge Select for easy testing */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Juri dari Daftar Akun Terdaftar:
                </label>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {judges.map((j) => {
                    const cat = categories.find((c) => c.id === j.categoryId);
                    const sch = schools.find((s) => s.id === j.schoolId);
                    const isCurrent = currentSession.judgeId === j.id;

                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => handleQuickJudgeSelect(j)}
                        className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                          isCurrent
                            ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-800 text-white text-[10px] font-black px-2 py-0.5 rounded">
                              {j.role}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {j.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {cat?.name} • {sch?.name}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            // Super Admin Panel
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-extrabold text-sm text-emerald-400">
                    Hak Akses Penuh Super Admin
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Super Admin memiliki wewenang untuk melihat seluruh 7 cabang lomba, mengelola pendaftaran peserta & juri, meninjau rekaman skor semua juri, menyelesaikan harmonisasi nilai disparitas, dan mengekspor hasil kejuaraan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLoginSuperAdmin();
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                Aktifkan Peran Super Admin (Panitia)
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Reset ke Super Admin</span>
          </button>
        </div>

      </div>
    </div>
  );
};
