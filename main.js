// Gunakan nama variabel unik untuk menghindari "already declared"
const currentPdfPath = 'WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf';
let flipObject = null;
const elBook = document.getElementById('book');

async function startApp() {
    try {
        elBook.innerHTML = '<div style="color:white;text-align:center;">Menyiapkan Visual...</div>';
        
        const pdf = await pdfjsLib.getDocument(currentPdfPath).promise;
        document.getElementById('pageTotal').innerText = pdf.numPages;
        
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            // Gunakan scale 2.0 agar saat user zoom-in di HP, gambar tetap tajam
            const viewport = page.getViewport({ scale: 2.0 }); 

            const div = document.createElement('div');
            div.className = 'my-page';
            div.dataset.density = (i === 1 || i === pdf.numPages) ? 'hard' : 'soft';

            const canvas = document.createElement('canvas');
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

        elBook.innerHTML = ''; 
        elBook.appendChild(fragment);
        elBook.style.display = 'block';
        
        setupFlipbook();
    } catch (err) {
        elBook.innerHTML = `<div style="color:white">Gagal memuat PDF. Pastikan file tersedia.</div>`;
    }
}

function setupFlipbook() {
    const isMobile = window.innerWidth < 768;
    
    // Jika sudah ada, simpan index halaman terakhir agar tidak reset ke halaman 1 saat zoom
    const lastPageIndex = flipObject ? flipObject.getCurrentPageIndex() : 0;

    if (flipObject) flipObject.destroy();

    flipObject = new St.PageFlip(elBook, {
        width: 595,
        height: 842,
        size: "stretch",
        showCover: true,
        mode: isMobile ? "portrait" : "double",
        clickEventForward: false,
        useMouseEvents: true,
        maxShadowOpacity: 0.5,
        startPage: lastPageIndex, // Tetap di halaman yang sama setelah resize/zoom
        mobileScrollSupport: true  // Penting untuk layar sentuh
    });

    flipObject.loadFromHTML(document.querySelectorAll('.my-page'));
    
    flipObject.on('flip', (e) => {
        document.getElementById('pageInfo').innerText = e.data + 1;
    });
}

// Navigasi
document.getElementById('prevBtn').onclick = () => flipObject && flipObject.flipPrev();
document.getElementById('nextBtn').onclick = () => flipObject && flipObject.flipNext();

// ANTI-LOST VISUAL: Gunakan debounce agar tidak flicker saat zoom
let zoomTimer;
window.addEventListener('resize', () => {
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => {
        // Hanya re-init jika ukuran layar berubah signifikan (bukan sekedar scroll)
        setupFlipbook();
    }, 500); 
});

startApp();