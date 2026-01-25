/* ================================================
   TANIKU MONITOR - MAIN APPLICATION (STRICT OFFICIAL)
   Powered by BPS Indonesia & World Bank Open Data
   ================================================ */

const TanikuApp = {
    state: {
        currentLang: 'id',
        currentTab: 'tabDashboard',
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

    icons: {
        'default': 'https://img.icons8.com/fluency/96/ingredients.png'
    },

    async init() {
        console.log('🌾 Taniku Monitor Official Starting...');
        AnimationEngine.showLoading('Menghubungkan ke BPS & World Bank...');

        try {
            this.initTabNavigation();
            this.initLanguageSelector();
            this.initCommoditySystem();
            this.initDashboard(); // Fetches Inflation/GDP/IHG
            await this.initMap();
            await this.initLocation();

            AnimationEngine.hideLoading();
            AnimationEngine.showToast('Data Resmi Dimuat 🇮🇩', 'success');
        } catch (error) {
            console.error('Init error:', error);
            AnimationEngine.hideLoading();
            AnimationEngine.showToast('Gagal memuat data resmi', 'error');
        }
    },

    // ========== TAB NAVIGATION ==========
    initTabNavigation() {
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
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

        if (tabId === 'tabMap' && this.state.map) {
            setTimeout(() => this.state.map.invalidateSize(), 100);
        }
    },

    // ========== LANGUAGE SELECTOR (ROBUST) ==========
    initLanguageSelector() {
        document.querySelectorAll('.lang-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.setLanguage(card.dataset.lang);
            });
        });

        // Initial set
        const savedLang = localStorage.getItem('tanikuLanguage') || 'id';
        this.setLanguage(savedLang);
    },

    setLanguage(lang) {
        this.state.currentLang = lang;
        localStorage.setItem('tanikuLanguage', lang);

        // Dictionary
        const t = CommodityData.translations[lang] || CommodityData.translations.id;

        // Translate Static UI via Data Attributes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });

        // Translate Placeholders
        document.querySelectorAll('.search-input').forEach(el => {
            el.placeholder = t.search_music || 'Cari...';
        });

        // Translate Dynamic Tabs Labels manually if needed
        const tabMap = {
            'tabDashboard': t.home,
            'tabKomoditas': t.commodities,
            'tabMap': t.map,
            'tabInfo': t.description,
            'tabCalculator': t.calculator,
            'tabChatbot': 'AI',
            'tabSettings': 'Setting'
        };

        document.querySelectorAll('.tab-item').forEach(tab => {
            const id = tab.dataset.tab;
            if(tabMap[id]) tab.querySelector('.tab-label').textContent = tabMap[id];
        });

        // Re-render components that contain text
        if (this.state.currentTab === 'tabKomoditas') this.renderCommodities();
        this.updateDashboard(); // Refreshes labels
    },

    // ========== DASHBOARD (REAL DATA) ==========
    async initDashboard() {
        this.updateOfficialIndicators();
        this.renderCommodities();

        // Real Exchange Rate
        const rate = await APIService.fetchExchangeRate('USD');
        if(rate.idr) {
            document.getElementById('exchangeRate').textContent = `$1 = ${APIService.formatPrice(rate.idr)}`;
        }

        // Real Weather (Default Jakarta)
        const weather = await APIService.fetchWeather(-6.2, 106.8);
        if(weather && weather.current) {
            document.getElementById('weatherInfo').textContent = `${APIService.getWeatherIcon(weather.current.weatherCode)} ${weather.current.temp}°C`;
        }
    },

    updateDashboard() {
        // Called on lang change
        this.updateOfficialIndicators(); // Re-fetch to update label source text if needed? No, just text.
    },

    async updateOfficialIndicators() {
        // IHG / CPI (Real)
        const ihg = await APIService.fetchIHG();
        const t = CommodityData.translations[this.state.currentLang];

        if (ihg) {
            document.getElementById('ihgValue').textContent = ihg.value.toFixed(2);
            // Translate "Sumber"
            const sourceText = this.state.currentLang === 'en' ? 'Source' : 'Sumber';
            document.getElementById('ihgChange').textContent = `${sourceText}: ${ihg.source} (${ihg.year})`;

            // Show change if available
            if(ihg.change !== undefined) {
                 // Add small indicator?
            }
        } else {
            document.getElementById('ihgValue').textContent = '-';
            document.getElementById('ihgChange').textContent = t.no_data || 'Data Tidak Tersedia';
        }

        // Inflation (Real)
        const inflasi = await APIService.fetchInflation();
        // Maybe display inflation somewhere else or replace "Termurah" card which is now useless without mock data?
        // Let's replace "Termurah" with "Inflasi" on the dashboard HTML structure dynamically
        const cheapCard = document.getElementById('cheapestItem')?.parentElement;
        if(cheapCard) {
             cheapCard.querySelector('h3').textContent = 'Inflasi (yoy)';
             cheapCard.querySelector('.stat-value').textContent = inflasi ? `${inflasi.value}%` : '-';
             cheapCard.querySelector('.stat-sub').textContent = inflasi ? `${inflasi.source} ${inflasi.year}` : '';
        }

        // GDP (Real)
        const gdp = await APIService.fetchGDP();
        if (gdp) {
            document.getElementById('wbGDP').textContent = APIService.formatPrice(gdp.value);
        } else {
            document.getElementById('wbGDP').textContent = '-';
        }
    },

    // ========== COMMODITY SYSTEM (Real Search) ==========
    initCommoditySystem() {
        document.querySelectorAll('.pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.state.currentCategory = pill.dataset.cat;
                this.renderCommodities();
            });
        });
    },

    renderCommodities() {
        const container = document.getElementById('commodityGrid');
        if (!container) return;

        let items = CommodityData.getCommoditiesByCategory(this.state.currentCategory);
        const t = CommodityData.translations[this.state.currentLang];

        container.innerHTML = items.map((item, i) => {
            // Check if we have price (likely null initially)
            const priceDisplay = item.price ? APIService.formatPrice(item.price) : (t.check_api || 'Cek Data BPS');
            const iconUrl = this.icons[item.id] || this.icons.default;

            return `
                <div class="commodity-card" onclick="TanikuApp.showDetail('${item.id}')">
                    <div class="icon-wrap">
                        <span style="font-size: 2rem;">${item.icon || '📦'}</span>
                    </div>
                    <h4>${item.name}</h4>
                    <div class="price">
                        ${priceDisplay}
                    </div>
                    <div class="unit">per ${item.unit}</div>
                    <div style="font-size: 0.7rem; color: #666; margin-top: 5px;">
                        ${t.source || 'Sumber'}: BPS
                    </div>
                </div>
            `;
        }).join('');
    },

    async showDetail(commodityId) {
        const item = CommodityData.getCommodityById(commodityId);
        if (!item) return;

        const modal = document.getElementById('commodityModal');
        modal?.classList.remove('hidden');

        // Reset View
        document.getElementById('detailName').textContent = item.name;
        document.getElementById('detailPrice').textContent = 'Memuat Data BPS...';

        // REAL TIME FETCH on click
        const realData = await APIService.fetchCommodityPrice(item.name);

        if(realData && realData.sourceUrl) {
             document.getElementById('detailPrice').innerHTML = `<a href="${realData.sourceUrl}" target="_blank" style="color:var(--accent);text-decoration:underline;font-size:1rem;">Lihat Tabel BPS</a>`;
        } else {
             document.getElementById('detailPrice').textContent = 'Data Spesifik Tidak Ditemukan di API Publik BPS';
        }

        // Wikipedia
        const wikiText = document.getElementById('wikiText');
        wikiText.textContent = 'Memuat...';
        const wiki = await APIService.fetchWikiSummary(item.name);
        wikiText.textContent = wiki.extract;

        // Charts removed (No fake data)
        const ctx = document.getElementById('detailChart');
        if (this.state.detailChart) this.state.detailChart.destroy();
    },

    // ========== CALCULATOR (Real Input) ==========
    initCalculator() {
        const cropSelect = document.getElementById('calcCrop');
        if (!cropSelect) return;

        const crops = CommodityData.commodities.filter(c => c.yieldPerHa > 0);
        cropSelect.innerHTML = '<option value="">-- Pilih --</option>' +
            crops.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');

        document.getElementById('calculateBtn')?.addEventListener('click', () => this.calculate());
    },

    calculate() {
        const cropId = document.getElementById('calcCrop')?.value;
        const area = parseFloat(document.getElementById('calcArea')?.value) || 0;

        // ASK FOR PRICE
        const priceInput = prompt("Masukkan harga estimasi per kg (Rp):", "10000");
        const price = parseFloat(priceInput);

        if (!cropId || !area || isNaN(price)) {
            alert('Mohon lengkapi data dan harga yang valid.');
            return;
        }

        const result = CommodityData.calculateHarvest(cropId, area);
        if (!result) return;

        // Recalculate with user price
        result.revenue = result.yield * price;
        result.netProfit = result.revenue - result.fertilizerCost;

        const resultsEl = document.getElementById('calcResults');
        resultsEl.classList.remove('hidden');

        document.getElementById('harvestAmount').textContent = APIService.formatNumber(result.yield) + ' kg';
        document.getElementById('revenueAmount').textContent = APIService.formatPrice(result.revenue);
        document.getElementById('fertilizerCost').textContent = APIService.formatPrice(result.fertilizerCost);
        document.getElementById('netProfit').textContent = APIService.formatPrice(result.netProfit);
    },

    // ========== MAP (Real Admin Only) ==========
    async initMap() {
        const mapContainer = document.getElementById('indonesiaMap');
        if (!mapContainer) return;

        this.state.map = L.map('indonesiaMap', { center: [-2.5, 118], zoom: 4 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.state.map);

        // Only load Province GeoJSON (Official Admin Map)
        try {
             const response = await fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json');
             const geojson = await response.json();
             L.geoJSON(geojson, {
                 style: { fillColor: '#22c55e', weight: 1, color: 'white', fillOpacity: 0.4 },
                 onEachFeature: (feature, layer) => {
                     // No fake index. Just name.
                     layer.bindPopup(`<b>${feature.properties.Propinsi}</b><br>Wilayah Administratif Indonesia`);
                 }
             }).addTo(this.state.map);
        } catch(e) {}
    },

    async initLocation() {
        try {
            const loc = await APIService.getCurrentLocation();
            if(loc && loc.address) document.getElementById('locationText').textContent = loc.address.split(',')[0];
        } catch(e) {}
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => TanikuApp.init());
window.TanikuApp = TanikuApp;
