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
let currentUserGps = null; // { lat, lng, accuracy, isSimulated }
let userGpsMarker = null; // Pulsating blue user location marker
let streetTileLayer = null;
let satelliteTileLayer = null;
let currentTileLayerType = 'dark'; // 'dark' | 'streets' | 'satellite'
let currentActiveMarker = null;

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
  'sabo': { lat: 6.5050, lng: 3.3760, state: 'Lagos', landmark: 'Sabo Commercial Hub, Yaba' },
  'akoka': { lat: 6.5173, lng: 3.3934, state: 'Lagos', landmark: 'UNILAG Gate / Akoka Student Corridor' },
  'unilag': { lat: 6.5173, lng: 3.3934, state: 'Lagos', landmark: 'University of Lagos (UNILAG), Akoka' },
  'yabatech': { lat: 6.5126, lng: 3.3752, state: 'Lagos', landmark: 'Yaba College of Technology' },
  'lasu': { lat: 6.4678, lng: 3.1994, state: 'Lagos', landmark: 'Lagos State University (LASU), Ojo' },
  'ojo': { lat: 6.4678, lng: 3.1994, state: 'Lagos', landmark: 'Ojo / LASU Campus Corridor' },
  'iba': { lat: 6.4950, lng: 3.2080, state: 'Lagos', landmark: 'Iba / LASU Road' },
  'surulere': { lat: 6.4969, lng: 3.3533, state: 'Lagos', landmark: 'Adeniran Ogunsanya, Surulere' },
  'gbagada': { lat: 6.5542, lng: 3.3886, state: 'Lagos', landmark: 'Gbagada Phase 2' },
  'magodo': { lat: 6.6212, lng: 3.3802, state: 'Lagos', landmark: 'Magodo Phase 2 GRA' },
  'maryland': { lat: 6.5700, lng: 3.3660, state: 'Lagos', landmark: 'Maryland Mall / Ikorodu Road' },
  'festac': { lat: 6.4698, lng: 3.2833, state: 'Lagos', landmark: 'Festac Town 2nd Avenue' },
  'ajah': { lat: 6.4674, lng: 3.5678, state: 'Lagos', landmark: 'Ajah Roundabout / Badore' },
  'maitama': { lat: 9.0882, lng: 7.4934, state: 'Abuja', landmark: 'Gana Street, Maitama' },
  'wuse': { lat: 9.0722, lng: 7.4716, state: 'Abuja', landmark: 'Aminu Kano Crescent, Wuse 2' },
  'garki': { lat: 9.0345, lng: 7.4877, state: 'Abuja', landmark: 'Area 11, Garki' },
  'jabi': { lat: 9.0728, lng: 7.4258, state: 'Abuja', landmark: 'Jabi Lake Mall Corridor' },
  'gwarinpa': { lat: 9.1090, lng: 7.4110, state: 'Abuja', landmark: '3rd Avenue, Gwarinpa Estate' },
  'guzape': { lat: 9.0272, lng: 7.5186, state: 'Abuja', landmark: 'Guzape Hills' },
  'asokoro': { lat: 9.0435, lng: 7.5255, state: 'Abuja', landmark: 'Yakubu Gowon Cres, Asokoro' },
  'port harcourt': { lat: 4.8156, lng: 7.0498, state: 'Rivers', landmark: 'Old GRA, Port Harcourt' },
  'uniport': { lat: 4.9032, lng: 6.9234, state: 'Rivers', landmark: 'University of Port Harcourt (UNIPORT), Choba' },
  'choba': { lat: 4.8970, lng: 6.9180, state: 'Rivers', landmark: 'Choba Campus Corridor, Port Harcourt' },
  'alakahia': { lat: 4.8920, lng: 6.9250, state: 'Rivers', landmark: 'Alakahia / UNIPORT Teaching Hospital' },
  'ibadan': { lat: 7.4345, lng: 3.9065, state: 'Oyo', landmark: 'Bodija Estate, Ibadan' },
  'ui': { lat: 7.4443, lng: 3.9003, state: 'Oyo', landmark: 'University of Ibadan (UI), Agbowo' },
  'agbowo': { lat: 7.4410, lng: 3.9030, state: 'Oyo', landmark: 'Agbowo, UI Corridor, Ibadan' },
  'bodija': { lat: 7.4350, lng: 3.9100, state: 'Oyo', landmark: 'Old Bodija / UI Corridor, Ibadan' }
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

// Security: HTML entity escaper to prevent stored XSS
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Media: Canvas-based client-side image downscaler to stay within browser storage quota
function compressImage(file, maxDimension = 1000, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Demo Listings for Nigerian testing corridors
// Demo Listings for Nigerian testing corridors (Including Student Housing < ₦300k)
const DEMO_LISTINGS = [
  {
    id: 'DOMA-student-unilag',
    agentId: 'demo-agent-unilag',
    agentName: 'Kayode Alabi',
    agentAgency: 'Yaba Student Realty & Co',
    agentPhone: '+2348033344556',
    type: 'student',
    title: 'Modern Tiled Self-Contain with Personal Bathroom & Running Water',
    price: 250000,
    priceFormatted: '₦250,000',
    period: '/year',
    state: 'Lagos',
    area: 'Akoka, Yaba',
    address: 'Saint Finbarr\'s College Road, Akoka',
    campus: 'UNILAG (Akoka)',
    campusDist: '5 mins walk to UNILAG New Gate',
    spec1: 'Self-Contain Room',
    spec2: 'Pre-paid Meter & Borehole',
    lat: 6.5173,
    lng: 3.3934,
    media: [{ type: 'image', url: 'assets/images/hero_student_hostel.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-student-ui',
    agentId: 'demo-agent-ui',
    agentName: 'Biodun Adekunle',
    agentAgency: 'Premier Campus Homes Ibadan',
    agentPhone: '+2348021122334',
    type: 'student',
    title: 'Student Off-Campus Studio Flat in Gated Security Compound',
    price: 180000,
    priceFormatted: '₦180,000',
    period: '/year',
    state: 'Oyo',
    area: 'Agbowo, Ibadan',
    address: 'Agbowo Expressway, near UI 2nd Gate',
    campus: 'UI (Ibadan)',
    campusDist: '4 mins walk to UI Main Gate',
    spec1: 'Studio Room & Bath',
    spec2: 'Fenced & Security Guard',
    lat: 7.4410,
    lng: 3.9030,
    media: [{ type: 'image', url: 'assets/images/hero_budget_selfcon.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-student-uniport',
    agentId: 'demo-agent-uniport',
    agentName: 'Tamuno Briggs',
    agentAgency: 'Garden City Real Estate',
    agentPhone: '+2348055566778',
    type: 'student',
    title: 'Decent Student Self-Contain Flat near Delta Campus',
    price: 220000,
    priceFormatted: '₦220,000',
    period: '/year',
    state: 'Rivers',
    area: 'Choba, Port Harcourt',
    address: 'Choba Extension, Port Harcourt',
    campus: 'UNIPORT (Choba)',
    campusDist: '6 mins walk to Delta Park Gate',
    spec1: '1 Bed & Private Bath',
    spec2: 'Continuous Water Supply',
    lat: 4.8970,
    lng: 6.9180,
    media: [{ type: 'image', url: 'assets/images/hero_student_hostel.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-student-lasu',
    agentId: 'demo-agent-lasu',
    agentName: 'Sikiru Sanusi',
    agentAgency: 'Ojo Suburban Properties',
    agentPhone: '+2348077788990',
    type: 'student',
    title: 'Affordable Self-Contain Apartment for Students / NYSC',
    price: 280000,
    priceFormatted: '₦280,000',
    period: '/year',
    state: 'Lagos',
    area: 'Ojo / Iba',
    address: 'LASU-Iba Road, Ojo',
    campus: 'LASU (Ojo)',
    campusDist: '10 mins commute to LASU Gate',
    spec1: 'Self-Contain Unit',
    spec2: 'Tiled Floors & Secure Gate',
    lat: 6.4678,
    lng: 3.1994,
    media: [{ type: 'image', url: 'assets/images/hero_budget_selfcon.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-lekki-01',
    agentId: 'demo-agent-1',
    agentName: 'Babatunde Adeleke',
    agentAgency: 'Lekki Haven Properties Ltd',
    agentPhone: '+2348031234567',
    type: 'house',
    title: 'Luxury 4-Bedroom Semi-Detached Duplex with BQ',
    price: 8500000,
    priceFormatted: '₦8,500,000',
    period: '/year',
    state: 'Lagos',
    area: 'Lekki Phase 1',
    address: 'Off Admiralty Way, Lekki Phase 1',
    campus: 'none',
    spec1: '4 Bedrooms',
    spec2: '4 Baths + BQ',
    lat: 6.4474,
    lng: 3.4723,
    media: [{ type: 'image', url: 'assets/images/hero_modern_villa.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-ikeja-03',
    agentId: 'demo-agent-3',
    agentName: 'Segun Ogundipe',
    agentAgency: 'Mainland Premier Realty',
    agentPhone: '+2348022233445',
    type: 'house',
    title: 'Modern 3-Bedroom Serviced Apartment in Gated Estate',
    price: 5000000,
    priceFormatted: '₦5,000,000',
    period: '/year',
    state: 'Lagos',
    area: 'Ikeja GRA',
    address: 'Isaac John Street, Ikeja GRA',
    campus: 'none',
    spec1: '3 Bedrooms',
    spec2: '24hr Power & Security',
    lat: 6.5912,
    lng: 3.3515,
    media: [{ type: 'image', url: 'assets/images/hero_luxury_home.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-wuse-02',
    agentId: 'demo-agent-2',
    agentName: 'Amina Danjuma',
    agentAgency: 'Abuja Elite Commercial Realty',
    agentPhone: '+2348098765432',
    type: 'store',
    title: 'Prime Retail Corner Shop in Busy Commercial Plaza',
    price: 4500000,
    priceFormatted: '₦4,500,000',
    period: '/year',
    state: 'Abuja',
    area: 'Wuse 2',
    address: 'Aminu Kano Crescent, Wuse 2',
    campus: 'none',
    spec1: '75 Sq M Space',
    spec2: 'High Footfall Plaza',
    lat: 9.0722,
    lng: 7.4716,
    media: [{ type: 'image', url: 'assets/images/hero_commercial_store.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-ph-04',
    agentId: 'demo-agent-4',
    agentName: 'Tamuno Briggs',
    agentAgency: 'Garden City Real Estate',
    agentPhone: '+2348055566778',
    type: 'store',
    title: 'Spacious Roadside Commercial Showroom / Store',
    price: 3800000,
    priceFormatted: '₦3,800,000',
    period: '/year',
    state: 'Rivers',
    area: 'Old GRA, Port Harcourt',
    address: 'Aba Road, Old GRA',
    campus: 'none',
    spec1: '120 Sq M Showroom',
    spec2: 'Ample Customer Parking',
    lat: 4.8156,
    lng: 7.0498,
    media: [{ type: 'image', url: 'assets/images/hero_commercial_store.jpg' }],
    createdAt: new Date().toISOString()
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initGlobalNavigation();
  initAgentState();
  initListingsManager();
  initMediaUploader();
  initModals();
  initToast();

  // Page-specific initializers
  if (document.querySelector('#hero-slider-section')) {
    initHeroSlider();
  }
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
   Hero Slider (Multi-Image Carousel with Ken-Burns and Crossfade)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const thumbBtns = document.querySelectorAll('.hero-thumb-btn');
  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');
  const searchTabs = document.querySelectorAll('.search-tab');
  const categorySelect = document.getElementById('home-search-category');
  const heroTitle = document.getElementById('hero-dynamic-title');
  const heroSubtitle = document.getElementById('hero-dynamic-subtitle');

  if (!slides.length) return;

  let currentSlide = 0;
  let slideTimer = null;
  const SLIDE_DURATION = 6000;

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((s, i) => {
      if (i === currentSlide) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    thumbBtns.forEach((btn, i) => {
      if (i === currentSlide) {
        btn.classList.add('active');
        const prog = btn.querySelector('.thumb-progress');
        if (prog) {
          prog.style.animation = 'none';
          void prog.offsetWidth; // trigger reflow
          prog.style.animation = 'progressTimer 6s linear forwards';
        }
      } else {
        btn.classList.remove('active');
        const prog = btn.querySelector('.thumb-progress');
        if (prog) prog.style.animation = 'none';
      }
    });

    const activeSlideEl = slides[currentSlide];
    if (activeSlideEl) {
      const cat = activeSlideEl.dataset.category;
      const title = activeSlideEl.dataset.title;
      const sub = activeSlideEl.dataset.subtitle;

      if (title && heroTitle) {
        heroTitle.innerHTML = title + ` <br><span class="gradient-text">directly from KYC-verified agents</span>`;
      }
      if (sub && heroSubtitle) {
        heroSubtitle.textContent = sub;
      }

      // Sync search tabs
      searchTabs.forEach(t => {
        if (t.dataset.filter === cat) {
          t.classList.add('active');
        } else if (cat === 'all' && t.dataset.filter === 'all') {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });

      // Sync category select dropdown
      if (categorySelect && cat) {
        categorySelect.value = cat;
      }
    }
  }

  function startAutoSlide() {
    stopAutoSlide();
    slideTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, SLIDE_DURATION);
  }

  function stopAutoSlide() {
    if (slideTimer) clearInterval(slideTimer);
  }

  thumbBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      goToSlide(idx);
      startAutoSlide();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      startAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      startAutoSlide();
    });
  }

  const heroSec = document.getElementById('hero-slider-section');
  if (heroSec) {
    heroSec.addEventListener('mouseenter', stopAutoSlide);
    heroSec.addEventListener('mouseleave', startAutoSlide);
  }

  searchTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const filter = tab.dataset.filter;
      if (filter === 'house') { e.preventDefault(); goToSlide(0); }
      else if (filter === 'student') { e.preventDefault(); goToSlide(1); }
      else if (filter === 'store') { e.preventDefault(); goToSlide(2); }
      else if (filter === 'under-300k') { e.preventDefault(); goToSlide(3); }
    });
  });

  goToSlide(0);
  startAutoSlide();
}

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
  initUserState();
}

function initUserState() {
  const rawAgent = localStorage.getItem('doma_agent');
  if (rawAgent) {
    try {
      currentAgent = JSON.parse(rawAgent);
    } catch (e) {
      currentAgent = null;
    }
  }

  const currentUser = window.DOMA_CLOUD ? window.DOMA_CLOUD.getCurrentUser() : JSON.parse(localStorage.getItem('doma_current_user') || 'null');

  const navAgentBtn = document.querySelector('#nav-agent-cta-btn');
  const navDashLink = document.querySelector('#nav-custom-dash-link');
  const navAdminLink = document.querySelector('#nav-admin-link');

  if (navDashLink) {
    navDashLink.style.display = currentUser ? 'inline-block' : 'none';
  }
  if (navAdminLink) {
    navAdminLink.style.display = (currentUser && currentUser.role === 'admin') ? 'inline-block' : 'none';
  }

  if (navAgentBtn) {
    if (currentUser && currentUser.fullName) {
      const firstName = currentUser.fullName.split(' ')[0];
      if (currentUser.role === 'student') {
        navAgentBtn.innerHTML = `
          <span style="font-size:1rem;">🎓</span>
          <span>${escapeHtml(firstName)} (${escapeHtml((currentUser.university || 'Student').split(' ')[0])})</span>
        `;
        navAgentBtn.setAttribute('href', 'dashboard.html');
      } else if (currentUser.role === 'tenant') {
        navAgentBtn.innerHTML = `
          <span style="font-size:1rem;">🏠</span>
          <span>Tenant: ${escapeHtml(firstName)}</span>
        `;
        navAgentBtn.setAttribute('href', 'dashboard.html');
      } else if (currentUser.role === 'agent') {
        navAgentBtn.innerHTML = `
          <span style="font-size:1rem;">💼</span>
          <span>Agent: ${escapeHtml(firstName)}</span>
        `;
        navAgentBtn.setAttribute('href', 'agent-portal.html');
      } else if (currentUser.role === 'admin') {
        navAgentBtn.innerHTML = `
          <span style="font-size:1rem;">🛡️</span>
          <span>Admin Console</span>
        `;
        navAgentBtn.setAttribute('href', 'admin.html');
      }
    } else if (currentAgent && currentAgent.name) {
      const firstName = currentAgent.name.split(' ')[0];
      navAgentBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Agent: ${escapeHtml(firstName)}</span>
      `;
      navAgentBtn.setAttribute('href', 'agent-portal.html');
    } else {
      navAgentBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
        <span>Sign In / Register</span>
      `;
      navAgentBtn.setAttribute('href', 'auth.html');
    }
  }
}

function updateAgentState() {
  initUserState();
}

/* ==========================================================================
   Listings Storage & Rendering (Supabase DB + Local Cache)
   ========================================================================== */
function initListingsManager() {
  const saved = localStorage.getItem('doma_listings');
  if (saved) {
    try {
      currentListings = JSON.parse(saved);
    } catch (e) {
      currentListings = [];
    }
  } else {
    currentListings = [...DEMO_LISTINGS];
    localStorage.setItem('doma_listings', JSON.stringify(currentListings));
  }

  // Sync from Supabase in background if available
  if (window.DOMA_CLOUD && window.DOMA_CLOUD.isSupabaseConnected()) {
    window.DOMA_CLOUD.getListings().then(remoteListings => {
      if (Array.isArray(remoteListings) && remoteListings.length > 0) {
        currentListings = remoteListings;
        if (document.querySelector('#properties-grid')) {
          renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
        }
      }
    }).catch(e => console.warn('Supabase listings sync notice:', e));
  }
}

let currentCategoryFilter = 'all';
let currentSearchQuery = '';
let currentStateFilter = 'all';
let currentCampusFilter = 'all';
let currentBudgetFilter = 'all';

function initListingsPage() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('#listings-search-input');
  const searchBtn = document.querySelector('#listings-search-btn');
  const stateSelect = document.querySelector('#listings-state-filter');
  const campusSelect = document.querySelector('#listings-campus-filter');
  const budgetSelect = document.querySelector('#listings-budget-filter');

  // Parse URL query parameters (?filter=student&q=Akoka&state=Lagos&campus=unilag&budget=300000)
  const urlParams = new URLSearchParams(window.location.search);
  const urlFilter = urlParams.get('filter');
  const urlQuery = urlParams.get('q');
  const urlState = urlParams.get('state');
  const urlCampus = urlParams.get('campus');
  const urlBudget = urlParams.get('budget');

  if (urlFilter) {
    currentCategoryFilter = urlFilter;
    filterBtns.forEach(btn => {
      if (btn.dataset.filter === urlFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  if (urlQuery && searchInput) {
    currentSearchQuery = urlQuery.toLowerCase().trim();
    searchInput.value = urlQuery;
  }

  if (urlState && stateSelect) {
    currentStateFilter = urlState;
    stateSelect.value = urlState;
  }

  if (urlCampus && campusSelect) {
    currentCampusFilter = urlCampus;
    campusSelect.value = urlCampus;
  }

  if (urlBudget && budgetSelect) {
    currentBudgetFilter = urlBudget;
    budgetSelect.value = urlBudget;
  }

  // Initial render with parsed filters
  renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);

  if (currentSearchQuery) {
    focusMapOnLocation(currentSearchQuery);
  } else if (currentCampusFilter && currentCampusFilter !== 'all' && currentCampusFilter !== 'any') {
    focusMapOnLocation(currentCampusFilter);
  } else if (currentStateFilter !== 'all') {
    focusMapOnLocation(currentStateFilter);
  }

  // Category filter tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.dataset.filter;
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
    });
  });

  // Search input & button
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      currentSearchQuery = searchInput.value.toLowerCase().trim();
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
      if (currentSearchQuery) focusMapOnLocation(currentSearchQuery);
    });
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
        if (currentSearchQuery) focusMapOnLocation(currentSearchQuery);
      }
    });
  }

  // State dropdown filter
  if (stateSelect) {
    stateSelect.addEventListener('change', () => {
      currentStateFilter = stateSelect.value;
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
      if (currentStateFilter !== 'all') {
        focusMapOnLocation(currentStateFilter);
      }
    });
  }

  // Campus dropdown filter
  if (campusSelect) {
    campusSelect.addEventListener('change', () => {
      currentCampusFilter = campusSelect.value;
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
      if (currentCampusFilter !== 'all' && currentCampusFilter !== 'any') {
        focusMapOnLocation(currentCampusFilter);
      }
    });
  }

  // Budget dropdown filter
  if (budgetSelect) {
    budgetSelect.addEventListener('change', () => {
      currentBudgetFilter = budgetSelect.value;
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
    });
  }

  // Demo listings loader button
  const loadDemoBtn = document.querySelector('#btn-load-demo-listings');
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      loadDemoListings();
    });
  }

  const uploadBtn = document.querySelector('#btn-quick-upload-trigger');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentAgent) {
        showToast('Please submit agent KYC verification first to upload listings.');
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

function loadDemoListings() {
  currentListings = [...DEMO_LISTINGS];
  try {
    localStorage.setItem('doma_listings', JSON.stringify(currentListings));
  } catch (e) {
    console.error('Failed to save demo listings to localStorage', e);
  }
  renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
  showToast('Verified sample listings loaded (including student hostels < ₦300k)! ⚡');
}

function renderListingsGrid(filter = 'all', searchQuery = '', stateFilter = 'all', campusFilter = 'all', budgetFilter = 'all') {
  const grid = document.querySelector('#properties-grid');
  const emptyState = document.querySelector('#empty-listings-state');
  if (!grid || !emptyState) return;

  grid.innerHTML = '';

  let filtered = currentListings;

  // Filter by category
  if (filter === 'house') {
    filtered = currentListings.filter(l => l.type === 'house');
  } else if (filter === 'store') {
    filtered = currentListings.filter(l => l.type === 'store');
  } else if (filter === 'student') {
    filtered = currentListings.filter(l => l.type === 'student' || (l.campus && l.campus !== 'none'));
  } else if (filter === 'under-300k') {
    filtered = currentListings.filter(l => (l.price || 0) <= 300000);
  } else if (filter === 'my-listings') {
    filtered = currentListings.filter(l => l.agentId === (currentAgent ? currentAgent.id : ''));
  }

  // Filter by State
  if (stateFilter && stateFilter !== 'all') {
    filtered = filtered.filter(l => l.state && l.state.toLowerCase() === stateFilter.toLowerCase());
  }

  // Filter by Campus Proximity
  if (campusFilter && campusFilter !== 'all') {
    if (campusFilter === 'any') {
      filtered = filtered.filter(l => l.type === 'student' || (l.campus && l.campus !== 'none'));
    } else {
      const cf = campusFilter.toLowerCase();
      filtered = filtered.filter(l => 
        (l.campus && l.campus.toLowerCase().includes(cf)) ||
        (l.area && l.area.toLowerCase().includes(cf)) ||
        (l.title && l.title.toLowerCase().includes(cf)) ||
        (l.address && l.address.toLowerCase().includes(cf))
      );
    }
  }

  // Filter by Max Budget
  if (budgetFilter && budgetFilter !== 'all' && budgetFilter !== 'any') {
    const max = parseFloat(budgetFilter);
    if (!isNaN(max)) {
      filtered = filtered.filter(l => (l.price || 0) <= max);
    }
  }

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(l => 
      (l.title && l.title.toLowerCase().includes(searchQuery)) ||
      (l.area && l.area.toLowerCase().includes(searchQuery)) ||
      (l.state && l.state.toLowerCase().includes(searchQuery)) ||
      (l.address && l.address.toLowerCase().includes(searchQuery)) ||
      (l.campus && l.campus.toLowerCase().includes(searchQuery))
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

    if (searchQuery || (stateFilter && stateFilter !== 'all') || (campusFilter && campusFilter !== 'all') || filter === 'under-300k') {
      titleEl.textContent = 'No matching properties found';
      descEl.textContent = 'Try adjusting your search criteria, clearing filters, or loading sample student & residential listings!';
    } else if (filter === 'my-listings') {
      if (titleEl) titleEl.textContent = 'You Have Not Uploaded Any Listings Yet';
      if (descEl) descEl.textContent = 'Click "Upload Property / Hostel" to add your first verified listing!';
    } else {
      if (titleEl) titleEl.textContent = 'No Listings Uploaded Yet';
      if (descEl) descEl.textContent = 'The marketplace is ready for fresh verified listings. Register as an agent with KYC to upload pictures or video walkthroughs of student hostels, houses, or stores!';
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
          <source src="${escapeHtml(main.url)}">
          Your browser does not support video playback.
        </video>
      `;
    } else {
      mediaHtml = `<img src="${escapeHtml(main.url)}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy">`;
    }
  } else {
    mediaHtml = `
      <div style="width:100%; height:100%; background: #141414; display: flex; align-items: center; justify-content: center; color: var(--yellow-500);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
      </div>
    `;
  }

  const isStudent = item.type === 'student';
  const isStore = item.type === 'store';
  const isBudget = (item.price || 0) <= 300000;

  let badgesHtml = '';
  if (isStudent) {
    badgesHtml += `<span class="card-badge student">🎓 Student Hostel</span>`;
  } else if (isStore) {
    badgesHtml += `<span class="card-badge gold">🏪 Store to Let</span>`;
  } else {
    badgesHtml += `<span class="card-badge">🏠 House for Rent</span>`;
  }

  if (isBudget) {
    badgesHtml += `<span class="card-badge budget">💰 Under ₦300k</span>`;
  }

  let campusHtml = '';
  if (item.campus && item.campus !== 'none') {
    campusHtml = `
      <div class="card-campus-pill">
        🎓 ${escapeHtml(item.campusDist || 'Near Campus')} • ${escapeHtml(item.campus)}
      </div>
    `;
  } else if (isBudget) {
    campusHtml = `
      <div class="card-budget-pill">
        ⚡ Student &amp; Budget Verified (&lt; ₦300k/yr)
      </div>
    `;
  }

  const cleanPhone = (item.agentPhone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I saw your listing on DOMA: "${item.title}" (${item.priceFormatted}) in ${item.area}, ${item.state}. Is it available?`)}`;
  const isMyListing = currentAgent && item.agentId === currentAgent.id;

  article.innerHTML = `
    <div class="card-media-wrapper">
      ${mediaHtml}
      <div class="card-badges-row">
        ${badgesHtml}
      </div>
      <button class="btn-favorite" data-id="${escapeHtml(item.id)}" aria-label="Save listing">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
    <div class="card-content">
      <div class="card-price">${escapeHtml(item.priceFormatted)} <span>${escapeHtml(item.period)}</span></div>
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      ${campusHtml}
      ${item.distanceKm !== undefined ? `
        <div style="display:inline-flex; align-items:center; gap:5px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.35); color: #93c5fd; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; margin-bottom: 6px;">
          📍 ${(item.distanceKm < 1 ? Math.round(item.distanceKm * 1000) + 'm' : item.distanceKm.toFixed(1) + ' km')} from you
        </div>
      ` : ''}
      <div class="card-location">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--yellow-500)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        ${item.address ? `${escapeHtml(item.address)}, ` : ''}${escapeHtml(item.area)}, ${escapeHtml(item.state)}
      </div>
      <div class="card-specs">
        <div class="spec-item">${escapeHtml(item.spec1)}</div>
        <div class="spec-item">${escapeHtml(item.spec2)}</div>
        <div class="spec-item">Media: <strong>${item.media ? item.media.length : 0}</strong></div>
      </div>
      <div class="card-footer">
        <div class="agent-info">
          <div class="agent-avatar">${item.agentName ? escapeHtml(item.agentName[0].toUpperCase()) : 'A'}</div>
          <div>
            <div class="agent-name">${escapeHtml(item.agentName || 'Agent')} <span style="color:#22c55e; font-size:0.7rem;">(KYC ✅)</span></div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(item.agentAgency || 'Verified Agent')}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-action" style="color: #22c55e;" title="Chat WhatsApp">
            WhatsApp 💬
          </a>
          <button class="btn-card-action btn-find-directions-trigger" style="color: var(--yellow-500);" data-id="${escapeHtml(item.id)}">
            Directions 🚗
          </button>
        </div>
      </div>
      ${isMyListing ? `
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: flex-end;">
          <button class="btn-delete-listing" data-id="${escapeHtml(item.id)}" style="color: #ef4444; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
            🗑️ Delete My Listing
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // Clicking anywhere on card synchronizes with Google Map
  article.style.cursor = 'pointer';
  article.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (leafletMap) {
      const lat = item.lat || 6.4474;
      const lng = item.lng || 3.4723;
      leafletMap.flyTo([lat, lng], 14, { duration: 0.8 });
      openGmapPropertyDrawer(item);
    }
  });

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
    dirBtn.addEventListener('click', (e) => {
      e.stopPropagation();
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
   Google Maps-Style Real Estate Interactive Radar Engine
   - Floating Search with Instant Autocomplete
   - "Find My Location" One-Click GPS Geolocation & Distance Matrix
   - Real Estate Price Pill Markers (₦250k, ₦180k, ₦8.5M)
   - Interactive Slide-In Property Preview Drawer
   - Layer Switcher: Dark Mode, Standard Streets, Satellite Earth
   - "Search This Map Area" Viewport Filtering
   - Turn-by-Turn In-App Route & Official Google Maps App Deep Linking
   ========================================================================== */

function formatPricePill(num) {
  if (!num) return '₦0';
  if (num >= 1000000) {
    const m = num / 1000000;
    return '₦' + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + 'M';
  }
  if (num >= 1000) {
    return '₦' + Math.round(num / 1000) + 'k';
  }
  return '₦' + num;
}

function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistanceBadge(km) {
  if (km === null || km === undefined) return '';
  if (km < 1) {
    return `📍 ${Math.round(km * 1000)}m away`;
  }
  return `📍 ${km.toFixed(1)} km away`;
}

function initInteractiveMap() {
  const mapEl = document.querySelector('#interactive-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Initialize Map centered on Nigeria (Lagos Hub viewport)
  leafletMap = L.map('interactive-map', {
    zoomControl: false, // Using custom Google Maps-style zoom group
    attributionControl: false
  }).setView([6.5244, 3.3792], 12);

  // Setup Street Tiles (OpenStreetMap) and Satellite Tiles (Esri World Imagery)
  streetTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  });

  satelliteTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '&copy; Esri World Imagery'
  });

  // Default: Dark Mode applied over street tiles
  streetTileLayer.addTo(leafletMap);
  mapEl.classList.add('layer-dark');
  currentTileLayerType = 'dark';

  // Floating Layer Switcher Popup
  const layerBtn = document.querySelector('#btn-map-layers');
  const layerMenu = document.querySelector('#gmap-layer-menu');
  const layerOpts = document.querySelectorAll('.gmap-layer-opt');

  if (layerBtn && layerMenu) {
    layerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      layerMenu.classList.toggle('open');
    });

    layerOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        const selected = opt.dataset.layer;
        layerOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        if (selected === 'dark') {
          if (leafletMap.hasLayer(satelliteTileLayer)) leafletMap.removeLayer(satelliteTileLayer);
          if (!leafletMap.hasLayer(streetTileLayer)) streetTileLayer.addTo(leafletMap);
          mapEl.classList.add('layer-dark');
          currentTileLayerType = 'dark';
          showToast('🌙 Dark Mode Map Style Active');
        } else if (selected === 'streets') {
          if (leafletMap.hasLayer(satelliteTileLayer)) leafletMap.removeLayer(satelliteTileLayer);
          if (!leafletMap.hasLayer(streetTileLayer)) streetTileLayer.addTo(leafletMap);
          mapEl.classList.remove('layer-dark');
          currentTileLayerType = 'streets';
          showToast('🗺️ Standard Streets Map Active');
        } else if (selected === 'satellite') {
          if (leafletMap.hasLayer(streetTileLayer)) leafletMap.removeLayer(streetTileLayer);
          if (!leafletMap.hasLayer(satelliteTileLayer)) satelliteTileLayer.addTo(leafletMap);
          mapEl.classList.remove('layer-dark');
          currentTileLayerType = 'satellite';
          showToast('🛰️ Satellite Earth Imagery Active');
        }

        layerMenu.classList.remove('open');
      });
    });
  }

  // Floating Top Search Bar with Instant Autocomplete
  const searchInput = document.querySelector('#gmap-search-input');
  const searchBtn = document.querySelector('#gmap-search-btn');
  const clearBtn = document.querySelector('#gmap-clear-search-btn');
  const autocompleteList = document.querySelector('#gmap-autocomplete-list');

  function renderAutocomplete(query) {
    if (!autocompleteList) return;
    const q = query.trim().toLowerCase();
    autocompleteList.innerHTML = '';

    if (!q) {
      autocompleteList.classList.remove('open');
      return;
    }

    const matches = [];

    // Search geographic directory
    for (const [key, geo] of Object.entries(NIGERIAN_GEO_DIRECTORY)) {
      if (key.includes(q) || geo.landmark.toLowerCase().includes(q) || geo.state.toLowerCase().includes(q)) {
        matches.push({
          type: 'location',
          title: key.toUpperCase(),
          subtitle: `${geo.state} • ${geo.landmark}`,
          lat: geo.lat,
          lng: geo.lng
        });
      }
    }

    // Search current property listings
    currentListings.forEach(l => {
      if (
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.area && l.area.toLowerCase().includes(q)) ||
        (l.campus && l.campus.toLowerCase().includes(q))
      ) {
        matches.push({
          type: 'listing',
          title: l.title,
          subtitle: `${l.priceFormatted} • ${l.area}, ${l.state}`,
          lat: l.lat || 6.4474,
          lng: l.lng || 3.4723,
          listing: l
        });
      }
    });

    if (matches.length === 0) {
      autocompleteList.innerHTML = `
        <li class="gmap-autocomplete-item" style="color:var(--text-muted); cursor:default;">
          <span>🔍 No matching locations or listings found</span>
        </li>
      `;
      autocompleteList.classList.add('open');
      return;
    }

    matches.slice(0, 6).forEach(item => {
      const li = document.createElement('li');
      li.className = 'gmap-autocomplete-item';
      const icon = item.type === 'listing' ? '🏠' : '📍';
      li.innerHTML = `
        <span>${icon}</span>
        <div style="flex: 1; overflow: hidden;">
          <div class="gmap-autocomplete-title" style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.title)}</div>
          <div class="gmap-autocomplete-sub" style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.subtitle)}</div>
        </div>
      `;

      li.addEventListener('click', () => {
        if (searchInput) searchInput.value = item.title;
        autocompleteList.classList.remove('open');
        leafletMap.flyTo([item.lat, item.lng], 14, { duration: 1.2 });

        if (item.listing) {
          openGmapPropertyDrawer(item.listing);
        } else {
          showToast(`📍 Centered on ${item.title}`);
        }
      });

      autocompleteList.appendChild(li);
    });

    autocompleteList.classList.add('open');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value;
      if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
      renderAutocomplete(val);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim().toLowerCase();
        if (val) {
          autocompleteList.classList.remove('open');
          focusMapOnLocation(val);
        }
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearBtn.style.display = 'none';
      if (autocompleteList) autocompleteList.classList.remove('open');
      refreshMapMarkers(currentListings);
      renderListingsGrid('all');
    });
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const val = searchInput.value.trim().toLowerCase();
      if (val) {
        if (autocompleteList) autocompleteList.classList.remove('open');
        focusMapOnLocation(val);
      }
    });
  }

  // Quick Filter Chips Bar
  const chips = document.querySelectorAll('.gmap-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterType = chip.dataset.filter;

      if (chip.id === 'btn-chip-nearby') {
        // "Nearby (< 5km)" filter chip
        if (!currentUserGps) {
          showToast('Detecting your GPS location to calculate nearby properties... 📍');
          acquireUserGpsLocation(true).then(() => {
            const nearby = currentListings.filter(l => l.distanceKm !== undefined && l.distanceKm <= 5);
            refreshMapMarkers(nearby);
            showToast(`Found ${nearby.length} properties within 5km of you!`);
          });
        } else {
          const nearby = currentListings.filter(l => l.distanceKm !== undefined && l.distanceKm <= 5);
          refreshMapMarkers(nearby);
          showToast(`Found ${nearby.length} properties within 5km of you!`);
        }
      } else {
        renderListingsGrid(filterType);
      }
    });
  });

  // "Search This Area" Floating Button (Google Maps Pattern)
  const searchAreaBtn = document.querySelector('#btn-search-this-area');
  if (searchAreaBtn) {
    leafletMap.on('moveend', () => {
      searchAreaBtn.style.display = 'inline-flex';
    });

    searchAreaBtn.addEventListener('click', () => {
      const bounds = leafletMap.getBounds();
      const inView = currentListings.filter(item => {
        const lat = item.lat || 6.4474;
        const lng = item.lng || 3.4723;
        return bounds.contains([lat, lng]);
      });

      refreshMapMarkers(inView);
      showToast(`📍 Found ${inView.length} properties in current map view`);
      searchAreaBtn.style.display = 'none';
    });
  }

  // Find My Location (GPS Geolocation) Button
  const gpsBtn = document.querySelector('#btn-find-my-location');
  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      acquireUserGpsLocation(true);
    });
  }

  // Fullscreen Map Toggle
  const fullscreenBtn = document.querySelector('#btn-toggle-fullscreen-map');
  const mapWrap = document.querySelector('#map-container-wrap');
  if (fullscreenBtn && mapWrap) {
    fullscreenBtn.addEventListener('click', () => {
      mapWrap.classList.toggle('map-fullscreen-active');
      const isFull = mapWrap.classList.contains('map-fullscreen-active');
      fullscreenBtn.classList.toggle('active', isFull);
      setTimeout(() => leafletMap.invalidateSize(), 250);
      showToast(isFull ? '⛶ Fullscreen Map Activated (Press Esc or Click again to exit)' : 'Exited Fullscreen Map');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mapWrap.classList.contains('map-fullscreen-active')) {
        mapWrap.classList.remove('map-fullscreen-active');
        fullscreenBtn.classList.remove('active');
        setTimeout(() => leafletMap.invalidateSize(), 250);
      }
    });
  }

  // Recenter Nigeria Button
  const recenterBtn = document.querySelector('#btn-recenter-map');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
      leafletMap.flyTo([6.5244, 3.3792], 12, { duration: 1.2 });
      showToast('🎯 Map Centered on Lagos / Nigeria');
    });
  }

  // Custom Zoom In / Zoom Out Group
  const zoomInBtn = document.querySelector('#btn-map-zoom-in');
  const zoomOutBtn = document.querySelector('#btn-map-zoom-out');
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => leafletMap.zoomIn());
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => leafletMap.zoomOut());

  // Slide-In Property Preview Drawer Close Button
  const drawerCloseBtn = document.querySelector('#gmap-drawer-close-btn');
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      closeGmapPropertyDrawer();
    });
  }

  // Close menus when clicking on map canvas
  leafletMap.on('click', () => {
    if (layerMenu) layerMenu.classList.remove('open');
    if (autocompleteList) autocompleteList.classList.remove('open');
  });

  // Initial marker load
  refreshMapMarkers(currentListings);
}

/* ==========================================================================
   Find My Location (GPS Geolocation & Distance Matrix)
   ========================================================================== */
function acquireUserGpsLocation(flyToUser = true) {
  return new Promise((resolve) => {
    const gpsBtn = document.querySelector('#btn-find-my-location');
    const statusPill = document.querySelector('#user-gps-status-pill');
    const statusText = document.querySelector('#user-gps-status-text');

    if (gpsBtn) gpsBtn.classList.add('loading');

    function applyUserPosition(lat, lng, isSimulated = false) {
      currentUserGps = { lat, lng, isSimulated };

      // Create / Update pulsating blue Google Maps user location dot
      if (userGpsMarker && leafletMap) {
        leafletMap.removeLayer(userGpsMarker);
      }

      const userIcon = L.divIcon({
        className: '',
        html: '<div class="google-user-location-marker" title="Your Current Location"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      userGpsMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(leafletMap);
      userGpsMarker.bindPopup('<b>📍 Your Current Location</b><br><span style="font-size:0.75rem; color:#888;">Distances calculated from here</span>');

      if (flyToUser && leafletMap) {
        leafletMap.flyTo([lat, lng], 14, { duration: 1.2 });
      }

      // Calculate distance (km) to all listings & sort closest first!
      currentListings.forEach(item => {
        const itemLat = item.lat || 6.4474;
        const itemLng = item.lng || 3.4723;
        item.distanceKm = calculateHaversineDistanceKm(lat, lng, itemLat, itemLng);
      });

      // Sort listings by closest first
      currentListings.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));

      // Update UI Status Pill
      if (statusPill) statusPill.style.display = 'flex';
      if (statusText) {
        statusText.textContent = isSimulated
          ? '📍 Central Hub Active (UNILAG/Yaba Corridor)'
          : '📍 GPS Location Active • Showing Nearest First';
      }

      if (gpsBtn) {
        gpsBtn.classList.remove('loading');
        gpsBtn.classList.add('active');
      }

      // Re-render listings grid and map markers with distances
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
      refreshMapMarkers(currentListings);

      showToast(isSimulated 
        ? '📍 Location active (UNILAG / Yaba Corridor). Properties sorted by distance!' 
        : '📍 GPS Connected! Closest properties sorted to top 🚗'
      );

      resolve(currentUserGps);
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyUserPosition(pos.coords.latitude, pos.coords.longitude, false);
        },
        (err) => {
          console.warn('GPS Geolocation unavailable or blocked:', err.message);
          // Seamless fallback: Sabo, Yaba / UNILAG Student Corridor (Heart of Lagos)
          applyUserPosition(6.5173, 3.3934, true);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    } else {
      applyUserPosition(6.5173, 3.3934, true);
    }
  });
}

/* ==========================================================================
   Map Markers Engine (Google Maps Price Pills & Drawer Preview)
   ========================================================================== */
function refreshMapMarkers(listingsToDisplay = currentListings) {
  if (!leafletMap || typeof L === 'undefined') return;

  // Clear existing property markers
  mapMarkers.forEach(m => leafletMap.removeLayer(m));
  mapMarkers = [];

  const countBadge = document.querySelector('#map-pinned-count');
  if (countBadge) {
    countBadge.textContent = `${listingsToDisplay.length} Properties Pinned`;
  }

  if (listingsToDisplay.length === 0) return;

  const bounds = [];
  if (currentUserGps) {
    bounds.push([currentUserGps.lat, currentUserGps.lng]);
  }

  listingsToDisplay.forEach(item => {
    const lat = item.lat || 6.4474;
    const lng = item.lng || 3.4723;
    bounds.push([lat, lng]);

    const isStudent = item.type === 'student' || (item.campus && item.campus !== 'none');
    const isBudget = (item.price || 0) <= 300000;
    const isStore = item.type === 'store';

    let icon = '🏠';
    let markerClass = '';

    if (isStudent) {
      icon = '🎓';
      markerClass = 'student';
    } else if (isBudget) {
      icon = '💰';
      markerClass = 'budget';
    } else if (isStore) {
      icon = '🏪';
      markerClass = 'store';
    }

    const priceText = formatPricePill(item.price);

    // Google Maps-Style Real Estate Price Tag HTML
    const markerHtml = `
      <div class="gmap-price-marker ${markerClass}" id="price-marker-${escapeHtml(item.id)}" title="${escapeHtml(item.title)}">
        <span>${icon}</span>
        <span>${priceText}</span>
      </div>
    `;

    const priceIcon = L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [80, 32],
      iconAnchor: [40, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([lat, lng], { icon: priceIcon }).addTo(leafletMap);

    // Marker Click Handler: Open Preview Drawer
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      selectMapMarker(item, marker);
    });

    mapMarkers.push(marker);
  });

  // Fit bounds if user has not manually locked location
  if (bounds.length > 0 && !currentActiveMarker) {
    leafletMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }
}

function selectMapMarker(item, marker) {
  // Highlight active price pill
  document.querySelectorAll('.gmap-price-marker').forEach(m => m.classList.remove('active'));
  const el = document.querySelector(`#price-marker-${item.id}`);
  if (el) el.classList.add('active');

  currentActiveMarker = marker;

  // Center smoothly on pin
  const lat = item.lat || 6.4474;
  const lng = item.lng || 3.4723;
  leafletMap.flyTo([lat, lng], Math.max(leafletMap.getZoom(), 14), { duration: 0.8 });

  // Open the Google Maps Preview Drawer
  openGmapPropertyDrawer(item);
}

function openGmapPropertyDrawer(item) {
  const drawer = document.querySelector('#gmap-property-preview-drawer');
  const content = document.querySelector('#gmap-drawer-content');
  if (!drawer || !content) return;

  const lat = item.lat || 6.4474;
  const lng = item.lng || 3.4723;
  const thumbUrl = item.media && item.media[0] ? item.media[0].url : 'assets/images/hero_student_hostel.jpg';
  const cleanPhone = (item.agentPhone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello DOMA Agent, I am interested in your property: "${item.title}" (${item.priceFormatted}) in ${item.area}, ${item.state}.`)}`;
  const gmapsDeepLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  let distHtml = '';
  if (item.distanceKm !== undefined) {
    const distText = item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)}m away` : `${item.distanceKm.toFixed(1)} km away`;
    distHtml = `<div class="gmap-drawer-dist-pill">🚗 ${distText} from you</div>`;
  }

  let campusHtml = '';
  if (item.campus && item.campus !== 'none') {
    campusHtml = `<div class="gmap-drawer-campus-pill">🎓 ${escapeHtml(item.campusDist || item.campus)}</div>`;
  }

  content.innerHTML = `
    <div class="gmap-drawer-media">
      <img src="${escapeHtml(thumbUrl)}" class="gmap-drawer-img" alt="${escapeHtml(item.title)}">
      <div class="gmap-drawer-badge">${escapeHtml(item.type === 'student' ? 'Student Hostel' : item.type === 'store' ? 'Commercial Store' : 'House for Rent')}</div>
    </div>
    <div>
      <div class="gmap-drawer-price">
        ${escapeHtml(item.priceFormatted)} <span>${escapeHtml(item.period || '/year')}</span>
      </div>
      <h4 class="gmap-drawer-title">${escapeHtml(item.title)}</h4>
    </div>
    <div class="gmap-drawer-meta">
      ${distHtml}
      ${campusHtml}
    </div>
    <div style="font-size: 0.8rem; color: #aaa; display: flex; align-items: center; gap: 4px;">
      📍 ${escapeHtml(item.address ? item.address + ', ' : '')}${escapeHtml(item.area)}, ${escapeHtml(item.state)}
    </div>
    <div class="gmap-drawer-actions">
      <button type="button" class="gmap-drawer-btn primary" onclick="triggerDirectionsById('${escapeHtml(item.id)}')">
        🚗 Directions
      </button>
      <a href="${gmapsDeepLink}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn google-app">
        🗺️ Google Maps
      </a>
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn whatsapp">
        💬 WhatsApp
      </a>
      <button type="button" class="gmap-drawer-btn inspect" onclick="openViewingModalForListing('${escapeHtml(item.id)}')">
        📅 Inspect
      </button>
    </div>
  `;

  drawer.style.display = 'block';
}

function closeGmapPropertyDrawer() {
  const drawer = document.querySelector('#gmap-property-preview-drawer');
  if (drawer) drawer.style.display = 'none';
  document.querySelectorAll('.gmap-price-marker').forEach(m => m.classList.remove('active'));
  currentActiveMarker = null;
}

window.openViewingModalForListing = function(id) {
  const modal = document.querySelector('#viewing-modal');
  if (modal) modal.classList.add('open');
};

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

  // If search matches any listing title/area
  const matchedListing = currentListings.find(l => 
    (l.title && l.title.toLowerCase().includes(lower)) ||
    (l.area && l.area.toLowerCase().includes(lower)) ||
    (l.campus && l.campus.toLowerCase().includes(lower))
  );

  if (matchedListing) {
    leafletMap.flyTo([matchedListing.lat || 6.4474, matchedListing.lng || 3.4723], 14, { duration: 1.2 });
    openGmapPropertyDrawer(matchedListing);
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

  // Standard Google Maps Deep Link URL for turn-by-turn directions
  if (googleBtn) {
    googleBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
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
  const toggleKycBtn = document.querySelector('#btn-toggle-kyc-status');

  updateAgentPortalView();

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#agent-fullname')?.value.trim() || '';
      const agency = document.querySelector('#agent-agency')?.value.trim() || '';
      const phone = document.querySelector('#agent-phone')?.value.trim() || '';
      const email = document.querySelector('#agent-email')?.value.trim() || '';
      const state = document.querySelector('#agent-state')?.value || 'Lagos';
      const cac = document.querySelector('#agent-cac')?.value.trim() || '';
      const nin = document.querySelector('#agent-nin')?.value.trim() || '';
      const idType = document.querySelector('#agent-idtype')?.value || 'NIMC Slip / National ID';
      const idNumber = document.querySelector('#agent-idnumber')?.value.trim() || '';
      const campusFocus = document.querySelector('#agent-campus-focus')?.value || 'General Residential & Commercial';
      const officeAddress = document.querySelector('#agent-office-address')?.value.trim() || '';

      currentAgent = {
        id: 'AG-' + Math.floor(10000 + Math.random() * 90000),
        name,
        agency,
        phone,
        email,
        state,
        cac,
        nin,
        idType,
        idNumber,
        campusFocus,
        officeAddress,
        kycStatus: 'pending',
        registeredAt: new Date().toLocaleDateString()
      };

      if (window.DOMA_CLOUD) {
        window.DOMA_CLOUD.saveAgent(currentAgent);
      } else {
        localStorage.setItem('doma_agent', JSON.stringify(currentAgent));
      }
      updateAgentState();
      updateAgentPortalView();
      showToast(`Welcome, Agent ${name}! KYC application submitted. Current status: Pending Review ⏳. An admin will verify your CAC & NIN.`);
    });
  }

  if (toggleKycBtn) {
    toggleKycBtn.addEventListener('click', async () => {
      if (!currentAgent) return;
      const nextStatus = (currentAgent.kycStatus === 'verified') ? 'pending' : 'verified';
      currentAgent.kycStatus = nextStatus;
      if (window.DOMA_CLOUD) {
        await window.DOMA_CLOUD.updateAgentKYC(currentAgent.id, nextStatus);
      } else {
        localStorage.setItem('doma_agent', JSON.stringify(currentAgent));
      }
      updateAgentPortalView();
      showToast(`KYC status set to: ${nextStatus === 'verified' ? 'Verified 🟢' : 'Pending Review ⏳'}`);
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
      if (currentAgent && currentAgent.kycStatus !== 'verified') {
        showToast('⚠️ KYC Verification is pending admin review. You can approve it in the Admin Panel (Demo) to upload listings!');
        return;
      }
      openUploadModal();
    });
  }
}

function updateAgentPortalView() {
  const activeDash = document.querySelector('#agent-active-dashboard');
  const regBox = document.querySelector('#agent-registration-box');
  const uploadStudio = document.querySelector('#agent-upload-studio');

  if (currentAgent) {
    // Check if status was updated by admin in DOMA_CLOUD / localStorage database
    try {
      const localDB = JSON.parse(localStorage.getItem('doma_agents_db') || '[]');
      const dbMatch = localDB.find(a => a.id === currentAgent.id);
      if (dbMatch && dbMatch.kycStatus) {
        currentAgent.kycStatus = dbMatch.kycStatus;
        currentAgent.rejectionReason = dbMatch.rejectionReason || '';
      }
    } catch (e) {}

    if (activeDash) activeDash.style.display = 'flex';
    if (regBox) regBox.style.display = 'none';
    if (uploadStudio) uploadStudio.style.display = 'block';

    const displayName = document.querySelector('#agent-display-name');
    const displayAgency = document.querySelector('#agent-display-agency');
    const badgeInitials = document.querySelector('#agent-badge-initials');
    const kycBadge = document.querySelector('#agent-kyc-status-badge');
    const toggleBtn = document.querySelector('#btn-toggle-kyc-status');

    if (displayName) displayName.textContent = currentAgent.name || 'Accredited Agent';
    if (displayAgency) displayAgency.textContent = `${currentAgent.agency || 'Agency'} • ${currentAgent.state || 'Nigeria'}`;
    if (badgeInitials) {
      const parts = (currentAgent.name || 'A G').trim().split(' ');
      badgeInitials.textContent = (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || '')).toUpperCase();
    }

    const isVerified = (currentAgent.kycStatus || 'pending') === 'verified';
    const isRejected = currentAgent.kycStatus === 'rejected';

    if (kycBadge) {
      if (isVerified) {
        kycBadge.textContent = 'KYC Verified 🟢';
        kycBadge.style.background = 'rgba(34, 197, 94, 0.15)';
        kycBadge.style.color = '#22c55e';
        kycBadge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
      } else if (isRejected) {
        kycBadge.textContent = 'KYC Rejected 🔴';
        kycBadge.style.background = 'rgba(239, 68, 68, 0.15)';
        kycBadge.style.color = '#ef4444';
        kycBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      } else {
        kycBadge.textContent = 'KYC Pending Review ⏳';
        kycBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        kycBadge.style.color = '#f59e0b';
        kycBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      }
    }

    if (toggleBtn) {
      toggleBtn.innerHTML = `<span>${isVerified ? 'Switch to KYC Pending (Demo)' : 'Approve KYC Status 🟢 (Demo)'}</span>`;
    }

    // Dynamic KYC Alert Banner
    const alertBanner = document.querySelector('#agent-kyc-alert-banner');
    if (alertBanner) {
      alertBanner.style.display = 'block';
      if (isVerified) {
        alertBanner.style.background = 'rgba(34, 197, 94, 0.12)';
        alertBanner.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        alertBanner.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <span><strong style="color: #22c55e;">🟢 KYC Verified &amp; Accredited:</strong> Your credentials (CAC: <code>${escapeHtml(currentAgent.cac)}</code>, NIN: <code>${escapeHtml(currentAgent.nin)}</code>) are approved under Nigerian regulatory standards. You are authorized to publish student hostels, houses, and stores.</span>
            <a href="admin.html" style="font-size:0.8rem; color:var(--yellow-500); font-weight:800; text-decoration:underline;">Admin Panel 🔒</a>
          </div>
        `;
      } else if (isRejected) {
        alertBanner.style.background = 'rgba(239, 68, 68, 0.12)';
        alertBanner.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        alertBanner.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <span><strong style="color: #ef4444;">🔴 KYC Application Not Approved:</strong> ${escapeHtml(currentAgent.rejectionReason || 'Submitted documentation could not be verified by compliance.')}</span>
            <a href="admin.html" style="font-size:0.8rem; color:var(--yellow-500); font-weight:800; text-decoration:underline;">Review in Admin Panel 🔒</a>
          </div>
        `;
      } else {
        alertBanner.style.background = 'rgba(245, 158, 11, 0.12)';
        alertBanner.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        alertBanner.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <span><strong style="color: #f59e0b;">⏳ KYC Review in Progress:</strong> Your agent registration is under administrative verification. Once our compliance team approves your CAC &amp; NIN, you can publish listings.</span>
            <a href="admin.html" style="font-size:0.82rem; color:var(--yellow-500); font-weight:800; text-decoration:underline; background:rgba(255,208,0,0.1); padding:4px 10px; border-radius:4px;">Open Admin Panel to Approve →</a>
          </div>
        `;
      }
    }

    // Populate KYC Credentials Grid
    const dashId = document.querySelector('#dash-agent-id');
    const dashCac = document.querySelector('#dash-agent-cac');
    const dashNin = document.querySelector('#dash-agent-nin');
    const dashIdType = document.querySelector('#dash-agent-idtype');
    const dashCampus = document.querySelector('#dash-agent-campus');
    const dashAddress = document.querySelector('#dash-agent-address');

    if (dashId) dashId.textContent = currentAgent.id || 'AG-10928';
    if (dashCac) dashCac.textContent = currentAgent.cac || 'RC 1948201 (CAC Certified)';

    if (dashNin) {
      const rawNin = (currentAgent.nin || '28491028412').toString();
      const maskedNin = rawNin.length >= 6
        ? `${rawNin.slice(0, 4)}•••••${rawNin.slice(-2)}`
        : rawNin;
      dashNin.textContent = isVerified ? `${maskedNin} (Verified ✅)` : (isRejected ? `${maskedNin} (Rejected 🔴)` : `${maskedNin} (Pending ⏳)`);
      dashNin.style.color = isVerified ? '#22c55e' : (isRejected ? '#ef4444' : '#f59e0b');
    }

    if (dashIdType) {
      const docType = currentAgent.idType || 'NIMC National ID Slip';
      const docNum = currentAgent.idNumber ? ` [${currentAgent.idNumber}]` : '';
      dashIdType.textContent = docType + docNum;
    }

    if (dashCampus) {
      dashCampus.textContent = currentAgent.campusFocus || 'UNILAG & Lagos Mainland';
    }

    if (dashAddress) {
      const addr = currentAgent.officeAddress || 'Physical Office Verified';
      dashAddress.textContent = addr.length > 32 ? addr.slice(0, 30) + '...' : addr;
      dashAddress.title = addr;
    }

    const phoneInput = document.querySelector('#listing-agent-phone');
    if (phoneInput && !phoneInput.value && currentAgent.phone) {
      phoneInput.value = currentAgent.phone;
    }

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
        <button class="btn-primary" onclick="openUploadModal()">+ Upload Your First House, Student Room, or Store</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        ${myListings.map(l => {
          const isStudent = l.type === 'student';
          const isStore = l.type === 'store';
          const badgeClass = isStudent ? 'student' : (isStore ? 'gold' : '');
          const badgeText = isStudent ? '🎓 STUDENT' : (isStore ? '🏪 STORE' : '🏠 HOUSE');
          return `
          <div style="background: #141414; border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="card-badge ${badgeClass}">${badgeText}</span>
              <span style="font-weight: 800; color: var(--yellow-500);">${escapeHtml(l.priceFormatted)}</span>
            </div>
            <h4 style="font-size: 0.95rem; color: var(--text-white); margin-bottom: 6px;">${escapeHtml(l.title)}</h4>
            ${l.campus && l.campus !== 'none' ? `<p style="font-size: 0.78rem; color: #93c5fd; margin-bottom: 4px;">🎓 ${escapeHtml(l.campus)} ${l.campusDist ? `(${escapeHtml(l.campusDist)})` : ''}</p>` : ''}
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">📍 ${escapeHtml(l.area)}, ${escapeHtml(l.state)}</p>
            <div style="display: flex; justify-content: space-between;">
              <a href="listings.html" style="font-size: 0.82rem; color: var(--yellow-500); font-weight: 700;">View in Portal →</a>
              <button onclick="deleteListingById('${escapeHtml(l.id)}')" style="color: #ef4444; font-size: 0.82rem; font-weight: 700; cursor: pointer;">Delete 🗑️</button>
            </div>
          </div>
        `}).join('')}
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

  async function handleFiles(files, previewGrid) {
    const parentContainer = previewGrid?.closest('.input-group') || previewGrid?.parentElement;
    const progressBar = parentContainer?.querySelector('.cloudinary-upload-progress');
    const progressFill = parentContainer?.querySelector('.cloudinary-upload-fill');

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isImage && !isVideo) continue;

      if (window.DOMA_CLOUD && window.DOMA_CLOUD.isCloudinaryConnected()) {
        if (progressBar) progressBar.style.display = 'block';
        if (progressFill) progressFill.style.width = '10%';
        showToast(`Uploading "${file.name}" to Cloudinary CDN... ☁️`);

        try {
          const uploaded = await window.DOMA_CLOUD.uploadToCloudinary(file, (percent) => {
            if (progressFill) progressFill.style.width = `${percent}%`;
          });
          uploadedMediaFiles.push(uploaded);
          renderPreviews(previewGrid);
          showToast(`"${file.name}" hosted on Cloudinary! ✨`);
        } catch (cloudErr) {
          console.warn('Cloudinary upload error:', cloudErr);
          showToast(`Cloudinary notice: ${cloudErr.message || 'using local preview'}`);
          // Fallback to local
          if (isVideo) {
            uploadedMediaFiles.push({ type: 'video', url: URL.createObjectURL(file), name: file.name });
          } else {
            const comp = await compressImage(file, 1000, 0.75);
            uploadedMediaFiles.push({ type: 'image', url: comp, name: file.name });
          }
          renderPreviews(previewGrid);
        } finally {
          if (progressBar) {
            setTimeout(() => {
              progressBar.style.display = 'none';
              if (progressFill) progressFill.style.width = '0%';
            }, 800);
          }
        }
      } else {
        // Local compression / storage fallback
        if (isVideo) {
          if (file.size > 2.5 * 1024 * 1024) {
            showToast(`Notice: Video exceeds 2.5MB browser quota. Connect Cloudinary in Admin Panel for unlimited CDN video hosting!`);
            continue;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedMediaFiles.push({
              type: 'video',
              url: e.target.result,
              name: file.name
            });
            renderPreviews(previewGrid);
          };
          reader.readAsDataURL(file);
        } else {
          try {
            const compressedUrl = await compressImage(file, 1000, 0.75);
            uploadedMediaFiles.push({
              type: 'image',
              url: compressedUrl,
              name: file.name
            });
            renderPreviews(previewGrid);
          } catch (err) {
            console.error('Image compression error', err);
          }
        }
      }
    }
  }

  function renderPreviews(previewGrid) {
    if (!previewGrid) return;
    previewGrid.innerHTML = uploadedMediaFiles.map(item => `
      <div class="media-preview-item">
        ${item.type === 'video' ? `<video src="${escapeHtml(item.url)}" muted></video>` : `<img src="${escapeHtml(item.url)}" alt="Preview">`}
        <span class="media-preview-tag">${item.type.toUpperCase()}${item.url.includes('cloudinary') ? ' ☁️' : ''}</span>
      </div>
    `).join('');
  }

  // Upload Form Handlers
  const uploadForms = document.querySelectorAll('.upload-listing-form');
  uploadForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentAgent) {
        showToast('Please register and submit your agent KYC first.');
        setTimeout(() => { window.location.href = 'agent-portal.html'; }, 800);
        return;
      }

      if (currentAgent.kycStatus !== 'verified') {
        showToast('⚠️ Agent KYC pending admin review. You can approve it in the Admin Portal (Demo) to publish live listings!');
        return;
      }

      const listingType = form.querySelector('input[name="listing-type"]:checked')?.value || 'house';
      const title = form.querySelector('[name="listing-title"]').value.trim();
      const rawPrice = parseFloat(form.querySelector('[name="listing-price"]').value) || 0;
      const period = form.querySelector('[name="listing-period"]').value;
      const state = form.querySelector('[name="listing-state"]').value;
      const area = form.querySelector('[name="listing-area"]').value.trim();
      const address = form.querySelector('[name="listing-address"]').value.trim();
      const campus = form.querySelector('[name="listing-campus"]')?.value || 'none';
      const campusDist = form.querySelector('[name="listing-campus-dist"]')?.value.trim() || '';

      const defaultSpec1 = listingType === 'student' ? '1 Bed / Self-Contain' : (listingType === 'house' ? '3 Bedrooms' : '50 Sq M');
      const defaultSpec2 = listingType === 'student' ? (campusDist ? `${campusDist} to Gate` : 'Campus Corridor') : (listingType === 'house' ? '2 Bathrooms' : 'Prime Storefront');

      const spec1 = form.querySelector('[name="listing-specs-1"]')?.value.trim() || defaultSpec1;
      const spec2 = form.querySelector('[name="listing-specs-2"]')?.value.trim() || defaultSpec2;
      const agentPhone = form.querySelector('[name="listing-agent-phone"]')?.value.trim() || currentAgent.phone;

      // Geocoding Coordinates Match
      const coords = matchCoordinatesForArea(state, area);

      const assignedCampus = campus !== 'none' 
        ? campus 
        : (listingType === 'student' ? (currentAgent.campusFocus && !currentAgent.campusFocus.includes('General') ? currentAgent.campusFocus : 'Campus Corridor') : 'none');
      const assignedDist = campusDist || (listingType === 'student' ? 'Walking distance to campus' : '');

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
        campus: assignedCampus,
        campusDist: assignedDist,
        lat: coords.lat,
        lng: coords.lng,
        media: [...uploadedMediaFiles],
        createdAt: new Date().toISOString()
      };

      if (window.DOMA_CLOUD) {
        await window.DOMA_CLOUD.saveListing(newListing);
      } else {
        currentListings.unshift(newListing);
        try {
          localStorage.setItem('doma_listings', JSON.stringify(currentListings));
        } catch (storageErr) {
          currentListings.shift();
          showToast('Browser storage quota reached! Please connect Cloudinary in Admin Panel.');
          return;
        }
      }

      // Reset
      form.reset();
      uploadedMediaFiles = [];
      document.querySelectorAll('.media-preview-grid').forEach(g => g.innerHTML = '');
      closeModal('#upload-modal');

      const budgetNote = rawPrice <= 300000 ? ' (Badged as budget-friendly under ₦300k)' : '';
      showToast(`Success! "${title}" is now live and pinned on map!${budgetNote} 🚀`);

      if (document.querySelector('#properties-grid')) {
        renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter);
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
