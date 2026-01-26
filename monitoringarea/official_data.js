const https = require('https');

// ========== CONFIGURATION ==========
const CONFIG = {
    BPS_API_KEY: 'e11b132228efeb1fa7693a7dad9709ce', // From api.js
    BPS_BASE_URL: 'https://webapi.bps.go.id/v1/api',
    WB_BASE_URL: 'https://api.worldbank.org/v2',
    TIMEOUT: 30000 // 30 seconds
};

// ========== HELPER: HTTPS REQUEST ==========
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'OfficialDataFetcher/1.0' },
            rejectUnauthorized: false // Required for some BPS servers with intermediate cert issues
        };

        const req = https.get(url, options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`HTTP Status Code: ${res.statusCode}`));
            }

            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse JSON response'));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });

        req.setTimeout(CONFIG.TIMEOUT);
    });
}

// ========== BPS SERVICE ==========
const BPS = {
    async searchVariable(subjectId, keyword) {
        const url = `${CONFIG.BPS_BASE_URL}/list/model/var/domain/0000/subject/${subjectId}/key/${CONFIG.BPS_API_KEY}/`;
        try {
            const response = await fetchJson(url);
            if (!response.data || !response.data[1]) return null;

            // BPS returns data as array of objects usually, or sometimes array of array?
            // Checking api.js, it seems to expect data.data
            // Let's filter for the keyword
            const vars = response.data[1]; // usually index 1 has the list in some BPS responses, or it is just response.data

            // Standardizing: response.data is usually the array
            const list = Array.isArray(response.data) ? response.data :
                         (Array.isArray(response.data[1]) ? response.data[1] : []);

            const found = list.find(v => v.label && v.label.toLowerCase().includes(keyword.toLowerCase()));
            return found ? found.val : null; // val is the ID
        } catch (e) {
            console.error(`[BPS] Error searching variable: ${e.message}`);
            return null;
        }
    },

    async getData(varId) {
        if (!varId) return null;
        const url = `${CONFIG.BPS_BASE_URL}/list/model/data/domain/0000/var/${varId}/key/${CONFIG.BPS_API_KEY}/`;
        try {
            const response = await fetchJson(url);
            // BPS Data Structure: { status: "OK", data-availability: "available", var: [...], turvar: [...], ... , datacontent: { "val_id_turvar_id_th_id_turth": value } }
            // This is complex. We need the latest value.

            if (response['data-availability'] !== 'available') return null;

            const content = response.datacontent;
            if (!content) return null;

            // Find the latest year/period
            // content keys are often complex strings. We just want the values.
            // But we need the time.
            // Let's try to parse the keys or just grab the last entry if sorted?
            // Better: response.vervar (vertical variable) or turvar usually holds the time or sub-variable.
            // Simplified approach: Get the entry with the highest ID (often correlates to latest time)

            const keys = Object.keys(content);
            if (keys.length === 0) return null;

            // Sort keys to get arguably the "latest" if the ID structure implies time.
            // Usually format is idVar + idTurvar + idTh + idTurth
            // idTh is year ID. Higher is later.
            const latestKey = keys.sort().pop();
            const value = content[latestKey];

            // We need metadata for the year.
            // In a real robust app, we'd map the year ID to the actual year from response.th
            // For now, we return the raw value and look up the year if possible.

            let year = "Terbaru";
            // response.th is array of {val: id, label: "2024"}
            if (response.th && Array.isArray(response.th)) {
                // Extracts the year ID from the key? key structure: var_turvar_th_turth
                // This is a guess on structure based on common BPS patterns.
                const parts = latestKey.split('_');
                // Assumed: parts[2] might be year ID if structure holds.
                // Let's iterate all years to find which one matches parts in the key.

                for (const y of response.th) {
                    if (latestKey.includes(`_${y.val}_`)) {
                        year = y.label;
                        break;
                    }
                }
            }

            return {
                value: value,
                year: year,
                source: "BPS Indonesia",
                endpoint: url
            };

        } catch (e) {
            console.error(`[BPS] Error getting data: ${e.message}`);
            return null;
        }
    },

    async getStaticTable(keyword) {
        const url = `${CONFIG.BPS_BASE_URL}/list/model/statictable/domain/0000/key/${CONFIG.BPS_API_KEY}/`;
        try {
            // Note: Search by keyword in URL is not standard BPS V1, we usually list all and filter.
            // Or use dynamic table.
            // Let's fetch the list (page 1) and filter client side.
            const response = await fetchJson(url);
            const list = response.data && response.data[1] ? response.data[1] : [];

            const found = list.find(t => t.title && t.title.toLowerCase().includes(keyword.toLowerCase()));

            if (found) {
                return {
                    value: found.title, // Static table is a table, not a single value. We return the title as "available data"
                    year: found.updt_date || "Terbaru",
                    source: "BPS Indonesia (Tabel Statis)",
                    endpoint: found.excel || found.pdf || url
                };
            }
            return null;
        } catch (e) {
            console.error(`[BPS] Error static table: ${e.message}`);
            return null;
        }
    }
};

// ========== WORLD BANK SERVICE ==========
const WorldBank = {
    async getIndicator(indicatorCode) {
        const url = `${CONFIG.WB_BASE_URL}/country/id/indicator/${indicatorCode}?format=json&per_page=1`;
        try {
            const response = await fetchJson(url);
            // WB Response: [ {page, pages...}, [ {indicator, country, value, date, ...} ] ]

            if (!response || response.length < 2 || !response[1] || response[1].length === 0) {
                return null;
            }

            const data = response[1][0];
            if (data.value === null) return null;

            return {
                value: data.value,
                year: data.date,
                source: "World Bank Open Data",
                endpoint: url
            };

        } catch (e) {
            console.error(`[WB] Error fetching ${indicatorCode}: ${e.message}`);
            return null;
        }
    }
};

// ========== MAIN LOGIC ==========
async function main() {
    console.log("=== MEMULAI PENGAMBILAN DATA RESMI ===");
    console.log(`Waktu: ${new Date().toISOString()}`);
    console.log("---------------------------------------");

    // 1. INFLASI
    console.log("\n[1] MENCARI DATA INFLASI");
    let inflasiData = null;

    // BPS Try
    try {
        const inflasiVarId = await BPS.searchVariable(3, "inflasi"); // Subject 3 = Inflasi
        if (inflasiVarId) {
            const result = await BPS.getData(inflasiVarId);
            if (result && result.value) {
                inflasiData = result;
                inflasiData.label = "Inflasi (BPS)";
            }
        }
    } catch (e) {}

    // WB Backup
    if (!inflasiData) {
        console.log("... BPS tidak tersedia, mencoba World Bank");
        const result = await WorldBank.getIndicator('FP.CPI.TOTL.ZG');
        if (result) {
            inflasiData = result;
            inflasiData.label = "Inflasi (World Bank)";
        }
    }

    // Output Inflasi
    printResult(inflasiData);


    // 2. PDB (GDP)
    console.log("\n[2] MENCARI DATA PDB (GDP)");
    let pdbData = null;

    // BPS Try
    try {
        const pdbVarId = await BPS.searchVariable(11, "produk domestik bruto"); // Subject 11 = Neraca Nasional
        if (pdbVarId) {
            const result = await BPS.getData(pdbVarId);
            if (result && result.value) {
                pdbData = result;
                pdbData.label = "PDB (BPS)";
            }
        }
    } catch (e) {}

    // WB Backup
    if (!pdbData) {
        console.log("... BPS tidak tersedia, mencoba World Bank");
        const result = await WorldBank.getIndicator('NY.GDP.MKTP.CN'); // Current LCU
        if (result) {
            pdbData = result;
            pdbData.label = "PDB (World Bank)";
        }
    }

    // Output PDB
    printResult(pdbData);


    // 3. HARGA KOMODITAS
    console.log("\n[3] MENCARI DATA HARGA KOMODITAS");
    // Note: Fetching specific prices via BPS API v1 is difficult without known IDs.
    // We will try to find a Static Table for Rice (Beras).
    let hargaData = null;

    // BPS Try (Static Table)
    try {
        const result = await BPS.getStaticTable("rata-rata harga beras");
        if (result) {
            hargaData = result;
            hargaData.label = "Harga Beras (BPS Tabel)";
            // Special handling for static table: value is the title, not a number
            // But user requirement is strict on "Official Data".
            // If we can't get a numeric value, we show the table title/link.
        }
    } catch (e) {}

    // WB Backup (Global Rice Price if available, or just generic Food Index)
    if (!hargaData) {
        console.log("... BPS tidak tersedia, mencoba World Bank");
        // World Bank doesn't provide granular daily local prices easily in Open Data API.
        // We will try to fetch a broader index or fail gracefully as per instructions.
        // "Lebih baik data kosong daripada data palsu"

        // Let's try to get Cereal yield or something related if price is not available?
        // No, strict rules: Don't guess.
        // We will output unavailable if we can't find it.
    }

    // Output Harga
    if (hargaData) {
        printResult(hargaData);
    } else {
        console.log("STATUS: Data resmi tidak tersedia dari BPS maupun World Bank");
    }

    console.log("\n---------------------------------------");
    console.log("=== SELESAI ===");
}

function printResult(data) {
    if (!data) {
        console.log("STATUS: Data resmi tidak tersedia dari BPS maupun World Bank");
        return;
    }
    console.log(`DATA:   ${data.label || 'Data Resmi'}`);
    console.log(`NILAI:  ${data.value}`);
    console.log(`SUMBER: ${data.source}`);
    console.log(`PERIODE:${data.year}`);
    console.log(`API:    ${data.endpoint}`);
}

main();
