/* ================================================
   TANIKU MONITOR - API SERVICE LAYER
   BPS, Wikipedia, iTunes, Geolocation APIs
   ================================================ */

const APIService = {
    // ========== CONFIG ==========
    config: {
        bpsApiKey: 'e11b132228efeb1fa7693a7dad9709ce',
        bpsBaseUrl: 'https://webapi.bps.go.id/v1/api',
        wikiBaseUrl: 'https://id.wikipedia.org/api/rest_v1',
        wikiEnUrl: 'https://en.wikipedia.org/api/rest_v1',
        itunesBaseUrl: 'https://itunes.apple.com',
        nominatimUrl: 'https://nominatim.openstreetmap.org'
    },

    // ========== BPS API ==========
    // Domains: https://webapi.bps.go.id/
    // 0000 = Nasional, 3100 = Jakarta, etc.

    async fetchBPSDomains() {
        try {
            const url = `${this.config.bpsBaseUrl}/domain/type/all/key/${this.config.bpsApiKey}/`;
            const response = await fetch(url);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('BPS Domains fetch error:', error);
            return this.getMockBPSDomains();
        }
    },

    async fetchBPSVariables(domain = '0000') {
        try {
            const url = `${this.config.bpsBaseUrl}/list/model/var/domain/${domain}/key/${this.config.bpsApiKey}/`;
            const response = await fetch(url);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('BPS Variables fetch error:', error);
            return [];
        }
    },

    async fetchBPSData(params = {}) {
        const { domain = '0000', var: varId, turvar, th, turth } = params;
        try {
            let url = `${this.config.bpsBaseUrl}/list/model/data/domain/${domain}/key/${this.config.bpsApiKey}/`;
            if (varId) url += `var/${varId}/`;
            if (turvar) url += `turvar/${turvar}/`;
            if (th) url += `th/${th}/`;
            if (turth) url += `turth/${turth}/`;

            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('BPS Data fetch error:', error);
            return null;
        }
    },

    async fetchBPSPriceData(commodityId, province = '0000') {
        try {
            // BPS price data endpoint (simulated structure)
            const url = `${this.config.bpsBaseUrl}/list/model/statictable/domain/${province}/key/${this.config.bpsApiKey}/`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('BPS Price fetch error:', error);
            return this.generateMockPriceData(commodityId);
        }
    },

    getMockBPSDomains() {
        return [
            { domain_id: '0000', domain_name: 'Indonesia' },
            { domain_id: '1100', domain_name: 'Aceh' },
            { domain_id: '1200', domain_name: 'Sumatera Utara' },
            { domain_id: '1300', domain_name: 'Sumatera Barat' },
            { domain_id: '1400', domain_name: 'Riau' },
            { domain_id: '1500', domain_name: 'Jambi' },
            { domain_id: '1600', domain_name: 'Sumatera Selatan' },
            { domain_id: '1700', domain_name: 'Bengkulu' },
            { domain_id: '1800', domain_name: 'Lampung' },
            { domain_id: '1900', domain_name: 'Kep. Bangka Belitung' },
            { domain_id: '2100', domain_name: 'Kepulauan Riau' },
            { domain_id: '3100', domain_name: 'DKI Jakarta' },
            { domain_id: '3200', domain_name: 'Jawa Barat' },
            { domain_id: '3300', domain_name: 'Jawa Tengah' },
            { domain_id: '3400', domain_name: 'DI Yogyakarta' },
            { domain_id: '3500', domain_name: 'Jawa Timur' },
            { domain_id: '3600', domain_name: 'Banten' },
            { domain_id: '5100', domain_name: 'Bali' },
            { domain_id: '5200', domain_name: 'Nusa Tenggara Barat' },
            { domain_id: '5300', domain_name: 'Nusa Tenggara Timur' },
            { domain_id: '6100', domain_name: 'Kalimantan Barat' },
            { domain_id: '6200', domain_name: 'Kalimantan Tengah' },
            { domain_id: '6300', domain_name: 'Kalimantan Selatan' },
            { domain_id: '6400', domain_name: 'Kalimantan Timur' },
            { domain_id: '6500', domain_name: 'Kalimantan Utara' },
            { domain_id: '7100', domain_name: 'Sulawesi Utara' },
            { domain_id: '7200', domain_name: 'Sulawesi Tengah' },
            { domain_id: '7300', domain_name: 'Sulawesi Selatan' },
            { domain_id: '7400', domain_name: 'Sulawesi Tenggara' },
            { domain_id: '7500', domain_name: 'Gorontalo' },
            { domain_id: '7600', domain_name: 'Sulawesi Barat' },
            { domain_id: '8100', domain_name: 'Maluku' },
            { domain_id: '8200', domain_name: 'Maluku Utara' },
            { domain_id: '9100', domain_name: 'Papua Barat' },
            { domain_id: '9400', domain_name: 'Papua' }
        ];
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

            if (!response.ok) {
                throw new Error('Wiki article not found');
            }

            const data = await response.json();
            return {
                title: data.title,
                extract: data.extract,
                thumbnail: data.thumbnail?.source || null,
                url: data.content_urls?.desktop?.page || null
            };
        } catch (error) {
            console.error('Wikipedia fetch error:', error);
            return this.getDefaultWikiContent(title);
        }
    },

    async searchWiki(query, lang = 'id') {
        try {
            const baseUrl = lang === 'en'
                ? 'https://en.wikipedia.org/w/api.php'
                : 'https://id.wikipedia.org/w/api.php';

            const params = new URLSearchParams({
                action: 'query',
                list: 'search',
                srsearch: query,
                format: 'json',
                origin: '*'
            });

            const response = await fetch(`${baseUrl}?${params}`);
            const data = await response.json();
            return data.query?.search || [];
        } catch (error) {
            console.error('Wiki search error:', error);
            return [];
        }
    },

    getDefaultWikiContent(title) {
        return {
            title: title,
            extract: `${title} adalah salah satu komoditas penting di Indonesia. Informasi lebih lanjut sedang dimuat...`,
            thumbnail: null,
            url: null
        };
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
                duration: track.trackTimeMillis,
                genre: track.primaryGenreName
            }));
        } catch (error) {
            console.error('iTunes search error:', error);
            return [];
        }
    },

    // ========== GEOLOCATION API ==========
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
                        resolve({
                            lat: latitude,
                            lng: longitude,
                            address: address
                        });
                    } catch (e) {
                        resolve({
                            lat: latitude,
                            lng: longitude,
                            address: 'Lokasi Anda'
                        });
                    }
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    },

    async reverseGeocode(lat, lng) {
        try {
            const params = new URLSearchParams({
                lat: lat,
                lon: lng,
                format: 'json',
                'accept-language': 'id'
            });

            const url = `${this.config.nominatimUrl}/reverse?${params}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'TanikuMonitor/1.0'
                }
            });

            const data = await response.json();
            const addr = data.address;

            // Format Indonesian address
            const parts = [];
            if (addr.village || addr.suburb) parts.push(addr.village || addr.suburb);
            if (addr.city || addr.town || addr.county) parts.push(addr.city || addr.town || addr.county);
            if (addr.state) parts.push(addr.state);

            return parts.join(', ') || data.display_name;
        } catch (error) {
            console.error('Reverse geocode error:', error);
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
                headers: {
                    'User-Agent': 'TanikuMonitor/1.0'
                }
            });

            const data = await response.json();
            return data.map(item => ({
                name: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                type: item.type
            }));
        } catch (error) {
            console.error('Location search error:', error);
            return [];
        }
    },

    // ========== PRICE DATA GENERATION ==========
    generateMockPriceData(commodityId, timeRange = '1m') {
        const basePrice = CommodityData.getBasePrice(commodityId);
        const points = this.getDataPoints(timeRange);
        const volatility = 0.05; // 5% volatility

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
            '12m': 12, '6m': 6, '5m': 5, '4m': 4, '3m': 3, '2m': 2, '1m': 30,
            '30d': 30, '15d': 15, '7d': 7, '6d': 6, '3d': 3, '1d': 24,
            '24h': 24, '6h': 6, '1h': 6
        };
        return ranges[timeRange] || 30;
    },

    getDateForPoint(now, timeRange, index) {
        const date = new Date(now);

        if (timeRange.endsWith('y')) {
            date.setMonth(date.getMonth() - index);
        } else if (timeRange.endsWith('m') && !timeRange.endsWith('1m')) {
            date.setMonth(date.getMonth() - index);
        } else if (timeRange === '1m' || timeRange.endsWith('d')) {
            date.setDate(date.getDate() - index);
        } else if (timeRange.endsWith('h')) {
            date.setHours(date.getHours() - index);
        }

        return date;
    },

    // ========== UTILITY METHODS ==========
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
    }
};

// Export for use in other modules
window.APIService = APIService;

console.log('📡 API Service initialized');
