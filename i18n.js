// ===========================
// DOMPETKU — i18n (Language System)
// 4 bahasa: Indonesia, English, Japanese, Russian
// ===========================

const LANG_KEY = 'dompetku_lang';

const translations = {

  // ── INDONESIA ──────────────────────────────────
  id: {
    // App
    appSubtitle:    'Catatan harianmu',
    loadingApp:     'Memuat aplikasi...',

    // Greeting
    greetMorning:   'Halo, Selamat pagi!',
    greetAfternoon: 'Halo, Selamat siang!',
    greetEvening:   'Halo, Selamat sore!',
    greetNight:     'Halo, Selamat malam!',
    greetSub:       'Yuk catat transaksi hari ini',

    // Saldo
    saldoLabel:     'Saldo kamu sekarang',
    masukLabel:     'Masuk',
    keluarLabel:    'Keluar',

    // Tabs
    tabCatat:       'Catat',
    tabRiwayat:     'Riwayat',
    tabStatistik:   'Statistik',

    // Form
    recentTitle:    'Terakhir Dicatat',
    noTransaction:  'Belum ada transaksi',
    quickFormTitle: 'Catat Cepat',
    btnKeluar:      'Keluar',
    btnMasuk:       'Masuk',
    placeholderRp:  'Rp 0',
    placeholderKet: 'untuk apa?',
    catLabel:       'Kategori',
    btnSimpan:      'Simpan transaksi',
    btnSaving:      'Menyimpan...',

    // Stats
    keluarHariIni:  'Keluar Hari Ini',
    keluarMinggu:   'Keluar Minggu Ini',

    // Riwayat
    riwayatTitle:   'Riwayat Transaksi',
    searchPlaceholder: 'Cari transaksi...',
    filterAll:      'Semua',
    filterIncome:   'Pemasukan',
    filterExpense:  'Pengeluaran',
    emptyRiwayat:   'Belum ada data.\nTarik ke bawah atau tap ikon refresh untuk memuat riwayat.',
    noMatch:        'Tidak ada transaksi yang cocok.',

    // Statistik
    statTitle:      'Ringkasan Bulanan',
    statSaldo:      'Saldo',
    statTrx:        'Transaksi',
    statIncome:     'Pemasukan',
    statExpense:    'Pengeluaran',
    chartTitle:     '6 Bulan Terakhir',
    topKatTitle:    'Top Pengeluaran per Kategori',
    noData:         'Belum ada data',

    // Relative dates
    today:          'Hari ini',
    yesterday:      'Kemarin',

    // Toast
    toastSaved:     'Berhasil disimpan!',
    toastSavedDemo: 'Berhasil dicatat! (Mode Demo)',
    toastEdited:    'Data berhasil diubah!',
    toastEditedDemo:'Data berhasil diubah! (Demo)',
    toastDeleted:   'Data berhasil dihapus!',
    toastDeleteFail:'Gagal menghapus. Data dikembalikan.',
    toastOffline:   'Offline - menampilkan data tersimpan',
    toastDemo:      'Mode Demo aktif!',
    toastSaveFail:  'Gagal menyimpan. Cek koneksi.',
    toastEditFail:  'Gagal mengubah data.',

    // Validation
    valTanggal:     'Tanggal harus diisi!',
    valKategori:    'Pilih kategori dulu!',
    valKeterangan:  'Keterangan harus diisi!',
    valJumlah:      'Jumlah harus lebih dari 0!',

    // Modal Config
    setupTitle:     'Setup Pertama Kali',
    setupDesc:      'Masukkan URL Google Apps Script kamu untuk menghubungkan aplikasi dengan Google Sheets.',
    setupUrlLabel:  'URL Google Apps Script',
    setupHint:      'Dapatkan URL ini dari Google Apps Script → Deploy → Manage Deployments',
    btnSaveConfig:  'Simpan & Mulai',
    btnDemoMode:    'Coba Mode Demo',

    // Modal Edit
    editTitle:      'Edit Transaksi',
    editDateLabel:  'Tanggal',
    editCatLabel:   'Kategori',
    editKetLabel:   'Keterangan',
    editAmtLabel:   'Jumlah (Rp)',
    btnSave:        'Simpan',
    btnCancel:      'Batal',

    // Modal Hapus
    deleteTitle:    'Hapus Transaksi?',
    deleteDesc:     'Transaksi berikut akan dihapus permanen:',
    btnConfirmDel:  'Ya, Hapus',

    // Pull to refresh
    pullRefresh:    'Tarik untuk refresh...',
    releaseRefresh: 'Lepaskan untuk refresh...',
    loadingData:    'Memuat data...',

    // Categories
    catMakanan:     'Makanan',
    catTransport:   'Transport',
    catBelanja:     'Belanja',
    catKesehatan:   'Kesehatan',
    catPendidikan:  'Pendidikan',
    catHiburan:     'Hiburan',
    catRumah:       'Rumah',
    catPakaian:     'Pakaian',
    catPulsa:       'Pulsa',
    catGaji:        'Gaji',
    catUsaha:       'Usaha',
    catFreelance:   'Freelance',
    catTransfer:    'Transfer',
    catHadiah:      'Hadiah',
    catInvestasi:   'Investasi',
    catLainnya:     'Lainnya',

    // Select placeholder
    selectCat:      '-- Pilih --',

    // No data
    cantLoad:       'Tidak bisa memuat data.',

    // Lang picker
    langLabel:      'Bahasa',
  },

  // ── ENGLISH ────────────────────────────────────
  en: {
    appSubtitle:    'Your daily tracker',
    loadingApp:     'Loading app...',

    greetMorning:   'Good morning!',
    greetAfternoon: 'Good afternoon!',
    greetEvening:   'Good evening!',
    greetNight:     'Good night!',
    greetSub:       'Ready to track today\'s expenses?',

    saldoLabel:     'Your current balance',
    masukLabel:     'Income',
    keluarLabel:    'Expense',

    tabCatat:       'Record',
    tabRiwayat:     'History',
    tabStatistik:   'Stats',

    recentTitle:    'Recently Recorded',
    noTransaction:  'No transactions yet',
    quickFormTitle: 'Quick Record',
    btnKeluar:      'Expense',
    btnMasuk:       'Income',
    placeholderRp:  'Amount',
    placeholderKet: 'what for?',
    catLabel:       'Category',
    btnSimpan:      'Save transaction',
    btnSaving:      'Saving...',

    keluarHariIni:  'Today\'s Expense',
    keluarMinggu:   'This Week\'s Expense',

    riwayatTitle:   'Transaction History',
    searchPlaceholder: 'Search transactions...',
    filterAll:      'All',
    filterIncome:   'Income',
    filterExpense:  'Expense',
    emptyRiwayat:   'No data yet.\nPull down or tap refresh to load history.',
    noMatch:        'No matching transactions.',

    statTitle:      'Monthly Summary',
    statSaldo:      'Balance',
    statTrx:        'Transactions',
    statIncome:     'Income',
    statExpense:    'Expense',
    chartTitle:     'Last 6 Months',
    topKatTitle:    'Top Expense Categories',
    noData:         'No data yet',

    today:          'Today',
    yesterday:      'Yesterday',

    toastSaved:     'Saved successfully!',
    toastSavedDemo: 'Recorded! (Demo Mode)',
    toastEdited:    'Updated successfully!',
    toastEditedDemo:'Updated! (Demo)',
    toastDeleted:   'Deleted successfully!',
    toastDeleteFail:'Failed to delete. Data restored.',
    toastOffline:   'Offline - showing cached data',
    toastDemo:      'Demo Mode active!',
    toastSaveFail:  'Failed to save. Check connection.',
    toastEditFail:  'Failed to update data.',

    valTanggal:     'Date is required!',
    valKategori:    'Please select a category!',
    valKeterangan:  'Description is required!',
    valJumlah:      'Amount must be greater than 0!',

    setupTitle:     'First Time Setup',
    setupDesc:      'Enter your Google Apps Script URL to connect the app with Google Sheets.',
    setupUrlLabel:  'Google Apps Script URL',
    setupHint:      'Get this URL from Google Apps Script → Deploy → Manage Deployments',
    btnSaveConfig:  'Save & Start',
    btnDemoMode:    'Try Demo Mode',

    editTitle:      'Edit Transaction',
    editDateLabel:  'Date',
    editCatLabel:   'Category',
    editKetLabel:   'Description',
    editAmtLabel:   'Amount (Rp)',
    btnSave:        'Save',
    btnCancel:      'Cancel',

    deleteTitle:    'Delete Transaction?',
    deleteDesc:     'This transaction will be permanently deleted:',
    btnConfirmDel:  'Yes, Delete',

    pullRefresh:    'Pull to refresh...',
    releaseRefresh: 'Release to refresh...',
    loadingData:    'Loading data...',

    catMakanan:     'Food',
    catTransport:   'Transport',
    catBelanja:     'Shopping',
    catKesehatan:   'Health',
    catPendidikan:  'Education',
    catHiburan:     'Entertainment',
    catRumah:       'Home',
    catPakaian:     'Clothing',
    catPulsa:       'Data Plan',
    catGaji:        'Salary',
    catUsaha:       'Business',
    catFreelance:   'Freelance',
    catTransfer:    'Transfer',
    catHadiah:      'Gift',
    catInvestasi:   'Investment',
    catLainnya:     'Others',

    selectCat:      '-- Select --',
    cantLoad:       'Unable to load data.',
    langLabel:      'Language',
  },

  // ── JAPANESE ───────────────────────────────────
  ja: {
    appSubtitle:    '毎日の家計簿',
    loadingApp:     '読み込み中...',

    greetMorning:   'おはようございます！',
    greetAfternoon: 'こんにちは！',
    greetEvening:   'こんばんは！',
    greetNight:     'おやすみなさい！',
    greetSub:       '今日の支出を記録しましょう',

    saldoLabel:     '現在の残高',
    masukLabel:     '収入',
    keluarLabel:    '支出',

    tabCatat:       '記録',
    tabRiwayat:     '履歴',
    tabStatistik:   '統計',

    recentTitle:    '最近の記録',
    noTransaction:  '取引がありません',
    quickFormTitle: '素早く記録',
    btnKeluar:      '支出',
    btnMasuk:       '収入',
    placeholderRp:  '金額',
    placeholderKet: '何のために？',
    catLabel:       'カテゴリー',
    btnSimpan:      '保存する',
    btnSaving:      '保存中...',

    keluarHariIni:  '本日の支出',
    keluarMinggu:   '今週の支出',

    riwayatTitle:   '取引履歴',
    searchPlaceholder: '取引を検索...',
    filterAll:      'すべて',
    filterIncome:   '収入',
    filterExpense:  '支出',
    emptyRiwayat:   'データがありません。\n下に引っ張るか更新ボタンを押してください。',
    noMatch:        '一致する取引がありません。',

    statTitle:      '月次サマリー',
    statSaldo:      '残高',
    statTrx:        '取引数',
    statIncome:     '収入',
    statExpense:    '支出',
    chartTitle:     '過去6ヶ月',
    topKatTitle:    '支出カテゴリーランキング',
    noData:         'データがありません',

    today:          '今日',
    yesterday:      '昨日',

    toastSaved:     '保存しました！',
    toastSavedDemo: '記録しました！（デモ）',
    toastEdited:    '更新しました！',
    toastEditedDemo:'更新しました！（デモ）',
    toastDeleted:   '削除しました！',
    toastDeleteFail:'削除に失敗しました。',
    toastOffline:   'オフライン - キャッシュを表示',
    toastDemo:      'デモモード有効！',
    toastSaveFail:  '保存に失敗しました。',
    toastEditFail:  '更新に失敗しました。',

    valTanggal:     '日付を入力してください！',
    valKategori:    'カテゴリーを選択してください！',
    valKeterangan:  '説明を入力してください！',
    valJumlah:      '金額は0より大きくしてください！',

    setupTitle:     '初期設定',
    setupDesc:      'Google Sheetsと連携するためにApps Script URLを入力してください。',
    setupUrlLabel:  'Google Apps Script URL',
    setupHint:      'Apps Script → デプロイ → デプロイを管理 からURLを取得してください',
    btnSaveConfig:  '保存して開始',
    btnDemoMode:    'デモを試す',

    editTitle:      '取引を編集',
    editDateLabel:  '日付',
    editCatLabel:   'カテゴリー',
    editKetLabel:   '説明',
    editAmtLabel:   '金額',
    btnSave:        '保存',
    btnCancel:      'キャンセル',

    deleteTitle:    '取引を削除しますか？',
    deleteDesc:     '以下の取引が完全に削除されます：',
    btnConfirmDel:  'はい、削除する',

    pullRefresh:    '引っ張って更新...',
    releaseRefresh: '離して更新...',
    loadingData:    '読み込み中...',

    catMakanan:     '食事',
    catTransport:   '交通',
    catBelanja:     'ショッピング',
    catKesehatan:   '医療',
    catPendidikan:  '教育',
    catHiburan:     '娯楽',
    catRumah:       '住居',
    catPakaian:     '衣類',
    catPulsa:       '通信',
    catGaji:        '給料',
    catUsaha:       'ビジネス',
    catFreelance:   'フリーランス',
    catTransfer:    '送金',
    catHadiah:      'ギフト',
    catInvestasi:   '投資',
    catLainnya:     'その他',

    selectCat:      '-- 選択 --',
    cantLoad:       'データを読み込めません。',
    langLabel:      '言語',
  },

  // ── RUSSIAN ────────────────────────────────────
  ru: {
    appSubtitle:    'Ваш ежедневный трекер',
    loadingApp:     'Загрузка...',

    greetMorning:   'Доброе утро!',
    greetAfternoon: 'Добрый день!',
    greetEvening:   'Добрый вечер!',
    greetNight:     'Спокойной ночи!',
    greetSub:       'Записывайте расходы каждый день',

    saldoLabel:     'Текущий баланс',
    masukLabel:     'Доходы',
    keluarLabel:    'Расходы',

    tabCatat:       'Запись',
    tabRiwayat:     'История',
    tabStatistik:   'Статистика',

    recentTitle:    'Последние записи',
    noTransaction:  'Нет транзакций',
    quickFormTitle: 'Быстрая запись',
    btnKeluar:      'Расход',
    btnMasuk:       'Доход',
    placeholderRp:  'Сумма',
    placeholderKet: 'на что?',
    catLabel:       'Категория',
    btnSimpan:      'Сохранить',
    btnSaving:      'Сохранение...',

    keluarHariIni:  'Расходы сегодня',
    keluarMinggu:   'Расходы за неделю',

    riwayatTitle:   'История транзакций',
    searchPlaceholder: 'Поиск транзакций...',
    filterAll:      'Все',
    filterIncome:   'Доходы',
    filterExpense:  'Расходы',
    emptyRiwayat:   'Нет данных.\nПотяните вниз или нажмите обновить.',
    noMatch:        'Транзакции не найдены.',

    statTitle:      'Месячная сводка',
    statSaldo:      'Баланс',
    statTrx:        'Транзакции',
    statIncome:     'Доходы',
    statExpense:    'Расходы',
    chartTitle:     'Последние 6 месяцев',
    topKatTitle:    'Топ категорий расходов',
    noData:         'Нет данных',

    today:          'Сегодня',
    yesterday:      'Вчера',

    toastSaved:     'Успешно сохранено!',
    toastSavedDemo: 'Записано! (Демо)',
    toastEdited:    'Обновлено!',
    toastEditedDemo:'Обновлено! (Демо)',
    toastDeleted:   'Удалено!',
    toastDeleteFail:'Ошибка удаления. Данные восстановлены.',
    toastOffline:   'Офлайн - показываем кэш',
    toastDemo:      'Демо режим включён!',
    toastSaveFail:  'Ошибка сохранения. Проверьте соединение.',
    toastEditFail:  'Ошибка обновления.',

    valTanggal:     'Укажите дату!',
    valKategori:    'Выберите категорию!',
    valKeterangan:  'Укажите описание!',
    valJumlah:      'Сумма должна быть больше 0!',

    setupTitle:     'Первоначальная настройка',
    setupDesc:      'Введите URL Google Apps Script для подключения к Google Sheets.',
    setupUrlLabel:  'URL Google Apps Script',
    setupHint:      'Получите URL в Apps Script → Развернуть → Управление развёртыванием',
    btnSaveConfig:  'Сохранить и начать',
    btnDemoMode:    'Попробовать демо',

    editTitle:      'Редактировать транзакцию',
    editDateLabel:  'Дата',
    editCatLabel:   'Категория',
    editKetLabel:   'Описание',
    editAmtLabel:   'Сумма (Rp)',
    btnSave:        'Сохранить',
    btnCancel:      'Отмена',

    deleteTitle:    'Удалить транзакцию?',
    deleteDesc:     'Эта транзакция будет удалена навсегда:',
    btnConfirmDel:  'Да, удалить',

    pullRefresh:    'Потяните для обновления...',
    releaseRefresh: 'Отпустите для обновления...',
    loadingData:    'Загрузка данных...',

    catMakanan:     'Еда',
    catTransport:   'Транспорт',
    catBelanja:     'Покупки',
    catKesehatan:   'Здоровье',
    catPendidikan:  'Образование',
    catHiburan:     'Развлечения',
    catRumah:       'Жильё',
    catPakaian:     'Одежда',
    catPulsa:       'Связь',
    catGaji:        'Зарплата',
    catUsaha:       'Бизнес',
    catFreelance:   'Фриланс',
    catTransfer:    'Перевод',
    catHadiah:      'Подарок',
    catInvestasi:   'Инвестиции',
    catLainnya:     'Другое',

    selectCat:      '-- Выбрать --',
    cantLoad:       'Не удаётся загрузить данные.',
    langLabel:      'Язык',
  },
};

// ===========================
// LANGUAGE FUNCTIONS
// ===========================

var currentLang = localStorage.getItem(LANG_KEY) || 'id';

function t(key) {
  var lang = translations[currentLang] || translations['id'];
  return lang[key] || translations['id'][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  applyTranslations();
}

function applyTranslations() {
  // All elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, t(key));
    } else {
      el.textContent = t(key);
    }
  });

  // Update greeting based on time
  var h = new Date().getHours();
  var greetKey = h < 10 ? 'greetMorning' : h < 15 ? 'greetAfternoon' : h < 18 ? 'greetEvening' : 'greetNight';
  var greetEl = document.querySelector('.greet');
  if (greetEl) greetEl.textContent = t(greetKey);

  // Update lang selector active state
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function getCatKey(catName) {
  var map = {
    'Makanan & Minuman': 'catMakanan',
    'Transportasi':      'catTransport',
    'Belanja':           'catBelanja',
    'Kesehatan':         'catKesehatan',
    'Pendidikan':        'catPendidikan',
    'Hiburan':           'catHiburan',
    'Rumah & Utilitas':  'catRumah',
    'Pakaian':           'catPakaian',
    'Pulsa & Internet':  'catPulsa',
    'Gaji':              'catGaji',
    'Usaha':             'catUsaha',
    'Freelance':         'catFreelance',
    'Transfer':          'catTransfer',
    'Hadiah':            'catHadiah',
    'Investasi':         'catInvestasi',
    'Lainnya':           'catLainnya',
  };
  return map[catName] ? t(map[catName]) : catName;
}
