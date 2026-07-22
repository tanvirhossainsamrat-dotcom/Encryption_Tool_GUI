// Toggle sidebar open/close
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const logo = document.getElementById('app-logo');

    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open');
        logo.classList.remove('glass-hidden');
    } else {
        sidebar.classList.add('open');
        mainContent.classList.add('sidebar-open');
        logo.classList.add('glass-hidden');
    }
}