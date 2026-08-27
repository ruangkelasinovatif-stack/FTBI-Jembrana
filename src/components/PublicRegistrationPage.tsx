import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  ChevronDown, 
  UserPlus, 
  ArrowLeft, 
  Send, 
  School as SchoolIcon, 
  FileText, 
  User, 
  Sparkles,
  Ticket,
  Printer,
  Clock,
  AlertTriangle,
  RotateCcw,
  Info,
  Calendar
} from 'lucide-react';
import { School, CompetitionCategory, Participant, RegistrationSchedule } from '../types';

interface PublicRegistrationPageProps {
  schools: School[];
  categories: CompetitionCategory[];
  registrationSchedule?: RegistrationSchedule;
  onAddParticipant: (newParticipant: Omit<Participant, 'id' | 'registrationNo' | 'lotNo' | 'registeredAt' | 'status'>) => void;
  onBackToMain?: () => void;
  initialCategoryId?: string;
}

export const PublicRegistrationPage: React.FC<PublicRegistrationPageProps> = ({
  schools,
  categories,
  registrationSchedule,
  onAddParticipant,
  onBackToMain,
  initialCategoryId,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId || categories[0]?.id || '');
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
      setSelectedCategoryId(initialCategoryId || categories[0].id);
    }
  }, [categories, selectedCategoryId, initialCategoryId]);

  // Submission State
  const [submittedData, setSubmittedData] = useState<{
    participant: Omit<Participant, 'id' | 'registrationNo' | 'lotNo' | 'registeredAt' | 'status'>;
    registrationNo: string;
    lotNo: number;
    registeredAt: string;
  } | null>(null);

  // Date & Token Validation
  const now = new Date();
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  const urlStart = urlParams.get('start');
  const urlEnd = urlParams.get('end');

  // Effective start and end dates from URL (encoded in QR code) or props
  const effectiveStartDateStr = urlStart || registrationSchedule?.startDate;
  const effectiveEndDateStr = urlEnd || registrationSchedule?.endDate;

  const startDate = effectiveStartDateStr ? new Date(effectiveStartDateStr) : null;
  const endDate = effectiveEndDateStr ? new Date(effectiveEndDateStr) : null;

  const isEnabled = registrationSchedule ? registrationSchedule.enabled : true;
  const isBeforeStart = startDate ? !isNaN(startDate.getTime()) && now < startDate : false;
  const isAfterEnd = endDate ? !isNaN(endDate.getTime()) && now > endDate : false;
  
  // Scanned QR codes contain valid tokens and date range parameters
  const isRegistrationClosed = !isEnabled || isBeforeStart || isAfterEnd;

  const isJuniorClass = grade === 'Kelas 3' || grade === 'Kelas 4';

  const formatScheduleDate = (dateObj: Date | null) => {
    if (!dateObj || isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistrationClosed) {
      alert('Pendaftaran tidak dapat diproses karena waktu pendaftaran telah berakhir atau barcode/link sudah kadaluarsa.');
      return;
    }

    if (!fullName.trim() || !selectedSchoolId || !selectedCategoryId) {
      alert('Mohon lengkapi Nama Siswa, Asal Sekolah, dan Cabang Lomba.');
      return;
    }

    const schoolObj = schools.find((s) => s.id === selectedSchoolId);
    const catObj = categories.find((c) => c.id === selectedCategoryId);
    const catCode = catObj?.code || 'LMB';
    
    // Nomor undian murni mengambil data dari nomor undi sekolah di profil sekolah (diundi manual per sekolah)
    const schoolIndex = schools.findIndex((s) => s.id === selectedSchoolId) + 1;
    const schoolLot = schoolObj?.lotteryNumber ?? schoolIndex;
    const lotPadded = schoolLot < 10 ? `0${schoolLot}` : `${schoolLot}`;
    const regNo = `FTBI-26-${catCode}-${gender}${lotPadded}`;
    const autoNisn = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const defaultMentor = `Guru Pembina ${schoolObj?.name || 'Sekolah'}`;
    const defaultPhone = schoolObj?.contactPhone || '081234567890';

    const newParticipantData = {
      fullName: fullName.trim(),
      nisn: autoNisn,
      gender,
      grade,
      schoolId: selectedSchoolId,
      categoryId: selectedCategoryId,
      mentorName: defaultMentor,
      mentorPhone: defaultPhone,
    };

    onAddParticipant(newParticipantData);

    setSubmittedData({
      participant: newParticipantData,
      registrationNo: regNo,
      schoolLotNo: schoolLot,
      registeredAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const handleResetForAnotherStudent = () => {
    setFullName('');
    setSubmittedData(null);
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-[#f3f6f4] py-6 sm:py-10 px-3 sm:px-6 font-sans selection:bg-emerald-600 selection:text-white flex flex-col items-center">
      
      {/* Outer Shell Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        
        {/* ======================================================== */}
        {/* TOP HEADER: Logo & Formulir Pendaftaran FTBI             */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-[#133E2B] via-[#1a533a] to-[#154632] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle Background Art */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full text-white fill-current">
              <path d="M45,-76.4C58.3,-69.3,69,-57.2,77.1,-43.3C85.2,-29.4,90.6,-13.7,89.5,1.7C88.4,17.1,80.7,32.2,70.9,44.7C61,57.2,49,67.1,35.4,73.4C21.7,79.7,6.4,82.4,-8.6,81C-23.7,79.6,-38.5,74.1,-50.7,65.3C-62.9,56.5,-72.5,44.4,-78.9,30.5C-85.3,16.7,-88.4,1.1,-84.9,-13.1C-81.4,-27.3,-71.2,-40.1,-59.2,-47.9C-47.2,-55.6,-33.4,-58.4,-20.5,-65.8C-7.6,-73.2,4.4,-85.2,18.4,-87.3C32.4,-89.4,48.4,-81.6,45,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 border-2 border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-lg shadow-emerald-950/30">
              <Award className="w-10 h-10 drop-shadow" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                Formulir Pendaftaran FTBI Kecamatan Pekutatan
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
                Festival Tunas Bahasa Ibu Jenjang SD Tahun 2026
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/15 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Registrasi Resmi Satuan Pendidikan SD</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BODY                                                     */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8">
          
          {/* CASE 1: PENDAFTARAN DITUTUP / KADALUARSA / TOKEN MISMATCH */}
          {isRegistrationClosed && !submittedData ? (
            <div className="py-6 px-4 sm:px-8 text-center space-y-6 animate-in fade-in zoom-in-95">
              
              {/* Icon & Status */}
              {isBeforeStart ? (
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mx-auto shadow-sm">
                  <Clock className="w-9 h-9 text-blue-700" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="w-9 h-9 text-rose-700" />
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isBeforeStart
                    ? 'Pendaftaran Siswa Belum Dibuka'
                    : 'Pendaftaran Siswa Telah Ditutup'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {isBeforeStart
                    ? `Pendaftaran resmi Festival Tunas Bahasa Ibu (FTBI) akan dibuka pada jadwal yang telah ditetapkan.`
                    : `Batas waktu pengisian pendaftaran peserta Festival Tunas Bahasa Ibu (FTBI) Kecamatan Pekutatan telah selesai.`}
                </p>
              </div>

              {/* Details Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status Sistem:</span>
                  <span className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                    isBeforeStart ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {isBeforeStart ? 'Terjadwal' : 'Ditutup'}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Jadwal Dibuka:</div>
                    <div className="font-bold text-slate-900">{formatScheduleDate(startDate)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Batas Waktu Berakhir:</div>
                    <div className="font-bold text-slate-900">{formatScheduleDate(endDate)}</div>
                  </div>
                </div>
              </div>

              {/* Notice & Instructions */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 max-w-md mx-auto flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-amber-900">Perhatian Sekolah / Guru Pembina:</div>
                  <div className="text-slate-600 mt-0.5">
                    {isBeforeStart
                      ? 'Harap tunggu hingga waktu pembukaan tiba atau hubungi Panitia jika memerlukan informasi lebih lanjut.'
                      : 'Bila sekolah Anda mengalami kendala dan memerlukan perpanjangan waktu pendaftaran, silakan hubungi Panitia Pelaksana / Admin FTBI Kecamatan Pekutatan.'}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Halaman</span>
                </button>

                {onBackToMain && (
                  <button
                    type="button"
                    onClick={onBackToMain}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Sistem FTBI</span>
                  </button>
                )}
              </div>

            </div>
          ) : submittedData ? (
            /* ================= BUKTI PENDAFTARAN BERHASIL ================= */
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Pendaftaran Berhasil Terkirim!
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Data peserta telah tersimpan ke dalam database panitia FTBI SD Kecamatan Pekutatan 2026.
                </p>
              </div>

              {/* Bukti Tiket / Resi Pendaftaran */}
              <div className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-emerald-800/30 relative space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-black text-slate-900 uppercase">Tanda Bukti Pendaftaran</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{submittedData.registeredAt}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Nomor Registrasi:</div>
                    <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">{submittedData.registrationNo}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Nomor Undian Sekolah:</div>
                    <div className="font-mono font-black text-amber-700 text-sm mt-0.5">
                      No. {submittedData.schoolLotNo}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap Siswa:</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">{submittedData.participant.fullName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Asal Sekolah:</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{schools.find(s => s.id === submittedData.participant.schoolId)?.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Cabang Lomba:</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{categories.find(c => c.id === submittedData.participant.categoryId)?.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Kategori & Kelas:</div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {submittedData.participant.gender === 'L' ? 'Putra' : 'Putri'} • {submittedData.participant.grade}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Guru Pembina:</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{submittedData.participant.mentorName}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[10.5px] text-slate-500 italic flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Nomor undian diundi manual per sekolah dan berlaku untuk seluruh peserta perwakilan sekolah.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  id="btn-print-public-ticket"
                  onClick={() => window.print()}
                  className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak Bukti Pendaftaran</span>
                </button>

                <button
                  type="button"
                  id="btn-register-another-student"
                  onClick={handleResetForAnotherStudent}
                  className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Siswa Lainnya</span>
                </button>

                {onBackToMain && (
                  <button
                    type="button"
                    onClick={onBackToMain}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* ================= FORM PENDAFTARAN INPUT (ACTIVE) ================= */
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              
              {/* Registration Period Alert info banner */}
              {endDate && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Batas waktu pendaftaran: <strong className="text-emerald-900">{formatScheduleDate(endDate)}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md shrink-0">
                    Aktif
                  </span>
                </div>
              )}

              {/* 1. ASAL SEKOLAH */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <SchoolIcon className="w-3.5 h-3.5 text-emerald-800" />
                  <span>1. Asal Sekolah:</span>
                </label>
                <div className="relative">
                  <select
                    required
                    id="public-dropdown-sekolah"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer appearance-none pr-9"
                  >
                    {schools.length === 0 ? (
                      <option value="">-- Belum ada data sekolah (Silakan hubungi Admin) --</option>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-800" />
                  <span>2. Cabang Lomba:</span>
                </label>
                <div className="relative">
                  <select
                    required
                    id="public-dropdown-cabang-lomba"
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
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span>3. Nama Lengkap:</span>
                </label>
                <input
                  type="text"
                  required
                  id="public-input-nama-siswa"
                  placeholder="Contoh: I Kadek Wahyu Dinata"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* 4. JENIS KELAMIN & 5. KELAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* 5. Jenjang Kelas (Dropdown Kelas 3 - 6) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    5. Kelas:
                  </label>
                  <div className="relative">
                    <select
                      id="public-dropdown-kelas"
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
                    <strong>Catatan {grade}:</strong> Siswa dinilai oleh dewan juri sebagai <strong>Finalis-Hanya Dinilai</strong> (tidak memperebutkan peringkat kejuaraan).
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  id="btn-submit-public-registration"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Formulir Pendaftaran</span>
                </button>

                {onBackToMain && (
                  <button
                    type="button"
                    onClick={onBackToMain}
                    className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Sistem Login FTBI</span>
                  </button>
                )}
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3 text-center text-xs text-slate-500">
          Sistem FTBI Jenjang SD - Developed by I Gede Anom Apriliawan
        </div>

      </div>

    </div>
  );
};
