/*********************
* PAGE FLIP SOUND *
*********************/

// Buat elemen audio untuk efek suara (fallback jika HTML audio tidak berfungsi)
const pageFlipSound = document.getElementById('page-flip-sound') || (function() {
    const audio = new Audio();
    audio.src = 'assets/images/audio/mixkit-page-turn-single-1104.wav';
    audio.preload = 'auto';
    return audio;
})();

// Pastikan audio siap
if (pageFlipSound) {
    pageFlipSound.volume = 0.5; // Atur volume (0.0 - 1.0)
}

// Fungsi untuk memutar suara membalik halaman
function playFlipSound() {
    if (!pageFlipSound) return;
    
    try {
        // Reset audio ke awal
        pageFlipSound.currentTime = 0;
        
        // Mainkan suara
        pageFlipSound.play().catch(error => {
            console.log('Audio playback prevented:', error);
            // Fallback: buat efek suara sederhana dengan Web Audio API
            createFallbackSound();
        });
    } catch (error) {
        console.log('Error playing flip sound:', error);
        createFallbackSound();
    }
}

// Fallback sound effect menggunakan Web Audio API
function createFallbackSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

/*********************
* ENHANCED FLIP EFFECTS *
*********************/

// Dapatkan semua checkbox dan halaman
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const pages = document.querySelectorAll('.page');
const frontCover = document.querySelector('.front_cover');

// Tambahkan class flipping saat halaman akan dibalik
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
        if (this.checked) {
            // Mainkan suara membalik halaman
            playFlipSound();
            
            // Tambahkan efek visual untuk halaman yang sedang dibalik
            const pageId = this.id.replace('_checkbox', '');
            const pageElement = document.getElementById(pageId);
            
            if (pageElement) {
                // Tambahkan class flipping untuk efek khusus
                pageElement.classList.add('flipping');
                
                // Hapus class setelah animasi selesai
                setTimeout(() => {
                    pageElement.classList.remove('flipping');
                }, 800); // Sesuai dengan durasi transisi CSS
            }
            
            // Untuk cover depan
            if (this.id === 'cover_checkbox' && frontCover) {
                frontCover.classList.add('flipping');
                setTimeout(() => {
                    frontCover.classList.remove('flipping');
                }, 1500);
            }
        }
    });
});

/*********************
* RESPONSIVE WARNING *
*********************/

const responsiveWarning = document.getElementById("responsive-warning");
const responsiveDesign = true; // Ubah jadi true agar bisa dibuka di HP

// Show mobile warning if the user is on mobile and responsive-design is false.
if (!responsiveDesign && window.innerWidth <= 768) {
    if(responsiveWarning) responsiveWarning.classList.add("show");
}

// Tambahkan event listener untuk resize
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

// Get elements that change with the mode.
const toggleModeBtn = document.getElementById("toggle-mode-btn");
const body = document.body;

// Function to apply mode.
function applyMode(mode) {
    body.classList.remove("light-mode", "dark-mode");
    body.classList.add(mode);

    if (mode === "dark-mode") {
        // Set dark mode styles.
        toggleModeBtn.style.color = "rgb(245, 245, 245)";
        toggleModeBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';

        if(responsiveWarning) responsiveWarning.style.backgroundColor = "rgb(2, 4, 8)";
    } else {
        // Set light mode styles.
        toggleModeBtn.style.color = "rgb(2, 4, 8)";
        toggleModeBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';

        if(responsiveWarning) responsiveWarning.style.backgroundColor = "rgb(245, 245, 245)";
    }
}

// Check and apply saved mode on page load
let savedMode = localStorage.getItem("mode");

if (savedMode === null) {
    savedMode = "light-mode"; // Default mode.
}
applyMode(savedMode);

// Toggle mode and save preference.
toggleModeBtn.addEventListener("click", function () {
    let newMode;

    if (body.classList.contains("light-mode")) {
        newMode = "dark-mode";
    } else {
        newMode = "light-mode";
    }

    applyMode(newMode);

    // Save choice.
    localStorage.setItem("mode", newMode);
});

/*********************
* TOUCH SUPPORT *
*********************/

// Tambahkan support untuk touch devices
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 50; // Minimum swipe distance
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe kiri - cari checkbox yang belum dicentang
        const uncheckedCheckboxes = Array.from(checkboxes).filter(cb => !cb.checked);
        if (uncheckedCheckboxes.length > 0) {
            uncheckedCheckboxes[0].checked = true;
            uncheckedCheckboxes[0].dispatchEvent(new Event('change'));
        }
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe kanan - cari checkbox yang sudah dicentang (untuk kembali)
        const checkedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked);
        if (checkedCheckboxes.length > 0) {
            const lastChecked = checkedCheckboxes[checkedCheckboxes.length - 1];
            lastChecked.checked = false;
            lastChecked.dispatchEvent(new Event('change'));
        }
    }
}