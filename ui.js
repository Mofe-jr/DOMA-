/**
 * DOMA.ng - Shared UI helpers
 * Loaded on every page after config.js and before page scripts:
 * HTML escaping, safe media URLs, toasts, and the site header (auth state + mobile menu).
 */

// Security: HTML entity escaper for text and quoted attribute values
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Security: only https, same-site assets, and inline/blob media may be used as src
function safeMediaUrl(url, fallback = '') {
  if (typeof url !== 'string') return fallback;
  const u = url.trim();
  if (/^https:\/\//i.test(u) || /^assets\//.test(u) || /^data:(image|video)\//i.test(u) || /^blob:/i.test(u)) {
    return u;
  }
  return fallback;
}

/* ==========================================================================
   Toasts
   ========================================================================== */
function getToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  return container;
}

/** type: 'success' (default) | 'error' | 'info' */
function showToast(message, type = 'success') {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '18');
  icon.setAttribute('height', '18');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2.5');
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = type === 'error'
    ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
    : '<polyline points="20 6 9 17 4 12"></polyline>';

  const text = document.createElement('span');
  text.textContent = message;

  toast.append(icon, text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-leaving');
    setTimeout(() => toast.remove(), 300);
  }, type === 'error' ? 5000 : 3400);
}

/* ==========================================================================
   Site Header: scroll state, active link, mobile menu, auth state
   ========================================================================== */
function getWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem('doma_wishlist') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function setWishlist(ids) {
  try {
    localStorage.setItem('doma_wishlist', JSON.stringify(ids));
  } catch (e) {}
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const count = getWishlist().length;
  document.querySelectorAll('.wishlist-count').forEach(badge => {
    badge.textContent = count;
  });
}

function initSiteHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  header.querySelectorAll('a.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isActive = !href.includes('?') && href === currentPage;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });

  const menuBtn = header.querySelector('#mobile-menu-btn');
  const setMenuOpen = (open) => {
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('nav-locked', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  };

  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenuOpen(!header.classList.contains('nav-open')));
    header.querySelectorAll('.site-nav a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });
    window.matchMedia('(min-width: 1181px)').addEventListener('change', (e) => {
      if (e.matches) setMenuOpen(false);
    });
  }

  const signOutBtn = header.querySelector('#nav-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await window.DOMA_CLOUD.signOut();
      window.location.href = 'index.html';
    });
  }

  updateWishlistBadge();
}

const ROLE_ACCOUNT_LINKS = {
  student: { icon: '🎓', href: 'dashboard.html' },
  tenant: { icon: '🏠', href: 'dashboard.html' },
  agent: { icon: '💼', href: 'agent-portal.html' },
  admin: { icon: '🛡️', href: 'admin.html' }
};

/** Reflects the signed-in user in the header. Resolves to the profile (or null). */
async function renderHeaderAuthState() {
  const user = window.DOMA_CLOUD ? await window.DOMA_CLOUD.getCurrentUser() : null;

  const accountBtn = document.querySelector('#nav-account-btn');
  const dashItem = document.querySelector('#nav-dash-item');
  const adminItem = document.querySelector('#nav-admin-item');
  const signOutItem = document.querySelector('#nav-signout-item');

  if (dashItem) dashItem.hidden = !user;
  if (adminItem) adminItem.hidden = !(user && user.role === 'admin');
  if (signOutItem) signOutItem.hidden = !user;

  if (accountBtn) {
    const icon = accountBtn.querySelector('.btn-icon');
    const label = accountBtn.querySelector('.btn-label');
    if (user) {
      const link = ROLE_ACCOUNT_LINKS[user.role] || ROLE_ACCOUNT_LINKS.student;
      const firstName = (user.fullName || user.email || 'Account').split(' ')[0];
      if (icon) icon.textContent = link.icon;
      if (label) label.textContent = user.role === 'admin' ? 'Admin Console' : firstName;
      accountBtn.href = link.href;
      accountBtn.title = `Signed in as ${user.email}`;
    } else {
      if (icon) icon.textContent = '👤';
      if (label) label.textContent = 'Sign In';
      accountBtn.href = 'auth.html';
      accountBtn.removeAttribute('title');
    }
  }

  return user;
}

document.addEventListener('DOMContentLoaded', () => {
  getToastContainer();
  initSiteHeader();
  renderHeaderAuthState();
});
