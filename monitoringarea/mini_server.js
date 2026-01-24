/**
 * Taniku Monitor - Mini Server
 * Export commodity data to Excel with 7-day price history
 * Filter by: tanaman, pupuk, hama, or all
 * 
 * Run: node mini_server.js
 * Access: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// ========== COMMODITY DATABASE ==========
const commodityData = {
    tanaman: [
        { id: 'beras', name: 'Beras', unit: 'kg', basePrice: 15000, icon: '🌾', category: 'pangan' },
        { id: 'jagung', name: 'Jagung', unit: 'kg', basePrice: 6500, icon: '🌽', category: 'pangan' },
        { id: 'kedelai', name: 'Kedelai', unit: 'kg', basePrice: 12000, icon: '🫘', category: 'pangan' },
        { id: 'cabai_merah', name: 'Cabai Merah', unit: 'kg', basePrice: 45000, icon: '🌶️', category: 'sayuran' },
        { id: 'cabai_rawit', name: 'Cabai Rawit', unit: 'kg', basePrice: 55000, icon: '🌶️', category: 'sayuran' },
        { id: 'bawang_merah', name: 'Bawang Merah', unit: 'kg', basePrice: 35000, icon: '🧅', category: 'sayuran' },
        { id: 'bawang_putih', name: 'Bawang Putih', unit: 'kg', basePrice: 32000, icon: '🧄', category: 'sayuran' },
        { id: 'kentang', name: 'Kentang', unit: 'kg', basePrice: 12000, icon: '🥔', category: 'sayuran' },
        { id: 'tomat', name: 'Tomat', unit: 'kg', basePrice: 8500, icon: '🍅', category: 'sayuran' },
        { id: 'wortel', name: 'Wortel', unit: 'kg', basePrice: 11000, icon: '🥕', category: 'sayuran' },
        { id: 'kangkung', name: 'Kangkung', unit: 'ikat', basePrice: 3500, icon: '🥬', category: 'sayuran' },
        { id: 'bayam', name: 'Bayam', unit: 'ikat', basePrice: 4000, icon: '🥬', category: 'sayuran' },
        { id: 'sawi', name: 'Sawi', unit: 'kg', basePrice: 7000, icon: '🥬', category: 'sayuran' },
        { id: 'kol', name: 'Kol/Kubis', unit: 'kg', basePrice: 6000, icon: '🥬', category: 'sayuran' },
        { id: 'pisang', name: 'Pisang', unit: 'sisir', basePrice: 18000, icon: '🍌', category: 'buah' },
        { id: 'jeruk', name: 'Jeruk', unit: 'kg', basePrice: 22000, icon: '🍊', category: 'buah' },
        { id: 'mangga', name: 'Mangga', unit: 'kg', basePrice: 20000, icon: '🥭', category: 'buah' },
        { id: 'apel', name: 'Apel', unit: 'kg', basePrice: 28000, icon: '🍎', category: 'buah' },
        { id: 'semangka', name: 'Semangka', unit: 'kg', basePrice: 7500, icon: '🍉', category: 'buah' },
        { id: 'melon', name: 'Melon', unit: 'kg', basePrice: 15000, icon: '🍈', category: 'buah' },
        { id: 'kopi_arabika', name: 'Kopi Arabika', unit: 'kg', basePrice: 85000, icon: '☕', category: 'perkebunan' },
        { id: 'kopi_robusta', name: 'Kopi Robusta', unit: 'kg', basePrice: 55000, icon: '☕', category: 'perkebunan' },
        { id: 'kakao', name: 'Kakao', unit: 'kg', basePrice: 35000, icon: '🍫', category: 'perkebunan' },
        { id: 'kelapa_sawit', name: 'Kelapa Sawit', unit: 'kg', basePrice: 2500, icon: '🌴', category: 'perkebunan' },
        { id: 'teh', name: 'Teh', unit: 'kg', basePrice: 25000, icon: '🍵', category: 'perkebunan' },
        { id: 'tebu', name: 'Tebu', unit: 'kg', basePrice: 800, icon: '🎋', category: 'perkebunan' },
        { id: 'gula_pasir', name: 'Gula Pasir', unit: 'kg', basePrice: 16500, icon: '🍬', category: 'olahan' },
        { id: 'minyak_goreng', name: 'Minyak Goreng', unit: 'liter', basePrice: 18000, icon: '🛢️', category: 'olahan' },
        { id: 'kacang_tanah', name: 'Kacang Tanah', unit: 'kg', basePrice: 25000, icon: '🥜', category: 'kacang' },
        { id: 'kacang_hijau', name: 'Kacang Hijau', unit: 'kg', basePrice: 22000, icon: '🫛', category: 'kacang' }
    ],

    pupuk: [
        { id: 'urea', name: 'Urea (46% N)', unit: 'kg', basePrice: 2850, icon: '💧', type: 'anorganik' },
        { id: 'za', name: 'ZA (21% N)', unit: 'kg', basePrice: 2100, icon: '⚗️', type: 'anorganik' },
        { id: 'tsp', name: 'TSP (46% P2O5)', unit: 'kg', basePrice: 3200, icon: '🔬', type: 'anorganik' },
        { id: 'sp36', name: 'SP-36', unit: 'kg', basePrice: 2800, icon: '🔬', type: 'anorganik' },
        { id: 'kcl', name: 'KCl (60% K2O)', unit: 'kg', basePrice: 7500, icon: '⚗️', type: 'anorganik' },
        { id: 'npk_phonska', name: 'NPK Phonska', unit: 'kg', basePrice: 2750, icon: '💎', type: 'majemuk' },
        { id: 'npk_mutiara', name: 'NPK Mutiara 16-16-16', unit: 'kg', basePrice: 7500, icon: '💎', type: 'majemuk' },
        { id: 'npk_grower', name: 'NPK Grower', unit: 'kg', basePrice: 8500, icon: '💎', type: 'majemuk' },
        { id: 'kompos', name: 'Kompos', unit: 'kg', basePrice: 1500, icon: '🌱', type: 'organik' },
        { id: 'kandang_sapi', name: 'Pupuk Kandang Sapi', unit: 'kg', basePrice: 800, icon: '🐄', type: 'organik' },
        { id: 'kandang_ayam', name: 'Pupuk Kandang Ayam', unit: 'kg', basePrice: 1200, icon: '🐔', type: 'organik' },
        { id: 'bokashi', name: 'Bokashi', unit: 'kg', basePrice: 3000, icon: '🌱', type: 'organik' },
        { id: 'guano', name: 'Guano', unit: 'kg', basePrice: 5000, icon: '🦇', type: 'organik' },
        { id: 'gandasil_d', name: 'Gandasil D', unit: 'kg', basePrice: 25000, icon: '🍃', type: 'daun' },
        { id: 'gandasil_b', name: 'Gandasil B', unit: 'kg', basePrice: 28000, icon: '🌸', type: 'daun' },
        { id: 'growmore', name: 'Growmore', unit: 'kg', basePrice: 55000, icon: '🍃', type: 'daun' },
        { id: 'mikoriza', name: 'Mikoriza', unit: 'kg', basePrice: 45000, icon: '🍄', type: 'hayati' },
        { id: 'trichoderma', name: 'Trichoderma', unit: 'kg', basePrice: 35000, icon: '🍄', type: 'hayati' },
        { id: 'em4', name: 'EM4 Pertanian', unit: 'liter', basePrice: 25000, icon: '🦠', type: 'hayati' }
    ],

    hama: [
        { id: 'imidacloprid', name: 'Imidacloprid', unit: 'liter', basePrice: 95000, icon: '💊', target: 'wereng' },
        { id: 'fipronil', name: 'Fipronil', unit: 'liter', basePrice: 120000, icon: '💊', target: 'penggerek' },
        { id: 'abamectin', name: 'Abamectin', unit: 'liter', basePrice: 85000, icon: '💊', target: 'tungau' },
        { id: 'spinosad', name: 'Spinosad', unit: 'liter', basePrice: 145000, icon: '💊', target: 'ulat' },
        { id: 'deltamethrin', name: 'Deltamethrin', unit: 'liter', basePrice: 75000, icon: '💊', target: 'walang' },
        { id: 'karbofuran', name: 'Karbofuran', unit: 'kg', basePrice: 55000, icon: '💊', target: 'orong' },
        { id: 'sipermetrin', name: 'Sipermetrin', unit: 'liter', basePrice: 75000, icon: '💊', target: 'kepik' },
        { id: 'mankozeb', name: 'Mankozeb', unit: 'kg', basePrice: 78000, icon: '🍄', target: 'jamur' },
        { id: 'propineb', name: 'Propineb', unit: 'kg', basePrice: 82000, icon: '🍄', target: 'jamur' },
        { id: 'trisiklazol', name: 'Trisiklazol', unit: 'kg', basePrice: 115000, icon: '🍄', target: 'blast' },
        { id: 'streptomisin', name: 'Streptomisin', unit: 'kg', basePrice: 125000, icon: '🦠', target: 'bakteri' },
        { id: 'rodentisida', name: 'Rodentisida', unit: 'kg', basePrice: 45000, icon: '🐀', target: 'tikus' },
        { id: 'moluskisida', name: 'Moluskisida', unit: 'kg', basePrice: 55000, icon: '🐌', target: 'keong' },
        { id: 'herbisida_paraquat', name: 'Paraquat', unit: 'liter', basePrice: 65000, icon: '🌿', target: 'gulma' },
        { id: 'herbisida_glifosat', name: 'Glifosat', unit: 'liter', basePrice: 55000, icon: '🌿', target: 'gulma' },
        { id: 'beauveria', name: 'Beauveria bassiana', unit: 'kg', basePrice: 95000, icon: '🍄', target: 'hama' },
        { id: 'metarhizium', name: 'Metarhizium', unit: 'kg', basePrice: 75000, icon: '🍄', target: 'hama' }
    ]
};

// ========== GENERATE 7-DAY PRICE HISTORY ==========
function generate7DayHistory(basePrice) {
    const history = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random price variation ±5%
        const variation = 1 + (Math.random() - 0.5) * 0.1;
        const price = Math.round(basePrice * variation);

        history.push({
            date: date.toISOString().split('T')[0],
            day: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()],
            price: price,
            change: i === 6 ? 0 : Math.round((price - history[history.length - 1].price) / history[history.length - 1].price * 100 * 10) / 10
        });
    }

    return history;
}

// ========== GENERATE EXCEL CSV ==========
function generateExcelCSV(data, type) {
    let csv = '';

    // Header based on type
    if (type === 'tanaman') {
        csv = 'ID,Nama,Kategori,Unit,Harga Dasar,Icon,Hari 1,Harga 1,Hari 2,Harga 2,Hari 3,Harga 3,Hari 4,Harga 4,Hari 5,Harga 5,Hari 6,Harga 6,Hari 7,Harga 7\n';
    } else if (type === 'pupuk') {
        csv = 'ID,Nama,Jenis,Unit,Harga Dasar,Icon,Hari 1,Harga 1,Hari 2,Harga 2,Hari 3,Harga 3,Hari 4,Harga 4,Hari 5,Harga 5,Hari 6,Harga 6,Hari 7,Harga 7\n';
    } else if (type === 'hama') {
        csv = 'ID,Nama,Target Hama,Unit,Harga Dasar,Icon,Hari 1,Harga 1,Hari 2,Harga 2,Hari 3,Harga 3,Hari 4,Harga 4,Hari 5,Harga 5,Hari 6,Harga 6,Hari 7,Harga 7\n';
    }

    data.forEach(item => {
        const history = generate7DayHistory(item.basePrice);
        let row = `${item.id},"${item.name}",`;

        if (type === 'tanaman') {
            row += `${item.category},`;
        } else if (type === 'pupuk') {
            row += `${item.type},`;
        } else if (type === 'hama') {
            row += `${item.target},`;
        }

        row += `${item.unit},${item.basePrice},${item.icon}`;

        history.forEach(h => {
            row += `,${h.day},${h.price}`;
        });

        csv += row + '\n';
    });

    return csv;
}

// ========== HTML UI ==========
function getIndexHTML() {
    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌾 Taniku Export Server</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            color: white;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 30px;
            background: linear-gradient(90deg, #22c55e, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }
        .card h2 {
            margin-bottom: 20px;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }
        .option {
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .option:hover, .option.active {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
        }
        .option .icon {
            font-size: 2rem;
            margin-bottom: 8px;
        }
        .option .label {
            font-weight: 600;
        }
        .option .count {
            font-size: 0.8rem;
            color: rgba(255,255,255,0.6);
        }
        .btn {
            display: block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            text-align: center;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
        }
        .btn-secondary {
            background: linear-gradient(90deg, #3b82f6, #2563eb);
        }
        .info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 0.9rem;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 20px;
        }
        .stat {
            text-align: center;
            padding: 12px;
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #22c55e;
        }
        .stat-label {
            font-size: 0.8rem;
            color: rgba(255,255,255,0.6);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌾 Taniku Export Server</h1>
        
        <div class="card">
            <h2>📊 Export Data ke Excel</h2>
            <p style="margin-bottom: 20px; color: rgba(255,255,255,0.7);">
                Pilih jenis data untuk di-export dengan riwayat harga 7 hari terakhir:
            </p>
            
            <div class="options">
                <div class="option" onclick="selectType('tanaman')">
                    <div class="icon">🌾</div>
                    <div class="label">Tanaman</div>
                    <div class="count">${commodityData.tanaman.length} item</div>
                </div>
                <div class="option" onclick="selectType('pupuk')">
                    <div class="icon">🧪</div>
                    <div class="label">Pupuk</div>
                    <div class="count">${commodityData.pupuk.length} item</div>
                </div>
                <div class="option" onclick="selectType('hama')">
                    <div class="icon">🐛</div>
                    <div class="label">Pestisida/Racun</div>
                    <div class="count">${commodityData.hama.length} item</div>
                </div>
                <div class="option" onclick="selectType('all')">
                    <div class="icon">📦</div>
                    <div class="label">Semua Data</div>
                    <div class="count">${commodityData.tanaman.length + commodityData.pupuk.length + commodityData.hama.length} item</div>
                </div>
            </div>
            
            <a id="exportBtn" class="btn" href="/export/all">
                📥 Download Excel (CSV)
            </a>
        </div>
        
        <div class="card">
            <h2>🔍 Export Spesifik</h2>
            <p style="margin-bottom: 15px; color: rgba(255,255,255,0.7);">
                Masukkan ID komoditas untuk export 1 item saja:
            </p>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="specificId" placeholder="Contoh: beras, urea, imidacloprid" 
                    style="flex: 1; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white;">
                <button class="btn btn-secondary" onclick="exportSpecific()" style="width: auto; padding: 12px 24px;">
                    Export
                </button>
            </div>
        </div>
        
        <div class="card">
            <h2>📈 Statistik Database</h2>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${commodityData.tanaman.length}</div>
                    <div class="stat-label">Tanaman</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${commodityData.pupuk.length}</div>
                    <div class="stat-label">Pupuk</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${commodityData.hama.length}</div>
                    <div class="stat-label">Pestisida</div>
                </div>
            </div>
            <div class="info">
                ℹ️ Data harga dihasilkan dengan simulasi variasi ±5% dari harga dasar.
                File export dalam format CSV yang bisa dibuka di Excel.
            </div>
        </div>
        
        <div class="card">
            <h2>🔗 API Endpoints</h2>
            <ul style="list-style: none; color: rgba(255,255,255,0.8);">
                <li style="margin-bottom: 8px;">📊 <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">/export/tanaman</code> - Export semua tanaman</li>
                <li style="margin-bottom: 8px;">🧪 <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">/export/pupuk</code> - Export semua pupuk</li>
                <li style="margin-bottom: 8px;">🐛 <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">/export/hama</code> - Export semua pestisida</li>
                <li style="margin-bottom: 8px;">📦 <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">/export/all</code> - Export semua data</li>
                <li style="margin-bottom: 8px;">🔍 <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">/export/item/:id</code> - Export 1 item spesifik</li>
                <li style="margin-bottom: 8px;">📄 <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">/api/data/:type</code> - Get JSON data</li>
            </ul>
        </div>
    </div>
    
    <script>
        let selectedType = 'all';
        
        function selectType(type) {
            selectedType = type;
            document.querySelectorAll('.option').forEach(o => o.classList.remove('active'));
            event.currentTarget.classList.add('active');
            document.getElementById('exportBtn').href = '/export/' + type;
            document.getElementById('exportBtn').textContent = '📥 Download ' + 
                (type === 'all' ? 'Semua Data' : type.charAt(0).toUpperCase() + type.slice(1)) + ' (CSV)';
        }
        
        function exportSpecific() {
            const id = document.getElementById('specificId').value.trim();
            if (id) {
                window.location.href = '/export/item/' + id;
            } else {
                alert('Masukkan ID komoditas terlebih dahulu');
            }
        }
    </script>
</body>
</html>`;
}

// ========== HTTP SERVER ==========
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`📨 ${req.method} ${pathname}`);

    // Serve static files
    if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getIndexHTML());
        return;
    }

    // API: Get JSON data
    if (pathname.startsWith('/api/data/')) {
        const type = pathname.replace('/api/data/', '');
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });

        if (type === 'all') {
            res.end(JSON.stringify(commodityData));
        } else if (commodityData[type]) {
            res.end(JSON.stringify(commodityData[type]));
        } else {
            res.end(JSON.stringify({ error: 'Type not found', available: ['tanaman', 'pupuk', 'hama', 'all'] }));
        }
        return;
    }

    // Export: CSV download
    if (pathname.startsWith('/export/')) {
        const type = pathname.replace('/export/', '');
        const timestamp = new Date().toISOString().split('T')[0];

        // Export specific item
        if (type.startsWith('item/')) {
            const itemId = type.replace('item/', '');
            let item = null;
            let itemType = '';

            // Search in all categories
            for (const [t, items] of Object.entries(commodityData)) {
                const found = items.find(i => i.id === itemId);
                if (found) {
                    item = found;
                    itemType = t;
                    break;
                }
            }

            if (item) {
                const csv = generateExcelCSV([item], itemType);
                res.writeHead(200, {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="taniku_${itemId}_${timestamp}.csv"`,
                    'Access-Control-Allow-Origin': '*'
                });
                res.end('\uFEFF' + csv); // UTF-8 BOM for Excel
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Item not found', id: itemId }));
            }
            return;
        }

        // Export by type
        let csv = '';
        let filename = '';

        if (type === 'all') {
            csv = '=== DATA TANAMAN ===\n';
            csv += generateExcelCSV(commodityData.tanaman, 'tanaman');
            csv += '\n=== DATA PUPUK ===\n';
            csv += generateExcelCSV(commodityData.pupuk, 'pupuk');
            csv += '\n=== DATA PESTISIDA ===\n';
            csv += generateExcelCSV(commodityData.hama, 'hama');
            filename = `taniku_all_${timestamp}.csv`;
        } else if (commodityData[type]) {
            csv = generateExcelCSV(commodityData[type], type);
            filename = `taniku_${type}_${timestamp}.csv`;
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Type not found', available: ['tanaman', 'pupuk', 'hama', 'all'] }));
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Access-Control-Allow-Origin': '*'
        });
        res.end('\uFEFF' + csv); // UTF-8 BOM for Excel
        return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        error: 'Not found',
        endpoints: ['/export/tanaman', '/export/pupuk', '/export/hama', '/export/all', '/export/item/:id', '/api/data/:type']
    }));
});

// ========== START SERVER ==========
server.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║     🌾 TANIKU EXPORT SERVER                     ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  🌐 Server running at http://localhost:${PORT}     ║`);
    console.log('║                                                ║');
    console.log('║  📊 Endpoints:                                 ║');
    console.log('║     /export/tanaman  - Export tanaman          ║');
    console.log('║     /export/pupuk    - Export pupuk            ║');
    console.log('║     /export/hama     - Export pestisida        ║');
    console.log('║     /export/all      - Export semua            ║');
    console.log('║     /export/item/:id - Export 1 item           ║');
    console.log('║                                                ║');
    console.log('║  📦 Database:                                  ║');
    console.log(`║     🌾 ${commodityData.tanaman.length} tanaman                             ║`);
    console.log(`║     🧪 ${commodityData.pupuk.length} pupuk                                ║`);
    console.log(`║     🐛 ${commodityData.hama.length} pestisida                            ║`);
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
});
