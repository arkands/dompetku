// ===========================
// DOMPETKU – app.js (FIXED)
// ===========================

// ---- KONFIGURASI ----
const CONFIG_KEY    = 'dompetku_script_url';
const CACHE_KEY     = 'dompetku_cache';
const DEMO_MODE_KEY = 'dompetku_demo';

// ---- STATE ----
let semuaData  = [];
let isDemoMode = false;

// ---- DEMO DATA ----
const demoData = [
  ['Tanggal','Kategori','Keterangan','Jumlah'],
  [formatTanggalISO(0), '🍜 Makanan & Minuman', 'Sarapan nasi uduk',  15000],
  [formatTanggalISO(0), '🚗 Transportasi',       'Gojek ke kantor',   22000],
  [formatTanggalISO(1), '🛒 Belanja',             'Indomaret',         45000],
  [formatTanggalISO(1), '🍜 Makanan & Minuman',  'Makan siang',       25000],
  [formatTanggalISO(2), '📱 Pulsa & Internet',    'Beli kuota 15GB',  65000],
  [formatTanggalISO(3), '💊 Kesehatan',           'Beli vitamin C',   35000],
  [formatTanggalISO(4), '🎮 Hiburan',             'Netflix bulanan',  54000],
  [formatTanggalISO(4), '🍜 Makanan & Minuman',  'Kopi & snack',     28000],
  [formatTanggalISO(5), '🏠 Rumah & Utilitas',    'Bayar listrik',   180000],
  [formatTanggalISO(6), '🚗 Transportasi',        'Bensin motor',     50000],
];

// ===========================
// UTILS
// ===========================

function formatTanggalISO(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}


// Konversi nilai tanggal dari Sheets ke format YYYY-MM-DD
// Handles: "4/15/2026", "2026-04-15", Date object
function toISO(val) {
  if (!val) return '';

  // Kalau Date object
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth()+1).padStart(2,'0');
    const d = String(val.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+d;
  }

  const s = String(val).trim();

  // Sudah format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Format M/D/YYYY atau MM/DD/YYYY (dari Google Sheets)
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const y = slash[3];
    const m = slash[1].padStart(2,'0');
    const d = slash[2].padStart(2,'0');
    return y+'-'+m+'-'+d;
  }

  // Fallback parse
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth()+1).padStart(2,'0');
    const d = String(dt.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+d;
  }

  return s;
}

function formatTanggalDisplay(value) {
  if (!value) return '—';
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRupiah(angka) {
  const num = parseInt(angka) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function getScriptUrl() {
  return localStorage.getItem(CONFIG_KEY) || '';
}

function showToast(pesan, tipe = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.className = `toast ${tipe}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

function setLoading(aktif) {
  const btn    = document.getElementById('btnSimpan');
  const text   = document.getElementById('btnText');
  const loader = document.getElementById('btnLoader');
  btn.disabled = aktif;
  text.classList.toggle('hidden', aktif);
  loader.classList.toggle('hidden', !aktif);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ===========================
// INISIALISASI
// ===========================

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
  }, 1800);

  document.getElementById('inputTanggal').value = formatTanggalISO(0);

  const url  = getScriptUrl();
  isDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';

  if (!url && !isDemoMode) {
    setTimeout(() => {
      document.getElementById('modalConfig').classList.remove('hidden');
    }, 1900);
  } else {
    muatData();
  }

  setupEventListeners();
  registerServiceWorker();
});

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(c => {
        if (c.id === `tab-${target}`) {
          c.classList.remove('hidden');
          c.classList.add('active');
        } else {
          c.classList.add('hidden');
          c.classList.remove('active');
        }
      });

      if (target === 'riwayat' && semuaData.length === 0) muatData();
    });
  });

  document.getElementById('btnSimpan').addEventListener('click', simpanPengeluaran);
  document.getElementById('btnRefresh').addEventListener('click', muatData);
  document.getElementById('filterKategori').addEventListener('change', renderRiwayat);
  document.getElementById('btnSaveConfig').addEventListener('click', simpanKonfigurasi);
  document.getElementById('btnDemoMode').addEventListener('click', aktifkanDemoMode);
}

// ===========================
// KONFIGURASI & DEMO
// ===========================

function simpanKonfigurasi() {
  const url = document.getElementById('inputScriptUrl').value.trim();
  if (!url || !url.startsWith('https://script.google.com')) {
    alert('⚠️ URL tidak valid. Pastikan URL dimulai dengan https://script.google.com');
    return;
  }
  localStorage.setItem(CONFIG_KEY, url);
  localStorage.removeItem(DEMO_MODE_KEY);
  isDemoMode = false;
  document.getElementById('modalConfig').classList.add('hidden');
  muatData();
}

function aktifkanDemoMode() {
  isDemoMode = true;
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  localStorage.removeItem(CONFIG_KEY);
  document.getElementById('modalConfig').classList.add('hidden');
  semuaData = [...demoData];
  updateSummary(semuaData);
  renderRiwayat();
  showToast('🎮 Mode Demo aktif! Data ini hanya contoh.', 'info');
}

// ===========================
// SIMPAN PENGELUARAN  ← BAGIAN YANG DIPERBAIKI
// ===========================

async function simpanPengeluaran() {
  const tanggal    = document.getElementById('inputTanggal').value;
  const kategori   = document.getElementById('inputKategori').value;
  const keterangan = document.getElementById('inputKeterangan').value.trim();
  const jumlah     = document.getElementById('inputJumlah').value;

  if (!tanggal)                         return showToast('⚠️ Tanggal harus diisi!', 'error');
  if (!kategori)                        return showToast('⚠️ Pilih kategori dulu!', 'error');
  if (!keterangan)                      return showToast('⚠️ Keterangan harus diisi!', 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast('⚠️ Jumlah harus lebih dari 0!', 'error');

  const newRow = [tanggal, kategori, keterangan, parseInt(jumlah)];

  // ── MODE DEMO ──────────────────────────────────────────────────
  if (isDemoMode) {
    semuaData.push(newRow);
    updateSummary(semuaData);
    renderRiwayat();
    resetForm();
    showToast('✅ Pengeluaran berhasil dicatat! (Mode Demo)', 'success');
    return;
  }

  // ── MODE NYATA ─────────────────────────────────────────────────
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    showToast('⚠️ URL belum dikonfigurasi. Reload halaman.', 'error');
    return;
  }

  setLoading(true);

  try {
    // PERBAIKAN CORS:
    // Kirim data lewat URL parameter (bukan body POST)
    // pakai method GET + mode no-cors agar tidak diblokir browser
    const params = new URLSearchParams({
      action: 'post',
      tanggal,
      kategori,
      keterangan,
      jumlah: parseInt(jumlah)
    });

    await fetch(`${scriptUrl}?${params.toString()}`, {
      method : 'GET',
      mode   : 'no-cors'   // wajib untuk Google Apps Script
    });

    // no-cors tidak bisa membaca respons → langsung anggap berhasil
    semuaData.push(newRow);
    updateSummary(semuaData);
    renderRiwayat();
    resetForm();
    showToast('✅ Pengeluaran berhasil disimpan ke Google Sheets!', 'success');

  } catch (err) {
    console.error(err);
    showToast('❌ Gagal menyimpan. Cek koneksi internet kamu.', 'error');
  } finally {
    setLoading(false);
  }
}

// ===========================
// MUAT DATA DARI SHEETS
// ===========================

async function muatData() {
  if (isDemoMode) {
    semuaData = [...demoData];
    updateSummary(semuaData);
    renderRiwayat();
    return;
  }

  const scriptUrl = getScriptUrl();
  if (!scriptUrl) return;

  tampilkanSkeleton();

  try {
    const response = await fetch(`${scriptUrl}?action=get`);
    if (!response.ok) throw new Error('Gagal mengambil data');

    const result = await response.json();
    semuaData = result.data || [];

    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData);
    renderRiwayat();

  } catch (err) {
    console.warn('Gagal ambil data online, mencoba cache...', err);

    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      semuaData = JSON.parse(cache);
      updateSummary(semuaData);
      renderRiwayat();
      showToast('📡 Offline – menampilkan data tersimpan', 'info');
    } else {
      document.getElementById('riwayatList').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>Tidak bisa memuat data.<br/>Cek koneksi internet kamu.</p>
        </div>`;
    }
  }
}

// ===========================
// UPDATE SUMMARY CARDS
// ===========================

function updateSummary(data) {
  // Normalisasi semua tanggal ke string ISO dulu, lewati header & baris kosong
  const rows = data
    .filter((r, i) => i > 0 && r[3] !== '' && r[3] != null)
    .map(r => [toISO(r[0]), r[1], r[2], r[3]]);

  const sekarang   = new Date();
  const bulanIni   = sekarang.getMonth();
  const tahunIni   = sekarang.getFullYear();
  const hariIniStr = formatTanggalISO(0);

  const totalBulan = rows
    .filter(r => {
      const d = new Date(r[0] + 'T00:00:00');
      return d.getMonth() === bulanIni && d.getFullYear() === tahunIni;
    })
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const jmlTransaksi = rows.filter(r => {
    const d = new Date(r[0] + 'T00:00:00');
    return d.getMonth() === bulanIni && d.getFullYear() === tahunIni;
  }).length;

  const totalHari = rows
    .filter(r => r[0] === hariIniStr)
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const totalMinggu = rows
    .filter(r => {
      const d    = new Date(r[0] + 'T00:00:00');
      const diff = (sekarang - d) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 7;
    })
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const namaBulan = sekarang.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  document.getElementById('totalBulanIni').textContent   = formatRupiah(totalBulan);
  document.getElementById('jumlahTransaksi').textContent = jmlTransaksi + ' transaksi';
  document.getElementById('bulanLabel').textContent      = namaBulan;
  document.getElementById('statHariIni').textContent     = formatRupiah(totalHari);
  document.getElementById('statMingguIni').textContent   = formatRupiah(totalMinggu);
}

// ===========================
// RENDER RIWAYAT
// ===========================

function renderRiwayat() {
  const container = document.getElementById('riwayatList');
  const filter    = document.getElementById('filterKategori').value;

  const rows = semuaData
    .filter((r, i) => i > 0 && r[0])
    .map(r => [toISO(r[0]), r[1], r[2], r[3]])
    .filter(r => r[0] && (!filter || r[1] === filter))
    .sort((a, b) => new Date(b[0]) - new Date(a[0]));

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Belum ada data pengeluaran.<br/>Mulai catat di tab ✏️ Catat!</p>
      </div>`;
    return;
  }

  container.innerHTML = rows.map(r => `
    <div class="riwayat-item">
      <div class="riwayat-left">
        <div class="riwayat-kategori">${escapeHtml(r[1])}</div>
        <div class="riwayat-ket">${escapeHtml(r[2])}</div>
        <div class="riwayat-tanggal">📅 ${formatTanggalDisplay(r[0])}</div>
      </div>
      <div class="riwayat-jumlah">${formatRupiah(r[3])}</div>
    </div>
  `).join('');
}

// ===========================
// HELPERS
// ===========================

function tampilkanSkeleton() {
  document.getElementById('riwayatList').innerHTML =
    [1,2,3].map(() => `<div class="skeleton"></div>`).join('');
}

function resetForm() {
  document.getElementById('inputKategori').value   = '';
  document.getElementById('inputKeterangan').value = '';
  document.getElementById('inputJumlah').value     = '';
  document.getElementById('inputTanggal').value    = formatTanggalISO(0);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ Service Worker terdaftar'))
      .catch(err => console.warn('SW error:', err));
  }
}
