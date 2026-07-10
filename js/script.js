// ============================================================
// 1. LANGUAGE SWITCH FUNCTION
// ============================================================
function switchLang(lang) {
    const containers = document.querySelectorAll('.slide-container');
    containers.forEach(container => {
        container.classList.remove('lang-km-mode', 'lang-en-mode');
        if (lang === 'en') {
            container.classList.add('lang-en-mode');
        } else {
            container.classList.add('lang-km-mode');
        }
    });

    const allButtons = document.querySelectorAll('.lang-btn');
    allButtons.forEach(btn => {
        if (lang === 'en') {
            if (btn.classList.contains('en-btn')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        } else {
            if (btn.classList.contains('km-btn')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // Automatically update UI text for the currently playing audio button if any
    if (isAudioPlaying && currentSlideId) {
        updateAudioButton(currentSlideId, true);
    } else if (currentSlideId) {
        updateAudioButton(currentSlideId, false);
    }
}

// ============================================================
// 2. PLAY AUDIO FILE
// ============================================================
let currentAudio = null;
let isAudioPlaying = false;
let currentSlideId = null;

function speakSlide(slideId) {
    // If clicking the same slide that is currently playing, stop it
    if (currentSlideId === slideId && isAudioPlaying) {
        stopAllAudio();
        return;
    }

    // Stop any old audio
    stopAllAudio();

    // Check if audio element exists
    const audioElement = document.getElementById('audio-' + slideId);
    if (!audioElement) {
        console.warn('⚠️ No audio file found for slide:', slideId);
        const container = document.getElementById(slideId);
        const isKhmer = container ? container.classList.contains('lang-km-mode') : true;
        alert(isKhmer ? 'មិនមានឯកសារសំឡេងសម្រាប់ Slide នេះទេ!' : 'No audio file found for this slide!');
        return;
    }

    // Set current audio
    currentSlideId = slideId;
    currentAudio = audioElement;
    isAudioPlaying = true;

    // Update button
    updateAudioButton(slideId, true);

    // Play audio
    audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        isAudioPlaying = false;
        updateAudioButton(slideId, false);
        alert('មានបញ្ហាក្នុងការលេងឯកសារសំឡេង! សូមពិនិត្យមើលឯកសារ។');
    });

    // When audio ends
    audioElement.onended = function() {
        isAudioPlaying = false;
        updateAudioButton(slideId, false);
        currentAudio = null;
        currentSlideId = null;
    };

    // When error occurs
    audioElement.onerror = function() {
        isAudioPlaying = false;
        updateAudioButton(slideId, false);
        currentAudio = null;
        currentSlideId = null;
        alert('មានបញ្ហាក្នុងការលេងឯកសារសំឡេង!');
    };
}

function stopAllAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    isAudioPlaying = false;
    
    // Update all audio buttons
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.classList.remove('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-volume-high';
        
        const container = btn.closest('.slide-container');
        const isKhmer = container ? container.classList.contains('lang-km-mode') : true;
        
        // Update specific text spans if they exist inside button
        const spans = btn.querySelectorAll('span[data-lang]');
        if (spans.length === 0) {
            const span = btn.querySelector('span');
            if (span) span.textContent = isKhmer ? 'ស្តាប់' : 'Listen';
        }
    });
    currentSlideId = null;
}

// ============================================================
// 3. UPDATE AUDIO BUTTON (supports .top-controls & .slide-controls)
// ============================================================
function updateAudioButton(slideId, playing) {
    const container = document.getElementById(slideId);
    if (!container) return;
    
    // Try to find button in multiple locations
    let btn = container.querySelector('.audio-btn');
    if (!btn) {
        const controls = container.querySelector('.slide-controls');
        if (controls) {
            btn = controls.querySelector('.audio-btn');
        }
    }
    if (!btn) {
        const topControls = container.querySelector('.top-controls');
        if (topControls) {
            btn = topControls.querySelector('.audio-btn');
        }
    }
    
    if (btn) {
        updateButtonUI(btn, playing, slideId);
    }
}

function updateButtonUI(btn, playing, slideId) {
    const container = document.getElementById(slideId);
    const isKhmer = container ? container.classList.contains('lang-km-mode') : true;

    if (playing) {
        btn.classList.add('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-stop';
        
        const spanKm = btn.querySelector('span[data-lang="km"]');
        const spanEn = btn.querySelector('span[data-lang="en"]');
        
        if (spanKm && spanEn) {
            spanKm.textContent = 'បញ្ឈប់';
            spanEn.textContent = 'Stop';
        } else {
            const span = btn.querySelector('span');
            if (span) span.textContent = isKhmer ? 'បញ្ឈប់' : 'Stop';
        }
    } else {
        btn.classList.remove('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-volume-high';
        
        const spanKm = btn.querySelector('span[data-lang="km"]');
        const spanEn = btn.querySelector('span[data-lang="en"]');
        
        if (spanKm && spanEn) {
            spanKm.textContent = 'ស្តាប់';
            spanEn.textContent = 'Listen';
        } else {
            const span = btn.querySelector('span');
            if (span) span.textContent = isKhmer ? 'ស្តាប់' : 'Listen';
        }
    }
}

// ============================================================
// 4. KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', function(event) {
    // Space bar: play/stop audio
    if (event.key === ' ' || event.key === 'Space') {
        event.preventDefault();
        
        let activeSlide = null;
        
        if (isAudioPlaying && currentSlideId) {
            activeSlide = document.getElementById(currentSlideId);
        } else {
            activeSlide = document.querySelector('.slide-container');
        }
        
        if (activeSlide) {
            const slideId = activeSlide.id;
            if (isAudioPlaying && currentSlideId === slideId) {
                stopAllAudio();
            } else {
                speakSlide(slideId);
            }
        }
    }
});

// ============================================================
// 5. INITIALIZATION
// ============================================================
console.log('🎵 Audio System loaded!');
console.log('⌨️ Press Space bar to play/stop audio on current slide');

document.addEventListener('DOMContentLoaded', function() {
    const audioElements = document.querySelectorAll('audio');
    console.log(`🎵 Found ${audioElements.length} audio elements`);
    
    const containers = document.querySelectorAll('.slide-container');
    containers.forEach(c => {
        if (!c.classList.contains('lang-en-mode') && !c.classList.contains('lang-km-mode')) {
            c.classList.add('lang-km-mode');
        }
    });
});

// ============================================================
// 6. SCROLL ANIMATION - Intersection Observer
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll(
        '.step-card, .pillar-card, ' +
        '.profile-card-modern, .checklist-item, .table-layout tbody tr'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
    });

    animateElements.forEach(el => {
        observer.observe(el);
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    document.addEventListener('visibilitychange', () => {
        animateElements.forEach(el => {
            if (el.classList.contains('visible')) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });
});

console.log('✨ Animations loaded successfully!');

// ============================================================
// 7. CHECK AUDIO FILES ON LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const audioElements = document.querySelectorAll('audio');
    console.log(`🎵 Found ${audioElements.length} audio elements`);
    
    audioElements.forEach(audio => {
        const src = audio.querySelector('source');
        if (src) {
            console.log(`📁 Audio file: ${src.src}`);
            fetch(src.src, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        console.log(`✅ Audio file exists: ${src.src}`);
                    } else {
                        console.warn(`⚠️ Audio file NOT FOUND: ${src.src}`);
                    }
                })
                .catch(err => {
                    console.error(`❌ Error checking audio: ${src.src}`, err);
                });
        }
    });
});