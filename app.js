// ===========================
// DOMPETKU – app.js
// ===========================

// ---- KONFIGURASI ----
const CONFIG_KEY   = 'dompetku_script_url';
const CACHE_KEY    = 'dompetku_cache';
const DEMO_MODE_KEY = 'dompetku_demo';

// ---- STATE ----
let semuaData = [];   // menyimpan semua data yang sudah diambil
let isDemoMode = false;

// ---- DEMO DATA ----
const demoData = [
  ['Tanggal','Kategori','Keterangan','Jumlah'], // header
  [formatTanggalISO(0), '🍜 Makanan & Minuman', 'Sarapan nasi uduk', 15000],
  [formatTanggalISO(0), '🚗 Transportasi',       'Gojek ke kantor',  22000],
  [formatTanggalISO(1), '🛒 Belanja',             'Indomaret',        45000],
  [formatTanggalISO(1), '🍜 Makanan & Minuman',  'Makan siang',      25000],
  [formatTanggalISO(2), '📱 Pulsa & Internet',    'Beli kuota 15GB',  65000],
  [formatTanggalISO(3), '💊 Kesehatan',           'Beli vitamin C',   35000],
  [formatTanggalISO(4), '🎮 Hiburan',             'Netflix bulanan',  54000],
  [formatTanggalISO(4), '🍜 Makanan & Minuman',  'Kopi & snack',     28000],
  [formatTanggalISO(5), '🏠 Rumah & Utilitas',    'Bayar listrik',   180000],
  [formatTanggalISO(6), '🚗 Transportasi',        'Bensin motor',     50000],
];

// ---- UTILS ----
function formatTanggalISO(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function formatTanggalDisplay(value) {
  if (!value) return '—';

  const d = new Date(value);

  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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

// ---- INISIALISASI ----
window.addEventListener('load', () => {
  // Sembunyikan splash setelah 1.8 detik
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
  }, 1800);

  // Set tanggal hari ini di form
  document.getElementById('inputTanggal').value = formatTanggalISO(0);

  // Cek apakah sudah ada URL atau mode demo
  const url      = getScriptUrl();
  isDemoMode     = localStorage.getItem(DEMO_MODE_KEY) === 'true';

  if (!url && !isDemoMode) {
    // Tampilkan modal setup
    setTimeout(() => {
      document.getElementById('modalConfig').classList.remove('hidden');
    }, 1900);
  } else {
    muatData();
  }

  setupEventListeners();
  registerServiceWorker();
});

// ---- EVENT LISTENERS ----
function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'), c => c.classList.add('hidden'));
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

  // Tombol Simpan
  document.getElementById('btnSimpan').addEventListener('click', simpanPengeluaran);

  // Tombol Refresh
  document.getElementById('btnRefresh').addEventListener('click', muatData);

  // Filter kategori
  document.getElementById('filterKategori').addEventListener('change', renderRiwayat);

  // Setup modal
  document.getElementById('btnSaveConfig').addEventListener('click', simpanKonfigurasi);
  document.getElementById('btnDemoMode').addEventListener('click', aktifkanDemoMode);
}

// ---- SIMPAN KONFIGURASI ----
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

// ---- MODE DEMO ----
function aktifkanDemoMode() {
  isDemoMode = true;
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  localStorage.removeItem(CONFIG_KEY);
  document.getElementById('modalConfig').classList.add('hidden');
  semuaData = demoData;
  updateSummary(semuaData);
  renderRiwayat();
  showToast('🎮 Mode Demo aktif! Data ini hanya contoh.', 'info');
}

// ---- SIMPAN PENGELUARAN ----
async function simpanPengeluaran() {
  const tanggal    = document.getElementById('inputTanggal').value;
  const kategori   = document.getElementById('inputKategori').value;
  const keterangan = document.getElementById('inputKeterangan').value.trim();
  const jumlah     = document.getElementById('inputJumlah').value;

  // Validasi
  if (!tanggal)    return showToast('⚠️ Tanggal harus diisi!', 'error');
  if (!kategori)   return showToast('⚠️ Pilih kategori dulu!', 'error');
  if (!keterangan) return showToast('⚠️ Keterangan harus diisi!', 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast('⚠️ Jumlah harus lebih dari 0!', 'error');

  const newRow = [tanggal, kategori, keterangan, parseInt(jumlah)];

  // Mode Demo
  if (isDemoMode) {
    semuaData.push(newRow);
    updateSummary(semuaData);
    renderRiwayat();
    resetForm();
    showToast('✅ Pengeluaran berhasil dicatat! (Mode Demo)', 'success');
    return;
  }

  // Mode Nyata → kirim ke Google Apps Script
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    showToast('⚠️ URL belum dikonfigurasi. Reload halaman.', 'error');
    return;
  }

  setLoading(true);

 try {
  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      tanggal,
      kategori,
      keterangan,
      jumlah: parseInt(jumlah)
    })
  });

  // langsung anggap sukses
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

// ---- MUAT DATA DARI SHEETS ----
async function muatData() {
  // Mode Demo
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
    const response = await fetch(scriptUrl + '?action=get');
    if (!response.ok) throw new Error('Gagal mengambil data');

    const result = await response.json();
    semuaData = result.data || [];

    // Cache lokal (untuk offline)
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));

    updateSummary(semuaData);
    renderRiwayat();

  } catch (err) {
    console.warn('Gagal ambil data online, mencoba cache...', err);

    // Fallback ke cache offline
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

// ---- UPDATE SUMMARY CARDS ----
function updateSummary(data) {
  // Lewati baris header (baris pertama jika berisi string)
  const rows = data.filter((r, i) => i > 0 && typeof r[3] === 'number');

  const sekarang   = new Date();
  const bulanIni   = sekarang.getMonth();
  const tahunIni   = sekarang.getFullYear();
  const hariIniStr = formatTanggalISO(0);

  // Total bulan ini
  const totalBulan = rows
    .filter(r => {
      const d = new Date(r[0] + 'T00:00:00');
      return d.getMonth() === bulanIni && d.getFullYear() === tahunIni;
    })
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  // Jumlah transaksi bulan ini
  const jmlTransaksi = rows.filter(r => {
    const d = new Date(r[0] + 'T00:00:00');
    return d.getMonth() === bulanIni && d.getFullYear() === tahunIni;
  }).length;

  // Hari ini
  const totalHari = rows
    .filter(r => r[0] === hariIniStr)
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  // Minggu ini (7 hari terakhir)
  const totalMinggu = rows
    .filter(r => {
      const d = new Date(r[0] + 'T00:00:00');
      const diff = (sekarang - d) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 7;
    })
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const namaBulan = sekarang.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  document.getElementById('totalBulanIni').textContent    = formatRupiah(totalBulan);
  document.getElementById('jumlahTransaksi').textContent  = jmlTransaksi + ' transaksi';
  document.getElementById('bulanLabel').textContent       = namaBulan;
  document.getElementById('statHariIni').textContent      = formatRupiah(totalHari);
  document.getElementById('statMingguIni').textContent    = formatRupiah(totalMinggu);
}

// ---- RENDER RIWAYAT ----
function renderRiwayat() {
  const container = document.getElementById('riwayatList');
  const filter    = document.getElementById('filterKategori').value;

  // Lewati header, filter, urutkan dari terbaru
  const rows = semuaData
    .filter((r, i) => i > 0 && r[0])
    .filter(r => !filter || r[1] === filter)
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

// ---- SKELETON LOADING ----
function tampilkanSkeleton() {
  const container = document.getElementById('riwayatList');
  container.innerHTML = [1,2,3].map(() => `<div class="skeleton"></div>`).join('');
}

// ---- RESET FORM ----
function resetForm() {
  document.getElementById('inputKategori').value  = '';
  document.getElementById('inputKeterangan').value = '';
  document.getElementById('inputJumlah').value    = '';
  document.getElementById('inputTanggal').value   = formatTanggalISO(0);
}

// ---- SECURITY: escape HTML ----
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- SERVICE WORKER ----
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ Service Worker terdaftar'))
      .catch(err => console.warn('SW error:', err));
  }
}
