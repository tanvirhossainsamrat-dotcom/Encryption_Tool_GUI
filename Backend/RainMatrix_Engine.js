/**
        * ==========================================
        * WEBGL MATRIX RAIN EFFECT (Three.js)
        * ==========================================
        * High-performance background effect running via GPU shaders instead of Canvas 2D.
        */
let matrixColor = '#00E5FF';
let matrixStarted = false;
let matrixEnabled = true;
let matrixFpsCap = 0;
let lastMatrixFrameTime = 0;
let matrixScene, matrixCamera, matrixRenderer, matrixMaterial;
let matrixClock = new THREE.Clock();

// 1. Generate a texture map (spritesheet) of characters to feed to the shader
function createMatrixAtlas() {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512; const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 512, 512); ctx.fillStyle = '#fff'; ctx.font = '24px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%#&_'.split('');
    for (let i = 0; i < 256; i++) { let x = (i % 16) * 32 + 16; let y = Math.floor(i / 16) * 32 + 16; ctx.fillText(chars[i % chars.length], x, y); }
    const texture = new THREE.CanvasTexture(canvas); texture.minFilter = THREE.NearestFilter; texture.magFilter = THREE.NearestFilter; return texture;
}



// 3. Render loop
function animateWebGLMatrix(time) {
    requestAnimationFrame(animateWebGLMatrix);
    if (!introCompleted || !matrixEnabled) return;
    // Frame rate capping logic
    if (matrixFpsCap > 0) { const elapsed = time - lastMatrixFrameTime; const msPerFrame = 1000 / matrixFpsCap; if (elapsed < msPerFrame) return; lastMatrixFrameTime = time - (elapsed % msPerFrame); }

    // Pass updated time and color (from current tab) into shader
    matrixMaterial.uniforms.u_time.value = matrixClock.getElapsedTime(); matrixMaterial.uniforms.u_color.value.set(matrixColor); matrixRenderer.render(matrixScene, matrixCamera);
}

function runMatrixEngine() {
    if (introCompleted && !matrixStarted) { initWebGLMatrix(); updateMatrixSettings(); matrixStarted = true; matrixClock.start(); requestAnimationFrame(animateWebGLMatrix); }
    else if (!introCompleted) { requestAnimationFrame(runMatrixEngine); }
}
requestAnimationFrame(runMatrixEngine);

// Handle window resizing for WebGL
window.addEventListener('resize', () => { if (matrixRenderer) { matrixRenderer.setSize(window.innerWidth, window.innerHeight); matrixMaterial.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight); } });
