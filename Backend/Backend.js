/**
 * ==========================================
 * MODAL LOGIC (Promises/Callbacks)
 * ==========================================
 * Replaces standard browser alerts which look ugly and block the thread.
 */
let activeModalCallback = null;
function showModal(type, title, msg, placeholder = "", callback = null) {
    const overlay = document.getElementById('custom-modal-overlay');
    overlay.style.display = 'flex';
    void overlay.offsetWidth; // Force CSS reflow to trigger animation
    overlay.classList.add('show');

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-msg').innerHTML = msg;
    const input = document.getElementById('modal-input');
    const cancelBtn = document.getElementById('modal-btn-cancel');
    activeModalCallback = callback;

    // Adjust modal UI based on request type
    if (type === 'alert') { input.style.display = 'none'; cancelBtn.style.display = 'none'; }
    else if (type === 'confirm') { input.style.display = 'none'; cancelBtn.style.display = 'block'; }
    else if (type === 'input') { input.style.display = 'block'; input.placeholder = placeholder; input.value = ''; cancelBtn.style.display = 'block'; setTimeout(() => input.focus(), 100); }
}

function closeModal() {
    const overlay = document.getElementById('custom-modal-overlay');
    overlay.classList.remove('show');
    setTimeout(() => { overlay.style.display = 'none'; activeModalCallback = null; }, 300);
}

document.getElementById('modal-btn-confirm').onclick = () => {
    if (activeModalCallback) { activeModalCallback(document.getElementById('modal-input').value.trim()); }
    closeModal();
}

// Disable standard right click globally to implement custom context menus
document.addEventListener('contextmenu', e => e.preventDefault());




/**
 * ==========================================
 * CONTEXT MENUS LOGIC
 * ==========================================
 */
let isSelectMode = false; let selectedFiles = new Set(); let contextTarget = null; let contextType = null;
const bgMenu = document.getElementById('bg-context-menu'); const itemMenu = document.getElementById('item-context-menu');

// Hide menus when clicking anywhere else
document.addEventListener('click', () => {
    bgMenu.classList.remove('show'); itemMenu.classList.remove('show');
    setTimeout(() => { bgMenu.style.display = 'none'; itemMenu.style.display = 'none'; }, 200);
});

// Show appropriate context menu on right click inside the file explorer
document.getElementById('directory-list').addEventListener('contextmenu', (e) => {
    e.preventDefault(); const card = e.target.closest('.file-card');
    if (card) { // Clicked on a specific file/folder
        contextTarget = card.dataset.filename; contextType = card.dataset.type;
        bgMenu.classList.remove('show'); bgMenu.style.display = 'none';

        itemMenu.style.display = 'block';
        itemMenu.style.left = `${e.pageX}px`; itemMenu.style.top = `${e.pageY}px`;
        void itemMenu.offsetWidth; itemMenu.classList.add('show');

        // Only allow editing if it's a text file
        if (contextTarget.endsWith('.txt')) document.getElementById('ctx-edit').style.display = 'flex'; else document.getElementById('ctx-edit').style.display = 'none';
    } else { // Clicked on empty background
        itemMenu.classList.remove('show'); itemMenu.style.display = 'none';

        bgMenu.style.display = 'block';
        bgMenu.style.left = `${e.pageX}px`; bgMenu.style.top = `${e.pageY}px`;
        void bgMenu.offsetWidth; bgMenu.classList.add('show');
    }
});


/**
 * ==========================================
 * FILE EXPLORER & NOTEPAD (Eel Integration)
 * ==========================================
 */
let isEditingFile = false;

// Open blank notepad
function openNotepad() {
    isEditingFile = false;
    document.getElementById('doc-gallery-view').style.display = 'none'; document.getElementById('doc-viewer-frame').style.display = 'none';
    document.getElementById('doc-notepad-view').style.display = 'flex';
    document.getElementById('notepad-title').value = ''; document.getElementById('notepad-content').value = '';
    document.getElementById('notepad-title').readOnly = false; document.getElementById('notepad-title').focus();
}

// Fetch file content via Python (Eel) and load into notepad
async function editVaultedNote(filename) {
    try {
        const res = await eel.read_vaulted_file(filename, currentPath)();
        if (res.error) { showModal('alert', 'Error', res.error); return; }
        isEditingFile = true;
        document.getElementById('doc-gallery-view').style.display = 'none'; document.getElementById('doc-viewer-frame').style.display = 'none';
        document.getElementById('doc-notepad-view').style.display = 'flex';
        document.getElementById('notepad-title').value = filename; document.getElementById('notepad-title').readOnly = true;
        document.getElementById('notepad-content').value = decodeURIComponent(escape(atob(res.data))); document.getElementById('notepad-content').focus();
    } catch (e) { showModal('alert', 'Error', 'Failed to read note.'); }
}

function closeNotepad() {
    document.getElementById('doc-notepad-view').style.display = 'none';
    if (isEditingFile && currentlyViewingFile) {
        document.getElementById('doc-viewer-frame').style.display = 'flex';
    } else {
        document.getElementById('doc-gallery-view').style.display = 'flex';
    }
    isEditingFile = false;
}

// Save notepad content back to filesystem using Python Eel
async function saveNotepadNote() {
    const btn = document.getElementById('save-note-btn');
    try {
        let titleInput = document.getElementById('notepad-title');
        let title = titleInput.value.trim();
        const content = document.getElementById('notepad-content').value;

        if (!title) {
            titleInput.style.borderBottom = "1px solid var(--danger)";
            titleInput.placeholder = "Title is required";
            setTimeout(() => {
                titleInput.style.borderBottom = "none";
                titleInput.placeholder = "Name your note (e.g. secret.txt)";
            }, 2000);
            return;
        }

        if (!title.includes('.')) title += '.txt'; // Auto append .txt if missing

        btn.innerText = "Saving...";

        // Determine if we are updating an existing file or creating a new one
        let res = isEditingFile ? await eel.save_vaulted_file(title, currentPath, content)() : await eel.create_vault_file(title, currentPath, content)();

        if (res && res.includes && res.includes('Error')) {
            btn.innerText = "Error";
            btn.style.color = "var(--danger)";
            setTimeout(() => { btn.innerText = "Save"; btn.style.color = ""; }, 2000);
        }
        else {
            btn.innerText = "Saved";
            btn.style.color = "var(--accent)";
            setTimeout(() => {
                btn.innerText = "Save";
                btn.style.color = "";
                if (isEditingFile) {
                    isEditingFile = false;
                    document.getElementById('doc-notepad-view').style.display = 'none';
                    openVaultedFile(title); // Go back to viewer mode
                } else {
                    closeNotepad(); loadVaultGallery();
                }
            }, 800);
        }
    } catch (err) {
        btn.innerText = "Error";
        btn.style.color = "var(--danger)";
        setTimeout(() => { btn.innerText = "Save"; btn.style.color = ""; }, 2000);
    }
}

function triggerNewFolder() { showModal('input', 'New Folder', 'Enter folder name', 'New Folder', async (val) => { if (!val) return; const res = await eel.create_vault_folder(val, currentPath)(); if (res.includes('Error')) showModal('alert', 'Error', res); loadVaultGallery(); }); }
async function handleNativeImport() { const res = await eel.import_document_dialog(currentPath)(); if (res.status === "error") showModal('alert', 'Import Error', res.message); else if (res.status === "success") loadVaultGallery(); }

// Context Menu Action Handlers
document.getElementById('ctx-open').onclick = () => { if (contextType === 'folder') navigateDown(contextTarget); else openVaultedFile(contextTarget); };
document.getElementById('ctx-edit').onclick = () => { editVaultedNote(contextTarget); };
document.getElementById('ctx-select').onclick = () => { if (!isSelectMode) toggleSelectMode(); if (!selectedFiles.has(contextTarget)) { selectedFiles.add(contextTarget); const card = document.querySelector(`.file-card[data-filename="${contextTarget}"]`); if (card) { card.classList.add('selected'); card.querySelector('.file-checkbox').checked = true; } updateToolbarUI(); } };
document.getElementById('ctx-rename').onclick = () => { showModal('input', 'Rename Item', `Rename '${contextTarget}' to:`, contextTarget, async (val) => { if (!val || val === contextTarget) return; const res = await eel.rename_vault_item(contextTarget, val, currentPath)(); if (res.includes('Error')) showModal('alert', 'Error', res); loadVaultGallery(); }); };
document.getElementById('ctx-copy').onclick = async () => { await eel.copy_vault_items([contextTarget], currentPath)(); loadVaultGallery(); };
document.getElementById('ctx-move').onclick = async () => { await eel.move_vault_items([contextTarget], currentPath)(); showModal('alert', 'Moved', `'${contextTarget}' moved to Archive folder.`); loadVaultGallery(); };
document.getElementById('ctx-delete').onclick = () => { showModal('confirm', 'Confirm Deletion', `Permanently delete '${contextTarget}'?`, "", async () => { await eel.delete_vault_items([contextTarget], currentPath)(); loadVaultGallery(); }); };



/**
 * ==========================================
 * TAB & NAVIGATION LOGIC
 * ==========================================
 */
const tabsList = [
    { id: 'encrypt', btn: 'tab-btn-encrypt', color: '#00E5FF' },
    { id: 'decrypt', btn: 'tab-btn-decrypt', color: '#00FF66' },
    { id: 'demo', btn: 'tab-btn-demo', color: '#F72585' },
    { id: 'docview', btn: 'tab-btn-docview', color: '#9D4EDD' },
    { id: 'calculator', btn: 'tab-btn-calc', color: '#FFB703' },
    { id: 'settings', btn: 'tab-btn-settings', color: '#FF007F' },
    { id: 'about', btn: 'tab-btn-about', color: '#E63946' }
];
let currentTabIndex = 0;

// Global hotkeys handling
document.addEventListener('keydown', function (event) {
    const isInputActive = (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');

    if (event.key === "Enter" && !introCompleted) { skipIntro(); }
    if ((event.key === '`' || event.key === '~') && !isInputActive) { event.preventDefault(); toggleSidebar(); } // Tilde to open menu

    // Up/Down arrows to cycle tabs if not typing
    if (event.key === 'ArrowDown' && !isInputActive) {
        event.preventDefault(); currentTabIndex = (currentTabIndex + 1) % tabsList.length; let t = tabsList[currentTabIndex]; switchTab(t.id, document.getElementById(t.btn), t.color);
    }
    if (event.key === 'ArrowUp' && !isInputActive) {
        event.preventDefault(); currentTabIndex = (currentTabIndex - 1 + tabsList.length) % tabsList.length; let t = tabsList[currentTabIndex]; switchTab(t.id, document.getElementById(t.btn), t.color);
    }

    // Fullscreen toggle on F1
    if (event.key === "F1") {
        event.preventDefault();
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(err => { console.log(`Fullscreen Error: ${err.message}`); }); }
        else { if (document.exitFullscreen) document.exitFullscreen(); }
    }

    // Handle Esc key to close overlays or trigger exit
    if (event.key === "Escape") {
        if (document.getElementById('custom-modal-overlay').style.display === 'flex') { closeModal(); }
        else if (document.getElementById('exit-modal-overlay').style.display === 'flex') { cancelExit(); }
        else { event.preventDefault(); triggerExit(); }
    }

    // Map physical keyboard directly to calculator buttons if calc tab is open
    if (document.getElementById('calculator').classList.contains('active')) {
        if (isInputActive) return;
        const key = event.key;
        if (/[0-9\.\(\)\/\*\-\+]/.test(key)) { event.preventDefault(); if (/[0-9\.]/.test(key)) calcNum(key); else calcOp(key); triggerKeyAnim(key); }
        else if (key === 'Enter' || key === '=') { event.preventDefault(); calcEq(); triggerKeyAnim('Enter'); }
        else if (key === 'Backspace') { event.preventDefault(); calcExp = calcExp.slice(0, -1); document.getElementById('calc-input').value = calcExp || "0"; }
        else if (key.toLowerCase() === 'c') { calcClear(); triggerKeyAnim('Escape'); }
    }
});

// Simulates hover/active CSS states for calc buttons when using keyboard
function triggerKeyAnim(key) {
    const btn = document.querySelector(`.calc-btn[data-key="${key}"]`);
    if (btn) { btn.classList.add('kb-active'); setTimeout(() => btn.classList.remove('kb-active'), 100); }
}




async function openVaultFolder(btnElement) {
    if (!btnElement || btnElement.classList.contains('active')) return;
    const originalContent = btnElement.innerHTML;
    btnElement.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Opened`;
    btnElement.classList.add('active');
    setTimeout(() => { btnElement.innerHTML = originalContent; btnElement.classList.remove('active'); }, 1500);

    if (typeof eel !== 'undefined' && eel.open_vault_directory) { await eel.open_vault_directory(currentPath)(); }
}

// Logic for transitioning between main app tabs (SPA routing essentially)
function switchTab(tabId, btnElement, colorHex) {
    currentTabIndex = tabsList.findIndex(t => t.id === tabId);
    const activeCard = document.querySelector('.glass-card.active'); const targetCard = document.getElementById(tabId);
    if (activeCard && activeCard !== targetCard) { activeCard.classList.remove('active'); setTimeout(() => { targetCard.classList.add('active'); }, 150); }
    else if (!activeCard) { targetCard.classList.add('active'); }

    // Update UI active states and change global CSS color variables
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active')); btnElement.classList.add('active');
    document.documentElement.style.setProperty('--accent', colorHex); document.documentElement.style.setProperty('--accent-dim', colorHex + '33'); document.documentElement.style.setProperty('--glass-border', colorHex + '66');
    matrixColor = colorHex;
    if (tabId === 'docview') { loadVaultGallery(); } // Automatically refresh file list if visiting Vault
}

function copyToClipboard(elementId, btnElement) {
    const el = document.getElementById(elementId); el.select(); document.execCommand("copy"); window.getSelection().removeAllRanges();
    const originalText = btnElement.innerText; btnElement.innerText = "Copied!"; btnElement.style.color = "#00FF66"; btnElement.style.borderColor = "#00FF66";
    setTimeout(() => { btnElement.innerText = originalText; btnElement.style.color = ""; btnElement.style.borderColor = ""; }, 1500);
}

// Bypasses browser clipboard API to avoid prompt issues; directly copies value from input A to input B
function pasteToDecryptInput(btnElement) {
    const encOutput = document.getElementById('enc-output');
    const decInput = document.getElementById('dec-input');

    if (encOutput && encOutput.value) {
        decInput.value = encOutput.value;
        const originalText = btnElement.innerText;
        btnElement.innerText = "Pasted!";
        btnElement.style.color = "#00FF66";
        btnElement.style.borderColor = "#00FF66";
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.style.color = "";
            btnElement.style.borderColor = "";
        }, 1500);
    } else {
        const originalText = btnElement.innerText;
        btnElement.innerText = "Nothing to paste";
        btnElement.style.color = "var(--danger)";
        btnElement.style.borderColor = "var(--danger)";
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.style.color = "";
            btnElement.style.borderColor = "";
        }, 1500);
    }
}

/**
 * ==========================================
 * VAULT / FILE EXPLORER RENDER LOGIC
 * ==========================================
 */
let currentPath = "";

// Determine icon based on file extension
function getFileIconSVG(type, filename) {
    if (type === 'folder') return `<svg viewBox="0 0 24 24" fill="#FFC107"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return `<svg viewBox="0 0 24 24" fill="#E63946"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>`;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return `<svg viewBox="0 0 24 24" fill="#00E5FF"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return `<svg viewBox="0 0 24 24" fill="#4285F4"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
    return `<svg viewBox="0 0 24 24" fill="#A0A0A0"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2z"/></svg>`;
}

// Fetch directory contents from Python Eel backend and render grid
async function loadVaultGallery() {
    const list = document.getElementById('directory-list'); const pathDisplay = document.getElementById('dir-path');
    pathDisplay.innerText = currentPath ? `Root / ${currentPath.replace(/\\/g, ' / ')}` : "Root";
    list.innerHTML = `<div style="padding: 15px; color:var(--text-dim); grid-column: 1/-1;">Scanning vault...</div>`;
    try {
        const items = await eel.get_vaulted_files(currentPath)();
        list.innerHTML = ''; selectedFiles.clear(); if (isSelectMode) toggleSelectMode(); else updateToolbarUI();
        if (items.length === 0) { list.innerHTML = `<div style="padding: 15px; color:var(--text-dim); grid-column: 1/-1;">Folder is empty.</div>`; return; }

        // Build DOM for each file card
        items.forEach(item => {
            const card = document.createElement('div'); card.className = 'file-card'; card.dataset.filename = item.name; card.dataset.type = item.type;
            const cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'file-checkbox';

            cb.onchange = (e) => { e.stopPropagation(); if (cb.checked) { selectedFiles.add(item.name); card.classList.add('selected'); } else { selectedFiles.delete(item.name); card.classList.remove('selected'); } updateToolbarUI(); };
            card.onclick = (e) => { if (!isSelectMode) return; cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); };
            card.ondblclick = () => { if (isSelectMode) return; if (item.type === 'folder') navigateDown(item.name); else openVaultedFile(item.name); };

            const icon = document.createElement('div'); icon.className = 'file-icon'; icon.innerHTML = getFileIconSVG(item.type, item.name);
            const name = document.createElement('div'); name.className = 'file-name'; name.innerText = item.name;

            card.appendChild(cb); card.appendChild(icon); card.appendChild(name); list.appendChild(card);
        });
    } catch (e) { list.innerHTML = `<div style="padding: 15px; color:var(--danger); grid-column: 1/-1;">Error scanning vault. Ensure backend is running.</div>`; }
}

function navigateDown(folder) { currentPath = currentPath ? `${currentPath}/${folder}` : folder; loadVaultGallery(); }
function navigateUp() { if (!currentPath) return; const parts = currentPath.split('/'); parts.pop(); currentPath = parts.join('/'); loadVaultGallery(); }

// Toggles visibility of delete buttons based on selection status
function updateToolbarUI() {
    const delBtn = document.getElementById('btn-delete-selected'); const count = document.getElementById('select-count');
    if (selectedFiles.size > 0 && isSelectMode) { delBtn.style.display = 'flex'; count.innerText = `${selectedFiles.size}`; }
    else { delBtn.style.display = 'none'; }
}

async function deleteSelected() { showModal('confirm', 'Delete Items', `Delete ${selectedFiles.size} selected items permanently?`, "", async () => { await eel.delete_vault_items(Array.from(selectedFiles), currentPath)(); loadVaultGallery(); }); }

// Helper to parse base64 files sent from Python into browser Blobs (for PDF/Image viewing)
function b64toBlob(b64Data, contentType = '') {
    const byteCharacters = atob(b64Data); const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512); const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) { byteNumbers[i] = slice.charCodeAt(i); }
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: contentType });
}

function setRatio(ratio) {
    const container = document.getElementById('viewer-container'); container.classList.remove('ratio-16-9', 'ratio-4-3', 'ratio-1-1');
    if (ratio === '16-9') container.classList.add('ratio-16-9'); if (ratio === '4-3') container.classList.add('ratio-4-3'); if (ratio === '1-1') container.classList.add('ratio-1-1');
}

function toggleDocFullscreen() {
    const container = document.getElementById('viewer-container');
    if (!document.fullscreenElement) { container.requestFullscreen().catch(err => { console.log(`Fullscreen Error`); }); }
    else { document.exitFullscreen(); }
}

// Document Viewer Logic
let currentlyViewingFile = null; let currentBlobUrl = null;
async function openVaultedFile(filename) {
    currentlyViewingFile = filename;
    document.getElementById('doc-gallery-view').style.display = 'none'; document.getElementById('doc-viewer-frame').style.display = 'flex';
    const content = document.getElementById('viewer-content'); const activeTitle = document.getElementById('active-filename');
    content.innerHTML = `<span style="color:var(--accent);">Decrypting...</span>`; activeTitle.innerText = filename;
    setRatio('1-1');

    if (filename.endsWith('.txt')) { document.getElementById('toolbar-edit-btn').style.display = 'inline-block'; }
    else { document.getElementById('toolbar-edit-btn').style.display = 'none'; }

    try {
        // Request file payload from Python
        const res = await eel.read_vaulted_file(filename, currentPath)();
        if (res.error) { content.innerHTML = `<p style="color:var(--danger)">Error: ${res.error}</p>`; return; }
        const mime = res.mime; const b64Data = res.data; const ext = filename.split('.').pop().toLowerCase();

        // Render file based on MIME type
        if (mime === 'application/pdf') { currentBlobUrl = URL.createObjectURL(b64toBlob(b64Data, mime)); content.innerHTML = `<iframe src="${currentBlobUrl}#toolbar=0"></iframe>`; }
        else if (mime.startsWith('image/')) { content.innerHTML = `<img src="data:${mime};base64,${b64Data}">`; }
        else if (mime.startsWith('text/') || ['csv', 'json', 'py', 'js', 'html', 'css'].includes(ext)) { content.innerHTML = `<textarea readonly>${decodeURIComponent(escape(atob(b64Data)))}</textarea>`; }
        else { content.innerHTML = `<div style="text-align:center;"><p><b>${filename}</b></p><p style="color:var(--danger);">Proprietary formats cannot be previewed securely.</p></div>`; }
    } catch (err) { content.innerHTML = `<p style="color:var(--danger)">Failed to load file.</p>`; }
}

function editCurrentViewerFile() { if (currentlyViewingFile) { editVaultedNote(currentlyViewingFile); } }

function closeDocViewer() {
    // Clean up memory blob to prevent leaks
    if (currentBlobUrl) { URL.revokeObjectURL(currentBlobUrl); currentBlobUrl = null; }
    document.getElementById('doc-viewer-frame').style.display = 'none'; document.getElementById('viewer-content').innerHTML = ''; document.getElementById('doc-gallery-view').style.display = 'flex';
    if (document.fullscreenElement) document.exitFullscreen();
}
