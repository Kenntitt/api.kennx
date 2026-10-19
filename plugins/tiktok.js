import axios from "axios";
import * as cheerio from "cheerio";
import { decode } from "html-entities";

const BASE_URL = "https://ikdownloader.io";
const API_URL = `${BASE_URL}/api/ajaxSearch`;
const LANG = "id";
const CF_CLEARANCE = ""; // Isi jika kena blokir Cloudflare

function cleanUrl(url) {
  if (!url) return null;
  return decode(url).replaceAll("&amp;", "&");
}

function parseHtml(html) {
  const $ = cheerio.load(html);
  const title = $(".content h3").first().text().trim() || null;
  const thumbnail = cleanUrl($(".thumbnail img").first().attr("src"));
  const tiktokId = $("#TikTokId").attr("value") || null;
  const downloads = [];

  $(".dl-action a").each((_, el) => {
    const label = $(el).text().replace(/\s+/g, " ").trim();
    const url = cleanUrl($(el).attr("href"));
    if (url) downloads.push({ type: label || null, url: url });
  });

  const videoPreview = cleanUrl($("#vid").attr("data-src"));
  const poster = cleanUrl($("#vid").attr("poster"));
  const scriptText = $("script").map((_, el) => $(el).html()).get().join("\n");
  
  const kExp = scriptText.match(/k_exp\s*=\s*"([^"]+)"/)?.[1] || null;
  const kToken = scriptText.match(/k_token\s*=\s*"([^"]+)"/)?.[1] || null;
  const kConvert = scriptText.match(/k_url_convert\s*=\s*"([^"]+)"/)?.[1] || null;

  return {
    title: title,
    tiktok_id: tiktokId,
    thumbnail: thumbnail,
    poster: poster,
    preview_video: videoPreview,
    downloads: downloads,
    convert: { exp: kExp, token: kToken, url: kConvert }
  };
}

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
        if (!url) return res.status(400).json({ creator: "API KENNX", success: false, error: 'JSON body "url" wajib diisi!' });

        const started = Date.now();
        try {
            const cookie = CF_CLEARANCE ? `cf_clearance=${CF_CLEARANCE}` : "";
            const response = await axios.post(
                API_URL,
                new URLSearchParams({ q: url, lang: LANG }).toString(),
                {
                    timeout: 15000,
                    validateStatus: () => true,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
                        "Accept": "*/*",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest",
                        "Origin": BASE_URL,
                        "Referer": `${BASE_URL}/id`,
                        ...(cookie ? { Cookie: cookie } : {})
                    }
                }
            );

            const data = response.data;
            if (typeof data !== "object") throw new Error("Response bukan JSON. Mungkin kena blokir Cloudflare.");
            if (data.status !== "ok") throw new Error(data.message || data.error || "Request gagal");

            const result = parseHtml(data.data || "");

            res.json({
                creator: "API KENNX",
                success: true,
                data: { input: url, result: result, time_ms: Date.now() - started }
            });
        } catch (error) {
            res.status(500).json({ creator: "API KENNX", success: false, error: error.message, time_ms: Date.now() - started });
        }
    }
};