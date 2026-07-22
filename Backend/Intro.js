/**
        * ==========================================
        * BOOT SEQUENCE AUDIO & LOGIC
        * ==========================================
        * Uses Web Audio API to dynamically generate sounds instead of loading heavy MP3 files.
        */
let bootTimeouts = []; let introCompleted = false;
function setBootTimeout(fn, delay) { let id = setTimeout(fn, delay); bootTimeouts.push(id); return id; }

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain(); masterGain.gain.value = 0.60; masterGain.connect(audioCtx.destination);

// Generates white noise through a lowpass filter to sound like "burning sparks"
let burningGain;
function playBurningSizzle() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 8; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
    const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 500;
    burningGain = audioCtx.createGain(); burningGain.gain.setValueAtTime(0, audioCtx.currentTime); burningGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 0.5);
    noise.connect(filter); filter.connect(burningGain); burningGain.connect(masterGain); noise.start();
}
function stopBurningSizzle() { if (burningGain) { burningGain.gain.setValueAtTime(burningGain.gain.value, audioCtx.currentTime); burningGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8); } }

// Orchestral synthesizer sound using multiple oscillators
function playGrandCinematicIntro() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const drum = audioCtx.createOscillator(); drum.type = 'square'; drum.frequency.value = 35;
    const drumGain = audioCtx.createGain(); drumGain.gain.setValueAtTime(0, audioCtx.currentTime); drumGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 2.0); drumGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6.0);
    const drumFilter = audioCtx.createBiquadFilter(); drumFilter.type = 'lowpass'; drumFilter.frequency.value = 100;
    drum.connect(drumFilter); drumFilter.connect(drumGain); drumGain.connect(masterGain); drum.start(); drum.stop(audioCtx.currentTime + 6.0);

    // Generate a C Major chord to sound "grand"
    const chordFreqs = [65.41, 130.81, 196.00, 261.63, 329.63, 392.00, 523.25];
    chordFreqs.forEach((freq, index) => {
        const osc = audioCtx.createOscillator(); osc.type = index % 2 === 0 ? 'sawtooth' : 'square'; osc.frequency.value = freq;
        const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(100, audioCtx.currentTime); filter.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 4.0);
        const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2.0 + (index * 0.05)); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 6.5);
        osc.connect(filter); filter.connect(gain); gain.connect(masterGain); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 7.0);
    });
}

// Bleeps and bloops for the loading screen
let hackingInterval;
function playHighPitchHacking() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    hackingInterval = setInterval(() => {
        const osc = audioCtx.createOscillator(); osc.type = 'square'; osc.frequency.value = 2500 + Math.random() * 2000;
        const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0.02, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.connect(gain); gain.connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }, 30);
}
function stopHighPitchHacking() { clearInterval(hackingInterval); }

/**
 * 2D CANVAS ANIMATIONS
 * Sparks for Scene 1 and Snow for Scene 2.
 * Time-step (dt) calculation is used to decouple physics speed from monitor refresh rate.
 */
const sCanvas = document.getElementById('sparks-canvas'); const sCtx = sCanvas.getContext('2d'); let sparks = []; let sparksActive = false;
function resizeSparks() { sCanvas.width = window.innerWidth; sCanvas.height = window.innerHeight; } window.addEventListener('resize', resizeSparks); resizeSparks();
class Spark {
    constructor() {
        this.x = Math.random() * sCanvas.width; this.y = sCanvas.height + Math.random() * 100;
        this.size = Math.random() * 5 + 1.5;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * -12 - 6;
        this.life = 1; this.decay = Math.random() * 0.02 + 0.005;
    }
    draw() { sCtx.beginPath(); sCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2); sCtx.fillStyle = `rgba(255, ${Math.random() * 150 + 50}, 0, ${this.life})`; sCtx.shadowBlur = 15; sCtx.shadowColor = "#FF4500"; sCtx.fill(); }
}

const APP_MAX_FPS = 100;
const frameInterval = 1000 / APP_MAX_FPS;

let lastSparkTime = performance.now();
function animateSparks(time) {
    if (!sparksActive) { lastSparkTime = time; return; }
    requestAnimationFrame(animateSparks);

    let dt = time - lastSparkTime;
    if (dt >= frameInterval) {
        lastSparkTime = time - (dt % frameInterval);
        if (dt > 50) dt = 16.66; // Fallback to 60fps equivalent if tab was inactive to prevent physics jumps
        let ts = dt / 16.66; // Time scale modifier

        sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
        for (let i = 0; i < 2; i++) { sparks.push(new Spark()); }
        for (let i = 0; i < sparks.length; i++) {
            sparks[i].x += sparks[i].speedX * ts;
            sparks[i].y += sparks[i].speedY * ts;
            sparks[i].life -= sparks[i].decay * ts;
            sparks[i].draw();
            if (sparks[i].life <= 0) { sparks.splice(i, 1); i--; }
        }
    }
}

const snCanvas = document.getElementById('snow-canvas'); const snCtx = snCanvas.getContext('2d');
let snowflakes = []; let snowActive = false;
function resizeSnow() { snCanvas.width = window.innerWidth; snCanvas.height = window.innerHeight; }
window.addEventListener('resize', resizeSnow); resizeSnow();
class Snowflake {
    constructor() {
        this.x = Math.random() * snCanvas.width; this.y = Math.random() * snCanvas.height - snCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.drift = Math.random() * 2 - 1;
    }
    draw() {
        snCtx.beginPath(); snCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        snCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        snCtx.shadowBlur = 8; snCtx.shadowColor = "rgba(255,255,255,0.8)";
        snCtx.fill();
    }
}
let lastSnowTime = performance.now();
function animateSnow(time) {
    if (!snowActive) { lastSnowTime = time; return; }
    requestAnimationFrame(animateSnow);

    let dt = time - lastSnowTime;
    if (dt >= frameInterval) {
        lastSnowTime = time - (dt % frameInterval);
        if (dt > 50) dt = 16.66;
        let ts = dt / 16.66;

        snCtx.clearRect(0, 0, snCanvas.width, snCanvas.height);
        if (snowflakes.length < 250) snowflakes.push(new Snowflake());
        for (let i = 0; i < snowflakes.length; i++) {
            snowflakes[i].x += snowflakes[i].drift * ts;
            snowflakes[i].y += snowflakes[i].speed * ts;
            if (snowflakes[i].y > snCanvas.height) { snowflakes[i].y = -10; snowflakes[i].x = Math.random() * snCanvas.width; }
            snowflakes[i].draw();
        }
    }
}

// Simulates a rapid tech loading bar for Scene 3
let loadingInterval;
function runFastLoading() {
    let progress = 0; const fill = document.getElementById('ring-fill'), percent = document.getElementById('loader-percent');
    const text = document.getElementById('loader-text'), dataStream = document.getElementById('tech-data-stream'); const totalDash = 880;
    playHighPitchHacking();
    loadingInterval = setInterval(() => {
        progress += Math.random() * 1.5 + 0.5; if (progress >= 100) progress = 100;
        fill.style.strokeDashoffset = totalDash - (progress / 100) * totalDash; percent.innerText = Math.floor(progress) + '%';
        dataStream.innerHTML = `MEM: 0x${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}<br>CPU: ${Math.floor(progress)}%<br>SEC: ACTIVE`;
        if (progress > 30 && progress < 70) text.innerText = "ESTABLISHING SECURE CONNECTION...";
        if (progress >= 70 && progress < 100) text.innerText = "LOADING WORKSPACE...";
        if (progress === 100) {
            clearInterval(loadingInterval); stopHighPitchHacking(); introCompleted = true;
            text.innerText = "ACCESS GRANTED"; text.style.color = "#00E5FF"; dataStream.innerHTML = `MEM: LOCKED<br>CPU: STABLE<br>SEC: ENFORCED`;
            const bootMaster = document.getElementById("boot-master"); bootMaster.style.backgroundColor = "#000000";
            setBootTimeout(() => { bootMaster.style.opacity = "0"; setBootTimeout(() => { bootMaster.style.display = "none"; }, 1200); }, 600);
        }
    }, 25);
}

window.onload = async () => {
    await loadMatrixSettings();
    startBootSequence();
};

// Triggers the timeline for Scene 1 -> 2 -> 3
function startBootSequence() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const scene1 = document.getElementById('scene-1'), scene2 = document.getElementById('scene-2'), scene3 = document.getElementById('scene-3');

    scene1.style.opacity = '1'; sparksActive = true; requestAnimationFrame(animateSparks); playBurningSizzle(); document.getElementById('credits-text').classList.add('show');

    setBootTimeout(() => {
        scene1.style.opacity = '0'; stopBurningSizzle();
        setBootTimeout(() => {
            scene1.style.display = 'none'; sparksActive = false; sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);

            scene2.style.visibility = 'visible'; scene2.style.opacity = '1'; document.getElementById('app-title-text').classList.add('netflix-zoom');
            snowActive = true; requestAnimationFrame(animateSnow);

            playGrandCinematicIntro(); document.getElementById('uber-line-el').classList.add('draw'); document.getElementById('tech-stack-icons').classList.add('show');
        }, 800);
    }, 4200);
    setBootTimeout(() => {
        scene2.style.opacity = '0';
        setBootTimeout(() => {
            scene2.style.display = 'none'; snowActive = false; snCtx.clearRect(0, 0, snCanvas.width, snCanvas.height);
            scene3.style.visibility = 'visible'; scene3.style.opacity = '1'; runFastLoading();
        }, 800);
    }, 10500);
}

// Allows user to press Enter to skip boot
function skipIntro() {
    if (introCompleted) return; introCompleted = true; bootTimeouts.forEach(clearTimeout); clearInterval(loadingInterval); stopHighPitchHacking(); sparksActive = false; snowActive = false;
    if (audioCtx.state !== 'suspended') { masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime); masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3); }
    const bootMaster = document.getElementById("boot-master"); bootMaster.style.transition = "opacity 0.4s ease-out"; bootMaster.style.opacity = "0"; setTimeout(() => { bootMaster.style.display = "none"; }, 400);
}
