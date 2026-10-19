const HOST = "https://amfinder.web.id";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36";

async function streamSSE(endpoint) {
    const ac = new AbortController();
    const deadline = setTimeout(() => ac.abort(), 15000);

    try {
        const res = await fetch(endpoint, {
            signal: ac.signal,
            headers: {
                "accept": "text/event-stream",
                "user-agent": UA,
                "referer": HOST + "/",
            },
        });

        if (res.status !== 200) throw new Error(`HTTP ${res.status} - Server menolak request.`);

        const decoder = new TextDecoder();
        let buf = "";
        let items = null;

        for await (const chunk of res.body) {
            buf += decoder.decode(chunk, { stream: true });
            let idx;
            
            while ((idx = buf.indexOf("\n\n")) >= 0) {
                const block = buf.slice(0, idx);
                buf = buf.slice(idx + 2);

                const ev = /(?:^|\n)event:[ \t]*(.+)/.exec(block);
                const data = /(?:^|\n)data:[ \t]?([\s\S]*)/.exec(block)?.[1];
                
                if (!ev) continue;
                const name = ev[1].trim();

                if (name === "error") {
                    let m = data ?? "Unknown error";
                    try { m = JSON.parse(data).message || m; } catch {}
                    throw new Error(m);
                }

                if (name === "candidates") {
                    try { 
                        const parsed = JSON.parse(data);
                        items = parsed.items || parsed; 
                    } catch { 
                        items = data; 
                    }
                }
            }
        }
        return items;
    } finally {
        clearTimeout(deadline);
    }
}

export default {
    meta: {
        id: 'amfinder-search',
        name: 'AMFinder Search',
        path: '/api/preset/alight-search',
        method: 'GET',
        category: 'Downloader',
        desc: 'Cari video TikTok berdasarkan kata kunci untuk menemukan preset Alight Motion.',
        params: [{ key: 'q', label: 'Kata Kunci', placeholder: 'preset alight motion sad', type: 'text' }]
    },
    handler: async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ creator: "API KENNX", success: false, error: 'Parameter "q" (query) wajib diisi!' });
        }

        try {
            const endpoint = `${HOST}/api/search?mode=pick&q=${encodeURIComponent(q)}`;
            const items = await streamSSE(endpoint);

            if (items === null) throw new Error("Koneksi ditutup sebelum data pencarian ditemukan.");

            res.json({
                creator: "API KENNX",
                success: true,
                data: {
                    query: q,
                    total: items.length,
                    items: items
                }
            });

        } catch (error) {
            res.status(500).json({ creator: "API KENNX", success: false, error: error.message });
        }
    }
};