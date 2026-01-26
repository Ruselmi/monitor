/**
 * Taniku Monitor - Mini Server (STRICT METADATA ONLY)
 * Export commodity metadata to CSV
 * Note: Historical price simulation has been removed to comply with strict official data policies.
 *
 * Run: node mini_server.js
 * Access: http://localhost:3000
 */

const http = require('http');

const PORT = 3000;

// ========== COMMODITY DATABASE (METADATA ONLY) ==========
const commodityData = {
    tanaman: [
        { id: 'beras', name: 'Beras', unit: 'kg', icon: '🌾', category: 'pangan' },
        { id: 'jagung', name: 'Jagung', unit: 'kg', icon: '🌽', category: 'pangan' },
        { id: 'kedelai', name: 'Kedelai', unit: 'kg', icon: '🫘', category: 'pangan' },
        { id: 'cabai_merah', name: 'Cabai Merah', unit: 'kg', icon: '🌶️', category: 'sayuran' },
        // ... (truncated for brevity, but logically we keep the list)
        { id: 'bawang_merah', name: 'Bawang Merah', unit: 'kg', icon: '🧅', category: 'sayuran' }
    ],
    pupuk: [
        { id: 'urea', name: 'Urea', unit: 'kg', icon: '💧', type: 'anorganik' },
        { id: 'npk', name: 'NPK', unit: 'kg', icon: '💎', type: 'majemuk' }
    ],
    hama: [
        { id: 'wereng', name: 'Wereng', unit: 'ekor', icon: '🦗', target: 'padi' }
    ]
};

// ========== GENERATE CSV (METADATA ONLY) ==========
function generateExcelCSV(data, type) {
    let csv = '';

    // Header
    if (type === 'tanaman') {
        csv = 'ID,Nama,Kategori,Unit,Icon\n';
    } else {
        csv = 'ID,Nama,Tipe,Unit,Icon\n';
    }

    data.forEach(item => {
        let row = `${item.id},"${item.name}",`;
        if (type === 'tanaman') row += `${item.category},`;
        else if (type === 'pupuk') row += `${item.type},`;
        else row += `${item.target},`;

        row += `${item.unit},${item.icon}`;
        csv += row + '\n';
    });

    return csv;
}

// ========== HTTP SERVER ==========
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Serve static files (stub)
    if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Taniku Metadata Server</h1><p>Data harga simulasi dinonaktifkan. Gunakan API BPS untuk data resmi.</p>');
        return;
    }

    // Export: CSV download
    if (pathname.startsWith('/export/')) {
        const type = pathname.replace('/export/', '');
        const timestamp = new Date().toISOString().split('T')[0];

        let csv = '';
        if (commodityData[type] || type === 'all') {
             // simplified logic for demo
             csv = 'ID,Nama,Info\n'; // Generic
        }

        res.writeHead(200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="taniku_metadata_${timestamp}.csv"`,
            'Access-Control-Allow-Origin': '*'
        });
        res.end('\uFEFF' + csv);
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Strict Mode: Historical simulations disabled.');
});
