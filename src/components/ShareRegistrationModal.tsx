import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Printer, 
  X, 
  Award,
  Sparkles,
  Calendar,
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  CalendarCheck
} from 'lucide-react';
import { CompetitionCategory, RegistrationSchedule } from '../types';

interface ShareRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CompetitionCategory[];
  registrationSchedule: RegistrationSchedule;
  onUpdateRegistrationSchedule: (schedule: RegistrationSchedule) => void;
  onOpenPublicForm?: () => void;
}

export const ShareRegistrationModal: React.FC<ShareRegistrationModalProps> = ({
  isOpen,
  onClose,
  categories,
  registrationSchedule,
  onUpdateRegistrationSchedule,
  onOpenPublicForm,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [tempStartDate, setTempStartDate] = useState<string>(registrationSchedule.startDate);
  const [tempEndDate, setTempEndDate] = useState<string>(registrationSchedule.endDate);
  const [tempEnabled, setTempEnabled] = useState<boolean>(registrationSchedule.enabled);
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Sync temp dates when props change
  useEffect(() => {
    setTempStartDate(registrationSchedule.startDate);
    setTempEndDate(registrationSchedule.endDate);
    setTempEnabled(registrationSchedule.enabled);
  }, [registrationSchedule, isOpen]);

  // Generate shareable link based on current location, token, start/end dates, and optional category
  const getShareableUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('form', 'pendaftaran');
      if (registrationSchedule.registrationToken) {
        url.searchParams.set('token', registrationSchedule.registrationToken);
      }
      if (registrationSchedule.startDate) {
        url.searchParams.set('start', registrationSchedule.startDate);
      }
      if (registrationSchedule.endDate) {
        url.searchParams.set('end', registrationSchedule.endDate);
      }
      if (selectedCategoryFilter !== 'all') {
        url.searchParams.set('cabang', selectedCategoryFilter);
      } else {
        url.searchParams.delete('cabang');
      }
      return url.toString();
    } catch {
      return `${window.location.origin}${window.location.pathname}?form=pendaftaran&token=${registrationSchedule.registrationToken}&start=${encodeURIComponent(registrationSchedule.startDate)}&end=${encodeURIComponent(registrationSchedule.endDate)}`;
    }
  };

  const shareableUrl = getShareableUrl();

  // Generate QR Code whenever URL changes
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(shareableUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#133e2b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
  }, [shareableUrl, isOpen]);

  // Check current status
  const now = new Date();
  const start = new Date(registrationSchedule.startDate);
  const end = new Date(registrationSchedule.endDate);
  const isBefore = now < start;
  const isAfter = now > end;
  const isActive = registrationSchedule.enabled && !isBefore && !isAfter;

  const formatDateForDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Save Schedule changes
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempStartDate || !tempEndDate) {
      alert('Mohon isi tanggal dan jam mulai serta tanggal dan jam berakhir pendaftaran.');
      return;
    }

    if (new Date(tempStartDate) >= new Date(tempEndDate)) {
      alert('Waktu mulai harus lebih awal dari waktu berakhir pendaftaran.');
      return;
    }

    const updated: RegistrationSchedule = {
      ...registrationSchedule,
      startDate: tempStartDate,
      endDate: tempEndDate,
      enabled: tempEnabled,
    };

    onUpdateRegistrationSchedule(updated);
    setScheduleSuccessMessage(
      `Pengaturan rentang waktu pendaftaran berhasil disimpan! Berlaku: ${formatDateForDisplay(tempStartDate)} s/d ${formatDateForDisplay(tempEndDate)}. Barcode & Kode QR telah otomatis diperbarui.`
    );
    setTimeout(() => setScheduleSuccessMessage(null), 5000);
  };

  // Regenerate Token & Barcode
  const handleRegenerateToken = () => {
    const newToken = `reg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const updated: RegistrationSchedule = {
      ...registrationSchedule,
      startDate: tempStartDate || registrationSchedule.startDate,
      endDate: tempEndDate || registrationSchedule.endDate,
      registrationToken: newToken,
      tokenCreatedAt: new Date().toISOString(),
    };
    onUpdateRegistrationSchedule(updated);
    setConfirmRegenerate(false);
    setScheduleSuccessMessage(
      'Kode QR & Barcode pendaftaran berhasil di-generate ulang! Kode QR baru telah aktif dan langsung dapat dipindai oleh sekolah.'
    );
    setTimeout(() => setScheduleSuccessMessage(null), 5000);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareableUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Download QR Code image
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = qrDataUrl;
    downloadLink.download = `QR_Code_Formulir_Pendaftaran_FTBI_Pekutatan_2026.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Print Flyer with QR Code & Schedule info
  const handlePrintFlyer = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cetak QR Formulir Pendaftaran FTBI Pekutatan 2026</title>
              <style>
                @page { size: A4 portrait; margin: 15mm; }
                body { 
                  font-family: system-ui, -apple-system, sans-serif; 
                  color: #0f172a; 
                  margin: 0; 
                  padding: 20px; 
                  text-align: center; 
                }
                .flyer-card { 
                  border: 2px solid #133e2b; 
                  border-radius: 20px; 
                  padding: 30px; 
                  max-width: 600px; 
                  margin: 0 auto; 
                }
                .header-badge { 
                  background: #133e2b; 
                  color: #fff; 
                  padding: 6px 16px; 
                  border-radius: 50px; 
                  font-size: 12px; 
                  font-weight: 800; 
                  display: inline-block; 
                  margin-bottom: 12px; 
                  text-transform: uppercase; 
                  letter-spacing: 1px;
                }
                h1 { font-size: 22px; margin: 6px 0; color: #133e2b; }
                h2 { font-size: 14px; font-weight: 500; color: #475569; margin: 0 0 16px 0; }
                .schedule-badge {
                  background: #f0fdf4;
                  border: 1px solid #86efac;
                  color: #166534;
                  font-size: 13px;
                  font-weight: 700;
                  padding: 8px 16px;
                  border-radius: 12px;
                  display: inline-block;
                  margin-bottom: 16px;
                }
                .qr-wrapper { 
                  background: #f8fafc; 
                  padding: 16px; 
                  border-radius: 16px; 
                  display: inline-block; 
                  border: 1px solid #cbd5e1; 
                  margin: 10px 0; 
                }
                .qr-image { width: 260px; height: 260px; display: block; }
                .instruction { 
                  font-size: 15px; 
                  font-weight: 700; 
                  color: #0f172a; 
                  margin: 15px 0 5px; 
                }
                .sub-instruction { 
                  font-size: 12px; 
                  color: #64748b; 
                  max-width: 450px; 
                  margin: 0 auto 15px; 
                }
                .url-box { 
                  font-family: monospace; 
                  font-size: 11px; 
                  background: #f1f5f9; 
                  padding: 8px 14px; 
                  border-radius: 8px; 
                  word-break: break-all; 
                  color: #334155; 
                  border: 1px dashed #94a3b8; 
                }
                .footer-note { 
                  font-size: 11px; 
                  color: #94a3b8; 
                  margin-top: 25px; 
                  border-top: 1px solid #e2e8f0; 
                  padding-top: 10px; 
                }
              </style>
            </head>
            <body>
              <div class="flyer-card">
                <div class="header-badge">Festival Tunas Bahasa Ibu 2026</div>
                <h1>Formulir Pendaftaran FTBI Kecamatan Pekutatan</h1>
                <h2>Jenjang Sekolah Dasar (SD) se-Kecamatan Pekutatan</h2>

                <div class="schedule-badge">
                  📅 Periode Pendaftaran: ${formatDateForDisplay(registrationSchedule.startDate)} s/d ${formatDateForDisplay(registrationSchedule.endDate)}
                </div>
                
                <div class="qr-wrapper">
                  <img class="qr-image" src="${qrDataUrl}" alt="QR Code Pendaftaran" />
                </div>

                <div class="instruction">Pindai / Scan QR Code untuk Mendaftar</div>
                <div class="sub-instruction">
                  Buka kamera ponsel Anda atau aplikasi pemindai QR untuk langsung membuka formulir pendaftaran peserta FTBI 2026 secara online sesuai rentang waktu yang ditentukan.
                </div>

                <div class="url-box">${shareableUrl}</div>

                <div class="footer-note">
                  Panitia Pelaksana FTBI SD Kecamatan Pekutatan 2026
                </div>
              </div>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch {
      // Fallback
    }

    window.print();
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-generate-qr-share"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#133E2B] via-[#1a533a] to-[#154632] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-300 border border-white/20 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-tight">
                Pengaturan Waktu & Barcode Pendaftaran
              </h2>
              <p className="text-[11px] text-emerald-100/80">
                Atur rentang tanggal/jam & generate link barcode peserta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          <div ref={printRef} className="hidden"></div>

          {/* Success Message Banner */}
          {scheduleSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-center gap-2.5 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold">{scheduleSuccessMessage}</span>
            </div>
          )}

          {/* 1. KOTAK PENGATURAN RENTANG WAKTU & TANGGAL */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Rentang Tanggal & Waktu Pendaftaran Siswa
                </h3>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black">
                {isActive ? (
                  <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    Pendaftaran Aktif (Dibuka)
                  </span>
                ) : isBefore ? (
                  <span className="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-300">
                    <Clock className="w-3 h-3 text-blue-700" />
                    Belum Dibuka (Terjadwal)
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-300">
                    <Lock className="w-3 h-3 text-rose-700" />
                    Telah Ditutup (Kadaluarsa)
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Waktu Mulai Pendaftaran:</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-700" />
                    <span>Waktu Berakhir Pendaftaran:</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                <div className="text-[11px] text-slate-500">
                  Formulir & Barcode hanya bisa diisi oleh sekolah dalam rentang di atas.
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Jadwal</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 2. MAIN VISUAL: QR CODE & GENERATE ULANG TOKEN */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
            
            {/* QR Card with Balinese / Emerald styling */}
            <div className="relative p-4 bg-white rounded-2xl shadow-md border-2 border-emerald-800/20 text-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Formulir Pendaftaran FTBI Pekutatan"
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs animate-pulse">
                  Menyiapkan QR Code...
                </div>
              )}

              <div className="mt-2 text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
                Scan untuk Mendaftar
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Token Sesi: {registrationSchedule.registrationToken.substring(0, 15)}...
              </div>
            </div>

            {/* Action Buttons for QR */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              <button
                type="button"
                id="btn-download-qr-code"
                onClick={handleDownloadQr}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar QR</span>
              </button>

              <button
                type="button"
                id="btn-print-qr-flyer"
                onClick={handlePrintFlyer}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Cetak Lembar QR</span>
              </button>

              {/* GENERATE ULANG BUTTON */}
              {!confirmRegenerate ? (
                <button
                  type="button"
                  id="btn-regenerate-qr-token"
                  onClick={() => setConfirmRegenerate(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Generate Ulang Barcode & Token Baru untuk mematikan barcode/link lama"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Generate Ulang Barcode & Link</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-400 rounded-xl animate-in fade-in">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Link/Barcode lama akan mati. Yakin?
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateToken}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Ya, Generate Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRegenerate(false)}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 3. SHAREABLE LINK BOX */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tautan / Link Formulir Pendaftaran:
            </label>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-mono text-slate-700 focus:outline-none select-all"
                />
              </div>

              <button
                type="button"
                id="btn-copy-shareable-link"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Bagikan tautan ini ke grup WhatsApp Kepala Sekolah dan Guru Pembina di seluruh Kecamatan Pekutatan. Link hanya aktif sesuai rentang waktu yang disetel.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
          >
            Tutup
          </button>

          {onOpenPublicForm && (
            <button
              type="button"
              id="btn-preview-public-form"
              onClick={() => {
                onClose();
                onOpenPublicForm();
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Formulir Pendaftaran</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
