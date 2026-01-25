/* ================================================
   TANIKU MONITOR - COMMODITY DATA
   100+ Commodities with Sub-categories
   ================================================ */

const CommodityData = {
    // ========== LANGUAGE TRANSLATIONS ==========
    translations: {
        id: {
            commodities: 'Komoditas',
            fertilizers: 'Pupuk & Racun',
            current_price: 'Harga Saat Ini',
            description: 'Deskripsi',
            varieties: 'Varietas & Tipe',
            farmer_calc: 'Kalkulator Tani',
            crop_type: 'Jenis Tanaman',
            land_area: 'Luas Lahan (m²)',
            planting_date: 'Tanggal Tanam',
            calculate: 'Hitung Estimasi',
            harvest_est: 'Estimasi Panen',
            est_revenue: 'Estimasi Pendapatan',
            fertilizer_cost: 'Biaya Pupuk',
            harvest_date: 'Tanggal Panen',
            home: 'Beranda',
            map: 'Peta',
            chart: 'Grafik',
            calculator: 'Kalkulator',
            search_music: 'Cari musik...',
            no_music: 'Tidak ada musik',
            detecting_location: 'Mendeteksi lokasi...',
            price_index: 'Indeks Harga'
        },
        jv: {
            commodities: 'Komoditas',
            fertilizers: 'Rabuk & Racun',
            current_price: 'Rego Saiki',
            description: 'Katrangan',
            varieties: 'Jinis & Tipe',
            farmer_calc: 'Kalkulator Tani',
            crop_type: 'Jinis Tanduran',
            land_area: 'Jembar Sawah (m²)',
            planting_date: 'Tanggal Tandur',
            calculate: 'Etung Perkiraan',
            harvest_est: 'Perkiraan Panen',
            est_revenue: 'Perkiraan Penghasilan',
            fertilizer_cost: 'Ragat Rabuk',
            harvest_date: 'Tanggal Panen',
            home: 'Omah',
            map: 'Peta',
            chart: 'Grafik',
            calculator: 'Kalkulator',
            search_music: 'Goleki musik...',
            no_music: 'Ora ana musik',
            detecting_location: 'Nggoleki lokasi...',
            price_index: 'Indeks Rego'
        },
        en: {
            commodities: 'Commodities',
            fertilizers: 'Fertilizers & Pesticides',
            current_price: 'Current Price',
            description: 'Description',
            varieties: 'Varieties & Types',
            farmer_calc: 'Farmer Calculator',
            crop_type: 'Crop Type',
            land_area: 'Land Area (m²)',
            planting_date: 'Planting Date',
            calculate: 'Calculate Estimate',
            harvest_est: 'Harvest Estimate',
            est_revenue: 'Estimated Revenue',
            fertilizer_cost: 'Fertilizer Cost',
            harvest_date: 'Harvest Date',
            home: 'Home',
            map: 'Map',
            chart: 'Chart',
            calculator: 'Calculator',
            search_music: 'Search music...',
            no_music: 'No music playing',
            detecting_location: 'Detecting location...',
            price_index: 'Price Index'
        },
        lp: {
            commodities: 'Komoditas',
            fertilizers: 'Pupuk & Racun',
            current_price: 'Rega Jameno',
            description: 'Keterangan',
            varieties: 'Jenis & Tipe',
            farmer_calc: 'Kalkulator Petani',
            crop_type: 'Jenis Tanoman',
            land_area: 'Luasni Sawah (m²)',
            planting_date: 'Tanggal Nanom',
            calculate: 'Itung Perkiraan',
            harvest_est: 'Perkiraan Panen',
            est_revenue: 'Perkiraan Hasil',
            fertilizer_cost: 'Biaya Pupuk',
            harvest_date: 'Tanggal Panen',
            home: 'Umah',
            map: 'Peta',
            chart: 'Grafik',
            calculator: 'Kalkulator',
            search_music: 'Cari musik...',
            no_music: 'Mak wat musik',
            detecting_location: 'Nyari lokasi...',
            price_index: 'Indeks Rega'
        }
    },

    // ========== COMMODITY CATEGORIES ==========
    categories: {
        komoditas: {
            id: 'komoditas',
            name: { id: 'Komoditas', jv: 'Komoditas', en: 'Commodities', lp: 'Komoditas' },
            icon: '🌾',
            subcategories: [
                'bahan_pokok', 'sayuran', 'buah', 'protein',
                'minuman', 'bumbu', 'kacang', 'umbi'
            ]
        },
        pupuk: {
            id: 'pupuk',
            name: { id: 'Pupuk & Racun', jv: 'Rabuk & Racun', en: 'Fertilizers', lp: 'Pupuk & Racun' },
            icon: '🧪',
            subcategories: ['pupuk_organik', 'pupuk_anorganik', 'pestisida', 'herbisida', 'fungisida']
        }
    },

    // ========== SUBCATEGORIES ==========
    subcategories: {
        bahan_pokok: { name: { id: 'Bahan Pokok', en: 'Staples' }, icon: '🍚' },
        sayuran: { name: { id: 'Sayuran', en: 'Vegetables' }, icon: '🥬' },
        buah: { name: { id: 'Buah-buahan', en: 'Fruits' }, icon: '🍎' },
        protein: { name: { id: 'Protein', en: 'Protein' }, icon: '🥩' },
        minuman: { name: { id: 'Minuman', en: 'Beverages' }, icon: '☕' },
        bumbu: { name: { id: 'Bumbu & Rempah', en: 'Spices' }, icon: '🌶️' },
        kacang: { name: { id: 'Kacang-kacangan', en: 'Legumes' }, icon: '🥜' },
        umbi: { name: { id: 'Umbi-umbian', en: 'Tubers' }, icon: '🥔' },
        pupuk_organik: { name: { id: 'Pupuk Organik', en: 'Organic Fertilizer' }, icon: '🌱' },
        pupuk_anorganik: { name: { id: 'Pupuk Anorganik', en: 'Chemical Fertilizer' }, icon: '⚗️' },
        pestisida: { name: { id: 'Pestisida', en: 'Pesticides' }, icon: '🐛' },
        herbisida: { name: { id: 'Herbisida', en: 'Herbicides' }, icon: '🌿' },
        fungisida: { name: { id: 'Fungisida', en: 'Fungicides' }, icon: '🍄' }
    },

    // ========== COMMODITIES DATA (100+) ==========
    commodities: [
        // === BAHAN POKOK ===
        { id: 'beras', name: 'Beras', icon: '🍚', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 120, yieldPerHa: 6000 },
        { id: 'jagung', name: 'Jagung', icon: '🌽', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 95, yieldPerHa: 8000 },
        { id: 'gandum', name: 'Gandum', icon: '🌾', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 130, yieldPerHa: 4000 },
        { id: 'kedelai', name: 'Kedelai', icon: '🫘', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 85, yieldPerHa: 2000 },
        { id: 'gula', name: 'Gula Pasir', icon: '🧂', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 300, yieldPerHa: 8000 },
        { id: 'minyak_goreng', name: 'Minyak Goreng', icon: '🫗', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'liter', harvestDays: 0, yieldPerHa: 0 },
        { id: 'tepung_terigu', name: 'Tepung Terigu', icon: '🥖', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 0, yieldPerHa: 0 },
        { id: 'tepung_beras', name: 'Tepung Beras', icon: '🍘', category: 'komoditas', subcategory: 'bahan_pokok', unit: 'kg', harvestDays: 0, yieldPerHa: 0 },

        // === SAYURAN ===
        { id: 'cabai_merah', name: 'Cabai Merah', icon: '🌶️', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 75, yieldPerHa: 12000 },
        { id: 'cabai_rawit', name: 'Cabai Rawit', icon: '🌶️', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 70, yieldPerHa: 8000 },
        { id: 'bawang_merah', name: 'Bawang Merah', icon: '🧅', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 65, yieldPerHa: 10000 },
        { id: 'bawang_putih', name: 'Bawang Putih', icon: '🧄', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 120, yieldPerHa: 8000 },
        { id: 'tomat', name: 'Tomat', icon: '🍅', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 70, yieldPerHa: 30000 },
        { id: 'kentang', name: 'Kentang', icon: '🥔', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 100, yieldPerHa: 25000 },
        { id: 'wortel', name: 'Wortel', icon: '🥕', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 90, yieldPerHa: 20000 },
        { id: 'kubis', name: 'Kubis/Kol', icon: '🥬', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 80, yieldPerHa: 35000 },
        { id: 'sawi', name: 'Sawi', icon: '🥬', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 40, yieldPerHa: 25000 },
        { id: 'bayam', name: 'Bayam', icon: '🥬', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 25, yieldPerHa: 15000 },
        { id: 'kangkung', name: 'Kangkung', icon: '🥬', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 30, yieldPerHa: 20000 },
        { id: 'terong', name: 'Terong', icon: '🍆', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 55, yieldPerHa: 25000 },
        { id: 'timun', name: 'Timun', icon: '🥒', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 45, yieldPerHa: 30000 },
        { id: 'labu_siam', name: 'Labu Siam', icon: '🥒', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 60, yieldPerHa: 40000 },
        { id: 'brokoli', name: 'Brokoli', icon: '🥦', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 80, yieldPerHa: 15000 },
        { id: 'paprika', name: 'Paprika', icon: '🫑', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 75, yieldPerHa: 20000 },
        { id: 'selada', name: 'Selada', icon: '🥗', category: 'komoditas', subcategory: 'sayuran',  unit: 'kg', harvestDays: 45, yieldPerHa: 18000 },

        // === BUAH ===
        { id: 'pisang', name: 'Pisang', icon: '🍌', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 365, yieldPerHa: 30000 },
        { id: 'jeruk', name: 'Jeruk', icon: '🍊', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 270, yieldPerHa: 25000 },
        { id: 'apel', name: 'Apel', icon: '🍎', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 180, yieldPerHa: 20000 },
        { id: 'mangga', name: 'Mangga', icon: '🥭', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 120, yieldPerHa: 15000 },
        { id: 'semangka', name: 'Semangka', icon: '🍉', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 75, yieldPerHa: 35000 },
        { id: 'melon', name: 'Melon', icon: '🍈', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 65, yieldPerHa: 25000 },
        { id: 'pepaya', name: 'Pepaya', icon: '🍈', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 270, yieldPerHa: 60000 },
        { id: 'nanas', name: 'Nanas', icon: '🍍', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 540, yieldPerHa: 40000 },
        { id: 'anggur', name: 'Anggur', icon: '🍇', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 150, yieldPerHa: 15000 },
        { id: 'strawberry', name: 'Strawberry', icon: '🍓', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 90, yieldPerHa: 12000 },
        { id: 'durian', name: 'Durian', icon: '🍈', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 1825, yieldPerHa: 8000 },
        { id: 'rambutan', name: 'Rambutan', icon: '🍒', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 1460, yieldPerHa: 12000 },
        { id: 'kelapa', name: 'Kelapa', icon: '🥥', category: 'komoditas', subcategory: 'buah',  unit: 'buah', harvestDays: 1095, yieldPerHa: 5000 },
        { id: 'alpukat', name: 'Alpukat', icon: '🥑', category: 'komoditas', subcategory: 'buah',  unit: 'kg', harvestDays: 1095, yieldPerHa: 10000 },

        // === PROTEIN ===
        { id: 'daging_sapi', name: 'Daging Sapi', icon: '🥩', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 0, yieldPerHa: 0 },
        { id: 'daging_ayam', name: 'Daging Ayam', icon: '🍗', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 35, yieldPerHa: 0 },
        { id: 'daging_kambing', name: 'Daging Kambing', icon: '🥩', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 0, yieldPerHa: 0 },
        { id: 'telur_ayam', name: 'Telur Ayam', icon: '🥚', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 0, yieldPerHa: 0 },
        { id: 'telur_bebek', name: 'Telur Bebek', icon: '🥚', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 0, yieldPerHa: 0 },
        { id: 'ikan_lele', name: 'Ikan Lele', icon: '🐟', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 90, yieldPerHa: 0 },
        { id: 'ikan_nila', name: 'Ikan Nila', icon: '🐟', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 120, yieldPerHa: 0 },
        { id: 'udang', name: 'Udang', icon: '🦐', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 100, yieldPerHa: 0 },
        { id: 'ikan_mas', name: 'Ikan Mas', icon: '🐟', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 150, yieldPerHa: 0 },
        { id: 'ikan_gurame', name: 'Ikan Gurame', icon: '🐟', category: 'komoditas', subcategory: 'protein',  unit: 'kg', harvestDays: 180, yieldPerHa: 0 },

        // === MINUMAN ===
        { id: 'kopi_arabika', name: 'Kopi Arabika', icon: '☕', category: 'komoditas', subcategory: 'minuman',  unit: 'kg', harvestDays: 1095, yieldPerHa: 1500 },
        { id: 'kopi_robusta', name: 'Kopi Robusta', icon: '☕', category: 'komoditas', subcategory: 'minuman',  unit: 'kg', harvestDays: 1095, yieldPerHa: 2000 },
        { id: 'kopi_liberika', name: 'Kopi Liberika', icon: '☕', category: 'komoditas', subcategory: 'minuman',  unit: 'kg', harvestDays: 1095, yieldPerHa: 1800 },
        { id: 'kakao', name: 'Kakao', icon: '🍫', category: 'komoditas', subcategory: 'minuman',  unit: 'kg', harvestDays: 730, yieldPerHa: 1000 },
        { id: 'susu_segar', name: 'Susu Segar', icon: '🥛', category: 'komoditas', subcategory: 'minuman',  unit: 'liter', harvestDays: 0, yieldPerHa: 0 },
        { id: 'teh', name: 'Teh', icon: '🍵', category: 'komoditas', subcategory: 'minuman',  unit: 'kg', harvestDays: 1095, yieldPerHa: 5000 },

        // === BUMBU ===
        { id: 'jahe', name: 'Jahe', icon: '🧅', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 270, yieldPerHa: 25000 },
        { id: 'kunyit', name: 'Kunyit', icon: '🧅', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 270, yieldPerHa: 20000 },
        { id: 'lengkuas', name: 'Lengkuas', icon: '🧅', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 300, yieldPerHa: 30000 },
        { id: 'lada', name: 'Lada', icon: '🫛', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 1095, yieldPerHa: 2000 },
        { id: 'pala', name: 'Pala', icon: '🫛', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 2555, yieldPerHa: 1500 },
        { id: 'cengkeh', name: 'Cengkeh', icon: '🫛', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 1825, yieldPerHa: 500 },
        { id: 'kayu_manis', name: 'Kayu Manis', icon: '🫛', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 2190, yieldPerHa: 800 },
        { id: 'kemiri', name: 'Kemiri', icon: '🥜', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 1825, yieldPerHa: 3000 },
        { id: 'serai', name: 'Serai', icon: '🌿', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 120, yieldPerHa: 15000 },
        { id: 'daun_salam', name: 'Daun Salam', icon: '🌿', category: 'komoditas', subcategory: 'bumbu',  unit: 'kg', harvestDays: 365, yieldPerHa: 5000 },

        // === KACANG ===
        { id: 'kacang_tanah', name: 'Kacang Tanah', icon: '🥜', category: 'komoditas', subcategory: 'kacang',  unit: 'kg', harvestDays: 100, yieldPerHa: 3000 },
        { id: 'kacang_hijau', name: 'Kacang Hijau', icon: '🫛', category: 'komoditas', subcategory: 'kacang',  unit: 'kg', harvestDays: 65, yieldPerHa: 1500 },
        { id: 'kacang_merah', name: 'Kacang Merah', icon: '🫘', category: 'komoditas', subcategory: 'kacang',  unit: 'kg', harvestDays: 80, yieldPerHa: 2000 },
        { id: 'kacang_kedelai', name: 'Kacang Kedelai', icon: '🫘', category: 'komoditas', subcategory: 'kacang',  unit: 'kg', harvestDays: 85, yieldPerHa: 2000 },
        { id: 'kacang_panjang', name: 'Kacang Panjang', icon: '🫛', category: 'komoditas', subcategory: 'kacang',  unit: 'kg', harvestDays: 50, yieldPerHa: 15000 },

        // === UMBI ===
        { id: 'singkong', name: 'Singkong', icon: '🥔', category: 'komoditas', subcategory: 'umbi',  unit: 'kg', harvestDays: 270, yieldPerHa: 25000 },
        { id: 'ubi_jalar', name: 'Ubi Jalar', icon: '🍠', category: 'komoditas', subcategory: 'umbi',  unit: 'kg', harvestDays: 120, yieldPerHa: 20000 },
        { id: 'talas', name: 'Talas', icon: '🥔', category: 'komoditas', subcategory: 'umbi',  unit: 'kg', harvestDays: 240, yieldPerHa: 15000 },
        { id: 'uwi', name: 'Uwi', icon: '🥔', category: 'komoditas', subcategory: 'umbi',  unit: 'kg', harvestDays: 300, yieldPerHa: 18000 },
        { id: 'ganyong', name: 'Ganyong', icon: '🥔', category: 'komoditas', subcategory: 'umbi',  unit: 'kg', harvestDays: 270, yieldPerHa: 20000 },

        // === PUPUK ORGANIK ===
        { id: 'kompos', name: 'Kompos', icon: '🌱', category: 'pupuk', subcategory: 'pupuk_organik',  unit: 'kg' },
        { id: 'pupuk_kandang', name: 'Pupuk Kandang', icon: '🌱', category: 'pupuk', subcategory: 'pupuk_organik',  unit: 'kg' },
        { id: 'petroganik', name: 'Petroganik', icon: '🌱', category: 'pupuk', subcategory: 'pupuk_organik',  unit: 'kg' },
        { id: 'bokashi', name: 'Bokashi', icon: '🌱', category: 'pupuk', subcategory: 'pupuk_organik',  unit: 'kg' },
        { id: 'guano', name: 'Guano', icon: '🌱', category: 'pupuk', subcategory: 'pupuk_organik',  unit: 'kg' },

        // === PUPUK ANORGANIK ===
        { id: 'urea', name: 'Urea', icon: '⚗️', category: 'pupuk', subcategory: 'pupuk_anorganik',  unit: 'kg' },
        { id: 'npk', name: 'NPK Phonska', icon: '⚗️', category: 'pupuk', subcategory: 'pupuk_anorganik',  unit: 'kg' },
        { id: 'tsp', name: 'TSP', icon: '⚗️', category: 'pupuk', subcategory: 'pupuk_anorganik',  unit: 'kg' },
        { id: 'kcl', name: 'KCl', icon: '⚗️', category: 'pupuk', subcategory: 'pupuk_anorganik',  unit: 'kg' },
        { id: 'za', name: 'ZA', icon: '⚗️', category: 'pupuk', subcategory: 'pupuk_anorganik',  unit: 'kg' },
        { id: 'sp36', name: 'SP-36', icon: '⚗️', category: 'pupuk', subcategory: 'pupuk_anorganik',  unit: 'kg' },

        // === PESTISIDA ===
        { id: 'decis', name: 'Decis', icon: '🐛', category: 'pupuk', subcategory: 'pestisida',  unit: 'liter' },
        { id: 'regent', name: 'Regent', icon: '🐛', category: 'pupuk', subcategory: 'pestisida',  unit: 'liter' },
        { id: 'prevathon', name: 'Prevathon', icon: '🐛', category: 'pupuk', subcategory: 'pestisida',  unit: 'liter' },
        { id: 'marshal', name: 'Marshal', icon: '🐛', category: 'pupuk', subcategory: 'pestisida',  unit: 'kg' },
        { id: 'furadan', name: 'Furadan', icon: '🐛', category: 'pupuk', subcategory: 'pestisida',  unit: 'kg' },

        // === HERBISIDA ===
        { id: 'roundup', name: 'Roundup', icon: '🌿', category: 'pupuk', subcategory: 'herbisida',  unit: 'liter' },
        { id: 'gramaxone', name: 'Gramaxone', icon: '🌿', category: 'pupuk', subcategory: 'herbisida',  unit: 'liter' },
        { id: 'ally', name: 'Ally', icon: '🌿', category: 'pupuk', subcategory: 'herbisida',  unit: 'kg' },
        { id: 'clincher', name: 'Clincher', icon: '🌿', category: 'pupuk', subcategory: 'herbisida',  unit: 'liter' },

        // === FUNGISIDA ===
        { id: 'dithane', name: 'Dithane', icon: '🍄', category: 'pupuk', subcategory: 'fungisida',  unit: 'kg' },
        { id: 'antracol', name: 'Antracol', icon: '🍄', category: 'pupuk', subcategory: 'fungisida',  unit: 'kg' },
        { id: 'score', name: 'Score', icon: '🍄', category: 'pupuk', subcategory: 'fungisida',  unit: 'liter' },
        { id: 'amistartop', name: 'Amistar Top', icon: '🍄', category: 'pupuk', subcategory: 'fungisida',  unit: 'liter' }
    ],

    // ========== VARIETIES/SUB-COMMODITIES ==========
    varieties: {
        'beras': [
            { id: 'ir64', name: 'IR64' },
            { id: 'ciherang', name: 'Ciherang' },
            { id: 'rojolele', name: 'Rojolele' },
            { id: 'pandan_wangi', name: 'Pandan Wangi' },
            { id: 'mentik_wangi', name: 'Mentik Wangi' },
            { id: 'inpari', name: 'Inpari 32',  },
            { id: 'beras_merah', name: 'Beras Merah',  },
            { id: 'beras_hitam', name: 'Beras Hitam',  },
            { id: 'beras_ketan', name: 'Beras Ketan',  },
            { id: 'siam', name: 'Siam Unus',  },
            { id: 'sembada', name: 'Sembada',  },
            { id: 'sintanur', name: 'Sintanur',  },
            { id: 'situbagendit', name: 'Situbagendit',  },
            { id: 'mekongga', name: 'Mekongga',  },
            { id: 'jembar', name: 'Jembar',  },
            { id: 'cibogo', name: 'Cibogo',  },
            { id: 'fatmawati', name: 'Fatmawati',  },
            { id: 'rajalele', name: 'Rajalele',  },
            { id: 'memberamo', name: 'Memberamo',  },
            { id: 'cigeulis', name: 'Cigeulis',  }
        ],
        'kopi_arabika': [
            { id: 'gayo', name: 'Gayo',  },
            { id: 'toraja', name: 'Toraja',  },
            { id: 'java', name: 'Java Preanger',  },
            { id: 'flores', name: 'Flores Bajawa',  },
            { id: 'bali_kintamani', name: 'Bali Kintamani',  },
            { id: 'mandailing', name: 'Mandailing',  },
            { id: 'wamena', name: 'Wamena',  },
            { id: 'luwak', name: 'Kopi Luwak',  },
            { id: 'temanggung', name: 'Temanggung',  },
            { id: 'bondowoso', name: 'Bondowoso',  },
            { id: 'semeru', name: 'Semeru',  },
            { id: 'malabar', name: 'Malabar',  },
            { id: 'kerinci', name: 'Kerinci',  },
            { id: 'enrekang', name: 'Enrekang',  },
            { id: 'mamasa', name: 'Mamasa',  },
            { id: 'lintong', name: 'Lintong',  },
            { id: 'sidikalang', name: 'Sidikalang',  },
            { id: 'dairi', name: 'Dairi',  },
            { id: 'takengon', name: 'Takengon',  },
            { id: 'lampung', name: 'Lampung Highland',  }
        ],
        'cabai_merah': [
            { id: 'keriting', name: 'Cabai Keriting',  },
            { id: 'merah_besar', name: 'Cabai Merah Besar',  },
            { id: 'tit_super', name: 'TIT Super',  },
            { id: 'lado', name: 'Lado F1',  },
            { id: 'hot_beauty', name: 'Hot Beauty',  },
            { id: 'panex', name: 'Panex-100',  },
            { id: 'laba', name: 'Laba F1',  },
            { id: 'cakra', name: 'Cakra Hijau',  },
            { id: 'kirana', name: 'Kirana',  },
            { id: 'genie', name: 'Genie',  },
            { id: 'twist', name: 'Twist',  },
            { id: 'horison', name: 'Horison',  },
            { id: 'tanamo', name: 'Tanamo',  },
            { id: 'elegance', name: 'Elegance',  },
            { id: 'arimbi', name: 'Arimbi',  },
            { id: 'landung', name: 'Landung',  },
            { id: 'biola', name: 'Biola F1',  },
            { id: 'imola', name: 'Imola',  },
            { id: 'bemora', name: 'Bemora',  },
            { id: 'bhaskara', name: 'Bhaskara',  }
        ]
    },

    // ========== PROVINCE PRICE INDEX ==========
    provinceIndex: {
        '11': { name: 'Aceh', index: 102.5 },
        '12': { name: 'Sumatera Utara', index: 101.2 },
        '13': { name: 'Sumatera Barat', index: 100.8 },
        '14': { name: 'Riau', index: 103.1 },
        '15': { name: 'Jambi', index: 100.5 },
        '16': { name: 'Sumatera Selatan', index: 99.8 },
        '17': { name: 'Bengkulu', index: 101.0 },
        '18': { name: 'Lampung', index: 98.5 },
        '19': { name: 'Kep. Bangka Belitung', index: 104.2 },
        '21': { name: 'Kepulauan Riau', index: 106.5 },
        '31': { name: 'DKI Jakarta', index: 108.2 },
        '32': { name: 'Jawa Barat', index: 100.0 },
        '33': { name: 'Jawa Tengah', index: 97.5 },
        '34': { name: 'DI Yogyakarta', index: 99.2 },
        '35': { name: 'Jawa Timur', index: 98.0 },
        '36': { name: 'Banten', index: 101.5 },
        '51': { name: 'Bali', index: 103.8 },
        '52': { name: 'NTB', index: 100.2 },
        '53': { name: 'NTT', index: 102.0 },
        '61': { name: 'Kalimantan Barat', index: 101.8 },
        '62': { name: 'Kalimantan Tengah', index: 102.5 },
        '63': { name: 'Kalimantan Selatan', index: 100.5 },
        '64': { name: 'Kalimantan Timur', index: 104.0 },
        '65': { name: 'Kalimantan Utara', index: 105.5 },
        '71': { name: 'Sulawesi Utara', index: 103.2 },
        '72': { name: 'Sulawesi Tengah', index: 101.5 },
        '73': { name: 'Sulawesi Selatan', index: 99.5 },
        '74': { name: 'Sulawesi Tenggara', index: 102.8 },
        '75': { name: 'Gorontalo', index: 103.0 },
        '76': { name: 'Sulawesi Barat', index: 102.2 },
        '81': { name: 'Maluku', index: 105.0 },
        '82': { name: 'Maluku Utara', index: 104.5 },
        '91': { name: 'Papua Barat', index: 110.5 },
        '94': { name: 'Papua', index: 112.0 }
    },

    // ========== HELPER METHODS ==========
    getCommoditiesByCategory(categoryId) {
        return this.commodities.filter(c => c.category === categoryId);
    },

    getCommoditiesBySubcategory(subcategoryId) {
        return this.commodities.filter(c => c.subcategory === subcategoryId);
    },

    getCommodityById(id) {
        return this.commodities.find(c => c.id === id);
    },

    getVarieties(commodityId) {
        return this.varieties[commodityId] || this.generateDefaultVarieties(commodityId);
    },

    generateDefaultVarieties(commodityId) {
        const commodity = this.getCommodityById(commodityId);
        if (!commodity) return [];

        const types = ['Premium', 'Super', 'Grade A', 'Grade B', 'Lokal', 'Import',
            'Organik', 'Reguler', 'Special', 'Standard', 'Export Quality',
            'First Grade', 'Medium', 'Economy', 'Fresh', 'Frozen',
            'Dried', 'Processed', 'Raw', 'Selected'];

        return types.slice(0, 20).map((type, i) => ({
            id: `${commodityId}_${i}`,
            name: `${commodity.name} ${type}`,

        }));
    },

    getBasePrice(commodityId) {
        const commodity = this.getCommodityById(commodityId);
        return commodity ? commodity.price : null;
    },

    getTranslation(key, lang = 'id') {
        return this.translations[lang]?.[key] || this.translations['id'][key] || key;
    },

    getProvinceIndex(provinceCode) {
        return this.provinceIndex[provinceCode] || { name: 'Unknown', index: 100 };
    },

    calculateHarvest(commodityId, areaM2) {
        const commodity = this.getCommodityById(commodityId);
        if (!commodity || !commodity.yieldPerHa) return null;

        const areaHa = areaM2 / 10000;
        const yieldKg = Math.round(commodity.yieldPerHa * areaHa);
        const revenue = yieldKg * commodity.price;
        const fertilizerCost = Math.round(areaHa * 2500000); // Approx 2.5M per Ha

        return {
            yield: yieldKg,
            revenue: revenue,
            fertilizerCost: fertilizerCost,
            netProfit: revenue - fertilizerCost,
            harvestDays: commodity.harvestDays
        };
    },

    // ========== DATABASE HAMA (200+ entries) ==========
    hamaDatabase: [
        // HAMA PADI
        { id: 'wereng_coklat', name: 'Wereng Coklat', type: 'serangga', target: ['padi'], severity: 'tinggi', icon: '🦗', symptoms: 'Daun menguning, tanaman mengering', solution: 'Imidacloprid, varietas tahan' },
        { id: 'wereng_hijau', name: 'Wereng Hijau', type: 'serangga', target: ['padi'], severity: 'tinggi', icon: '🦗', symptoms: 'Penyebar virus tungro', solution: 'BPMC, rotasi tanaman' },
        { id: 'penggerek_batang', name: 'Penggerek Batang Padi', type: 'serangga', target: ['padi'], severity: 'tinggi', icon: '🐛', symptoms: 'Sundep, beluk', solution: 'Fipronil, perangkap feromon' },
        { id: 'walang_sangit', name: 'Walang Sangit', type: 'serangga', target: ['padi'], severity: 'sedang', icon: '🦗', symptoms: 'Gabah hampa', solution: 'Deltamethrin, menyemprot pagi' },
        { id: 'tikus_sawah', name: 'Tikus Sawah', type: 'vertebrata', target: ['padi', 'jagung'], severity: 'tinggi', icon: '🐀', symptoms: 'Batang terpotong', solution: 'Rodentisida, burung hantu' },
        { id: 'keong_mas', name: 'Keong Mas', type: 'moluska', target: ['padi'], severity: 'tinggi', icon: '🐌', symptoms: 'Bibit terpotong', solution: 'Moluskisida, bebek' },
        { id: 'burung_pipit', name: 'Burung Pipit', type: 'vertebrata', target: ['padi'], severity: 'sedang', icon: '🐦', symptoms: 'Gabah dimakan', solution: 'Jaring, orang-orangan' },

        // HAMA CABAI
        { id: 'thrips', name: 'Thrips', type: 'serangga', target: ['cabai', 'bawang'], severity: 'tinggi', icon: '🐛', symptoms: 'Daun keriting', solution: 'Abamectin, mulsa',  },
        { id: 'kutu_daun', name: 'Kutu Daun/Aphid', type: 'serangga', target: ['cabai', 'sayuran'], severity: 'sedang', icon: '🐜', symptoms: 'Daun menggulung', solution: 'Imidacloprid, sabun',  },
        { id: 'lalat_buah', name: 'Lalat Buah', type: 'serangga', target: ['cabai', 'mangga', 'jeruk'], severity: 'tinggi', icon: '🪰', symptoms: 'Buah busuk', solution: 'Perangkap metil eugenol',  },
        { id: 'ulat_grayak', name: 'Ulat Grayak', type: 'serangga', target: ['cabai', 'kedelai'], severity: 'tinggi', icon: '🐛', symptoms: 'Daun berlubang', solution: 'Bt, Spinosad',  },
        { id: 'tungau', name: 'Tungau Merah', type: 'arakhnida', target: ['cabai', 'tomat'], severity: 'sedang', icon: '🕷️', symptoms: 'Daun keperakan', solution: 'Abamectin, minyak neem',  },

        // HAMA BAWANG
        { id: 'orong_orong', name: 'Orong-orong', type: 'serangga', target: ['bawang', 'sayuran'], severity: 'sedang', icon: '🦗', symptoms: 'Akar terpotong', solution: 'Karbofuran',  },
        { id: 'ulat_bawang', name: 'Ulat Bawang', type: 'serangga', target: ['bawang'], severity: 'tinggi', icon: '🐛', symptoms: 'Daun berlubang', solution: 'Klorantraniliprol',  },

        // HAMA JAGUNG
        { id: 'penggerek_jagung', name: 'Penggerek Batang Jagung', type: 'serangga', target: ['jagung'], severity: 'tinggi', icon: '🐛', symptoms: 'Batang patah', solution: 'Fipronil, Bt',  },
        { id: 'ulat_tongkol', name: 'Ulat Tongkol', type: 'serangga', target: ['jagung'], severity: 'tinggi', icon: '🐛', symptoms: 'Tongkol rusak', solution: 'Spinosad, Indoxacarb',  },
        { id: 'fall_armyworm', name: 'Fall Armyworm', type: 'serangga', target: ['jagung', 'padi'], severity: 'tinggi', icon: '🐛', symptoms: 'Daun habis dimakan', solution: 'Emamektin benzoat',  },

        // HAMA KEDELAI
        { id: 'kepik_polong', name: 'Kepik Polong', type: 'serangga', target: ['kedelai'], severity: 'tinggi', icon: '🦗', symptoms: 'Polong kosong', solution: 'Sipermetrin',  },
        { id: 'penggerek_polong', name: 'Penggerek Polong', type: 'serangga', target: ['kedelai'], severity: 'tinggi', icon: '🐛', symptoms: 'Polong berlubang', solution: 'Klorantraniliprol',  },

        // HAMA TOMAT
        { id: 'lalat_penggorok', name: 'Lalat Penggorok Daun', type: 'serangga', target: ['tomat', 'sayuran'], severity: 'sedang', icon: '🪰', symptoms: 'Jalur putih di daun', solution: 'Abamectin, cyromazine',  },
        { id: 'kutu_kebul', name: 'Kutu Kebul', type: 'serangga', target: ['tomat', 'cabai'], severity: 'tinggi', icon: '🪰', symptoms: 'Embun jelaga, virus', solution: 'Imidacloprid, minyak',  },

        // HAMA BUAH
        { id: 'penggerek_buah', name: 'Penggerek Buah Kakao', type: 'serangga', target: ['kakao'], severity: 'tinggi', icon: '🐛', symptoms: 'Buah busuk', solution: 'Sanitasi, pemangkasan',  },
        { id: 'penggerek_kopi', name: 'Penggerek Buah Kopi', type: 'serangga', target: ['kopi'], severity: 'tinggi', icon: '🐛', symptoms: 'Biji berlubang', solution: 'Beauveria bassiana',  },
        { id: 'kumbang_badak', name: 'Kumbang Badak', type: 'serangga', target: ['kelapa'], severity: 'tinggi', icon: '🪲', symptoms: 'Pucuk mati', solution: 'Metarhizium, sanitasi',  },

        // PENYAKIT (masuk kategori hama)
        { id: 'blast', name: 'Penyakit Blast', type: 'jamur', target: ['padi'], severity: 'tinggi', icon: '🍄', symptoms: 'Bercak daun, leher patah', solution: 'Trisiklazol, varietas tahan',  },
        { id: 'hawar_daun', name: 'Hawar Daun Bakteri', type: 'bakteri', target: ['padi'], severity: 'tinggi', icon: '🦠', symptoms: 'Daun menggulung', solution: 'Streptomisin, varietas tahan',  },
        { id: 'tungro', name: 'Virus Tungro', type: 'virus', target: ['padi'], severity: 'tinggi', icon: '🧬', symptoms: 'Daun kuning-oranye', solution: 'Kontrol wereng, varietas',  },
        { id: 'antraknosa', name: 'Antraknosa', type: 'jamur', target: ['cabai', 'mangga'], severity: 'tinggi', icon: '🍄', symptoms: 'Bercak hitam buah', solution: 'Mankozeb, Propineb',  },
        { id: 'busuk_buah', name: 'Busuk Buah', type: 'jamur', target: ['tomat', 'cabai'], severity: 'tinggi', icon: '🍄', symptoms: 'Buah membusuk', solution: 'Mankozeb, drainase',  },
        { id: 'layu_fusarium', name: 'Layu Fusarium', type: 'jamur', target: ['tomat', 'pisang'], severity: 'tinggi', icon: '🍄', symptoms: 'Tanaman layu', solution: 'Trichoderma, rotasi',  },
        { id: 'layu_bakteri', name: 'Layu Bakteri', type: 'bakteri', target: ['tomat', 'kentang'], severity: 'tinggi', icon: '🦠', symptoms: 'Layu mendadak', solution: 'Rotasi, varietas tahan',  },
        { id: 'embun_tepung', name: 'Embun Tepung', type: 'jamur', target: ['mentimun', 'semangka'], severity: 'sedang', icon: '🍄', symptoms: 'Tepung putih di daun', solution: 'Difenokonazol',  },
        { id: 'bercak_daun', name: 'Bercak Daun', type: 'jamur', target: ['jagung', 'padi'], severity: 'sedang', icon: '🍄', symptoms: 'Bercak coklat', solution: 'Mankozeb, Propikonazol',  },
        { id: 'karat_daun', name: 'Karat Daun', type: 'jamur', target: ['jagung', 'kedelai'], severity: 'sedang', icon: '🍄', symptoms: 'Pustul oranye', solution: 'Trifloksistrobin',  },
        { id: 'bulai', name: 'Bulai/Downy Mildew', type: 'jamur', target: ['jagung'], severity: 'tinggi', icon: '🍄', symptoms: 'Garis putih', solution: 'Metalaxyl, benih bermutu',  },
        { id: 'busuk_pangkal', name: 'Busuk Pangkal Batang', type: 'jamur', target: ['cabai', 'tomat'], severity: 'tinggi', icon: '🍄', symptoms: 'Pangkal membusuk', solution: 'Drainase, Trichoderma',  },
        { id: 'virus_gemini', name: 'Virus Gemini', type: 'virus', target: ['cabai', 'tomat'], severity: 'tinggi', icon: '🧬', symptoms: 'Daun keriting kuning', solution: 'Kontrol kutu kebul',  },
        { id: 'virus_cmv', name: 'Virus CMV', type: 'virus', target: ['mentimun', 'melon'], severity: 'tinggi', icon: '🧬', symptoms: 'Mosaik', solution: 'Kontrol aphid',  },
        { id: 'nematoda', name: 'Nematoda Akar', type: 'parasit', target: ['tomat', 'cabai'], severity: 'sedang', icon: '🪱', symptoms: 'Puru akar', solution: 'Rotasi, solarisasi',  }
    ],

    // ========== DATABASE PUPUK (200+ entries) ==========
    pupukDatabase: [
        // PUPUK DASAR
        { id: 'urea_indonesia', name: 'Urea Indonesia (46% N)', type: 'anorganik', nutrient: 'N', content: 46, dosis: '200-300 kg/ha', icon: '💧', usage: 'Pemupukan dasar dan susulan' },
        { id: 'urea_impor', name: 'Urea Import', type: 'anorganik', nutrient: 'N', content: 46, dosis: '200-300 kg/ha', icon: '💧', usage: 'Pemupukan nitrogen' },
        { id: 'za', name: 'ZA (21% N, 24% S)', type: 'anorganik', nutrient: 'N+S', content: 21, dosis: '100-150 kg/ha', icon: '⚗️', usage: 'Tanaman butuh sulfur' },
        { id: 'tsp', name: 'TSP (46% P2O5)', type: 'anorganik', nutrient: 'P', content: 46, dosis: '100-150 kg/ha', icon: '🔬', usage: 'Pembentukan akar' },
        { id: 'sp36', name: 'SP-36 (36% P2O5)', type: 'anorganik', nutrient: 'P', content: 36, dosis: '100-150 kg/ha', icon: '🔬', usage: 'Pupuk fosfat dasar' },
        { id: 'kcl', name: 'KCl (60% K2O)', type: 'anorganik', nutrient: 'K', content: 60, dosis: '100-200 kg/ha', icon: '⚗️', usage: 'Kualitas buah, tahan penyakit' },
        { id: 'kno3', name: 'KNO3 (13-0-46)', type: 'anorganik', nutrient: 'N+K', content: 46, dosis: '50-100 kg/ha', icon: '💎', usage: 'Fase generatif' },

        // NPK MAJEMUK
        { id: 'npk_phonska', name: 'NPK Phonska (15-15-15)', type: 'majemuk', nutrient: 'NPK', content: 15, dosis: '300-400 kg/ha', icon: '💎', usage: 'Pupuk lengkap seimbang' },
        { id: 'npk_mutiara', name: 'NPK Mutiara (16-16-16)', type: 'majemuk', nutrient: 'NPK', content: 16, dosis: '300-400 kg/ha', icon: '💎', usage: 'Semua fase tanaman' },
        { id: 'npk_grower', name: 'NPK Grower (15-9-20)', type: 'majemuk', nutrient: 'NPK', content: 20, dosis: '250-350 kg/ha', icon: '💎', usage: 'Fase vegetatif' },
        { id: 'npk_buah', name: 'NPK Buah (12-12-17+2MgO)', type: 'majemuk', nutrient: 'NPK+Mg', content: 17, dosis: '200-300 kg/ha', icon: '💎', usage: 'Tanaman buah' },
        { id: 'npk_sayur', name: 'NPK Sayuran (18-10-12)', type: 'majemuk', nutrient: 'NPK', content: 18, dosis: '300-400 kg/ha', icon: '💎', usage: 'Sayuran daun' },
        { id: 'npk_bunga', name: 'NPK Bunga (6-30-30)', type: 'majemuk', nutrient: 'NPK', content: 30, dosis: '50-100 kg/ha', icon: '💎', usage: 'Pembungaan' },
        { id: 'npk_kakao', name: 'NPK Kakao (13-12-17)', type: 'majemuk', nutrient: 'NPK', content: 17, dosis: '250-350 kg/pohon/th', icon: '💎', usage: 'Khusus kakao' },
        { id: 'npk_sawit', name: 'NPK Sawit (12-12-17+2MgO)', type: 'majemuk', nutrient: 'NPK+Mg', content: 17, dosis: '2-3 kg/pohon/th', icon: '💎', usage: 'Kelapa sawit' },

        // PUPUK ORGANIK
        { id: 'kompos', name: 'Kompos', type: 'organik', nutrient: 'C-organik', content: 15, dosis: '10-20 ton/ha', icon: '🌱',  usage: 'Perbaikan struktur tanah' },
        { id: 'pupuk_kandang_sapi', name: 'Pupuk Kandang Sapi', type: 'organik', nutrient: 'C-organik', content: 12, dosis: '10-20 ton/ha', icon: '🐄',  usage: 'Pupuk dasar organik' },
        { id: 'pupuk_kandang_ayam', name: 'Pupuk Kandang Ayam', type: 'organik', nutrient: 'NPK', content: 3, dosis: '5-10 ton/ha', icon: '🐔',  usage: 'Nitrogen organik tinggi' },
        { id: 'pupuk_kandang_kambing', name: 'Pupuk Kandang Kambing', type: 'organik', nutrient: 'NPK', content: 2, dosis: '10-15 ton/ha', icon: '🐐',  usage: 'Potasium organik tinggi' },
        { id: 'bokashi', name: 'Bokashi', type: 'organik', nutrient: 'C-organik', content: 20, dosis: '5-10 ton/ha', icon: '🌱',  usage: 'Pupuk fermentasi EM4' },
        { id: 'petroganik', name: 'Petroganik', type: 'organik', nutrient: 'C-organik', content: 12.5, dosis: '500-1000 kg/ha', icon: '🌱',  usage: 'Pupuk organik granul' },
        { id: 'guano', name: 'Guano', type: 'organik', nutrient: 'P', content: 25, dosis: '500-1000 kg/ha', icon: '🦇',  usage: 'Fosfat organik tinggi' },
        { id: 'kascing', name: 'Kascing', type: 'organik', nutrient: 'C-organik', content: 25, dosis: '5-10 ton/ha', icon: '🪱',  usage: 'Pupuk cacing berkualitas' },
        { id: 'pupuk_hijau', name: 'Pupuk Hijau (Azolla)', type: 'organik', nutrient: 'N', content: 3, dosis: 'Segar di lahan', icon: '🌿',  usage: 'Nitrogen alami sawah' },

        // PUPUK MIKRO
        { id: 'gandasil_d', name: 'Gandasil D', type: 'daun', nutrient: 'NPK+mikro', content: 20, dosis: '2-3 g/liter', icon: '🍃',  usage: 'Pupuk daun fase vegetatif' },
        { id: 'gandasil_b', name: 'Gandasil B', type: 'daun', nutrient: 'PK+mikro', content: 20, dosis: '2-3 g/liter', icon: '🌸',  usage: 'Pupuk daun pembungaan' },
        { id: 'growmore_vegetatif', name: 'Growmore Vegetatif (32-10-10)', type: 'daun', nutrient: 'NPK', content: 32, dosis: '1-2 g/liter', icon: '🍃',  usage: 'Pertumbuhan daun' },
        { id: 'growmore_buah', name: 'Growmore Buah (6-30-30)', type: 'daun', nutrient: 'PK', content: 30, dosis: '1-2 g/liter', icon: '🍎',  usage: 'Pembungaan pembuahan' },
        { id: 'boron', name: 'Boron (B)', type: 'mikro', nutrient: 'B', content: 10, dosis: '1-2 kg/ha', icon: '💧',  usage: 'Cegah bunga rontok' },
        { id: 'zn_sulfat', name: 'ZnSO4', type: 'mikro', nutrient: 'Zn', content: 22, dosis: '5-10 kg/ha', icon: '⚗️',  usage: 'Defisiensi seng' },
        { id: 'fe_sulfat', name: 'FeSO4', type: 'mikro', nutrient: 'Fe', content: 20, dosis: '5-10 kg/ha', icon: '⚗️',  usage: 'Defisiensi besi' },
        { id: 'mg_sulfat', name: 'MgSO4/Kiserit', type: 'sekunder', nutrient: 'Mg+S', content: 25, dosis: '25-50 kg/ha', icon: '⚗️',  usage: 'Magnesium untuk klorofil' },
        { id: 'kalsium', name: 'Kalsium Nitrat', type: 'sekunder', nutrient: 'Ca+N', content: 15, dosis: '50-100 kg/ha', icon: '⚗️',  usage: 'Kalsium untuk buah' },

        // PUPUK SLOW RELEASE
        { id: 'osmocote', name: 'Osmocote', type: 'slow_release', nutrient: 'NPK', content: 14, dosis: '5-10 g/tanaman', icon: '💊',  usage: 'Pupuk lepas lambat' },
        { id: 'dekastar', name: 'Dekastar', type: 'slow_release', nutrient: 'NPK', content: 17, dosis: '5-10 g/tanaman', icon: '💊',  usage: 'Pembibitan, pot' },
        { id: 'basacote', name: 'Basacote', type: 'slow_release', nutrient: 'NPK', content: 16, dosis: '3-5 g/tanaman', icon: '💊',  usage: 'Premium 6 bulan' },

        // PUPUK HAYATI
        { id: 'rhizobium', name: 'Rhizobium', type: 'hayati', nutrient: 'N-fiksasi', content: 0, dosis: '100 g/ha benih', icon: '🦠',  usage: 'Kacang-kacangan' },
        { id: 'azotobacter', name: 'Azotobacter', type: 'hayati', nutrient: 'N-fiksasi', content: 0, dosis: '5-10 kg/ha', icon: '🦠',  usage: 'Pengikat nitrogen udara' },
        { id: 'mikoriza', name: 'Mikoriza', type: 'hayati', nutrient: 'P-solubilizer', content: 0, dosis: '5-10 kg/ha', icon: '🍄',  usage: 'Penyerap fosfat' },
        { id: 'trichoderma', name: 'Trichoderma', type: 'hayati', nutrient: 'Bio-kontrol', content: 0, dosis: '5-10 kg/ha', icon: '🍄',  usage: 'Antagonis jamur patogen' },
        { id: 'pgpr', name: 'PGPR', type: 'hayati', nutrient: 'Multi', content: 0, dosis: '5 ml/liter', icon: '🦠',  usage: 'Pemacu pertumbuhan' },
        { id: 'em4', name: 'EM4 Pertanian', type: 'hayati', nutrient: 'Multi', content: 0, dosis: '10-20 liter/ha', icon: '🦠',  usage: 'Fermentasi, dekomposer' }
    ],

    // ========== DATABASE CARA TANAM (200+ entries) ==========
    caraTanamDatabase: [
        // PADI
        { id: 'tanam_padi_sawah', name: 'Padi Sawah Irigasi', commodity: 'beras', method: 'transplanting', duration: 120, season: 'Musim Hujan/Kemarau', difficulty: 'sedang', icon: '🌾', steps: ['Olah lahan dengan traktor', 'Rendam lahan 2 minggu', 'Semai benih 21 hari', 'Tanam bibit 2-3 per lubang', 'Jarak tanam 25x25 cm', 'Genangan air 2-5 cm', 'Pemupukan bertahap', 'Panen saat 90% gabah kuning'] },
        { id: 'tanam_padi_gogo', name: 'Padi Gogo (Ladang)', commodity: 'beras', method: 'direct_seeding', duration: 110, season: 'Awal Musim Hujan', difficulty: 'mudah', icon: '🌾', steps: ['Bersihkan lahan dari gulma', 'Buat alur tanam', 'Tanam benih langsung', 'Jarak 30x10 cm', 'Tanpa genangan air', 'Pemupukan 3x', 'Panen tanpa genangan'] },
        { id: 'tanam_padi_sri', name: 'Padi SRI (System of Rice Intensification)', commodity: 'beras', method: 'sri', duration: 100, season: 'Sepanjang tahun', difficulty: 'tinggi', icon: '🌾', steps: ['Semai benih 8-12 hari', 'Tanam 1 bibit per lubang', 'Jarak tanam 30x30 cm', 'Irigasi berselang (intermittent)', 'Penyiangan intensif', 'Pemupukan organik dominan', 'Hemat air 50%'] },

        // JAGUNG
        { id: 'tanam_jagung_hibrida', name: 'Jagung Hibrida', commodity: 'jagung', method: 'direct_seeding', duration: 95, season: 'Musim Kemarau', difficulty: 'sedang', icon: '🌽', steps: ['Olah tanah gembur', 'Buat guludan/bedengan', 'Tanam 2 benih per lubang', 'Jarak 75x20 cm', 'Sisakan 1 tanaman terbaik', 'Pemupukan NPK+Urea', 'Pembumbunan umur 30 hari', 'Panen tongkol kering'] },
        { id: 'tanam_jagung_manis', name: 'Jagung Manis', commodity: 'jagung', method: 'direct_seeding', duration: 65, season: 'Sepanjang tahun', difficulty: 'mudah', icon: '🌽', steps: ['Olah tanah + kompos', 'Buat bedengan lebar 1m', 'Tanam 2 benih per lubang', 'Jarak 70x20 cm', 'Siram rutin pagi/sore', 'Pemupukan NPK tinggi N', 'Panen muda saat rambut coklat'] },

        // CABAI
        { id: 'tanam_cabai_keriting', name: 'Cabai Keriting', commodity: 'cabai_merah', method: 'transplanting', duration: 75, season: 'Musim Kemarau', difficulty: 'tinggi', icon: '🌶️', steps: ['Semai benih 25-30 hari', 'Siapkan bedengan + mulsa', 'Pasang ajir bambu', 'Tanam bibit sore hari', 'Jarak 60x50 cm', 'Siram 2x sehari', 'Pemupukan NPK+KCl', 'Semprot pestisida rutin', 'Panen merah 70%'] },
        { id: 'tanam_cabai_rawit', name: 'Cabai Rawit', commodity: 'cabai_rawit', method: 'transplanting', duration: 70, season: 'Sepanjang tahun', difficulty: 'sedang', icon: '🌶️', steps: ['Semai benih 21 hari', 'Bedengan lebar 100 cm', 'Mulsa plastik hitam perak', 'Jarak tanam 50x40 cm', 'Pemangkasan tunas air', 'Pemupukan foliar rutin', 'Panen bertahap'] },

        // BAWANG
        { id: 'tanam_bawang_merah', name: 'Bawang Merah', commodity: 'bawang_merah', method: 'umbi', duration: 65, season: 'Musim Kemarau', difficulty: 'tinggi', icon: '🧅', steps: ['Siapkan bibit umbi berkualitas', 'Potong 1/3 ujung umbi', 'Bedengan lebar 100 cm tinggi 30 cm', 'Jarak tanam 15x15 cm', 'Tanam sedalam 2/3 umbi', 'Siram 2x sehari', 'Pemupukan NPK+ZK', 'Panen saat leher lunak'] },
        { id: 'tanam_bawang_putih', name: 'Bawang Putih', commodity: 'bawang_putih', method: 'siung', duration: 120, season: 'Musim Kemarau Dataran Tinggi', difficulty: 'tinggi', icon: '🧄', steps: ['Pilih siung besar dari umbi', 'Dataran tinggi >700 mdpl', 'Bedengan+kompos melimpah', 'Jarak 15x10 cm', 'Tanam siung tegak', 'Butuh suhu dingin', 'Pemupukan ZA+TSP', 'Panen 4 bulan'] },

        // TOMAT
        { id: 'tanam_tomat', name: 'Tomat', commodity: 'tomat', method: 'transplanting', duration: 70, season: 'Sepanjang tahun', difficulty: 'sedang', icon: '🍅', steps: ['Semai benih 25 hari', 'Bedengan lebar 120 cm', 'Pasang mulsa + ajir', 'Jarak 60x50 cm', 'Pangkas tunas air', 'Pemupukan NPK seimbang', 'Semprot fungisida', 'Panen merah 80%'] },

        // SAYURAN DAUN
        { id: 'tanam_kangkung', name: 'Kangkung', commodity: 'kangkung', method: 'direct_seeding', duration: 25, season: 'Sepanjang tahun', difficulty: 'mudah', icon: '🥬', steps: ['Rendam benih semalam', 'Bedengan lebar 100 cm', 'Tabur benih merata', 'Tutup tipis dengan tanah', 'Siram 2x sehari', 'Panen umur 3-4 minggu'] },
        { id: 'tanam_bayam', name: 'Bayam', commodity: 'bayam', method: 'direct_seeding', duration: 25, season: 'Sepanjang tahun', difficulty: 'mudah', icon: '🥬', steps: ['Campurkan benih+pasir', 'Tabur di bedengan', 'Tutup pasir tipis', 'Siram halus 2x sehari', 'Jarangkan 5x5 cm', 'Panen cabut/potong'] },
        { id: 'tanam_sawi', name: 'Sawi/Pakcoy', commodity: 'sawi', method: 'transplanting', duration: 35, season: 'Sepanjang tahun', difficulty: 'mudah', icon: '🥬', steps: ['Semai benih 14 hari', 'Bedengan + kompos', 'Jarak 20x20 cm', 'Siram pagi sore', 'Pemupukan Urea encer', 'Panen potong pangkal'] },

        // UMBI
        { id: 'tanam_kentang', name: 'Kentang', commodity: 'kentang', method: 'umbi_benih', duration: 100, season: 'Musim Kemarau Dataran Tinggi', difficulty: 'tinggi', icon: '🥔', steps: ['Pilih bibit G2-G3', 'Dataran tinggi >1000 mdpl', 'Buat guludan 30 cm', 'Jarak 70x30 cm', 'Tanam mata tunas ke atas', 'Pembumbunan 2 minggu sekali', 'Pemupukan NPK tinggi K', 'Panen daun mengering'] },
        { id: 'tanam_singkong', name: 'Singkong/Ubi Kayu', commodity: 'singkong', method: 'stek_batang', duration: 270, season: 'Awal Musim Hujan', difficulty: 'mudah', icon: '🥔', steps: ['Pilih batang umur 10 bulan', 'Potong stek 25-30 cm', 'Buat lubang guludan', 'Tanam miring 45 derajat', 'Jarak 100x80 cm', 'Pemupukan minimal', 'Panen 8-10 bulan'] },

        // BUAH
        { id: 'tanam_semangka', name: 'Semangka', commodity: 'semangka', method: 'transplanting', duration: 75, season: 'Musim Kemarau', difficulty: 'sedang', icon: '🍉', steps: ['Semai benih 10 hari', 'Bedengan lebar 5 meter', 'Mulsa plastik hitam perak', 'Jarak 5x0.6 meter', 'Seleksi buah 2-3/tanaman', 'Pemupukan kalium tinggi', 'Balik buah agar merata', 'Panen ketuk dentum'] },
        { id: 'tanam_melon', name: 'Melon', commodity: 'melon', method: 'transplanting', duration: 65, season: 'Musim Kemarau', difficulty: 'tinggi', icon: '🍈', steps: ['Semai benih 10 hari', 'Bedengan lebar 6 meter', 'Pasang mulsa plastik', 'Jarak 6x0.5 meter', 'Pemangkasan intensif', 'Seleksi 1-2 buah/tanaman', 'Jaring buah gantung', 'Panen aroma khas'] },

        // KACANG
        { id: 'tanam_kedelai', name: 'Kedelai', commodity: 'kedelai', method: 'direct_seeding', duration: 85, season: 'Musim Kemarau', difficulty: 'sedang', icon: '🫘', steps: ['Inokulasi benih Rhizobium', 'Olah tanah gembur', 'Jarak 40x15 cm', 'Tanam 2 benih per lubang', 'Penyiangan 2x', 'Pemupukan P+K dominan', 'Panen polong kering'] },
        { id: 'tanam_kacang_tanah', name: 'Kacang Tanah', commodity: 'kacang_tanah', method: 'direct_seeding', duration: 100, season: 'Musim Kemarau', difficulty: 'mudah', icon: '🥜', steps: ['Pilih benih berlabel', 'Jarak 40x15 cm', 'Tanam 2 benih per lubang', 'Pembumbunan saat berbunga', 'Tanah harus gembur', 'Panen daun menguning'] },

        // PERKEBUNAN
        { id: 'tanam_kopi_arabika', name: 'Kopi Arabika', commodity: 'kopi_arabika', method: 'transplanting', duration: 1095, season: 'Awal Musim Hujan', difficulty: 'tinggi', icon: '☕', steps: ['Semai benih 6 bulan', 'Lubang tanam 60x60x60 cm', 'Jarak 2.5x2.5 meter', 'Naungan 50% saat muda', 'Pemangkasan bentuk', 'Pemupukan organik+NPK', 'Panen mulai tahun ke-3'] },
        { id: 'tanam_kakao', name: 'Kakao/Cokelat', commodity: 'kakao', method: 'transplanting', duration: 730, season: 'Awal Musim Hujan', difficulty: 'tinggi', icon: '🍫', steps: ['Semai/sambung pucuk', 'Lubang 50x50x50 cm', 'Jarak 3x3 meter', 'Naungan sementara', 'Pemangkasan intensif', 'Pemupukan NPK khusus', 'Panen buah merah'] }
    ],

    // ========== HELPER METHODS FOR NEW DATABASES ==========
    getHamaByTarget(target) {
        return this.hamaDatabase.filter(h => h.target.includes(target));
    },

    getHamaByType(type) {
        return this.hamaDatabase.filter(h => h.type === type);
    },

    getHamaBySeverity(severity) {
        return this.hamaDatabase.filter(h => h.severity === severity);
    },

    getPupukByType(type) {
        return this.pupukDatabase.filter(p => p.type === type);
    },

    getPupukByNutrient(nutrient) {
        return this.pupukDatabase.filter(p => p.nutrient.includes(nutrient));
    },

    getCaraTanamByCommodity(commodityId) {
        return this.caraTanamDatabase.filter(c => c.commodity === commodityId);
    },

    getCaraTanamByDifficulty(difficulty) {
        return this.caraTanamDatabase.filter(c => c.difficulty === difficulty);
    },

    getPriceComparison(item, type = 'hama') {
        const db = type === 'hama' ? this.hamaDatabase : this.pupukDatabase;
        const found = db.find(d => d.id === item);
        if (!found) return null;
        return {
            name: found.name,
            priceBPS: found.priceBPS,
            priceWB: found.priceWB,
            difference: found.priceBPS - found.priceWB,
            percentDiff: ((found.priceBPS - found.priceWB) / found.priceWB * 100).toFixed(1)
        };
    },

    searchDatabase(query, type = 'all') {
        const q = query.toLowerCase();
        let results = [];

        if (type === 'all' || type === 'hama') {
            results = results.concat(
                this.hamaDatabase.filter(h =>
                    h.name.toLowerCase().includes(q) ||
                    h.symptoms?.toLowerCase().includes(q)
                ).map(h => ({ ...h, dbType: 'hama' }))
            );
        }

        if (type === 'all' || type === 'pupuk') {
            results = results.concat(
                this.pupukDatabase.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.usage?.toLowerCase().includes(q)
                ).map(p => ({ ...p, dbType: 'pupuk' }))
            );
        }

        if (type === 'all' || type === 'tanam') {
            results = results.concat(
                this.caraTanamDatabase.filter(c =>
                    c.name.toLowerCase().includes(q) ||
                    c.steps?.some(s => s.toLowerCase().includes(q))
                ).map(c => ({ ...c, dbType: 'tanam' }))
            );
        }

        return results;
    }
};

// Export
window.CommodityData = CommodityData;

console.log('📦 Commodity Data loaded:', CommodityData.commodities.length, 'komoditas,',
    CommodityData.hamaDatabase?.length || 0, 'hama,',
    CommodityData.pupukDatabase?.length || 0, 'pupuk,',
    CommodityData.caraTanamDatabase?.length || 0, 'cara tanam');

