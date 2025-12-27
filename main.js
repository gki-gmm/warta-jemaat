const pdfUrl = 'WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf';
const bookElement = document.getElementById('book');
const docNameElement = document.getElementById('docName');

docNameElement.innerText = "📥 " + pdfUrl;
docNameElement.href = pdfUrl;

let pageFlip = null;

function initFlipbook() {
    const isMobile = window.innerWidth < 768;
    const bookContainer = document.getElementById('book');

    if (pageFlip) {
        pageFlip.destroy(); // Bersihkan instance lama
    }

    pageFlip = new St.PageFlip(bookContainer, {
        width: 595,
        height: 842,
        size: "stretch",
        minWidth: 100,
        maxWidth: 2000,
        minHeight: 100,
        maxHeight: 2000,
        showCover: true,
        mode: isMobile ? "portrait" : "double", // Otomatis 1 halaman di HP, 2 di Desktop
        clickEventForward: true,
        useMouseEvents: true
    });

    const pages = document.querySelectorAll('.my-page');
    if (pages.length > 0) {
        pageFlip.loadFromHTML(pages);
    }

    pageFlip.on('flip', (e) => {
        document.getElementById('pageInfo').innerText = e.data + 1;
    });
}

// listener agar saat ditarik/desktop diresize tetap rapi
window.addEventListener('resize', () => {
    initFlipbook();
});

async function loadPdf() {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        bookElement.innerHTML = ''; // Bersihkan loading

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const div = document.createElement('div');
            div.className = 'my-page';
            
            // Halaman pertama dan terakhir dibuat kaku (hard cover)
            if (i === 1 || i === pdf.numPages) div.dataset.density = 'hard';
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Gunakan scale 1.5 - 2.0 agar tajam tapi tidak berat
            const viewport = page.getViewport({ scale: 1.5 }); 
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            div.appendChild(canvas);
            bookElement.appendChild(div);
        }

        initFlipbook();
        pageFlip.loadFromHTML(document.querySelectorAll('.my-page'));
        
        // Update nomor halaman
        pageFlip.on('flip', (e) => {
            document.getElementById('pageInfo').innerText = e.data + 1;
        });

    } catch (error) {
        console.error("Error: " + error);
        bookElement.innerHTML = `<p style="padding:20px;">Gagal memuat PDF. Pastikan file tersedia.</p>`;
    }
}

// Navigasi
document.getElementById('btnPrev').onclick = () => pageFlip.flipPrev();
document.getElementById('btnNext').onclick = () => pageFlip.flipNext();

// Handle perubahan ukuran layar (Responsive tajam)
window.addEventListener('resize', () => {
    initFlipbook();
    pageFlip.loadFromHTML(document.querySelectorAll('.my-page'));
});

loadPdf();