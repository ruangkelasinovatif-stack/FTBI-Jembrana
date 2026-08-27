import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Users, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Search, 
  Key, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  X, 
  ShieldAlert,
  Building2,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { School, CompetitionCategory, Judge } from '../types';

interface JudgeRegistrationPortalProps {
  schools: School[];
  categories: CompetitionCategory[];
  judges: Judge[];
  onAddJudge: (newJudge: Judge) => void;
  onUpdateJudge: (updatedJudge: Judge) => void;
  onDeleteJudge: (judgeId: string) => void;
  onDeleteAllJudges?: () => void;
  onSaveJudgesBatch?: (judgesToSave: Judge[], judgeIdsToDelete?: string[]) => Promise<void> | void;
  onUpdateAllJudges?: (updatedJudges: Judge[]) => Promise<void> | void;
}

export const JudgeRegistrationPortal: React.FC<JudgeRegistrationPortalProps> = ({
  schools,
  categories,
  judges,
  onAddJudge,
  onUpdateJudge,
  onDeleteJudge,
  onDeleteAllJudges,
  onSaveJudgesBatch,
  onUpdateAllJudges,
}) => {
  // 1. STATE PEMILIHAN CABANG LOMBA
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');

  // 2. STATE INPUT 3 DEWAN JURI (Juri 1, Juri 2, Juri 3)
  const [juri1Name, setJuri1Name] = useState<string>('');
  const [juri1SchoolId, setJuri1SchoolId] = useState<string>('juri-tamu');

  const [juri2Name, setJuri2Name] = useState<string>('');
  const [juri2SchoolId, setJuri2SchoolId] = useState<string>('juri-tamu');

  const [juri3Name, setJuri3Name] = useState<string>('');
  const [juri3SchoolId, setJuri3SchoolId] = useState<string>('juri-tamu');

  // Filter & Search State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Deletion Confirmation Modal States
  const [judgeToDelete, setJudgeToDelete] = useState<Judge | null>(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState<boolean>(false);

  // Generate All Confirmation Modal State
  const [showConfirmGenerateAll, setShowConfirmGenerateAll] = useState<boolean>(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);

  // Modal State for Individual & All Login Cards
  const [activeCardJudge, setActiveCardJudge] = useState<Judge | null>(null);
  const [showAllCardsModal, setShowAllCardsModal] = useState<boolean>(false);
  const [copiedJudgeId, setCopiedJudgeId] = useState<string | null>(null);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<string, boolean>>({});

  // Sinkronisasi kategori awal
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Otomatis memuat data Juri 1, Juri 2, dan Juri 3 ketika Cabang Lomba dipilih / berubah
  useEffect(() => {
    if (!selectedCategoryId) return;

    const catJudges = judges.filter((j) => j.categoryId === selectedCategoryId);
    const existingJ1 = catJudges.find((j) => j.role === 'Juri 1');
    const existingJ2 = catJudges.find((j) => j.role === 'Juri 2');
    const existingJ3 = catJudges.find((j) => j.role === 'Juri 3');

    const defaultSchool = schools.length > 0 ? schools[0].id : 'juri-tamu';

    setJuri1Name(existingJ1?.name || '');
    setJuri1SchoolId(existingJ1?.schoolId || defaultSchool);

    setJuri2Name(existingJ2?.name || '');
    setJuri2SchoolId(existingJ2?.schoolId || defaultSchool);

    setJuri3Name(existingJ3?.name || '');
    setJuri3SchoolId(existingJ3?.schoolId || defaultSchool);
  }, [selectedCategoryId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Helper Nama Sekolah / Juri Tamu
  const getJudgeSchoolName = (schoolId: string) => {
    if (schoolId === 'juri-tamu') return '🎭 Juri Tamu (Pihak Luar)';
    const s = schools.find((sch) => sch.id === schoolId);
    return s?.name || schoolId || '-';
  };

  // Generator Helper Kredensial
  const createCredentials = (judge: Judge): { username: string; password: string; token: string; generatedAt: string } => {
    const catCodeMap: Record<string, string> = {
      'cat-nyurat': 'nyurat',
      'cat-puisi': 'puisi',
      'cat-cerpen': 'cerpen',
      'cat-masatua': 'masatua',
      'cat-matembang': 'matembang',
      'cat-mapidarta': 'mapidarta',
      'cat-babanyolan': 'babanyolan',
    };
    const catSlug = catCodeMap[judge.categoryId] || 'lomba';
    const roleSlug = judge.role === 'Juri 1' ? '1' : judge.role === 'Juri 2' ? '2' : '3';
    
    const username = `juri_${catSlug}_${roleSlug}`;
    const password = `FTBI${Math.floor(1000 + Math.random() * 9000)}`;
    const token = `PKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      username,
      password,
      token,
      generatedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // SUBMIT FORM 3 JURI PER CABANG
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      showToast('Mohon pilih Cabang Lomba yang dinilai', 'error');
      return;
    }

    const currentCat = categories.find((c) => c.id === selectedCategoryId);
    const catName = currentCat?.name || 'Cabang Lomba';

    if (!juri1Name.trim() && !juri2Name.trim() && !juri3Name.trim()) {
      showToast('Mohon masukkan minimal salah satu nama juri (Juri 1, Juri 2, atau Juri 3)', 'error');
      return;
    }

    const catJudges = judges.filter((j) => j.categoryId === selectedCategoryId);
    const existingJ1 = catJudges.find((j) => j.role === 'Juri 1');
    const existingJ2 = catJudges.find((j) => j.role === 'Juri 2');
    const existingJ3 = catJudges.find((j) => j.role === 'Juri 3');

    const toSave: Judge[] = [];
    const toDelete: string[] = [];
    const nowBase = Date.now();

    // 1. Simpan Juri 1
    if (juri1Name.trim()) {
      toSave.push({
        id: existingJ1?.id || `jdg-${nowBase}-1`,
        name: juri1Name.trim(),
        categoryId: selectedCategoryId,
        schoolId: juri1SchoolId || 'juri-tamu',
        role: 'Juri 1',
        isBackup: false,
        username: existingJ1?.username,
        password: existingJ1?.password,
        token: existingJ1?.token,
        generatedAt: existingJ1?.generatedAt,
      });
    } else if (existingJ1) {
      toDelete.push(existingJ1.id);
    }

    // 2. Simpan Juri 2
    if (juri2Name.trim()) {
      toSave.push({
        id: existingJ2?.id || `jdg-${nowBase}-2`,
        name: juri2Name.trim(),
        categoryId: selectedCategoryId,
        schoolId: juri2SchoolId || 'juri-tamu',
        role: 'Juri 2',
        isBackup: false,
        username: existingJ2?.username,
        password: existingJ2?.password,
        token: existingJ2?.token,
        generatedAt: existingJ2?.generatedAt,
      });
    } else if (existingJ2) {
      toDelete.push(existingJ2.id);
    }

    // 3. Simpan Juri 3
    if (juri3Name.trim()) {
      toSave.push({
        id: existingJ3?.id || `jdg-${nowBase}-3`,
        name: juri3Name.trim(),
        categoryId: selectedCategoryId,
        schoolId: juri3SchoolId || 'juri-tamu',
        role: 'Juri 3',
        isBackup: false,
        username: existingJ3?.username,
        password: existingJ3?.password,
        token: existingJ3?.token,
        generatedAt: existingJ3?.generatedAt,
      });
    } else if (existingJ3) {
      toDelete.push(existingJ3.id);
    }

    try {
      if (onSaveJudgesBatch) {
        await onSaveJudgesBatch(toSave, toDelete);
      } else {
        toSave.forEach((j) => {
          const isExist = catJudges.some((cj) => cj.id === j.id);
          if (isExist) onUpdateJudge(j);
          else onAddJudge(j);
        });
        toDelete.forEach((id) => onDeleteJudge(id));
      }
      showToast(`Data Dewan Juri untuk ${catName} (${toSave.length} Juri) berhasil disimpan!`, 'success');
    } catch (err) {
      console.error('Error saving judges:', err);
      showToast('Gagal menyimpan data dewan juri. Silakan coba lagi.', 'error');
    }
  };

  // Switch edit dari tabel
  const handleEditJudge = (judge: Judge) => {
    setSelectedCategoryId(judge.categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Form diarahkan ke cabang "${categories.find(c => c.id === judge.categoryId)?.name || judge.categoryId}".`);
  };

  // Hapus single juri
  const handleInitiateDeleteSingle = (judge: Judge) => {
    setJudgeToDelete(judge);
  };

  const handleConfirmDeleteSingle = () => {
    if (!judgeToDelete) return;
    try {
      const deletedName = judgeToDelete.name;
      onDeleteJudge(judgeToDelete.id);
      setJudgeToDelete(null);
      showToast(`Dewan Juri "${deletedName}" berhasil dihapus dari sistem!`, 'success');
    } catch {
      showToast('Gagal menghapus data dewan juri. Silakan coba lagi.', 'error');
    }
  };

  // Hapus semua juri
  const handleConfirmDeleteAll = () => {
    try {
      const totalCount = judges.length;
      if (onDeleteAllJudges) {
        onDeleteAllJudges();
      } else {
        judges.forEach((j) => onDeleteJudge(j.id));
      }
      setShowConfirmDeleteAll(false);
      showToast(`Seluruh data dewan juri (${totalCount} Juri) berhasil dihapus!`, 'success');
    } catch {
      showToast('Gagal menghapus seluruh dewan juri. Silakan coba lagi.', 'error');
    }
  };

  // Generate Perorangan
  const handleGenerateIndividual = (judge: Judge) => {
    const creds = createCredentials(judge);
    const updatedJudge: Judge = {
      ...judge,
      username: creds.username,
      password: creds.password,
      token: creds.token,
      generatedAt: creds.generatedAt,
    };
    onUpdateJudge(updatedJudge);
    showToast(`Akun Login untuk ${judge.name} (${creds.username}) berhasil digenerate!`);
    setActiveCardJudge(updatedJudge);
  };

  // Generate Keseluruhan - Buka Modal Konfirmasi
  const handleGenerateAll = () => {
    const totalCount = judges.length;
    if (totalCount === 0) {
      showToast('Belum ada dewan juri yang terdaftar.', 'error');
      return;
    }
    setShowConfirmGenerateAll(true);
  };

  // Eksekusi Generate Semua Akun setelah konfirmasi
  const handleConfirmGenerateAll = async () => {
    const totalCount = judges.length;
    if (totalCount === 0) return;

    setIsGeneratingAll(true);
    try {
      const updatedList = judges.map((j) => {
        const creds = createCredentials(j);
        return {
          ...j,
          username: creds.username,
          password: creds.password,
          token: creds.token,
          generatedAt: creds.generatedAt,
        };
      });

      if (onUpdateAllJudges) {
        await onUpdateAllJudges(updatedList);
      } else if (onSaveJudgesBatch) {
        await onSaveJudgesBatch(updatedList);
      } else {
        updatedList.forEach((j) => onUpdateJudge(j));
      }

      setShowConfirmGenerateAll(false);
      showToast(`Berhasil men-generate kredensial akun login untuk ${totalCount} dewan juri!`, 'success');
    } catch (error) {
      console.error('Error generating credentials for all judges:', error);
      showToast('Gagal men-generate kredensial dewan juri. Silakan coba lagi.', 'error');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Copy to clipboard
  const handleCopyCredentials = (judge: Judge) => {
    const schName = getJudgeSchoolName(judge.schoolId);
    const cat = categories.find((c) => c.id === judge.categoryId);
    const text = `KARTU LOGIN DEWAN JURI FTBI 2026
Nama: ${judge.name}
Peran: ${judge.role}
Cabang: ${cat?.name || '-'}
Sekolah / Asal: ${schName}
Username: ${judge.username || '-'}
Password: ${judge.password || '-'}
Token: ${judge.token || '-'}`;

    navigator.clipboard.writeText(text);
    setCopiedJudgeId(judge.id);
    setTimeout(() => setCopiedJudgeId(null), 3000);
    showToast('Kredensial login berhasil disalin ke clipboard!');
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = (judgeId: string) => {
    setVisiblePasswordIds((prev) => ({
      ...prev,
      [judgeId]: !prev[judgeId],
    }));
  };

  // Generator Kartu Login HTML
  const generateAllCardsHTML = () => {
    const cardsHTML = judges.map((judge, idx) => {
      const schoolName = getJudgeSchoolName(judge.schoolId);
      const category = categories.find((c) => c.id === judge.categoryId);

      return `
        <div class="judge-card">
          <div class="card-header">
            <div>
              <div class="sub-header">FTBI SD KEC. PEKUTATAN 2026</div>
              <div class="judge-name">${idx + 1}. ${judge.name}</div>
              <div class="school-name">${schoolName}</div>
            </div>
            <span class="badge-role">${judge.role}</span>
          </div>
          <div class="card-body">
            <div class="row">
              <span class="label">Cabang Lomba:</span>
              <span class="value">${category?.name || '-'}</span>
            </div>
            <div class="cred-box">
              <span class="cred-label">Username:</span>
              <span class="cred-val">${judge.username || 'Belum Digenerate'}</span>
            </div>
            <div class="cred-box">
              <span class="cred-label">Password:</span>
              <span class="cred-val pass">${judge.password || 'Belum Digenerate'}</span>
            </div>
            <div class="token-row">
              <span>Token: ${judge.token || '-'}</span>
              <span>Gunting Sesuai Garis Putus-putus</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>Lembar Seluruh Kartu Login Dewan Juri FTBI SD Pekutatan 2026</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 12px;
              background: #fff;
            }
            .header-banner {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 8px;
              margin-bottom: 14px;
            }
            .header-banner h1 {
              font-size: 15px;
              font-weight: 800;
              text-transform: uppercase;
              margin: 0;
              color: #064e3b;
            }
            .header-banner p {
              font-size: 10px;
              color: #475569;
              margin: 3px 0 0 0;
            }
            .cards-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .judge-card {
              border: 2px dashed #94a3b8;
              border-radius: 12px;
              padding: 12px;
              background: #f8fafc;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 6px;
              margin-bottom: 6px;
            }
            .sub-header {
              font-size: 8px;
              font-weight: 800;
              color: #065f46;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .judge-name {
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 1px;
            }
            .school-name {
              font-size: 10px;
              color: #64748b;
            }
            .badge-role {
              background: #064e3b;
              color: #fff;
              font-size: 9px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              white-space: nowrap;
            }
            .card-body {
              font-size: 10px;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .label {
              color: #64748b;
            }
            .value {
              font-weight: 600;
              color: #1e293b;
              text-align: right;
            }
            .cred-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #fff;
              border: 1px solid #cbd5e1;
              padding: 4px 8px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 11px;
            }
            .cred-label {
              font-size: 10px;
              color: #475569;
              font-weight: 600;
              font-family: system-ui, sans-serif;
            }
            .cred-val {
              font-weight: 800;
              color: #065f46;
            }
            .cred-val.pass {
              color: #b45309;
            }
            .token-row {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #94a3b8;
              margin-top: 4px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1>LEMBAR KARTU LOGIN DEWAN JURI FTBI SD TAHUN 2026</h1>
            <p>Kecamatan Pekutatan • Siap Dicetak & Digunting Untuk Dibagikan Pada Sesi Briefing Dewan Juri (${judges.length} Juri)</p>
          </div>
          <div class="cards-grid">
            ${cardsHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;
  };

  // Cetak Semua Kartu Login Juri
  const handlePrintAllCards = () => {
    const htmlContent = generateAllCardsHTML();
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        return;
      }
    } catch {
      // Fallback
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
        return;
      }
    } catch {
      // Fallback
    }

    window.print();
  };

  // Unduh Semua Kartu Login (Format Dokumen / Siap PDF)
  const handleDownloadAllCardsPDF = () => {
    const htmlContent = generateAllCardsHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lembar_Kartu_Login_Dewan_Juri_FTBI_Pekutatan_2026.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Dokumen Lembar Kartu Login Juri berhasil diunduh! Anda dapat langsung membukanya di browser untuk dicetak atau disimpan sebagai PDF.', 'success');
  };

  // Cetak Satu Kartu Juri
  const handlePrintSingleCard = (judge: Judge) => {
    const schoolName = getJudgeSchoolName(judge.schoolId);
    const category = categories.find((c) => c.id === judge.categoryId);

    const singleHTML = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>Kartu Login Juri - ${judge.name}</title>
          <style>
            @page { size: A6 landscape; margin: 5mm; }
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              background: #fff;
              margin: 0;
              padding: 10px;
            }
            .card {
              border: 2px solid #064e3b;
              border-radius: 16px;
              padding: 20px;
              max-width: 400px;
              width: 100%;
              background: #022c22;
              color: #fff;
            }
            .title { font-size: 10px; font-weight: 800; color: #6ee7b7; text-transform: uppercase; }
            .name { font-size: 16px; font-weight: 800; margin: 4px 0 2px; }
            .school { font-size: 11px; color: #a7f3d0; margin-bottom: 12px; }
            .box { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; font-size: 12px; line-height: 1.8; }
            .uname { color: #fde047; font-family: monospace; font-weight: bold; }
            .pass { color: #86efac; font-family: monospace; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">FTBI SD KECAMATAN PEKUTATAN 2026 • ${judge.role}</div>
            <div class="name">${judge.name}</div>
            <div class="school">${schoolName}</div>
            <div class="box">
              <div>Cabang Lomba: <strong>${category?.name || '-'}</strong></div>
              <div>Username: <span class="uname">${judge.username || '-'}</span></div>
              <div>Password: <span class="pass">${judge.password || '-'}</span></div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">Token: ${judge.token || '-'}</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(singleHTML);
        printWindow.document.close();
        return;
      }
    } catch {
      // Fallback
    }

    window.print();
  };

  // Unduh Rekap Akun Juri CSV / Excel
  const handleExportCredentialsCSV = () => {
    if (judges.length === 0) {
      showToast('Belum ada dewan juri terdaftar.', 'error');
      return;
    }

    const headers = [
      'No',
      'Nama Juri',
      'Peran Juri',
      'Cabang Lomba',
      'Sekolah Asal',
      'Username Login',
      'Password Login',
      'Kode Token',
      'Waktu Generate'
    ];

    const rows = judges.map((j, idx) => {
      const schName = getJudgeSchoolName(j.schoolId);
      const cat = categories.find((c) => c.id === j.categoryId);

      return [
        idx + 1,
        `"${j.name.replace(/"/g, '""')}"`,
        `"${j.role}"`,
        `"${cat?.name || '-'}"`,
        `"${schName}"`,
        `"${j.username || 'Belum Digenerate'}"`,
        `"${j.password || 'Belum Digenerate'}"`,
        `"${j.token || '-'}"`,
        `"${j.generatedAt || '-'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Akun_Login_Juri_FTBI_Pekutatan_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Judges untuk List di Bawah
  const filteredJudges = judges.filter((j) => {
    const matchesCategory = selectedCategoryFilter === 'all' || j.categoryId === selectedCategoryFilter;
    const schoolName = getJudgeSchoolName(j.schoolId).toLowerCase();
    const matchesSearch =
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.username && j.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      schoolName.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Current category object & stats
  const activeCategoryObj = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const activeCatJudges = judges.filter((j) => j.categoryId === selectedCategoryId);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-600'
              : 'bg-rose-800 text-white border border-rose-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-300" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Container Utama */}
      <div className="space-y-6">
        
        {/* 1. FORM PENDAFTARAN 3 JURI PER CABANG LOMBA */}
        <div className="w-full">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs relative">
            
            {/* Header Form */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Form Pendaftaran Dewan Juri
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih cabang lomba, lalu daftarkan 3 juri (Juri 1, Juri 2, dan Juri 3) beserta asal sekolah atau Juri Tamu
                  </p>
                </div>
              </div>

              {/* Status Badge Cabang Ini */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                  activeCatJudges.length === 3
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : activeCatJudges.length > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {activeCatJudges.length === 3
                      ? 'Lengkap 3 Juri'
                      : `${activeCatJudges.length} dari 3 Juri Terdaftar`}
                  </span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              
              {/* STEP 1: PILIH CABANG LOMBA */}
              <div className="bg-emerald-950/5 border border-emerald-700/20 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="select-cabang-lomba-juri" className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                    <span>Pilih Cabang Lomba yang Dinilai:</span>
                  </label>
                </div>

                <select
                  id="select-cabang-lomba-juri"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-white hover:bg-slate-50 border-2 border-emerald-700/40 rounded-xl p-3.5 text-sm sm:text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 focus:outline-hidden transition cursor-pointer shadow-2xs"
                >
                  {categories.map((cat, idx) => {
                    const count = judges.filter((j) => j.categoryId === cat.id).length;
                    const statusText = count === 3 ? '✅ Lengkap 3 Juri' : count > 0 ? `⚠️ ${count}/3 Juri` : '⚠️ Belum Ada Juri';
                    return (
                      <option key={cat.id} value={cat.id}>
                        {idx + 1}. {cat.name} ({cat.targetLevel || 'SD'}) — [{statusText}]
                      </option>
                    );
                  })}
                </select>

                {/* Quick Switch Pills 7 Cabang */}
                <div className="pt-1 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Pilih Cepat:</span>
                  {categories.map((cat, idx) => {
                    const isSelected = cat.id === selectedCategoryId;
                    const count = judges.filter((j) => j.categoryId === cat.id).length;
                    const shortName = cat.name.replace(/^Lomba\s+/i, '');
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? 'bg-emerald-800 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{idx + 1}. {shortName}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                          count === 3 
                            ? isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                            : isSelected ? 'bg-amber-500 text-slate-950' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {count}/3
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: INPUT NAMA & SEKOLAH ASAL UNTUK JURI 1, JURI 2, JURI 3 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>Input Data 3 Dewan Juri (Juri 1, Juri 2, Juri 3):</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    Pilih sekolah asal di sistem atau pilih opsi <strong className="text-emerald-800 font-bold">Juri Tamu</strong> untuk pihak luar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* CARD JURI 1 */}
                  <div className="bg-slate-50/90 border-2 border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4.5 space-y-3.5 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                          1
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">JURI 1</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Penilai Utama 1
                      </span>
                    </div>

                    {/* Input Nama Juri 1 */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                        Nama Lengkap Juri 1:
                      </label>
                      <input
                        id="input-nama-juri-1"
                        type="text"
                        placeholder="Contoh: I Made Suartana, S.Pd."
                        value={juri1Name}
                        onChange={(e) => setJuri1Name(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                      />
                    </div>

                    {/* Input Asal Sekolah / Juri Tamu */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                        <span>Sekolah Asal / Instansi:</span>
                      </label>
                      <select
                        id="select-sekolah-juri-1"
                        value={juri1SchoolId}
                        onChange={(e) => setJuri1SchoolId(e.target.value)}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer shadow-2xs"
                      >
                        <optgroup label="✨ Juri Luar / Tamu">
                          <option value="juri-tamu">🎭 Juri Tamu (Pihak Luar / Non-Sekolah)</option>
                        </optgroup>
                        <optgroup label={`🏫 Daftar Sekolah di Sistem (${schools.length} SD)`}>
                          {schools.length === 0 ? (
                            <option disabled value="">(Belum ada data sekolah)</option>
                          ) : (
                            schools.map((sch, idx) => (
                              <option key={sch.id} value={sch.id}>
                                {idx + 1}. {sch.name} {sch.village ? `(${sch.village})` : ''}
                              </option>
                            ))
                          )}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* CARD JURI 2 */}
                  <div className="bg-slate-50/90 border-2 border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4.5 space-y-3.5 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                          2
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">JURI 2</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Penilai Utama 2
                      </span>
                    </div>

                    {/* Input Nama Juri 2 */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                        Nama Lengkap Juri 2:
                      </label>
                      <input
                        id="input-nama-juri-2"
                        type="text"
                        placeholder="Contoh: Ni Luh Putu Wardani, S.Pd."
                        value={juri2Name}
                        onChange={(e) => setJuri2Name(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                      />
                    </div>

                    {/* Input Asal Sekolah / Juri Tamu */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                        <span>Sekolah Asal / Instansi:</span>
                      </label>
                      <select
                        id="select-sekolah-juri-2"
                        value={juri2SchoolId}
                        onChange={(e) => setJuri2SchoolId(e.target.value)}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer shadow-2xs"
                      >
                        <optgroup label="✨ Juri Luar / Tamu">
                          <option value="juri-tamu">🎭 Juri Tamu (Pihak Luar / Non-Sekolah)</option>
                        </optgroup>
                        <optgroup label={`🏫 Daftar Sekolah di Sistem (${schools.length} SD)`}>
                          {schools.length === 0 ? (
                            <option disabled value="">(Belum ada data sekolah)</option>
                          ) : (
                            schools.map((sch, idx) => (
                              <option key={sch.id} value={sch.id}>
                                {idx + 1}. {sch.name} {sch.village ? `(${sch.village})` : ''}
                              </option>
                            ))
                          )}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* CARD JURI 3 */}
                  <div className="bg-slate-50/90 border-2 border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4.5 space-y-3.5 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                          3
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">JURI 3</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Penilai Utama 3
                      </span>
                    </div>

                    {/* Input Nama Juri 3 */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                        Nama Lengkap Juri 3:
                      </label>
                      <input
                        id="input-nama-juri-3"
                        type="text"
                        placeholder="Contoh: I Ketut Gede Wirasa, S.Pd."
                        value={juri3Name}
                        onChange={(e) => setJuri3Name(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                      />
                    </div>

                    {/* Input Asal Sekolah / Juri Tamu */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                        <span>Sekolah Asal / Instansi:</span>
                      </label>
                      <select
                        id="select-sekolah-juri-3"
                        value={juri3SchoolId}
                        onChange={(e) => setJuri3SchoolId(e.target.value)}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition cursor-pointer shadow-2xs"
                      >
                        <optgroup label="✨ Juri Luar / Tamu">
                          <option value="juri-tamu">🎭 Juri Tamu (Pihak Luar / Non-Sekolah)</option>
                        </optgroup>
                        <optgroup label={`🏫 Daftar Sekolah di Sistem (${schools.length} SD)`}>
                          {schools.length === 0 ? (
                            <option disabled value="">(Belum ada data sekolah)</option>
                          ) : (
                            schools.map((sch, idx) => (
                              <option key={sch.id} value={sch.id}>
                                {idx + 1}. {sch.name} {sch.village ? `(${sch.village})` : ''}
                              </option>
                            ))
                          )}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

              {/* Tombol Simpan 3 Juri */}
              <button
                type="submit"
                id="btn-submit-juri"
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <UserCheck className="w-5 h-5 text-emerald-200" />
                <span>Simpan 3 Dewan Juri ({activeCategoryObj?.name || 'Cabang Ini'})</span>
              </button>

            </form>
          </div>
        </div>

        {/* 2. DAFTAR DEWAN JURI & GENERATE KREDENSIAL */}
        <div className="w-full space-y-4">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-800" />
                  <span>Daftar Seluruh Dewan Juri ({filteredJudges.length} Juri)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kredensial login unik mencegah juri login di tempat lain atau menilai cabang yang salah
                </p>
              </div>

              {/* Tombol Aksi Kredensial & Kartu Login */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-generate-all-judges"
                  onClick={handleGenerateAll}
                  className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Generate otomatis username dan password untuk seluruh dewan juri"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Akun Semua Juri</span>
                </button>

                <button
                  id="btn-print-all-cards"
                  onClick={() => setShowAllCardsModal(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Lihat & cetak seluruh kartu login juri siap dibagikan"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Cetak Semua Kartu Login</span>
                </button>

                <button
                  id="btn-delete-all-judges"
                  type="button"
                  onClick={() => {
                    if (judges.length === 0) {
                      showToast('Tidak ada data dewan juri untuk dihapus.', 'error');
                      return;
                    }
                    setShowConfirmDeleteAll(true);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Hapus seluruh data dewan juri yang terdaftar"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Semua Juri</span>
                </button>

                <button
                  id="btn-export-judge-csv"
                  onClick={handleExportCredentialsCSV}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="Unduh Rekap Akun Login format CSV / Excel"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search & Filter Cabang */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari juri / username / sekolah / tamu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs w-full focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-6">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
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

            {/* List / Card Juri */}
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredJudges.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada dewan juri yang cocok dengan pencarian / filter.
                </div>
              ) : (
                filteredJudges.map((judge) => {
                  const schoolName = getJudgeSchoolName(judge.schoolId);
                  const isGuest = judge.schoolId === 'juri-tamu';
                  const category = categories.find((c) => c.id === judge.categoryId);
                  const hasCredentials = Boolean(judge.username && judge.password);
                  const isPasswordVisible = visiblePasswordIds[judge.id];

                  return (
                    <div
                      key={judge.id}
                      className="p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Detail Juri */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-800 text-white">
                              {judge.role}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {judge.name}
                            </h4>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 ${
                              isGuest ? 'font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200' : 'text-slate-700 font-medium'
                            }`}>
                              {schoolName}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-800 font-semibold">{category?.name}</span>
                          </div>

                          {/* Kredensial Bar */}
                          <div className="pt-1.5 flex items-center gap-3 flex-wrap text-xs">
                            {hasCredentials ? (
                              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="font-mono text-[11px] font-bold text-slate-700">
                                  User: <span className="text-emerald-800">{judge.username}</span>
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="font-mono text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                  Pass: {isPasswordVisible ? (
                                    <span className="text-amber-700">{judge.password}</span>
                                  ) : (
                                    <span className="text-slate-400">••••••••</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(judge.id)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                  >
                                    {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Belum generate akun login
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {hasCredentials ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setActiveCardJudge(judge)}
                                className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                                title="Lihat Kartu Login"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Kartu Login</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyCredentials(judge)}
                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg cursor-pointer transition"
                                title="Salin Kredensial"
                              >
                                {copiedJudgeId === judge.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleGenerateIndividual(judge)}
                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg cursor-pointer transition"
                                title="Generate Ulang Akun"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGenerateIndividual(judge)}
                              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                            >
                              <Key className="w-3 h-3" />
                              <span>Generate Akun</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEditJudge(judge)}
                            className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-slate-200 rounded-lg cursor-pointer transition"
                            title="Edit Dewan Juri Cabang Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            id={`btn-delete-judge-${judge.id}`}
                            onClick={() => handleInitiateDeleteSingle(judge)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                            title="Hapus Juri"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* MODAL: KONFIRMASI HAPUS SATU JURI */}
      {judgeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Konfirmasi Hapus Dewan Juri</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus data juri dari sistem</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Lengkap Juri:</span>
                <span className="font-extrabold text-sm text-slate-900">{judgeToDelete.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Peran & Kategori:</span>
                  <span className="font-bold text-emerald-800">{judgeToDelete.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cabang Lomba:</span>
                  <span className="font-semibold text-slate-700">{categories.find(c => c.id === judgeToDelete.categoryId)?.name || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Asal Sekolah / Instansi:</span>
                  <span className="font-semibold text-slate-700">{getJudgeSchoolName(judgeToDelete.schoolId)}</span>
                </div>
                {judgeToDelete.username && (
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Username Akun:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{judgeToDelete.username}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Apakah Anda yakin ingin menghapus data dewan juri ini? Akun login dan kredensial terkait akan dinonaktifkan.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setJudgeToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-judge"
                onClick={handleConfirmDeleteSingle}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Juri Ini</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS SEMUA JURI */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 space-y-4">
            
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950">Konfirmasi Hapus Semua Dewan Juri</h3>
                <p className="text-xs text-rose-700">Tindakan massal dan permanen</p>
              </div>
            </div>

            <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 space-y-2 text-xs text-rose-950">
              <div className="font-extrabold text-sm text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Peringatan Penghapusan Total</span>
              </div>
              <p className="leading-relaxed">
                Anda akan menghapus seluruh data <strong className="font-black text-rose-900">{judges.length} Dewan Juri</strong> yang terdaftar di sistem. Seluruh kredensial akun login username dan password juri juga akan dibersihkan.
              </p>
              <div className="text-[11px] text-rose-800/90 bg-white/70 p-2.5 rounded-xl border border-rose-200">
                Data yang telah dihapus tidak dapat dipulihkan kembali kecuali Anda mendaftarkan atau men-generate ulang dewan juri.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-all-judges"
                onClick={handleConfirmDeleteAll}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Semua ({judges.length} Juri)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI GENERATE SEMUA AKUN JURI */}
      {showConfirmGenerateAll && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 animate-in zoom-in-95 space-y-4">
            
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Generate Akun Semua Juri</h3>
                <p className="text-xs text-slate-500">Pembuatan kredensial username & PIN otomatis</p>
              </div>
            </div>

            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-2 text-xs text-emerald-950">
              <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Konfirmasi Pembuatan Kredensial Massal</span>
              </div>
              <p className="leading-relaxed">
                Sistem akan secara otomatis membuat dan memperbarui username login, PIN/Password, dan Token resmi untuk seluruh <strong className="font-black text-emerald-900">{judges.length} Dewan Juri</strong> yang terdaftar.
              </p>
              <div className="text-[11px] text-emerald-800/90 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                Setelah digenerate, Anda dapat langsung mencetak seluruh Kartu Login Juri atau menyalin akun masing-masing dewan juri.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isGeneratingAll}
                onClick={() => setShowConfirmGenerateAll(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-generate-all-judges"
                disabled={isGeneratingAll}
                onClick={handleConfirmGenerateAll}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Key className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingAll ? 'Sedang Memproses...' : `Ya, Generate Akun (${judges.length} Juri)`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: KARTU LOGIN JURI PERORANGAN */}
      {activeCardJudge && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Kartu Login Dewan Juri</h3>
                  <p className="text-[11px] text-slate-500">FTBI SD Kecamatan Pekutatan 2026</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCardJudge(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Kartu Login Box */}
            <div id="print-single-card" className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-inner relative overflow-hidden space-y-4">
              
              {/* Watermark */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase block">
                    KARTU LOGIN RESMI
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">
                    {activeCardJudge.name}
                  </h4>
                  <p className="text-xs text-emerald-200">
                    {getJudgeSchoolName(activeCardJudge.schoolId)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-md">
                    {activeCardJudge.role}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/15 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Cabang Lomba:</span>
                  <span className="font-bold text-white text-right">
                    {categories.find((c) => c.id === activeCardJudge.categoryId)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
                  <span className="text-slate-300">Username Login:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {activeCardJudge.username}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
                  <span className="text-slate-300">Password Login:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">
                    {activeCardJudge.password}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Token: {activeCardJudge.token}</span>
                <span>Digenerate: {activeCardJudge.generatedAt}</span>
              </div>
            </div>

            {/* Tombol Aksi Cetak & Salin & Tutup */}
            <div className="mt-5 flex items-center justify-between gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCardJudge(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Tutup / Keluar
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(activeCardJudge)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const schoolName = getJudgeSchoolName(activeCardJudge.schoolId);
                    const category = categories.find((c) => c.id === activeCardJudge.categoryId);
                    const html = `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <title>Kartu Login Juri - ${activeCardJudge.name}</title>
                          <style>
                            @page { size: A6 landscape; margin: 10mm; }
                            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 90vh; }
                            .card { border: 2px dashed #064e3b; border-radius: 16px; padding: 24px; max-width: 420px; width: 100%; background: #f8fafc; }
                            h2 { margin: 0 0 4px; color: #064e3b; font-size: 16px; }
                            p { margin: 0 0 16px; color: #64748b; font-size: 12px; }
                            .row { margin-bottom: 8px; font-size: 13px; }
                            .code { font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 8px; border-radius: 6px; }
                          </style>
                        </head>
                        <body>
                          <div class="card">
                            <h2>${activeCardJudge.name} (${activeCardJudge.role})</h2>
                            <p>${schoolName} • FTBI SD Pekutatan 2026</p>
                            <div class="row">Cabang Lomba: <strong>${category?.name || '-'}</strong></div>
                            <div class="row">Username: <span class="code" style="color:#065f46">${activeCardJudge.username || '-'}</span></div>
                            <div class="row">Password: <span class="code" style="color:#b45309">${activeCardJudge.password || '-'}</span></div>
                            <div class="row" style="font-size: 10px; color: #94a3b8; margin-top: 12px;">Token: ${activeCardJudge.token || '-'}</div>
                          </div>
                          <script>window.onload = function() { window.print(); }</script>
                        </body>
                      </html>
                    `;
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Kartu_Login_${activeCardJudge.name.replace(/\s+/g, '_')}.html`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    showToast('Kartu login juri berhasil diunduh (format HTML/PDF)!');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  title="Unduh Kartu sebagai file Dokumen/PDF"
                >
                  <Download className="w-3.5 h-3.5 text-slate-700" />
                  <span>Unduh Dokumen</span>
                </button>

                <button
                  type="button"
                  id="btn-print-single-judge-card"
                  onClick={() => handlePrintSingleCard(activeCardJudge)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Kartu Login (PDF)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CETAK SEMUA KARTU LOGIN JURI */}
      {showAllCardsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-800" />
                  <span>Lembar Seluruh Kartu Login Dewan Juri ({judges.length} Juri)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Siap dicetak pada kertas A4 dan dipotong untuk dibagikan saat sesi briefing juri
                </p>
              </div>
              <button
                onClick={() => setShowAllCardsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Kartu Potong */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {judges.map((judge, idx) => {
                  const schoolName = getJudgeSchoolName(judge.schoolId);
                  const category = categories.find((c) => c.id === judge.categoryId);

                  return (
                    <div
                      key={judge.id}
                      className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                            FTBI SD KEC. PEKUTATAN 2026
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {idx + 1}. {judge.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {schoolName}
                          </p>
                        </div>
                        <span className="bg-emerald-800 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                          {judge.role}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cabang Lomba:</span>
                          <span className="font-semibold text-slate-800 text-right">{category?.name}</span>
                        </div>
                        <div className="flex justify-between font-mono bg-white p-1.5 rounded-lg border border-slate-200">
                          <span className="text-slate-600 font-bold">Username:</span>
                          <span className="text-emerald-800 font-bold">{judge.username || 'Belum Digenerate'}</span>
                        </div>
                        <div className="flex justify-between font-mono bg-white p-1.5 rounded-lg border border-slate-200">
                          <span className="text-slate-600 font-bold">Password:</span>
                          <span className="text-amber-700 font-bold">{judge.password || 'Belum Digenerate'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-slate-500">
                Tip: Gunakan tombol Cetak atau Unduh Dokumen untuk menyimpan sebagai file PDF.
              </p>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllCardsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  id="btn-download-all-judge-cards"
                  onClick={handleDownloadAllCardsPDF}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                  title="Unduh Lembar Seluruh Kartu Juri format Dokumen Siap PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen (PDF)</span>
                </button>
                <button
                  type="button"
                  id="btn-print-all-judge-cards"
                  onClick={handlePrintAllCards}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Seluruh Kartu (Print)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
