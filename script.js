/*********************
* PAGE FLIP SOUNDS *
*********************/

// Audio untuk efek suara maju dan mundur
const pageFlipForward = document.getElementById('page-flip-forward');
const pageFlipBackward = document.getElementById('page-flip-backward');

// Atur volume
if (pageFlipForward) pageFlipForward.volume = 0.5;
if (pageFlipBackward) pageFlipBackward.volume = 0.5;

// Fungsi untuk memutar suara maju
function playForwardSound() {
    if (!pageFlipForward) return;
    
    try {
        pageFlipForward.currentTime = 0;
        pageFlipForward.play().catch(error => {
            console.log('Forward audio playback prevented:', error);
            createFallbackSound('forward');
        });
    } catch (error) {
        console.log('Error playing forward sound:', error);
        createFallbackSound('forward');
    }
}

// Fungsi untuk memutar suara mundur
function playBackwardSound() {
    if (!pageFlipBackward) return;
    
    try {
        pageFlipBackward.currentTime = 0;
        pageFlipBackward.play().catch(error => {
            console.log('Backward audio playback prevented:', error);
            createFallbackSound('backward');
        });
    } catch (error) {
        console.log('Error playing backward sound:', error);
        createFallbackSound('backward');
    }
}

// Fallback sound effect
function createFallbackSound(direction) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Frekuensi berbeda untuk maju dan mundur
        if (direction === 'forward') {
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);
        } else {
            oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
        }
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

/*********************
* TRACK PAGE STATES *
*********************/

// Simpan state sebelumnya dari setiap checkbox
let previousStates = {};

// Inisialisasi state awal
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    previousStates[checkbox.id] = checkbox.checked;
});

/*********************
* ENHANCED FLIP EFFECTS *
*********************/

// Dapatkan semua checkbox dan halaman
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const pages = document.querySelectorAll('.page');
const frontCover = document.querySelector('.front_cover');

// Tambahkan efek drag saat checkbox berubah
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
        const pageId = this.id.replace('_checkbox', '');
        const pageElement = pageId === 'cover' ? frontCover : document.getElementById(pageId);
        
        // Tentukan apakah ini maju (checked) atau mundur (unchecked)
        const isForward = this.checked;
        const wasForward = previousStates[this.id];
        
        // Update state sebelumnya
        previousStates[this.id] = this.checked;
        
        // Putar suara yang sesuai
        if (isForward) {
            playForwardSound();
        } else {
            playBackwardSound();
        }
        
        if (pageElement) {
            // Tambahkan class dragging untuk efek khusus
            pageElement.classList.add('dragging');
            
            // Hapus class setelah animasi selesai
            setTimeout(() => {
                pageElement.classList.remove('dragging');
            }, 700);
            
            // Untuk efek visual tambahan di halaman berikutnya (saat maju)
            if (isForward && pageId !== 'cover') {
                const currentPageNum = parseInt(pageId.replace('page', ''));
                if (currentPageNum < 7) {
                    const nextPage = document.getElementById(`page${currentPageNum + 1}`);
                    if (nextPage) {
                        nextPage.style.zIndex = Math.max(parseInt(nextPage.style.zIndex || 0), 20);
                        setTimeout(() => {
                            nextPage.style.zIndex = '';
                        }, 700);
                    }
                }
            }
        }
        
        // Log untuk debugging
        console.log(`${pageId}: ${wasForward ? 'OPENED' : 'CLOSED'} -> ${isForward ? 'OPENING' : 'CLOSING'}`);
    });
});

/*********************
* RESPONSIVE WARNING *
*********************/

const responsiveWarning = document.getElementById("responsive-warning");
const responsiveDesign = true; // Ubah jadi true agar bisa dibuka di HP

if (!responsiveDesign && window.innerWidth <= 768) {
    if(responsiveWarning) responsiveWarning.classList.add("show");
}

window.addEventListener('resize', function() {
    if (!responsiveDesign && window.innerWidth <= 768) {
        if(responsiveWarning) responsiveWarning.classList.add("show");
    } else {
        if(responsiveWarning) responsiveWarning.classList.remove("show");
    }
});

/***********************
* MODE TOGGLE BEHAVIOR *
***********************/

const toggleModeBtn = document.getElementById("toggle-mode-btn");
const body = document.body;

function applyMode(mode) {
    body.classList.remove("light-mode", "dark-mode");
    body.classList.add(mode);

    if (mode === "dark-mode") {
        toggleModeBtn.style.color = "rgb(245, 245, 245)";
        toggleModeBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';

        if(responsiveWarning) responsiveWarning.style.backgroundColor = "rgb(2, 4, 8)";
    } else {
        toggleModeBtn.style.color = "rgb(2, 4, 8)";
        toggleModeBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';

        if(responsiveWarning) responsiveWarning.style.backgroundColor = "rgb(245, 245, 245)";
    }
}

let savedMode = localStorage.getItem("mode");
if (savedMode === null) {
    savedMode = "light-mode";
}
applyMode(savedMode);

toggleModeBtn.addEventListener("click", function () {
    let newMode;
    if (body.classList.contains("light-mode")) {
        newMode = "dark-mode";
    } else {
        newMode = "light-mode";
    }
    applyMode(newMode);
    localStorage.setItem("mode", newMode);
});

/*********************
* TOUCH SUPPORT WITH DRAG *
*********************/

// Variabel untuk tracking drag
let isDragging = false;
let startX = 0;
let currentCheckbox = null;

// Untuk desktop: efek klik dan drag
pages.forEach(page => {
    page.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        
        // Cari checkbox terkait halaman ini
        const pageId = this.id;
        currentCheckbox = document.getElementById(`${pageId}_checkbox`);
        
        // Tambahkan class dragging segera
        if (currentCheckbox) {
            const pageElement = document.getElementById(pageId);
            if (pageElement) pageElement.classList.add('dragging');
        }
    });
});

frontCover.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    currentCheckbox = document.getElementById('cover_checkbox');
    this.classList.add('dragging');
});

// Track mouse movement untuk efek drag yang lebih halus
document.addEventListener('mousemove', function(e) {
    if (!isDragging || !currentCheckbox) return;
    
    const deltaX = e.clientX - startX;
    const pageElement = currentCheckbox.id === 'cover_checkbox' ? 
        frontCover : document.getElementById(currentCheckbox.id.replace('_checkbox', ''));
    
    if (pageElement) {
        // Efek drag visual (hanya visual, tidak mengubah state)
        if (deltaX > 0 && !currentCheckbox.checked) {
            // Sedang ditarik untuk membuka
            const progress = Math.min(deltaX / 100, 1);
            pageElement.style.transform = `rotateY(${-180 * progress}deg) translateX(${-10 * progress}px)`;
        } else if (deltaX < 0 && currentCheckbox.checked) {
            // Sedang ditarik untuk menutup
            const progress = Math.min(-deltaX / 100, 1);
            pageElement.style.transform = `rotateY(${-180 + (180 * progress)}deg) translateX(${-10 + (10 * progress)}px)`;
        }
    }
});

// Saat mouse dilepas
document.addEventListener('mouseup', function(e) {
    if (!isDragging || !currentCheckbox) return;
    
    const deltaX = e.clientX - startX;
    const threshold = 30; // Minimum drag distance untuk trigger
    
    // Reset transform style
    const pageElement = currentCheckbox.id === 'cover_checkbox' ? 
        frontCover : document.getElementById(currentCheckbox.id.replace('_checkbox', ''));
    
    if (pageElement) {
        pageElement.style.transform = '';
    }
    
    // Tentukan aksi berdasarkan arah drag
    if (deltaX > threshold && !currentCheckbox.checked) {
        // Drag ke kanan untuk membuka
        currentCheckbox.checked = true;
        currentCheckbox.dispatchEvent(new Event('change'));
    } else if (deltaX < -threshold && currentCheckbox.checked) {
        // Drag ke kiri untuk menutup
        currentCheckbox.checked = false;
        currentCheckbox.dispatchEvent(new Event('change'));
    }
    
    // Reset
    isDragging = false;
    currentCheckbox = null;
    
    // Hapus class dragging
    if (pageElement) {
        pageElement.classList.remove('dragging');
    }
});

// Juga tambahkan touch support untuk mobile
let touchStartX = 0;
let touchCurrentCheckbox = null;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    
    // Cari elemen yang disentuh
    const touchElement = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
    );
    
    // Cari checkbox terkait
    if (touchElement.closest('.front_cover')) {
        touchCurrentCheckbox = document.getElementById('cover_checkbox');
    } else if (touchElement.closest('.page')) {
        const pageId = touchElement.closest('.page').id;
        touchCurrentCheckbox = document.getElementById(`${pageId}_checkbox`);
    }
}, false);

document.addEventListener('touchend', function(e) {
    if (!touchCurrentCheckbox) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const threshold = 50; // Threshold lebih besar untuk touch
    
    // Tentukan aksi
    if (deltaX > threshold && !touchCurrentCheckbox.checked) {
        touchCurrentCheckbox.checked = true;
        touchCurrentCheckbox.dispatchEvent(new Event('change'));
    } else if (deltaX < -threshold && touchCurrentCheckbox.checked) {
        touchCurrentCheckbox.checked = false;
        touchCurrentCheckbox.dispatchEvent(new Event('change'));
    }
    
    touchCurrentCheckbox = null;
}, false);