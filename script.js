// File: public/script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMEN UI GLOBAL ---
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    const allPanels = document.querySelectorAll('.content-panel');
    const navLinks = document.querySelectorAll('.nav-link');

    // --- ELEMEN UI STUDIO NOVEL ---
    const novelTitleEl = document.getElementById('novel-title');
    const novelSynopsisEl = document.getElementById('novel-synopsis');
    const novelGenreEl = document.getElementById('novel-genre');
    const generateNovelBtn = document.getElementById('generate-novel-btn');
    const novelContentEl = document.getElementById('novel-content');

    // --- ELEMEN UI RAMALAN AI ---
    const ramalanNamaEl = document.getElementById('ramalan-nama');
    const ramalanInfoEl = document.getElementById('ramalan-info');
    const generateRamalanBtn = document.getElementById('generate-ramalan-btn');
    const ramalanContentEl = document.getElementById('ramalan-content');

    // --- ELEMEN UI GENERATOR PUISI ---
    const puisiTipeEl = document.getElementById('puisi-tipe');
    const puisiTemaEl = document.getElementById('puisi-tema');
    const puisiMoodEl = document.getElementById('puisi-mood');
    const generatePuisiBtn = document.getElementById('generate-puisi-btn');
    const puisiContentEl = document.getElementById('puisi-content');
    
    // --- STATE APLIKASI ---
    let novel = {
        title: '',
        synopsis: '',
        genre: '',
        chapters: []
    };
    
    // =================================================================
    // FUNGSI UTAMA & INTI
    // =================================================================

    // --- Fungsi Navigasi Panel ---
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                // Sembunyikan semua panel
                allPanels.forEach(panel => panel.classList.remove('active'));
                
                // Tampilkan panel target
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                
                // Atur status aktif pada link navigasi
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
                
                // Inisialisasi Peta jika panel lokasi yang aktif
                if (targetId === 'lokasi') {
                    initMap();
                }
            });
        });
    }

    // --- Fungsi Universal untuk Memanggil Backend (OpenRouter) ---
    async function callOpenRouterAPI(prompt, button, loaderMessage) {
        loaderText.textContent = loaderMessage;
        loader.style.display = 'flex';
        if (button) button.disabled = true;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server Error: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            return data.newChapterText; // Menggunakan nama field yang sama dari backend
        } catch (error) {
            console.error("Gagal mengambil data dari backend:", error);
            alert("Terjadi kesalahan saat menghubungi server AI. Cek konsol untuk detail. Error: " + error.message);
            return null;
        } finally {
            loader.style.display = 'none';
            if (button) button.disabled = false;
        }
    }


    // =================================================================
    // LOGIKA FITUR: STUDIO NOVEL
    // =================================================================

    async function generateNextChapter() {
        if (!novelTitleEl.value || !novelSynopsisEl.value || !novelGenreEl.value) {
            alert("Mohon isi Judul, Sinopsis, dan Genre untuk novel.");
            return;
        }

        const currentChapterNumber = novel.chapters.length + 1;
        
        let prompt = `Anda adalah seorang penulis novel profesional bernama Nabila Ahmad. Tugas Anda adalah menulis bab novel yang menarik, koheren, dan profesional.
        Judul Novel: "${novel.title}"
        Sinopsis Global: "${novel.synopsis}"
        Genre dan Gaya Penulisan: "${novel.genre}"
        Tugas Spesifik: Tuliskan Bab ${currentChapterNumber} dari novel ini. Panjang sekitar 1000-1500 kata.`;

        if (novel.chapters.length > 0) {
            const previousChaptersText = novel.chapters.map((ch, index) => `--- AWAL BAB ${index + 1} ---\n${ch}\n--- AKHIR BAB ${index + 1} ---`).join('\n\n');
            prompt += `\nBerikut adalah konteks dari bab-bab sebelumnya:\n${previousChaptersText}\n\nLanjutkan cerita dari akhir Bab ${novel.chapters.length} dengan logis dan menarik.`;
        } else {
            prompt += `\nIni adalah bab pertama. Mulailah cerita berdasarkan sinopsis dan genre yang diberikan. Buat pembukaan yang memikat.`;
        }
        
        prompt += `\n\nRespon Anda harus berupa narasi dari Bab ${currentChapterNumber} saja. Jangan sertakan judul 'Bab ${currentChapterNumber}' atau elemen non-narasi lainnya.`;

        generateNovelBtn.textContent = 'AI Sedang Bekerja...';
        const newChapterText = await callOpenRouterAPI(prompt, generateNovelBtn, 'AI sedang merangkai bab novel...');

        if (newChapterText) {
            novel.chapters.push(newChapterText);
            renderNovel();
            saveNovelToLocalStorage();
        }
        generateNovelBtn.textContent = 'Buat Bab Selanjutnya';
    }

    function renderNovel() {
        novelContentEl.innerHTML = '';
        if (novel.chapters.length === 0) {
             novelContentEl.innerHTML = `<div class="placeholder-text">Bab-bab novel Anda akan muncul di sini...</div>`;
             return;
        }
        novel.chapters.forEach((chapterText, index) => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter';
            chapterDiv.innerHTML = `<h2>Bab ${index + 1}</h2><p>${chapterText}</p>`;
            novelContentEl.appendChild(chapterDiv);
        });
        novelContentEl.parentElement.scrollTop = novelContentEl.parentElement.scrollHeight;
    }

    function saveNovelToLocalStorage() {
        novel.title = novelTitleEl.value;
        novel.synopsis = novelSynopsisEl.value;
        novel.genre = novelGenreEl.value;
        localStorage.setItem('nabilaAhmadNovel', JSON.stringify(novel));
    }

    function loadNovelFromLocalStorage() {
        const savedNovel = localStorage.getItem('nabilaAhmadNovel');
        if (savedNovel) {
            novel = JSON.parse(savedNovel);
            novelTitleEl.value = novel.title || '';
            novelSynopsisEl.value = novel.synopsis || '';
            novelGenreEl.value = novel.genre || '';
            renderNovel();
        } else {
            renderNovel(); // Tampilkan placeholder jika tidak ada data
        }
    }


    // =================================================================
    // LOGIKA FITUR: RAMALAN AI
    // =================================================================

    async function generateRamalan() {
        const nama = ramalanNamaEl.value;
        const info = ramalanInfoEl.value;

        if (!nama) {
            alert("Mohon masukkan nama Anda untuk memulai ramalan.");
            return;
        }

        const prompt = `Anda adalah seorang peramal digital yang bijaksana, elegan, dan positif bernama "Aura AI" dari Nabila Ahmad Studio. Anda menggunakan intuisi kosmik untuk memberikan panduan.
        Klien Anda bernama: "${nama}".
        Fokus pertanyaan mereka adalah: "${info || 'Cinta dan Karir secara umum'}".
        
        Tugas Anda: Berikan ramalan yang mendalam, inspiratif, dan berwawasan mengenai cinta dan karir untuk "${nama}". Gunakan bahasa yang puitis, mewah, dan menenangkan. Berikan saran yang dapat ditindaklanjuti. Struktur jawaban Anda menjadi dua bagian: "Panduan Asmara" dan "Peta Karir". Jangan terdengar seperti robot. Sapa klien dengan hangat.`;
        
        generateRamalanBtn.textContent = 'AI Membaca Takdir...';
        const ramalanText = await callOpenRouterAPI(prompt, generateRamalanBtn, 'AI sedang membaca konstelasi takdir...');
        
        if (ramalanText) {
            ramalanContentEl.innerHTML = `<p>${ramalanText}</p>`;
            ramalanContentEl.parentElement.scrollTop = 0;
        }
        generateRamalanBtn.textContent = 'Dapatkan Ramalan';
    }


    // =================================================================
    // LOGIKA FITUR: GENERATOR PUISI/LIRIK
    // =================================================================

    async function generatePuisi() {
        const tipe = puisiTipeEl.value;
        const tema = puisiTemaEl.value;
        const mood = puisiMoodEl.value;

        if (!tema || !mood) {
            alert("Mohon isi Tema dan Suasana untuk menghasilkan karya.");
            return;
        }

        const prompt = `Anda adalah seorang seniman kata AI, seorang maestro penyusun ${tipe} yang ulung dari Nabila Ahmad Studio.
        Tugas Anda: Buat sebuah ${tipe} yang orisinal dan indah.
        Tema Utama: "${tema}"
        Suasana (Mood): "${mood}"
        Gaya: Puitis, kaya metafora, dan menggugah emosi.
        
        Silakan tuliskan ${tipe} tersebut. Pastikan hasilnya artistik dan berkelas dunia. Untuk lirik lagu, sertakan struktur seperti [Verse], [Chorus], [Bridge]. Untuk puisi, biarkan mengalir bebas.`;

        generatePuisiBtn.textContent = 'AI Merangkai Kata...';
        const puisiText = await callOpenRouterAPI(prompt, generatePuisiBtn, 'AI sedang mencari inspirasi...');

        if (puisiText) {
            puisiContentEl.innerHTML = `<p>${puisiText}</p>`;
            puisiContentEl.parentElement.scrollTop = 0;
        }
        generatePuisiBtn.textContent = 'Buat Karya Seni';
    }


    // =================================================================
    // LOGIKA FITUR: PETA LOKASI
    // =================================================================
    let map; // Variabel untuk menyimpan instance peta
    function initMap() {
        // Hanya inisialisasi peta jika belum ada
        if (map) return;
        
        // Koordinat untuk Jl Jaya Raya, Cengkareng Barat (perkiraan)
        const lat = -6.1512;
        const lon = 106.7215;

        map = L.map('map').setView([lat, lon], 17);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([lat, lon]).addTo(map)
            .bindPopup('<b>Nabila Ahmad Studio</b><br>Jl Jaya Raya, Cengkareng Barat.')
            .openPopup();
    }


    // =================================================================
    // INISIALISASI & EVENT LISTENERS
    // =================================================================

    // Setup Navigasi
    setupNavigation();

    // Event Listeners Studio Novel
    generateNovelBtn.addEventListener('click', generateNextChapter);
    novelTitleEl.addEventListener('input', saveNovelToLocalStorage);
    novelSynopsisEl.addEventListener('input', saveNovelToLocalStorage);
    novelGenreEl.addEventListener('input', saveNovelToLocalStorage);
    
    // Event Listeners Ramalan AI
    generateRamalanBtn.addEventListener('click', generateRamalan);
    
    // Event Listeners Generator Puisi
    generatePuisiBtn.addEventListener('click', generatePuisi);

    // Muat data novel dari localStorage saat halaman dibuka
    loadNovelFromLocalStorage();
});
