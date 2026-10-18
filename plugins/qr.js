export default {
    meta: {
        id: 'qr-generate',
        name: 'QR Generator',
        path: '/api/qr',
        method: 'GET',
        category: 'Utility',
        desc: 'Generate QR Code dari teks atau link.',
        params: [{ key: 'text', label: 'Teks/URL', placeholder: 'https://google.com' }]
    },
    handler: (req, res) => {
        const { text } = req.query;
        if (!text) return res.status(400).json({ success: false, error: 'Parameter "text" wajib diisi!' });
        
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
        res.json({ success: true, data: { text, image: qrUrl } });
    }
};