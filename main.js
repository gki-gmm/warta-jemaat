    /**
     * KONFIGURASI UTAMA
     * Ganti URL ini dengan path file PDF lokal Anda jika sudah siap.
     * Contoh: 'WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf'
     */
    const currentPdfPath = '/workspaces/warta-jemaat/WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf'; 
    
    // State Global
    let flipObject = null;
    let pdfDoc = null;
    const elBook = document.getElementById('book');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const pageInfo = document.getElementById('pageInfo');
    const pageTotal = document.getElementById('pageTotal');

    // Inisialisasi Aplikasi
    async function startApp() {
        try {
            updateLoadingStatus("Membuka Dokumen...", 0);
            
            // 1. Load Dokumen
            const loadingTask = pdfjsLib.getDocument(currentPdfPath);
            pdfDoc = await loadingTask.promise;
            
            pageTotal.innerText = pdfDoc.numPages;
            
            // 2. Render Semua Halaman ke Canvas
            // Kita render dulu semua sebelum init flipbook agar ukuran bisa dihitung
            await renderPdfPages();

            // 3. Setup Flipbook setelah konten siap
            setupFlipbook();
            
            // 4. Hapus Loading
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);

        } catch (err) {
            console.error(err);
            loadingText.innerText = "Gagal memuat PDF.";
            loadingText.style.color = "red";
            // Tampilkan detail error di console untuk developer
            console.error("Detail Error:", err);
            alert("Gagal memuat PDF. Pastikan file tersedia dan format benar. Cek console untuk detail.");
        }
    }

    // Fungsi Update UI Loading
    function updateLoadingStatus(text, progressPercent) {
        loadingText.innerText = text;
        progressBar.style.width = progressPercent + '%';
    }

    async function renderPdfPages() {
        elBook.innerHTML = ''; // Bersihkan
        const fragment = document.createDocumentFragment();

        // Kita ambil viewport halaman pertama dulu untuk mengetahui rasio aslinya
        const firstPage = await pdfDoc.getPage(1);
        const rawViewport = firstPage.getViewport({ scale: 1.0 });
        
        // Simpan rasio dimensi asli untuk konfigurasi flipbook nanti
        window.pdfBaseRatio = {
            width: rawViewport.width,
            height: rawViewport.height
        };

        // Render semua halaman
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            // Update Progress
            const progress = Math.round((i / pdfDoc.numPages) * 100);
            updateLoadingStatus(`Merender Halaman ${i} dari ${pdfDoc.numPages}...`, progress);

            const page = await pdfDoc.getPage(i);
            // Scale 2.0 untuk kualitas tajam (Retina/Zoom)
            const viewport = page.getViewport({ scale: 2.0 }); 

            const div = document.createElement('div');
            div.className = 'my-page';
            
            // Set density 'hard' untuk cover depan dan belakang
            if (i === 1 || i === pdfDoc.numPages) {
                div.dataset.density = 'hard';
            } else {
                div.dataset.density = 'soft';
            }

            const canvas = document.createElement('canvas');
            // Atur resolusi canvas fisik (internal)
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            div.appendChild(canvas);
            fragment.appendChild(div);
        }

        elBook.appendChild(fragment);
    }

    function setupFlipbook() {
        const isMobile = window.innerWidth < 768;
        
        // Simpan index terakhir jika resize (agar tidak balik ke hal 1)
        let lastPageIndex = 0;
        if (flipObject) {
            lastPageIndex = flipObject.getCurrentPageIndex();
            flipObject.destroy(); // Hancurkan instance lama
        }

        // Hitung ukuran yang pas untuk layar
        // Kita gunakan 'stretch' agar responsif, tapi kita berikan baseline rasio
        // agar flipbook tahu proporsi kertasnya.
        // Baseline kita ambil dari rasio PDF asli yang disimpan di window.pdfBaseRatio
        
        flipObject = new St.PageFlip(elBook, {
            // Kita berikan dimensi referensi. Dengan size: "stretch", library akan 
            // menyesuaikan elemen ini mengisi container #book, tapi mempertahankan rasio ini.
            width: window.pdfBaseRatio.width, 
            height: window.pdfBaseRatio.height,
            
            size: "stretch", // PENTING: Agar buku mengikuti ukuran layar
            
            // Mode tampilan
            mode: isMobile ? "portrait" : "double", // Mobile: 1 halaman, Desktop: 2 halaman
            
            // Interaksi
            showCover: true,
            mobileScrollSupport: true, // Aktifkan scroll native di mobile
            clickEventForward: false, // Klik di halaman tidak auto-next (biar user bisa zoom pdf)
            useMouseEvents: true,
            maxShadowOpacity: 0.3, // Bayangan lebih halus
            
            // Halaman awal (setelah resize)
            startPage: lastPageIndex
        });

        // Load dari elemen HTML yang sudah dirender
        flipObject.loadFromHTML(document.querySelectorAll('.my-page'));
        
        // Event Listener: Saat halaman berbalik
        flipObject.on('flip', (e) => {
            // e.data adalah index (0-based). PDF biasanya 1-based.
            // PageFlip index 0 = Cover Depan (Halaman 1 PDF)
            pageInfo.innerText = e.data + 1;
        });

        // Event Listener: Saat user mengubah orientasi HP (resize)
        // Debounce dihandle di window event listener di bawah
    }

    // Kontrol Navigasi Tombol
    document.getElementById('prevBtn').onclick = () => {
        if(flipObject) flipObject.flipPrev();
    };
    
    document.getElementById('nextBtn').onclick = () => {
        if(flipObject) flipObject.flipNext();
    };

    // Event Resize Window (Debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-init flipbook saat ukuran layar berubah drastis (misal rotasi HP)
            // Ini penting untuk berganti mode Single <-> Double page
            setupFlipbook();
        }, 300); // Tunggu 300ms setelah user berhenti resize
    });

    // Mulai Aplikasi
    startApp();
