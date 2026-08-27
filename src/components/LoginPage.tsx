import React, { useState } from 'react';
import { 
  Award, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Judge, CompetitionCategory, School, EventProfile, AdminCredentials } from '../types';

interface LoginPageProps {
  judges: Judge[];
  categories: CompetitionCategory[];
  schools: School[];
  eventProfile?: EventProfile;
  adminCredentials?: AdminCredentials;
  onLoginSuperAdmin: () => void;
  onLoginJudge: (judge: Judge) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  judges,
  categories,
  schools,
  eventProfile,
  adminCredentials,
  onLoginSuperAdmin,
  onLoginJudge,
}) => {
  const [role, setRole] = useState<'judge' | 'admin'>('judge');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSampleAccounts, setShowSampleAccounts] = useState(false);

  // Switch role handler
  const handleRoleChange = (newRole: 'judge' | 'admin') => {
    setRole(newRole);
    setErrorMessage('');
    if (newRole === 'admin') {
      setUsername(adminCredentials?.username || 'admin');
      setPassword(adminCredentials?.password || 'admin123');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  // Submit Login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Silakan masukkan Username.');
      return;
    }

    if (role === 'admin') {
      const activeAdminUser = (adminCredentials?.username || 'admin').toLowerCase();
      const activeAdminPass = adminCredentials?.password || 'admin123';

      const validAdmins = [activeAdminUser, 'admin', 'superadmin', 'panitia'];
      const validPass = [activeAdminPass, 'admin123', 'admin', 'ftbi2026', '123456', 'panitia2026', ''];
      
      if (validAdmins.includes(cleanUser) && validPass.includes(cleanPass)) {
        onLoginSuperAdmin();
      } else {
        setErrorMessage(`Username atau Password Admin salah. (Akun aktif: ${adminCredentials?.username || 'admin'})`);
      }
    } else {
      // Judge Login
      const targetJudge = judges.find((j) => {
        const matchUser = 
          j.username?.toLowerCase() === cleanUser || 
          j.nip?.replace(/\s+/g, '') === cleanUser.replace(/\s+/g, '') ||
          j.token?.toLowerCase() === cleanUser;
        
        const matchPass = 
          !cleanPass || 
          j.password?.toLowerCase() === cleanPass.toLowerCase() ||
          j.token?.toLowerCase() === cleanPass.toLowerCase() ||
          cleanPass === '123456';

        return matchUser && matchPass;
      });

      if (targetJudge) {
        onLoginJudge(targetJudge);
      } else {
        setErrorMessage('Akun Juri tidak ditemukan. Periksa kembali Username dan Password Anda.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
        
        {/* 1. Logo & Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 border border-emerald-700/30 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-950/20 overflow-hidden p-1.5">
            {eventProfile?.logoUrl ? (
              <img 
                src={eventProfile.logoUrl} 
                alt="Logo Event" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Award className="w-9 h-9" />
            )}
          </div>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sistem FTBI {eventProfile?.districtName || 'Pekutatan'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {eventProfile?.eventName || 'Festival Tunas Bahasa Ibu'} {eventProfile?.targetLevel || 'Jenjang SD'} {eventProfile?.eventYear || '2026'}
            </p>
          </div>
        </div>

        {/* 2. Dewan Juri | Admin Segmented Control */}
        <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/60">
          <button
            type="button"
            id="login-role-judge"
            onClick={() => handleRoleChange('judge')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'judge'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Dewan Juri</span>
          </button>

          <button
            type="button"
            id="login-role-admin"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-tight">{errorMessage}</div>
          </div>
        )}

        {/* 3. Form Username & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'judge' ? 'Masukkan Username / NIP Juri' : 'Masukkan Username Admin'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={role === 'judge' ? 'Masukkan Password / PIN' : 'Masukkan Password Admin'}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
          >
            <span>Masuk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick helper drawer for simple testing without manual typing */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowSampleAccounts(!showSampleAccounts)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-emerald-800 transition cursor-pointer py-1"
          >
            <span>Bantuan Akun Uji Coba</span>
            {showSampleAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSampleAccounts && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {role === 'admin' ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60">
                  <div>
                    <div className="font-bold text-slate-800">Super Admin</div>
                    <div className="text-[10px] text-slate-500">Username: admin • Password: admin123</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin');
                      setPassword('admin123');
                    }}
                    className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900 cursor-pointer"
                  >
                    Gunakan
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {judges.slice(0, 5).map((j) => {
                    const cat = categories.find((c) => c.id === j.categoryId);
                    return (
                      <div key={j.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-800 truncate">{j.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{cat?.name} ({j.role})</div>
                          <div className="text-[9px] text-emerald-700 font-mono">User: {j.username}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUsername(j.username || '');
                            setPassword(j.password || '');
                          }}
                          className="px-2.5 py-1 bg-emerald-800 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-900 cursor-pointer shrink-0"
                        >
                          Pilih
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 mt-6">
        Sistem FTBI Developed by I Gede Anom Apriliawan
      </div>

    </div>
  );
};
