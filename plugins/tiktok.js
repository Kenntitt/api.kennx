import axios from 'axios';

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export default {
    meta: {
        id: 'tiktok-dl', name: 'TikTok Downloader', path: '/api/download/tiktok',
        method: 'POST', category: 'Downloader', desc: 'Ambil video/foto TikTok tanpa watermark (Auto-Fallback System).',
        params: [{ key: 'url', label: 'URL TikTok', placeholder: 'https://vt.tiktok.com/...' }]
    },
    handler: async (req, res) => {
        const { url } = req.body;
        if (!url) return res.status(400).json({ creator: "API KENNX", success: false, error: 'JSON body "url" wajib diisi!' });

        const started = Date.now();

        try {
            const { data } = await axios.get(`https://tikxedd.vercel.app/api/resolve`, { params: { url: url }, headers: { 'User-Agent': UA }, timeout: 10000 });
            if (data && data.download && data.download.noWatermark) {
                return res.json({ creator: "API KENNX", success: true, data: { input: url, type: "video", title: data.description || 'Tanpa Judul', author: data.author || 'Unknown', video: data.download.noWatermark, audio: null, thumbnail: null, time_ms: Date.now() - started, source: "TikXedd" } });
            }
            throw new Error("Struktur respons tidak valid");
        } catch (error) {
            try {
                const { data } = await axios.get(`https://www.tikwm.com/api/`, { params: { url: url }, headers: { 'User-Agent': UA }, timeout: 10000 });
                if (data.code !== 0) throw new Error(data.msg || 'Gagal mengambil data');

                const result = data.data;
                const baseUrl = 'https://www.tikwm.com';
                const formatUrl = (path) => path ? (path.startsWith('http') ? path : `${baseUrl}${path}`) : null;

                let responseData = {
                    input: url, title: result.title || 'Tanpa Judul', author: result.author?.unique_id || result.author?.nickname || 'Unknown',
                    thumbnail: formatUrl(result.cover), audio: formatUrl(result.music), time_ms: Date.now() - started, source: "TikWM (Fallback)"
                };

                if (result.images && result.images.length > 0) {
                    responseData.type = "photo"; responseData.images = result.images.map(img => formatUrl(img)); responseData.video = null;
                } else {
                    responseData.type = "video"; responseData.video = formatUrl(result.play); responseData.images = null;
                }

                return res.json({ creator: "API KENNX", success: true, data: responseData });
            } catch (fallbackError) {
                return res.status(500).json({ creator: "API KENNX", success: false, error: `Semua server downloader sedang sibuk. Error: ${fallbackError.message}`, time_ms: Date.now() - started });
            }
        }
    }
};