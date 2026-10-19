import axios from 'axios';

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export default {
    meta: {
        id: 'tiktok-dl',
        name: 'TikTok Downloader',
        path: '/api/download/tiktok',
        method: 'POST',
        category: 'Downloader',
        desc: 'Ambil video TikTok tanpa watermark.',
        params: [{ key: 'url', label: 'URL TikTok', placeholder: 'https://vt.tiktok.com/...' }]
    },
    handler: async (req, res) => {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ creator: "API KENNX", success: false, error: 'JSON body "url" wajib diisi!' });
        }

        const started = Date.now();

        // ==========================================
        // METODE 1: Coba pakai API TikXedd (Free, No Key)
        // ==========================================
        try {
            console.log(`[TikTok] Mencoba API Utama (TikXedd)...`);
            const { data } = await axios.get(`https://tikxedd.vercel.app/api/resolve`, {
                params: { url: url },
                headers: { 'User-Agent': UA },
                timeout: 10000 // 10 detik timeout
            });

            if (data && data.download && data.download.noWatermark) {
                return res.json({
                    creator: "API KENNX",
                    success: true,
                    data: {
                        input: url,
                        title: data.description || 'Tanpa Judul',
                        author: data.author || 'Unknown',
                        video: data.download.noWatermark,
                        audio: null, // API ini fokus di video
                        thumbnail: null,
                        time_ms: Date.now() - started,
                        source: "TikXedd"
                    }
                });
            }
            throw new Error("Struktur respons tidak valid");
        } catch (error) {
            console.log(`[TikTok] API Utama gagal: ${error.message}. Beralih ke API Cadangan...`);
            
            // ==========================================
            // METODE 2: Fallback ke TikWM (Kalau API 1 Gagal)
            // ==========================================
            try {
                const { data } = await axios.get(`https://www.tikwm.com/api/`, {
                    params: { url: url },
                    headers: { 'User-Agent': UA },
                    timeout: 10000
                });

                if (data.code !== 0) throw new Error(data.msg || 'Gagal mengambil video');

                const result = data.data;
                const baseUrl = 'https://www.tikwm.com';
                
                const videoUrl = result.play.startsWith('http') ? result.play : `${baseUrl}${result.play}`;
                const audioUrl = result.music.startsWith('http') ? result.music : `${baseUrl}${result.music}`;

                return res.json({
                    creator: "API KENNX",
                    success: true,
                    data: {
                        input: url,
                        title: result.title || 'Tanpa Judul',
                        author: result.author?.unique_id || result.author?.nickname || 'Unknown',
                        video: videoUrl,
                        audio: audioUrl,
                        thumbnail: result.cover,
                        time_ms: Date.now() - started,
                        source: "TikWM (Fallback)"
                    }
                });
            } catch (fallbackError) {
                // Kalau dua-duanya gagal, baru kasih error
                return res.status(500).json({ 
                    creator: "API KENNX", 
                    success: false, 
                    error: `Semua server downloader sedang sibuk. Error: ${fallbackError.message}`,
                    time_ms: Date.now() - started
                });
            }
        }
    }
};