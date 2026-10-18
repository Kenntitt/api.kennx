import axios from 'axios';

export default {
    meta: {
        id: 'quote-random',
        name: 'Random Quote',
        path: '/api/quote/random',
        method: 'GET',
        category: 'Utility',
        desc: 'Dapatkan kata-kata mutiara (quote) random.',
        params: []
    },
    handler: async (req, res) => {
        try {
            const { data } = await axios.get('https://zenquotes.io/api/random');
            res.json({
                success: true,
                data: { quote: data[0].q, author: data[0].a }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Gagal mengambil quote.' });
        }
    }
};