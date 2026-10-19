export default {
    meta: {
        id: 'qr-generate', name: 'QR Generator', path: '/api/qr',
        method: 'GET', category: 'Utility', desc: 'Generate QR Code. Tambahkan ?raw=true untuk direct image.',
        params: [{ key: 'text', label: 'Teks/URL', placeholder: 'https://google.com' }]
    },
    handler: (req, res) => {
        const { text, raw } = req.query;
        if (!text) return res.status(400).json({ creator: "API KENNX", success: false, error: 'Parameter "text" wajib diisi!' });
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
        if (raw === 'true') return res.redirect(qrUrl);
        res.json({ creator: "API KENNX", success: true, data: { text, image: qrUrl } });
    }
};