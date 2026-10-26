/**
 * DOMA Property Portal - Multi-Page Core Engine
 * White, Black & Yellow Theme + Interactive Map & Find Directions
 */

// Global State
let currentUser = null; // signed-in profile (from Supabase Auth), or null
let currentAgent = null; // signed-in user's agent/KYC record, or null
let currentListings = [];
let listingsAreSamples = false; // true when showing DEMO_LISTINGS instead of the live database
let uploadedMediaFiles = [];
const MAX_MEDIA_FILES = 8;
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

document.addEventListener('DOMContentLoaded', async () => {
  initMediaUploader();
  initModals();

  await Promise.all([loadSessionState(), loadListings()]);

  // Page-specific initializers
  if (document.querySelector('#hero-slider-section')) {
    initHeroSlider();
  }
  // Map first, so URL filters and search focus apply to it
  if (document.querySelector('#interactive-map')) {
    initInteractiveMap();
  }
  if (document.querySelector('#properties-grid') || document.querySelector('#empty-listings-state')) {
    initListingsPage();
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
        const accent = document.createElement('span');
        accent.className = 'gradient-text';
        accent.textContent = 'directly from KYC-verified agents';
        heroTitle.replaceChildren(document.createTextNode(title + ' '), document.createElement('br'), accent);
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
   Session & Listings (Supabase is the source of truth)
   ========================================================================== */
async function loadSessionState() {
  if (!window.DOMA_CLOUD) return;
  currentUser = await window.DOMA_CLOUD.getCurrentUser();
  currentAgent = currentUser && currentUser.role === 'agent'
    ? await window.DOMA_CLOUD.getMyAgent()
    : null;
}

async function loadListings() {
  const remote = window.DOMA_CLOUD ? await window.DOMA_CLOUD.getListings() : null;
  if (Array.isArray(remote)) {
    currentListings = remote;
    listingsAreSamples = false;
  } else {
    // Database unreachable: show read-only samples so the map still works
    currentListings = DEMO_LISTINGS.map(l => ({ ...l, isSample: true }));
    listingsAreSamples = true;
  }
}

function isMyListing(item) {
  return !!(currentAgent && item.agentId === currentAgent.id);
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

  const myListingsBtn = document.querySelector('#filter-my-listings');
  if (myListingsBtn) myListingsBtn.hidden = !currentAgent;

  if (listingsAreSamples) {
    showToast('Could not reach the live database, so sample listings are shown for now.', 'info');
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
      if (!currentAgent || currentAgent.kycStatus !== 'verified') {
        showToast('Only KYC-verified agents can upload. Taking you to the Agent Portal…', 'info');
        setTimeout(() => { window.location.href = 'agent-portal.html'; }, 900);
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
}

function loadDemoListings() {
  currentListings = DEMO_LISTINGS.map(l => ({ ...l, isSample: true }));
  listingsAreSamples = true;
  renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
  showToast('Showing sample listings for preview. These are not live properties.', 'info');
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
    filtered = currentListings.filter(isMyListing);
  } else if (filter === 'saved') {
    const saved = getWishlist();
    filtered = currentListings.filter(l => saved.includes(l.id));
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
    } else if (filter === 'saved') {
      if (titleEl) titleEl.textContent = 'No saved listings yet';
      if (descEl) descEl.textContent = 'Tap the heart on any property to save it here. Saved listings stay on this device.';
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
  const main = item.media && item.media[0];
  const mainUrl = main ? safeMediaUrl(main.url) : '';
  if (mainUrl) {
    if (main.type === 'video') {
      mediaHtml = `
        <video controls playsinline preload="metadata">
          <source src="${escapeHtml(mainUrl)}">
          Your browser does not support video playback.
        </video>
      `;
    } else {
      mediaHtml = `<img src="${escapeHtml(mainUrl)}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async">`;
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
        ⚡ Budget friendly (&lt; ₦300k/yr)
      </div>
    `;
  }

  const cleanPhone = (item.agentPhone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I saw your listing on DOMA: "${item.title}" (${item.priceFormatted}) in ${item.area}, ${item.state}. Is it available?`)}`;
  const isOwn = isMyListing(item);
  const isSaved = getWishlist().includes(item.id);

  article.innerHTML = `
    <div class="card-media-wrapper">
      ${mediaHtml}
      <div class="card-badges-row">
        ${badgesHtml}
        ${item.isSample ? '<span class="card-badge sample">Sample</span>' : ''}
      </div>
      <button type="button" class="btn-favorite${isSaved ? ' saved' : ''}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from saved' : 'Save listing'}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
    <div class="card-content">
      <div class="card-price">${escapeHtml(item.priceFormatted)} <span>${escapeHtml(item.period)}</span></div>
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      ${campusHtml}
      ${item.distanceKm !== undefined ? `
        <div class="card-distance-pill">
          📍 ${(item.distanceKm < 1 ? Math.round(item.distanceKm * 1000) + 'm' : item.distanceKm.toFixed(1) + ' km')} from you
        </div>
      ` : ''}
      <div class="card-location">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--yellow-500)" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>${item.address ? `${escapeHtml(item.address)}, ` : ''}${escapeHtml(item.area)}, ${escapeHtml(item.state)}</span>
      </div>
      <div class="card-specs">
        ${item.spec1 ? `<div class="spec-item">${escapeHtml(item.spec1)}</div>` : ''}
        ${item.spec2 ? `<div class="spec-item">${escapeHtml(item.spec2)}</div>` : ''}
        <div class="spec-item">📷 <strong>${item.media ? item.media.length : 0}</strong></div>
      </div>
      <div class="card-footer">
        <div class="agent-info">
          <div class="agent-avatar" aria-hidden="true">${item.agentName ? escapeHtml(item.agentName[0].toUpperCase()) : 'A'}</div>
          <div>
            <div class="agent-name">${escapeHtml(item.agentName || 'Agent')}${item.isSample ? '' : ' <span class="kyc-tick" title="KYC-verified agent">✓ KYC</span>'}</div>
            <div class="agent-agency">${escapeHtml(item.agentAgency || '')}</div>
          </div>
        </div>
        <div class="card-actions">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-action whatsapp" aria-label="Chat with agent on WhatsApp">
            WhatsApp
          </a>
          <button type="button" class="btn-card-action btn-find-directions-trigger">
            Directions
          </button>
        </div>
      </div>
      ${isOwn ? `
        <div class="card-owner-row">
          <button type="button" class="btn-delete-listing">🗑️ Delete my listing</button>
        </div>
      ` : ''}
    </div>
  `;

  // Clicking anywhere on card synchronizes with the map
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
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let wishlist = getWishlist();
    const nowSaved = !wishlist.includes(item.id);
    wishlist = nowSaved ? [...wishlist, item.id] : wishlist.filter(x => x !== item.id);
    setWishlist(wishlist);
    favBtn.classList.toggle('saved', nowSaved);
    favBtn.setAttribute('aria-pressed', String(nowSaved));
    favBtn.setAttribute('aria-label', nowSaved ? 'Remove from saved' : 'Save listing');
    showToast(nowSaved ? 'Saved to your list ❤️' : 'Removed from saved');
  });

  article.querySelector('.btn-find-directions-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    openDirectionsForListing(item);
  });

  const deleteBtn = article.querySelector('.btn-delete-listing');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteListingWithConfirm(item));
  }

  return article;
}

async function deleteListingWithConfirm(item) {
  if (!confirm(`Delete listing "${item.title}"? This cannot be undone.`)) return;
  try {
    await window.DOMA_CLOUD.deleteListing(item.id);
    currentListings = currentListings.filter(l => l.id !== item.id);
    if (document.querySelector('#properties-grid')) {
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
    }
    renderAgentMyListings();
    showToast('Listing deleted.');
  } catch (err) {
    showToast(err.message, 'error');
  }
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
    zoomControl: false // Using custom Google Maps-style zoom group
  }).setView([6.5244, 3.3792], 12);
  // OpenStreetMap and Esri tiles require visible attribution
  leafletMap.attributionControl.setPrefix(false);

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
      <div class="gmap-price-marker ${markerClass}" data-listing-id="${escapeHtml(item.id)}" title="${escapeHtml(item.title)}">
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
  const el = document.querySelector(`.gmap-price-marker[data-listing-id="${CSS.escape(item.id)}"]`);
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
  const thumbUrl = safeMediaUrl(item.media && item.media[0] && item.media[0].type !== 'video' ? item.media[0].url : '', 'assets/images/hero_student_hostel.jpg');
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
    <div class="gmap-drawer-address">
      📍 ${escapeHtml(item.address ? item.address + ', ' : '')}${escapeHtml(item.area)}, ${escapeHtml(item.state)}
    </div>
    <div class="gmap-drawer-actions">
      <button type="button" class="gmap-drawer-btn primary" data-drawer-action="directions">
        🚗 Directions
      </button>
      <a href="${gmapsDeepLink}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn google-app">
        🗺️ Google Maps
      </a>
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn whatsapp">
        💬 WhatsApp
      </a>
      <button type="button" class="gmap-drawer-btn inspect" data-drawer-action="inspect">
        📅 Inspect
      </button>
    </div>
  `;

  // Handlers are bound to this item directly; listing data never reaches inline JS
  content.querySelector('[data-drawer-action="directions"]').addEventListener('click', () => openDirectionsForListing(item));
  content.querySelector('[data-drawer-action="inspect"]').addEventListener('click', () => openScheduleModal(item));

  drawer.style.display = 'block';
}

function closeGmapPropertyDrawer() {
  const drawer = document.querySelector('#gmap-property-preview-drawer');
  if (drawer) drawer.style.display = 'none';
  document.querySelectorAll('.gmap-price-marker').forEach(m => m.classList.remove('active'));
  currentActiveMarker = null;
}

let scheduleTarget = null;

function openScheduleModal(item) {
  const modal = document.querySelector('#schedule-modal');
  if (!modal) return;
  scheduleTarget = item;
  const nameEl = modal.querySelector('#modal-property-name');
  if (nameEl) nameEl.textContent = `${item.title} — ${item.area}, ${item.state}`;
  const dateEl = modal.querySelector('#viewing-date');
  if (dateEl) dateEl.min = new Date().toISOString().slice(0, 10);
  modal.classList.add('open');
}

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
  const hub = startKey === 'current' && currentUserGps
    ? { name: 'your current location', lat: currentUserGps.lat, lng: currentUserGps.lng }
    : (STARTING_HUBS[startKey] || STARTING_HUBS['tollgate']);
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
        <div>Depart from <strong>${escapeHtml(hub.name)}</strong> and merge onto the main arterial road.</div>
      </li>
      <li class="directions-step-item">
        <span class="step-num-badge">2</span>
        <div>Drive for approximately <strong>${(directDist * 0.6).toFixed(1)} km</strong> following navigation signs towards ${escapeHtml(item.area)}.</div>
      </li>
      <li class="directions-step-item">
        <span class="step-num-badge">3</span>
        <div>Turn towards <strong>${escapeHtml(item.address || item.area)}</strong>.</div>
      </li>
      <li class="directions-step-item">
        <span class="step-num-badge">4</span>
        <div>Arrive at destination: <strong style="color:var(--yellow-500);">${escapeHtml(item.title)}</strong> (${escapeHtml(item.state)}).</div>
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
   KYC status is decided by admins in the database; this page only displays it.
   ========================================================================== */
let editingKyc = false;

const KYC_FORM_FIELDS = {
  '#agent-fullname': 'name',
  '#agent-agency': 'agency',
  '#agent-phone': 'phone',
  '#agent-state': 'state',
  '#agent-cac': 'cac',
  '#agent-nin': 'nin',
  '#agent-idtype': 'idType',
  '#agent-idnumber': 'idNumber',
  '#agent-campus-focus': 'campusFocus',
  '#agent-office-address': 'officeAddress'
};

function initAgentPortalPage() {
  const regForm = document.querySelector('#agent-reg-form');
  const logoutBtn = document.querySelector('#btn-agent-logout');
  const payFeeBtn = document.querySelector('#btn-pay-agent-fee');
  const openUploadBtn = document.querySelector('#btn-open-upload-modal');
  const editKycBtn = document.querySelector('#btn-edit-kyc');
  const cancelEditBtn = document.querySelector('#btn-cancel-kyc-edit');

  updateAgentPortalView();

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const application = {};
      for (const [selector, key] of Object.entries(KYC_FORM_FIELDS)) {
        const el = regForm.querySelector(selector);
        application[key] = el ? el.value.trim() : '';
      }

      if (!/^\d{11}$/.test(application.nin)) {
        showToast('NIN / BVN must be exactly 11 digits.', 'error');
        regForm.querySelector('#agent-nin')?.focus();
        return;
      }

      const submitBtn = regForm.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }

      try {
        currentAgent = await window.DOMA_CLOUD.submitAgentApplication(application);
        editingKyc = false;
        updateAgentPortalView();
        showToast('KYC application submitted. An admin will review your CAC & NIN.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  }

  if (editKycBtn) {
    editKycBtn.addEventListener('click', () => {
      editingKyc = true;
      updateAgentPortalView();
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      editingKyc = false;
      updateAgentPortalView();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await window.DOMA_CLOUD.signOut();
      window.location.href = 'auth.html';
    });
  }

  const switchAccountBtn = document.querySelector('#nav-signout-btn-alt');
  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', async () => {
      await window.DOMA_CLOUD.signOut();
      window.location.href = 'auth.html?mode=signup&role=agent';
    });
  }

  if (payFeeBtn) {
    payFeeBtn.addEventListener('click', () => {
      window.location.href = 'payment.html?service=verification';
    });
  }

  if (openUploadBtn) {
    openUploadBtn.addEventListener('click', () => {
      if (!currentAgent || currentAgent.kycStatus !== 'verified') {
        showToast('Your KYC is still under review. You can upload once an admin approves it.', 'info');
        return;
      }
      openUploadModal();
    });
  }

  const myListings = document.querySelector('#agent-my-listings-container');
  if (myListings) {
    myListings.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'upload') {
        openUploadModal();
      } else if (btn.dataset.action === 'delete') {
        const item = currentListings.find(l => l.id === btn.dataset.listingId);
        if (item) deleteListingWithConfirm(item);
      }
    });
  }
}

function showOnly(visibleSelector, selectors) {
  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.hidden = sel !== visibleSelector;
  });
}

function updateAgentPortalView() {
  const sections = ['#agent-gate-signed-out', '#agent-gate-wrong-role', '#agent-registration-box', '#agent-active-dashboard'];
  const uploadStudio = document.querySelector('#agent-upload-studio');
  if (uploadStudio) uploadStudio.hidden = true;

  if (!currentUser) {
    showOnly('#agent-gate-signed-out', sections);
    return;
  }

  if (currentUser.role !== 'agent') {
    showOnly('#agent-gate-wrong-role', sections);
    const roleEl = document.querySelector('#agent-gate-role');
    if (roleEl) roleEl.textContent = currentUser.role;
    return;
  }

  if (!currentAgent || editingKyc) {
    showOnly('#agent-registration-box', sections);
    prefillKycForm();
    const cancelEditBtn = document.querySelector('#btn-cancel-kyc-edit');
    if (cancelEditBtn) cancelEditBtn.hidden = !currentAgent;
    return;
  }

  showOnly('#agent-active-dashboard', sections);

  const isVerified = currentAgent.kycStatus === 'verified';
  const isRejected = currentAgent.kycStatus === 'rejected';
  if (uploadStudio) uploadStudio.hidden = !isVerified;

  const displayName = document.querySelector('#agent-display-name');
  const displayAgency = document.querySelector('#agent-display-agency');
  const badgeInitials = document.querySelector('#agent-badge-initials');
  const kycBadge = document.querySelector('#agent-kyc-status-badge');
  const uploadBtn = document.querySelector('#btn-open-upload-modal');

  if (displayName) displayName.textContent = currentAgent.name || 'Agent';
  if (displayAgency) displayAgency.textContent = `${currentAgent.agency || 'Agency'} • ${currentAgent.state || 'Nigeria'}`;
  if (badgeInitials) {
    const parts = (currentAgent.name || 'A G').trim().split(/\s+/);
    badgeInitials.textContent = (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || '')).toUpperCase();
  }
  if (uploadBtn) uploadBtn.disabled = !isVerified;

  const status = isVerified ? 'verified' : (isRejected ? 'rejected' : 'pending');
  if (kycBadge) {
    kycBadge.className = `agent-status-tag ${status}`;
    kycBadge.textContent = isVerified ? 'KYC Verified' : (isRejected ? 'KYC Rejected' : 'KYC Pending Review');
  }

  const alertBanner = document.querySelector('#agent-kyc-alert-banner');
  if (alertBanner) {
    alertBanner.hidden = false;
    alertBanner.className = `kyc-alert ${status}`;
    if (isVerified) {
      alertBanner.innerHTML = '<strong>KYC verified.</strong> Your CAC and NIN have been approved. You can publish student hostels, houses and stores.';
    } else if (isRejected) {
      alertBanner.innerHTML = `<strong>KYC not approved:</strong> ${escapeHtml(currentAgent.rejectionReason || 'Your documents could not be verified.')} Update your details and resubmit.`;
    } else {
      alertBanner.innerHTML = '<strong>Review in progress.</strong> Our compliance team is checking your CAC and NIN. You can publish listings once you are approved.';
    }
  }

  const editKycBtn = document.querySelector('#btn-edit-kyc');
  if (editKycBtn) editKycBtn.textContent = isRejected ? 'Update & Resubmit KYC' : 'Edit KYC Details';

  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };

  setText('#dash-agent-id', currentAgent.id || '—');
  setText('#dash-agent-cac', currentAgent.cac || '—');
  const rawNin = String(currentAgent.nin || '');
  setText('#dash-agent-nin', rawNin.length >= 6 ? `${rawNin.slice(0, 4)}•••••${rawNin.slice(-2)}` : '—');
  setText('#dash-agent-idtype', currentAgent.idType + (currentAgent.idNumber ? ` [${currentAgent.idNumber}]` : ''));
  setText('#dash-agent-campus', currentAgent.campusFocus || 'General');
  setText('#dash-agent-address', currentAgent.officeAddress || '—');

  document.querySelectorAll('input[name="listing-agent-phone"]').forEach(input => {
    if (!input.value && currentAgent.phone) input.value = currentAgent.phone;
  });

  renderAgentMyListings();
}

function prefillKycForm() {
  const form = document.querySelector('#agent-reg-form');
  if (!form) return;
  const source = currentAgent || {
    name: currentUser.fullName,
    agency: currentUser.agency,
    phone: currentUser.phone,
    state: currentUser.state
  };
  for (const [selector, key] of Object.entries(KYC_FORM_FIELDS)) {
    const el = form.querySelector(selector);
    if (el && !el.value && source[key]) el.value = source[key];
  }
  const emailEl = form.querySelector('#agent-email');
  if (emailEl) emailEl.value = currentUser.email;
}

function renderAgentMyListings() {
  const container = document.querySelector('#agent-my-listings-container');
  if (!container || !currentAgent) return;

  const myListings = currentListings.filter(isMyListing);
  if (myListings.length === 0) {
    container.innerHTML = `
      <div class="empty-inline">
        <p>You haven't uploaded any listings yet.</p>
        ${currentAgent.kycStatus === 'verified' ? '<button type="button" class="btn-primary" data-action="upload">+ Upload your first listing</button>' : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="mini-listing-grid">
      ${myListings.map(l => {
        const isStudent = l.type === 'student';
        const isStore = l.type === 'store';
        const badgeClass = isStudent ? 'student' : (isStore ? 'gold' : '');
        const badgeText = isStudent ? '🎓 Student' : (isStore ? '🏪 Store' : '🏠 House');
        return `
          <div class="mini-listing-card">
            <div class="mini-listing-head">
              <span class="card-badge ${badgeClass}">${badgeText}</span>
              <span class="mini-listing-price">${escapeHtml(l.priceFormatted)}</span>
            </div>
            <h4>${escapeHtml(l.title)}</h4>
            ${l.campus && l.campus !== 'none' ? `<p class="mini-listing-campus">🎓 ${escapeHtml(l.campus)} ${l.campusDist ? `(${escapeHtml(l.campusDist)})` : ''}</p>` : ''}
            <p class="mini-listing-loc">📍 ${escapeHtml(l.area)}, ${escapeHtml(l.state)}</p>
            <div class="mini-listing-actions">
              <a href="listings.html?filter=my-listings">View on map →</a>
              <button type="button" class="btn-text-danger" data-action="delete" data-listing-id="${escapeHtml(l.id)}">Delete</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

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

    dropzone.addEventListener('click', (e) => {
      if (e.target !== input) input.click();
    });
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

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
    const useCloudinary = window.DOMA_CLOUD && window.DOMA_CLOUD.isCloudinaryConnected();

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isImage && !isVideo) continue;

      if (uploadedMediaFiles.length >= MAX_MEDIA_FILES) {
        showToast(`You can attach up to ${MAX_MEDIA_FILES} files per listing.`, 'info');
        break;
      }

      if (useCloudinary) {
        if (progressBar) progressBar.style.display = 'block';
        if (progressFill) progressFill.style.width = '10%';

        try {
          const uploaded = await window.DOMA_CLOUD.uploadToCloudinary(file, (percent) => {
            if (progressFill) progressFill.style.width = `${percent}%`;
          });
          uploadedMediaFiles.push(uploaded);
          renderPreviews(previewGrid);
        } catch (cloudErr) {
          console.warn('Cloudinary upload error:', cloudErr);
          if (isVideo) {
            showToast(`Could not upload "${file.name}": ${cloudErr.message}`, 'error');
          } else {
            // Photos can still be attached as compressed inline images
            uploadedMediaFiles.push({ type: 'image', url: await compressImage(file, 1000, 0.75), name: file.name });
            renderPreviews(previewGrid);
          }
        } finally {
          if (progressBar) {
            setTimeout(() => {
              progressBar.style.display = 'none';
              if (progressFill) progressFill.style.width = '0%';
            }, 800);
          }
        }
      } else if (isVideo) {
        showToast('Video tours need CDN hosting (Cloudinary), which is not set up yet. Please add photos.', 'info');
      } else {
        try {
          uploadedMediaFiles.push({ type: 'image', url: await compressImage(file, 1000, 0.75), name: file.name });
          renderPreviews(previewGrid);
        } catch (err) {
          console.error('Image compression error', err);
        }
      }
    }
  }

  function renderPreviews(previewGrid) {
    if (!previewGrid) return;
    previewGrid.innerHTML = uploadedMediaFiles.map((item, idx) => {
      const url = escapeHtml(safeMediaUrl(item.url));
      return `
        <div class="media-preview-item">
          ${item.type === 'video' ? `<video src="${url}" muted></video>` : `<img src="${url}" alt="Preview ${idx + 1}">`}
          <span class="media-preview-tag">${item.type === 'video' ? 'VIDEO' : 'PHOTO'}</span>
          <button type="button" class="media-preview-remove" data-index="${idx}" aria-label="Remove file ${idx + 1}">&times;</button>
        </div>
      `;
    }).join('');
  }

  previewGrids.forEach(grid => {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.media-preview-remove');
      if (!btn) return;
      uploadedMediaFiles.splice(Number(btn.dataset.index), 1);
      renderPreviews(grid);
    });
  });

  // Upload Form Handlers
  const uploadForms = document.querySelectorAll('.upload-listing-form');
  uploadForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentAgent || currentAgent.kycStatus !== 'verified') {
        showToast('Only KYC-verified agents can publish listings.', 'error');
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

      if (rawPrice <= 0) {
        showToast('Please enter a rent price above ₦0.', 'error');
        return;
      }

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
        id: 'DOMA-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        agentId: currentAgent.id,
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
        media: [...uploadedMediaFiles]
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing…';
      }

      try {
        const saved = await window.DOMA_CLOUD.saveListing(newListing);
        if (listingsAreSamples) {
          currentListings = [];
          listingsAreSamples = false;
        }
        currentListings.unshift(saved);
      } catch (err) {
        showToast(err.message, 'error');
        return;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }

      // Reset
      form.reset();
      uploadedMediaFiles = [];
      document.querySelectorAll('.media-preview-grid').forEach(g => g.innerHTML = '');
      closeModal('#upload-modal');

      const budgetNote = rawPrice <= 300000 ? ' It is badged as budget-friendly (under ₦300k).' : '';
      showToast(`"${title}" is now live on the map.${budgetNote}`);

      if (document.querySelector('#properties-grid')) {
        renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
        const listingsSec = document.querySelector('#listings-section');
        if (listingsSec) listingsSec.scrollIntoView({ behavior: 'smooth' });
      } else {
        renderAgentMyListings();
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

  const serviceCards = document.querySelectorAll('.service-package-card');
  function selectServiceCard(card) {
    serviceCards.forEach(c => {
      c.classList.toggle('selected', c === card);
      c.setAttribute('aria-checked', String(c === card));
    });
    currentAmount = parseInt(card.dataset.amount, 10);
    currentTitle = card.dataset.title;
    updatePaymentDisplays(currentAmount, currentTitle);
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => selectServiceCard(card));
  });

  const presetCard = serviceParam && document.querySelector(`.service-package-card[data-service="${CSS.escape(serviceParam)}"]`);
  if (presetCard) {
    selectServiceCard(presetCard);
  } else {
    updatePaymentDisplays(currentAmount, currentTitle);
  }

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
        showToast('Demo account number copied.', 'info');
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
      receiptBox.querySelector('#receipt-ref').textContent = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
      receiptBox.querySelector('#receipt-date').textContent = new Date().toLocaleString();
    }

    showToast(`Demo checkout complete for ₦${amt.toLocaleString()}. No money was charged.`, 'info');
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
   Modals
   ========================================================================== */
function initModals() {
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    });
  });

  // Click outside the dialog or press Escape to close
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Inspection requests go straight to the agent on WhatsApp; nothing is stored by DOMA
  const viewingForm = document.querySelector('#viewing-form');
  if (viewingForm) {
    viewingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = viewingForm.querySelector('#viewing-name').value.trim();
      const date = viewingForm.querySelector('#viewing-date').value;
      if (!name || !date || !scheduleTarget) {
        showToast('Please add your name and a preferred date.', 'error');
        return;
      }
      const phone = (scheduleTarget.agentPhone || '').replace(/[^0-9]/g, '');
      const when = new Date(`${date}T12:00:00`).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
      const message = `Hello, my name is ${name}. I found your listing on DOMA: "${scheduleTarget.title}" in ${scheduleTarget.area}, ${scheduleTarget.state}. Can I inspect it on ${when}?`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      closeModal('#schedule-modal');
      viewingForm.reset();
    });
  }
}

function closeModal(selector) {
  const modal = document.querySelector(selector);
  if (modal) modal.classList.remove('open');
}
