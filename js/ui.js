/**
 * ui.js
 * UI helpers: section switching, modals, toast notifications, file input display.
 */

// --- SECTION / TAB SWITCHING ---

function switchSection(sectionId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchSettingsTab(tabId) {
    document.querySelectorAll('.settings-subcontent').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    document.querySelectorAll('.subnav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-' + tabId).classList.add('active');
}

// --- FILE INPUT DISPLAY ---

function updateFileName(input) {
    const display = document.getElementById('fileNameDisplay');
    if (input.files && input.files.length > 0) {
        display.innerText = input.files[0].name;
        display.style.color = 'var(--chili-dark)';
        display.style.fontWeight = '700';
    } else {
        display.innerText = "Select CSV File";
        display.style.color = '#666';
    }
}

// --- MODAL HELPERS ---

function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

// Convenience wrappers used by onclick handlers in HTML
function closeWarningModal() { closeModal('warningModal'); }
function closeApply15kModal() { closeModal('apply15kModal'); }
function openApply15kModal() { openModal('apply15kModal'); }

// --- TOAST NOTIFICATION ---

function showToast(message) {
    const toast = document.getElementById('saveToast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('active');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
