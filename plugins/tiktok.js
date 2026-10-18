import axios from 'axios';

export default {
    meta: {
        id: 'tiktok-dl',
        name: 'TikTok Downloader',
        path: '/api/download/tiktok',
        method: 'POST',
        category: 'Downloader',
        desc: 'Ambil video TikTok tanpa watermark (Powered by TikWM).',
        params: [{ key: 'url', label: 'URL TikTok', placeholder: 'https://vt.tiktok.com/...' }]
    },
    handler: async (req, res) => {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, error: 'JSON body "url" wajib diisi!' });

        try {
            const { data } = await axios.get(`https://www.tikwm.com/api/`, {
                params: { url: url },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (data.code !== 0) throw new Error(data.msg || 'Gagal mengambil video. Pastikan link valid.');

            const result = data.data;
            const baseUrl = 'https://www.tikwm.com';
            const videoUrl = result.play.startsWith('http') ? result.play : `${baseUrl}${result.play}`;
            const audioUrl = result.music.startsWith('http') ? result.music : `${baseUrl}${result.music}`;

            res.json({
                success: true,
                data: {
                    title: result.title || 'Tanpa Judul',
                    author: result.author?.unique_id || result.author?.nickname || 'Unknown',
                    video: videoUrl,
                    audio: audioUrl,
                    thumbnail: result.cover
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.response?.data?.msg || error.message });
        }
    }
};