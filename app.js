// ===========================
// DOMPETKU – app.js v3 (Light Mode)
// ===========================

const CONFIG_KEY    = 'dompetku_script_url';
const CACHE_KEY     = 'dompetku_cache';
const DEMO_MODE_KEY = 'dompetku_demo';

let semuaData     = [];
let isDemoMode    = false;
let editBaris     = -1;
let hapusBaris    = -1;
let tipeForm      = 'pengeluaran';
let kategoriPilih = '';
let filterTipe    = '';
let searchQuery   = '';

// ---- KATEGORI ICONS ----
var katIkon = {
  'Makanan & Minuman': 'ti-tools-kitchen-2',
  'Transportasi': 'ti-car',
  'Belanja': 'ti-shopping-bag',
  'Kesehatan': 'ti-heartbeat',
  'Pendidikan': 'ti-book',
  'Hiburan': 'ti-music',
  'Rumah & Utilitas': 'ti-home',
  'Pakaian': 'ti-shirt',
  'Pulsa & Internet': 'ti-wifi',
  'Gaji': 'ti-briefcase',
  'Usaha': 'ti-building-store',
  'Freelance': 'ti-laptop',
  'Transfer': 'ti-send',
  'Hadiah': 'ti-gift',
  'Investasi': 'ti-trending-up',
  'Lainnya': 'ti-dots',
};

function getIkon(kat) {
  for (var k in katIkon) {
    if (String(kat).toLowerCase().includes(k.toLowerCase())) return katIkon[k];
  }
  return 'ti-circle';
}

// ---- DEMO DATA ----
const demoData = [
  ['Tanggal','Kategori','Keterangan','Jumlah','Tipe'],
  [formatTanggalISO(0), 'Makanan & Minuman', 'Sarapan nasi uduk',  15000,  'pengeluaran'],
  [formatTanggalISO(0), 'Gaji',              'Gaji bulan ini',    5000000, 'pemasukan'],
  [formatTanggalISO(1), 'Transportasi',      'Gojek ke kantor',   22000,  'pengeluaran'],
  [formatTanggalISO(1), 'Belanja',           'Indomaret',         45000,  'pengeluaran'],
  [formatTanggalISO(2), 'Makanan & Minuman', 'Makan siang',       25000,  'pengeluaran'],
  [formatTanggalISO(2), 'Freelance',         'Proyek desain web', 800000, 'pemasukan'],
  [formatTanggalISO(3), 'Pulsa & Internet',  'Beli kuota 15GB',   65000,  'pengeluaran'],
  [formatTanggalISO(4), 'Kesehatan',         'Beli vitamin C',    35000,  'pengeluaran'],
  [formatTanggalISO(5), 'Hiburan',           'Netflix bulanan',   54000,  'pengeluaran'],
  [formatTanggalISO(6), 'Rumah & Utilitas',  'Bayar listrik',    180000,  'pengeluaran'],
];

// ===========================
// UTILS
// ===========================

function formatTanggalISO(daysAgo) {
  if (!daysAgo) daysAgo = 0;
  var d = new Date();
  d.setDate(d.getDate() - daysAgo);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var t = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + t;
}

function toISO(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.getFullYear() + '-' + String(val.getMonth()+1).padStart(2,'0') + '-' + String(val.getDate()).padStart(2,'0');
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return slash[3]+'-'+slash[1].padStart(2,'0')+'-'+slash[2].padStart(2,'0');
  var dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  return s;
}

function getTipe(row) {
  var tipe = String(row[4] || '').toLowerCase().trim();
  if (tipe === 'pemasukan' || tipe === 'pengeluaran') return tipe;
  var mList = ['gaji','usaha','freelance','transfer','hadiah','investasi'];
  var kat = String(row[1] || '').toLowerCase();
  for (var i = 0; i < mList.length; i++) { if (kat.includes(mList[i])) return 'pemasukan'; }
  return 'pengeluaran';
}

function formatTanggalDisplay(value) {
  if (!value) return '-';
  var d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function labelRelatif(iso) {
  if (iso === formatTanggalISO(0)) return t('today');
  if (iso === formatTanggalISO(1)) return t('yesterday');
  return formatTanggalDisplay(iso);
}

function formatRupiah(angka) {
  return 'Rp ' + (parseInt(angka) || 0).toLocaleString('id-ID');
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
  var btn = document.getElementById('btnSimpan');
  document.getElementById('btnText').classList.toggle('hidden', aktif);
  document.getElementById('btnLoader').classList.toggle('hidden', !aktif);
  btn.disabled = aktif;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===========================
// INIT
// ===========================

window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
  }, 1800);

  document.getElementById('inputTanggal').value = formatTanggalISO(0);

  var now = new Date();
  var dateStr = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  ['headerDate','headerDateDesktop'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = dateStr;
  });

  // Greeting handled by applyTranslations()

  var url = getScriptUrl();
  isDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';

  if (!url && !isDemoMode) {
    setTimeout(function() { document.getElementById('modalConfig').classList.remove('hidden'); }, 1900);
  } else {
    muatData();
  }

  setupEventListeners();
  setupPullToRefresh();
  setupLangPicker();
  applyTranslations();
  registerServiceWorker();
});

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
  // Tabs — both bottom nav and sidebar
  document.querySelectorAll('.bnav-tab, .nav-item').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      if (!target) return;
      document.querySelectorAll('.bnav-tab, .nav-item').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('[data-tab="' + target + '"]').forEach(function(t) { t.classList.add('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) {
        if (c.id === 'tab-' + target) { c.classList.remove('hidden'); c.classList.add('active'); }
        else { c.classList.add('hidden'); c.classList.remove('active'); }
      });
      if (target === 'statistik') renderStatistik();
      if (target === 'riwayat' && semuaData.length === 0) muatData();
    });
  });

  // Cat chips
  document.querySelectorAll('.cat-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      chip.parentElement.querySelectorAll('.cat-chip').forEach(function(c) {
        c.classList.remove('active','masuk-active');
      });
      chip.classList.add('active');
      if (tipeForm === 'pemasukan') chip.classList.add('masuk-active');
      kategoriPilih = chip.dataset.cat;
    });
  });

  document.getElementById('btnSimpan').addEventListener('click', simpanTransaksi);
  document.getElementById('btnRefresh').addEventListener('click', muatData);

  document.getElementById('searchInput').addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    renderRiwayat();
  });

  document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      filterTipe = chip.dataset.filter;
      renderRiwayat();
    });
  });

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
// TOGGLE TIPE
// ===========================

function setTipe(tipe) {
  tipeForm = tipe;
  kategoriPilih = '';
  var bK = document.getElementById('btnTipePengeluaran');
  var bM = document.getElementById('btnTipePemasukan');
  var cK = document.getElementById('catsPengeluaran');
  var cM = document.getElementById('catsPemasukan');
  document.querySelectorAll('.cat-chip').forEach(function(c) { c.classList.remove('active','masuk-active'); });
  if (tipe === 'pengeluaran') {
    bK.className = 'type-btn active-keluar';
    bM.className = 'type-btn';
    cK.classList.remove('hidden');
    cM.classList.add('hidden');
  } else {
    bM.className = 'type-btn active-masuk';
    bK.className = 'type-btn';
    cM.classList.remove('hidden');
    cK.classList.add('hidden');
  }
}

// ===========================
// CONFIG & DEMO
// ===========================

function simpanKonfigurasi() {
  var url = document.getElementById('inputScriptUrl').value.trim();
  if (!url || !url.startsWith('https://script.google.com')) { alert('URL tidak valid!'); return; }
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
  updateSummary(semuaData); renderRecent(); renderRiwayat();
  showToast(t('toastDemo'), 'info');
}

// ===========================
// SIMPAN TRANSAKSI
// ===========================

async function simpanTransaksi() {
  var tanggal    = document.getElementById('inputTanggal').value;
  var keterangan = document.getElementById('inputKeterangan').value.trim();
  var jumlah     = document.getElementById('inputJumlah').value;
  var kategori   = kategoriPilih;

  if (!tanggal)                         return showToast(t('valTanggal'), 'error');
  if (!kategori)                        return showToast(t('valKategori'), 'error');
  if (!keterangan)                      return showToast(t('valKeterangan'), 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast(t('valJumlah'), 'error');

  var newRow = [tanggal, kategori, keterangan, parseInt(jumlah), tipeForm];

  if (isDemoMode) {
    semuaData.push(newRow);
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
    resetForm(); showToast(t('toastSavedDemo'), 'success'); return;
  }

  var scriptUrl = getScriptUrl();
  if (!scriptUrl) return showToast(t('valTanggal').replace('Tanggal', 'URL'), 'error');

  setLoading(true);
  try {
    var params = new URLSearchParams({
      action:'post', tanggal:tanggal, kategori:kategori,
      keterangan:keterangan, jumlah:parseInt(jumlah), tipe:tipeForm
    });
    await fetch(scriptUrl + '?' + params.toString(), { method:'GET', mode:'no-cors' });
    semuaData.push(newRow);
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
    resetForm(); showToast(t('toastSaved'), 'success');
  } catch(err) {
    showToast(t('toastSaveFail'), 'error');
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
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik(); return;
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
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
  } catch(err) {
    var cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      semuaData = JSON.parse(cache);
      updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
      showToast(t('toastOffline'), 'info');
    } else {
      document.getElementById('riwayatList').innerHTML = '<div class="empty-state"><p>Tidak bisa memuat data.</p></div>';
    }
  }
}

// ===========================
// UPDATE SUMMARY
// ===========================

function updateSummary(data) {
  var now      = new Date();
  var bulanIni = now.getMonth();
  var tahunIni = now.getFullYear();
  var hariIni  = formatTanggalISO(0);

  var masukSemua = 0; var keluarSemua = 0;
  var masukBulan = 0; var keluarBulan = 0;
  var totalHari = 0;  var totalMinggu = 0;

  for (var i = 1; i < data.length; i++) {
    var r      = data[i];
    var iso    = toISO(r[0]);
    var jumlah = parseInt(r[3]) || 0;
    var tipe   = getTipe(r);
    var d      = new Date(iso + 'T00:00:00');

    if (tipe === 'pemasukan') masukSemua += jumlah;
    else keluarSemua += jumlah;

    if (d.getMonth() === bulanIni && d.getFullYear() === tahunIni) {
      if (tipe === 'pemasukan') masukBulan += jumlah;
      else keluarBulan += jumlah;
    }
    if (iso === hariIni && tipe !== 'pemasukan') totalHari += jumlah;
    var diff = (now - d) / (1000*60*60*24);
    if (diff >= 0 && diff < 7 && tipe !== 'pemasukan') totalMinggu += jumlah;
  }

  var saldo = masukSemua - keluarSemua;
  var elSaldo = document.getElementById('saldoSekarang');
  elSaldo.textContent = formatRupiah(saldo);
  elSaldo.className   = saldo < 0 ? 'saldo-amount negative' : 'saldo-amount';

  document.getElementById('totalMasukHeader').textContent  = formatRupiah(masukBulan);
  document.getElementById('totalKeluarHeader').textContent = formatRupiah(keluarBulan);
  document.getElementById('bulanLabelHeader').textContent  = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  document.getElementById('statHariIni').textContent       = formatRupiah(totalHari);
  document.getElementById('statMingguIni').textContent     = formatRupiah(totalMinggu);
}

// ===========================
// RENDER RECENT
// ===========================

function renderRecent() {
  var container = document.getElementById('recentList');
  var rows = [];
  for (var i = 1; i < semuaData.length; i++) {
    var r = semuaData[i];
    var iso = toISO(r[0]);
    if (!iso) continue;
    rows.push({ row: [iso, r[1], r[2], r[3], getTipe(r)], idx: i });
  }
  rows.sort(function(a,b) { return new Date(b.row[0]) - new Date(a.row[0]); });
  rows = rows.slice(0, 3);

  if (rows.length === 0) {
    container.innerHTML = '<p class="empty-mini">' + t('noTransaction') + '</p>'; return;
  }

  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i].row; var tipe = r[4];
    var ic = tipe === 'pemasukan' ? 'm' : 'k';
    var ikon = getIkon(r[1]);
    var prefix = tipe === 'pemasukan' ? '+' : '-';
    html +=
      '<div class="mini-trx">' +
        '<div class="mini-trx-icon ' + ic + '"><i class="ti ' + ikon + '"></i></div>' +
        '<div class="mini-trx-body">' +
          '<div class="mini-trx-name">' + escapeHtml(r[2]) + '</div>' +
          '<div class="mini-trx-cat">' + getCatKey(r[1]) + ' &middot; ' + labelRelatif(r[0]) + '</div>' +
        '</div>' +
        '<div class="mini-trx-amt ' + ic + '">' + prefix + formatRupiah(r[3]) + '</div>' +
      '</div>';
  }
  container.innerHTML = html;
}

// ===========================
// RENDER RIWAYAT
// ===========================

function renderRiwayat() {
  var container = document.getElementById('riwayatList');
  var rows = [];
  for (var i = 1; i < semuaData.length; i++) {
    var r = semuaData[i]; var iso = toISO(r[0]); var tipe = getTipe(r);
    if (!iso) continue;
    if (filterTipe && tipe !== filterTipe) continue;
    if (searchQuery) {
      if (!(String(r[1]) + ' ' + String(r[2])).toLowerCase().includes(searchQuery)) continue;
    }
    rows.push({ row: [iso, r[1], r[2], r[3], tipe], idx: i });
  }
  rows.sort(function(a,b) { return new Date(b.row[0]) - new Date(a.row[0]); });

  if (rows.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="ti ti-inbox" style="font-size:32px;color:var(--muted);margin-bottom:10px;display:block;"></i><p>' + t('noMatch') + '</p></div>';
    return;
  }

  var html = ''; var lastLabel = null;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i].row; var idx = rows[i].idx; var tipe = r[4];
    var dateLabel = labelRelatif(r[0]);
    if (dateLabel !== lastLabel) {
      html += '<div class="trx-date-label">' + dateLabel + '</div>';
      lastLabel = dateLabel;
    }
    var ic    = tipe === 'pemasukan' ? 'm' : 'k';
    var kelas = tipe === 'pemasukan' ? 'masuk' : 'keluar';
    var tipeItem = tipe === 'pemasukan' ? 'tipe-masuk' : 'tipe-keluar';
    var prefix = tipe === 'pemasukan' ? '+' : '-';
    var ikon = getIkon(r[1]);
    html +=
      '<div class="riwayat-item ' + tipeItem + '">' +
        '<div class="riwayat-left">' +
          '<div class="riwayat-icon ' + ic + '"><i class="ti ' + ikon + '"></i></div>' +
          '<div class="riwayat-info">' +
            '<div class="riwayat-kategori">' + getCatKey(r[1]) + '</div>' +
            '<div class="riwayat-ket">' + escapeHtml(r[2]) + '</div>' +
            '<div class="riwayat-tanggal">' + formatTanggalDisplay(r[0]) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="riwayat-right">' +
          '<div class="riwayat-jumlah ' + kelas + '">' + prefix + formatRupiah(r[3]) + '</div>' +
          '<div class="riwayat-actions">' +
            '<button class="btn-aksi btn-edit" onclick="bukaModalEdit(' + idx + ')"><i class="ti ti-pencil"></i></button>' +
            '<button class="btn-aksi btn-hapus" onclick="bukaModalHapus(' + idx + ')"><i class="ti ti-trash"></i></button>' +
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
  var now = new Date(); var bln = now.getMonth(); var thn = now.getFullYear();
  var masuk = 0; var keluar = 0; var jml = 0; var katMap = {};

  for (var i = 1; i < semuaData.length; i++) {
    var r = semuaData[i]; var iso = toISO(r[0]);
    var d = new Date(iso + 'T00:00:00'); var jumlah = parseInt(r[3]) || 0;
    var tipe = getTipe(r);
    if (d.getMonth() === bln && d.getFullYear() === thn) {
      jml++;
      if (tipe === 'pemasukan') masuk += jumlah;
      else { keluar += jumlah; katMap[r[1]] = (katMap[r[1]] || 0) + jumlah; }
    }
  }

  document.getElementById('statSaldo').textContent       = formatRupiah(masuk - keluar);
  document.getElementById('statTotalMasuk').textContent  = formatRupiah(masuk);
  document.getElementById('statTotalKeluar').textContent = formatRupiah(keluar);
  document.getElementById('statJmlTransaksi').textContent = jml + 'x';

  // Grafik
  var bulanData = [];
  for (var b = 5; b >= 0; b--) {
    var tgl = new Date(thn, bln - b, 1);
    var m2 = 0; var k2 = 0;
    for (var i = 1; i < semuaData.length; i++) {
      var r = semuaData[i]; var iso = toISO(r[0]);
      var dd = new Date(iso + 'T00:00:00');
      if (dd.getMonth() === tgl.getMonth() && dd.getFullYear() === tgl.getFullYear()) {
        var jml2 = parseInt(r[3]) || 0; var t2 = getTipe(r);
        if (t2 === 'pemasukan') m2 += jml2; else k2 += jml2;
      }
    }
    bulanData.push({ label: tgl.toLocaleDateString('id-ID', { month: 'short' }), masuk: m2, keluar: k2 });
  }

  var maxVal = 1;
  for (var b = 0; b < bulanData.length; b++) {
    if (bulanData[b].masuk  > maxVal) maxVal = bulanData[b].masuk;
    if (bulanData[b].keluar > maxVal) maxVal = bulanData[b].keluar;
  }

  var chartHtml = '';
  for (var b = 0; b < bulanData.length; b++) {
    var bd = bulanData[b];
    var hM = Math.round((bd.masuk  / maxVal) * 90);
    var hK = Math.round((bd.keluar / maxVal) * 90);
    chartHtml += '<div class="chart-col"><div class="chart-bars"><div class="chart-bar masuk" style="height:' + hM + 'px;"></div><div class="chart-bar keluar" style="height:' + hK + 'px;"></div></div><div class="chart-bulan">' + bd.label + '</div></div>';
  }
  document.getElementById('chartBatang').innerHTML = chartHtml;

  // Top kategori
  var katArr = Object.keys(katMap).map(function(k) { return { kat: k, jumlah: katMap[k] }; });
  katArr.sort(function(a,b) { return b.jumlah - a.jumlah; });
  var top5 = katArr.slice(0, 5);
  var maxKat = top5.length > 0 ? top5[0].jumlah : 1;
  var katHtml = top5.length === 0 ? '<p class="empty-mini">' + t('noData') + '</p>' : top5.map(function(item) {
    var pct = Math.round((item.jumlah / maxKat) * 100);
    var ikon = getIkon(item.kat);
    return '<div class="kat-item"><div class="kat-bar-wrap"><div class="kat-label-row"><span>' + escapeHtml(item.kat) + '</span><span>' + formatRupiah(item.jumlah) + '</span></div><div class="kat-bar-bg"><div class="kat-bar-fill" style="width:' + pct + '%;"></div></div></div></div>';
  }).join('');
  document.getElementById('topKategori').innerHTML = katHtml;
}

// ===========================
// MODAL EDIT
// ===========================

function bukaModalEdit(idx) {
  var r = semuaData[idx]; if (!r) return;
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

  if (!tanggal)                         return showToast(t('valTanggal'), 'error');
  if (!kategori)                        return showToast(t('valKategori'), 'error');
  if (!keterangan)                      return showToast(t('valKeterangan'), 'error');
  if (!jumlah || parseInt(jumlah) <= 0) return showToast(t('valJumlah'), 'error');

  var tipeAsal = semuaData[editBaris][4] || 'pengeluaran';
  semuaData[editBaris] = [tanggal, kategori, keterangan, parseInt(jumlah), tipeAsal];

  if (isDemoMode) {
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
    tutupModalEdit(); showToast(t('toastEditedDemo'), 'success'); return;
  }

  try {
    var params = new URLSearchParams({ action:'edit', baris: editBaris+1, tanggal, kategori, keterangan, jumlah: parseInt(jumlah), tipe: tipeAsal });
    await fetch(getScriptUrl() + '?' + params.toString(), { method:'GET', mode:'no-cors' });
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
    tutupModalEdit(); showToast(t('toastEdited'), 'success');
  } catch(err) { showToast(t('toastEditFail'), 'error'); }
}

// ===========================
// MODAL HAPUS (OPTIMISTIC UI)
// ===========================

function bukaModalHapus(idx) {
  var r = semuaData[idx]; if (!r) return;
  hapusBaris = idx;
  document.getElementById('hapusInfo').textContent = r[1] + ' — ' + r[2] + ' (' + formatRupiah(r[3]) + ')';
  document.getElementById('modalHapus').classList.remove('hidden');
}

function tutupModalHapus() {
  document.getElementById('modalHapus').classList.add('hidden');
  hapusBaris = -1;
}

async function konfirmasiHapus() {
  if (hapusBaris < 0) return;
  var cadangan = semuaData.slice(); var idx = hapusBaris;
  semuaData.splice(hapusBaris, 1);
  localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
  updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
  tutupModalHapus(); showToast(t('toastDeleted'), 'success');
  if (isDemoMode) return;
  try {
    var params = new URLSearchParams({ action:'hapus', baris: idx+1 });
    await fetch(getScriptUrl() + '?' + params.toString(), { method:'GET', mode:'no-cors' });
  } catch(err) {
    semuaData = cadangan;
    localStorage.setItem(CACHE_KEY, JSON.stringify(semuaData));
    updateSummary(semuaData); renderRecent(); renderRiwayat(); renderStatistik();
    showToast(t('toastDeleteFail'), 'error');
  }
}

// ===========================
// PULL TO REFRESH
// ===========================

function setupPullToRefresh() {
  var area = document.querySelector('.main');
  var ind  = document.getElementById('pullIndikator');
  var startY = 0; var pulling = false;
  area.addEventListener('touchstart', function(e) {
    if (area.scrollTop === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });
  area.addEventListener('touchmove', function(e) {
    if (!pulling) return;
    var j = e.touches[0].clientY - startY;
    if (j > 0 && j < 150) {
      ind.style.height  = (j * 0.4) + 'px';
      ind.style.opacity = j / 80;
      ind.textContent   = j > 80 ? 'Lepaskan untuk refresh...' : 'Tarik untuk refresh...';
    }
  }, { passive: true });
  area.addEventListener('touchend', function(e) {
    if (!pulling) return; pulling = false;
    var j = e.changedTouches[0].clientY - startY;
    ind.style.height = '0'; ind.style.opacity = '0';
    if (j > 80) {
      ind.style.height = '36px'; ind.style.opacity = '1'; ind.textContent = t('loadingData');
      muatData().finally(function() {
        setTimeout(function() { ind.style.height = '0'; ind.style.opacity = '0'; ind.textContent = ''; }, 800);
      });
    }
  });
}

// ===========================
// HELPERS
// ===========================

function tampilkanSkeleton() {
  document.getElementById('riwayatList').innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
}

function resetForm() {
  document.getElementById('inputKeterangan').value = '';
  document.getElementById('inputJumlah').value     = '';
  document.getElementById('inputTanggal').value    = formatTanggalISO(0);
  kategoriPilih = '';
  document.querySelectorAll('.cat-chip').forEach(function(c) { c.classList.remove('active','masuk-active'); });
}

function setupLangPicker() {
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      setLang(btn.dataset.lang);
      renderRecent();
      renderRiwayat();
      renderStatistik();
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(function() { console.log('SW terdaftar'); })
      .catch(function(e) { console.warn('SW error:', e); });
  }
}
