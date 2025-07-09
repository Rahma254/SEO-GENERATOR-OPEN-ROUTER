// File: api/generate.js (Versi untuk OpenRouter)

export default async function handler(req, res) {
    // Memastikan permintaan menggunakan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. Ambil Kunci API OpenRouter dari Environment Variable di server Anda (Vercel/Netlify)
    // Ini adalah langkah keamanan yang sangat penting!
    const API_KEY = process.env.OPENROUTER_API_KEY; 
    
    // 2. Tentukan model yang ingin Anda gunakan dari OpenRouter
    // Model gratis yang populer: 'mistralai/mistral-7b-instruct', 'google/gemini-flash-1.5', 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo'
    const MODEL_NAME = 'mistralai/mistral-7b-instruct'; // Anda bisa ganti model ini jika mau

    // 3. URL endpoint untuk OpenRouter API
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    // Jika API Key tidak ditemukan di server, kirim pesan error
    if (!API_KEY) {
        return res.status(500).json({ error: 'Kunci API OpenRouter (OPENROUTER_API_KEY) tidak dikonfigurasi di server.' });
    }

    try {
        // Ambil 'prompt' yang dikirim dari script.js di frontend
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt tidak ditemukan dalam permintaan.' });
        }

        // 4. Siapkan permintaan ke OpenRouter dengan format yang mirip OpenAI
        const headers = { 
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json' 
        };
        const body = JSON.stringify({
            model: MODEL_NAME,
            messages: [
                { "role": "user", "content": prompt }
            ],
            // Anda bisa tambahkan parameter lain seperti temperature, max_tokens, dll.
            // max_tokens: 4096, 
        });

        // Kirim permintaan ke API OpenRouter
        const apiResponse = await fetch(url, { method: 'POST', headers, body });
        const data = await apiResponse.json();

        // Jika ada error dari OpenRouter, tampilkan di konsol server dan kirim pesan error
        if (!apiResponse.ok) {
            console.error('OpenRouter API Error:', data);
            throw new Error(`API Error: ${apiResponse.status} - ${data.error ? data.error.message : JSON.stringify(data)}`);
        }

        // 5. Ekstrak teks hasil generate dari AI dan kirim kembali ke frontend (script.js)
        const newChapterText = data.choices[0].message.content;
        res.status(200).json({ newChapterText: newChapterText });

    } catch (error) {
        console.error('Error in serverless function:', error);
        res.status(500).json({ error: `Terjadi kesalahan di server: ${error.message}` });
    }
}
