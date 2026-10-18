import axios from 'axios';

export default {
    meta: {
        id: 'anime-random',
        name: 'Random Anime',
        path: '/api/anime/random',
        method: 'GET',
        category: 'Anime',
        desc: 'Dapatkan data anime random dari MyAnimeList.',
        params: []
    },
    handler: async (req, res) => {
        try {
            const { data } = await axios.get('https://api.jikan.moe/v4/random/anime');
            res.json({
                success: true,
                data: {
                    title: data.data.title,
                    type: data.data.type,
                    episodes: data.data.episodes,
                    score: data.data.score,
                    synopsis: data.data.synopsis,
                    image: data.data.images.jpg.large_image_url
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Gagal mengambil data anime.' });
        }
    }
};