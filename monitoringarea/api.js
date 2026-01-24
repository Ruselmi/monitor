/* ================================================
   TANIKU MONITOR - API SERVICE LAYER
   BPS, Wikipedia, iTunes, Geolocation APIs
   ================================================ */

const APIService = {
    config: {
        bpsApiKey: 'e11b132228efeb1fa7693a7dad9709ce',
        bpsBaseUrl: 'https://webapi.bps.go.id/v1/api',
        wikiBaseUrl: 'https://id.wikipedia.org/api/rest_v1',
        wikiEnUrl: 'https://en.wikipedia.org/api/rest_v1',
        itunesBaseUrl: 'https://itunes.apple.com',
        nominatimUrl: 'https://nominatim.openstreetmap.org'
    },

    // ========== BPS API ==========
    async fetchBPSDomains() {
        try {
            const url = `${this.config.bpsBaseUrl}/domain/type/all/key/${this.config.bpsApiKey}/`;
            const response = await fetch(url);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('BPS Domains error:', error);
            return [];
        }
    },

    // ========== WIKIPEDIA API ==========
    async fetchWikiSummary(title, lang = 'id') {
        try {
            const baseUrl = lang === 'en' ? this.config.wikiEnUrl : this.config.wikiBaseUrl;
            const encodedTitle = encodeURIComponent(title);
            const url = `${baseUrl}/page/summary/${encodedTitle}`;

            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error('Not found');

            const data = await response.json();
            return {
                title: data.title,
                extract: data.extract,
                thumbnail: data.thumbnail?.source || null
            };
        } catch (error) {
            console.error('Wiki error:', error);
            return {
                title: title,
                extract: `${title} adalah komoditas penting di Indonesia.`,
                thumbnail: null
            };
        }
    },

    // ========== ITUNES API ==========
    async searchMusic(query, limit = 20) {
        try {
            const params = new URLSearchParams({
                term: query,
                media: 'music',
                entity: 'song',
                limit: limit,
                country: 'ID'
            });

            const url = `${this.config.itunesBaseUrl}/search?${params}`;
            const response = await fetch(url);
            const data = await response.json();

            return data.results.map(track => ({
                id: track.trackId,
                name: track.trackName,
                artist: track.artistName,
                album: track.collectionName,
                artwork: track.artworkUrl100?.replace('100x100', '300x300'),
                previewUrl: track.previewUrl,
                duration: track.trackTimeMillis
            }));
        } catch (error) {
            console.error('iTunes error:', error);
            return [];
        }
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
                    try {
                        const address = await this.reverseGeocode(latitude, longitude);
                        resolve({ lat: latitude, lng: longitude, address });
                    } catch (e) {
                        resolve({ lat: latitude, lng: longitude, address: 'Lokasi Anda' });
                    }
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    },

    async reverseGeocode(lat, lng) {
        try {
            const params = new URLSearchParams({
                lat, lon: lng, format: 'json', 'accept-language': 'id'
            });
            const url = `${this.config.nominatimUrl}/reverse?${params}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'TanikuMonitor/1.0' }
            });
            const data = await response.json();
            const addr = data.address;
            const parts = [];
            if (addr.village || addr.suburb) parts.push(addr.village || addr.suburb);
            if (addr.city || addr.town) parts.push(addr.city || addr.town);
            if (addr.state) parts.push(addr.state);
            return parts.join(', ') || data.display_name;
        } catch (error) {
            return 'Lokasi tidak diketahui';
        }
    },

    async searchLocation(query) {
        try {
            const params = new URLSearchParams({
                q: query + ', Indonesia',
                format: 'json',
                limit: 10,
                'accept-language': 'id',
                countrycodes: 'id'
            });
            const url = `${this.config.nominatimUrl}/search?${params}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'TanikuMonitor/1.0' }
            });
            const data = await response.json();
            return data.map(item => ({
                name: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon)
            }));
        } catch (error) {
            return [];
        }
    },

    // ========== PRICE DATA ==========
    generateMockPriceData(commodityId, timeRange = '1m') {
        const basePrice = (typeof CommodityData !== 'undefined' && CommodityData.getBasePrice)
            ? CommodityData.getBasePrice(commodityId)
            : 15000;
        const points = this.getDataPoints(timeRange);
        const volatility = 0.05;

        const data = [];
        let currentPrice = basePrice;
        const now = new Date();

        for (let i = points; i >= 0; i--) {
            const date = this.getDateForPoint(now, timeRange, i);
            const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
            currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + change));
            data.push({
                date: date,
                price: Math.round(currentPrice),
                volume: Math.floor(Math.random() * 1000) + 100
            });
        }
        return data;
    },

    getDataPoints(timeRange) {
        const ranges = {
            '10y': 120, '5y': 60, '3y': 36, '2y': 24, '1y': 12,
            '12m': 12, '6m': 6, '3m': 3, '1m': 30,
            '30d': 30, '15d': 15, '7d': 7, '1d': 24,
            '24h': 24, '6h': 6, '1h': 6
        };
        return ranges[timeRange] || 30;
    },

    getDateForPoint(now, timeRange, index) {
        const date = new Date(now);
        if (timeRange.endsWith('y')) {
            date.setMonth(date.getMonth() - index);
        } else if (timeRange.endsWith('m') && timeRange !== '1m') {
            date.setMonth(date.getMonth() - index);
        } else if (timeRange === '1m' || timeRange.endsWith('d')) {
            date.setDate(date.getDate() - index);
        } else if (timeRange.endsWith('h')) {
            date.setHours(date.getHours() - index);
        }
        return date;
    },

    // ========== NEW API 1: WORLD BANK INDONESIA ==========
    async fetchWorldBankData(indicator = 'NY.GDP.MKTP.CD', years = 10) {
        try {
            // World Bank API - No auth required
            // Indicators: NY.GDP.MKTP.CD (GDP), FP.CPI.TOTL (CPI), AG.PRD.FOOD.XD (Food Production)
            const url = `https://api.worldbank.org/v2/country/IDN/indicator/${indicator}?format=json&per_page=${years}&date=2015:2024`;
            const response = await fetch(url);
            const data = await response.json();

            if (data[1]) {
                return data[1].map(item => ({
                    year: item.date,
                    value: item.value,
                    indicator: item.indicator.value
                })).filter(d => d.value !== null);
            }
            return [];
        } catch (error) {
            console.error('World Bank API error:', error);
            return [];
        }
    },

    // World Bank indicators for Indonesia
    worldBankIndicators: {
        gdp: 'NY.GDP.MKTP.CD',
        inflation: 'FP.CPI.TOTL',
        foodProduction: 'AG.PRD.FOOD.XD',
        agriculture: 'NV.AGR.TOTL.ZS',
        population: 'SP.POP.TOTL',
        ruralPop: 'SP.RUR.TOTL.ZS'
    },

    // ========== NEW API 2: CURRENCY EXCHANGE (Free) ==========
    async fetchExchangeRate(base = 'USD') {
        try {
            // Free exchange rate API - no key required
            const url = `https://api.exchangerate-api.com/v4/latest/${base}`;
            const response = await fetch(url);
            const data = await response.json();

            return {
                base: data.base,
                date: data.date,
                idr: data.rates.IDR,
                rates: {
                    IDR: data.rates.IDR,
                    USD: data.rates.USD,
                    EUR: data.rates.EUR,
                    SGD: data.rates.SGD,
                    MYR: data.rates.MYR,
                    JPY: data.rates.JPY
                }
            };
        } catch (error) {
            console.error('Exchange rate error:', error);
            return { base: 'USD', idr: 15500, rates: {} };
        }
    },

    // ========== NEW API 3: OPEN-METEO WEATHER (Free, No Key) ==========
    async fetchWeather(lat = -6.2088, lng = 106.8456) {
        try {
            // Open-Meteo free weather API - perfect for agriculture!
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Jakarta&forecast_days=7`;
            const response = await fetch(url);
            const data = await response.json();

            return {
                current: {
                    temp: data.current.temperature_2m,
                    humidity: data.current.relative_humidity_2m,
                    precipitation: data.current.precipitation,
                    weatherCode: data.current.weather_code
                },
                daily: data.daily.time.map((date, i) => ({
                    date,
                    tempMax: data.daily.temperature_2m_max[i],
                    tempMin: data.daily.temperature_2m_min[i],
                    precipitation: data.daily.precipitation_sum[i]
                }))
            };
        } catch (error) {
            console.error('Weather API error:', error);
            return null;
        }
    },

    getWeatherIcon(code) {
        const icons = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️',
            51: '🌧️', 53: '🌧️', 55: '🌧️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            80: '🌦️', 81: '🌦️', 82: '🌦️',
            95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        return icons[code] || '🌤️';
    },

    // ========== NEW API 4: REST COUNTRIES (Free) ==========
    async fetchCountryInfo(code = 'IDN') {
        try {
            const url = `https://restcountries.com/v3.1/alpha/${code}?fields=name,capital,population,area,currencies,languages,flags`;
            const response = await fetch(url);
            const data = await response.json();

            return {
                name: data.name.common,
                capital: data.capital?.[0],
                population: data.population,
                area: data.area,
                currency: Object.values(data.currencies)[0],
                languages: Object.values(data.languages),
                flag: data.flags.svg
            };
        } catch (error) {
            console.error('REST Countries error:', error);
            return null;
        }
    },

    // ========== NEW API 5: OPEN DATA SOFT - GLOBAL FOOD PRICES ==========
    async fetchGlobalFoodPrices(commodity = 'Rice') {
        try {
            // Public dataset - no key required
            const url = `https://data.opendatasoft.com/api/records/1.0/search/?dataset=global-food-prices&q=${encodeURIComponent(commodity)}&rows=50&facet=country&facet=commodity&refine.country=Indonesia`;
            const response = await fetch(url);
            const data = await response.json();

            return data.records.map(r => ({
                commodity: r.fields.commodity,
                market: r.fields.market,
                price: r.fields.price,
                unit: r.fields.unit,
                currency: r.fields.currency,
                date: r.fields.date
            }));
        } catch (error) {
            console.error('Food Prices API error:', error);
            return [];
        }
    },

    // ========== COMBINED DATA: IHG (Indeks Harga Gabungan) ==========
    calculateIHG(commodityPrices, weights = null) {
        if (!commodityPrices || commodityPrices.length === 0) return 100;

        // Default weights for major commodities
        const defaultWeights = {
            beras: 0.25,
            cabai_merah: 0.10,
            bawang_merah: 0.08,
            daging_ayam: 0.12,
            telur_ayam: 0.10,
            minyak_goreng: 0.08,
            gula: 0.07,
            jagung: 0.05,
            kedelai: 0.05,
            others: 0.10
        };

        let totalIndex = 0;
        let totalWeight = 0;

        commodityPrices.forEach(item => {
            const weight = weights?.[item.id] || defaultWeights[item.id] || defaultWeights.others;
            const priceRatio = item.currentPrice / item.basePrice;
            totalIndex += priceRatio * weight * 100;
            totalWeight += weight;
        });

        return totalWeight > 0 ? (totalIndex / totalWeight).toFixed(2) : 100;
    },

    // ========== UTILITIES ==========
    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    formatDate(date, format = 'short') {
        const options = format === 'short'
            ? { day: 'numeric', month: 'short' }
            : { day: 'numeric', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    },

    formatTime(date) {
        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' M';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Jt';
        if (num >= 1000) return (num / 1000).toFixed(1) + ' Rb';
        return num.toString();
    }
};

window.APIService = APIService;
console.log('📡 API Service loaded with 5+ external APIs');

