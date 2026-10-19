import axios from 'axios';

export default {
    meta: {
        id: 'anime-random', name: 'Random Anime', path: '/api/anime/random',
        method: 'GET', category: 'Anime', desc: 'Dapatkan anime random. Tambahkan ?raw=true untuk direct image.', params: []
    },
    handler: async (req, res) => {
        try {
            const { data } = await axios.get('https://api.jikan.moe/v4/random/anime');
            const imageUrl = data.data.images.jpg.large_image_url;
            if (req.query.raw === 'true') return res.redirect(imageUrl);
            res.json({ creator: "API KENNX", success: true, data: { title: data.data.title, type: data.data.type, episodes: data.data.episodes, score: data.data.score, synopsis: data.data.synopsis, image: imageUrl } });
        } catch (error) {
            res.status(500).json({ creator: "API KENNX", success: false, error: 'Gagal mengambil data anime.' });
        }
    }
};