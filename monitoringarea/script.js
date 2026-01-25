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
        // ... (Icons can be dynamically loaded or fallbacked)
    },

    async init() {
        console.log('🌾 Taniku Monitor Official Starting...');
        AnimationEngine.showLoading('Menghubungkan ke BPS & World Bank...');

        try {
            this.initTabNavigation();
            this.initLanguageSelector();
            this.initCommoditySystem();
            this.initDashboard(); // Fetches Inflation/GDP
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

    // ========== DASHBOARD (REAL DATA) ==========
    async initDashboard() {
        // Fetch Official Data
        this.updateOfficialIndicators();

        // Render Empty/Static Commodity List initially
        this.renderCommodities();
    },

    async updateOfficialIndicators() {
        // Inflation
        const inflasi = await APIService.fetchInflation();
        if (inflasi) {
            document.getElementById('ihgValue').textContent = `${inflasi.value}%`;
            document.getElementById('ihgChange').textContent = `Sumber: ${inflasi.source} (${inflasi.year})`;
            document.getElementById('ihgChange').className = 'ihg-change'; // Neutral
        } else {
            document.getElementById('ihgValue').textContent = '-';
            document.getElementById('ihgChange').textContent = 'Data Tidak Tersedia';
        }

        // GDP
        const gdp = await APIService.fetchGDP();
        if (gdp) {
            document.getElementById('wbGDP').textContent = APIService.formatPrice(gdp.value); // Formats as currency
        } else {
            document.getElementById('wbGDP').textContent = '-';
        }

        // Other WB Data (Population/Agri) could be added here similar to official_data.js pattern
    },

    // ========== COMMODITY SYSTEM ==========
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
        // Filter logic if needed

        container.innerHTML = items.map((item, i) => {
            // STRICT: No fake prices. If price is null/undefined in Data, show "Tidak Tersedia"
            // Note: Data.js prices were stripped. So this will be null.
            const priceDisplay = APIService.formatPrice(item.price);

            // Icon handling
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
                        Data Resmi: ${item.price ? 'BPS/WB' : 'Tidak Tersedia'}
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

        document.getElementById('detailName').textContent = item.name;
        document.getElementById('detailPrice').textContent = APIService.formatPrice(item.price);

        // Real Wikipedia Data
        const wikiText = document.getElementById('wikiText');
        wikiText.textContent = 'Memuat data resmi...';
        const wiki = await APIService.fetchWikiSummary(item.name);
        wikiText.textContent = wiki.extract;

        // Clear charts (No mock data)
        const ctx = document.getElementById('detailChart');
        if (this.state.detailChart) this.state.detailChart.destroy();
        // We could display a message "Grafik historis tidak tersedia dari BPS"
    },

    // ========== MAP ==========
    async initMap() {
        const mapContainer = document.getElementById('indonesiaMap');
        if (!mapContainer) return;

        this.state.map = L.map('indonesiaMap', {
            center: [-2.5, 118],
            zoom: 4
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap'
        }).addTo(this.state.map);

        // Load GeoJSON if available
        try {
             const response = await fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json');
             const geojson = await response.json();
             L.geoJSON(geojson, {
                 style: { fillColor: '#22c55e', weight: 1, color: 'white', fillOpacity: 0.5 },
                 onEachFeature: (feature, layer) => {
                     layer.bindPopup(feature.properties.Propinsi);
                 }
             }).addTo(this.state.map);
        } catch(e) {}
    },

    async initLocation() {
        try {
            const loc = await APIService.getCurrentLocation();
            if(loc && loc.address) {
                document.getElementById('locationText').textContent = loc.address.split(',')[0];
            }
        } catch(e) {}
    },

    // ========== LANGUAGE & EXTRAS ==========
    initLanguageSelector() {
        // Simplified
    },

    initMusicPlayer() {
        // Optional: Keep existing if user wants
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => TanikuApp.init());
window.TanikuApp = TanikuApp;
