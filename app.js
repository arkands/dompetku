// ===========================
// DOMPETKU – app.js (FINAL + Pemasukan + Statistik + Saldo)
// ===========================

const CONFIG_KEY    = 'dompetku_script_url';
const CACHE_KEY     = 'dompetku_cache';
const DEMO_MODE_KEY = 'dompetku_demo';

let semuaData  = [];
let isDemoMode = false;
let editBaris  = -1;
let hapusBaris = -1;
let tipeForm   = 'pengeluaran';

// ---- DEMO DATA ----
const demoData = [
  ['Tanggal','Kategori','Keterangan','Jumlah','Tipe'],
  [formatTanggalISO(0), ' Makanan & Minuman', 'Sarapan nasi uduk',  15000,  'pengeluaran'],
  [formatTanggalISO(0), ' Gaji',              'Gaji bulan April', 5000000, 'pemasukan'],
  [formatTanggalISO(1), ' Transportasi',       'Gojek ke kantor',   22000,  'pengeluaran'],
  [formatTanggalISO(1), ' Belanja',            'Indomaret',         45000,  'pengeluaran'],
  [formatTanggalISO(2), ' Makanan & Minuman',  'Makan siang',       25000,  'pengeluaran'],
  [formatTanggalISO(2), ' Freelance',          'Proyek desain web', 800000, 'pemasukan'],
  [formatTanggalISO(3), ' Pulsa & Internet',   'Beli kuota 15GB',   65000,  'pengeluaran'],
  [formatTanggalISO(4), ' Kesehatan',          'Beli vitamin C',    35000,  'pengeluaran'],
  [formatTanggalISO(5), ' Hiburan',            'Netflix bulanan',   54000,  'pengeluaran'],
  [formatTanggalISO(6), ' Rumah & Utilitas',   'Bayar listrik',    180000,  'pengeluaran'],
];

// ===========================
// UTILS
// ===========================

function formatTanggalISO(daysAgo) {
  if (!daysAgo) daysAgo = 0;
  var d = new Date();
  d.setDate(d.getDate() - daysAgo);
  //pakai wakt lokal(bukan UTC)
  var y = d.gateFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var tgl = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + tgl;
}

function toISO(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth()+1).padStart(2,'0');
    var d = String(val.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+d;
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return slash[3]+'-'+slash[1].padStart(2,'0')+'-'+slash[2].padStart(2,'0');
  var dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  }
  return s;
}

function getTipe(row) {
  var tipe = String(row[4] || '').toLowerCase().trim();
  if (tipe === 'pemasukan' || tipe === 'pengeluaran') return tipe;

  // Kalau kosong, tebak dari nama kategori
  var kategoriMasuk = ['gaji','usaha','freelance','transfer','hadiah','investasi'];
  var kat = String(row[1] || '').toLowerCase();
  for (var i = 0; i < kategoriMasuk.length; i++) {
    if (kat.includes(kategoriMasuk[i])) return 'pemasukan';
  }
  return 'pengeluaran';
}

function formatTanggalDisplay(value) {
  if (!value) return '-';
  var d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRupiah(angka) {
  var num = parseInt(angka) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function getScriptUrl() { return localStorage.getItem(CONFIG_KEY) || ''; }

function showToast(pesan, tipe) {
  if (!tipe) tipe = 'success';
  var toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.className = 'toast ' + tipe;
  toast.classList.remove('hidden');
  setTimeout(function() { toast.classList.add('hidden'); }, 3500);
}

function setLoading(aktif) {
  var btn    = document.getElementById('btnSimpan');
  var text   = document.getElementById('btnText');
  var loader = document.getElementById('btnLoader');
  btn.disabled = aktif;
  text.classList.toggle('hidden', aktif);
  loader.classList.toggle('hidden', !aktif);
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===========================
// INISIALISASI
// ===========================

window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
  }, 1800);

  document.getElementById('inputTanggal').value = formatTanggalISO(0);

  // Set tanggal di header
  var hDate = document.getElementById('headerDate');
  if (hDate) {
    hDate.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  var url = getScriptUrl();
  isDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';

  if (!url && !isDemoMode) {
    setTimeout(function() {
      document.getElementById('modalConfig').classList.remove('hidden');
    }, 1900);
  } else {
    muatData();
  }

  setupEventListeners();
  setupPullToRefresh();
  registerServiceWorker();
});

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(function(c) {
        if (c.id === 'tab-' + target) { c.classList.remove('hidden'); c.classList.add('active'); }
        else { c.classList.add('hidden'); c.classList.remove('active'); }
      });
      if (target === 'statistik') renderStatistik();
      if (target === 'riwayat' && semuaData.length === 0) muatData();
    });
  });

  document.getElementById('btnSimpan').addEventListener('click', simpanTransaksi);
  document.getElementById('btnRefresh').addEventListener('click', muatData);
  document.getElementById('filterTipe').addEventListener('change', renderRiwayat);
  document.getElementById('btnSaveConfig').addEventListener('click', simpanKonfigurasi);
  document.getElementById('btnDemoMode').addEventListener('click', aktifkanDemoMode);
  document.getElementById('btnTutupEdit').addEventListener('click', tutupModalEdit);
  document.getElementById('btnSimpanEdit').addEventListener('click', simpanEdit);
  document.getElementById('modalEdit').addEventListener('click', function(e) { if (e.target === this) tutupModalEdit(); });
  document.getElementById('btnBatalHapus').addEventListener('click', tutupModalHapus);
  document.getElementById('btnKonfirmasiHapus').addEventListener('click', konfirmasiHapus);
  document.getElementById('modalHapus').addEventListener('click', function(e) { if (e.target === this) tutupModalHapus(); });
}

// ===========================
// TOGGLE TIPE FORM
// ===========================

function setTipe(tipe) {
  tipeForm = tipe;
  var btnKeluar = document.getElementById('btnTipePengeluaran');
  var btnMasuk  = document.getElementById('btnTipePemasukan');
  var grupKat   = document.getElementById('grupKategori');
  var grupMasuk = document.getElementById('grupKategoriMasuk');
  var formTitle = document.getElementById('formTitle');

  if (tipe === 'pengeluaran') {
    btnKeluar.className = 'type-btn active-keluar';
    btnMasuk.className  = 'type-btn';
    grupKat.style.display   = '';
    grupMasuk.style.display = 'none';
    formTitle.textContent   = 'Catat Pengeluaran Baru';
  } else {
    btnMasuk.className  = 'type-btn active-masuk';
    btnKeluar.className = 'type-btn';
    grupKat.style.display   = 'none';
    grupMasuk.style.display = '';
    formTitle.textContent   = 'Catat Pemasukan Baru';
  }
}

// ===========================
// KONFIGURASI & DEMO
// ===========================

function simpanKonfigurasi() {
  var url = document.getElementById('inputScriptUrl').value.trim();
  if (!url || !url.startsWith('https://script.google.com')) {
    alert('URL tidak valid!'); return;
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
  semuaData = demoData.slice();
  updateSummary(semuaData);
  renderRiwayat();
  showToast('Mode Demo aktif!', 'info');
}

// ===========================
// SIMPAN TRANSAKSI (Pengeluaran / Pemasukan)
// ===========================

async function simpanTransaksi() {
  var tanggal    = document.getElementById('inputTanggal').value;
  var keterangan = document.getElementById('inputKeterangan').value.trim();
  var jumlah     = document.getElementById('inputJumlah').value;
  var kategori   = tipeForm === 'pengeluaran'
    ? document.getElementById('inputKategori').value
    : document.getElementById('inputKategoriMasuk').value;

  if (!tanggal)                         return showToast('Tanggal harus diisi!', 'error');
  if (!kategori)                        return showToast('Pilih kategori dulu!', 'error');
  if (!keterangan)                      return showToast('Keterangan harus diisi!', 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast('Jumlah harus lebih dari 0!', 'error');

  var newRow = [tanggal, kategori, keterangan, parseInt(jumlah), tipeForm];

  if (isDemoMode) {
    semuaData.push(newRow);
    updateSummary(semuaData);
    renderRiwayat();
    renderStatistik();
    resetForm();
    showToast('Berhasil dicatat! (Mode Demo)', 'success');
    return;
  }

  var scriptUrl = getScriptUrl();
  if (!scriptUrl) return showToast('URL belum dikonfigurasi.', 'error');

  setLoading(true);
  try {
    var params = new URLSearchParams({
      action: 'post', tanggal: tanggal, kategori: kategori,
      keterangan: keterangan, jumlah: parseInt(jumlah), tipe: tipeForm
    });
    await fetch(scriptUrl + '?' + params.toString(), { method: 'GET', mode: 'no-cors' });
    semuaData.push(newRow);
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData);
    renderRiwayat();
    renderStatistik();
    resetForm();
    showToast('Berhasil disimpan!', 'success');
  } catch(err) {
    showToast('Gagal menyimpan. Cek koneksi.', 'error');
  } finally {
    setLoading(false);
  }
}

// ===========================
// MUAT DATA
// ===========================

async function muatData() {
  if (isDemoMode) {
    semuaData = demoData.slice();
    updateSummary(semuaData);
    renderRiwayat();
    renderStatistik();
    return;
  }

  var scriptUrl = getScriptUrl();
  if (!scriptUrl) return;

  tampilkanSkeleton();

  try {
    var response = await fetch(scriptUrl + '?action=get');
    if (!response.ok) throw new Error('Gagal');
    var result = await response.json();
    semuaData = result.data || [];
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData);
    renderRiwayat();
    renderStatistik();
  } catch(err) {
    var cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      semuaData = JSON.parse(cache);
      updateSummary(semuaData);
      renderRiwayat();
      renderStatistik();
      showToast('Offline - data tersimpan', 'info');
    } else {
      document.getElementById('riwayatList').innerHTML =
        '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Tidak bisa memuat data.</p></div>';
    }
  }
}

// ===========================
// UPDATE SUMMARY (Header Saldo)
// ===========================

function updateSummary(data) {
  var sekarang   = new Date();
  var bulanIni   = sekarang.getMonth();
  var tahunIni   = sekarang.getFullYear();
  var hariIniStr = formatTanggalISO(0);

  // Saldo = akumulasi SEMUA transaksi dari awal
  var totalMasukSemua  = 0;
  var totalKeluarSemua = 0;

  // Statistik header = bulan berjalan saja
  var totalMasukBulan  = 0;
  var totalKeluarBulan = 0;

  var totalHari   = 0;
  var totalMinggu = 0;

  for (var i = 1; i < data.length; i++) {
    var r      = data[i];
    var iso    = toISO(r[0]);
    var jumlah = parseInt(r[3]) || 0;
    var tipe   = getTipe(r);
    var d      = new Date(iso + 'T00:00:00');

    // Saldo dihitung dari SEMUA transaksi sejak awal
    if (tipe === 'pemasukan') totalMasukSemua  += jumlah;
    else                      totalKeluarSemua += jumlah;

    // Pemasukan & pengeluaran header = bulan ini saja
    if (d.getMonth() === bulanIni && d.getFullYear() === tahunIni) {
      if (tipe === 'pemasukan') totalMasukBulan  += jumlah;
      else                      totalKeluarBulan += jumlah;
    }

    if (iso === hariIniStr && tipe !== 'pemasukan') totalHari += jumlah;

    var diff = (sekarang - d) / (1000*60*60*24);
    if (diff >= 0 && diff < 7 && tipe !== 'pemasukan') totalMinggu += jumlah;
  }

  var saldo     = totalMasukSemua - totalKeluarSemua;
  var namaBulan = sekarang.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Saldo pakai semua transaksi
  var elSaldo = document.getElementById('saldoSekarang');
  elSaldo.textContent = formatRupiah(saldo);
  elSaldo.className   = saldo < 0 ? 'saldo-amount negative' : 'saldo-amount';

  // Header mini card pakai bulan ini
  document.getElementById('totalMasukHeader').textContent  = formatRupiah(totalMasukBulan);
  document.getElementById('totalKeluarHeader').textContent = formatRupiah(totalKeluarBulan);
  document.getElementById('bulanLabelHeader').textContent  = namaBulan;
  document.getElementById('statHariIni').textContent       = formatRupiah(totalHari);
  document.getElementById('statMingguIni').textContent     = formatRupiah(totalMinggu);
}

// ===========================
// RENDER RIWAYAT
// ===========================

function renderRiwayat() {
  var container = document.getElementById('riwayatList');
  var filter    = document.getElementById('filterTipe').value;

  var rows = [];
  for (var i = 1; i < semuaData.length; i++) {
    var r    = semuaData[i];
    var iso  = toISO(r[0]);
    var tipe = getTipe(r);
    if (!iso) continue;
    if (filter && tipe !== filter) continue;
    rows.push({ row: [iso, r[1], r[2], r[3], tipe], idx: i });
  }

  rows.sort(function(a, b) { return new Date(b.row[0]) - new Date(a.row[0]); });

  if (rows.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>Belum ada data transaksi.</p></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r    = rows[i].row;
    var idx  = rows[i].idx;
    var tipe = r[4];
    var kelasItem   = tipe === 'pemasukan' ? 'tipe-masuk' : 'tipe-keluar';
    var kelasJumlah = tipe === 'pemasukan' ? 'masuk' : 'keluar';
    var prefix      = tipe === 'pemasukan' ? '+' : '-';
    html +=
      '<div class="riwayat-item ' + kelasItem + '">' +
        '<div class="riwayat-left">' +
          '<div class="riwayat-kategori">' + escapeHtml(r[1]) + '</div>' +
          '<div class="riwayat-ket">' + escapeHtml(r[2]) + '</div>' +
          '<div class="riwayat-tanggal">📅 ' + formatTanggalDisplay(r[0]) + '</div>' +
        '</div>' +
        '<div class="riwayat-right">' +
          '<div class="riwayat-jumlah ' + kelasJumlah + '">' + prefix + formatRupiah(r[3]) + '</div>' +
          '<div class="riwayat-actions">' +
            '<button class="btn-aksi btn-edit" onclick="bukaModalEdit(' + idx + ')" title="Edit">✏️</button>' +
            '<button class="btn-aksi btn-hapus" onclick="bukaModalHapus(' + idx + ')" title="Hapus">🗑️</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  container.innerHTML = html;
}

// ===========================
// RENDER STATISTIK
// ===========================

function renderStatistik() {
  var sekarang = new Date();
  var bulanIni = sekarang.getMonth();
  var tahunIni = sekarang.getFullYear();

  var totalMasuk  = 0;
  var totalKeluar = 0;
  var jmlTransaksi = 0;
  var katMap = {};

  for (var i = 1; i < semuaData.length; i++) {
    var r      = semuaData[i];
    var iso    = toISO(r[0]);
    var jumlah = parseInt(r[3]) || 0;
    var tipe   = getTipe(r);
    var d      = new Date(iso + 'T00:00:00');

    if (d.getMonth() === bulanIni && d.getFullYear() === tahunIni) {
      jmlTransaksi++;
      if (tipe === 'pemasukan') totalMasuk  += jumlah;
      else {
        totalKeluar += jumlah;
        var kat = String(r[1] || 'Lainnya');
        katMap[kat] = (katMap[kat] || 0) + jumlah;
      }
    }
  }

  var saldo = totalMasuk - totalKeluar;
  document.getElementById('statSaldo').textContent        = formatRupiah(saldo);
  document.getElementById('statTotalMasuk').textContent   = formatRupiah(totalMasuk);
  document.getElementById('statTotalKeluar').textContent  = formatRupiah(totalKeluar);
  document.getElementById('statJmlTransaksi').textContent = jmlTransaksi + 'x';

  // Grafik 6 bulan
  var chartEl = document.getElementById('chartBatang');
  var bulanData = [];
  for (var b = 5; b >= 0; b--) {
    var tgl = new Date(tahunIni, bulanIni - b, 1);
    var bln = tgl.getMonth();
    var thn = tgl.getFullYear();
    var msk = 0; var klr = 0;
    for (var i = 1; i < semuaData.length; i++) {
      var r   = semuaData[i];
      var iso = toISO(r[0]);
      var dd  = new Date(iso + 'T00:00:00');
      if (dd.getMonth() === bln && dd.getFullYear() === thn) {
        var jml  = parseInt(r[3]) || 0;
        var tipe = getTipe(r);
        if (tipe === 'pemasukan') msk += jml; else klr += jml;
      }
    }
    bulanData.push({
      label: tgl.toLocaleDateString('id-ID', { month: 'short' }),
      masuk: msk, keluar: klr
    });
  }

  var maxVal = 1;
  for (var b = 0; b < bulanData.length; b++) {
    if (bulanData[b].masuk  > maxVal) maxVal = bulanData[b].masuk;
    if (bulanData[b].keluar > maxVal) maxVal = bulanData[b].keluar;
  }

  var chartHtml = '';
  for (var b = 0; b < bulanData.length; b++) {
    var bd       = bulanData[b];
    var hMasuk  = Math.round((bd.masuk  / maxVal) * 90);
    var hKeluar = Math.round((bd.keluar / maxVal) * 90);
    chartHtml +=
      '<div class="chart-col">' +
        '<div class="chart-bars">' +
          '<div class="chart-bar masuk"  style="height:' + hMasuk  + 'px;"></div>' +
          '<div class="chart-bar keluar" style="height:' + hKeluar + 'px;"></div>' +
        '</div>' +
        '<div class="chart-bulan">' + bd.label + '</div>' +
      '</div>';
  }
  chartEl.innerHTML = chartHtml;

  // Top kategori
  var katArr = [];
  for (var k in katMap) katArr.push({ kat: k, jumlah: katMap[k] });
  katArr.sort(function(a, b) { return b.jumlah - a.jumlah; });
  var top5 = katArr.slice(0, 5);

  var maxKat = top5.length > 0 ? top5[0].jumlah : 1;
  var katHtml = '';
  if (top5.length === 0) {
    katHtml = '<p style="color:#8888aa;font-size:13px;text-align:center;padding:16px 0;">Belum ada data</p>';
  } else {
    for (var k = 0; k < top5.length; k++) {
      var item  = top5[k];
      var pct   = Math.round((item.jumlah / maxKat) * 100);
      var icon  = item.kat.split(' ')[0] || '🔧';
      var nama  = item.kat.split(' ').slice(1).join(' ') || item.kat;
      katHtml +=
        '<div class="kat-item">' +
          '<div class="kat-icon">' + icon + '</div>' +
          '<div class="kat-bar-wrap">' +
            '<div class="kat-label-row"><span>' + escapeHtml(nama) + '</span><span>' + formatRupiah(item.jumlah) + '</span></div>' +
            '<div class="kat-bar-bg"><div class="kat-bar-fill" style="width:' + pct + '%;"></div></div>' +
          '</div>' +
        '</div>';
    }
  }
  document.getElementById('topKategori').innerHTML = katHtml;
}

// ===========================
// MODAL EDIT
// ===========================

function bukaModalEdit(idx) {
  var r = semuaData[idx];
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
  var tanggal    = document.getElementById('editTanggal').value;
  var kategori   = document.getElementById('editKategori').value;
  var keterangan = document.getElementById('editKeterangan').value.trim();
  var jumlah     = document.getElementById('editJumlah').value;

  if (!tanggal)                         return showToast('Tanggal harus diisi!', 'error');
  if (!kategori)                        return showToast('Pilih kategori!', 'error');
  if (!keterangan)                      return showToast('Keterangan harus diisi!', 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast('Jumlah harus lebih dari 0!', 'error');

  var tipeAsal = semuaData[editBaris][4] || 'pengeluaran';
  semuaData[editBaris] = [tanggal, kategori, keterangan, parseInt(jumlah), tipeAsal];

  if (isDemoMode) {
    updateSummary(semuaData); renderRiwayat(); renderStatistik();
    tutupModalEdit(); showToast('Data berhasil diubah! (Demo)', 'success'); return;
  }

  var scriptUrl     = getScriptUrl();
  var noBarisSheets = editBaris + 1;
  try {
    var params = new URLSearchParams({
      action: 'edit', baris: noBarisSheets, tanggal: tanggal,
      kategori: kategori, keterangan: keterangan, jumlah: parseInt(jumlah), tipe: tipeAsal
    });
    await fetch(scriptUrl + '?' + params.toString(), { method: 'GET', mode: 'no-cors' });
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData); renderRiwayat(); renderStatistik();
    tutupModalEdit(); showToast('Data berhasil diubah!', 'success');
  } catch(err) {
    showToast('Gagal mengubah data.', 'error');
  }
}

// ===========================
// MODAL HAPUS (OPTIMISTIC UI)
// ===========================

function bukaModalHapus(idx) {
  var r = semuaData[idx];
  if (!r) return;
  hapusBaris = idx;
  document.getElementById('hapusInfo').textContent =
    r[1] + ' - ' + r[2] + ' (' + formatRupiah(r[3]) + ')';
  document.getElementById('modalHapus').classList.remove('hidden');
}

function tutupModalHapus() {
  document.getElementById('modalHapus').classList.add('hidden');
  hapusBaris = -1;
}

async function konfirmasiHapus() {
  if (hapusBaris < 0) return;

  var dataCadangan   = semuaData.slice();
  var idxYangDihapus = hapusBaris;

  semuaData.splice(hapusBaris, 1);
  localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
  updateSummary(semuaData);
  renderRiwayat();
  renderStatistik();
  tutupModalHapus();
  showToast('Data berhasil dihapus!', 'success');

  if (isDemoMode) return;

  var scriptUrl     = getScriptUrl();
  var noBarisSheets = idxYangDihapus + 1;
  try {
    var params = new URLSearchParams({ action: 'hapus', baris: noBarisSheets });
    await fetch(scriptUrl + '?' + params.toString(), { method: 'GET', mode: 'no-cors' });
  } catch(err) {
    semuaData = dataCadangan;
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData); renderRiwayat(); renderStatistik();
    showToast('Gagal menghapus. Data dikembalikan.', 'error');
  }
}

// ===========================
// PULL TO REFRESH
// ===========================

function setupPullToRefresh() {
  var area      = document.querySelector('.main');
  var indikator = document.getElementById('pullIndikator');
  var startY    = 0;
  var isPulling = false;

  area.addEventListener('touchstart', function(e) {
    if (area.scrollTop === 0) { startY = e.touches[0].clientY; isPulling = true; }
  }, { passive: true });

  area.addEventListener('touchmove', function(e) {
    if (!isPulling) return;
    var jarak = e.touches[0].clientY - startY;
    if (jarak > 0 && jarak < 150) {
      indikator.style.height  = (jarak * 0.4) + 'px';
      indikator.style.opacity = jarak / 80;
      indikator.textContent   = jarak > 80 ? '🔄 Lepaskan untuk refresh...' : '⬇️ Tarik untuk refresh...';
    }
  }, { passive: true });

  area.addEventListener('touchend', function(e) {
    if (!isPulling) return;
    isPulling = false;
    var jarak = e.changedTouches[0].clientY - startY;
    indikator.style.height  = '0px';
    indikator.style.opacity = '0';
    if (jarak > 80) {
      indikator.style.height  = '36px';
      indikator.style.opacity = '1';
      indikator.textContent   = '⏳ Memuat data...';
      muatData().finally(function() {
        setTimeout(function() {
          indikator.style.height  = '0px';
          indikator.style.opacity = '0';
          indikator.textContent   = '';
        }, 800);
      });
    }
  });
}

// ===========================
// HELPERS
// ===========================

function tampilkanSkeleton() {
  document.getElementById('riwayatList').innerHTML =
    '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
}

function resetForm() {
  document.getElementById('inputKategori').value      = '';
  document.getElementById('inputKategoriMasuk').value = '';
  document.getElementById('inputKeterangan').value    = '';
  document.getElementById('inputJumlah').value        = '';
  document.getElementById('inputTanggal').value       = formatTanggalISO(0);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(function() { console.log('Service Worker terdaftar'); })
      .catch(function(err) { console.warn('SW error:', err); });
  }
}
