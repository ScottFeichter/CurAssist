// #region ===================== SIDEBAR ========================================

function toggleSidebar() {
  const el = document.getElementById('leftSidebar');
  const btn = document.querySelector('.leftSidebar-toggle-btn');
  el.classList.toggle('collapsed');
  btn.classList.toggle('sidebar-closed', el.classList.contains('collapsed'));
  if (el.classList.contains('collapsed')) {
    if (parseInt(el.style.width) > 0) el.dataset.prevWidth = el.style.width;
    el.style.width = '';
    el.style.padding = '';
  } else {
    el.style.width = el.dataset.prevWidth || '250px';
    el.style.padding = '';
  }
}

function toggleRightSidebar() {
  const el = document.getElementById('rightSidebar');
  const btn = document.querySelector('.rightSidebar-toggle-btn');
  el.classList.toggle('collapsed');
  btn.classList.toggle('sidebar-closed', el.classList.contains('collapsed'));
  if (el.classList.contains('collapsed')) {
    if (parseInt(el.style.width) > 0) el.dataset.prevWidth = el.style.width;
    el.style.width = '';
    el.style.padding = '';
  } else {
    el.style.width = el.dataset.prevWidth || '250px';
    el.style.padding = '';
  }
}

// Sidebar resize functionality
let isResizingLeft = false;
let isResizingRight = false;
let startX = 0;
let startWidth = 0;

const resizeHandle = document.getElementById('resizeHandle');
const rightResizeHandle = document.getElementById('rightResizeHandle');
const sidebar = document.getElementById('leftSidebar');
const rightSidebar = document.getElementById('rightSidebar');

resizeHandle.addEventListener('mousedown', (e) => {
  isResizingLeft = true;
  startX = e.clientX;
  startWidth = sidebar.offsetWidth;
  sidebar.dataset.prevWidth = startWidth + 'px';
  sidebar.style.transition = 'none';
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
  document.getElementById('formFrame').style.pointerEvents = 'none';
  e.preventDefault();
});

rightResizeHandle.addEventListener('mousedown', (e) => {
  isResizingRight = true;
  startX = e.clientX;
  startWidth = rightSidebar.offsetWidth;
  rightSidebar.dataset.prevWidth = startWidth + 'px';
  rightSidebar.style.transition = 'none';
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
  document.getElementById('formFrame').style.pointerEvents = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (isResizingLeft) {
    e.preventDefault();
    const width = Math.max(0, startWidth + (e.clientX - startX));
    if (width <= 600) {
      sidebar.style.width = width + 'px';
      sidebar.style.padding = width === 0 ? '0' : '';
    }
  }
  if (isResizingRight) {
    e.preventDefault();
    const width = Math.max(0, startWidth + (startX - e.clientX));
    if (width <= 600) {
      rightSidebar.style.width = width + 'px';
      rightSidebar.style.padding = width === 0 ? '0' : '';
    }
  }
});

function stopResize() {
  if (isResizingLeft) sidebar.style.transition = '';
  if (isResizingRight) rightSidebar.style.transition = '';
  isResizingLeft = false;
  isResizingRight = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  document.getElementById('formFrame').style.pointerEvents = '';
}

document.addEventListener('mouseup', stopResize);

// #endregion ------------------------------------------------------------------
