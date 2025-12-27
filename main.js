// Gunakan nama variabel unik untuk menghindari "already declared"
const currentPdfPath = 'WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf';
let flipObject = null;

async function startApp() {
    const bookEl = document.getElementById('book');
    
    try {
        const pdf = await pdfjsLib.getDocument(currentPdfPath).promise;
        document.getElementById('pageTotal').innerText = pdf.numPages;
        
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 }); // Kualitas tinggi

            const div = document.createElement('div');
            div.className = 'my-page';
            // Density hard untuk halaman 1 dan terakhir (Sampul)
            div.dataset.density = (i === 1 || i === pdf.numPages) ? 'hard' : 'soft';

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            div.appendChild(canvas);
            fragment.appendChild(div);
        }

        bookEl.appendChild(fragment);
        bookEl.style.display = 'block'; // Tampilkan setelah semua siap
        
        setupFlipbook();
    } catch (err) {
        console.error(err);
    }
}

function setupFlipbook() {
    const isMobile = window.innerWidth < 768;
    if (flipObject) flipObject.destroy();

    flipObject = new St.PageFlip(document.getElementById('book'), {
        width: 595,
        height: 842,
        size: "stretch",
        showCover: true, // Membuat buka-tutup rapi di tengah
        mode: isMobile ? "portrait" : "double",
        clickEventForward: false,
        useMouseEvents: true,
        maxShadowOpacity: 0.5,
    });

    flipObject.loadFromHTML(document.querySelectorAll('.my-page'));
    
    flipObject.on('flip', (e) => {
        document.getElementById('pageInfo').innerText = e.data + 1;
    });
}

// Navigasi
document.getElementById('prevBtn').onclick = () => flipObject && flipObject.flipPrev();
document.getElementById('nextBtn').onclick = () => flipObject && flipObject.flipNext();

// Handle Resize dengan Delay
let timeoutHandle;
window.addEventListener('resize', () => {
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(setupFlipbook, 300);
});

startApp();