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

    // Stop any playing audio when language changes
    stopAllAudio();
}

// ============================================================
// 2. PLAY AUDIO FILE
// ============================================================
let currentAudio = null;
let isAudioPlaying = false;
let currentSlideId = null;

/**
 * មុខងារសម្រាប់លេងសំឡេងពី Audio File
 */
function speakSlide(slideId) {
    // ប្រសិនបើកំពុងលេងសំឡេងដដែល បញ្ឈប់
    if (currentSlideId === slideId && isAudioPlaying) {
        stopAllAudio();
        return;
    }

    // បញ្ឈប់សំឡេងចាស់ប្រសិនបើមាន
    stopAllAudio();

    // ពិនិត្យមើលថាមានឯកសារសំឡេងឬអត់
    const audioElement = document.getElementById('audio-' + slideId);
    if (!audioElement) {
        console.warn('⚠️ No audio file found for slide:', slideId);
        const isKhmer = document.getElementById(slideId).classList.contains('lang-km-mode');
        alert(isKhmer ? 'មិនមានឯកសារសំឡេងសម្រាប់ Slide នេះទេ!' : 'No audio file found for this slide!');
        return;
    }

    // កំណត់អត្តសញ្ញាណ
    currentSlideId = slideId;
    currentAudio = audioElement;
    isAudioPlaying = true;

    // ធ្វើបច្ចុប្បន្នភាពប៊ូតុង
    updateAudioButton(slideId, true);

    // លេងសំឡេង
    audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        isAudioPlaying = false;
        updateAudioButton(slideId, false);
        alert('មានបញ្ហាក្នុងការលេងឯកសារសំឡេង! សូមពិនិត្យមើលឯកសារ។');
    });

    // ពេលលេងចប់
    audioElement.onended = function() {
        isAudioPlaying = false;
        updateAudioButton(slideId, false);
        currentAudio = null;
        currentSlideId = null;
    };

    // ពេលមានកំហុស
    audioElement.onerror = function() {
        isAudioPlaying = false;
        updateAudioButton(slideId, false);
        currentAudio = null;
        currentSlideId = null;
        alert('មានបញ្ហាក្នុងការលេងឯកសារសំឡេង!');
    };
}

/**
 * មុខងារសម្រាប់បញ្ឈប់សំឡេងទាំងអស់
 */
function stopAllAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    isAudioPlaying = false;
    
    // ធ្វើបច្ចុប្បន្នភាពប៊ូតុងទាំងអស់
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.classList.remove('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-volume-high';
        const span = btn.querySelector('span');
        if (span) {
            const container = btn.closest('.slide-container');
            const isKhmer = container ? container.classList.contains('lang-km-mode') : true;
            span.textContent = isKhmer ? 'ស្តាប់' : 'Listen';
        }
    });
    currentSlideId = null;
}

// ============================================================
// 3. UPDATE AUDIO BUTTON
// ============================================================
function updateAudioButton(slideId, playing) {
    // Map slide ID to button ID
    let btnId = 'audio-btn-' + slideId.replace('slide', '').replace('_benefits', '10');
    const btn = document.getElementById(btnId);
    
    if (!btn) {
        btnId = 'audio-btn-' + slideId;
        const btnAlt = document.getElementById(btnId);
        if (btnAlt) {
            updateButtonUI(btnAlt, playing, slideId);
        }
        return;
    }
    
    updateButtonUI(btn, playing, slideId);
}

function updateButtonUI(btn, playing, slideId) {
    if (playing) {
        btn.classList.add('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-stop';
        const span = btn.querySelector('span');
        if (span) {
            const container = document.getElementById(slideId);
            const isKhmer = container ? container.classList.contains('lang-km-mode') : true;
            span.textContent = isKhmer ? 'បញ្ឈប់' : 'Stop';
        }
    } else {
        btn.classList.remove('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-volume-high';
        const span = btn.querySelector('span');
        if (span) {
            const container = document.getElementById(slideId);
            const isKhmer = container ? container.classList.contains('lang-km-mode') : true;
            span.textContent = isKhmer ? 'ស្តាប់' : 'Listen';
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
        const activeSlide = document.querySelector('.slide-container.lang-km-mode, .slide-container.lang-en-mode');
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
console.log('📁 Please place audio files in the "audio" folder:');
console.log('   audio/slide1.mp3, audio/slide2.mp3, ...');
console.log('⌨️ Press Space bar to play/stop audio on current slide');

// ពិនិត្យ Audio Files ដែលមាន
document.addEventListener('DOMContentLoaded', function() {
    const audioElements = document.querySelectorAll('audio');
    console.log(`🎵 Found ${audioElements.length} audio elements`);
    audioElements.forEach((audio, index) => {
        console.log(`   ${index + 1}. ${audio.id || 'unnamed'}`);
    });
});