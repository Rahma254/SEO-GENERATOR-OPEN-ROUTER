// File: api/generate.js (Versi untuk GooseAI)

export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Ambil API Key GooseAI dari Environment Variable
    const API_KEY = process.env.GOOSE_API_KEY;
    const ENGINE_NAME = 'gpt-j-6b'; // Bisa juga 'gpt-neo-20b'
    const url = `https://api.goose.ai/v1/engines/${ENGINE_NAME}/completions`;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Kunci API GooseAI (GOOSE_API_KEY) tidak dikonfigurasi di server.' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt tidak ditemukan dalam permintaan.' });
        }

        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        };

        const body = JSON.stringify({
            prompt: prompt,
            max_tokens: 160,      // Atur panjang teks
            temperature: 0.8,     // Semakin tinggi = semakin kreatif
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers,
            body
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error('GooseAI API Error:', data);
            throw new Error(`API Error: ${apiResponse.status} - ${data.error || JSON.stringify(data)}`);
        }

        // Ambil hasil teks dari GooseAI
        const newChapterText = data.choices[0].text.trim();
        res.status(200).json({ newChapterText });

    } catch (error) {
        console.error('Error in GooseAI function:', error);
        res.status(500).json({ error: `Terjadi kesalahan di server: ${error.message}` });
    }
}
