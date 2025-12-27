// Tambahkan variable global untuk instance
let pageFlip = null;

function initFlipbook() {
    // Jika sudah ada instance, hancurkan dulu sebelum buat baru
    if (pageFlip) {
        pageFlip.destroy();
    }

    const isMobile = window.innerWidth < 768;

    pageFlip = new St.PageFlip(document.getElementById('book'), {
        width: 595,
        height: 842,
        size: "stretch", // Mengikuti container #book
        minWidth: 100,
        maxWidth: 2000,
        minHeight: 100,
        maxHeight: 2000,
        showCover: true,
        // Gunakan mode portrait jika layar sempit (HP/Embed kecil)
        mode: isMobile ? "portrait" : "double",
        clickEventForward: true
    });

    // Ambil semua halaman yang sudah di-render canvas-nya
    const pages = document.querySelectorAll('.my-page');
    if (pages.length > 0) {
        pageFlip.loadFromHTML(pages);
    }

    pageFlip.on('flip', (e) => {
        document.getElementById('pageInfo').innerText = e.data + 1;
    });
}

// Tambahkan event listener untuk resize agar rapi saat layar ditarik
window.addEventListener('resize', () => {
    initFlipbook();
});

// Dalam fungsi loadPdf(), panggil initFlipbook() SETELAH loop selesai
async function loadPdf() {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const div = document.createElement('div');
            div.className = 'my-page';
            if (i === 1 || i === pdf.numPages) div.dataset.density = 'hard';

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Scale 1.5 cukup untuk embed agar tidak lag
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            div.appendChild(canvas);
            bookElement.appendChild(div);
        }

        // Inisialisasi pertama kali
        initFlipbook();

    } catch (error) {
        console.error("Error: " + error);
        bookElement.innerHTML = `<p style="color:white; padding:20px;">Gagal: ${error.message}</p>`;
    }
}