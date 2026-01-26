/* ================================================
   TANIKU MONITOR - API SERVICE LAYER (STRICT OFFICIAL)
   BPS Indonesia & World Bank Open Data
   ================================================ */

const APIService = {
    // ========== CONFIG ==========
    config: {
        bpsApiKey: 'e11b132228efeb1fa7693a7dad9709ce',
        bpsBaseUrl: 'https://webapi.bps.go.id/v1/api',
        wbBaseUrl: 'https://api.worldbank.org/v2',
        wikiBaseUrl: 'https://id.wikipedia.org/api/rest_v1',
        nominatimUrl: 'https://nominatim.openstreetmap.org'
    },

    // ========== CORE FETCHING ==========
    async fetchJson(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Fetch error for ${url}:`, error);
            return null;
        }
    },

    // ========== IHG / CPI (Consumer Price Index) ==========
    async fetchIHG() {
        // We use CPI (Indeks Harga Konsumen) as a proxy for IHG if specific commodity index isn't available
        // 1. Try BPS (Subject 3 = Inflasi/IHK)
        try {
            // Search for "IHK" variable (Indeks Harga Konsumen)
            // Subject 3 is Inflasi
            const searchUrl = `${this.config.bpsBaseUrl}/list/model/var/domain/0000/subject/3/key/${this.config.bpsApiKey}/`;
            const searchData = await this.fetchJson(searchUrl);

            if (searchData && (searchData.data || searchData.data[1])) {
                const list = Array.isArray(searchData.data) ? searchData.data : searchData.data[1];
                // Find "Indeks Harga Konsumen" (general index)
                const found = list.find(v => v.label.toLowerCase().includes('indeks harga konsumen') && !v.label.toLowerCase().includes('kelompok'));

                if (found) {
                    const dataUrl = `${this.config.bpsBaseUrl}/list/model/data/domain/0000/var/${found.val}/key/${this.config.bpsApiKey}/`;
                    const result = await this.fetchJson(dataUrl);
                    if (result && result['data-availability'] === 'available' && result.datacontent) {
                        const keys = Object.keys(result.datacontent).sort();
                        const latestKey = keys.pop();
                        const prevKey = keys.pop();
                        const current = result.datacontent[latestKey];
                        const prev = result.datacontent[prevKey];

                        return {
                            value: current,
                            change: prev ? ((current - prev) / prev * 100) : 0,
                            source: 'BPS Indonesia (IHK)',
                            year: 'Terbaru'
                        };
                    }
                }
            }
        } catch (e) {
            console.log('BPS IHG failed, trying WB...');
        }

        // 2. Try World Bank (FP.CPI.TOTL)
        try {
            const wbUrl = `${this.config.wbBaseUrl}/country/id/indicator/FP.CPI.TOTL?format=json&per_page=2`;
            const wbData = await this.fetchJson(wbUrl);
            if (wbData && wbData[1] && wbData[1].length >= 1) {
                const current = wbData[1][0].value;
                const prev = wbData[1][1] ? wbData[1][1].value : current;

                return {
                    value: current,
                    change: ((current - prev) / prev * 100),
                    source: 'World Bank (CPI)',
                    year: wbData[1][0].date
                };
            }
        } catch (e) {
            console.log('WB IHG failed');
        }

        return null;
    },

    // ========== INFLATION (BPS -> WB) ==========
    async fetchInflation() {
        // 1. Try BPS (Subject 3 = Inflasi)
        try {
            const searchUrl = `${this.config.bpsBaseUrl}/list/model/var/domain/0000/subject/3/key/${this.config.bpsApiKey}/`;
            const searchData = await this.fetchJson(searchUrl);

            if (searchData && (searchData.data || searchData.data[1])) {
                const list = Array.isArray(searchData.data) ? searchData.data : searchData.data[1];
                // "Inflasi Umum" usually
                const found = list.find(v => v.label.toLowerCase().includes('inflasi umum') || v.label.toLowerCase() === 'inflasi');

                if (found) {
                    const dataUrl = `${this.config.bpsBaseUrl}/list/model/data/domain/0000/var/${found.val}/key/${this.config.bpsApiKey}/`;
                    const result = await this.fetchJson(dataUrl);
                    if (result && result.datacontent) {
                        const keys = Object.keys(result.datacontent).sort();
                        const latestKey = keys.pop();
                        return {
                            value: result.datacontent[latestKey],
                            source: 'BPS Indonesia',
                            year: 'Terbaru'
                        };
                    }
                }
            }
        } catch (e) {}

        // 2. Try World Bank (FP.CPI.TOTL.ZG)
        try {
            const wbUrl = `${this.config.wbBaseUrl}/country/id/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1`;
            const wbData = await this.fetchJson(wbUrl);
            if (wbData && wbData[1] && wbData[1][0]) {
                return {
                    value: wbData[1][0].value,
                    source: 'World Bank Open Data',
                    year: wbData[1][0].date
                };
            }
        } catch (e) {}

        return null;
    },

    // ========== GDP (BPS -> WB) ==========
    async fetchGDP() {
        // WB is usually cleaner for GDP
        try {
            const wbUrl = `${this.config.wbBaseUrl}/country/id/indicator/NY.GDP.MKTP.CN?format=json&per_page=1`; // LCU (Rupiah)
            const wbData = await this.fetchJson(wbUrl);
            if (wbData && wbData[1] && wbData[1][0]) {
                return {
                    value: wbData[1][0].value,
                    source: 'World Bank Open Data',
                    year: wbData[1][0].date
                };
            }
        } catch (e) {}
        return null;
    },

    // ========== COMMODITY PRICES (Strict Real) ==========
    async fetchCommodityPrice(commodityName) {
        // We try to search BPS Static Tables for specific commodity strings
        // This is a "best effort" search.
        try {
            const keywords = ['harga', 'rata-rata', commodityName.toLowerCase()];
            // Note: BPS Static Table search isn't query-based in v1 API, it lists tables.
            // We fetch the list of tables for "Harga Produsen" or "Harga Konsumen" subject.
            // Subject 12 = Harga Produsen, Subject 13 = Harga Konsumen

            // Let's try Subject 13 (Consumer Prices)
            const url = `${this.config.bpsBaseUrl}/list/model/statictable/domain/0000/subject/13/key/${this.config.bpsApiKey}/`;
            const response = await this.fetchJson(url);

            if (response && (response.data || response.data[1])) {
                const list = Array.isArray(response.data) ? response.data : response.data[1];
                const found = list.find(t => t.title.toLowerCase().includes(commodityName.toLowerCase()));

                if (found) {
                    return {
                        price: null, // Static tables are HTML/Excel, we can't parse value easily in frontend JS without scraping.
                        // But we return the link as "Available Source"
                        sourceUrl: found.excel || found.pdf || null,
                        sourceName: 'BPS Tabel Statis'
                    };
                }
            }
        } catch (e) {}
        return null;
    },

    // ========== WIKIPEDIA ==========
    async fetchWikiSummary(title) {
        try {
            const url = `${this.config.wikiBaseUrl}/page/summary/${encodeURIComponent(title)}`;
            const data = await this.fetchJson(url);
            return {
                title: data.title,
                extract: data.extract || 'Deskripsi tidak tersedia.',
                thumbnail: data.thumbnail?.source || null
            };
        } catch (e) {
            return { title: title, extract: 'Info tidak tersedia.', thumbnail: null };
        }
    },

    // ========== WEATHER (OpenMeteo - Official Free) ==========
    async fetchWeather(lat, lng) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
            const data = await this.fetchJson(url);
            if (data && data.current_weather) {
                return {
                    current: {
                        temp: data.current_weather.temperature,
                        weatherCode: data.current_weather.weathercode
                    }
                };
            }
        } catch(e) {}
        return null;
    },

    getWeatherIcon(code) {
        if (code === 0) return '☀️';
        if (code < 3) return '⛅';
        if (code < 50) return '🌫️';
        if (code < 80) return '🌧️';
        return '⛈️';
    },

    // ========== EXCHANGE RATE (ExchangeRate-API) ==========
    async fetchExchangeRate(currency) {
         try {
             const url = `https://api.exchangerate-api.com/v4/latest/${currency}`;
             const data = await this.fetchJson(url);
             if (data && data.rates && data.rates.IDR) {
                 return { idr: data.rates.IDR };
             }
         } catch(e) {}
         return { idr: null };
    },

    // ========== GEOLOCATION ==========
    async getCurrentLocation() {
         return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const address = await this.reverseGeocode(latitude, longitude);
                    resolve({ lat: latitude, lng: longitude, address });
                },
                (err) => reject(err),
                { timeout: 10000 }
            );
        });
    },

    async reverseGeocode(lat, lng) {
        try {
            const url = `${this.config.nominatimUrl}/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`;
            const data = await this.fetchJson(url);
            return data.display_name || 'Lokasi tidak diketahui';
        } catch (e) {
            return 'Lokasi tidak diketahui';
        }
    },

    // ========== FORMATTING ==========
    formatPrice(price) {
        if (price === null || price === undefined || isNaN(price)) return 'Tidak Tersedia';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    formatNumber(num) {
         if (num === null || num === undefined || isNaN(num)) return '-';
         return new Intl.NumberFormat('id-ID').format(num);
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID');
    }
};

window.APIService = APIService;
console.log('📡 Strict Official API Service initialized');
