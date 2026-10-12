/**
 * DOMA Property Portal - Multi-Page Core Engine
 * White, Black & Yellow Theme + Interactive Map & Find Directions
 */

// Global State
let currentAgent = null;
let currentListings = [];
let uploadedMediaFiles = [];
let leafletMap = null;
let mapMarkers = [];
let currentRoutePolyline = null;

// Nigerian Coordinates Reference Directory
const NIGERIAN_GEO_DIRECTORY = {
  'lekki': { lat: 6.4474, lng: 3.4723, state: 'Lagos', landmark: 'Admiralty Way, Lekki Phase 1' },
  'victoria island': { lat: 6.4281, lng: 3.4219, state: 'Lagos', landmark: 'Ozumba Mbadiwe Ave, VI' },
  'vi': { lat: 6.4281, lng: 3.4219, state: 'Lagos', landmark: 'Ahmadu Bello Way, VI' },
  'ikoyi': { lat: 6.4549, lng: 3.4357, state: 'Lagos', landmark: 'Bourdillon Road, Ikoyi' },
  'banana island': { lat: 6.4632, lng: 3.4545, state: 'Lagos', landmark: 'Banana Island, Ikoyi' },
  'ikeja': { lat: 6.5912, lng: 3.3515, state: 'Lagos', landmark: 'Isaac John St, Ikeja GRA' },
  'gra': { lat: 6.5912, lng: 3.3515, state: 'Lagos', landmark: 'Ikeja GRA' },
  'yaba': { lat: 6.5095, lng: 3.3711, state: 'Lagos', landmark: 'Herbert Macaulay Way, Yaba' },
  'surulere': { lat: 6.4969, lng: 3.3533, state: 'Lagos', landmark: 'Adeniran Ogunsanya, Surulere' },
  'gbagada': { lat: 6.5542, lng: 3.3886, state: 'Lagos', landmark: 'Gbagada Phase 2' },
  'magodo': { lat: 6.6212, lng: 3.3802, state: 'Lagos', landmark: 'Magodo Phase 2 GRA' },
  'ajah': { lat: 6.4674, lng: 3.5678, state: 'Lagos', landmark: 'Ajah Roundabout / Badore' },
  'maitama': { lat: 9.0882, lng: 7.4934, state: 'Abuja', landmark: 'Gana Street, Maitama' },
  'wuse': { lat: 9.0722, lng: 7.4716, state: 'Abuja', landmark: 'Aminu Kano Crescent, Wuse 2' },
  'garki': { lat: 9.0345, lng: 7.4877, state: 'Abuja', landmark: 'Area 11, Garki' },
  'jabi': { lat: 9.0728, lng: 7.4258, state: 'Abuja', landmark: 'Jabi Lake Mall Corridor' },
  'guzape': { lat: 9.0272, lng: 7.5186, state: 'Abuja', landmark: 'Guzape Hills' },
  'asokoro': { lat: 9.0435, lng: 7.5255, state: 'Abuja', landmark: 'Yakubu Gowon Cres, Asokoro' },
  'port harcourt': { lat: 4.8156, lng: 7.0498, state: 'Rivers', landmark: 'Old GRA, Port Harcourt' },
  'ibadan': { lat: 7.4345, lng: 3.9065, state: 'Oyo', landmark: 'Bodija Estate, Ibadan' }
};

const STARTING_HUBS = {
  'current': { name: 'Current Location (GPS)', lat: 6.4480, lng: 3.4200 },
  'tollgate': { name: 'Lekki Phase 1 Toll Gate', lat: 6.4385, lng: 3.4430 },
  'airport_lagos': { name: 'Murtala Muhammed Airport (MM2)', lat: 6.5774, lng: 3.3214 },
  'stadium_lagos': { name: 'National Stadium, Surulere', lat: 6.4950, lng: 3.3590 },
  'vi_lagos': { name: 'Ozumba Mbadiwe, VI', lat: 6.4310, lng: 3.4280 },
  'cbd_abuja': { name: 'Central Business District, Abuja', lat: 9.0578, lng: 7.4950 },
  'airport_abuja': { name: 'Nnamdi Azikiwe Airport, Abuja', lat: 9.0065, lng: 7.2631 },
  'ph_gra': { name: 'Aba Road / Old GRA, Port Harcourt', lat: 4.8150, lng: 7.0450 }
};

document.addEventListener('DOMContentLoaded', () => {
  initGlobalNavigation();
  initAgentState();
  initListingsManager();
  initMediaUploader();
  initModals();
  initToast();

  // Page-specific initializers
  if (document.querySelector('#properties-grid') || document.querySelector('#empty-listings-state')) {
    initListingsPage();
  }
  if (document.querySelector('#interactive-map')) {
    initInteractiveMap();
  }
  if (document.querySelector('#agent-reg-form') || document.querySelector('#agent-active-dashboard')) {
    initAgentPortalPage();
  }
  if (document.querySelector('#payment-page-container')) {
    initPaymentPage();
  }
  if (document.querySelector('#valuation-page-container') || document.querySelector('#btn-calculate-valuation')) {
    initValuationPage();
  }
});

/* ==========================================================================
   Global Navigation
   ========================================================================== */
function initGlobalNavigation() {
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else if (href && !href.startsWith('#')) {
      link.classList.remove('active');
    }
  });

  const menuBtn = document.querySelector('#mobile-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        const isFlex = navLinks.style.display === 'flex';
        navLinks.style.display = isFlex ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = '#0a0a0a';
        navLinks.style.padding = '20px';
        navLinks.style.borderBottom = '1px solid var(--yellow-500)';
      }
    });
  }

  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.querySelector('#wishlist-badge');
  if (!badge) return;
  const saved = JSON.parse(localStorage.getItem('doma_wishlist') || '[]');
  badge.textContent = saved.length;
}

/* ==========================================================================
   Agent State & Persistence
   ========================================================================== */
function initAgentState() {
  const rawAgent = localStorage.getItem('doma_agent');
  if (rawAgent) {
    try {
      currentAgent = JSON.parse(rawAgent);
    } catch (e) {
      currentAgent = null;
    }
  }

  const navAgentBtn = document.querySelector('#nav-agent-cta-btn');
  if (navAgentBtn) {
    if (currentAgent) {
      navAgentBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Agent: ${currentAgent.name.split(' ')[0]}</span>
      `;
      navAgentBtn.setAttribute('href', 'agent-portal.html');
    } else {
      navAgentBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        <span>Agent Register</span>
      `;
      navAgentBtn.setAttribute('href', 'agent-portal.html');
    }
  }
}

/* ==========================================================================
   Listings Storage & Rendering (Empty by default)
   ========================================================================== */
function initListingsManager() {
  const saved = localStorage.getItem('doma_listings');
  currentListings = saved ? JSON.parse(saved) : [];
}

function initListingsPage() {
  renderListingsGrid('all');

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      renderListingsGrid(filter);
    });
  });

  const searchInput = document.querySelector('#listings-search-input');
  const searchBtn = document.querySelector('#listings-search-btn');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const q = searchInput.value.toLowerCase().trim();
      renderListingsGrid('all', q);
      focusMapOnLocation(q);
    });
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.toLowerCase().trim();
        renderListingsGrid('all', q);
        focusMapOnLocation(q);
      }
    });
  }

  const uploadBtn = document.querySelector('#btn-quick-upload-trigger');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentAgent) {
        showToast('Please register as an agent first to upload listings.');
        setTimeout(() => { window.location.href = 'agent-portal.html'; }, 800);
      } else {
        openUploadModal();
      }
    });
  }

  const emptyRegBtn = document.querySelector('#btn-empty-state-register');
  if (emptyRegBtn) {
    emptyRegBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'agent-portal.html';
    });
  }

  // View Mode Buttons (Split / Map Only / Grid Only)
  const viewModeBtns = document.querySelectorAll('.view-mode-btn');
  const mapWrap = document.querySelector('#map-container-wrap');
  const gridWrap = document.querySelector('#properties-grid');
  const emptyWrap = document.querySelector('#empty-listings-state');

  viewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;

      if (mode === 'map') {
        if (mapWrap) mapWrap.style.display = 'block';
        if (gridWrap) gridWrap.style.display = 'none';
        if (emptyWrap) emptyWrap.style.display = 'none';
      } else if (mode === 'grid') {
        if (mapWrap) mapWrap.style.display = 'none';
        if (currentListings.length > 0) {
          if (gridWrap) gridWrap.style.display = 'grid';
        } else {
          if (emptyWrap) emptyWrap.style.display = 'block';
        }
      } else { // split
        if (mapWrap) mapWrap.style.display = 'block';
        if (currentListings.length > 0) {
          if (gridWrap) gridWrap.style.display = 'grid';
        } else {
          if (emptyWrap) emptyWrap.style.display = 'block';
        }
      }

      if (leafletMap) {
        setTimeout(() => leafletMap.invalidateSize(), 200);
      }
    });
  });

  const recenterBtn = document.querySelector('#btn-recenter-map');
  if (recenterBtn && leafletMap) {
    recenterBtn.addEventListener('click', () => {
      leafletMap.setView([6.5244, 3.3792], 12);
      showToast('Map centered on Lagos / Nigeria');
    });
  }
}

function renderListingsGrid(filter = 'all', searchQuery = '') {
  const grid = document.querySelector('#properties-grid');
  const emptyState = document.querySelector('#empty-listings-state');
  if (!grid || !emptyState) return;

  grid.innerHTML = '';

  let filtered = currentListings;
  if (filter === 'house') {
    filtered = currentListings.filter(l => l.type === 'house');
  } else if (filter === 'store') {
    filtered = currentListings.filter(l => l.type === 'store');
  } else if (filter === 'my-listings') {
    filtered = currentListings.filter(l => l.agentId === (currentAgent ? currentAgent.id : ''));
  }

  if (searchQuery) {
    filtered = filtered.filter(l => 
      (l.title && l.title.toLowerCase().includes(searchQuery)) ||
      (l.area && l.area.toLowerCase().includes(searchQuery)) ||
      (l.state && l.state.toLowerCase().includes(searchQuery))
    );
  }

  const mapWrap = document.querySelector('#map-container-wrap');
  const isMapOnly = document.querySelector('.view-mode-btn.active')?.dataset.mode === 'map';

  if (filtered.length === 0) {
    if (!isMapOnly) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
    }

    const titleEl = emptyState.querySelector('.empty-state-title');
    const descEl = emptyState.querySelector('.empty-state-desc');

    if (searchQuery) {
      if (titleEl) titleEl.textContent = `No listings found for "${searchQuery}"`;
      if (descEl) descEl.textContent = 'Check the interactive map or register to upload a listing here!';
    } else if (filter === 'my-listings') {
      if (titleEl) titleEl.textContent = 'You Have Not Uploaded Any Listings Yet';
      if (descEl) descEl.textContent = 'Click "Upload Property / Store" to add your first house or store!';
    } else {
      if (titleEl) titleEl.textContent = 'No Listings Uploaded Yet';
      if (descEl) descEl.textContent = 'The marketplace is completely empty and ready for fresh verified listings. Register as an agent to upload pictures or videos of houses for rent or stores to-let.';
    }
  } else {
    if (!isMapOnly) {
      grid.style.display = 'grid';
    }
    emptyState.style.display = 'none';

    filtered.forEach(item => {
      const card = createPropertyCardElement(item);
      grid.appendChild(card);
    });
  }

  // Update map markers
  if (leafletMap) {
    refreshMapMarkers(filtered);
  }
}

function createPropertyCardElement(item) {
  const article = document.createElement('article');
  article.className = 'property-card';
  article.dataset.category = item.type;

  let mediaHtml = '';
  if (item.media && item.media.length > 0) {
    const main = item.media[0];
    if (main.type === 'video') {
      mediaHtml = `
        <video controls playsinline preload="metadata">
          <source src="${main.url}">
          Your browser does not support video playback.
        </video>
      `;
    } else {
      mediaHtml = `<img src="${main.url}" alt="${item.title}" class="card-img" loading="lazy">`;
    }
  } else {
    mediaHtml = `
      <div style="width:100%; height:100%; background: #141414; display: flex; align-items: center; justify-content: center; color: var(--yellow-500);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
      </div>
    `;
  }

  const isHouse = item.type === 'house';
  const badgeText = isHouse ? 'HOUSE FOR RENT' : 'STORE TO LET';
  const badgeClass = isHouse ? 'card-badge' : 'card-badge gold';
  const cleanPhone = (item.agentPhone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I saw your listing on DOMA: "${item.title}" (${item.priceFormatted}) in ${item.area}, ${item.state}. Is it available?`)}`;
  const isMyListing = currentAgent && item.agentId === currentAgent.id;

  article.innerHTML = `
    <div class="card-media-wrapper">
      ${mediaHtml}
      <span class="${badgeClass}">${badgeText}</span>
      <button class="btn-favorite" data-id="${item.id}" aria-label="Save listing">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
    <div class="card-content">
      <div class="card-price">${item.priceFormatted} <span>${item.period}</span></div>
      <h3 class="card-title">${item.title}</h3>
      <div class="card-location">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--yellow-500)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        ${item.address ? `${item.address}, ` : ''}${item.area}, ${item.state}
      </div>
      <div class="card-specs">
        <div class="spec-item">${item.spec1}</div>
        <div class="spec-item">${item.spec2}</div>
        <div class="spec-item">Media: <strong>${item.media ? item.media.length : 0}</strong></div>
      </div>
      <div class="card-footer">
        <div class="agent-info">
          <div class="agent-avatar">${item.agentName ? item.agentName[0].toUpperCase() : 'A'}</div>
          <div>
            <div class="agent-name">${item.agentName}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${item.agentAgency || 'Verified Agent'}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-action" style="color: #22c55e;" title="Chat WhatsApp">
            WhatsApp 💬
          </a>
          <button class="btn-card-action btn-find-directions-trigger" style="color: var(--yellow-500);" data-id="${item.id}">
            Directions 🚗
          </button>
        </div>
      </div>
      ${isMyListing ? `
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: flex-end;">
          <button class="btn-delete-listing" data-id="${item.id}" style="color: #ef4444; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
            🗑️ Delete My Listing
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // Favorite toggle
  const favBtn = article.querySelector('.btn-favorite');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let wishlist = JSON.parse(localStorage.getItem('doma_wishlist') || '[]');
      const id = item.id;
      if (wishlist.includes(id)) {
        wishlist = wishlist.filter(x => x !== id);
        favBtn.classList.remove('saved');
        showToast('Removed from saved wishlist');
      } else {
        wishlist.push(id);
        favBtn.classList.add('saved');
        showToast('Saved to wishlist ❤️');
      }
      localStorage.setItem('doma_wishlist', JSON.stringify(wishlist));
      updateWishlistBadge();
    });
  }

  // Directions trigger button
  const dirBtn = article.querySelector('.btn-find-directions-trigger');
  if (dirBtn) {
    dirBtn.addEventListener('click', () => {
      openDirectionsForListing(item);
    });
  }

  // Delete button
  const deleteBtn = article.querySelector('.btn-delete-listing');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete listing "${item.title}"?`)) {
        currentListings = currentListings.filter(l => l.id !== item.id);
        localStorage.setItem('doma_listings', JSON.stringify(currentListings));
        renderListingsGrid();
        showToast('Listing removed successfully.');
      }
    });
  }

  return article;
}

/* ==========================================================================
   Interactive Map Engine (Leaflet + Dark Theme + Pinned Listings)
   ========================================================================== */
function initInteractiveMap() {
  const mapEl = document.querySelector('#interactive-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Initialize Map centered on Nigeria (Lagos primary viewport)
  leafletMap = L.map('interactive-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([6.4474, 3.4723], 12);

  // OpenStreetMap Public Tile Service (Free, 100% open, zero API key required)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(leafletMap);

  refreshMapMarkers(currentListings);
}

function refreshMapMarkers(listingsToDisplay = currentListings) {
  if (!leafletMap || typeof L === 'undefined') return;

  // Clear existing markers
  mapMarkers.forEach(m => leafletMap.removeLayer(m));
  mapMarkers = [];

  const countBadge = document.querySelector('#map-pinned-count');
  if (countBadge) {
    countBadge.textContent = `${listingsToDisplay.length} Properties Pinned`;
  }

  if (listingsToDisplay.length === 0) {
    return;
  }

  const bounds = [];

  listingsToDisplay.forEach(item => {
    const lat = item.lat || 6.4474;
    const lng = item.lng || 3.4723;
    bounds.push([lat, lng]);

    // Custom Yellow Icon HTML
    const iconHtml = `
      <div class="custom-yellow-marker">
        <span>${item.type === 'store' ? '🏪' : '🏠'}</span>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMap);

    // Popup Content
    const mediaThumb = item.media && item.media[0] ? item.media[0].url : '';
    const popupHtml = `
      <div class="map-popup-card">
        ${mediaThumb ? `<img src="${mediaThumb}" class="map-popup-img" alt="${item.title}">` : ''}
        <div class="map-popup-price">${item.priceFormatted} <span style="font-size:0.75rem; color:#888;">${item.period}</span></div>
        <div class="map-popup-title">${item.title}</div>
        <div style="font-size:0.78rem; color:#bbb; margin-bottom:8px;">📍 ${item.area}, ${item.state}</div>
        <button class="btn-popup-directions" onclick="triggerDirectionsById('${item.id}')">
          🚗 Find Directions
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    mapMarkers.push(marker);
  });

  if (bounds.length > 0) {
    leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

window.triggerDirectionsById = function(id) {
  const item = currentListings.find(l => l.id === id);
  if (item) {
    openDirectionsForListing(item);
  }
};

function focusMapOnLocation(searchTerm) {
  if (!leafletMap || !searchTerm) return;
  const lower = searchTerm.toLowerCase();

  for (const [key, geo] of Object.entries(NIGERIAN_GEO_DIRECTORY)) {
    if (lower.includes(key) || key.includes(lower)) {
      leafletMap.flyTo([geo.lat, geo.lng], 13, { duration: 1.2 });
      showToast(`📍 Map focused on ${geo.landmark}`);
      return;
    }
  }
}

/* ==========================================================================
   Find Directions Engine (Route Polyline + GPS Steps)
   ========================================================================== */
function openDirectionsForListing(item) {
  const modal = document.querySelector('#directions-modal');
  if (!modal) return;

  const destName = document.querySelector('#directions-dest-name');
  const startSelect = document.querySelector('#directions-start-select');
  const googleBtn = document.querySelector('#btn-open-google-maps');

  if (destName) {
    destName.textContent = `${item.title} — ${item.address ? item.address + ', ' : ''}${item.area}, ${item.state}`;
  }

  const destLat = item.lat || 6.4474;
  const destLng = item.lng || 3.4723;

  // Google Maps Deep Link URL (Standard consumer directions, no API key required)
  if (googleBtn) {
    const fullQuery = encodeURIComponent(`${item.title} ${item.address || ''} ${item.area} ${item.state} Nigeria`);
    googleBtn.href = `https://www.google.com/maps/dir/?destination=${destLat},${destLng}&query=${fullQuery}`;
  }

  // Calculate & Render Route Steps
  calculateAndDrawRoute(startSelect ? startSelect.value : 'tollgate', item);

  if (startSelect) {
    startSelect.onchange = () => {
      calculateAndDrawRoute(startSelect.value, item);
    };
  }

  modal.classList.add('open');
}

function calculateAndDrawRoute(startKey, item) {
  const hub = STARTING_HUBS[startKey] || STARTING_HUBS['tollgate'];
  const destLat = item.lat || 6.4474;
  const destLng = item.lng || 3.4723;

  // Haversine distance estimation
  const R = 6371; // km
  const dLat = (destLat - hub.lat) * Math.PI / 180;
  const dLon = (destLng - hub.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(hub.lat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const directDist = Math.max(1.5, R * c * 1.3); // account for road curves
  const driveMinutes = Math.round(directDist * 2.8); // avg city speed in Nigeria

  // Update UI Stats
  const timeEl = document.querySelector('#route-est-time');
  const distEl = document.querySelector('#route-est-distance');
  const trafficEl = document.querySelector('#route-traffic-status');

  if (timeEl) timeEl.textContent = `${driveMinutes} Mins`;
  if (distEl) distEl.textContent = `${directDist.toFixed(1)} km`;
  if (trafficEl) {
    if (driveMinutes > 40) {
      trafficEl.textContent = '🟡 Moderate Traffic';
      trafficEl.style.color = 'var(--yellow-500)';
      trafficEl.style.borderColor = 'var(--yellow-500)';
    } else {
      trafficEl.textContent = '🟢 Light Traffic';
      trafficEl.style.color = '#22c55e';
      trafficEl.style.borderColor = '#22c55e';
    }
  }

  // Turn-by-Turn Steps
  const stepsList = document.querySelector('#directions-steps-list');
  if (stepsList) {
    stepsList.innerHTML = `
      <li class="directions-step-item">
        <span class="step-num-badge">1</span>
        <div>Depart from <strong>${hub.name}</strong> and merge onto the main arterial road.</div>
      </li>
      <li class="directions-step-item">
        <span class="step-num-badge">2</span>
        <div>Drive for approximately <strong>${(directDist * 0.6).toFixed(1)} km</strong> following navigation signs towards ${item.area}.</div>
      </li>
      <li class="directions-step-item">
        <span class="step-num-badge">3</span>
        <div>Turn towards <strong>${item.address || item.area}</strong>.</div>
      </li>
      <li class="directions-step-item">
        <span class="step-num-badge">4</span>
        <div>Arrive at destination: <strong style="color:var(--yellow-500);">${item.title}</strong> (${item.state}).</div>
      </li>
    `;
  }

  // Draw Animated Yellow Route Polyline on Map
  if (leafletMap && typeof L !== 'undefined') {
    if (currentRoutePolyline) {
      leafletMap.removeLayer(currentRoutePolyline);
    }

    // Midpoints for natural curved road preview
    const midLat = (hub.lat + destLat) / 2 + 0.005;
    const midLng = (hub.lng + destLng) / 2 - 0.005;

    currentRoutePolyline = L.polyline([
      [hub.lat, hub.lng],
      [midLat, midLng],
      [destLat, destLng]
    ], {
      color: '#ffd000',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8'
    }).addTo(leafletMap);

    leafletMap.fitBounds(currentRoutePolyline.getBounds(), { padding: [60, 60] });
  }
}

/* ==========================================================================
   Agent Portal Page Logic
   ========================================================================== */
function initAgentPortalPage() {
  const regForm = document.querySelector('#agent-reg-form');
  const logoutBtn = document.querySelector('#btn-agent-logout');
  const payFeeBtn = document.querySelector('#btn-pay-agent-fee');
  const openUploadBtn = document.querySelector('#btn-open-upload-modal');

  updateAgentPortalView();

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#agent-fullname').value.trim();
      const agency = document.querySelector('#agent-agency').value.trim();
      const phone = document.querySelector('#agent-phone').value.trim();
      const email = document.querySelector('#agent-email').value.trim();
      const state = document.querySelector('#agent-state').value;
      const nin = document.querySelector('#agent-nin').value.trim();

      currentAgent = {
        id: 'AG-' + Date.now().toString(36),
        name,
        agency,
        phone,
        email,
        state,
        nin,
        registeredAt: new Date().toLocaleDateString()
      };

      localStorage.setItem('doma_agent', JSON.stringify(currentAgent));
      updateAgentState();
      updateAgentPortalView();
      showToast(`Welcome, Agent ${name}! Registration completed. ✨`);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('doma_agent');
      currentAgent = null;
      updateAgentState();
      updateAgentPortalView();
      showToast('Logged out of agent dashboard.');
    });
  }

  if (payFeeBtn) {
    payFeeBtn.addEventListener('click', () => {
      window.location.href = 'payment.html?service=verification';
    });
  }

  if (openUploadBtn) {
    openUploadBtn.addEventListener('click', () => {
      openUploadModal();
    });
  }
}

function updateAgentPortalView() {
  const activeDash = document.querySelector('#agent-active-dashboard');
  const regBox = document.querySelector('#agent-registration-box');
  const uploadStudio = document.querySelector('#agent-upload-studio');

  if (currentAgent) {
    if (activeDash) activeDash.style.display = 'flex';
    if (regBox) regBox.style.display = 'none';
    if (uploadStudio) uploadStudio.style.display = 'block';

    const displayName = document.querySelector('#agent-display-name');
    const displayAgency = document.querySelector('#agent-display-agency');
    const badgeInitials = document.querySelector('#agent-badge-initials');

    if (displayName) displayName.textContent = currentAgent.name;
    if (displayAgency) displayAgency.textContent = `${currentAgent.agency} • ${currentAgent.state}, Nigeria`;
    if (badgeInitials) {
      const parts = currentAgent.name.split(' ');
      badgeInitials.textContent = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }

    const phoneInput = document.querySelector('#listing-agent-phone');
    if (phoneInput && !phoneInput.value) phoneInput.value = currentAgent.phone;

    renderAgentMyListings();
  } else {
    if (activeDash) activeDash.style.display = 'none';
    if (regBox) regBox.style.display = 'block';
    if (uploadStudio) uploadStudio.style.display = 'none';
  }
}

function renderAgentMyListings() {
  const container = document.querySelector('#agent-my-listings-container');
  if (!container || !currentAgent) return;

  const myListings = currentListings.filter(l => l.agentId === currentAgent.id);
  if (myListings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px; background: #141414; border-radius: var(--radius-md); border: 1px dashed var(--glass-border);">
        <p style="color: var(--text-secondary); margin-bottom: 12px;">You haven't uploaded any listings yet.</p>
        <button class="btn-primary" onclick="openUploadModal()">+ Upload Your First House or Store</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        ${myListings.map(l => `
          <div style="background: #141414; border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="card-badge ${l.type === 'store' ? 'gold' : ''}">${l.type === 'store' ? 'STORE' : 'HOUSE'}</span>
              <span style="font-weight: 800; color: var(--yellow-500);">${l.priceFormatted}</span>
            </div>
            <h4 style="font-size: 0.95rem; color: var(--text-white); margin-bottom: 6px;">${l.title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">📍 ${l.area}, ${l.state}</p>
            <div style="display: flex; justify-content: space-between;">
              <a href="listings.html" style="font-size: 0.82rem; color: var(--yellow-500); font-weight: 700;">View in Portal →</a>
              <button onclick="deleteListingById('${l.id}')" style="color: #ef4444; font-size: 0.82rem; font-weight: 700; cursor: pointer;">Delete 🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

window.deleteListingById = function(id) {
  if (confirm('Are you sure you want to delete this listing?')) {
    currentListings = currentListings.filter(l => l.id !== id);
    localStorage.setItem('doma_listings', JSON.stringify(currentListings));
    renderAgentMyListings();
    showToast('Listing deleted successfully.');
  }
};

/* ==========================================================================
   Media Uploader (Pictures & Videos) & Coordinates Auto-Mapping
   ========================================================================== */
function initMediaUploader() {
  const dropzones = document.querySelectorAll('.media-dropzone');
  const fileInputs = document.querySelectorAll('.listing-media-input');
  const previewGrids = document.querySelectorAll('.media-preview-grid');

  dropzones.forEach((dropzone, idx) => {
    const input = fileInputs[idx];
    const preview = previewGrids[idx];
    if (!input) return;

    dropzone.addEventListener('click', () => input.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files, preview);
    });

    input.addEventListener('change', () => {
      if (input.files) handleFiles(input.files, preview);
    });
  });

  function handleFiles(files, previewGrid) {
    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isImage && !isVideo) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedMediaFiles.push({
          type: isVideo ? 'video' : 'image',
          url: e.target.result,
          name: file.name
        });
        renderPreviews(previewGrid);
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPreviews(previewGrid) {
    if (!previewGrid) return;
    previewGrid.innerHTML = uploadedMediaFiles.map(item => `
      <div class="media-preview-item">
        ${item.type === 'video' ? `<video src="${item.url}" muted></video>` : `<img src="${item.url}" alt="Preview">`}
        <span class="media-preview-tag">${item.type.toUpperCase()}</span>
      </div>
    `).join('');
  }

  // Upload Form Handlers
  const uploadForms = document.querySelectorAll('.upload-listing-form');
  uploadForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!currentAgent) {
        showToast('Please register as an agent first.');
        setTimeout(() => { window.location.href = 'agent-portal.html'; }, 800);
        return;
      }

      const listingType = form.querySelector('input[name="listing-type"]:checked')?.value || 'house';
      const title = form.querySelector('[name="listing-title"]').value.trim();
      const rawPrice = parseFloat(form.querySelector('[name="listing-price"]').value) || 0;
      const period = form.querySelector('[name="listing-period"]').value;
      const state = form.querySelector('[name="listing-state"]').value;
      const area = form.querySelector('[name="listing-area"]').value.trim();
      const address = form.querySelector('[name="listing-address"]').value.trim();
      const spec1 = form.querySelector('[name="listing-specs-1"]')?.value.trim() || (listingType === 'house' ? '3 Bedrooms' : '50 Sq M');
      const spec2 = form.querySelector('[name="listing-specs-2"]')?.value.trim() || (listingType === 'house' ? '2 Bathrooms' : 'Prime Storefront');
      const agentPhone = form.querySelector('[name="listing-agent-phone"]')?.value.trim() || currentAgent.phone;

      // Geocoding Coordinates Match
      const coords = matchCoordinatesForArea(state, area);

      const newListing = {
        id: 'DOMA-' + Date.now().toString(36),
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        agentAgency: currentAgent.agency,
        agentPhone,
        type: listingType,
        title,
        price: rawPrice,
        priceFormatted: `₦${rawPrice.toLocaleString()}`,
        period,
        state,
        area,
        address,
        spec1,
        spec2,
        lat: coords.lat,
        lng: coords.lng,
        media: [...uploadedMediaFiles],
        createdAt: new Date().toISOString()
      };

      currentListings.unshift(newListing);
      localStorage.setItem('doma_listings', JSON.stringify(currentListings));

      // Reset
      form.reset();
      uploadedMediaFiles = [];
      document.querySelectorAll('.media-preview-grid').forEach(g => g.innerHTML = '');
      closeModal('#upload-modal');

      showToast(`Success! "${title}" is now live and pinned on map! 🚀`);

      if (document.querySelector('#properties-grid')) {
        renderListingsGrid('all');
        const listingsSec = document.querySelector('#listings-section');
        if (listingsSec) listingsSec.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => { window.location.href = 'listings.html'; }, 900);
      }
    });
  });
}

function matchCoordinatesForArea(state, area) {
  const combined = (area + ' ' + state).toLowerCase();
  for (const [key, geo] of Object.entries(NIGERIAN_GEO_DIRECTORY)) {
    if (combined.includes(key)) {
      // Small jitter so pins in same area don't stack directly on top of each other
      const jitterLat = (Math.random() - 0.5) * 0.008;
      const jitterLng = (Math.random() - 0.5) * 0.008;
      return { lat: geo.lat + jitterLat, lng: geo.lng + jitterLng };
    }
  }

  // Default fallbacks by State
  if (state.toLowerCase().includes('abuja')) {
    return { lat: 9.0765 + (Math.random() - 0.5) * 0.02, lng: 7.3986 + (Math.random() - 0.5) * 0.02 };
  } else if (state.toLowerCase().includes('rivers')) {
    return { lat: 4.8156 + (Math.random() - 0.5) * 0.02, lng: 7.0498 + (Math.random() - 0.5) * 0.02 };
  } else if (state.toLowerCase().includes('oyo')) {
    return { lat: 7.4345 + (Math.random() - 0.5) * 0.02, lng: 3.9065 + (Math.random() - 0.5) * 0.02 };
  }

  // Default Lagos Center
  return { lat: 6.4474 + (Math.random() - 0.5) * 0.03, lng: 3.4723 + (Math.random() - 0.5) * 0.03 };
}

function openUploadModal() {
  const modal = document.querySelector('#upload-modal');
  if (modal) modal.classList.add('open');
}

/* ==========================================================================
   Naira Payment Page Logic
   ========================================================================== */
function initPaymentPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  
  let currentAmount = 5000;
  let currentTitle = 'Agent Verification & Verified Badge';

  if (serviceParam === 'featured') {
    currentAmount = 10000;
    currentTitle = 'Featured Listing Homepage Boost';
  } else if (serviceParam === 'inspection') {
    currentAmount = 5000;
    currentTitle = 'Tenant Inspection Holding Deposit';
  }

  updatePaymentDisplays(currentAmount, currentTitle);

  const serviceCards = document.querySelectorAll('.service-package-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentAmount = parseInt(card.dataset.amount);
      currentTitle = card.dataset.title;
      updatePaymentDisplays(currentAmount, currentTitle);
      showToast(`Selected: ${currentTitle} (₦${currentAmount.toLocaleString()})`);
    });
  });

  const tabs = document.querySelectorAll('.pay-channel-tab');
  const cardView = document.querySelector('#pay-card-form');
  const transferView = document.querySelector('#pay-transfer-view');
  const ussdView = document.querySelector('#pay-ussd-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const ch = tab.dataset.channel;
      if (cardView) cardView.style.display = ch === 'card' ? 'block' : 'none';
      if (transferView) transferView.style.display = ch === 'transfer' ? 'block' : 'none';
      if (ussdView) ussdView.style.display = ch === 'ussd' ? 'block' : 'none';
    });
  });

  if (cardView) {
    cardView.addEventListener('submit', (e) => {
      e.preventDefault();
      processPaymentSuccess('Debit Card (Verve/Mastercard)', currentAmount, currentTitle);
    });
  }

  const transferBtn = document.querySelector('#btn-confirm-transfer');
  if (transferBtn) {
    transferBtn.addEventListener('click', () => {
      processPaymentSuccess('Providus Bank Transfer', currentAmount, currentTitle);
    });
  }

  const ussdBtn = document.querySelector('#btn-confirm-ussd');
  if (ussdBtn) {
    ussdBtn.addEventListener('click', () => {
      processPaymentSuccess('USSD Mobile Code', currentAmount, currentTitle);
    });
  }

  const copyBtn = document.querySelector('#btn-copy-account');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('9948201948').then(() => {
        showToast('Account Number 9948201948 copied to clipboard! 📋');
      });
    });
  }

  function updatePaymentDisplays(amt, title) {
    const disp = document.querySelector('#pay-amount-display');
    const desc = document.querySelector('#pay-desc-display');
    const btnLabel = document.querySelector('#pay-btn-label');
    const transferAmt = document.querySelector('#transfer-amount-display');

    if (disp) disp.textContent = `₦${amt.toLocaleString()}`;
    if (desc) desc.textContent = title;
    if (btnLabel) btnLabel.textContent = `₦${amt.toLocaleString()}`;
    if (transferAmt) transferAmt.textContent = `₦${amt.toLocaleString()}`;
  }

  function processPaymentSuccess(channel, amt, title) {
    const receiptBox = document.querySelector('#payment-receipt-box');
    const checkoutBox = document.querySelector('#payment-checkout-box');
    
    if (checkoutBox) checkoutBox.style.display = 'none';
    if (receiptBox) {
      receiptBox.style.display = 'block';
      receiptBox.querySelector('#receipt-amount').textContent = `₦${amt.toLocaleString()}`;
      receiptBox.querySelector('#receipt-channel').textContent = channel;
      receiptBox.querySelector('#receipt-desc').textContent = title;
      receiptBox.querySelector('#receipt-ref').textContent = 'DOMA-NG-' + Math.floor(100000 + Math.random() * 900000);
      receiptBox.querySelector('#receipt-date').textContent = new Date().toLocaleString();
    }

    showToast(`Payment of ₦${amt.toLocaleString()} successful! Receipt generated. 🎉`);
  }
}

/* ==========================================================================
   Valuation & Budgeting Calculator Logic
   ========================================================================== */
function initValuationPage() {
  const calcBtn = document.querySelector('#btn-calculate-valuation');
  const amountDisp = document.querySelector('#valuation-result-amount');
  const rangeDisp = document.querySelector('#valuation-result-range');

  if (calcBtn && amountDisp) {
    calcBtn.addEventListener('click', () => {
      calcBtn.textContent = 'Analyzing Comps...';
      setTimeout(() => {
        const type = document.querySelector('#val-type')?.value || 'residential';
        const base = type === 'store' ? 3800000 : 4500000;
        const low = Math.round(base * 0.93 / 100000) * 100000;
        const high = Math.round(base * 1.07 / 100000) * 100000;

        amountDisp.textContent = `₦${base.toLocaleString()}/yr`;
        if (rangeDisp) {
          rangeDisp.textContent = `Estimated Range: ₦${low.toLocaleString()} – ₦${high.toLocaleString()}`;
        }
        calcBtn.textContent = 'Recalculate Valuation';
        showToast('Valuation estimated in Naira ✨');
      }, 500);
    });
  }

  const priceSlider = document.querySelector('#mortgage-price');
  const depositSlider = document.querySelector('#mortgage-deposit');
  const monthlyDisp = document.querySelector('#mortgage-monthly-amount');
  const priceVal = document.querySelector('#val-mortgage-price');
  const depositVal = document.querySelector('#val-mortgage-deposit');

  function updateBudget() {
    if (!priceSlider) return;
    const price = parseFloat(priceSlider.value);
    const depositPct = parseFloat(depositSlider ? depositSlider.value : 10);
    const depositAmt = price * (depositPct / 100);

    if (priceVal) priceVal.textContent = `₦${price.toLocaleString()}`;
    if (depositVal) depositVal.textContent = `${depositPct}% (₦${Math.round(depositAmt).toLocaleString()})`;
    if (monthlyDisp) monthlyDisp.textContent = `₦${Math.round(price / 12).toLocaleString()}`;
  }

  [priceSlider, depositSlider].forEach(s => {
    if (s) s.addEventListener('input', updateBudget);
  });
  updateBudget();
}

/* ==========================================================================
   Modals & Toast
   ========================================================================== */
function initModals() {
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    });
  });

  const viewingForm = document.querySelector('#viewing-form');
  if (viewingForm) {
    viewingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal('#schedule-modal');
      showToast('Inspection request booked! The agent will reach out on WhatsApp/Phone.');
      viewingForm.reset();
    });
  }
}

function closeModal(selector) {
  const modal = document.querySelector(selector);
  if (modal) modal.classList.remove('open');
}

function initToast() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message) {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--yellow-500)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
