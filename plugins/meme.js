import axios from 'axios';

export default {
    meta: {
        id: 'meme-random',
        name: 'Random Meme',
        path: '/api/meme/random',
        method: 'GET',
        category: 'Fun',
        desc: 'Ambil gambar meme random dari Reddit.',
        params: []
    },
    handler: async (req, res) => {
        try {
            const { data } = await axios.get('https://meme-api.com/gimme');
            res.json({
                success: true,
                data: { title: data.title, author: data.author, image: data.url }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Gagal mengambil meme.' });
        }
    }
};