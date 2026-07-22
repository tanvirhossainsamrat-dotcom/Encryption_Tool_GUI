/**
 * ==========================================
 * EXIT & APPLICATION LIFECYCLE
 * ==========================================
 */
function triggerExit() {
    document.getElementById('app-container').classList.add('blurred');
    matrixColor = '#E63946'; // Turn matrix red to signify danger/exit
    const overlay = document.getElementById('exit-modal-overlay');
    overlay.style.display = 'flex';
    void overlay.offsetWidth;
    overlay.classList.add('show');
}
function cancelExit() {
    document.getElementById('app-container').classList.remove('blurred');
    // Restore matrix color to current tab's active color
    let currentTabColor = document.querySelector('.nav-btn.active').style.borderLeftColor || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    matrixColor = currentTabColor;
    const overlay = document.getElementById('exit-modal-overlay');
    overlay.classList.remove('show');
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
}
function closeApp() {
    // Call Python eel function to safely close backend before closing window
    try { eel.close_python(); } catch (e) { }
    setTimeout(() => { window.close(); }, 100);
}
