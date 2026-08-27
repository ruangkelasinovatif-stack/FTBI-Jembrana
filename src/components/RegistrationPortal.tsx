import React, { useState } from 'react';
import { 
  School as SchoolIcon, 
  UserPlus, 
  Search, 
  Download, 
  ChevronDown,
  GraduationCap,
  Info,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  UserCheck,
  QrCode,
  Award,
  Share2,
  Calendar,
  Clock,
  Lock,
  CalendarCheck
} from 'lucide-react';
import { School, CompetitionCategory, Participant, RegistrationSchedule } from '../types';

interface RegistrationPortalProps {
  schools: School[];
  categories: CompetitionCategory[];
  participants: Participant[];
  registrationSchedule?: RegistrationSchedule;
  onAddParticipant: (newParticipant: Omit<Participant, 'id' | 'registrationNo' | 'lotNo' | 'registeredAt' | 'status'>) => void;
  onUpdateParticipant?: (updatedParticipant: Participant) => void;
  onDeleteParticipant?: (participantId: string) => void;
  onDeleteAllParticipants?: () => void;
  onOpenShareModal?: () => void;
  isStandaloneView?: boolean;
}

export const RegistrationPortal: React.FC<RegistrationPortalProps> = ({
  schools,
  categories,
  participants,
  registrationSchedule,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
  onDeleteAllParticipants,
  onOpenShareModal,
}) => {
  // Add Form State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [fullName, setFullName] = useState<string>('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [grade, setGrade] = useState<string>('Kelas 5');

  React.useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  React.useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Edit Modal State
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editGrade, setEditGrade] = useState<string>('Kelas 5');
  const [editSchoolId, setEditSchoolId] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editMentorName, setEditMentorName] = useState<string>('');
  const [editMentorPhone, setEditMentorPhone] = useState<string>('');

  // Delete State
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSchoolId, setFilterSchoolId] = useState<string>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredParticipants = participants
    .filter((p) => {
      const pSchool = schools.find((s) => s.id === p.schoolId);
      const pCat = categories.find((c) => c.id === p.categoryId);
      const query = searchTerm.toLowerCase();

      const matchSearch = 
        p.fullName.toLowerCase().includes(query) ||
        p.registrationNo.toLowerCase().includes(query) ||
        pSchool?.name.toLowerCase().includes(query) ||
        pCat?.name.toLowerCase().includes(query);

      const matchSchool = filterSchoolId === 'all' || p.schoolId === filterSchoolId;
      const matchCategory = filterCategoryId === 'all' || p.categoryId === filterCategoryId;

      return matchSearch && matchSchool && matchCategory;
    })
    .sort((a, b) => {
      const schA = schools.find((s) => s.id === a.schoolId)?.name || '';
      const schB = schools.find((s) => s.id === b.schoolId)?.name || '';
      const schoolCompare = schA.localeCompare(schB, 'id', { numeric: true });
      if (schoolCompare !== 0) return schoolCompare;

      const catA = categories.find((c) => c.id === a.categoryId)?.name || '';
      const catB = categories.find((c) => c.id === b.categoryId)?.name || '';
      const catCompare = catA.localeCompare(catB, 'id');
      if (catCompare !== 0) return catCompare;

      if (a.gender !== b.gender) {
        return a.gender === 'L' ? -1 : 1;
      }

      return a.fullName.localeCompare(b.fullName, 'id');
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !selectedSchoolId || !selectedCategoryId) {
      alert('Mohon lengkapi Nama Siswa, Asal Sekolah, Cabang Lomba, dan Kelas.');
      return;
    }

    const autoNisn = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const schoolObj = schools.find((s) => s.id === selectedSchoolId);
    const defaultMentor = `Guru Pembina ${schoolObj?.name || 'Sekolah'}`;

    onAddParticipant({
      fullName: fullName.trim(),
      nisn: autoNisn,
      gender,
      grade,
      schoolId: selectedSchoolId,
      categoryId: selectedCategoryId,
      mentorName: defaultMentor,
      mentorPhone: schoolObj?.contactPhone || '081234567890',
    });

    // Reset form
    setFullName('');
    showToast('Data Peserta Baru Berhasil Disimpan!');
  };

  // Open Edit Modal
  const handleStartEdit = (p: Participant) => {
    setEditingParticipant(p);
    setEditFullName(p.fullName);
    setEditGender(p.gender);
    setEditGrade(p.grade);
    setEditSchoolId(p.schoolId);
    setEditCategoryId(p.categoryId);
    setEditMentorName(p.mentorName || '');
    setEditMentorPhone(p.mentorPhone || '');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    if (!editFullName.trim() || !editSchoolId || !editCategoryId) {
      alert('Mohon lengkapi Nama Siswa, Asal Sekolah, dan Cabang Lomba.');
      return;
    }

    if (onUpdateParticipant) {
      const selectedSchool = schools.find((s) => s.id === editSchoolId);
      const schoolIndex = schools.findIndex((s) => s.id === editSchoolId) + 1;
      const schoolLot = selectedSchool?.lotteryNumber ?? schoolIndex;
      const catObj = categories.find((c) => c.id === editCategoryId);
      const catCode = catObj?.code || 'LMB';
      const lotPadded = schoolLot < 10 ? `0${schoolLot}` : `${schoolLot}`;
      const newRegNo = `FTBI-26-${catCode}-${editGender}${lotPadded}`;

      const updated: Participant = {
        ...editingParticipant,
        fullName: editFullName.trim(),
        gender: editGender,
        grade: editGrade,
        schoolId: editSchoolId,
        categoryId: editCategoryId,
        lotNo: schoolLot,
        registrationNo: newRegNo,
        mentorName: editMentorName.trim() || editingParticipant.mentorName,
        mentorPhone: editMentorPhone.trim() || editingParticipant.mentorPhone,
      };

      onUpdateParticipant(updated);
      setEditingParticipant(null);
      showToast(`Data peserta "${updated.fullName}" berhasil diperbarui.`);
    }
  };

  // Delete Participant
  const handleDelete = (p: Participant) => {
    setParticipantToDelete(p);
  };

  const confirmSingleDelete = () => {
    if (participantToDelete && onDeleteParticipant) {
      const name = participantToDelete.fullName;
      onDeleteParticipant(participantToDelete.id);
      setParticipantToDelete(null);
      showToast(`Peserta "${name}" berhasil dihapus.`);
    }
  };

  // Delete All Participants
  const handleDeleteAll = () => {
    if (participants.length === 0) return;
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = () => {
    if (onDeleteAllParticipants) {
      onDeleteAllParticipants();
      setShowDeleteAllModal(false);
      showToast('Seluruh data peserta berhasil dihapus.');
    }
  };

  // Unduh Data Peserta Keseluruhan ke CSV / Excel format
  const handleExportAllParticipants = () => {
    if (participants.length === 0) {
      alert('Belum ada data peserta yang terdaftar.');
      return;
    }

    const headers = [
      'No',
      'No Registrasi',
      'Asal Sekolah',
      'Cabang Lomba',
      'Jenis Kelamin',
      'Nama Siswa',
      'Kelas',
      'Status Kejuaraan',
      'NPSN',
      'Guru Pendamping',
      'Kontak Pendamping',
      'Status Penilaian'
    ];

    const sortedParticipants = [...participants].sort((a, b) => {
      const schA = schools.find((s) => s.id === a.schoolId)?.name || '';
      const schB = schools.find((s) => s.id === b.schoolId)?.name || '';
      const schoolCompare = schA.localeCompare(schB, 'id', { numeric: true });
      if (schoolCompare !== 0) return schoolCompare;

      const catA = categories.find((c) => c.id === a.categoryId)?.name || '';
      const catB = categories.find((c) => c.id === b.categoryId)?.name || '';
      const catCompare = catA.localeCompare(catB, 'id');
      if (catCompare !== 0) return catCompare;

      if (a.gender !== b.gender) {
        return a.gender === 'L' ? -1 : 1;
      }

      return a.fullName.localeCompare(b.fullName, 'id');
    });

    const rows = sortedParticipants.map((p, idx) => {
      const sch = schools.find((s) => s.id === p.schoolId);
      const cat = categories.find((c) => c.id === p.categoryId);
      const isEligibleForChampionship = p.grade === 'Kelas 5' || p.grade === 'Kelas 6';
      const championshipStatus = isEligibleForChampionship 
        ? 'Kejuaraan' 
        : 'Finalis-Hanya Dinilai';

      return [
        idx + 1,
        `"${p.registrationNo}"`,
        `"${sch?.name || '-'}"`,
        `"${cat?.name || '-'}"`,
        p.gender === 'L' ? 'Putra (L)' : 'Putri (P)',
        `"${p.fullName.replace(/"/g, '""')}"`,
        p.grade,
        `"${championshipStatus}"`,
        `"${sch?.npsn || '-'}"`,
        `"${p.mentorName || '-'}"`,
        `"${p.mentorPhone || '-'}"`,
        `"${p.status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekapitulasi_Seluruh_Peserta_FTBI_SD_Pekutatan_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isJuniorClass = grade === 'Kelas 3' || grade === 'Kelas 4';
  const isEditJuniorClass = editGrade === 'Kelas 3' || editGrade === 'Kelas 4';

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-center justify-between gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Container Utama: Formulir di Atas, Daftar Peserta Terdaftar di Bawah */}
      <div className="space-y-6">
        
        {/* 1. FORM INPUT PESERTA (DI ATAS) */}
        <div className="w-full">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs relative">
            
            {/* Top Form Header with Logo, Exact Title & Small QR Code Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 border-2 border-emerald-500/30 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-950/20 shrink-0">
                  <Award className="w-7 h-7 drop-shadow-xs" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Formulir Pendaftaran FTBI Kecamatan Pekutatan
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Festival Tunas Bahasa Ibu Jenjang SD 2026
                  </p>
                </div>
              </div>

              {onOpenShareModal && (
                <button
                  type="button"
                  id="btn-generate-qr-pendaftaran"
                  onClick={onOpenShareModal}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-95 shrink-0"
                  title="Generate Kode QR & Tautan Pendaftaran untuk Sekolah"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Generate Kode QR</span>
                </button>
              )}
            </div>

            {/* Schedule Info Box */}
            {registrationSchedule && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">Jadwal Pendaftaran: </span>
                    <span className="text-slate-600">
                      {new Date(registrationSchedule.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} s/d {new Date(registrationSchedule.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {onOpenShareModal && (
                  <button
                    type="button"
                    onClick={onOpenShareModal}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto cursor-pointer"
                  >
                    Atur Waktu & Token
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. ASAL SEKOLAH */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Asal Sekolah:
                  </label>
                  <div className="relative">
                    <select
                      id="dropdown-sekolah"
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer appearance-none pr-9"
                    >
                      {schools.length === 0 ? (
                        <option value="">-- Belum ada data sekolah (Silakan input di menu Profil) --</option>
                      ) : (
                        schools.map((sch, idx) => (
                          <option key={sch.id} value={sch.id}>
                            {idx + 1}. {sch.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. CABANG LOMBA */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Cabang Lomba:
                  </label>
                  <div className="relative">
                    <select
                      id="dropdown-cabang-lomba"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer appearance-none pr-9"
                    >
                      {categories.map((cat, idx) => (
                        <option key={cat.id} value={cat.id}>
                          {idx + 1}. {cat.name} ({cat.mode})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 3. NAMA LENGKAP SISWA */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Nama Lengkap Siswa:
                  </label>
                  <input
                    id="input-nama-siswa"
                    type="text"
                    required
                    placeholder="Contoh: I Kadek Wahyu Dinata"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: 4. JENIS KELAMIN & 5. KELAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 4. Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    4. Jenis Kelamin:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        gender === 'L'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>👦 Laki-laki</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        gender === 'P'
                          ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>👧 Perempuan</span>
                    </button>
                  </div>
                </div>

                {/* 5. Jenjang Kelas (Kelas 3, 4, 5, 6) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    5. Kelas:
                  </label>
                  <div className="relative">
                    <select
                      id="dropdown-kelas"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden appearance-none pr-8 cursor-pointer"
                    >
                      <option value="Kelas 5">Kelas 5 SD (Kejuaraan)</option>
                      <option value="Kelas 6">Kelas 6 SD (Kejuaraan)</option>
                      <option value="Kelas 4">Kelas 4 SD (Finalis-Hanya Dinilai)</option>
                      <option value="Kelas 3">Kelas 3 SD (Finalis-Hanya Dinilai)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Keterangan Ketentuan Kelas 3 & 4 */}
              {isJuniorClass && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Catatan {grade}:</strong> Siswa dinilai oleh dewan juri sebagai <strong>Finalis-Hanya Dinilai</strong> (tidak memperebutkan peringkat kejuaraan dan tidak memicu disparitas nilai).
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Nomor undi peserta otomatis menggunakan nomor undi manual sekolah dari menu Profil Satuan Pendidikan.</span>
              </div>

              {/* Tombol Simpan */}
              <button
                type="submit"
                id="btn-submit-pendaftaran"
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Simpan Peserta</span>
              </button>

            </form>
          </div>
        </div>

        {/* 2. DAFTAR PESERTA KESELURUHAN (DI BAWAH) */}
        <div className="w-full space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-800" />
                  <span>Daftar Peserta Terdaftar ({filteredParticipants.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total {participants.length} peserta terdaftar dari {schools.length} Satuan Pendidikan
                </p>
              </div>

              {/* Action Buttons: Generate QR, Hapus Semua & Unduh Data */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Tombol Generate QR Code untuk Sekolah */}
                {onOpenShareModal && (
                  <button
                    type="button"
                    id="btn-open-qr-from-list"
                    onClick={onOpenShareModal}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                    title="Generate QR Code & Tautan Formulir untuk Sekolah"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Generate QR Sekolah</span>
                  </button>
                )}

                {/* Tombol Hapus Semua Peserta */}
                <button
                  type="button"
                  id="btn-delete-all-participants"
                  onClick={handleDeleteAll}
                  disabled={participants.length === 0}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs rounded-xl border border-rose-200 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                  title="Hapus seluruh data peserta terdaftar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Peserta</span>
                </button>

                {/* Tombol Unduh Data Peserta Keseluruhan */}
                <button
                  type="button"
                  id="btn-download-all-participants"
                  onClick={handleExportAllParticipants}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
                  title="Unduh rekap semua peserta terdaftar format CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Data Peserta (CSV)</span>
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
              
              {/* Search */}
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama / reg / sekolah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs w-full focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Filter Sekolah */}
              <div className="sm:col-span-4">
                <select
                  value={filterSchoolId}
                  onChange={(e) => setFilterSchoolId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="all">Semua Sekolah ({schools.length})</option>
                  {schools.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {idx + 1}. {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Cabang */}
              <div className="sm:col-span-4">
                <select
                  value={filterCategoryId}
                  onChange={(e) => setFilterCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="all">Semua Cabang Lomba</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.replace('Lomba ', '')}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Table Peserta dengan Akses Edit */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Kelas & Ketentuan</th>
                      <th className="py-2.5 px-3">Asal Sekolah</th>
                      <th className="py-2.5 px-3">Cabang Lomba</th>
                      <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Belum ada data peserta yang cocok dengan pencarian / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p, index) => {
                        const pSchool = schools.find((s) => s.id === p.schoolId);
                        const pCat = categories.find((c) => c.id === p.categoryId);
                        const isJunior = p.grade === 'Kelas 3' || p.grade === 'Kelas 4';

                        return (
                          <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                              {index + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{p.fullName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {p.registrationNo} • {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800">{p.grade}</span>
                                {isJunior ? (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                    Finalis-Hanya Dinilai
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    Kejuaraan
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{pSchool?.name}</div>
                              <div className="text-[10px] font-mono font-bold text-amber-700">
                                Undian Sekolah: #{pSchool?.lotteryNumber ?? p.lotNo}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[11px] font-medium text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                {pCat?.name.replace('Lomba ', '')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Tombol Edit Peserta */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(p)}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                                  title="Edit Data Peserta"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {/* Tombol Hapus Peserta */}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(p)}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                                  title="Hapus Peserta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL EDIT DATA PESERTA (JIKA ADA PESERTA DIPILIH EDIT) */}
      {/* ======================================================== */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            
            {/* Header Modal */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Edit Data Peserta</h3>
                  <p className="text-xs text-emerald-100">
                    No. Registrasi: {editingParticipant.registrationNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingParticipant(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Edit Modal */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Asal Sekolah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Asal Sekolah:
                </label>
                <div className="relative">
                  <select
                    value={editSchoolId}
                    onChange={(e) => setEditSchoolId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden appearance-none pr-8 cursor-pointer"
                  >
                    {schools.map((sch, idx) => (
                      <option key={sch.id} value={sch.id}>
                        {idx + 1}. {sch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Cabang Lomba */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cabang Lomba:
                </label>
                <div className="relative">
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden appearance-none pr-8 cursor-pointer"
                  >
                    {categories.map((cat, idx) => (
                      <option key={cat.id} value={cat.id}>
                        {idx + 1}. {cat.name} ({cat.mode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Nama Siswa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa:
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Gender & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenis Kelamin:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditGender('L')}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        editGender === 'L'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>👦 Laki-laki</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGender('P')}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        editGender === 'P'
                          ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>👧 Perempuan</span>
                    </button>
                  </div>
                </div>

                {/* Kelas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kelas:
                  </label>
                  <div className="relative">
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden appearance-none pr-8 cursor-pointer"
                    >
                      <option value="Kelas 5">Kelas 5 SD (Kejuaraan)</option>
                      <option value="Kelas 6">Kelas 6 SD (Kejuaraan)</option>
                      <option value="Kelas 4">Kelas 4 SD (Finalis-Hanya Dinilai)</option>
                      <option value="Kelas 3">Kelas 3 SD (Finalis-Hanya Dinilai)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Info Ketentuan Kelas */}
              {isEditJuniorClass && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Ketentuan {editGrade}:</strong> Status akan dihitung sebagai <strong>Finalis-Hanya Dinilai</strong>.
                  </p>
                </div>
              )}

              {/* Guru Pendamping & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Guru Pembina / Pendamping:
                  </label>
                  <input
                    type="text"
                    value={editMentorName}
                    onChange={(e) => setEditMentorName(e.target.value)}
                    placeholder="Nama Guru Pembina"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. HP / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={editMentorPhone}
                    onChange={(e) => setEditMentorPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tombol Aksi Modal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS SATU PESERTA */}
      {/* ======================================================== */}
      {participantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Hapus Peserta?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus peserta beserta riwayat nilainya.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5">
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Nama:</span> <strong className="text-slate-900 font-bold">{participantToDelete.fullName}</strong></div>
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">No Reg:</span> <span className="font-mono text-slate-700 font-bold">{participantToDelete.registrationNo}</span></div>
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Sekolah:</span> <span className="text-slate-700 font-semibold">{schools.find(s => s.id === participantToDelete.schoolId)?.name}</span></div>
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Cabang:</span> <span className="text-slate-700 font-semibold">{categories.find(c => c.id === participantToDelete.categoryId)?.name}</span></div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setParticipantToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSingleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS SEMUA PESERTA */}
      {/* ======================================================== */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-900">Hapus Semua Peserta?</h3>
                <p className="text-xs text-rose-600 font-medium">Peringatan: Seluruh ({participants.length}) data peserta dan penilaian akan dihapus permanen.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              Apakah Anda yakin ingin mengosongkan seluruh data peserta yang terdaftar pada kompetisi FTBI 2026?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
