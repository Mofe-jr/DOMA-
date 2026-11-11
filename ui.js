/**
 * DOMA.ng - Shared UI helpers
 * Loaded on every page after config.js and before page scripts:
 * HTML escaping, safe media URLs, icons, toasts, and the site header (auth state + mobile menu).
 */

// Icons come from the icons.svg sprite; `name` is always a fixed string from our own code
function icon(name, className = '') {
  return `<svg class="icon${className ? ' ' + className : ''}" aria-hidden="true"><use href="icons.svg#i-${name}"></use></svg>`;
}

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

/* ==========================================================================
   States & campuses DOMA covers. Every state/campus dropdown and the map's
   university layer are built from these two lists, so add new places here.
   Campus coordinates are approximate main-gate positions.
   ========================================================================== */
const NIGERIAN_STATES = [
  { value: 'Lagos', label: 'Lagos', city: 'Lagos', lat: 6.5244, lng: 3.3792, zoom: 11 },
  { value: 'Abuja', label: 'Abuja (FCT)', city: 'Abuja', lat: 9.0765, lng: 7.3986, zoom: 11 },
  { value: 'Rivers', label: 'Rivers', city: 'Port Harcourt', lat: 4.8156, lng: 7.0498, zoom: 11 },
  { value: 'Oyo', label: 'Oyo', city: 'Ibadan', lat: 7.3775, lng: 3.9470, zoom: 10 },
  { value: 'Edo', label: 'Edo', city: 'Benin City', lat: 6.3350, lng: 5.6037, zoom: 11 },
  { value: 'Ogun', label: 'Ogun', city: 'Abeokuta', lat: 7.1475, lng: 3.3619, zoom: 10 },
  { value: 'Osun', label: 'Osun', city: 'Ile-Ife', lat: 7.4905, lng: 4.5521, zoom: 11 },
  { value: 'Ondo', label: 'Ondo', city: 'Akure', lat: 7.2571, lng: 5.2058, zoom: 11 },
  { value: 'Enugu', label: 'Enugu', city: 'Enugu', lat: 6.4584, lng: 7.5464, zoom: 10 },
  { value: 'Anambra', label: 'Anambra', city: 'Awka', lat: 6.2104, lng: 7.0741, zoom: 11 },
  { value: 'Delta', label: 'Delta', city: 'Asaba', lat: 6.2059, lng: 6.6959, zoom: 10 },
  { value: 'Kano', label: 'Kano', city: 'Kano', lat: 12.0022, lng: 8.5920, zoom: 11 },
  { value: 'Kaduna', label: 'Kaduna', city: 'Kaduna', lat: 10.5105, lng: 7.4165, zoom: 10 }
];

// `label` is what listings store in their campus field, so existing labels must not change.
const NIGERIAN_CAMPUSES = [
  { id: 'unilag', short: 'UNILAG', name: 'University of Lagos', town: 'Akoka', state: 'Lagos', type: 'federal', lat: 6.5158, lng: 3.3896, label: 'UNILAG (Akoka)' },
  { id: 'lasu', short: 'LASU', name: 'Lagos State University', town: 'Ojo', state: 'Lagos', type: 'state', lat: 6.4667, lng: 3.2000, label: 'LASU (Ojo)' },
  { id: 'yabatech', short: 'YabaTech', name: 'Yaba College of Technology', town: 'Yaba', state: 'Lagos', type: 'polytechnic', lat: 6.5180, lng: 3.3746, label: 'YabaTech' },
  { id: 'uniabuja', short: 'UniAbuja', name: 'University of Abuja', town: 'Gwagwalada', state: 'Abuja', type: 'federal', lat: 8.9806, lng: 7.1782, label: 'UniAbuja (Gwagwalada)' },
  { id: 'uniport', short: 'UNIPORT', name: 'University of Port Harcourt', town: 'Choba', state: 'Rivers', type: 'federal', lat: 4.9032, lng: 6.9234, label: 'UNIPORT (Choba)' },
  { id: 'rsu', short: 'RSU', name: 'Rivers State University', town: 'Nkpolu, Port Harcourt', state: 'Rivers', type: 'state', lat: 4.8076, lng: 6.9840, label: 'RSU (Port Harcourt)' },
  { id: 'ui', short: 'UI', name: 'University of Ibadan', town: 'Agbowo, Ibadan', state: 'Oyo', type: 'federal', lat: 7.4443, lng: 3.9003, label: 'UI (Ibadan)' },
  { id: 'lautech', short: 'LAUTECH', name: 'Ladoke Akintola University of Technology', town: 'Ogbomoso', state: 'Oyo', type: 'state', lat: 8.1650, lng: 4.2660, label: 'LAUTECH (Ogbomoso)' },
  { id: 'uniben', short: 'UNIBEN', name: 'University of Benin', town: 'Ugbowo, Benin City', state: 'Edo', type: 'federal', lat: 6.4010, lng: 5.6110, label: 'UNIBEN (Benin City)' },
  { id: 'aau', short: 'AAU', name: 'Ambrose Alli University', town: 'Ekpoma', state: 'Edo', type: 'state', lat: 6.7400, lng: 6.1150, label: 'AAU (Ekpoma)' },
  { id: 'edsu', short: 'EDSU', name: 'Edo State University Uzairue', town: 'Uzairue', state: 'Edo', type: 'state', lat: 7.1530, lng: 6.3160, label: 'EDSU (Uzairue)' },
  { id: 'auchipoly', short: 'Auchi Poly', name: 'Auchi Polytechnic', town: 'Auchi', state: 'Edo', type: 'polytechnic', lat: 7.0590, lng: 6.2630, label: 'Auchi Poly (Auchi)' },
  { id: 'funaab', short: 'FUNAAB', name: 'Federal University of Agriculture, Abeokuta', town: 'Abeokuta', state: 'Ogun', type: 'federal', lat: 7.2290, lng: 3.4400, label: 'FUNAAB (Abeokuta)' },
  { id: 'oou', short: 'OOU', name: 'Olabisi Onabanjo University', town: 'Ago-Iwoye', state: 'Ogun', type: 'state', lat: 6.9440, lng: 3.9150, label: 'OOU (Ago-Iwoye)' },
  { id: 'oau', short: 'OAU', name: 'Obafemi Awolowo University', town: 'Ile-Ife', state: 'Osun', type: 'federal', lat: 7.5186, lng: 4.5220, label: 'OAU (Ile-Ife)' },
  { id: 'futa', short: 'FUTA', name: 'Federal University of Technology, Akure', town: 'Akure', state: 'Ondo', type: 'federal', lat: 7.3020, lng: 5.1370, label: 'FUTA (Akure)' },
  { id: 'unn', short: 'UNN', name: 'University of Nigeria', town: 'Nsukka', state: 'Enugu', type: 'federal', lat: 6.8670, lng: 7.4080, label: 'UNN (Nsukka)' },
  { id: 'esut', short: 'ESUT', name: 'Enugu State University of Science & Technology', town: 'Agbani', state: 'Enugu', type: 'state', lat: 6.3080, lng: 7.5520, label: 'ESUT (Agbani)' },
  { id: 'unizik', short: 'UNIZIK', name: 'Nnamdi Azikiwe University', town: 'Awka', state: 'Anambra', type: 'federal', lat: 6.2450, lng: 7.1160, label: 'UNIZIK (Awka)' },
  { id: 'delsu', short: 'DELSU', name: 'Delta State University', town: 'Abraka', state: 'Delta', type: 'state', lat: 5.7870, lng: 6.1000, label: 'DELSU (Abraka)' },
  { id: 'buk', short: 'BUK', name: 'Bayero University', town: 'Kano', state: 'Kano', type: 'federal', lat: 11.9790, lng: 8.4770, label: 'BUK (Kano)' },
  { id: 'abu', short: 'ABU', name: 'Ahmadu Bello University', town: 'Zaria', state: 'Kaduna', type: 'federal', lat: 11.1530, lng: 7.6540, label: 'ABU (Zaria)' }
];

const CAMPUS_TYPE_LABELS = { federal: 'Federal university', state: 'State university', polytechnic: 'Polytechnic' };

function findCampus(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  return NIGERIAN_CAMPUSES.find(c => c.id === v || c.label.toLowerCase() === v) || null;
}

/**
 * Fill <select data-options="states|campus-filter|campus|university"> from the lists above.
 * Options already in the markup (e.g. "All states") are kept at the top.
 */
function populateLocationSelects() {
  const makeOption = (value, text) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    return opt;
  };

  document.querySelectorAll('select[data-options="states"]').forEach(sel => {
    NIGERIAN_STATES.forEach(s => sel.appendChild(makeOption(s.value, s.label.includes(s.city) ? s.label : `${s.label} (${s.city})`)));
  });

  document.querySelectorAll('select[data-options="campus-filter"], select[data-options="campus"], select[data-options="university"]').forEach(sel => {
    const kind = sel.dataset.options;
    const trailing = [...sel.querySelectorAll('option[data-position="end"]')];
    trailing.forEach(o => o.remove());
    NIGERIAN_STATES.forEach(state => {
      const campuses = NIGERIAN_CAMPUSES.filter(c => c.state === state.value);
      if (!campuses.length) return;
      const group = document.createElement('optgroup');
      group.label = state.label;
      campuses.forEach(c => {
        if (kind === 'campus-filter') group.appendChild(makeOption(c.id, `${c.short} · ${c.town}`));
        else if (kind === 'campus') group.appendChild(makeOption(c.label, `${c.short}, ${c.town}`));
        else group.appendChild(makeOption(c.label, `${c.name} (${c.short})`));
      });
      sel.appendChild(group);
    });
    trailing.forEach(o => sel.appendChild(o));
  });
}

const LISTING_TYPES = {
  house: { label: 'House for rent', short: 'House', icon: 'home', badge: '' },
  student: { label: 'Student hostel', short: 'Student', icon: 'cap', badge: 'student' },
  store: { label: 'Store to let', short: 'Store', icon: 'store', badge: 'gold' }
};

function typeBadgeHtml(type, short = false) {
  const t = LISTING_TYPES[type] || LISTING_TYPES.house;
  return `<span class="card-badge ${t.badge}">${icon(t.icon)}${short ? t.short : t.label}</span>`;
}

// Bundled photos have light WebP versions; use them wherever a card-sized image is shown
function cardImage(url) {
  return typeof url === 'string' ? url.replace(/^assets\/images\/([\w-]+)\.jpg$/, 'assets/images/$1-sm.webp') : url;
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

  const iconWrap = document.createElement('span');
  iconWrap.className = 'toast-icon';
  iconWrap.innerHTML = icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'check-circle');

  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;

  toast.append(iconWrap, text);
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
  student: 'dashboard.html',
  tenant: 'dashboard.html',
  agent: 'agent-portal.html',
  admin: 'admin.html'
};

function initialsFor(user) {
  const parts = (user.fullName || user.email || '?').trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

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
    const avatar = accountBtn.querySelector('.btn-icon');
    const label = accountBtn.querySelector('.btn-label');
    accountBtn.classList.toggle('is-signed-in', !!user);
    if (user) {
      const firstName = (user.fullName || user.email || 'Account').split(' ')[0];
      if (avatar) avatar.textContent = initialsFor(user);
      if (label) label.textContent = user.role === 'admin' ? 'Admin' : firstName;
      accountBtn.href = ROLE_ACCOUNT_LINKS[user.role] || ROLE_ACCOUNT_LINKS.student;
      accountBtn.title = `Signed in as ${user.email}`;
    } else {
      if (avatar) avatar.innerHTML = icon('log-in');
      if (label) label.textContent = 'Sign in';
      accountBtn.href = 'auth.html';
      accountBtn.removeAttribute('title');
    }
  }

  return user;
}

// This script is placed after the page content but before the Supabase SDK, so the
// header works immediately; the signed-in state waits for config.js to load.
getToastContainer();
initSiteHeader();
populateLocationSelects();
document.addEventListener('DOMContentLoaded', renderHeaderAuthState);
