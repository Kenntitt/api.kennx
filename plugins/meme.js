import axios from 'axios';

export default {
    meta: {
        id: 'meme-random', name: 'Random Meme', path: '/api/meme/random',
        method: 'GET', category: 'Fun', desc: 'Ambil meme random. Tambahkan ?raw=true untuk direct image.', params: []
    },
    handler: async (req, res) => {
        try {
            const { data } = await axios.get('https://meme-api.com/gimme');
            if (req.query.raw === 'true') return res.redirect(data.url);
            res.json({ creator: "API KENNX", success: true, data: { title: data.title, author: data.author, image: data.url } });
        } catch (error) {
            res.status(500).json({ creator: "API KENNX", success: false, error: 'Gagal mengambil meme.' });
        }
    }
};