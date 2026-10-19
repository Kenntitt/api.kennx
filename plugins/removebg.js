import axios from 'axios';

const BASE_URL = 'https://www.iloveimg.com';
const TOOL = 'removebackgroundimage';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*', 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
  'Origin': BASE_URL, 'Referer': `${BASE_URL}/id/hapus-latar-belakang`,
  'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  'Sec-Ch-Ua-Mobile': '?0', 'Sec-Ch-Ua-Platform': '"Windows"'
};

function parseErrorMessage(error) {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
    if (data.error) return typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
    return JSON.stringify(data);
  }
  return error.message || 'Unknown Error';
}

async function removeBgILoveImg(imageUrl) {
  const pageRes = await axios.get(`${BASE_URL}/id/hapus-latar-belakang`, { headers, timeout: 30000 });
  const tokenMatch = pageRes.data.match(/"token"\s*:\s*"([^"]+)"/);
  if (!tokenMatch) throw new Error('Gagal mengekstrak Token Auth dari halaman iLoveIMG');

  const bearerToken = tokenMatch[1];
  const authHeaders = { ...headers, 'Authorization': `Bearer ${bearerToken}` };
  const taskRes = await axios.get(`https://api.iloveimg.com/v1/start/${TOOL}`, { headers: authHeaders, timeout: 30000 });
  const { task, server } = taskRes.data;
  if (!task || !server) throw new Error('Gagal mendapatkan Task ID dari server iLoveIMG');

  const uploadPayload = { task, cloud_file: imageUrl };
  const uploadRes = await axios.post(`https://${server}/v1/upload`, uploadPayload, { headers: authHeaders, timeout: 30000 });
  const serverFilename = uploadRes.data?.server_filename;
  if (!serverFilename) throw new Error('Gagal mengunggah gambar ke server pemrosesan');

  const originalFilename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
  const processPayload = { task, tool: TOOL, files: [{ server_filename: serverFilename, filename: originalFilename }] };
  const processRes = await axios.post(`https://${server}/v1/process`, processPayload, { headers: authHeaders, timeout: 30000 });

  return {
    taskId: task, server: server, authHeaders: authHeaders,
    downloadUrl: `https://${server}/v1/download/${task}`, outputSize: processRes.data?.output_filesize || null
  };
}

export default {
  meta: {
    id: 'remove-bg', name: 'Remove Background', path: '/api/image/remove-bg',
    method: 'GET', category: 'Image', desc: 'Hapus latar belakang gambar secara otomatis (Powered by iLoveIMG).',
    params: [{ key: 'url', label: 'URL Gambar', placeholder: 'https://...', type: 'text' }]
  },
  handler: async (req, res) => {
    const { url, raw } = req.query;
    if (!url) return res.status(400).json({ creator: "API KENNX", success: false, error: 'Parameter "url" wajib diisi!' });

    try {
      const result = await removeBgILoveImg(url);
      if (raw === 'true') {
        const imageRes = await axios.get(result.downloadUrl, { headers: result.authHeaders, responseType: 'arraybuffer' });
        res.setHeader('Content-Type', imageRes.headers['content-type'] || 'image/jpeg');
        return res.send(Buffer.from(imageRes.data));
      }
      res.json({ creator: "API KENNX", success: true, data: { input: url, downloadUrl: result.downloadUrl, size: result.outputSize, note: "Tambahkan ?raw=true di URL untuk melihat/mendownload gambar langsung." } });
    } catch (error) {
      res.status(500).json({ creator: "API KENNX", success: false, error: parseErrorMessage(error) });
    }
  }
};