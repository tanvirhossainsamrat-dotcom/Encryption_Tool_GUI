/**
 * ==========================================
 * MATRIX SETTINGS PAGE LOGIC
 * ==========================================
 */
function updateMatrixSettings() {
    const scale = parseFloat(document.getElementById('matrix-scale').value); const speed = parseFloat(document.getElementById('matrix-speed').value);
    const trail = parseFloat(document.getElementById('matrix-trail').value); const fpsEl = document.getElementById('matrix-fps'); const fpsVal = fpsEl ? parseInt(fpsEl.value) : 165;

    // Update labels visually
    document.getElementById('val-scale').innerText = scale; document.getElementById('val-speed').innerText = speed.toFixed(1); document.getElementById('val-trail').innerText = trail.toFixed(1);
    if (fpsVal >= 165) { if (document.getElementById('val-fps')) document.getElementById('val-fps').innerText = "Unlocked"; matrixFpsCap = 0; }
    else { if (document.getElementById('val-fps')) document.getElementById('val-fps').innerText = fpsVal; matrixFpsCap = fpsVal; }

    // Pass new parameters to shader
    if (matrixMaterial) { matrixMaterial.uniforms.u_fontSize.value = scale; matrixMaterial.uniforms.u_speedMult.value = speed; matrixMaterial.uniforms.u_trailLen.value = trail; }
}

function toggleMatrix() {
    matrixEnabled = !matrixEnabled; const container = document.getElementById('matrix-toggle-container'); const label = document.getElementById('matrix-toggle-label');
    if (matrixEnabled) { container.classList.add('toggle-active'); if (label) { label.innerText = "Active"; label.style.color = "#fff"; } document.getElementById('matrix-canvas').style.opacity = "1"; }
    else { container.classList.remove('toggle-active'); if (label) { label.innerText = "Paused"; label.style.color = "#A0A0A0"; } document.getElementById('matrix-canvas').style.opacity = "0"; }
}

function resetMatrixSettings() {
    document.getElementById('matrix-scale').value = 18; document.getElementById('matrix-speed').value = 2.5; document.getElementById('matrix-trail').value = 1.2;
    if (document.getElementById('matrix-fps')) document.getElementById('matrix-fps').value = 165;
    if (!matrixEnabled) toggleMatrix(); updateMatrixSettings();
}

// Save preferences to LocalStorage AND try to save via Python Eel if available
async function saveMatrixSettings() {
    const settings = {
        scale: parseFloat(document.getElementById('matrix-scale').value), speed: parseFloat(document.getElementById('matrix-speed').value),
        trail: parseFloat(document.getElementById('matrix-trail').value), fps: document.getElementById('matrix-fps') ? parseInt(document.getElementById('matrix-fps').value) : 165,
        enabled: matrixEnabled
    };

    localStorage.setItem('matrix_settings_v1', JSON.stringify(settings));
    const btn = document.getElementById('save-settings-btn');
    if (btn) btn.innerText = "Saving...";

    try {
        if (typeof eel !== 'undefined' && eel.save_matrix_config) { await eel.save_matrix_config(settings)(); }
        if (btn) {
            btn.innerText = "Saved"; btn.style.color = "var(--accent)"; btn.style.borderColor = "var(--accent)";
            setTimeout(() => { btn.innerText = "Save Preferences"; btn.style.color = ""; btn.style.borderColor = ""; }, 1500);
        }
    } catch (err) {
        if (btn) {
            btn.innerText = "Error"; btn.style.color = "var(--danger)"; btn.style.borderColor = "var(--danger)";
            setTimeout(() => { btn.innerText = "Save Preferences"; btn.style.color = ""; btn.style.borderColor = ""; }, 2000);
        }
    }
}

async function loadMatrixSettings() {
    let saved = null;
    const localSaved = localStorage.getItem('matrix_settings_v1');
    if (localSaved) { try { saved = JSON.parse(localSaved); } catch (e) { } }
    try {
        if (typeof eel !== 'undefined' && eel.load_matrix_config) { const eelSaved = await eel.load_matrix_config()(); if (eelSaved && !eelSaved.error) { saved = eelSaved; } }
    } catch (e) { }

    if (saved) {
        document.getElementById('matrix-scale').value = saved.scale || 12; document.getElementById('matrix-speed').value = saved.speed || 1.0; document.getElementById('matrix-trail').value = saved.trail || 1.0;
        if (document.getElementById('matrix-fps') && saved.fps) { document.getElementById('matrix-fps').value = saved.fps; }
        if (saved.enabled !== undefined && saved.enabled !== matrixEnabled) { toggleMatrix(); }
        updateMatrixSettings();
    }
}