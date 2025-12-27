const pdfUrl = 'WARTA JEMAAT GKI GMM EDISI 14 Tahun ke-22 (21-12-2025).pdf';
const bookElement = document.getElementById('book');
const docNameElement = document.getElementById('docName');

docNameElement.innerText = "📥 " + pdfUrl;
docNameElement.href = pdfUrl;

let pageFlip = null;

function initFlipbook() {
    const isMobile = window.innerWidth < 768;
    
    if (pageFlip) pageFlip.destroy();

    pageFlip = new St.PageFlip(document.getElementById('book'), {
        width: 595,
        height: 842,
        size: "stretch",
        showCover: true, // Efek sampul buku
        mode: isMobile ? "portrait" : "double",
        clickEventForward: false, // Matikan klik otomatis agar tidak bentrok dengan tombol samping
        useMouseEvents: true,
        swipeDistance: 30,
        maxShadowOpacity: 0.5,
        showPageCorners: true
    });

    const pages = document.querySelectorAll('.my-page');
    if (pages.length > 0) {
        pageFlip.loadFromHTML(pages);
    }

    // Update Nomor Halaman
    pageFlip.on('flip', (e) => {
        document.getElementById('pageInfo').innerText = (e.data + 1);
    });
}

async function loadPdf() {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const bookElement = document.getElementById('book');
        bookElement.innerHTML = ''; 

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const div = document.createElement('div');
            div.className = 'my-page';
            
            // PERBAIKAN EFEK: Halaman 1 & 2 (sampul depan) dan terakhir (sampul belakang) dibuat keras
            if (i === 1 || i === pdf.numPages) {
                div.dataset.density = 'hard';
            }

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 1.5 });
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            div.appendChild(canvas);
            bookElement.appendChild(div);
        }

        initFlipbook();

    } catch (error) {
        console.error("PDF Error:", error);
    }
}

// Navigasi Samping
document.querySelector('.nav-left').onclick = () => pageFlip.flipPrev();
document.querySelector('.nav-right').onclick = () => pageFlip.flipNext();

window.addEventListener('resize', initFlipbook);
loadPdf();