import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiList = [];
const pluginsDir = path.join(__dirname, 'plugins');

// AUTO-LOADER PLUGIN SYSTEM (ESM)
async function loadPlugins() {
    try {
        const files = fs.readdirSync(pluginsDir);
        
        for (const file of files) {
            if (file.endsWith('.js')) {
                const pluginPath = `file://${path.join(pluginsDir, file)}`;
                const plugin = await import(pluginPath);
                const pluginData = plugin.default;
                
                if (pluginData && pluginData.meta && pluginData.handler) {
                    app[pluginData.meta.method.toLowerCase()](pluginData.meta.path, pluginData.handler);
                    apiList.push(pluginData.meta);
                    console.log(`✅ Loaded: ${pluginData.meta.name}`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Gagal load plugins:", error);
    }
}

await loadPlugins();

// Endpoint untuk Frontend
app.get('/api/list', (req, res) => {
    res.json({ creator: 'API KENNX', success: true, total: apiList.length, data: apiList });
});

// Fallback ke Frontend UI
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;

// Localhost Listener
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log(`🔥 API KENNX running at http://localhost:3000`));
}