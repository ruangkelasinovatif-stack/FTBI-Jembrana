import React, { useState, useRef } from 'react';
import { 
  Building2, 
  School as SchoolIcon, 
  Plus, 
  ListPlus,
  Pencil, 
  Trash2, 
  Search, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  UserCheck, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  MapPin, 
  Phone, 
  Award,
  Crown,
  Users,
  Lock,
  Sparkles,
  Printer,
  ChevronRight
} from 'lucide-react';
import { School, EventProfile, AdminCredentials, Participant, Judge } from '../types';

interface ProfileSettingsPortalProps {
  schools: School[];
  eventProfile: EventProfile;
  adminCredentials: AdminCredentials;
  participants: Participant[];
  judges: Judge[];
  onAddSchool: (school: Omit<School, 'id'>) => void;
  onUpdateSchool: (school: School) => void;
  onDeleteSchool: (schoolId: string) => void;
  onDeleteAllSchools?: () => void;
  onUpdateEventProfile: (profile: EventProfile) => void;
  onUpdateAdminCredentials: (creds: AdminCredentials) => void;
}

export const ProfileSettingsPortal: React.FC<ProfileSettingsPortalProps> = ({
  schools,
  eventProfile,
  adminCredentials,
  participants,
  judges,
  onAddSchool,
  onUpdateSchool,
  onDeleteSchool,
  onDeleteAllSchools,
  onUpdateEventProfile,
  onUpdateAdminCredentials,
}) => {
  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'schools' | 'committee' | 'admin_security'>('schools');

  // Search query for schools
  const [schoolSearch, setSchoolSearch] = useState('');

  // School modal state
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForm, setSchoolForm] = useState<{
    name: string;
    lotteryNumber: number | string;
    npsn: string;
    village: string;
    district: string;
    headmaster: string;
    contactPhone: string;
  }>({
    name: '',
    lotteryNumber: '',
    npsn: '',
    village: '',
    district: eventProfile.districtName || 'Pekutatan',
    headmaster: '',
    contactPhone: '',
  });

  // Committee / Profile Form State
  const [profileForm, setProfileForm] = useState<EventProfile>({ ...eventProfile });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Admin Credentials Form State
  const [adminUsername, setAdminUsername] = useState(adminCredentials.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // File Upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const kopInputRef = useRef<HTMLInputElement>(null);

  // Sync profile form if prop changes
  React.useEffect(() => {
    setProfileForm({ ...eventProfile });
  }, [eventProfile]);

  React.useEffect(() => {
    setAdminUsername(adminCredentials.username);
  }, [adminCredentials]);

  // Open modal to add school
  const handleOpenAddSchool = () => {
    setEditingSchool(null);
    const nextLottery = schools.length > 0
      ? Math.max(...schools.map((s, idx) => s.lotteryNumber ?? (idx + 1))) + 1
      : 1;
    setSchoolForm({
      name: '',
      lotteryNumber: nextLottery,
      npsn: '',
      village: '',
      district: eventProfile.districtName || 'Pekutatan',
      headmaster: '',
      contactPhone: '',
    });
    setIsSchoolModalOpen(true);
  };

  // Open modal to edit school
  const handleOpenEditSchool = (sch: School, defaultIdx?: number) => {
    setEditingSchool(sch);
    setSchoolForm({
      name: sch.name,
      lotteryNumber: sch.lotteryNumber ?? (defaultIdx !== undefined ? defaultIdx + 1 : 1),
      npsn: sch.npsn || '',
      village: sch.village || '',
      district: sch.district || eventProfile.districtName || 'Pekutatan',
      headmaster: sch.headmaster || '',
      contactPhone: sch.contactPhone || '',
    });
    setIsSchoolModalOpen(true);
  };

  // Submit school form
  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim()) {
      alert('Nama Satuan Pendidikan / Sekolah tidak boleh kosong.');
      return;
    }

    const numLottery = Number(schoolForm.lotteryNumber) > 0 
      ? Number(schoolForm.lotteryNumber) 
      : (editingSchool?.lotteryNumber || schools.length + 1);

    if (editingSchool) {
      onUpdateSchool({
        ...editingSchool,
        name: schoolForm.name.trim(),
        lotteryNumber: numLottery,
        npsn: schoolForm.npsn.trim() || editingSchool.npsn || `${50102000 + numLottery}`,
        village: schoolForm.village.trim() || editingSchool.village || eventProfile.districtName || 'Pekutatan',
        district: schoolForm.district.trim() || editingSchool.district || eventProfile.districtName || 'Pekutatan',
        headmaster: schoolForm.headmaster.trim() || editingSchool.headmaster || '-',
        contactPhone: schoolForm.contactPhone.trim() || editingSchool.contactPhone || '-',
      });
    } else {
      onAddSchool({
        name: schoolForm.name.trim(),
        lotteryNumber: numLottery,
        npsn: `${50102000 + numLottery}`,
        village: eventProfile.districtName || 'Pekutatan',
        district: eventProfile.districtName || 'Pekutatan',
        headmaster: '-',
        contactPhone: '-',
      });
    }

    setIsSchoolModalOpen(false);
  };

  // Open Bulk Modal
  const handleOpenBulkModal = () => {
    setBulkInputText('');
    setIsBulkModalOpen(true);
  };

  // Submit Bulk Schools
  const handleSaveBulkSchools = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInputText.trim()) {
      alert('Silakan masukkan atau salin daftar nama sekolah.');
      return;
    }

    const lines = bulkInputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      alert('Tidak ada nama sekolah yang valid.');
      return;
    }

    let startLottery = schools.length > 0
      ? Math.max(...schools.map((s, idx) => s.lotteryNumber ?? (idx + 1))) + 1
      : 1;

    lines.forEach((line) => {
      // Remove leading numbering like "1. ", "1 - ", etc. if present
      const cleanedName = line.replace(/^\d+[\.\)\-\:\s]+/, '').trim() || line;
      onAddSchool({
        name: cleanedName,
        lotteryNumber: startLottery,
        npsn: `${50102000 + startLottery}`,
        village: eventProfile.districtName || 'Pekutatan',
        district: eventProfile.districtName || 'Pekutatan',
        headmaster: '-',
        contactPhone: '-',
      });
      startLottery++;
    });

    setIsBulkModalOpen(false);
    setBulkInputText('');
  };

  // Delete school handler
  const handleDeleteSchoolClick = (sch: School) => {
    const participantCount = participants.filter((p) => p.schoolId === sch.id).length;
    const judgeCount = judges.filter((j) => j.schoolId === sch.id).length;

    let warningMsg = `Hapus "${sch.name}" dari daftar sekolah?`;
    if (participantCount > 0 || judgeCount > 0) {
      warningMsg += `\n\nPerhatian: Terdapat ${participantCount} peserta dan ${judgeCount} juri yang terdaftar dari sekolah ini.`;
    }

    if (window.confirm(warningMsg)) {
      onDeleteSchool(sch.id);
    }
  };

  // Clear all schools handler
  const handleClearAllSchools = () => {
    if (schools.length === 0) return;
    const confirmMsg = `PERINGATAN: Apakah Anda yakin ingin MENGOSONGKAN SELURUH data (${schools.length}) sekolah?\n\nTindakan ini akan menghapus semua data sekolah yang tersimpan agar admin kecamatan dapat menginput ulang dari awal.`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteAllSchools) {
        onDeleteAllSchools();
      } else {
        schools.forEach((s) => onDeleteSchool(s.id));
      }
    }
  };

  // Handle Logo Upload
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileForm((prev) => ({
        ...prev,
        logoUrl: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle KOP Surat Image Upload
  const handleKopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file KOP Surat terlalu besar. Maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileForm((prev) => ({
        ...prev,
        customKopUrl: base64,
        useImageKop: true,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save Event Profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!profileForm.eventName || !profileForm.eventName.trim()) {
      alert('Nama Festival / Kegiatan tidak boleh kosong.');
      return;
    }
    if (!profileForm.districtName || !profileForm.districtName.trim()) {
      alert('Nama Kecamatan tidak boleh kosong.');
      return;
    }

    onUpdateEventProfile(profileForm);

    try {
      localStorage.setItem('ftbi_sd_event_profile', JSON.stringify(profileForm));
    } catch {
      // ignore
    }

    setProfileSaveSuccess(true);
    setTimeout(() => {
      setProfileSaveSuccess(false);
    }, 4000);
  };

  // Submit Admin Credentials Change
  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    const cleanUser = adminUsername.trim();
    if (!cleanUser) {
      setSecurityError('Username Admin tidak boleh kosong.');
      return;
    }

    // If changing password
    if (newPassword) {
      if (currentPassword && currentPassword !== adminCredentials.password && adminCredentials.password !== 'admin123') {
        setSecurityError('Password saat ini (lama) tidak sesuai.');
        return;
      }
      if (newPassword.length < 4) {
        setSecurityError('Password baru minimal 4 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityError('Konfirmasi password baru tidak cocok.');
        return;
      }
    }

    const updatedPass = newPassword || adminCredentials.password;
    onUpdateAdminCredentials({
      username: cleanUser,
      password: updatedPass,
    });

    setSecuritySuccess('Username & Password Admin berhasil diperbarui! Gunakan kredensial baru saat login.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Filtered & Sorted schools by lotteryNumber
  const sortedSchools = [...schools].sort((a, b) => {
    const numA = a.lotteryNumber ?? 999;
    const numB = b.lotteryNumber ?? 999;
    return numA - numB;
  });

  const filteredSchools = sortedSchools.filter((s) => {
    const q = schoolSearch.toLowerCase();
    return s.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Sub-Tabs Navigation */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Panel Super Admin
                </span>
                <span className="text-xs text-slate-400">Pengaturan Master Sistem</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Edit Profil, Instansi & Data Master
              </h1>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 max-w-sm">
            Kelola data sekolah, gugus/kecamatan, identitas panitia, logo, KOP surat, dan kredensial akun admin.
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/90 overflow-x-auto pb-1">
          <button
            id="tab-edit-profil-sekolah"
            onClick={() => setActiveSubTab('schools')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'schools'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SchoolIcon className="w-4 h-4 text-amber-300" />
            <span>Data Satuan Pendidikan & Gugus/Kecamatan ({schools.length})</span>
          </button>

          <button
            id="tab-edit-profil-panitia"
            onClick={() => setActiveSubTab('committee')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'committee'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>Identitas Panitia, Logo & KOP Surat</span>
          </button>

          <button
            id="tab-edit-profil-keamanan"
            onClick={() => setActiveSubTab('admin_security')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'admin_security'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Ganti Username & Password Admin</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: KELOLA DATA SEKOLAH & KECAMATAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'schools' && (
        <div className="space-y-6">
          
          {/* Top Action Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input-schools"
                type="text"
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="Cari nama sekolah..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {schoolSearch && (
                <button
                  onClick={() => setSchoolSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Stat & Add Button */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-xl font-medium hidden sm:block">
                Total: <strong className="text-slate-900">{schools.length} Sekolah</strong> • Wilayah: <strong className="text-slate-900">{eventProfile.districtName || 'Pekutatan'}</strong>
              </div>

              {schools.length > 0 && (
                <button
                  id="btn-clear-all-sekolah"
                  type="button"
                  onClick={handleClearAllSchools}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm rounded-2xl border border-rose-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Kosongkan seluruh data sekolah agar dapat diinput ulang"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Kosongkan Data</span>
                </button>
              )}

              <button
                id="btn-bulk-sekolah-modal"
                type="button"
                onClick={handleOpenBulkModal}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs sm:text-sm rounded-2xl border border-emerald-300 shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                title="Input atau salin banyak nama sekolah sekaligus"
              >
                <ListPlus className="w-4 h-4 text-emerald-700" />
                <span>Input Massal</span>
              </button>

              <button
                id="btn-tambah-sekolah-modal"
                type="button"
                onClick={handleOpenAddSchool}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Tambah Sekolah</span>
              </button>
            </div>

          </div>

          {/* School Table / Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SchoolIcon className="w-4 h-4 text-emerald-800" />
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  Daftar Satuan Pendidikan SD ({filteredSchools.length} Sekolah)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Kecamatan {eventProfile.districtName || 'Pekutatan'}, Kab. {eventProfile.regencyName || 'Jembrana'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 text-center w-36 sm:w-48">Nomor Undian Tampil</th>
                    <th className="p-3.5">Nama Sekolah</th>
                    <th className="p-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-10 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                            <SchoolIcon className="w-7 h-7" />
                          </div>
                          <div className="font-bold text-slate-800 text-base">
                            Belum Ada Data Satuan Pendidikan
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Data sekolah saat ini masih kosong. Silakan tambahkan sekolah satu per satu atau gunakan fitur input massal (salin-tempel daftar sekolah) untuk mengisi seluruh data sekolah secara instan.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={handleOpenAddSchool}
                              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-300" />
                              <span>Tambah Sekolah</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleOpenBulkModal}
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                            >
                              <ListPlus className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Input Massal</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSchools.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        Tidak ada data sekolah yang sesuai dengan kata kunci pencarian "{schoolSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredSchools.map((sch, idx) => {
                      const displayLottery = sch.lotteryNumber ?? (idx + 1);
                      return (
                        <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-mono font-black text-sm border border-emerald-200 shadow-2xs">
                              {displayLottery}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 text-sm sm:text-base">
                              {sch.name}
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditSchool(sch, idx)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-900 transition cursor-pointer"
                                title="Edit Data Sekolah"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchoolClick(sch)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                                title="Hapus Data Sekolah"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: IDENTITAS PANITIA, LOGO & KOP SURAT */}
      {/* ========================================================================= */}
      {activeSubTab === 'committee' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Notification Alert if saved */}
          {profileSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Identitas Panitia, Logo, dan KOP Surat resmi berhasil disimpan & diperbarui di seluruh dokumen laporan/berita acara!</span>
              </div>
              <span className="text-xs bg-emerald-200 text-emerald-950 font-bold px-2 py-1 rounded">Tersimpan</span>
            </div>
          )}

          {/* Section 1: Data Acara & Wilayah */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                1. Identitas Festival & Wilayah Penyelenggaraan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Festival / Kegiatan
                </label>
                <input
                  type="text"
                  value={profileForm.eventName}
                  onChange={(e) => setProfileForm({ ...profileForm, eventName: e.target.value })}
                  placeholder="Festival Tunas Bahasa Ibu (FTBI)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Pelaksanaan
                </label>
                <input
                  type="text"
                  value={profileForm.eventYear}
                  onChange={(e) => setProfileForm({ ...profileForm, eventYear: e.target.value })}
                  placeholder="2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenjang Satuan Pendidikan
                </label>
                <input
                  type="text"
                  value={profileForm.targetLevel}
                  onChange={(e) => setProfileForm({ ...profileForm, targetLevel: e.target.value })}
                  placeholder="Jenjang Sekolah Dasar (SD)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Gugus / Nama Kecamatan
                </label>
                <input
                  type="text"
                  value={profileForm.districtName}
                  onChange={(e) => setProfileForm({ ...profileForm, districtName: e.target.value })}
                  placeholder="Contoh: Gugus 1 / Pekutatan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={profileForm.regencyName}
                  onChange={(e) => setProfileForm({ ...profileForm, regencyName: e.target.value })}
                  placeholder="Jembrana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={profileForm.provinceName}
                  onChange={(e) => setProfileForm({ ...profileForm, provinceName: e.target.value })}
                  placeholder="Bali"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Penandatangan & Panitia Inti */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                2. Pejabat & Panitia Penandatangan (Berita Acara / Laporan)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Ketua Panitia */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Ketua Panitia Pelaksana</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nama Lengkap & Gelar Ketua Panitia:
                  </label>
                  <input
                    type="text"
                    value={profileForm.committeeChairman}
                    onChange={(e) => setProfileForm({ ...profileForm, committeeChairman: e.target.value })}
                    placeholder="I Made Suardana, S.Pd., M.Pd."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    NIP Ketua Panitia (Bila ada):
                  </label>
                  <input
                    type="text"
                    value={profileForm.committeeChairmanNip}
                    onChange={(e) => setProfileForm({ ...profileForm, committeeChairmanNip: e.target.value })}
                    placeholder="19700101 199503 1 005"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Sekretaris Panitia */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Sekretaris Panitia Pelaksana</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nama Lengkap & Gelar Sekretaris:
                  </label>
                  <input
                    type="text"
                    value={profileForm.committeeSecretary}
                    onChange={(e) => setProfileForm({ ...profileForm, committeeSecretary: e.target.value })}
                    placeholder="Ni Made Suarni, S.Pd."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    NIP Sekretaris Panitia (Bila ada):
                  </label>
                  <input
                    type="text"
                    value={profileForm.committeeSecretaryNip}
                    onChange={(e) => setProfileForm({ ...profileForm, committeeSecretaryNip: e.target.value })}
                    placeholder="19780412 200212 2 004"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Koordinator Wilayah Pendidikan (Korwil) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span>Koordinator Wilayah Pendidikan / Pembina Kecamatan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nama Lengkap & Gelar Korwil:
                    </label>
                    <input
                      type="text"
                      value={profileForm.educationCoordinator}
                      onChange={(e) => setProfileForm({ ...profileForm, educationCoordinator: e.target.value })}
                      placeholder="I Wayan Suarna, S.Pd., M.Pd."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      NIP Korwil Pendidikan:
                    </label>
                    <input
                      type="text"
                      value={profileForm.educationCoordinatorNip}
                      onChange={(e) => setProfileForm({ ...profileForm, educationCoordinatorNip: e.target.value })}
                      placeholder="19680512 199103 1 008"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Upload Logo & KOP Surat Resmi */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                3. Upload Logo & KOP Surat Resmi
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SISI KIRI: Upload Logo */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-900 uppercase">
                    Upload Logo Instansi / Logo Event
                  </div>
                  {profileForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, logoUrl: '' })}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      Hapus Logo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Logo Preview Box */}
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
                    {profileForm.logoUrl ? (
                      <img 
                        src={profileForm.logoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[9px] block leading-none">Default</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-1.5 flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>{profileForm.logoUrl ? 'Ganti Logo' : 'Upload File Logo'}</span>
                    </button>
                    <p className="text-[11px] text-slate-500">
                      Format PNG/JPG/WEBP transparan disarankan (Maks 2MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* SISI KANAN: Upload Banner KOP Surat Gambar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-900 uppercase">
                    Upload Banner KOP Surat (Header Gambar)
                  </div>
                  {profileForm.customKopUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, customKopUrl: '', useImageKop: false })}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      Hapus Gambar KOP
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    ref={kopInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleKopFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => kopInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>{profileForm.customKopUrl ? 'Ganti Gambar KOP Surat' : 'Upload File Gambar KOP'}</span>
                    </button>

                    {profileForm.customKopUrl && (
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileForm.useImageKop}
                          onChange={(e) => setProfileForm({ ...profileForm, useImageKop: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Gunakan Gambar KOP saat Cetak</span>
                      </label>
                    )}
                  </div>

                  {profileForm.customKopUrl && (
                    <div className="w-full h-16 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                      <img 
                        src={profileForm.customKopUrl} 
                        alt="KOP Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Jika tidak mengupload banner KOP, sistem akan otomatis merender format teks KOP resmi berlogo di bawah.
                  </p>
                </div>
              </div>

            </div>

            {/* Form Pengaturan Teks KOP Surat Resmi */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="text-xs font-extrabold text-slate-900 uppercase">
                Pengaturan Teks KOP Surat Standar (Render Dokumen Resmi):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Header Baris 1 (Pemerintah):
                  </label>
                  <input
                    type="text"
                    value={profileForm.kopTextHeader1}
                    onChange={(e) => setProfileForm({ ...profileForm, kopTextHeader1: e.target.value })}
                    placeholder="PEMERINTAH KABUPATEN JEMBRANA"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Header Baris 2 (Dinas / Instansi):
                  </label>
                  <input
                    type="text"
                    value={profileForm.kopTextHeader2}
                    onChange={(e) => setProfileForm({ ...profileForm, kopTextHeader2: e.target.value })}
                    placeholder="DINAS PENDIDIKAN, KEPEMUDAAN DAN OLAHRAGA"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Header Baris 3 (Panitia / Korwil):
                  </label>
                  <input
                    type="text"
                    value={profileForm.kopTextHeader3}
                    onChange={(e) => setProfileForm({ ...profileForm, kopTextHeader3: e.target.value })}
                    placeholder="PANITIA FESTIVAL TUNAS BAHASA IBU (FTBI) KECAMATAN PEKUTATAN"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Alamat Sekretariat & Kontak:
                  </label>
                  <input
                    type="text"
                    value={profileForm.kopTextAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, kopTextAddress: e.target.value })}
                    placeholder="Sekretariat: Kantor Koordinator Wilayah Pendidikan Kec. Pekutatan, Kode Pos 82262"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Pratinjau KOP Surat Live */}
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-300 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                <span>Pratinjau Live KOP Surat:</span>
                <span className="text-emerald-700">Tampilan Pada Berita Acara & Dokumen Cetak</span>
              </div>
              
              {profileForm.useImageKop && profileForm.customKopUrl ? (
                <div className="border-b-2 border-slate-900 pb-2 text-center">
                  <img 
                    src={profileForm.customKopUrl} 
                    alt="KOP Banner" 
                    className="max-h-24 mx-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-center gap-4 text-center">
                  {profileForm.logoUrl && (
                    <img 
                      src={profileForm.logoUrl} 
                      alt="Logo" 
                      className="w-14 h-14 object-contain shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {profileForm.kopTextHeader1 || 'PEMERINTAH KABUPATEN JEMBRANA'}
                    </div>
                    <div className="text-xs font-extrabold uppercase text-slate-900">
                      {profileForm.kopTextHeader2 || 'DINAS PENDIDIKAN, KEPEMUDAAN DAN OLAHRAGA'}
                    </div>
                    <div className="text-sm font-black uppercase text-slate-950">
                      {profileForm.kopTextHeader3 || 'PANITIA FESTIVAL TUNAS BAHASA IBU (FTBI)'}
                    </div>
                    <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                      {profileForm.kopTextAddress || 'Sekretariat Kantor Wilayah Pendidikan'}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Button Save Profile */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              {profileSaveSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Perubahan profil & KOP surat tersimpan di sistem!</span>
                </span>
              ) : (
                <span>Perubahan profil akan langsung berlaku di seluruh Berita Acara & Dokumen Cetak.</span>
              )}
            </div>

            <button
              type="button"
              id="btn-save-event-profile"
              onClick={(e) => handleSaveProfile(e)}
              className={`w-full sm:w-auto px-6 py-3.5 font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 ${
                profileSaveSuccess 
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-400' 
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white'
              }`}
            >
              {profileSaveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                  <span>✓ Profil & KOP Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Perubahan Profil & KOP Surat</span>
                </>
              )}
            </button>
          </div>

          {/* Floating Toast Notification */}
          {profileSaveSuccess && (
            <div 
              id="toast-profile-saved"
              className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start gap-3.5 animate-in slide-in-from-bottom-5 fade-in duration-300"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                  Berhasil Disimpan
                </div>
                <div className="text-xs font-bold text-slate-100 mt-0.5">
                  Profil Acara, Identitas Panitia, Logo & KOP Surat telah diperbarui!
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Berlaku otomatis pada lembar penilaian, berita acara, dan dokumen cetak.
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setProfileSaveSuccess(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

        </form>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: KEAMANAN AKUN ADMIN (GANTI USERNAME & PASSWORD) */}
      {/* ========================================================================= */}
      {activeSubTab === 'admin_security' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Ganti Username & Password Akun Admin
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola kredensial login akun Super Admin / Panitia FTBI.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {securityError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {/* Success Message */}
            {securitySuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminCredentials} className="space-y-4">
              
              {/* Username Admin */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Username Admin Baru:
                </label>
                <div className="relative">
                  <input
                    id="input-admin-username"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Masukkan username admin..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: <code>admin</code> (Bisa diganti nama instansi atau username pilihan Anda).
                </p>
              </div>

              {/* Password Lama (Opsional verifikasi) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Password Lama (Konfirmasi):
                </label>
                <div className="relative">
                  <input
                    id="input-admin-old-password"
                    type={showOldPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini jika ingin mengganti password..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Password Baru:
                </label>
                <div className="relative">
                  <input
                    id="input-admin-new-password"
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah password..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Konfirmasi Password Baru:
                </label>
                <div className="relative">
                  <input
                    id="input-admin-confirm-password"
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  id="btn-save-admin-security"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Simpan Perubahan Akun Admin</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FORM TAMBAH / EDIT DATA SEKOLAH */}
      {/* ========================================================================= */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingSchool ? 'Edit Data Satuan Pendidikan' : 'Tambah Data Sekolah Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Nama Satuan Pendidikan / Sekolah:
                </label>
                <input
                  type="text"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  placeholder="Contoh: SD Negeri 1 Medewi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Nomor Undian Tampil:
                </label>
                <input
                  type="number"
                  min={1}
                  value={schoolForm.lotteryNumber}
                  onChange={(e) => setSchoolForm({ ...schoolForm, lotteryNumber: e.target.value })}
                  placeholder="Contoh: 1, 2, 3..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomor undian tampil menentukan nomor urutan tampil sekolah pada daftar dan perlombaan.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>{editingSchool ? 'Simpan Perubahan' : 'Tambah Sekolah'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL INPUT MASSAL / SALIN DAFTAR SEKOLAH */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <ListPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Input Massal / Salin Daftar Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan beberapa nama sekolah sekaligus (satu baris per sekolah)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkSchools} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Daftar Nama Satuan Pendidikan / Sekolah:
                </label>
                <textarea
                  rows={8}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder={`Contoh:\nSD Negeri 1 Medewi\nSD Negeri 2 Medewi\nSD Negeri 3 Medewi\nSD Negeri 1 Pulukan\nSD Negeri 2 Pulukan`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tips: Anda dapat langsung menyalin (copy-paste) daftar nama sekolah dari Excel, Word, atau teks. Penomoran otomatis akan dibuat berurutan.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simpan Semua Sekolah</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
