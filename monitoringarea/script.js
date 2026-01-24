/* ================================================
   TANIKU MONITOR - MAIN APPLICATION
   5-Tab Navigation System
   ================================================ */

const TanikuApp = {
    state: {
        currentLang: 'id',
        currentTab: 'tabMusic',
        currentCategory: 'komoditas',
        currentSubcategory: 'all',
        currentCommodity: null,
        currentLocation: null,
        musicPlaylist: [],
        currentTrackIndex: 0,
        isPlaying: false,
        priceChart: null,
        detailChart: null,
        map: null,
        indonesiaLayer: null
    },

    // Commodity icons mapping
    icons: {
        'beras': 'https://img.icons8.com/fluency/96/rice-bowl.png',
        'jagung': 'https://img.icons8.com/fluency/96/corn.png',
        'cabai_merah': 'https://img.icons8.com/fluency/96/chili-pepper.png',
        'cabai_rawit': 'https://img.icons8.com/fluency/96/chili-pepper.png',
        'bawang_merah': 'https://img.icons8.com/fluency/96/onion.png',
        'bawang_putih': 'https://img.icons8.com/fluency/96/garlic.png',
        'tomat': 'https://img.icons8.com/fluency/96/tomato.png',
        'kentang': 'https://img.icons8.com/fluency/96/potato.png',
        'wortel': 'https://img.icons8.com/fluency/96/carrot.png',
        'pisang': 'https://img.icons8.com/fluency/96/banana.png',
        'jeruk': 'https://img.icons8.com/fluency/96/orange.png',
        'apel': 'https://img.icons8.com/fluency/96/apple.png',
        'mangga': 'https://img.icons8.com/fluency/96/mango.png',
        'semangka': 'https://img.icons8.com/fluency/96/watermelon.png',
        'daging_sapi': 'https://img.icons8.com/fluency/96/steak.png',
        'daging_ayam': 'https://img.icons8.com/fluency/96/chicken-leg.png',
        'telur_ayam': 'https://img.icons8.com/fluency/96/eggs.png',
        'ikan_lele': 'https://img.icons8.com/fluency/96/fish.png',
        'udang': 'https://img.icons8.com/fluency/96/shrimp.png',
        'kopi_arabika': 'https://img.icons8.com/fluency/96/coffee-beans.png',
        'kopi_robusta': 'https://img.icons8.com/fluency/96/coffee-beans.png',
        'kakao': 'https://img.icons8.com/fluency/96/cocoa.png',
        'susu_segar': 'https://img.icons8.com/fluency/96/milk-bottle.png',
        'teh': 'https://img.icons8.com/fluency/96/tea.png',
        'gula': 'https://img.icons8.com/fluency/96/sugar.png',
        'minyak_goreng': 'https://img.icons8.com/fluency/96/olive-oil.png',
        'urea': 'https://img.icons8.com/fluency/96/fertilizer-bag.png',
        'npk': 'https://img.icons8.com/fluency/96/fertilizer-bag.png',
        'default': 'https://img.icons8.com/fluency/96/ingredients.png'
    },

    async init() {
        console.log('🌾 Taniku Monitor v2.0 starting...');
        AnimationEngine.showLoading('Memuat aplikasi...');

        try {
            this.initTabNavigation();
            this.initLanguageSelector();
            this.initMusicPlayer();
            this.initCommoditySystem();
            this.initCalculator();
            this.initDashboard();
            await this.initMap();
            await this.initLocation();

            AnimationEngine.hideLoading();
            AnimationEngine.showToast('Selamat datang! 🌾', 'success');
        } catch (error) {
            console.error('Init error:', error);
            AnimationEngine.hideLoading();
        }
    },

    // ========== TAB NAVIGATION ==========
    initTabNavigation() {
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);

                // Update active state
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    },

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId)?.classList.add('active');
        this.state.currentTab = tabId;

        // Special handling
        if (tabId === 'tabMap' && this.state.map) {
            setTimeout(() => this.state.map.invalidateSize(), 100);
        }
        if (tabId === 'tabDashboard' && this.state.priceChart) {
            this.updateDashboard();
        }
    },

    // ========== LANGUAGE SELECTOR ==========
    initLanguageSelector() {
        document.querySelectorAll('.lang-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.setLanguage(card.dataset.lang);
            });
        });
    },

    setLanguage(lang) {
        this.state.currentLang = lang;
        localStorage.setItem('tanikuLanguage', lang);

        // Complete translations dictionary
        const translations = {
            id: {
                // Tabs
                home: 'Home', komoditas: 'Komoditas', peta: 'Peta', info: 'Info',
                hitung: 'Hitung', ai: 'AI', setting: 'Setting', cari: 'Cari...',
                // Dashboard
                dashboard: 'Dashboard', ihg: 'Indeks Harga', cuaca: 'Cuaca',
                termurah: 'Termurah', termahal: 'Termahal', kurs: 'Kurs',
                pergerakan: 'Pergerakan Harga',
                // Info tab
                pupuk: 'Pupuk', hama: 'Hama', tanam: 'Cara Tanam', tanaman: 'Tanaman',
                info_pertanian: 'Info Pertanian', cari_info: 'Cari tanaman, hama, pupuk...',
                // Calculator
                kalkulator: 'Kalkulator Tani', luas: 'Luas Lahan', hasil: 'Hasil Panen',
                pendapatan: 'Pendapatan', biaya: 'Biaya', keuntungan: 'Keuntungan',
                // Server
                server_control: '🖥️ Kontrol Server Export', server_offline: 'Server: Offline',
                server_online: 'Server: Online', start_server: 'Mulai Server',
                stop_server: 'Hentikan Server', quick_download: '📥 Download Cepat',
                download_plants: 'Tanaman', download_fertilizer: 'Pupuk',
                download_pesticide: 'Pestisida', download_all: 'Semua Data',
                // Settings
                pilih_bahasa: 'Pilih Bahasa', pengaturan_ai: 'Pengaturan AI API',
                about_app: 'Tentang Aplikasi', about_desc: 'Monitoring harga komoditas Indonesia dengan AI, data BPS, World Bank, dan Wikipedia.',
                // Common
                simpan: 'Simpan', batal: 'Batal', lihat: 'Lihat', tutup: 'Tutup'
            },
            jv: {
                home: 'Wiwitan', komoditas: 'Komoditas', peta: 'Peta', info: 'Katrangan',
                hitung: 'Etung', ai: 'AI', setting: 'Setelan', cari: 'Goleki...',
                dashboard: 'Dasbor', ihg: 'Indeks Rega', cuaca: 'Cuaca',
                termurah: 'Paling Murah', termahal: 'Paling Larang', kurs: 'Kurs',
                pergerakan: 'Owah-owahan Rega',
                pupuk: 'Rabuk', hama: 'Ama', tanam: 'Cara Nandur', tanaman: 'Tanduran',
                info_pertanian: 'Info Pertanian', cari_info: 'Goleki tanduran, ama, rabuk...',
                kalkulator: 'Kalkulator Tani', luas: 'Jembar Sawah', hasil: 'Asil Panen',
                pendapatan: 'Penghasilan', biaya: 'Ragad', keuntungan: 'Bathi',
                server_control: '🖥️ Kontrol Server Export', server_offline: 'Server: Mati',
                server_online: 'Server: Urip', start_server: 'Wiwiti Server',
                stop_server: 'Mandeki Server', quick_download: '📥 Download Cepet',
                download_plants: 'Tanduran', download_fertilizer: 'Rabuk',
                download_pesticide: 'Racun', download_all: 'Kabeh Data',
                pilih_bahasa: 'Pilih Basa', pengaturan_ai: 'Setelan AI API',
                about_app: 'Babagan Aplikasi', about_desc: 'Monitoring rega komoditas Indonesia karo AI, data BPS, World Bank, lan Wikipedia.',
                simpan: 'Simpen', batal: 'Batal', lihat: 'Deleng', tutup: 'Tutup'
            },
            en: {
                home: 'Home', komoditas: 'Commodities', peta: 'Map', info: 'Info',
                hitung: 'Calculate', ai: 'AI', setting: 'Settings', cari: 'Search...',
                dashboard: 'Dashboard', ihg: 'Price Index', cuaca: 'Weather',
                termurah: 'Cheapest', termahal: 'Most Expensive', kurs: 'Exchange',
                pergerakan: 'Price Movement',
                pupuk: 'Fertilizer', hama: 'Pests', tanam: 'Planting Guide', tanaman: 'Plants',
                info_pertanian: 'Agriculture Info', cari_info: 'Search plants, pests, fertilizers...',
                kalkulator: 'Farm Calculator', luas: 'Land Area', hasil: 'Harvest Result',
                pendapatan: 'Revenue', biaya: 'Cost', keuntungan: 'Profit',
                server_control: '🖥️ Export Server Control', server_offline: 'Server: Offline',
                server_online: 'Server: Online', start_server: 'Start Server',
                stop_server: 'Stop Server', quick_download: '📥 Quick Download',
                download_plants: 'Plants', download_fertilizer: 'Fertilizers',
                download_pesticide: 'Pesticides', download_all: 'All Data',
                pilih_bahasa: 'Select Language', pengaturan_ai: 'AI API Settings',
                about_app: 'About App', about_desc: 'Indonesia commodity price monitoring with AI, BPS data, World Bank, and Wikipedia.',
                simpan: 'Save', batal: 'Cancel', lihat: 'View', tutup: 'Close'
            },
            lp: {
                home: 'Mulang', komoditas: 'Komoditas', peta: 'Peta', info: 'Kabar',
                hitung: 'Hitung', ai: 'AI', setting: 'Pengaturan', cari: 'Cakak...',
                dashboard: 'Dasbor', ihg: 'Indeks Harga', cuaca: 'Cuaca',
                termurah: 'Paling Murah', termahal: 'Paling Mahal', kurs: 'Kurs',
                pergerakan: 'Pergerakan Harga',
                pupuk: 'Pupuk', hama: 'Hama', tanam: 'Tata Menanam', tanaman: 'Muwari',
                info_pertanian: 'Info Pertanian', cari_info: 'Cakak muwari, hama, pupuk...',
                kalkulator: 'Kalkulator Tani', luas: 'Luas Sabah', hasil: 'Hasil Panen',
                pendapatan: 'Pendapatan', biaya: 'Biaya', keuntungan: 'Untung',
                server_control: '🖥️ Kontrol Server Export', server_offline: 'Server: Mati',
                server_online: 'Server: Hidup', start_server: 'Mulai Server',
                stop_server: 'Hentikan Server', quick_download: '📥 Download Cepat',
                download_plants: 'Muwari', download_fertilizer: 'Pupuk',
                download_pesticide: 'Racun', download_all: 'Semua Data',
                pilih_bahasa: 'Pilih Bahasa', pengaturan_ai: 'Pengaturan AI API',
                about_app: 'Tentang Aplikasi', about_desc: 'Monitoring harga komoditas Indonesia dengan AI, data BPS, World Bank, dan Wikipedia.',
                simpan: 'Simpan', batal: 'Batal', lihat: 'Lihat', tutup: 'Tutup'
            }
        };

        const t = translations[lang] || translations.id;

        // Update tab labels
        document.querySelectorAll('.tab-item').forEach(tab => {
            const tabId = tab.dataset.tab;
            if (tabId === 'tabDashboard') tab.querySelector('.tab-label').textContent = t.home;
            if (tabId === 'tabKomoditas') tab.querySelector('.tab-label').textContent = t.komoditas;
            if (tabId === 'tabMap') tab.querySelector('.tab-label').textContent = t.peta;
            if (tabId === 'tabInfo') tab.querySelector('.tab-label').textContent = t.info;
            if (tabId === 'tabCalculator') tab.querySelector('.tab-label').textContent = t.hitung;
            if (tabId === 'tabChatbot') tab.querySelector('.tab-label').textContent = t.ai;
            if (tabId === 'tabSettings') tab.querySelector('.tab-label').textContent = t.setting;
        });

        // Update all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });

        // Update search placeholders
        document.querySelectorAll('.search-input').forEach(input => {
            input.placeholder = t.cari;
        });

        // Update info search placeholder
        const infoSearch = document.getElementById('infoSearch');
        if (infoSearch) infoSearch.placeholder = t.cari_info;

        // Update section headers
        document.querySelectorAll('.tab-title').forEach(title => {
            if (title.textContent.includes('Info')) title.innerHTML = `📚 ${t.info_pertanian}`;
            if (title.textContent.includes('Hitung') || title.textContent.includes('Calc')) title.innerHTML = `🧮 ${t.kalkulator}`;
        });

        // Update info category buttons
        document.querySelectorAll('.info-cat').forEach(btn => {
            const cat = btn.dataset.info;
            if (cat === 'tanaman') btn.innerHTML = `🌱 ${t.tanaman}`;
            if (cat === 'hama') btn.innerHTML = `🐛 ${t.hama}`;
            if (cat === 'pupuk') btn.innerHTML = `🧪 ${t.pupuk}`;
            if (cat === 'tanam') btn.innerHTML = `🌾 ${t.tanam}`;
        });

        // Re-render lists with new language
        this.renderCommodityList();
        if (this.loadPestInfo) this.loadPestInfo();
        if (this.loadFertilizerInfo) this.loadFertilizerInfo();

        AnimationEngine.showToast(`Bahasa diubah: ${this.getLangName(lang)} ✅`, 'success');
    },

    getLangName(code) {
        const names = { id: 'Indonesia', jv: 'Jawa', en: 'English', lp: 'Lampung' };
        return names[code] || code;
    },

    // ========== MUSIC PLAYER ==========
    initMusicPlayer() {
        const audio = document.getElementById('audioPlayer');

        document.getElementById('searchMusicBtn')?.addEventListener('click', () => this.searchMusic());
        document.getElementById('musicSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchMusic();
        });

        document.getElementById('playPauseBtn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.playPrev());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.playNext());

        audio?.addEventListener('ended', () => this.playNext());
        audio?.addEventListener('play', () => {
            this.state.isPlaying = true;
            document.getElementById('playPauseBtn').textContent = '⏸️';
        });
        audio?.addEventListener('pause', () => {
            this.state.isPlaying = false;
            document.getElementById('playPauseBtn').textContent = '▶️';
        });
    },

    async searchMusic() {
        const query = document.getElementById('musicSearch')?.value;
        if (!query) return;

        AnimationEngine.showLoading('Mencari musik...');
        const results = await APIService.searchMusic(query);
        this.state.musicPlaylist = results;
        AnimationEngine.hideLoading();

        if (results.length > 0) {
            this.renderMusicList();
            this.playTrack(0);
            AnimationEngine.showToast(`${results.length} lagu ditemukan 🎵`, 'success');
        } else {
            AnimationEngine.showToast('Tidak ada hasil', 'warning');
        }
    },

    renderMusicList() {
        const container = document.getElementById('musicList');
        if (!container) return;

        container.innerHTML = this.state.musicPlaylist.slice(0, 10).map((track, i) => `
            <div class="music-item ${i === this.state.currentTrackIndex ? 'playing' : ''}" onclick="TanikuApp.playTrack(${i})">
                <img src="${track.artwork}" alt="${track.name}">
                <div class="music-item-info">
                    <div class="music-item-title">${track.name}</div>
                    <div class="music-item-artist">${track.artist}</div>
                </div>
            </div>
        `).join('');
    },

    playTrack(index) {
        const track = this.state.musicPlaylist[index];
        if (!track) return;

        const audio = document.getElementById('audioPlayer');
        audio.src = track.previewUrl;
        audio.play();

        this.state.currentTrackIndex = index;
        document.getElementById('musicTitle').textContent = track.name;
        document.getElementById('musicArtist').textContent = track.artist;
        document.getElementById('playerArt').src = track.artwork;

        this.renderMusicList();
    },

    togglePlay() {
        const audio = document.getElementById('audioPlayer');
        this.state.isPlaying ? audio.pause() : audio.play();
    },

    playNext() {
        let next = this.state.currentTrackIndex + 1;
        if (next >= this.state.musicPlaylist.length) next = 0;
        this.playTrack(next);
    },

    playPrev() {
        let prev = this.state.currentTrackIndex - 1;
        if (prev < 0) prev = this.state.musicPlaylist.length - 1;
        this.playTrack(prev);
    },

    // ========== COMMODITY SYSTEM ==========
    initCommoditySystem() {
        // Category pills
        document.querySelectorAll('.pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.state.currentCategory = pill.dataset.cat;
                this.updateSubcategories();
                this.renderCommodities();
            });
        });

        // Subcategory chips
        document.querySelectorAll('.subcat-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.subcat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.currentSubcategory = chip.dataset.sub;
                this.renderCommodities();
            });
        });

        // Modal close
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('commodityModal')?.classList.add('hidden');
        });

        // Initial render
        this.renderCommodities();
    },

    updateSubcategories() {
        const scroll = document.getElementById('subcategoryScroll');
        if (!scroll) return;

        const cat = this.state.currentCategory;
        const subcats = cat === 'komoditas'
            ? ['all', 'bahan_pokok', 'sayuran', 'buah', 'protein', 'minuman', 'bumbu']
            : ['all', 'pupuk_organik', 'pupuk_anorganik', 'pestisida', 'herbisida', 'fungisida'];

        const names = CommodityData.subcategories;
        scroll.innerHTML = subcats.map((sub, i) => `
            <button class="subcat-chip ${i === 0 ? 'active' : ''}" data-sub="${sub}">
                ${sub === 'all' ? 'Semua' : (names[sub]?.name?.id || sub)}
            </button>
        `).join('');

        scroll.querySelectorAll('.subcat-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                scroll.querySelectorAll('.subcat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.currentSubcategory = chip.dataset.sub;
                this.renderCommodities();
            });
        });
    },

    renderCommodities() {
        const container = document.getElementById('commodityGrid');
        if (!container) return;

        let items = CommodityData.getCommoditiesByCategory(this.state.currentCategory);
        if (this.state.currentSubcategory !== 'all') {
            items = items.filter(c => c.subcategory === this.state.currentSubcategory);
        }

        container.innerHTML = items.map((item, i) => {
            const change = (Math.random() - 0.5) * 10;
            const changeClass = change >= 0 ? 'up' : 'down';
            const changeText = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
            const icon = this.icons[item.id] || this.icons.default;

            return `
                <div class="commodity-card" style="animation-delay: ${i * 50}ms" onclick="TanikuApp.showDetail('${item.id}')">
                    <div class="icon-wrap">
                        <img src="${icon}" alt="${item.name}">
                    </div>
                    <h4>${item.name}</h4>
                    <div class="price">
                        ${APIService.formatPrice(item.basePrice)}
                        <span class="change ${changeClass}">${changeText}</span>
                    </div>
                    <div class="unit">per ${item.unit}</div>
                </div>
            `;
        }).join('');
    },

    async showDetail(commodityId) {
        const item = CommodityData.getCommodityById(commodityId);
        if (!item) return;

        this.state.currentCommodity = commodityId;
        const modal = document.getElementById('commodityModal');
        modal?.classList.remove('hidden');

        // Update detail
        const icon = this.icons[item.id] || this.icons.default;
        document.getElementById('detailIcon').src = icon;
        document.getElementById('detailName').textContent = item.name;
        document.getElementById('detailCategory').textContent = CommodityData.subcategories[item.subcategory]?.name?.id || item.subcategory;
        document.getElementById('detailPrice').textContent = APIService.formatPrice(item.basePrice);

        const change = (Math.random() - 0.5) * 10;
        const changeEl = document.getElementById('detailChange');
        changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
        changeEl.className = 'price-badge ' + (change >= 0 ? 'up' : 'down');

        // Load wiki
        const wikiText = document.getElementById('wikiText');
        wikiText.textContent = 'Memuat deskripsi...';
        const wiki = await APIService.fetchWikiSummary(item.name);
        wikiText.textContent = wiki.extract;

        // Render varieties
        this.renderVarieties(commodityId);

        // Render mini chart
        this.renderDetailChart(commodityId);
    },

    renderVarieties(commodityId) {
        const container = document.getElementById('varietiesGrid');
        if (!container) return;

        const varieties = CommodityData.getVarieties(commodityId);
        container.innerHTML = varieties.slice(0, 20).map(v => `
            <div class="variety-item">
                <div class="name">${v.name}</div>
                <div class="price">${APIService.formatPrice(v.price)}</div>
            </div>
        `).join('');
    },

    renderDetailChart(commodityId) {
        const ctx = document.getElementById('detailChart');
        if (!ctx) return;

        if (this.state.detailChart) {
            this.state.detailChart.destroy();
        }

        const data = APIService.generateMockPriceData(commodityId, '7d');
        const labels = data.map(d => APIService.formatDate(d.date));
        const prices = data.map(d => d.price);

        this.state.detailChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: prices,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    },

    // ========== CALCULATOR ==========
    initCalculator() {
        const cropSelect = document.getElementById('calcCrop');
        if (!cropSelect) return;

        const crops = CommodityData.commodities.filter(c => c.yieldPerHa > 0);
        cropSelect.innerHTML = '<option value="">-- Pilih Tanaman --</option>' +
            crops.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');

        document.getElementById('calcDate').valueAsDate = new Date();

        document.getElementById('calculateBtn')?.addEventListener('click', () => this.calculate());
    },

    calculate() {
        const cropId = document.getElementById('calcCrop')?.value;
        const area = parseFloat(document.getElementById('calcArea')?.value) || 0;
        const plantDate = document.getElementById('calcDate')?.value;

        if (!cropId || !area) {
            AnimationEngine.showToast('Lengkapi semua field', 'warning');
            return;
        }

        const result = CommodityData.calculateHarvest(cropId, area);
        if (!result) return;

        let harvestDate = '-';
        if (plantDate && result.harvestDays > 0) {
            const date = new Date(plantDate);
            date.setDate(date.getDate() + result.harvestDays);
            harvestDate = APIService.formatDate(date, 'long');
        }

        const resultsEl = document.getElementById('calcResults');
        resultsEl.classList.remove('hidden');

        AnimationEngine.animateCounter(document.getElementById('harvestAmount'), result.yield, 1000, '', ' kg');
        AnimationEngine.animateCounter(document.getElementById('revenueAmount'), result.revenue, 1200, 'Rp ', '');
        AnimationEngine.animateCounter(document.getElementById('fertilizerCost'), result.fertilizerCost, 800, 'Rp ', '');
        document.getElementById('harvestDate').textContent = harvestDate;
        AnimationEngine.animateCounter(document.getElementById('netProfit'), result.netProfit, 1500, 'Rp ', '');

        AnimationEngine.showToast('Kalkulasi berhasil! 🧮', 'success');
    },

    // ========== DASHBOARD ==========
    initDashboard() {
        this.initPriceChart();
        this.renderTopMovers();
        this.updateQuickStats();

        document.getElementById('timeRangeSelect')?.addEventListener('change', (e) => {
            this.updatePriceChart(this.state.currentCommodity || 'beras', e.target.value);
        });

        document.getElementById('chartCommodity')?.addEventListener('change', (e) => {
            this.updatePriceChart(e.target.value, document.getElementById('timeRangeSelect')?.value || '1m');
        });
    },

    initPriceChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        this.state.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        callbacks: {
                            label: (ctx) => 'Rp ' + ctx.raw.toLocaleString('id-ID')
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#6b7280', maxTicksLimit: 6 }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#6b7280',
                            callback: (v) => (v / 1000) + 'k'
                        }
                    }
                }
            }
        });

        this.updatePriceChart('beras', '1m');
    },

    updatePriceChart(commodityId, timeRange) {
        if (!this.state.priceChart) return;

        const data = APIService.generateMockPriceData(commodityId, timeRange);
        const commodity = CommodityData.getCommodityById(commodityId);

        const labels = data.map(d => timeRange.endsWith('h') ? APIService.formatTime(d.date) : APIService.formatDate(d.date));
        const prices = data.map(d => d.price);

        this.state.priceChart.data.labels = labels;
        this.state.priceChart.data.datasets[0].data = prices;
        this.state.priceChart.update();

        if (commodity) {
            document.getElementById('chartTitle').textContent = `📊 Grafik Harga ${commodity.name}`;
        }
    },

    updateQuickStats() {
        const items = CommodityData.commodities.filter(c => c.category === 'komoditas');
        const sorted = [...items].sort((a, b) => a.basePrice - b.basePrice);

        document.getElementById('cheapestItem').textContent = sorted[0]?.name || '-';
        document.getElementById('expensiveItem').textContent = sorted[sorted.length - 1]?.name || '-';
    },

    renderTopMovers() {
        const container = document.getElementById('topMovers');
        if (!container) return;

        const items = CommodityData.commodities.slice(0, 5).map(item => ({
            ...item,
            change: (Math.random() - 0.5) * 20
        })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

        container.innerHTML = items.map(item => {
            const changeClass = item.change >= 0 ? 'up' : 'down';
            const changeText = (item.change >= 0 ? '+' : '') + item.change.toFixed(1) + '%';
            return `
                <div class="mover-item">
                    <div class="mover-name">
                        <span class="mover-icon">${item.icon}</span>
                        <span>${item.name}</span>
                    </div>
                    <span class="mover-change ${changeClass}">${changeText}</span>
                </div>
            `;
        }).join('');
    },

    updateDashboard() {
        this.renderTopMovers();
        this.updateQuickStats();
    },

    // ========== MAP ==========
    async initMap() {
        const mapContainer = document.getElementById('indonesiaMap');
        if (!mapContainer) return;

        this.state.map = L.map('indonesiaMap', {
            center: [-2.5, 118],
            zoom: 4,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: ''
        }).addTo(this.state.map);

        await this.loadGeoJSON();

        document.getElementById('autoLocBtn')?.addEventListener('click', () => this.detectLocation());
        document.getElementById('searchLocBtn')?.addEventListener('click', () => this.openLocSearch());
    },

    async loadGeoJSON() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json');
            const geojson = await response.json();

            this.state.indonesiaLayer = L.geoJSON(geojson, {
                style: (feature) => this.getProvinceStyle(feature),
                onEachFeature: (feature, layer) => {
                    layer.on({
                        click: (e) => this.onProvinceClick(e, feature),
                        mouseover: (e) => e.target.setStyle({ fillOpacity: 0.8, weight: 2 }),
                        mouseout: (e) => this.state.indonesiaLayer?.resetStyle(e.target)
                    });
                }
            }).addTo(this.state.map);
        } catch (e) {
            console.error('GeoJSON error:', e);
        }
    },

    getProvinceStyle(feature) {
        const code = (feature.properties.kode || '').toString().substring(0, 2);
        const indexData = CommodityData.provinceIndex[code];
        const index = indexData?.index || 100;

        let color = '#22c55e';
        if (index > 105) color = '#ef4444';
        else if (index > 100) color = '#f59e0b';

        return { fillColor: color, weight: 1, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.6 };
    },

    onProvinceClick(e, feature) {
        const name = feature.properties.Propinsi || feature.properties.name || 'Unknown';
        const code = (feature.properties.kode || '').toString().substring(0, 2);
        const indexData = CommodityData.provinceIndex[code] || { index: 100 };

        // Show province card
        const card = document.getElementById('provinceCard');
        card?.classList.remove('hidden');
        document.getElementById('provinceName').textContent = name;
        document.getElementById('provinceIndex').textContent = indexData.index.toFixed(1);

        const status = indexData.index > 105 ? 'Mahal' : indexData.index > 100 ? 'Sedang' : 'Murah';
        const statusEl = document.getElementById('provinceStatus');
        statusEl.textContent = status;
        statusEl.style.background = indexData.index > 105 ? '#ef4444' : indexData.index > 100 ? '#f59e0b' : '#22c55e';
    },

    // ========== LOCATION ==========
    async initLocation() {
        try {
            const loc = await APIService.getCurrentLocation();
            this.state.currentLocation = loc;
            document.getElementById('locationText').textContent = loc.address.split(',')[0];
        } catch (e) {
            document.getElementById('locationText').textContent = 'Indonesia';
        }
    },

    async detectLocation() {
        AnimationEngine.showLoading('Mendeteksi lokasi...');
        try {
            const loc = await APIService.getCurrentLocation();
            this.state.currentLocation = loc;
            document.getElementById('locationText').textContent = loc.address.split(',')[0];

            if (this.state.map) {
                this.state.map.setView([loc.lat, loc.lng], 10);
                L.marker([loc.lat, loc.lng]).addTo(this.state.map);
            }
            AnimationEngine.showToast('Lokasi ditemukan! 📍', 'success');
        } catch (e) {
            AnimationEngine.showToast('Gagal mendeteksi lokasi', 'error');
        }
        AnimationEngine.hideLoading();
    },

    openLocSearch() {
        document.getElementById('locationModal')?.classList.remove('hidden');
        document.getElementById('locSearchInput')?.focus();

        document.getElementById('locSearchInput')?.addEventListener('input', this.debounce(async (e) => {
            if (e.target.value.length < 3) return;
            const results = await APIService.searchLocation(e.target.value);
            document.getElementById('locResults').innerHTML = results.map(r => `
                <div class="loc-item" onclick="TanikuApp.selectLoc(${r.lat}, ${r.lng}, '${r.name.replace(/'/g, "\\'")}')">
                    📍 ${r.name}
                </div>
            `).join('');
        }, 500));
    },

    selectLoc(lat, lng, name) {
        this.state.currentLocation = { lat, lng, address: name };
        document.getElementById('locationText').textContent = name.split(',')[0];
        document.getElementById('locationModal')?.classList.add('hidden');

        if (this.state.map) {
            this.state.map.setView([lat, lng], 10);
            L.marker([lat, lng]).addTo(this.state.map);
        }

        // Update weather for new location
        this.updateWeather(lat, lng);
    },

    // ========== MAP COMMODITY SELECTOR ==========
    initMapCommoditySelector() {
        const selector = document.getElementById('mapCommoditySelect');
        if (!selector) return;

        selector.addEventListener('change', (e) => {
            this.state.mapCommodity = e.target.value;
            this.updateMapForCommodity(e.target.value);
            this.updateIHG();
        });
    },

    updateMapForCommodity(commodityId) {
        if (!this.state.indonesiaLayer) return;

        this.state.indonesiaLayer.eachLayer(layer => {
            const feature = layer.feature;
            const code = (feature.properties.kode || '').toString().substring(0, 2);

            // Get commodity-specific or combined index
            let index = 100;
            if (commodityId === 'all') {
                const indexData = CommodityData.provinceIndex[code];
                index = indexData?.index || 100;
            } else {
                // Generate mock commodity-specific index
                const baseIndex = CommodityData.provinceIndex[code]?.index || 100;
                const variation = (Math.random() - 0.5) * 10;
                index = baseIndex + variation;
            }

            let color = '#22c55e';
            if (index > 105) color = '#ef4444';
            else if (index > 100) color = '#f59e0b';

            layer.setStyle({ fillColor: color });
        });
    },

    // ========== IHG UPDATES ==========
    updateIHG() {
        const commodities = CommodityData.commodities.slice(0, 10).map(c => ({
            id: c.id,
            currentPrice: c.basePrice * (0.95 + Math.random() * 0.1),
            basePrice: c.basePrice
        }));

        const ihg = APIService.calculateIHG(commodities);
        const change = (Math.random() - 0.5) * 2;

        document.getElementById('ihgValue').textContent = ihg;

        const changeEl = document.getElementById('ihgChange');
        changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'ihg-change ' + (change >= 0 ? 'up' : 'down');
    },

    // ========== WEATHER UPDATE ==========
    async updateWeather(lat = -6.2088, lng = 106.8456) {
        try {
            const weather = await APIService.fetchWeather(lat, lng);
            if (weather) {
                const icon = APIService.getWeatherIcon(weather.current.weatherCode);
                document.getElementById('weatherInfo').textContent =
                    `${icon} ${weather.current.temp}°C`;
            }
        } catch (e) {
            console.log('Weather update failed');
        }
    },

    // ========== EXCHANGE RATE UPDATE ==========
    async updateExchangeRate() {
        try {
            const rate = await APIService.fetchExchangeRate('USD');
            document.getElementById('exchangeRate').textContent =
                `$1 = Rp${rate.idr.toLocaleString('id-ID')}`;
        } catch (e) {
            console.log('Exchange rate update failed');
        }
    },

    // ========== WORLD BANK DATA ==========
    async loadWorldBankData() {
        try {
            // Fetch GDP
            const gdpData = await APIService.fetchWorldBankData('NY.GDP.MKTP.CD', 1);
            if (gdpData.length > 0) {
                document.getElementById('wbGDP').textContent =
                    '$' + APIService.formatNumber(gdpData[0].value);
            }

            // Fetch Population
            const popData = await APIService.fetchWorldBankData('SP.POP.TOTL', 1);
            if (popData.length > 0) {
                document.getElementById('wbPopulation').textContent =
                    APIService.formatNumber(popData[0].value);
            }

            // Fetch Agriculture %
            const agriData = await APIService.fetchWorldBankData('NV.AGR.TOTL.ZS', 1);
            if (agriData.length > 0) {
                document.getElementById('wbAgriculture').textContent =
                    agriData[0].value.toFixed(1) + '%';
            }
        } catch (e) {
            console.log('World Bank data failed to load');
        }
    },

    // ========== PROVINCE CLICK WITH PRICES ==========
    showProvincePrices(code) {
        const container = document.getElementById('provinceCommodityPrices');
        if (!container) return;

        const commodities = CommodityData.commodities.slice(0, 6);
        const indexData = CommodityData.provinceIndex[code] || { index: 100 };

        container.innerHTML = commodities.map(c => {
            const adjustedPrice = Math.round(c.basePrice * (indexData.index / 100));
            return `
                <div class="prov-price-item">
                    <span class="name">${c.icon} ${c.name}</span>
                    <span class="price">${APIService.formatPrice(adjustedPrice)}</span>
                </div>
            `;
        }).join('');
    },

    // ========== CALCULATOR TABS ==========
    initCalcTabs() {
        document.querySelectorAll('.calc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.calc-section').forEach(s => s.classList.remove('active'));
                document.getElementById('calc' + tab.dataset.calc.charAt(0).toUpperCase() + tab.dataset.calc.slice(1))?.classList.add('active');
            });
        });

        // Populate selects
        const crops = CommodityData.commodities.filter(c => c.yieldPerHa > 0);
        ['pupukCrop', 'hamaCrop', 'biayaCrop'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">-- Pilih Tanaman --</option>' +
                    crops.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
            }
        });

        // Button handlers
        document.getElementById('calcPupukBtn')?.addEventListener('click', () => this.calcPupuk());
        document.getElementById('calcHamaBtn')?.addEventListener('click', () => this.calcHama());
        document.getElementById('calcBiayaBtn')?.addEventListener('click', () => this.calcBiaya());
    },

    // Pupuk Calculator
    calcPupuk() {
        const cropId = document.getElementById('pupukCrop')?.value;
        const area = parseFloat(document.getElementById('pupukArea')?.value) || 0;
        const phase = document.getElementById('pupukPhase')?.value;

        if (!cropId || !area) {
            AnimationEngine.showToast('Lengkapi semua field', 'warning');
            return;
        }

        const pupukData = {
            semai: [
                { name: 'NPK Starter', icon: '🧪', amount: area * 0.02 },
                { name: 'Pupuk Organik', icon: '🌿', amount: area * 0.05 }
            ],
            vegetatif: [
                { name: 'Urea', icon: '💧', amount: area * 0.03 },
                { name: 'TSP', icon: '🔬', amount: area * 0.02 },
                { name: 'KCl', icon: '⚗️', amount: area * 0.015 }
            ],
            generatif: [
                { name: 'NPK Mutiara', icon: '💎', amount: area * 0.025 },
                { name: 'Pupuk Daun', icon: '🍃', amount: area * 0.01 }
            ],
            panen: [
                { name: 'KCl Panen', icon: '⚗️', amount: area * 0.02 },
                { name: 'Pupuk Buah', icon: '🍎', amount: area * 0.015 }
            ]
        };

        const list = pupukData[phase] || pupukData.vegetatif;
        document.getElementById('pupukResults').classList.remove('hidden');
        document.getElementById('pupukList').innerHTML = list.map(p => `
            <div class="pupuk-item">
                <div class="name"><span>${p.icon}</span>${p.name}</div>
                <span class="amount">${p.amount.toFixed(1)} kg</span>
            </div>
        `).join('');

        AnimationEngine.showToast('Rekomendasi pupuk dihitung! 🧪', 'success');
    },

    // Hama Calculator
    calcHama() {
        const cropId = document.getElementById('hamaCrop')?.value;
        const hamaType = document.getElementById('hamaType')?.value;
        const level = document.getElementById('hamaLevel')?.value;

        if (!cropId) {
            AnimationEngine.showToast('Pilih tanaman', 'warning');
            return;
        }

        const solutions = {
            ulat: { name: 'Ulat Grayak/Penggulung Daun', solutions: ['Deltamethrin 25 EC', 'Bacillus thuringiensis', 'Spinosad'] },
            wereng: { name: 'Wereng Coklat/Hijau', solutions: ['Imidacloprid', 'BPMC 50 EC', 'Lampu perangkap'] },
            kutu: { name: 'Kutu Daun Aphid', solutions: ['Abamectin', 'Imidacloprid', 'Sabun insektisida'] },
            jamur: { name: 'Penyakit Jamur', solutions: ['Mankozeb', 'Propineb', 'Trichoderma'] },
            busuk: { name: 'Busuk Batang/Akar', solutions: ['Benomyl', 'Metalaxyl', 'Trichoderma'] },
            virus: { name: 'Virus/Layu', solutions: ['Cabut tanaman sakit', 'Kontrol vektor', 'Varietas tahan'] }
        };

        const info = solutions[hamaType] || solutions.ulat;
        const dosage = level === 'ringan' ? '50%' : level === 'sedang' ? '75%' : '100%';

        document.getElementById('hamaResults').classList.remove('hidden');
        document.getElementById('hamaList').innerHTML = `
            <div class="hama-item">
                <div class="name"><span>🐛</span>${info.name}</div>
                <span class="solution">Dosis: ${dosage}</span>
            </div>
            ${info.solutions.map(s => `
                <div class="hama-item">
                    <div class="name"><span>💊</span>${s}</div>
                    <span class="solution">Aplikasi ${level}</span>
                </div>
            `).join('')}
        `;

        AnimationEngine.showToast('Solusi penanganan ditemukan! 💊', 'success');
    },

    // Biaya Calculator
    calcBiaya() {
        const cropId = document.getElementById('biayaCrop')?.value;
        const area = parseFloat(document.getElementById('biayaArea')?.value) || 1;

        if (!cropId) {
            AnimationEngine.showToast('Pilih tanaman', 'warning');
            return;
        }

        const biaya = [
            { name: 'Benih/Bibit', icon: '🌱', amount: 2500000 * area },
            { name: 'Pupuk', icon: '🧪', amount: 3500000 * area },
            { name: 'Pestisida', icon: '💊', amount: 1500000 * area },
            { name: 'Tenaga Kerja', icon: '👷', amount: 5000000 * area },
            { name: 'Pengairan', icon: '💧', amount: 1000000 * area },
            { name: 'Sewa Alat', icon: '🚜', amount: 2000000 * area }
        ];

        const total = biaya.reduce((sum, b) => sum + b.amount, 0);

        document.getElementById('biayaResults').classList.remove('hidden');
        document.getElementById('biayaList').innerHTML = biaya.map(b => `
            <div class="biaya-item">
                <div class="name"><span>${b.icon}</span>${b.name}</div>
                <span class="amount">${APIService.formatPrice(b.amount)}</span>
            </div>
        `).join('') + `
            <div class="biaya-total">
                <span class="label">💰 Total Biaya</span>
                <span class="value">${APIService.formatPrice(total)}</span>
            </div>
        `;

        AnimationEngine.showToast('Biaya dihitung! 💰', 'success');
    },

    // ========== INFO TAB ==========
    initInfoTab() {
        // Category tabs
        document.querySelectorAll('.info-cat').forEach(cat => {
            cat.addEventListener('click', () => {
                document.querySelectorAll('.info-cat').forEach(c => c.classList.remove('active'));
                cat.classList.add('active');

                document.querySelectorAll('.info-section').forEach(s => s.classList.remove('active'));
                document.getElementById('info' + cat.dataset.info.charAt(0).toUpperCase() + cat.dataset.info.slice(1))?.classList.add('active');
            });
        });

        // Search
        document.getElementById('infoSearchBtn')?.addEventListener('click', () => this.searchInfo());
        document.getElementById('infoSearch')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.searchInfo();
        });

        // Modal close
        document.getElementById('closeInfoModal')?.addEventListener('click', () => {
            document.getElementById('infoModal')?.classList.add('hidden');
        });

        // Load initial data
        this.loadPlantInfo();
        this.loadPestInfo();
        this.loadFertilizerInfo();
        this.loadPlantingInfo();
    },

    async searchInfo() {
        const query = document.getElementById('infoSearch')?.value;
        if (!query) return;

        AnimationEngine.showLoading('Mencari...');
        const wiki = await APIService.fetchWikiSummary(query);
        AnimationEngine.hideLoading();

        this.showInfoModal(query, wiki.extract);
    },

    loadPlantInfo() {
        const container = document.getElementById('plantList');
        if (!container) return;

        // Load ALL commodities (200+)
        const plants = CommodityData.commodities.filter(c => c.category === 'komoditas');
        container.innerHTML = plants.map(p => `
            <div class="info-card" onclick="TanikuApp.openPlantDetail('${p.id}')">
                <div class="icon">${p.icon}</div>
                <div class="title">${p.name}</div>
                <div class="subtitle">${APIService.formatPrice(p.basePrice)}/${p.unit}</div>
            </div>
        `).join('');
    },

    loadPestInfo() {
        const container = document.getElementById('pestList');
        if (!container) return;

        // Load from hamaDatabase (40+)
        const pests = CommodityData.hamaDatabase || [];
        container.innerHTML = pests.map(p => `
            <div class="info-card" onclick="TanikuApp.openPestDetail('${p.id}', '${p.name}')">
                <div class="icon">${p.icon}</div>
                <div class="title">${p.name}</div>
                <div class="subtitle">${p.type} | ${p.severity}</div>
                <div class="price-compare">
                    <span class="bps">BPS: ${APIService.formatPrice(p.priceBPS)}</span>
                    <span class="wb">WB: ${APIService.formatPrice(p.priceWB)}</span>
                </div>
            </div>
        `).join('');
    },

    loadFertilizerInfo() {
        const container = document.getElementById('fertilizerList');
        if (!container) return;

        // Load from pupukDatabase (45+)
        const fertilizers = CommodityData.pupukDatabase || [];
        container.innerHTML = fertilizers.map(f => `
            <div class="info-card" onclick="TanikuApp.openFertilizerDetail('${f.id}', '${f.name}')">
                <div class="icon">${f.icon}</div>
                <div class="title">${f.name}</div>
                <div class="subtitle">${f.type} | ${f.nutrient}</div>
                <div class="price-compare">
                    <span class="bps">BPS: ${APIService.formatPrice(f.priceBPS)}</span>
                    <span class="wb">WB: ${APIService.formatPrice(f.priceWB)}</span>
                </div>
            </div>
        `).join('');
    },

    loadPlantingInfo() {
        const container = document.getElementById('plantingList');
        if (!container) return;

        const guides = CommodityData.commodities.filter(c => c.harvestDays > 0).slice(0, 8);
        container.innerHTML = guides.map(g => `
            <div class="info-card" onclick="TanikuApp.openPlantingGuide('${g.id}')">
                <div class="icon">${g.icon}</div>
                <div class="title">Cara Tanam ${g.name}</div>
                <div class="subtitle">${g.harvestDays} hari panen</div>
            </div>
        `).join('');
    },

    async openPlantDetail(commodityId) {
        const item = CommodityData.getCommodityById(commodityId);
        if (!item) return;

        AnimationEngine.showLoading('Memuat info...');
        const wiki = await APIService.fetchWikiSummary(item.name);
        AnimationEngine.hideLoading();

        document.getElementById('infoModal')?.classList.remove('hidden');
        document.getElementById('infoModalContent').innerHTML = `
            <h2>${item.icon} ${item.name}</h2>
            <div class="info-detail-section">
                <h4>📖 Deskripsi</h4>
                <p>${wiki.extract}</p>
            </div>
            <div class="info-detail-section">
                <h4>🌱 Varietas Populer</h4>
                <ul>${CommodityData.getVarieties(commodityId).slice(0, 5).map(v => `<li>${v.name}</li>`).join('')}</ul>
            </div>
            <div class="info-detail-section">
                <h4>📊 Info Budidaya</h4>
                <ul>
                    <li>Masa panen: ${item.harvestDays || 'Bervariasi'} hari</li>
                    <li>Hasil per hektar: ${item.yieldPerHa || '-'} kg</li>
                    <li>Harga rata-rata: ${APIService.formatPrice(item.basePrice)}</li>
                </ul>
            </div>
        `;
    },

    async openPestDetail(pestId, pestName) {
        AnimationEngine.showLoading('Memuat info hama...');
        const wiki = await APIService.fetchWikiSummary(pestName + ' hama');
        AnimationEngine.hideLoading();

        document.getElementById('infoModal')?.classList.remove('hidden');
        document.getElementById('infoModalContent').innerHTML = `
            <h2>🐛 ${pestName}</h2>
            <div class="info-detail-section">
                <h4>📖 Tentang Hama</h4>
                <p>${wiki.extract}</p>
            </div>
            <div class="info-detail-section">
                <h4>🔍 Gejala Serangan</h4>
                <ul>
                    <li>Daun berlubang atau rusak</li>
                    <li>Tanaman layu dan tidak sehat</li>
                    <li>Pertumbuhan terhambat</li>
                </ul>
            </div>
            <div class="info-detail-section">
                <h4>💊 Pengendalian</h4>
                <ul>
                    <li>Kultur teknis: rotasi tanaman</li>
                    <li>Biologis: musuh alami</li>
                    <li>Kimia: pestisida sesuai dosis</li>
                </ul>
            </div>
        `;
    },

    async openFertilizerDetail(fertId, fertName) {
        AnimationEngine.showLoading('Memuat info pupuk...');
        const wiki = await APIService.fetchWikiSummary('Pupuk ' + fertName);
        AnimationEngine.hideLoading();

        document.getElementById('infoModal')?.classList.remove('hidden');
        document.getElementById('infoModalContent').innerHTML = `
            <h2>🧪 ${fertName}</h2>
            <div class="info-detail-section">
                <h4>📖 Tentang Pupuk</h4>
                <p>${wiki.extract}</p>
            </div>
            <div class="info-detail-section">
                <h4>📊 Kandungan Nutrisi</h4>
                <ul>
                    <li>Nitrogen (N): mendorong pertumbuhan daun</li>
                    <li>Fosfor (P): memperkuat akar</li>
                    <li>Kalium (K): meningkatkan kualitas buah</li>
                </ul>
            </div>
            <div class="info-detail-section">
                <h4>📝 Cara Aplikasi</h4>
                <ul>
                    <li>Dosis sesuai luas lahan</li>
                    <li>Waktu: pagi/sore hari</li>
                    <li>Cara: tabur/kocor/semprot</li>
                </ul>
            </div>
        `;
    },

    async openPlantingGuide(commodityId) {
        const item = CommodityData.getCommodityById(commodityId);
        if (!item) return;

        AnimationEngine.showLoading('Memuat panduan tanam...');
        const wiki = await APIService.fetchWikiSummary('Budidaya ' + item.name);
        AnimationEngine.hideLoading();

        document.getElementById('infoModal')?.classList.remove('hidden');
        document.getElementById('infoModalContent').innerHTML = `
            <h2>🌾 Cara Tanam ${item.name}</h2>
            <div class="info-detail-section">
                <h4>📖 Panduan Budidaya</h4>
                <p>${wiki.extract}</p>
            </div>
            <div class="info-detail-section">
                <h4>1️⃣ Persiapan Lahan</h4>
                <ul>
                    <li>Olah tanah hingga gembur</li>
                    <li>Buat bedengan jika perlu</li>
                    <li>Berikan pupuk dasar</li>
                </ul>
            </div>
            <div class="info-detail-section">
                <h4>2️⃣ Penanaman</h4>
                <ul>
                    <li>Siapkan benih berkualitas</li>
                    <li>Jarak tanam sesuai jenis</li>
                    <li>Siram secukupnya</li>
                </ul>
            </div>
            <div class="info-detail-section">
                <h4>3️⃣ Perawatan</h4>
                <ul>
                    <li>Pemupukan rutin</li>
                    <li>Penyiraman teratur</li>
                    <li>Pengendalian hama</li>
                </ul>
            </div>
            <div class="info-detail-section">
                <h4>4️⃣ Panen</h4>
                <ul>
                    <li>Masa panen: ${item.harvestDays || 90} hari</li>
                    <li>Hasil: ${item.yieldPerHa || 5000} kg/ha</li>
                </ul>
            </div>
        `;
    },

    showInfoModal(title, content) {
        document.getElementById('infoModal')?.classList.remove('hidden');
        document.getElementById('infoModalContent').innerHTML = `
            <h2>📚 ${title}</h2>
            <div class="info-detail-section">
                <p>${content}</p>
            </div>
        `;
    },

    // ========== TIME RANGE BAR ==========
    initTimeRangeBar() {
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const range = btn.dataset.range;
                const commodity = document.getElementById('chartCommodity')?.value || 'beras';
                this.updatePriceChart(commodity, range);
            });
        });
    },

    // ========== LIVE TIMESTAMP ==========
    initLiveTimestamp() {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const el = document.getElementById('liveTimestamp');
            if (el) el.textContent = `${dateStr} ${timeStr}`;
        };
        updateTime();
        setInterval(updateTime, 1000);
    },

    // ========== ENTER KEY SEARCH ==========
    initEnterKeySearch() {
        // Map location search
        document.getElementById('locSearchInput')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.searchLoc();
        });

        // Music search
        document.getElementById('musicSearch')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.searchMusic();
        });

        // Chat input
        document.getElementById('chatInput')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.sendChat();
        });
    },

    // ========== AI CHATBOT ==========
    chatResponses: {
        dasar: {
            padi: "Padi adalah tanaman pokok Indonesia. Tanam saat musim hujan, panen 3-4 bulan.",
            beras: "Beras berasal dari padi. Harga rata-rata Rp 12.000/kg.",
            cabai: "Cabai butuh sinar matahari penuh. Panen 70-80 hari setelah tanam.",
            jagung: "Jagung ditanam di lahan kering. Panen 90-100 hari.",
            tomat: "Tomat perlu penyiraman rutin. Panen 60-70 hari.",
            bawang: "Bawang merah butuh tanah gembur. Panen 60-70 hari.",
            pupuk: "Pupuk memberi nutrisi tanaman. Jenis: Urea, NPK, TSP, KCl.",
            urea: "Urea mengandung Nitrogen 46%. Untuk pertumbuhan daun.",
            npk: "NPK adalah pupuk lengkap (Nitrogen, Fosfor, Kalium).",
            hama: "Hama adalah organisme pengganggu tanaman.",
            ulat: "Ulat bisa dikendalikan dengan pestisida atau musuh alami.",
            wereng: "Wereng menyerang padi. Gunakan varietas tahan wereng.",
            cuaca: "Cuaca penting untuk pertanian. Cek tab Peta untuk info cuaca.",
            harga: "Harga komoditas berubah setiap hari. Cek tab Dashboard.",
            tanam: "Cara tanam: siapkan lahan, semai benih, pindah tanam, rawat, panen."
        },
        menengah: {
            padi: "Padi (Oryza sativa) optimal ditanam di pH 5.5-7. Butuh 1000-2000mm curah hujan/tahun. Varietas unggul: Ciherang, IR64, Inpari.",
            beras: "Beras mengandung 80% karbohidrat. Harga dipengaruhi musim panen, impor, dan kebijakan pemerintah.",
            cabai: "Cabai optimal di suhu 21-28°C. pH tanah 6-7. Jarak tanam 60x40cm. Pupuk NPK 200kg/ha.",
            jagung: "Jagung butuh air 500-800mm selama musim tanam. Jarak tanam 75x25cm. Hasil 6-8 ton/ha.",
            pupuk: "Dosis pupuk NPK: 300kg/ha. Urea: 200-300kg/ha. Aplikasi 3x: tanam, vegetatif, generatif.",
            urea: "Urea (CO(NH2)2) melepas nitrogen cepat. Aplikasi pagi/sore, hindari hujan. Max 50kg/aplikasi.",
            npk: "NPK Mutiara 16-16-16: seimbang untuk semua fase. Phonska 15-15-15: khusus tanaman pangan.",
            hama: "IPM (Integrated Pest Management): kombinasi kultur teknis, biologis, dan kimia minimal.",
            ulat: "Bacillus thuringiensis (Bt) efektif untuk ulat. Semprot pagi/sore. Ulangi 7-10 hari.",
            wereng: "Wereng coklat (Nilaparvata lugens) resisten terhadap beberapa insektisida. Rotasi bahan aktif penting.",
            cuaca: "El Nino/La Nina mempengaruhi musim tanam. Pantau prakiraan BMKG.",
            harga: "Harga Acuan Pembelian (HAP) pemerintah untuk stabilitas harga gabah/beras."
        },
        tinggi: {
            padi: "Produktivitas padi dipengaruhi fotosintesis (LAI optimal 4-6), akumulasi biomassa, dan harvest index (HI 0.45-0.55). Teknologi SRI dapat meningkatkan hasil 20-50%.",
            cabai: "Capsaicin (8-methyl-N-vanillyl-6-nonenamide) terbentuk di plasenta. Tingkat kepedasan diukur dengan Scoville Heat Units (SHU). Stres air meningkatkan capsaicin.",
            pupuk: "Efisiensi pupuk N di Indonesia hanya 30-40%. Slow-release fertilizer dan pemupukan presisi berbasis sensor dapat meningkatkan efisiensi hingga 60-80%.",
            hama: "Resistensi hama terhadap pestisida mengikuti model Hardy-Weinberg. Refuge crop strategy dapat memperlambat evolusi resistensi pada Bt crops.",
            wereng: "Mekanisme resistensi wereng: metabolik (esterase, P450), target site (kdr mutation), dan behavioral. Gene pyramiding varietas padi mengombinasikan gen Bph1, Bph2, Bph3.",
            ekonomi: "Price elasticity beras di Indonesia: -0.3 (inelastic). Kebijakan buffer stock dan operasi pasar untuk stabilisasi harga.",
            iklim: "Climate-smart agriculture: adaptasi (varietastoleran kekeringan/banjir), mitigasi (reduced tillage, agroforestri), produktivitas berkelanjutan.",
            teknologi: "Precision farming: GPS-based variable rate application, drone untuk monitoring NDVI, IoT soil sensors, machine learning untuk prediksi yield."
        }
    },

    currentChatLevel: 'dasar',

    initChatbot() {
        // Level buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentChatLevel = btn.dataset.level;
            });
        });

        // Topic buttons
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const topic = btn.dataset.topic;
                this.sendChat(this.getTopicQuestion(topic));
            });
        });

        // Quick replies
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.sendChat(btn.dataset.q);
            });
        });

        // Send button
        document.getElementById('sendChatBtn')?.addEventListener('click', () => this.sendChat());
    },

    getTopicQuestion(topic) {
        const questions = {
            tanaman: 'Info tanaman padi',
            hama: 'Cara mengatasi hama',
            pupuk: 'Jenis pupuk dan penggunaannya',
            tanam: 'Panduan cara menanam',
            harga: 'Harga komoditas hari ini',
            cuaca: 'Kondisi cuaca untuk pertanian'
        };
        return questions[topic] || 'Info pertanian';
    },

    async sendChat(message = null) {
        const input = document.getElementById('chatInput');
        const msg = message || input?.value?.trim();
        if (!msg) return;

        if (input) input.value = '';

        // Add user message
        this.addChatBubble(msg, 'user');

        // Show typing
        this.showTyping();

        // Get response
        setTimeout(async () => {
            this.hideTyping();
            const response = await this.getChatResponseWithAI(msg);
            this.addChatBubble(response, 'bot');
            this.updateQuickReplies(msg);
        }, 1000 + Math.random() * 1000);
    },

    addChatBubble(content, type) {
        const container = document.getElementById('chatMessages');
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;
        bubble.innerHTML = `
            <div class="bubble-avatar">${type === 'bot' ? '🤖' : '👤'}</div>
            <div class="bubble-content"><p>${content}</p></div>
        `;
        container?.appendChild(bubble);
        container?.scrollTo(0, container.scrollHeight);
    },

    showTyping() {
        const container = document.getElementById('chatMessages');
        const typing = document.createElement('div');
        typing.id = 'typingIndicator';
        typing.className = 'chat-bubble bot';
        typing.innerHTML = `
            <div class="bubble-avatar">🤖</div>
            <div class="bubble-content">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        container?.appendChild(typing);
        container?.scrollTo(0, container.scrollHeight);
    },

    hideTyping() {
        document.getElementById('typingIndicator')?.remove();
    },

    async getChatResponse(message) {
        const msg = message.toLowerCase();
        const responses = this.chatResponses[this.currentChatLevel];

        // Check keywords
        for (const [key, value] of Object.entries(responses)) {
            if (msg.includes(key)) return value;
        }

        // Check commodity data
        for (const c of CommodityData.commodities.slice(0, 20)) {
            if (msg.includes(c.name.toLowerCase()) || msg.includes(c.id)) {
                const wiki = await APIService.fetchWikiSummary(c.name);
                return `${c.icon} <strong>${c.name}</strong>: ${wiki.extract.substring(0, 200)}... Harga: ${APIService.formatPrice(c.basePrice)}`;
            }
        }

        // Default responses
        const defaults = [
            'Saya bisa membantu tentang tanaman, hama, pupuk, dan harga komoditas.',
            'Coba tanyakan tentang: padi, cabai, jagung, pupuk urea, hama wereng.',
            'Gunakan tombol topik di atas untuk pertanyaan cepat!',
            'Ubah tingkat (Dasar/Menengah/Tinggi) untuk jawaban lebih detail.'
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    },

    updateQuickReplies(lastMsg) {
        const container = document.getElementById('quickReplies');
        if (!container) return;

        const suggestions = [
            { q: 'Varietas padi unggul', label: '🌾 Varietas padi' },
            { q: 'Pupuk untuk sayuran', label: '🧪 Pupuk sayuran' },
            { q: 'Hama tanaman cabai', label: '🐛 Hama cabai' },
            { q: 'Tips meningkatkan hasil panen', label: '📈 Tips panen' }
        ];

        container.innerHTML = suggestions.map(s =>
            `<button class="quick-btn" onclick="TanikuApp.sendChat('${s.q}')">${s.label}</button>`
        ).join('');
    },

    // ========== AI API SETTINGS ==========
    aiSettings: {
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-pro',
        customModel: ''
    },

    initAISettings() {
        // Load saved settings
        const saved = localStorage.getItem('tanikuAISettings');
        if (saved) {
            this.aiSettings = JSON.parse(saved);
            this.updateAISettingsUI();
        }

        // Provider buttons
        document.querySelectorAll('.api-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.api-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.aiSettings.provider = btn.dataset.provider;
            });
        });

        // Toggle API key visibility
        document.getElementById('toggleApiKey')?.addEventListener('click', () => {
            const input = document.getElementById('aiApiKey');
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });

        // Model selection
        document.getElementById('aiModel')?.addEventListener('change', (e) => {
            this.aiSettings.model = e.target.value;
        });

        // Save button
        document.getElementById('saveApiSettings')?.addEventListener('click', () => {
            this.saveAISettings();
        });
    },

    updateAISettingsUI() {
        // Update provider buttons
        document.querySelectorAll('.api-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.provider === this.aiSettings.provider);
        });

        // Update inputs
        const apiKeyInput = document.getElementById('aiApiKey');
        const modelSelect = document.getElementById('aiModel');
        const customModel = document.getElementById('customModelName');

        if (apiKeyInput) apiKeyInput.value = this.aiSettings.apiKey || '';
        if (modelSelect) modelSelect.value = this.aiSettings.model || 'gemini-pro';
        if (customModel) customModel.value = this.aiSettings.customModel || '';
    },

    saveAISettings() {
        this.aiSettings.apiKey = document.getElementById('aiApiKey')?.value || '';
        this.aiSettings.model = document.getElementById('aiModel')?.value || 'gemini-pro';
        this.aiSettings.customModel = document.getElementById('customModelName')?.value || '';

        localStorage.setItem('tanikuAISettings', JSON.stringify(this.aiSettings));

        const status = document.getElementById('apiStatus');
        if (status) {
            status.className = 'api-status success';
            status.textContent = '✅ Pengaturan AI berhasil disimpan!';
            setTimeout(() => status.className = 'api-status', 3000);
        }

        AnimationEngine.showToast('Pengaturan AI disimpan! 🤖', 'success');
    },

    // ========== AI API CALLS ==========
    async callAI(prompt, context = '') {
        const { provider, apiKey, model, customModel } = this.aiSettings;
        const modelToUse = customModel || model;

        if (!apiKey) {
            return 'API Key belum diatur. Buka Setting → Pengaturan AI API untuk memasukkan API Key.';
        }

        try {
            let response;

            if (provider === 'gemini') {
                response = await this.callGemini(prompt, context, apiKey, modelToUse);
            } else if (provider === 'openai') {
                response = await this.callOpenAI(prompt, context, apiKey, modelToUse);
            } else if (provider === 'deepseek') {
                response = await this.callDeepSeek(prompt, context, apiKey, modelToUse);
            }

            return response;
        } catch (error) {
            console.error('AI API Error:', error);
            return `Error memanggil AI: ${error.message}`;
        }
    },

    async callGemini(prompt, context, apiKey, model) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${context}\n\nPertanyaan: ${prompt}\n\nJawab dalam Bahasa Indonesia dengan singkat dan informatif.`
                    }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respons dari Gemini.';
    },

    async callOpenAI(prompt, context, apiKey, model) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: 'Kamu adalah asisten pertanian Indonesia yang membantu petani.' },
                    { role: 'user', content: `${context}\n\n${prompt}` }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Tidak ada respons dari ChatGPT.';
    },

    async callDeepSeek(prompt, context, apiKey, model) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: 'Kamu adalah asisten pertanian Indonesia.' },
                    { role: 'user', content: `${context}\n\n${prompt}` }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Tidak ada respons dari DeepSeek.';
    },

    // ========== SERVER CONTROL ==========
    serverStatus: 'offline',

    startServer() {
        const terminal = document.getElementById('serverTerminal');
        const statusDot = document.getElementById('serverStatusDot');
        const statusText = document.getElementById('serverStatusText');
        const startBtn = document.getElementById('startServerBtn');
        const stopBtn = document.getElementById('stopServerBtn');
        const port = document.getElementById('serverPort')?.value || 3000;

        // Simulate server start
        this.addTerminalLine('> Memulai server export...', terminal);

        setTimeout(() => {
            this.addTerminalLine(`> Server berjalan di port ${port}`, terminal);
            this.addTerminalLine('> Endpoint tersedia:', terminal);
            this.addTerminalLine('  📊 /export/tanaman', terminal);
            this.addTerminalLine('  🧪 /export/pupuk', terminal);
            this.addTerminalLine('  🐛 /export/hama', terminal);
            this.addTerminalLine('  📦 /export/all', terminal);
            this.addTerminalLine(`> Buka http://localhost:${port}`, terminal);

            this.serverStatus = 'online';
            statusDot?.classList.add('online');
            statusDot?.classList.remove('offline');
            statusText.textContent = 'Server: Online';
            startBtn.disabled = true;
            stopBtn.disabled = false;

            // Update download links
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.href = btn.href.replace(/:\d+/, `:${port}`);
            });
            document.getElementById('serverUrl').href = `http://localhost:${port}`;
            document.getElementById('serverUrl').textContent = `http://localhost:${port}`;

            AnimationEngine.showToast(`Server berjalan di port ${port} 🚀`, 'success');
        }, 1000);
    },

    stopServer() {
        const terminal = document.getElementById('serverTerminal');
        const statusDot = document.getElementById('serverStatusDot');
        const statusText = document.getElementById('serverStatusText');
        const startBtn = document.getElementById('startServerBtn');
        const stopBtn = document.getElementById('stopServerBtn');

        this.addTerminalLine('> Menghentikan server...', terminal);

        setTimeout(() => {
            this.addTerminalLine('> Server dihentikan', terminal);

            this.serverStatus = 'offline';
            statusDot?.classList.remove('online');
            statusDot?.classList.add('offline');
            statusText.textContent = 'Server: Offline';
            startBtn.disabled = false;
            stopBtn.disabled = true;

            AnimationEngine.showToast('Server dihentikan', 'info');
        }, 500);
    },

    addTerminalLine(text, terminal) {
        if (!terminal) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    },

    clearTerminal() {
        const terminal = document.getElementById('serverTerminal');
        if (terminal) {
            terminal.innerHTML = '<div class="terminal-line">Terminal cleared...</div>';
        }
    },

    // ========== ENHANCED CHAT WITH AI ==========
    async getChatResponseWithAI(message) {
        // Check if API is configured
        if (this.aiSettings.apiKey) {
            const context = 'Kamu adalah AI asisten pertanian Taniku Monitor. Bantu petani dengan informasi tentang tanaman, hama, pupuk, dan harga komoditas Indonesia.';
            return await this.callAI(message, context);
        }

        // Fall back to local responses
        return await this.getChatResponse(message);
    },

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
};

// ========== DRILL-DOWN MAP SYSTEM ==========
const DrillDownMap = {
    currentLevel: 'province', // province, kabupaten, kecamatan, desa
    currentRegion: null,
    zoomLevels: { province: 5, kabupaten: 8, kecamatan: 11, desa: 14 },

    // Indonesia administrative boundaries (mock data - real data from BPS)
    kabupatenData: {
        '31': [ // DKI Jakarta
            { id: '3171', name: 'Jakarta Pusat', lat: -6.1867, lng: 106.8342, index: 108.5 },
            { id: '3172', name: 'Jakarta Utara', lat: -6.1384, lng: 106.8638, index: 107.2 },
            { id: '3173', name: 'Jakarta Barat', lat: -6.1687, lng: 106.7635, index: 106.8 },
            { id: '3174', name: 'Jakarta Selatan', lat: -6.2615, lng: 106.8106, index: 109.1 },
            { id: '3175', name: 'Jakarta Timur', lat: -6.2251, lng: 106.9004, index: 107.5 }
        ],
        '32': [ // Jawa Barat
            { id: '3201', name: 'Bogor', lat: -6.5971, lng: 106.8060, index: 100.5 },
            { id: '3202', name: 'Sukabumi', lat: -6.9277, lng: 106.9301, index: 99.2 },
            { id: '3203', name: 'Cianjur', lat: -6.8204, lng: 107.1369, index: 98.8 },
            { id: '3204', name: 'Bandung', lat: -6.9175, lng: 107.6191, index: 101.5 },
            { id: '3205', name: 'Garut', lat: -7.2167, lng: 107.9000, index: 99.5 },
            { id: '3206', name: 'Tasikmalaya', lat: -7.3274, lng: 108.2207, index: 98.5 },
            { id: '3207', name: 'Ciamis', lat: -7.3289, lng: 108.3519, index: 97.8 },
            { id: '3208', name: 'Kuningan', lat: -6.9756, lng: 108.4836, index: 98.2 },
            { id: '3209', name: 'Cirebon', lat: -6.7063, lng: 108.5570, index: 100.8 },
            { id: '3210', name: 'Majalengka', lat: -6.8365, lng: 108.2278, index: 99.0 }
        ],
        '33': [ // Jawa Tengah
            { id: '3301', name: 'Cilacap', lat: -7.7269, lng: 109.0154, index: 97.5 },
            { id: '3302', name: 'Banyumas', lat: -7.4214, lng: 109.2252, index: 96.8 },
            { id: '3303', name: 'Purbalingga', lat: -7.3875, lng: 109.3639, index: 97.2 },
            { id: '3304', name: 'Banjarnegara', lat: -7.3947, lng: 109.6942, index: 96.5 },
            { id: '3305', name: 'Kebumen', lat: -7.6722, lng: 109.6519, index: 97.0 },
            { id: '3306', name: 'Purworejo', lat: -7.7083, lng: 110.0158, index: 97.5 },
            { id: '3307', name: 'Wonosobo', lat: -7.3639, lng: 109.9019, index: 96.2 },
            { id: '3308', name: 'Magelang', lat: -7.4797, lng: 110.2176, index: 98.5 },
            { id: '3309', name: 'Boyolali', lat: -7.5281, lng: 110.5961, index: 97.8 },
            { id: '3310', name: 'Klaten', lat: -7.7056, lng: 110.6019, index: 98.0 },
            { id: '3311', name: 'Sukoharjo', lat: -7.6812, lng: 110.8452, index: 98.2 },
            { id: '3312', name: 'Wonogiri', lat: -7.8167, lng: 110.9257, index: 96.8 },
            { id: '3313', name: 'Karanganyar', lat: -7.5981, lng: 110.9590, index: 97.5 },
            { id: '3314', name: 'Sragen', lat: -7.4301, lng: 111.0208, index: 97.0 },
            { id: '3315', name: 'Grobogan', lat: -7.1887, lng: 110.8976, index: 96.5 },
            { id: '3316', name: 'Blora', lat: -7.0937, lng: 111.4167, index: 96.2 },
            { id: '3317', name: 'Rembang', lat: -6.7083, lng: 111.3583, index: 97.0 },
            { id: '3318', name: 'Pati', lat: -6.7500, lng: 111.0417, index: 97.5 },
            { id: '3319', name: 'Kudus', lat: -6.8048, lng: 110.8405, index: 98.5 },
            { id: '3320', name: 'Jepara', lat: -6.5933, lng: 110.6758, index: 97.8 },
            { id: '3321', name: 'Demak', lat: -6.8917, lng: 110.6389, index: 98.0 },
            { id: '3322', name: 'Semarang', lat: -7.1500, lng: 110.4167, index: 99.5 },
            { id: '3323', name: 'Temanggung', lat: -7.3167, lng: 110.1750, index: 97.2 },
            { id: '3324', name: 'Kendal', lat: -7.0167, lng: 110.1917, index: 98.0 },
            { id: '3325', name: 'Batang', lat: -6.9000, lng: 109.7250, index: 97.5 },
            { id: '3326', name: 'Pekalongan', lat: -7.0083, lng: 109.6750, index: 98.5 },
            { id: '3327', name: 'Pemalang', lat: -6.8917, lng: 109.3833, index: 97.0 },
            { id: '3328', name: 'Tegal', lat: -6.8790, lng: 109.1417, index: 97.8 },
            { id: '3329', name: 'Brebes', lat: -6.8728, lng: 109.0417, index: 96.5 }
        ],
        '34': [ // DI Yogyakarta
            { id: '3401', name: 'Kulon Progo', lat: -7.8333, lng: 110.1667, index: 97.5 },
            { id: '3402', name: 'Bantul', lat: -7.8833, lng: 110.3333, index: 98.0 },
            { id: '3403', name: 'Gunungkidul', lat: -7.9833, lng: 110.6000, index: 96.5 },
            { id: '3404', name: 'Sleman', lat: -7.7167, lng: 110.3500, index: 99.0 },
            { id: '3471', name: 'Kota Yogyakarta', lat: -7.7956, lng: 110.3695, index: 100.5 }
        ],
        '35': [ // Jawa Timur
            { id: '3501', name: 'Pacitan', lat: -8.1962, lng: 111.0986, index: 96.5 },
            { id: '3502', name: 'Ponorogo', lat: -7.8656, lng: 111.4602, index: 97.0 },
            { id: '3503', name: 'Trenggalek', lat: -8.0517, lng: 111.7101, index: 96.8 },
            { id: '3504', name: 'Tulungagung', lat: -8.0651, lng: 111.9029, index: 97.5 },
            { id: '3505', name: 'Blitar', lat: -8.0987, lng: 112.1681, index: 98.0 },
            { id: '3506', name: 'Kediri', lat: -7.8164, lng: 112.0119, index: 98.5 },
            { id: '3507', name: 'Malang', lat: -7.9786, lng: 112.6314, index: 99.0 },
            { id: '3508', name: 'Lumajang', lat: -8.1336, lng: 113.2247, index: 97.2 },
            { id: '3509', name: 'Jember', lat: -8.1720, lng: 113.7006, index: 97.8 },
            { id: '3510', name: 'Banyuwangi', lat: -8.2193, lng: 114.3690, index: 98.2 },
            { id: '3511', name: 'Bondowoso', lat: -7.9183, lng: 113.8217, index: 96.5 },
            { id: '3512', name: 'Situbondo', lat: -7.7067, lng: 114.0083, index: 97.0 },
            { id: '3513', name: 'Probolinggo', lat: -7.7500, lng: 113.2167, index: 97.5 },
            { id: '3514', name: 'Pasuruan', lat: -7.6500, lng: 112.9083, index: 98.5 },
            { id: '3515', name: 'Sidoarjo', lat: -7.4583, lng: 112.7167, index: 100.5 },
            { id: '3516', name: 'Mojokerto', lat: -7.4667, lng: 112.4333, index: 99.0 },
            { id: '3517', name: 'Jombang', lat: -7.5500, lng: 112.2333, index: 98.0 },
            { id: '3518', name: 'Nganjuk', lat: -7.6000, lng: 111.9000, index: 97.5 },
            { id: '3519', name: 'Madiun', lat: -7.5500, lng: 111.5167, index: 97.2 },
            { id: '3520', name: 'Magetan', lat: -7.6500, lng: 111.3333, index: 96.8 },
            { id: '3521', name: 'Ngawi', lat: -7.4000, lng: 111.4500, index: 96.5 },
            { id: '3522', name: 'Bojonegoro', lat: -7.1500, lng: 111.8833, index: 97.0 },
            { id: '3523', name: 'Tuban', lat: -6.9000, lng: 112.0500, index: 97.8 },
            { id: '3524', name: 'Lamongan', lat: -7.1167, lng: 112.4167, index: 98.2 },
            { id: '3525', name: 'Gresik', lat: -7.1622, lng: 112.6511, index: 100.0 },
            { id: '3526', name: 'Bangkalan', lat: -7.0500, lng: 112.7333, index: 97.5 },
            { id: '3527', name: 'Sampang', lat: -7.1833, lng: 113.2500, index: 96.5 },
            { id: '3528', name: 'Pamekasan', lat: -7.1667, lng: 113.4667, index: 97.0 },
            { id: '3529', name: 'Sumenep', lat: -7.0167, lng: 113.8667, index: 96.8 },
            { id: '3571', name: 'Kota Kediri', lat: -7.8164, lng: 112.0175, index: 99.5 },
            { id: '3572', name: 'Kota Blitar', lat: -8.1017, lng: 112.1608, index: 98.8 },
            { id: '3573', name: 'Kota Malang', lat: -7.9778, lng: 112.6342, index: 101.5 },
            { id: '3578', name: 'Kota Surabaya', lat: -7.2575, lng: 112.7521, index: 105.0 }
        ],
        // ========== SUMATERA ==========
        '11': [ // Aceh
            { id: '1101', name: 'Simeulue', lat: 2.6167, lng: 96.0833, index: 98.5 },
            { id: '1102', name: 'Aceh Singkil', lat: 2.4167, lng: 97.9667, index: 97.0 },
            { id: '1103', name: 'Aceh Selatan', lat: 3.1667, lng: 97.3833, index: 96.5 },
            { id: '1104', name: 'Aceh Tenggara', lat: 3.2833, lng: 97.7500, index: 97.2 },
            { id: '1105', name: 'Aceh Timur', lat: 4.5000, lng: 97.9167, index: 97.8 },
            { id: '1106', name: 'Aceh Tengah', lat: 4.4833, lng: 96.8500, index: 98.0 },
            { id: '1107', name: 'Aceh Barat', lat: 4.4667, lng: 96.1667, index: 97.5 },
            { id: '1108', name: 'Aceh Besar', lat: 5.3833, lng: 95.5167, index: 99.0 },
            { id: '1109', name: 'Pidie', lat: 5.3167, lng: 96.1000, index: 98.2 },
            { id: '1110', name: 'Bireuen', lat: 5.2000, lng: 96.7000, index: 98.5 },
            { id: '1111', name: 'Aceh Utara', lat: 5.2500, lng: 97.0333, index: 97.8 },
            { id: '1112', name: 'Aceh Barat Daya', lat: 3.8333, lng: 96.8667, index: 96.8 },
            { id: '1113', name: 'Gayo Lues', lat: 4.0833, lng: 97.3333, index: 96.2 },
            { id: '1114', name: 'Aceh Tamiang', lat: 4.2667, lng: 97.9833, index: 97.5 },
            { id: '1115', name: 'Nagan Raya', lat: 4.1500, lng: 96.5167, index: 97.0 },
            { id: '1116', name: 'Aceh Jaya', lat: 4.8833, lng: 95.6333, index: 97.8 },
            { id: '1117', name: 'Bener Meriah', lat: 4.6333, lng: 96.9000, index: 98.2 },
            { id: '1118', name: 'Pidie Jaya', lat: 5.1667, lng: 96.1667, index: 97.5 },
            { id: '1171', name: 'Kota Banda Aceh', lat: 5.5483, lng: 95.3238, index: 102.5 },
            { id: '1172', name: 'Kota Sabang', lat: 5.8917, lng: 95.3167, index: 100.0 },
            { id: '1173', name: 'Kota Langsa', lat: 4.4681, lng: 97.9683, index: 99.5 },
            { id: '1174', name: 'Kota Lhokseumawe', lat: 5.1801, lng: 97.1507, index: 100.5 }
        ],
        '12': [ // Sumatera Utara
            { id: '1201', name: 'Nias', lat: 1.0333, lng: 97.8000, index: 97.5 },
            { id: '1202', name: 'Mandailing Natal', lat: 0.8333, lng: 99.5833, index: 96.8 },
            { id: '1203', name: 'Tapanuli Selatan', lat: 1.5000, lng: 99.2500, index: 97.0 },
            { id: '1204', name: 'Tapanuli Tengah', lat: 2.0000, lng: 98.6667, index: 97.5 },
            { id: '1205', name: 'Tapanuli Utara', lat: 2.0167, lng: 99.0667, index: 97.2 },
            { id: '1206', name: 'Toba Samosir', lat: 2.5500, lng: 99.0833, index: 97.8 },
            { id: '1207', name: 'Labuhanbatu', lat: 1.9000, lng: 100.0833, index: 98.5 },
            { id: '1208', name: 'Asahan', lat: 2.8333, lng: 99.6667, index: 98.0 },
            { id: '1209', name: 'Simalungun', lat: 2.9667, lng: 99.0333, index: 97.5 },
            { id: '1210', name: 'Dairi', lat: 2.7500, lng: 98.2167, index: 97.0 },
            { id: '1211', name: 'Karo', lat: 3.0833, lng: 98.3833, index: 98.0 },
            { id: '1212', name: 'Deli Serdang', lat: 3.4000, lng: 98.8500, index: 99.5 },
            { id: '1213', name: 'Langkat', lat: 3.7500, lng: 98.2500, index: 98.2 },
            { id: '1214', name: 'Nias Selatan', lat: 0.5500, lng: 97.8333, index: 96.5 },
            { id: '1215', name: 'Humbang Hasundutan', lat: 2.2833, lng: 98.6667, index: 96.8 },
            { id: '1271', name: 'Kota Medan', lat: 3.5952, lng: 98.6722, index: 105.5 },
            { id: '1272', name: 'Kota Pematangsiantar', lat: 2.9581, lng: 99.0681, index: 100.5 },
            { id: '1275', name: 'Kota Binjai', lat: 3.6003, lng: 98.4869, index: 100.0 }
        ],
        // ========== KALIMANTAN ==========
        '61': [ // Kalimantan Barat
            { id: '6101', name: 'Sambas', lat: 1.3500, lng: 109.3000, index: 97.0 },
            { id: '6102', name: 'Bengkayang', lat: 0.8333, lng: 109.5833, index: 96.5 },
            { id: '6103', name: 'Landak', lat: 0.3667, lng: 109.6167, index: 96.8 },
            { id: '6104', name: 'Pontianak', lat: -0.0167, lng: 109.3333, index: 98.0 },
            { id: '6105', name: 'Sanggau', lat: 0.1167, lng: 110.5833, index: 97.2 },
            { id: '6106', name: 'Ketapang', lat: -1.8333, lng: 109.9833, index: 96.5 },
            { id: '6107', name: 'Sintang', lat: 0.1000, lng: 111.5000, index: 96.8 },
            { id: '6108', name: 'Kapuas Hulu', lat: 0.9667, lng: 112.9333, index: 96.2 },
            { id: '6109', name: 'Sekadau', lat: 0.0333, lng: 110.8333, index: 96.5 },
            { id: '6171', name: 'Kota Pontianak', lat: -0.0226, lng: 109.3425, index: 102.5 },
            { id: '6172', name: 'Kota Singkawang', lat: 0.9058, lng: 108.9875, index: 100.0 }
        ],
        '62': [ // Kalimantan Tengah
            { id: '6201', name: 'Kotawaringin Barat', lat: -2.6833, lng: 111.6333, index: 97.5 },
            { id: '6202', name: 'Kotawaringin Timur', lat: -2.5333, lng: 112.8667, index: 97.0 },
            { id: '6203', name: 'Kapuas', lat: -2.9833, lng: 114.3833, index: 97.2 },
            { id: '6204', name: 'Barito Selatan', lat: -2.2500, lng: 114.7500, index: 96.8 },
            { id: '6205', name: 'Barito Utara', lat: -1.0000, lng: 115.0833, index: 96.5 },
            { id: '6206', name: 'Sukamara', lat: -2.9167, lng: 111.1833, index: 96.2 },
            { id: '6207', name: 'Lamandau', lat: -2.1333, lng: 111.3333, index: 96.5 },
            { id: '6208', name: 'Seruyan', lat: -2.8000, lng: 112.3500, index: 96.8 },
            { id: '6209', name: 'Katingan', lat: -1.8667, lng: 113.3667, index: 97.0 },
            { id: '6210', name: 'Pulang Pisau', lat: -2.8333, lng: 114.0000, index: 96.5 },
            { id: '6211', name: 'Gunung Mas', lat: -1.0167, lng: 113.8833, index: 96.2 },
            { id: '6212', name: 'Barito Timur', lat: -1.9333, lng: 115.1167, index: 96.5 },
            { id: '6213', name: 'Murung Raya', lat: -0.4167, lng: 114.8667, index: 96.0 },
            { id: '6271', name: 'Kota Palangka Raya', lat: -2.2136, lng: 113.9108, index: 101.5 }
        ],
        '63': [ // Kalimantan Selatan
            { id: '6301', name: 'Tanah Laut', lat: -3.7833, lng: 114.8167, index: 97.8 },
            { id: '6302', name: 'Kotabaru', lat: -3.3000, lng: 116.1500, index: 97.0 },
            { id: '6303', name: 'Banjar', lat: -3.4333, lng: 115.0833, index: 97.5 },
            { id: '6304', name: 'Barito Kuala', lat: -3.0500, lng: 114.5833, index: 97.2 },
            { id: '6305', name: 'Tapin', lat: -2.7167, lng: 115.0500, index: 96.8 },
            { id: '6306', name: 'Hulu Sungai Selatan', lat: -2.5333, lng: 115.3333, index: 97.0 },
            { id: '6307', name: 'Hulu Sungai Tengah', lat: -2.4500, lng: 115.5500, index: 96.5 },
            { id: '6308', name: 'Hulu Sungai Utara', lat: -2.4833, lng: 115.1333, index: 96.8 },
            { id: '6309', name: 'Tabalong', lat: -2.0000, lng: 115.6833, index: 97.5 },
            { id: '6310', name: 'Tanah Bumbu', lat: -3.5333, lng: 115.7833, index: 97.2 },
            { id: '6311', name: 'Balangan', lat: -2.3167, lng: 115.6167, index: 96.5 },
            { id: '6371', name: 'Kota Banjarmasin', lat: -3.3186, lng: 114.5943, index: 103.5 },
            { id: '6372', name: 'Kota Banjarbaru', lat: -3.4417, lng: 114.8325, index: 102.0 }
        ],
        '64': [ // Kalimantan Timur
            { id: '6401', name: 'Paser', lat: -1.9500, lng: 115.9500, index: 97.5 },
            { id: '6402', name: 'Kutai Barat', lat: 0.1500, lng: 115.9500, index: 96.8 },
            { id: '6403', name: 'Kutai Kartanegara', lat: -0.5000, lng: 117.0000, index: 98.5 },
            { id: '6404', name: 'Kutai Timur', lat: 0.5500, lng: 117.5000, index: 97.2 },
            { id: '6405', name: 'Berau', lat: 2.0000, lng: 117.5000, index: 97.0 },
            { id: '6409', name: 'Penajam Paser Utara', lat: -1.2833, lng: 116.5333, index: 98.0 },
            { id: '6471', name: 'Kota Balikpapan', lat: -1.2675, lng: 116.8289, index: 104.0 },
            { id: '6472', name: 'Kota Samarinda', lat: -0.4948, lng: 117.1436, index: 102.5 },
            { id: '6474', name: 'Kota Bontang', lat: 0.1333, lng: 117.5000, index: 101.0 }
        ],
        // ========== SULAWESI ==========
        '71': [ // Sulawesi Utara
            { id: '7101', name: 'Bolaang Mongondow', lat: 0.5833, lng: 124.0333, index: 97.0 },
            { id: '7102', name: 'Minahasa', lat: 1.3000, lng: 124.8500, index: 97.5 },
            { id: '7103', name: 'Kepulauan Sangihe', lat: 3.4833, lng: 125.5500, index: 96.5 },
            { id: '7104', name: 'Kepulauan Talaud', lat: 4.0833, lng: 126.8333, index: 96.2 },
            { id: '7105', name: 'Minahasa Selatan', lat: 1.1833, lng: 124.5500, index: 97.2 },
            { id: '7106', name: 'Minahasa Utara', lat: 1.4833, lng: 125.0833, index: 97.8 },
            { id: '7107', name: 'Bolaang Mongondow Utara', lat: 0.8500, lng: 123.9333, index: 96.8 },
            { id: '7108', name: 'Siau Tagulandang Biaro', lat: 2.1000, lng: 125.3833, index: 96.5 },
            { id: '7109', name: 'Minahasa Tenggara', lat: 1.0667, lng: 124.8500, index: 97.0 },
            { id: '7171', name: 'Kota Manado', lat: 1.4748, lng: 124.8421, index: 103.0 },
            { id: '7172', name: 'Kota Bitung', lat: 1.4403, lng: 125.1217, index: 101.0 },
            { id: '7173', name: 'Kota Tomohon', lat: 1.3175, lng: 124.8283, index: 100.0 },
            { id: '7174', name: 'Kota Kotamobagu', lat: 0.7333, lng: 124.3167, index: 99.5 }
        ],
        '73': [ // Sulawesi Selatan
            { id: '7301', name: 'Kepulauan Selayar', lat: -6.1667, lng: 120.5333, index: 97.0 },
            { id: '7302', name: 'Bulukumba', lat: -5.4500, lng: 120.2000, index: 97.5 },
            { id: '7303', name: 'Bantaeng', lat: -5.5333, lng: 119.9500, index: 97.2 },
            { id: '7304', name: 'Jeneponto', lat: -5.6500, lng: 119.7167, index: 96.8 },
            { id: '7305', name: 'Takalar', lat: -5.4167, lng: 119.4167, index: 97.5 },
            { id: '7306', name: 'Gowa', lat: -5.3167, lng: 119.7333, index: 98.5 },
            { id: '7307', name: 'Sinjai', lat: -5.1333, lng: 120.2500, index: 97.0 },
            { id: '7308', name: 'Maros', lat: -4.9833, lng: 119.5750, index: 98.0 },
            { id: '7309', name: 'Pangkajene Kepulauan', lat: -4.8333, lng: 119.5333, index: 97.5 },
            { id: '7310', name: 'Barru', lat: -4.4167, lng: 119.6333, index: 97.2 },
            { id: '7311', name: 'Bone', lat: -4.5500, lng: 120.3333, index: 97.8 },
            { id: '7312', name: 'Soppeng', lat: -4.3500, lng: 119.8833, index: 97.0 },
            { id: '7313', name: 'Wajo', lat: -4.0000, lng: 120.2167, index: 97.5 },
            { id: '7314', name: 'Sidenreng Rappang', lat: -3.9167, lng: 119.9500, index: 97.2 },
            { id: '7315', name: 'Pinrang', lat: -3.7833, lng: 119.6333, index: 97.8 },
            { id: '7316', name: 'Enrekang', lat: -3.5333, lng: 119.8000, index: 96.5 },
            { id: '7317', name: 'Luwu', lat: -2.8667, lng: 120.3333, index: 97.0 },
            { id: '7318', name: 'Tana Toraja', lat: -3.0833, lng: 119.8667, index: 97.5 },
            { id: '7322', name: 'Luwu Utara', lat: -2.4500, lng: 120.3500, index: 96.8 },
            { id: '7325', name: 'Luwu Timur', lat: -2.3833, lng: 121.1500, index: 97.2 },
            { id: '7371', name: 'Kota Makassar', lat: -5.1477, lng: 119.4327, index: 105.0 },
            { id: '7372', name: 'Kota Parepare', lat: -4.0135, lng: 119.6255, index: 100.5 },
            { id: '7373', name: 'Kota Palopo', lat: -2.9922, lng: 120.1969, index: 100.0 }
        ],
        // ========== BALI & NUSA TENGGARA ==========
        '51': [ // Bali
            { id: '5101', name: 'Jembrana', lat: -8.3667, lng: 114.6500, index: 98.0 },
            { id: '5102', name: 'Tabanan', lat: -8.5333, lng: 115.1000, index: 98.5 },
            { id: '5103', name: 'Badung', lat: -8.5833, lng: 115.1833, index: 102.5 },
            { id: '5104', name: 'Gianyar', lat: -8.5500, lng: 115.3333, index: 99.5 },
            { id: '5105', name: 'Klungkung', lat: -8.5333, lng: 115.4000, index: 98.0 },
            { id: '5106', name: 'Bangli', lat: -8.4500, lng: 115.3500, index: 97.5 },
            { id: '5107', name: 'Karangasem', lat: -8.4500, lng: 115.6000, index: 97.0 },
            { id: '5108', name: 'Buleleng', lat: -8.1167, lng: 115.0833, index: 97.8 },
            { id: '5171', name: 'Kota Denpasar', lat: -8.6500, lng: 115.2167, index: 105.5 }
        ],
        '52': [ // Nusa Tenggara Barat
            { id: '5201', name: 'Lombok Barat', lat: -8.5833, lng: 116.1167, index: 97.5 },
            { id: '5202', name: 'Lombok Tengah', lat: -8.7167, lng: 116.2667, index: 97.0 },
            { id: '5203', name: 'Lombok Timur', lat: -8.5500, lng: 116.5333, index: 96.8 },
            { id: '5204', name: 'Sumbawa', lat: -8.5000, lng: 117.4167, index: 96.5 },
            { id: '5205', name: 'Dompu', lat: -8.5333, lng: 118.4667, index: 96.2 },
            { id: '5206', name: 'Bima', lat: -8.4667, lng: 118.7000, index: 96.5 },
            { id: '5207', name: 'Sumbawa Barat', lat: -8.7667, lng: 116.8833, index: 96.8 },
            { id: '5208', name: 'Lombok Utara', lat: -8.3333, lng: 116.3833, index: 97.0 },
            { id: '5271', name: 'Kota Mataram', lat: -8.5833, lng: 116.1167, index: 101.5 },
            { id: '5272', name: 'Kota Bima', lat: -8.4667, lng: 118.7333, index: 99.5 }
        ],
        // ========== PAPUA ==========
        '91': [ // Papua
            { id: '9101', name: 'Merauke', lat: -8.4833, lng: 140.3833, index: 98.5 },
            { id: '9102', name: 'Jayawijaya', lat: -4.0833, lng: 138.8333, index: 100.0 },
            { id: '9103', name: 'Jayapura', lat: -2.5833, lng: 140.7000, index: 99.0 },
            { id: '9104', name: 'Nabire', lat: -3.3500, lng: 135.5167, index: 98.0 },
            { id: '9105', name: 'Kepulauan Yapen', lat: -1.8000, lng: 136.2000, index: 97.5 },
            { id: '9106', name: 'Biak Numfor', lat: -1.1833, lng: 136.0833, index: 98.2 },
            { id: '9107', name: 'Paniai', lat: -3.9000, lng: 136.3833, index: 97.0 },
            { id: '9108', name: 'Puncak Jaya', lat: -4.0167, lng: 137.1000, index: 99.5 },
            { id: '9109', name: 'Mimika', lat: -4.5333, lng: 136.8833, index: 102.5 },
            { id: '9110', name: 'Boven Digoel', lat: -5.5500, lng: 140.0333, index: 97.8 },
            { id: '9171', name: 'Kota Jayapura', lat: -2.5333, lng: 140.7167, index: 105.0 }
        ]
    },

    kecamatanData: {
        '3171': [ // Jakarta Pusat
            { id: '3171010', name: 'Gambir', lat: -6.1754, lng: 106.8272, index: 109.0 },
            { id: '3171020', name: 'Tanah Abang', lat: -6.1918, lng: 106.8137, index: 108.5 },
            { id: '3171030', name: 'Menteng', lat: -6.1986, lng: 106.8394, index: 110.2 },
            { id: '3171040', name: 'Senen', lat: -6.1789, lng: 106.8455, index: 107.8 },
            { id: '3171050', name: 'Cempaka Putih', lat: -6.1722, lng: 106.8685, index: 108.0 },
            { id: '3171060', name: 'Johar Baru', lat: -6.1829, lng: 106.8569, index: 107.5 },
            { id: '3171070', name: 'Kemayoran', lat: -6.1618, lng: 106.8548, index: 108.2 },
            { id: '3171080', name: 'Sawah Besar', lat: -6.1525, lng: 106.8342, index: 107.0 }
        ],
        '3201': [ // Bogor
            { id: '3201010', name: 'Leuwiliang', lat: -6.5823, lng: 106.6321, index: 99.5 },
            { id: '3201020', name: 'Ciampea', lat: -6.5412, lng: 106.6912, index: 100.0 },
            { id: '3201030', name: 'Cibungbulang', lat: -6.5234, lng: 106.6543, index: 99.8 },
            { id: '3201040', name: 'Pamijahan', lat: -6.6123, lng: 106.7234, index: 99.2 },
            { id: '3201050', name: 'Dramaga', lat: -6.5567, lng: 106.7456, index: 100.5 },
            { id: '3201060', name: 'Ciomas', lat: -6.6234, lng: 106.7678, index: 101.0 }
        ]
    },

    desaData: {
        '3171010': [ // Gambir
            { id: '3171010001', name: 'Gambir', lat: -6.1712, lng: 106.8234, index: 109.5 },
            { id: '3171010002', name: 'Cideng', lat: -6.1789, lng: 106.8189, index: 108.8 },
            { id: '3171010003', name: 'Petojo Utara', lat: -6.1734, lng: 106.8312, index: 109.2 },
            { id: '3171010004', name: 'Petojo Selatan', lat: -6.1801, lng: 106.8356, index: 108.5 },
            { id: '3171010005', name: 'Kebon Kelapa', lat: -6.1756, lng: 106.8267, index: 110.0 },
            { id: '3171010006', name: 'Duri Pulo', lat: -6.1823, lng: 106.8234, index: 107.5 }
        ]
    },

    init() {
        // Override province click for drill-down
        if (TanikuApp.state.indonesiaLayer) {
            TanikuApp.state.indonesiaLayer.eachLayer(layer => {
                layer.off('click');
                layer.on('click', (e) => this.handleClick(e, layer.feature, 'province'));
            });
        }
    },

    handleClick(e, feature, level) {
        const code = this.getRegionCode(feature, level);
        const name = this.getRegionName(feature, level);

        AnimationEngine.showLoading(`Memuat data ${name}...`);

        // Smooth zoom animation
        const targetZoom = this.zoomLevels[this.getNextLevel(level)];
        const center = e.latlng || [feature.lat, feature.lng];

        TanikuApp.state.map.flyTo(center, targetZoom, {
            duration: 1.5,
            easeLinearity: 0.25
        });

        setTimeout(() => {
            this.loadSubRegions(code, level);
            AnimationEngine.hideLoading();
        }, 1600);
    },

    getNextLevel(current) {
        const levels = ['province', 'kabupaten', 'kecamatan', 'desa'];
        const idx = levels.indexOf(current);
        return levels[Math.min(idx + 1, levels.length - 1)];
    },

    getRegionCode(feature, level) {
        if (level === 'province') {
            return (feature.properties.kode || '').toString().substring(0, 2);
        }
        return feature.id || feature.properties?.id || '';
    },

    getRegionName(feature, level) {
        if (level === 'province') {
            return feature.properties.Propinsi || feature.properties.name || 'Unknown';
        }
        return feature.name || feature.properties?.name || 'Unknown';
    },

    loadSubRegions(parentCode, parentLevel) {
        // Clear existing markers
        if (this.subRegionMarkers) {
            this.subRegionMarkers.forEach(m => TanikuApp.state.map.removeLayer(m));
        }
        this.subRegionMarkers = [];

        let data = [];
        let nextLevel = this.getNextLevel(parentLevel);

        if (parentLevel === 'province') {
            data = this.kabupatenData[parentCode] || this.generateMockKabupaten(parentCode);
            this.currentLevel = 'kabupaten';
        } else if (parentLevel === 'kabupaten') {
            data = this.kecamatanData[parentCode] || this.generateMockKecamatan(parentCode);
            this.currentLevel = 'kecamatan';
        } else if (parentLevel === 'kecamatan') {
            data = this.desaData[parentCode] || this.generateMockDesa(parentCode);
            this.currentLevel = 'desa';
        }

        // Add markers for sub-regions
        data.forEach(region => {
            const color = region.index > 105 ? '#ef4444' : region.index > 100 ? '#f59e0b' : '#22c55e';

            const marker = L.circleMarker([region.lat, region.lng], {
                radius: nextLevel === 'kabupaten' ? 12 : nextLevel === 'kecamatan' ? 10 : 8,
                fillColor: color,
                color: '#fff',
                weight: 2,
                fillOpacity: 0.8
            }).addTo(TanikuApp.state.map);

            marker.bindPopup(`
                <div style="text-align:center">
                    <strong>${region.name}</strong><br>
                    <span style="color:${color};font-weight:bold">Indeks: ${region.index.toFixed(1)}</span><br>
                    <small>Klik untuk detail</small>
                </div>
            `);

            marker.on('click', () => {
                if (nextLevel !== 'desa') {
                    this.handleClick({ latlng: [region.lat, region.lng] }, region, nextLevel);
                } else {
                    this.showDesaDetail(region);
                }
            });

            this.subRegionMarkers.push(marker);
        });

        // Show back button
        this.showBackButton(parentLevel);
        AnimationEngine.showToast(`📍 ${data.length} ${nextLevel} dimuat`, 'success');
    },

    generateMockKabupaten(provinceCode) {
        const provinceData = CommodityData.provinceIndex[provinceCode];
        const baseIndex = provinceData?.index || 100;
        const kabList = [];
        const count = 5 + Math.floor(Math.random() * 10);

        for (let i = 0; i < count; i++) {
            kabList.push({
                id: `${provinceCode}${String(i + 1).padStart(2, '0')}`,
                name: `Kabupaten ${i + 1}`,
                lat: -6.2 + (Math.random() - 0.5) * 2,
                lng: 106.8 + (Math.random() - 0.5) * 2,
                index: baseIndex + (Math.random() - 0.5) * 10
            });
        }
        return kabList;
    },

    generateMockKecamatan(kabCode) {
        const kecList = [];
        const count = 4 + Math.floor(Math.random() * 8);

        for (let i = 0; i < count; i++) {
            kecList.push({
                id: `${kabCode}${String(i + 1).padStart(3, '0')}`,
                name: `Kecamatan ${i + 1}`,
                lat: -6.2 + (Math.random() - 0.5) * 0.5,
                lng: 106.8 + (Math.random() - 0.5) * 0.5,
                index: 95 + Math.random() * 15
            });
        }
        return kecList;
    },

    generateMockDesa(kecCode) {
        const desaList = [];
        const count = 3 + Math.floor(Math.random() * 6);

        for (let i = 0; i < count; i++) {
            desaList.push({
                id: `${kecCode}${String(i + 1).padStart(4, '0')}`,
                name: `Desa ${i + 1}`,
                lat: -6.2 + (Math.random() - 0.5) * 0.1,
                lng: 106.8 + (Math.random() - 0.5) * 0.1,
                index: 90 + Math.random() * 20
            });
        }
        return desaList;
    },

    showDesaDetail(desa) {
        AnimationEngine.showToast(`🏘️ ${desa.name} - Indeks: ${desa.index.toFixed(1)}`, 'info');
    },

    showBackButton(level) {
        let backBtn = document.getElementById('mapBackBtn');
        if (!backBtn) {
            backBtn = document.createElement('button');
            backBtn.id = 'mapBackBtn';
            backBtn.className = 'map-back-btn';
            backBtn.innerHTML = '⬅️ Kembali';
            document.getElementById('indonesiaMap')?.parentElement?.appendChild(backBtn);
        }
        backBtn.style.display = level !== 'province' ? 'block' : 'none';
        backBtn.onclick = () => this.goBack();
    },

    goBack() {
        // Clear sub-region markers
        if (this.subRegionMarkers) {
            this.subRegionMarkers.forEach(m => TanikuApp.state.map.removeLayer(m));
            this.subRegionMarkers = [];
        }

        // Reset to province view
        TanikuApp.state.map.flyTo([-2.5, 118], 5, { duration: 1.5 });
        this.currentLevel = 'province';
        document.getElementById('mapBackBtn').style.display = 'none';
    }
};

// ========== REAL-TIME DATA UPDATE SYSTEM (5 seconds) ==========
const RealTimeUpdater = {
    interval: 5000, // 5 seconds
    timers: [],

    start() {
        console.log('⏱️ Real-time updates started (every 5 seconds)');

        // Update all data every 5 seconds
        this.timers.push(setInterval(() => this.updateAll(), this.interval));

        // Initial update
        this.updateAll();
    },

    stop() {
        this.timers.forEach(t => clearInterval(t));
        this.timers = [];
        console.log('⏱️ Real-time updates stopped');
    },

    updateAll() {
        const now = new Date();
        console.log(`🔄 Data refresh: ${now.toLocaleTimeString('id-ID')}`);

        // Update IHG
        this.updatePrices();

        // Update map colors
        this.updateMapColors();

        // Update weather
        TanikuApp.updateWeather?.();

        // Update exchange rate
        TanikuApp.updateExchangeRate?.();

        // Update dashboard stats
        this.updateDashboardStats();

        // Flash indicator
        this.flashUpdateIndicator();
    },

    updatePrices() {
        // Simulate real-time price changes
        CommodityData.commodities.forEach(c => {
            const change = (Math.random() - 0.5) * 0.02; // ±1% change
            c.currentPrice = c.basePrice * (1 + change);
        });

        // Update IHG display
        TanikuApp.updateIHG?.();
    },

    updateMapColors() {
        if (!TanikuApp.state.indonesiaLayer) return;

        TanikuApp.state.indonesiaLayer.eachLayer(layer => {
            const feature = layer.feature;
            const code = (feature.properties.kode || '').toString().substring(0, 2);
            const baseIndex = CommodityData.provinceIndex[code]?.index || 100;

            // Add small random variation
            const index = baseIndex + (Math.random() - 0.5) * 2;

            let color = '#22c55e';
            if (index > 105) color = '#ef4444';
            else if (index > 100) color = '#f59e0b';

            layer.setStyle({ fillColor: color, fillOpacity: 0.6 + Math.random() * 0.2 });
        });

        // Update drill-down markers if any
        if (DrillDownMap.subRegionMarkers) {
            DrillDownMap.subRegionMarkers.forEach(marker => {
                const change = (Math.random() - 0.5) * 5;
                const index = 100 + change;
                const color = index > 105 ? '#ef4444' : index > 100 ? '#f59e0b' : '#22c55e';
                marker.setStyle({ fillColor: color });
            });
        }
    },

    updateDashboardStats() {
        // Update quick stats
        const cheapest = CommodityData.commodities.reduce((a, b) =>
            (a.currentPrice || a.basePrice) < (b.currentPrice || b.basePrice) ? a : b
        );
        const expensive = CommodityData.commodities.reduce((a, b) =>
            (a.currentPrice || a.basePrice) > (b.currentPrice || b.basePrice) ? a : b
        );

        const cheapEl = document.getElementById('cheapestItem');
        const expEl = document.getElementById('expensiveItem');

        if (cheapEl) cheapEl.textContent = `${cheapest.icon} ${cheapest.name}`;
        if (expEl) expEl.textContent = `${expensive.icon} ${expensive.name}`;

        // Update top movers
        TanikuApp.renderTopMovers?.();
    },

    flashUpdateIndicator() {
        const ts = document.getElementById('liveTimestamp');
        if (ts) {
            ts.style.animation = 'none';
            ts.offsetHeight; // Trigger reflow
            ts.style.animation = 'pulse 0.5s ease';
        }
    }
};

// Enhanced init function
const originalInit = TanikuApp.init;
TanikuApp.init = async function () {
    await originalInit.call(this);

    // Initialize new features
    this.initMapCommoditySelector();
    this.initCalcTabs();
    this.initTimeRangeBar();
    this.initLiveTimestamp();
    this.initEnterKeySearch();
    this.initChatbot();
    this.updateIHG();
    this.updateWeather();
    this.updateExchangeRate();
    this.loadWorldBankData();

    // Initialize Info tab
    this.initInfoTab();

    // Initialize AI settings
    this.initAISettings();

    // Initialize drill-down map
    setTimeout(() => DrillDownMap.init(), 2000);

    // Start real-time updates (every 5 seconds)
    RealTimeUpdater.start();

    console.log('🚀 Taniku Monitor v5.2 - AI API + Drill-down Map + Real-time Updates');
};

// Export modules
window.DrillDownMap = DrillDownMap;
window.RealTimeUpdater = RealTimeUpdater;

// Start app
document.addEventListener('DOMContentLoaded', () => TanikuApp.init());
window.TanikuApp = TanikuApp;




