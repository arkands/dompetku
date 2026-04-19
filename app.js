// ===========================
// DOMPETKU – app.js (+ Fitur Edit & Hapus)
// ===========================

const CONFIG_KEY    = 'dompetku_script_url';
const CACHE_KEY     = 'dompetku_cache';
const DEMO_MODE_KEY = 'dompetku_demo';

let semuaData  = [];
let isDemoMode = false;
let editBaris  = -1;
let hapusBaris = -1;

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

// Handles: "4/15/2026", "2026-04-15", Date object
function toISO(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth()+1).padStart(2,'0');
    const d = String(val.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+d;
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return slash[3]+'-'+slash[1].padStart(2,'0')+'-'+slash[2].padStart(2,'0');
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
  // Tabs
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

  // Modal Edit
  document.getElementById('btnTutupEdit').addEventListener('click', tutupModalEdit);
  document.getElementById('btnSimpanEdit').addEventListener('click', simpanEdit);
  document.getElementById('modalEdit').addEventListener('click', function(e) {
    if (e.target === this) tutupModalEdit();
  });

  // Modal Hapus
  document.getElementById('btnBatalHapus').addEventListener('click', tutupModalHapus);
  document.getElementById('btnKonfirmasiHapus').addEventListener('click', konfirmasiHapus);
  document.getElementById('modalHapus').addEventListener('click', function(e) {
    if (e.target === this) tutupModalHapus();
  });
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
// SIMPAN PENGELUARAN BARU
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

  if (isDemoMode) {
    semuaData.push(newRow);
    updateSummary(semuaData);
    renderRiwayat();
    resetForm();
    showToast('✅ Pengeluaran berhasil dicatat! (Mode Demo)', 'success');
    return;
  }

  const scriptUrl = getScriptUrl();
  if (!scriptUrl) return showToast('⚠️ URL belum dikonfigurasi.', 'error');

  setLoading(true);
  try {
    const params = new URLSearchParams({
      action: 'post', tanggal, kategori, keterangan, jumlah: parseInt(jumlah)
    });
    await fetch(`${scriptUrl}?${params.toString()}`, { method: 'GET', mode: 'no-cors' });
    semuaData.push(newRow);
    updateSummary(semuaData);
    renderRiwayat();
    resetForm();
    showToast('✅ Pengeluaran berhasil disimpan!', 'success');
  } catch (err) {
    showToast('❌ Gagal menyimpan. Cek koneksi internet.', 'error');
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
    if (!response.ok) throw new Error('Gagal');
    const result = await response.json();
    semuaData = result.data || [];
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData);
    renderRiwayat();
  } catch (err) {
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
// UPDATE SUMMARY
// ===========================

function updateSummary(data) {
  const rows = data
    .filter((r, i) => i > 0 && r[3] !== '' && r[3] != null)
    .map(r => [toISO(r[0]), r[1], r[2], r[3]]);

  const sekarang   = new Date();
  const bulanIni   = sekarang.getMonth();
  const tahunIni   = sekarang.getFullYear();
  const hariIniStr = formatTanggalISO(0);

  const totalBulan = rows
    .filter(r => { const d = new Date(r[0]+'T00:00:00'); return d.getMonth()===bulanIni && d.getFullYear()===tahunIni; })
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const jmlTransaksi = rows
    .filter(r => { const d = new Date(r[0]+'T00:00:00'); return d.getMonth()===bulanIni && d.getFullYear()===tahunIni; })
    .length;

  const totalHari = rows
    .filter(r => r[0] === hariIniStr)
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const totalMinggu = rows
    .filter(r => { const d = new Date(r[0]+'T00:00:00'); const diff=(sekarang-d)/(1000*60*60*24); return diff>=0&&diff<7; })
    .reduce((sum, r) => sum + (parseInt(r[3]) || 0), 0);

  const namaBulan = sekarang.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  document.getElementById('totalBulanIni').textContent   = formatRupiah(totalBulan);
  document.getElementById('jumlahTransaksi').textContent = jmlTransaksi + ' transaksi';
  document.getElementById('bulanLabel').textContent      = namaBulan;
  document.getElementById('statHariIni').textContent     = formatRupiah(totalHari);
  document.getElementById('statMingguIni').textContent   = formatRupiah(totalMinggu);
}

// ===========================
// RENDER RIWAYAT + tombol Edit & Hapus
// ===========================

function renderRiwayat() {
  const container = document.getElementById('riwayatList');
  const filter    = document.getElementById('filterKategori').value;

  const rows = semuaData
    .map((r, i) => ({ row: r, idx: i }))
    .filter(({ row, idx }) => idx > 0 && row[0])
    .map(({ row, idx }) => ({ row: [toISO(row[0]), row[1], row[2], row[3]], idx }))
    .filter(({ row }) => row[0] && (!filter || row[1] === filter))
    .sort((a, b) => new Date(b.row[0]) - new Date(a.row[0]));

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Belum ada data pengeluaran.<br/>Mulai catat di tab ✏️ Catat!</p>
      </div>`;
    return;
  }

  container.innerHTML = rows.map(({ row: r, idx }) => `
    <div class="riwayat-item">
      <div class="riwayat-left">
        <div class="riwayat-kategori">${escapeHtml(r[1])}</div>
        <div class="riwayat-ket">${escapeHtml(r[2])}</div>
        <div class="riwayat-tanggal">📅 ${formatTanggalDisplay(r[0])}</div>
      </div>
      <div class="riwayat-right">
        <div class="riwayat-jumlah">${formatRupiah(r[3])}</div>
        <div class="riwayat-actions">
          <button class="btn-aksi btn-edit" onclick="bukaModalEdit(${idx})" title="Edit">✏️</button>
          <button class="btn-aksi btn-hapus" onclick="bukaModalHapus(${idx})" title="Hapus">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===========================
// MODAL EDIT
// ===========================

function bukaModalEdit(idx) {
  const r = semuaData[idx];
  if (!r) return;
  editBaris = idx;
  document.getElementById('editTanggal').value    = toISO(r[0]);
  document.getElementById('editKategori').value   = r[1];
  document.getElementById('editKeterangan').value = r[2];
  document.getElementById('editJumlah').value     = r[3];
  document.getElementById('modalEdit').classList.remove('hidden');
}

function tutupModalEdit() {
  document.getElementById('modalEdit').classList.add('hidden');
  editBaris = -1;
}

async function simpanEdit() {
  const tanggal    = document.getElementById('editTanggal').value;
  const kategori   = document.getElementById('editKategori').value;
  const keterangan = document.getElementById('editKeterangan').value.trim();
  const jumlah     = document.getElementById('editJumlah').value;

  if (!tanggal)                         return showToast('⚠️ Tanggal harus diisi!', 'error');
  if (!kategori)                        return showToast('⚠️ Pilih kategori dulu!', 'error');
  if (!keterangan)                      return showToast('⚠️ Keterangan harus diisi!', 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast('⚠️ Jumlah harus lebih dari 0!', 'error');

  semuaData[editBaris] = [tanggal, kategori, keterangan, parseInt(jumlah)];

  if (isDemoMode) {
    updateSummary(semuaData);
    renderRiwayat();
    tutupModalEdit();
    showToast('✅ Data berhasil diubah! (Mode Demo)', 'success');
    return;
  }

  const scriptUrl    = getScriptUrl();
  const noBarisSheets = editBaris + 1;

  try {
    const params = new URLSearchParams({
      action: 'edit', baris: noBarisSheets,
      tanggal, kategori, keterangan, jumlah: parseInt(jumlah)
    });
    await fetch(`${scriptUrl}?${params.toString()}`, { method: 'GET', mode: 'no-cors' });
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData);
    renderRiwayat();
    tutupModalEdit();
    showToast('✅ Data berhasil diubah!', 'success');
  } catch (err) {
    showToast('❌ Gagal mengubah data.', 'error');
  }
}

// ===========================
// MODAL HAPUS
// ===========================

function bukaModalHapus(idx) {
  const r = semuaData[idx];
  if (!r) return;
  hapusBaris = idx;
  document.getElementById('hapusInfo').textContent =
    `${r[1]} – ${r[2]} (${formatRupiah(r[3])})`;
  document.getElementById('modalHapus').classList.remove('hidden');
}

function tutupModalHapus() {
  document.getElementById('modalHapus').classList.add('hidden');
  hapusBaris = -1;
}

async function konfirmasiHapus() {
  if (hapusBaris < 0) return;

  // Simpan data dulu sebagai cadangan kalau gagal
  const dataCadangan = [...semuaData];
  const idxYangDihapus = hapusBaris;

  // ⚡ LANGSUNG hapus dari tampilan dulu (Optimistic UI)
  semuaData.splice(hapusBaris, 1);
  localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
  updateSummary(semuaData);
  renderRiwayat();
  tutupModalHapus();
  showToast('🗑️ Data berhasil dihapus!', 'success');

  // Mode Demo selesai sampai sini
  if (isDemoMode) return;

  // Di background → kirim perintah ke Sheets
  const scriptUrl     = getScriptUrl();
  const noBarisSheets = idxYangDihapus + 1;

  try {
    const params = new URLSearchParams({
      action: 'hapus',
      baris : noBarisSheets
    });
    await fetch(`${scriptUrl}?${params.toString()}`, {
      method: 'GET',
      mode  : 'no-cors'
    });
    // Sukses! Tidak perlu lakukan apa-apa karena tampilan sudah diupdate
  } catch (err) {
    // Kalau gagal → kembalikan data seperti semula
    semuaData = dataCadangan;
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData);
    renderRiwayat();
    showToast('❌ Gagal menghapus. Data dikembalikan.', 'error');
  }
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
