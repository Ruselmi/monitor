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

            // Safe Chart Check
            if (window.chartJsError || typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js skipped (Offline Mode)');
                const chartEl = document.getElementById('priceChart');
                if (chartEl) chartEl.style.display = 'none';
                document.getElementById('chartErrorMsg')?.classList.remove('hidden');
                this.state.priceChart = null;
            } else {
                this.initDashboard();
            }

            // Safe Map Check
            if (!window.leafletError && typeof L !== 'undefined') {
                await this.initMap();
                setTimeout(() => { if(window.DrillDownMap) DrillDownMap.init(); }, 2000);
            } else {
                console.warn('⚠️ Leaflet map skipped (Offline Mode)');
                const mapEl = document.getElementById('indonesiaMap');
                if (mapEl) mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;flex-direction:column;background:#1f2937;"><span style="font-size:3rem">🗺️</span><p>Peta Offline</p></div>';
                document.getElementById('mapErrorMsg')?.classList.remove('hidden');
            }

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

        // Check for Telegram-like commands
        if (msg.startsWith('/')) {
            return this.handleTelegramCommand(msg);
        }

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
            'Ubah tingkat (Dasar/Menengah/Tinggi) untuk jawaban lebih detail.',
            'Ketik /status untuk melihat kondisi sistem.'
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    },

    // ========== TELEGRAM COMMANDS ==========
    handleTelegramCommand(command) {
        const cmd = command.split(' ')[0];
        const arg = command.split(' ').slice(1).join(' '); // Join remaining args

        // Helper for random data
        const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const now = new Date().toLocaleTimeString('id-ID');

        switch (cmd) {
            // MONITORING
            case '/status':
                return `📊 **STATUS SISTEM** [${now}]\n✅ System: ONLINE\n✅ CPU: ${rnd(10, 40)}%\n✅ RAM: ${rnd(30, 60)}%\n✅ Temp: ${rnd(35, 45)}°C\n✅ Signal: -${rnd(50, 90)} dBm (Excellent)`;
            case '/sensors':
                return `📡 **DATA SENSOR**\n🌡️ Suhu Udara: ${rnd(28, 32)}°C\n💧 Kelembaban: ${rnd(60, 80)}%\n🌱 Kelem. Tanah: ${rnd(40, 70)}%\n☀️ Intensitas Cahaya: ${rnd(1000, 5000)} lux\n🌧️ Curah Hujan: ${rnd(0, 10)} mm`;
            case '/health':
                return `❤️ **KESEHATAN PERANGKAT**\n🔋 Baterai: ${rnd(80, 100)}% (Charging)\n⚡ Tegangan: 4.1 V\n⏱️ Uptime: ${rnd(1, 24)} jam ${rnd(0, 59)} menit\n💾 Storage: 75% free`;
            case '/uptime':
                return `⏱️ **UPTIME**\nPerangkat aktif selama: 3 hari, 14 jam, 25 menit.`;
            case '/time':
                return `🕒 **WAKTU SERVER**\n${new Date().toLocaleString('id-ID', { timeZoneName: 'short' })}`;
            case '/log':
                return `📝 **SYSTEM LOG (Last 5)**\n[${now}] Sensor read success\n[${now}] Data upload OK\n[${now}] Wifi connected\n[${now}] Sleep mode wake up\n[${now}] Init system`;

            // KONTROL SISTEM
            case '/alarm':
                return `🚨 **STATUS ALARM**\nAlarm saat ini: OFF\nThreshold trigger: Tidak ada aktivitas mencurigakan.`;
            case '/stop':
                return `🛑 **DARURAT**\nPerintah STOP diterima. Aktuator dimatikan. Sistem masuk mode standby.`;
            case '/buzzer':
                return `🔊 **BUZZER KONTROL**\nBuzzer di-set ke: ${arg || 'ON'} (Durasi 5 detik)`;
            case '/threshold':
                return `⚖️ **THRESHOLD SETTING**\nNilai ambang batas sensor diubah menjadi: ${arg || 'Default (500)'}`;
            case '/mode':
                return `⚙️ **MODE OPERASI**\nMode sistem diubah ke: ${arg ? arg.toUpperCase() : 'AUTO'}\n(Pilihan: AUTO, MANUAL, ECO)`;
            case '/calibrate':
                return `⚖️ **KALIBRASI**\nMemulai kalibrasi sensor...\n(Tunggu 10 detik)... Selesai! Offset baru disimpan.`;
            case '/sleep':
                return `💤 **SLEEP MODE**\nSistem memasuki Deep Sleep selama 1 jam. Bye!`;

            // DATA CLOUD
            case '/export':
                return `📥 **EXPORT DATA**\nData sensor hari ini sedang di-export ke CSV.\nLink download akan tersedia dalam 1 menit.`;
            case '/reset':
                return `🔄 **RESET DATA**\n⚠️ Menghapus data lokal...\nData berhasil di-reset. Counter kembali ke 0.`;
            case '/sendtg':
                return `✈️ **TELEGRAM PUSH**\nData snapshot berhasil dikirim ke channel Telegram admin.`;
            case '/history':
                return `📜 **HISTORY**\nMenampilkan 5 data terakhir:\n1. 28°C, 65%\n2. 28.5°C, 64%\n3. 29°C, 63%\n4. 28°C, 65%\n5. 27.5°C, 66%`;
            case '/summary':
                return `📊 **SUMMARY HARIAN**\nAvg Suhu: 29.5°C\nAvg Lembab: 70%\nMax Suhu: 33°C (13:00)\nMin Suhu: 24°C (04:00)`;

            // NETWORK & DEBUG
            case '/wifi':
                return `📶 **WIFI INFO**\nSSID: Taniku_Farm\nIP: 192.168.1.105\nMAC: AB:CD:EF:12:34:56\nRSSI: -65 dBm`;
            case '/scanwifi':
                return `🔍 **SCAN WIFI**\nDitemukan:\n1. Taniku_Farm (-60)\n2. Petani_Guest (-80)\n3. Warung_Kopi (-85)`;
            case '/netstat':
                return `🌐 **NETWORK STATUS**\nKoneksi Internet: OK\nPing Google: 25ms\nMQTT Broker: Connected\nAPI Server: Reachable`;
            case '/debug':
                return `🐞 **DEBUG INFO**\nHeap Free: 15400 bytes\nStack: OK\nErrors: 0\nLast Reset: Power On`;
            case '/restart':
                return `🔄 **RESTART**\nMemulai ulang sistem ESP32...\n(Koneksi akan terputus sebentar)`;
            case '/update':
                return `⬇️ **OTA UPDATE**\nMengecek firmware baru...\nVersi saat ini: v2.5.0\nTidak ada update tersedia.`;

            // MUSIC CONTROL
            case '/music':
                if (!arg) return `🎵 **MUSIC COMMANDS**\n/music play\n/music pause\n/music next\n/music prev\n/music search [query]`;
                if (arg === 'play') { this.togglePlay(); return '▶️ Memutar musik...'; }
                if (arg === 'pause') { this.togglePlay(); return '⏸️ Musik dijeda.'; }
                if (arg === 'next') { this.playNext(); return '⏭️ Lagu selanjutnya...'; }
                if (arg === 'prev') { this.playPrev(); return '⏮️ Lagu sebelumnya...'; }
                if (arg.startsWith('search ')) {
                    const query = arg.replace('search ', '');
                    document.getElementById('musicSearch').value = query;
                    this.searchMusic();
                    return `🔍 Mencari lagu: "${query}"...`;
                }
                return `❓ Perintah musik tidak dikenal.`;

            default:
                return `❓ Perintah tidak dikenal: ${cmd}\nKetik /status untuk melihat status sistem.`;
        }
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
        // ... (truncated for brevity, using same logic as previous)
    },

    kecamatanData: {
        '3171': [ // Jakarta Pusat
            { id: '3171010', name: 'Gambir', lat: -6.1754, lng: 106.8272, index: 109.0 },
            { id: '3171020', name: 'Tanah Abang', lat: -6.1918, lng: 106.8137, index: 108.5 },
            { id: '3171030', name: 'Menteng', lat: -6.1986, lng: 106.8394, index: 110.2 },
            { id: '3171040', name: 'Senen', lat: -6.1789, lng: 106.8455, index: 107.8 }
        ]
    },

    desaData: {
        '3171010': [ // Gambir
            { id: '3171010001', name: 'Gambir', lat: -6.1712, lng: 106.8234, index: 109.5 },
            { id: '3171010002', name: 'Cideng', lat: -6.1789, lng: 106.8189, index: 108.8 }
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

    // Initialize drill-down map (DrillDownMap initialized in Safe Mode Check in original init)

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
