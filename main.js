// --- KONFIGURASI ---
const pdfUrl = 'WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf';
// Gunakan let atau pastikan hanya dideklarasikan satu kali di paling atas
let pageFlipInstance = null;
const elBook = document.getElementById('book');
const elPageInfo = document.getElementById('pageInfo');
const elDocLink = document.getElementById('docName');

// Set link download
if (elDocLink) {
    elDocLink.innerText = "📥 Download PDF";
    elDocLink.href = pdfUrl;
}

function initFlipbook() {
    const isMobile = window.innerWidth < 768;
    
    // Hancurkan instance lama jika ada sebelum membuat yang baru
    if (pageFlipInstance) {
        pageFlipInstance.destroy();
    }

    pageFlipInstance = new St.PageFlip(elBook, {
        width: 595,
        height: 842,
        size: "stretch",
        showCover: true, 
        mode: isMobile ? "portrait" : "double",
        clickEventForward: false,
        useMouseEvents: true,
        swipeDistance: 30,
        showPageCorners: false,
        maxShadowOpacity: 0.5
    });

    const pages = document.querySelectorAll('.my-page');
    if (pages.length > 0) {
        pageFlipInstance.loadFromHTML(pages);
    }

    // Update Nomor Halaman
    pageFlipInstance.on('flip', (e) => {
        elPageInfo.innerText = e.data + 1;
    });
}

async function loadPdf() {
    try {
        elBook.innerHTML = `<div style="color:white;text-align:center;padding:20px;">Menyiapkan Warta...</div>`;
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const div = document.createElement('div');
            div.className = 'my-page';
            
            // Efek sampul kaku untuk halaman pertama dan terakhir
            div.dataset.density = (i === 1 || i === pdf.numPages) ? 'hard' : 'soft';

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 1.5 });
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            div.appendChild(canvas);
            fragment.appendChild(div);
        }

        elBook.innerHTML = ''; 
        elBook.appendChild(fragment);

        // Tunggu sebentar agar browser merender canvas sebelum Flipbook dihitung
        setTimeout(initFlipbook, 200);

    } catch (error) {
        elBook.innerHTML = `<p style="color:white;padding:20px;">Gagal: ${error.message}</p>`;
    }
}

// Navigasi Samping
document.querySelector('.nav-left').onclick = () => pageFlipInstance && pageFlipInstance.flipPrev();
document.querySelector('.nav-right').onclick = () => pageFlipInstance && pageFlipInstance.flipNext();

// Deteksi perubahan ukuran layar (Resize)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initFlipbook, 300);
});

loadPdf();