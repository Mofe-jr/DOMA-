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
let activeListingId = null;
let markerSource = []; // listings currently drawn on the map (before grouping)
let campusLayer = null;
let campusesVisible = true;

const NIGERIA_BOUNDS = [[4.2, 2.6], [13.9, 14.7]];
const CAMPUS_RADIUS_KM = 5; // "near campus" for filters and the campus panel
const CAMPUS_ZONE_METRES = 3000; // shaded walking/okada zone drawn around each campus
const CAMPUS_COLOURS = { federal: '#60a5fa', state: '#34d399', polytechnic: '#fbbf24' };

// Nigerian Coordinates Reference Directory
const NIGERIAN_GEO_DIRECTORY = {
  'lekki': { lat: 6.4474, lng: 3.4723, state: 'Lagos', landmark: 'Admiralty Way, Lekki Phase 1' },
  'victoria island': { lat: 6.4281, lng: 3.4219, state: 'Lagos', landmark: 'Ozumba Mbadiwe Ave, VI' },
  'vi': { lat: 6.4281, lng: 3.4219, state: 'Lagos', landmark: 'Ahmadu Bello Way, VI' },
  'ikoyi': { lat: 6.4549, lng: 3.4357, state: 'Lagos', landmark: 'Bourdillon Road, Ikoyi' },
  'banana island': { lat: 6.4632, lng: 3.4545, state: 'Lagos', landmark: 'Banana Island, Ikoyi' },
  'ikeja': { lat: 6.5912, lng: 3.3515, state: 'Lagos', landmark: 'Isaac John St, Ikeja GRA' },
  'ikeja gra': { lat: 6.5912, lng: 3.3515, state: 'Lagos', landmark: 'Ikeja GRA' },
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
  'bodija': { lat: 7.4350, lng: 3.9100, state: 'Oyo', landmark: 'Old Bodija / UI Corridor, Ibadan' },
  'benin city': { lat: 6.3350, lng: 5.6037, state: 'Edo', landmark: "King's Square / Ring Road, Benin City" },
  'benin': { lat: 6.3350, lng: 5.6037, state: 'Edo', landmark: "Ring Road, Benin City" },
  'ugbowo': { lat: 6.3985, lng: 5.6120, state: 'Edo', landmark: 'Ugbowo / UNIBEN Main Campus Corridor' },
  'uniben': { lat: 6.4010, lng: 5.6110, state: 'Edo', landmark: 'University of Benin (UNIBEN), Ugbowo' },
  'uselu': { lat: 6.3760, lng: 5.6150, state: 'Edo', landmark: 'Uselu / Lagos Road, Benin City' },
  'ekenwan': { lat: 6.3290, lng: 5.5850, state: 'Edo', landmark: 'Ekenwan Road / UNIBEN Ekenwan Campus' },
  'gra': { lat: 6.3170, lng: 5.6150, state: 'Edo', landmark: 'GRA, Benin City' },
  'ikpoba hill': { lat: 6.3290, lng: 5.6540, state: 'Edo', landmark: 'Ikpoba Hill, Benin City' },
  'sapele road': { lat: 6.3090, lng: 5.6200, state: 'Edo', landmark: 'Sapele Road, Benin City' },
  'ekpoma': { lat: 6.7420, lng: 6.1390, state: 'Edo', landmark: 'Ekpoma Town / AAU Corridor' },
  'auchi': { lat: 7.0670, lng: 6.2670, state: 'Edo', landmark: 'Auchi Town / Auchi Polytechnic' }
};

const STARTING_HUBS = {
  'current': { name: 'Current Location (GPS)', lat: 6.4480, lng: 3.4200 },
  'tollgate': { name: 'Lekki Phase 1 Toll Gate', lat: 6.4385, lng: 3.4430 },
  'airport_lagos': { name: 'Murtala Muhammed Airport (MM2)', lat: 6.5774, lng: 3.3214 },
  'stadium_lagos': { name: 'National Stadium, Surulere', lat: 6.4950, lng: 3.3590 },
  'vi_lagos': { name: 'Ozumba Mbadiwe, VI', lat: 6.4310, lng: 3.4280 },
  'cbd_abuja': { name: 'Central Business District, Abuja', lat: 9.0578, lng: 7.4950 },
  'airport_abuja': { name: 'Nnamdi Azikiwe Airport, Abuja', lat: 9.0065, lng: 7.2631 },
  'ph_gra': { name: 'Aba Road / Old GRA, Port Harcourt', lat: 4.8150, lng: 7.0450 },
  'benin_ring_road': { name: "Ring Road (King's Square), Benin City", lat: 6.3350, lng: 5.6037 },
  'uniben_gate': { name: 'UNIBEN main gate, Ugbowo', lat: 6.3985, lng: 5.6120 }
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
    id: 'DOMA-student-uniben',
    agentId: 'demo-agent-uniben',
    agentName: 'Osaro Igbinedion',
    agentAgency: 'Ugbowo Campus Homes',
    agentPhone: '+2348000000101',
    type: 'student',
    title: 'Tiled Self-Contain near UNIBEN Main Gate',
    price: 200000,
    priceFormatted: '₦200,000',
    period: '/year',
    state: 'Edo',
    area: 'Ugbowo, Benin City',
    address: 'Off Ugbowo-Lagos Road, near UNIBEN Main Gate',
    campus: 'UNIBEN (Benin City)',
    campusDist: '6 mins walk to UNIBEN Main Gate',
    spec1: 'Self-Contain Room',
    spec2: 'Borehole & Prepaid Meter',
    lat: 6.3962,
    lng: 5.6148,
    media: [{ type: 'image', url: 'assets/images/hero_budget_selfcon.jpg' }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOMA-gra-benin',
    agentId: 'demo-agent-uniben',
    agentName: 'Osaro Igbinedion',
    agentAgency: 'Ugbowo Campus Homes',
    agentPhone: '+2348000000101',
    type: 'house',
    title: 'Modern 3-Bedroom Flat in GRA, Benin City',
    price: 2500000,
    priceFormatted: '₦2,500,000',
    period: '/year',
    state: 'Edo',
    area: 'GRA, Benin City',
    address: 'Off Ihama Road, GRA',
    campus: 'none',
    spec1: '3 Bedrooms',
    spec2: 'Gated Compound & Parking',
    lat: 6.3175,
    lng: 5.6168,
    media: [{ type: 'image', url: 'assets/images/hero_luxury_home.jpg' }],
    createdAt: new Date().toISOString()
  },
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
    renderHomeLatest();
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
  const searchTabs = document.querySelectorAll('.search-tab');
  const categorySelect = document.getElementById('home-search-category');
  const heroSec = document.getElementById('hero-slider-section');
  if (!slides.length) return;

  const SLIDE_DURATION = 6000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentSlide = 0;
  let slideTimer = null;

  function setCategory(cat) {
    searchTabs.forEach(t => {
      const active = t.dataset.filter === cat;
      t.classList.toggle('active', active);
      t.setAttribute('aria-pressed', String(active));
    });
    if (categorySelect && cat) categorySelect.value = cat;
  }

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    thumbBtns.forEach((btn, i) => {
      const active = i === currentSlide;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
      const prog = btn.querySelector('.thumb-progress');
      if (prog) {
        prog.style.animation = 'none';
        if (active && !reduceMotion) {
          void prog.offsetWidth; // restart the progress bar
          prog.style.animation = `progressTimer ${SLIDE_DURATION}ms linear forwards`;
        }
      }
    });
    setCategory(slides[currentSlide].dataset.category);
  }

  function stopAutoSlide() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = null;
  }

  function startAutoSlide() {
    stopAutoSlide();
    if (reduceMotion) return;
    slideTimer = setInterval(() => goToSlide(currentSlide + 1), SLIDE_DURATION);
  }

  thumbBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      goToSlide(idx);
      startAutoSlide();
    });
  });

  // Tabs pick the search category; they also show the matching photo when there is one
  searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      const slideIdx = Array.from(slides).findIndex(s => s.dataset.category === filter);
      if (slideIdx >= 0) {
        goToSlide(slideIdx);
        startAutoSlide();
      } else {
        setCategory(filter);
      }
    });
  });

  if (heroSec) {
    heroSec.addEventListener('mouseenter', stopAutoSlide);
    heroSec.addEventListener('mouseleave', startAutoSlide);
    heroSec.addEventListener('focusin', stopAutoSlide);
  }

  goToSlide(0);
  startAutoSlide();
}

/* ==========================================================================
   Homepage: latest listings rail
   ========================================================================== */
function renderHomeLatest() {
  const grid = document.querySelector('#home-latest-grid');
  const section = document.querySelector('#home-latest-section');
  if (!grid || !section) return;

  const latest = currentListings.slice(0, 6);
  section.hidden = latest.length === 0;
  const note = document.querySelector('#home-latest-note');
  if (note) note.hidden = !listingsAreSamples;
  grid.replaceChildren(...latest.map(createPropertyCardElement));
  grid.removeAttribute('aria-busy');
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
      const legend = document.querySelector('.map-legend');
      if (legend) legend.hidden = mode === 'grid';

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
  grid.removeAttribute('aria-busy');

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
      const campus = findCampus(campusFilter);
      if (campus) filtered = filtered.filter(l => isNearCampus(l, campus));
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
  const mainUrl = main ? safeMediaUrl(main.type === 'video' ? main.url : cardImage(main.url)) : '';
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
    mediaHtml = `<div class="card-media-placeholder">${icon('image')}</div>`;
  }

  const isBudget = (item.price || 0) <= 300000;
  const mediaCount = item.media ? item.media.length : 0;

  let campusHtml = '';
  if (item.campus && item.campus !== 'none') {
    campusHtml = `
      <div class="card-campus-pill">
        ${icon('cap')}<span>${escapeHtml(item.campusDist || 'Near campus')} · ${escapeHtml(item.campus)}</span>
      </div>
    `;
  }

  const cleanPhone = (item.agentPhone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I saw your listing on DOMA: "${item.title}" (${item.priceFormatted}) in ${item.area}, ${item.state}. Is it available?`)}`;
  const isOwn = isMyListing(item);
  const isSaved = getWishlist().includes(item.id);
  const agentInitial = item.agentName ? escapeHtml(item.agentName.trim()[0].toUpperCase()) : 'A';

  article.innerHTML = `
    <div class="card-media-wrapper">
      ${mediaHtml}
      <div class="card-badges-row">
        ${typeBadgeHtml(item.type)}
        ${isBudget ? `<span class="card-badge budget">${icon('tag')}Under ₦300k</span>` : ''}
        ${item.isSample ? '<span class="card-badge sample">Sample</span>' : ''}
      </div>
      <button type="button" class="btn-favorite${isSaved ? ' saved' : ''}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from saved' : 'Save listing'}">
        ${icon('heart')}
      </button>
      ${mediaCount > 1 ? `<span class="card-media-count">${icon('camera')}${mediaCount}</span>` : ''}
    </div>
    <div class="card-content">
      <div class="card-price-row">
        <div class="card-price">${escapeHtml(item.priceFormatted)}<span>${escapeHtml(item.period)}</span></div>
        ${item.distanceKm !== undefined ? `
          <span class="card-distance-pill">${icon('navigation')}${(item.distanceKm < 1 ? Math.round(item.distanceKm * 1000) + ' m' : item.distanceKm.toFixed(1) + ' km')}</span>
        ` : ''}
      </div>
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <div class="card-location">
        ${icon('pin')}
        <span>${item.address ? `${escapeHtml(item.address)}, ` : ''}${escapeHtml(item.area)}, ${escapeHtml(item.state)}</span>
      </div>
      ${campusHtml}
      ${item.spec1 || item.spec2 ? `
        <div class="card-specs">
          ${item.spec1 ? `<span class="spec-item">${icon('bed')}${escapeHtml(item.spec1)}</span>` : ''}
          ${item.spec2 ? `<span class="spec-item">${icon('sparkle')}${escapeHtml(item.spec2)}</span>` : ''}
        </div>
      ` : ''}
      <div class="card-footer">
        <div class="agent-info">
          <div class="agent-avatar" aria-hidden="true">${agentInitial}</div>
          <div class="agent-text">
            <div class="agent-name">
              <span>${escapeHtml(item.agentName || 'Agent')}</span>
              ${item.isSample ? '' : `<span class="kyc-tick" title="KYC-verified agent">${icon('shield')}</span>`}
            </div>
            <div class="agent-agency">${escapeHtml(item.agentAgency || '')}</div>
          </div>
        </div>
        <div class="card-actions">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-action whatsapp" aria-label="Chat with the agent on WhatsApp" title="WhatsApp">
            ${icon('message')}
          </a>
          <button type="button" class="btn-card-action btn-find-directions-trigger" aria-label="Directions" title="Directions">
            ${icon('navigation')}
          </button>
        </div>
      </div>
      ${isOwn ? `
        <div class="card-owner-row">
          <button type="button" class="btn-delete-listing">${icon('trash')}Delete my listing</button>
        </div>
      ` : ''}
    </div>
  `;

  // Clicking a card focuses it on the map, or opens the map page where there is none
  article.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('video')) return;
    if (!leafletMap) {
      window.location.href = `listings.html?q=${encodeURIComponent(item.area || '')}`;
      return;
    }
    leafletMap.flyTo([item.lat || 6.4474, item.lng || 3.4723], 14, { duration: 0.8 });
    openGmapPropertyDrawer(item);
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
    showToast(nowSaved ? 'Saved to your list' : 'Removed from saved');
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
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

function initInteractiveMap() {
  const mapEl = document.querySelector('#interactive-map');
  if (!mapEl || typeof L === 'undefined') return;

  leafletMap = L.map('interactive-map', {
    zoomControl: false, // Using custom Google Maps-style zoom group
    minZoom: 5,
    maxBounds: [[2, 0], [16, 17]],
    worldCopyJump: false
  }).fitBounds(NIGERIA_BOUNDS);
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
  const layerOpts = document.querySelectorAll('.gmap-layer-opt[data-layer]');

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
          showToast('Dark map style', 'info');
        } else if (selected === 'streets') {
          if (leafletMap.hasLayer(satelliteTileLayer)) leafletMap.removeLayer(satelliteTileLayer);
          if (!leafletMap.hasLayer(streetTileLayer)) streetTileLayer.addTo(leafletMap);
          mapEl.classList.remove('layer-dark');
          currentTileLayerType = 'streets';
          showToast('Street map style', 'info');
        } else if (selected === 'satellite') {
          if (leafletMap.hasLayer(streetTileLayer)) leafletMap.removeLayer(streetTileLayer);
          if (!leafletMap.hasLayer(satelliteTileLayer)) satelliteTileLayer.addTo(leafletMap);
          mapEl.classList.remove('layer-dark');
          currentTileLayerType = 'satellite';
          showToast('Satellite imagery', 'info');
        }

        layerMenu.classList.remove('open');
      });
    });
  }

  // University layer toggle (lives in the layer menu)
  const campusToggle = document.querySelector('#btn-toggle-campuses');
  if (campusToggle) {
    campusToggle.addEventListener('click', () => {
      campusesVisible = !campusesVisible;
      campusToggle.classList.toggle('active', campusesVisible);
      campusToggle.setAttribute('aria-pressed', String(campusesVisible));
      if (campusesVisible) campusLayer.addTo(leafletMap);
      else leafletMap.removeLayer(campusLayer);
    });
  }

  // Jump to a state
  const stateJump = document.querySelector('#map-state-jump');
  if (stateJump) {
    stateJump.addEventListener('change', () => {
      const st = NIGERIAN_STATES.find(x => x.value === stateJump.value);
      if (st) flyToState(st);
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

    NIGERIAN_CAMPUSES.forEach(c => {
      if ([c.short, c.name, c.town, c.state].some(v => v.toLowerCase().includes(q))) {
        matches.push({
          type: 'campus',
          title: `${c.short} · ${c.name}`,
          subtitle: `${CAMPUS_TYPE_LABELS[c.type]} · ${c.town}, ${c.state}`,
          lat: c.lat,
          lng: c.lng,
          campus: c
        });
      }
    });

    NIGERIAN_STATES.forEach(st => {
      if (st.value.toLowerCase().startsWith(q) || st.city.toLowerCase().startsWith(q)) {
        matches.push({ type: 'state', title: `${st.label} State`, subtitle: `Centred on ${st.city}`, lat: st.lat, lng: st.lng, state: st });
      }
    });

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
        <li class="gmap-autocomplete-item is-empty">
          ${icon('search')}<span>No matching places or listings</span>
        </li>
      `;
      autocompleteList.classList.add('open');
      return;
    }

    const AUTOCOMPLETE_ICONS = { campus: 'cap', state: 'map', listing: 'home', location: 'pin' };
    matches.slice(0, 7).forEach(item => {
      const li = document.createElement('li');
      li.className = 'gmap-autocomplete-item';
      li.innerHTML = `
        <span class="gmap-autocomplete-icon ${item.campus ? `campus-${item.campus.type}` : ''}">${icon(AUTOCOMPLETE_ICONS[item.type])}</span>
        <div class="gmap-autocomplete-text">
          <div class="gmap-autocomplete-title">${escapeHtml(item.title)}</div>
          <div class="gmap-autocomplete-sub">${escapeHtml(item.subtitle)}</div>
        </div>
      `;

      li.addEventListener('click', () => {
        if (searchInput) searchInput.value = item.campus ? item.campus.short : item.title;
        autocompleteList.classList.remove('open');

        if (item.state) {
          flyToState(item.state);
        } else if (item.campus) {
          focusCampus(item.campus);
        } else {
          leafletMap.flyTo([item.lat, item.lng], 14, { duration: 1.2 });
          if (item.listing) openGmapPropertyDrawer(item.listing);
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
          showToast('Finding your location to show nearby properties…', 'info');
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
    leafletMap.on('dragend', () => {
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
      showToast(`${inView.length} properties in this map area`, 'info');
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
      if (isFull) showToast('Full-screen map. Press Esc to exit.', 'info');
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
      leafletMap.flyToBounds(NIGERIA_BOUNDS, { duration: 1.2 });
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

  // Regroup pins and adjust campus labels as the zoom changes
  leafletMap.on('zoomend', () => {
    mapEl.classList.toggle('map-far', leafletMap.getZoom() < 8);
    drawListingMarkers();
  });
  mapEl.classList.toggle('map-far', leafletMap.getZoom() < 8);

  renderCampusLayer();
  refreshMapMarkers(currentListings);
}

/* ==========================================================================
   Universities layer: highlighted campuses with a shaded zone around each
   ========================================================================== */
function isNearCampus(listing, campus) {
  if (listing.campus && listing.campus !== 'none') {
    const tag = listing.campus.toLowerCase();
    if (tag === campus.label.toLowerCase() || tag.split(/[\s(&]/)[0] === campus.short.toLowerCase()) return true;
  }
  return !!(listing.lat && listing.lng) &&
    calculateHaversineDistanceKm(campus.lat, campus.lng, listing.lat, listing.lng) <= CAMPUS_RADIUS_KM;
}

function renderCampusLayer() {
  campusLayer = L.layerGroup();
  NIGERIAN_CAMPUSES.forEach(campus => {
    const colour = CAMPUS_COLOURS[campus.type];
    L.circle([campus.lat, campus.lng], {
      radius: CAMPUS_ZONE_METRES,
      color: colour,
      weight: 1,
      opacity: 0.7,
      dashArray: '4 4',
      fillColor: colour,
      fillOpacity: 0.08,
      interactive: false
    }).addTo(campusLayer);

    const marker = L.marker([campus.lat, campus.lng], {
      icon: L.divIcon({
        className: 'campus-marker-anchor',
        html: `<div class="campus-marker ${campus.type}" title="${escapeHtml(campus.name)}">${icon('cap')}<span>${escapeHtml(campus.short)}</span></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      keyboard: true,
      title: campus.name,
      zIndexOffset: -500 // listings stay on top of campus markers
    });
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      focusCampus(campus);
    });
    marker.addTo(campusLayer);
  });
  if (campusesVisible) campusLayer.addTo(leafletMap);
}

function flyToState(st) {
  leafletMap.flyTo([st.lat, st.lng], st.zoom, { duration: 1.2 });
  const stateJump = document.querySelector('#map-state-jump');
  if (stateJump) stateJump.value = st.value;
}

function focusCampus(campus) {
  if (!leafletMap) return;
  leafletMap.flyTo([campus.lat, campus.lng], 14, { duration: 1.1 });
  openCampusDrawer(campus);
}

function openCampusDrawer(campus) {
  const drawer = document.querySelector('#gmap-property-preview-drawer');
  const content = document.querySelector('#gmap-drawer-content');
  if (!drawer || !content) return;

  const nearby = currentListings.filter(l => isNearCampus(l, campus)).sort((a, b) => a.price - b.price);
  const state = NIGERIAN_STATES.find(st => st.value === campus.state);
  activeListingId = null;
  document.querySelectorAll('.gmap-price-marker').forEach(m => m.classList.remove('active'));

  content.innerHTML = `
    <div class="campus-drawer-head ${campus.type}">
      <span class="campus-type-pill ${campus.type}">${icon('cap')}${CAMPUS_TYPE_LABELS[campus.type]}</span>
      <h4 class="gmap-drawer-title">${escapeHtml(campus.name)} <span class="campus-short">${escapeHtml(campus.short)}</span></h4>
      <div class="gmap-drawer-address">${icon('pin')}<span>${escapeHtml(campus.town)}, ${escapeHtml(state ? state.label : campus.state)} State</span></div>
    </div>
    <div class="campus-stats">
      <div><strong>${nearby.length}</strong><span>${nearby.length === 1 ? 'home' : 'homes'} within ${CAMPUS_RADIUS_KM} km</span></div>
      <div><strong>${nearby.length ? escapeHtml(formatPricePill(nearby[0].price)) : '—'}</strong><span>lowest yearly rent</span></div>
    </div>
    <div class="gmap-drawer-actions">
      <button type="button" class="gmap-drawer-btn primary" data-campus-action="nearby">${icon('home')}Homes nearby</button>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${campus.lat},${campus.lng}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn">${icon('navigation')}Directions</a>
    </div>
  `;

  content.querySelector('[data-campus-action="nearby"]').addEventListener('click', () => showHomesNearCampus(campus));
  drawer.style.display = 'block';
}

function showHomesNearCampus(campus) {
  const campusSelect = document.querySelector('#listings-campus-filter');
  if (campusSelect) campusSelect.value = campus.id;
  currentCampusFilter = campus.id;
  currentActiveMarker = null;
  renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
  const count = document.querySelectorAll('#properties-grid .property-card').length;
  showToast(count ? `${count} ${count === 1 ? 'home' : 'homes'} near ${campus.short}` : `No listings near ${campus.short} yet`, count ? 'success' : 'info');
  if (!count) leafletMap.flyTo([campus.lat, campus.lng], 13, { duration: 0.8 });
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
      userGpsMarker.bindPopup('<b>Your location</b><br><span class="popup-sub">Distances are measured from here</span>');

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
          ? 'Approximate location (Yaba / UNILAG)'
          : 'Your location · nearest first';
      }

      if (gpsBtn) {
        gpsBtn.classList.remove('loading');
        gpsBtn.classList.add('active');
      }

      // Re-render listings grid and map markers with distances
      renderListingsGrid(currentCategoryFilter, currentSearchQuery, currentStateFilter, currentCampusFilter, currentBudgetFilter);
      refreshMapMarkers(currentListings);

      showToast(isSimulated 
        ? 'Location unavailable, so distances are from Yaba / UNILAG.'
        : 'Sorted by distance from you.'
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
function refreshMapMarkers(listingsToDisplay = currentListings, { fit = true } = {}) {
  if (!leafletMap || typeof L === 'undefined') return;
  markerSource = listingsToDisplay;

  const countBadge = document.querySelector('#map-pinned-count');
  if (countBadge) {
    countBadge.textContent = `${listingsToDisplay.length} ${listingsToDisplay.length === 1 ? 'property' : 'properties'} on the map`;
  }

  drawListingMarkers();

  if (fit && listingsToDisplay.length > 0 && !currentActiveMarker) {
    const bounds = listingsToDisplay.map(item => [item.lat || 6.4474, item.lng || 3.4723]);
    if (currentUserGps) bounds.push([currentUserGps.lat, currentUserGps.lng]);
    leafletMap.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }
}

// Pins closer than one grid cell on screen share a bubble; zoom in to split them
const CLUSTER_CELL_PX = { x: 74, y: 44 };

function drawListingMarkers() {
  if (!leafletMap) return;
  mapMarkers.forEach(m => leafletMap.removeLayer(m));
  mapMarkers = [];

  const zoom = leafletMap.getZoom();
  const cells = new Map();
  markerSource.forEach(item => {
    const pt = leafletMap.project([item.lat || 6.4474, item.lng || 3.4723], zoom);
    const key = zoom >= 15 ? item.id : `${Math.floor(pt.x / CLUSTER_CELL_PX.x)}:${Math.floor(pt.y / CLUSTER_CELL_PX.y)}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(item);
  });

  cells.forEach(group => {
    if (group.length === 1) addPriceMarker(group[0]);
    else addClusterMarker(group);
  });
}

function addPriceMarker(item) {
  const isStudent = item.type === 'student' || (item.campus && item.campus !== 'none');
  const isBudget = (item.price || 0) <= 300000;
  const isStore = item.type === 'store';

  let markerIcon = 'home';
  let markerClass = '';
  if (isStudent) {
    markerIcon = 'cap';
    markerClass = 'student';
  } else if (isBudget) {
    markerIcon = 'tag';
    markerClass = 'budget';
  } else if (isStore) {
    markerIcon = 'store';
    markerClass = 'store';
  }

  const markerHtml = `
    <div class="gmap-price-marker ${markerClass}${item.id === activeListingId ? ' active' : ''}" data-listing-id="${escapeHtml(item.id)}" title="${escapeHtml(item.title)}">
      ${icon(markerIcon)}
      <span>${formatPricePill(item.price)}</span>
    </div>
  `;

  const marker = L.marker([item.lat || 6.4474, item.lng || 3.4723], {
    icon: L.divIcon({ html: markerHtml, className: '', iconSize: [80, 32], iconAnchor: [40, 36], popupAnchor: [0, -36] }),
    title: item.title,
    riseOnHover: true
  }).addTo(leafletMap);

  marker.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    selectMapMarker(item, marker);
  });
  mapMarkers.push(marker);
}

function addClusterMarker(group) {
  const lat = group.reduce((sum, i) => sum + (i.lat || 6.4474), 0) / group.length;
  const lng = group.reduce((sum, i) => sum + (i.lng || 3.4723), 0) / group.length;
  const minPrice = Math.min(...group.map(i => i.price || 0));

  const marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'campus-marker-anchor',
      html: `<div class="map-cluster"><strong>${group.length}</strong><span>from ${formatPricePill(minPrice)}</span></div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    }),
    title: `${group.length} properties, zoom in to see them`,
    zIndexOffset: 200
  }).addTo(leafletMap);

  marker.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    const bounds = L.latLngBounds(group.map(i => [i.lat || 6.4474, i.lng || 3.4723]));
    const target = Math.min(leafletMap.getBoundsZoom(bounds, false, L.point(80, 80)), 16);
    leafletMap.flyTo(bounds.getCenter(), Math.max(target, leafletMap.getZoom() + 2), { duration: 0.8 });
  });
  mapMarkers.push(marker);
}

function selectMapMarker(item, marker) {
  // Highlight active price pill
  document.querySelectorAll('.gmap-price-marker').forEach(m => m.classList.remove('active'));
  const el = document.querySelector(`.gmap-price-marker[data-listing-id="${CSS.escape(item.id)}"]`);
  if (el) el.classList.add('active');

  activeListingId = item.id;
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
  const thumbUrl = safeMediaUrl(item.media && item.media[0] && item.media[0].type !== 'video' ? cardImage(item.media[0].url) : '', 'assets/images/hero_student_hostel-sm.webp');
  const cleanPhone = (item.agentPhone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello DOMA Agent, I am interested in your property: "${item.title}" (${item.priceFormatted}) in ${item.area}, ${item.state}.`)}`;
  const gmapsDeepLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  let distHtml = '';
  if (item.distanceKm !== undefined) {
    const distText = item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)}m away` : `${item.distanceKm.toFixed(1)} km away`;
    distHtml = `<div class="gmap-drawer-dist-pill">${icon('navigation')}${distText}</div>`;
  }

  let campusHtml = '';
  if (item.campus && item.campus !== 'none') {
    campusHtml = `<div class="gmap-drawer-campus-pill">${icon('cap')}${escapeHtml(item.campusDist || item.campus)}</div>`;
  }

  content.innerHTML = `
    <div class="gmap-drawer-media">
      <img src="${escapeHtml(thumbUrl)}" class="gmap-drawer-img" alt="${escapeHtml(item.title)}">
      <div class="gmap-drawer-badge">${typeBadgeHtml(item.type)}</div>
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
      ${icon('pin')}<span>${escapeHtml(item.address ? item.address + ', ' : '')}${escapeHtml(item.area)}, ${escapeHtml(item.state)}</span>
    </div>
    <div class="gmap-drawer-actions">
      <button type="button" class="gmap-drawer-btn primary" data-drawer-action="directions">
        ${icon('navigation')}Directions
      </button>
      <a href="${gmapsDeepLink}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn google-app">
        ${icon('external')}Google Maps
      </a>
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="gmap-drawer-btn whatsapp">
        ${icon('message')}WhatsApp
      </a>
      <button type="button" class="gmap-drawer-btn inspect" data-drawer-action="inspect">
        ${icon('calendar')}Inspect
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
  activeListingId = null;
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
  const lower = searchTerm.toLowerCase().trim();

  // Most specific first: a campus code ("UNIBEN"), a state, a known place, then campus names
  const campusByCode = findCampus(lower) || NIGERIAN_CAMPUSES.find(c =>
    c.short.toLowerCase() === lower || placeMatches(lower, c.short.toLowerCase()));
  if (campusByCode) {
    focusCampus(campusByCode);
    return;
  }

  const state = NIGERIAN_STATES.find(st => st.value.toLowerCase() === lower || st.city.toLowerCase() === lower);
  if (state) {
    flyToState(state);
    return;
  }

  const placeKey = Object.keys(NIGERIAN_GEO_DIRECTORY)
    .sort((a, b) => b.length - a.length)
    .find(key => placeMatches(lower, key) || key.startsWith(lower));
  if (placeKey) {
    const geo = NIGERIAN_GEO_DIRECTORY[placeKey];
    leafletMap.flyTo([geo.lat, geo.lng], 13, { duration: 1.2 });
    showToast(`Showing ${geo.landmark}`, 'info');
    return;
  }

  const campusByName = NIGERIAN_CAMPUSES.find(c => c.name.toLowerCase().includes(lower));
  if (campusByName) {
    focusCampus(campusByName);
    return;
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
  if (!modal) {
    // Pages without the map: hand straight over to Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat || 6.4474},${item.lng || 3.4723}`, '_blank', 'noopener');
    return;
  }

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
      trafficEl.textContent = 'Long drive';
      trafficEl.className = 'traffic-badge amber';
    } else {
      trafficEl.textContent = 'Short drive';
      trafficEl.className = 'traffic-badge green';
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
    const alertIcon = icon(isVerified ? 'check-circle' : isRejected ? 'alert' : 'clock');
    if (isVerified) {
      alertBanner.innerHTML = `${alertIcon}<div><strong>KYC verified.</strong> Your CAC and NIN have been approved. You can publish student hostels, houses and stores.</div>`;
    } else if (isRejected) {
      alertBanner.innerHTML = `${alertIcon}<div><strong>KYC not approved:</strong> ${escapeHtml(currentAgent.rejectionReason || 'Your documents could not be verified.')} Update your details and resubmit.</div>`;
    } else {
      alertBanner.innerHTML = `${alertIcon}<div><strong>Review in progress.</strong> Our compliance team is checking your CAC and NIN. You can publish listings once you are approved.</div>`;
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
        ${currentAgent.kycStatus === 'verified' ? `<button type="button" class="btn-primary" data-action="upload">${icon('plus')}Upload your first listing</button>` : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="mini-listing-grid">
      ${myListings.map(l => {
        return `
          <div class="mini-listing-card">
            <div class="mini-listing-head">
              ${typeBadgeHtml(l.type, true)}
              <span class="mini-listing-price">${escapeHtml(l.priceFormatted)}</span>
            </div>
            <h4>${escapeHtml(l.title)}</h4>
            ${l.campus && l.campus !== 'none' ? `<p class="mini-listing-campus">${icon('cap')}${escapeHtml(l.campus)} ${l.campusDist ? `(${escapeHtml(l.campusDist)})` : ''}</p>` : ''}
            <p class="mini-listing-loc">${icon('pin')}${escapeHtml(l.area)}, ${escapeHtml(l.state)}</p>
            <div class="mini-listing-actions">
              <a href="listings.html?filter=my-listings">View on map ${icon('arrow-right')}</a>
              <button type="button" class="btn-text-danger" data-action="delete" data-listing-id="${escapeHtml(l.id)}">${icon('trash')}Delete</button>
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

// Whole-word match, so "iba" does not match "Ibadan" and "vi" does not match "Ovie"
function placeIndex(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).exec(text);
  return m ? m.index : -1;
}

function placeMatches(text, key) {
  return placeIndex(text, key) >= 0;
}

function matchCoordinatesForArea(state, area) {
  const jitter = (spread) => (Math.random() - 0.5) * spread; // keeps pins in one area from stacking
  const text = `${area || ''}`.toLowerCase();

  // 1. A known place in the listing's own state. Areas are written "neighbourhood, city",
  //    so the earliest match is the most specific; longer names break ties.
  const key = Object.keys(NIGERIAN_GEO_DIRECTORY)
    .filter(k => NIGERIAN_GEO_DIRECTORY[k].state === state)
    .map(k => ({ k, at: placeIndex(text, k) }))
    .filter(x => x.at >= 0)
    .sort((a, b) => a.at - b.at || b.k.length - a.k.length)
    .map(x => x.k)[0];
  if (key) {
    const geo = NIGERIAN_GEO_DIRECTORY[key];
    return { lat: geo.lat + jitter(0.008), lng: geo.lng + jitter(0.008) };
  }

  // 2. A campus or campus town in that state
  const campus = NIGERIAN_CAMPUSES.find(c => c.state === state && (
    placeMatches(text, c.short.toLowerCase()) ||
    c.town.toLowerCase().split(/,\s*/).some(town => placeMatches(text, town))
  ));
  if (campus) return { lat: campus.lat + jitter(0.012), lng: campus.lng + jitter(0.012) };

  // 3. The state's main city
  const st = NIGERIAN_STATES.find(x => x.value === state) || NIGERIAN_STATES[0];
  return { lat: st.lat + jitter(0.03), lng: st.lng + jitter(0.03) };
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

  const presetCard = (serviceParam && document.querySelector(`.service-package-card[data-service="${CSS.escape(serviceParam)}"]`))
    || document.querySelector('.service-package-card.selected');
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
   Rent Check & Move-in Cost Calculator
   Estimates come from live listings only; nothing here is invented.
   ========================================================================== */
const formatNaira = (n) => `₦${Math.round(n).toLocaleString()}`;

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

const VALUATION_TYPE_LABELS = { any: 'rental', house: 'house', student: 'student hostel', store: 'store' };

function initValuationPage() {
  const form = document.querySelector('#valuation-form');
  const amountDisp = document.querySelector('#valuation-result-amount');
  const rangeDisp = document.querySelector('#valuation-result-range');
  const countDisp = document.querySelector('#valuation-result-count');
  const compsEl = document.querySelector('#valuation-comps');

  function runRentCheck() {
    const areaRaw = (document.querySelector('#val-area')?.value || '').trim();
    const area = areaRaw.toLowerCase();
    const type = document.querySelector('#val-type')?.value || 'any';

    // Only yearly prices are comparable with each other
    let comps = currentListings.filter(l =>
      (type === 'any' || l.type === type) && (l.period || '/year').includes('year') && l.price > 0
    );
    if (area) {
      comps = comps.filter(l => [l.area, l.address, l.state, l.campus, l.title]
        .some(v => v && v.toLowerCase().includes(area)));
    }
    comps.sort((a, b) => a.price - b.price);
    const prices = comps.map(l => l.price);
    const label = VALUATION_TYPE_LABELS[type] || 'rental';

    if (!prices.length) {
      amountDisp.textContent = '—';
      rangeDisp.textContent = `No ${label} listings found${areaRaw ? ` for “${areaRaw}”` : ''} yet. Try a nearby area or “Any type”.`;
      countDisp.textContent = '0 comparable listings';
      compsEl.replaceChildren();
      return;
    }

    amountDisp.textContent = `${formatNaira(percentile(prices, 0.5))}/yr`;
    rangeDisp.textContent = prices.length >= 4
      ? `Typical range ${formatNaira(percentile(prices, 0.25))} – ${formatNaira(percentile(prices, 0.75))}`
      : `Range ${formatNaira(prices[0])} – ${formatNaira(prices[prices.length - 1])}`;
    countDisp.textContent = `Median of ${prices.length} listing${prices.length === 1 ? '' : 's'} on DOMA${listingsAreSamples ? ' (sample data: live database unreachable)' : ''}`;

    compsEl.innerHTML = comps.slice(0, 4).map(l => `
      <a class="comp-row" href="listings.html?q=${encodeURIComponent(l.area || '')}">
        <span class="comp-title">${escapeHtml(l.title)}<small>${escapeHtml(l.area)}, ${escapeHtml(l.state)}</small></span>
        <strong>${escapeHtml(l.priceFormatted)}</strong>
      </a>
    `).join('');
  }

  if (form && amountDisp) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runRentCheck();
    });
    runRentCheck();
  }

  // Move-in cost: rent + caution + agency + legal + service charge
  const rentInput = document.querySelector('#mortgage-price');
  const fields = ['#mortgage-price', '#mortgage-deposit', '#val-agency-fee', '#val-legal-fee', '#val-service-charge']
    .map(sel => document.querySelector(sel));

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function updateMoveInCost() {
    if (!rentInput) return;
    const [rent, cautionPct, agencyPct, legalPct, service] = fields.map(el => parseFloat(el ? el.value : 0) || 0);
    const caution = rent * cautionPct / 100;
    const agency = rent * agencyPct / 100;
    const legal = rent * legalPct / 100;
    const total = rent + caution + agency + legal + service;

    setText('#val-mortgage-price', formatNaira(rent));
    setText('#val-mortgage-deposit', `${cautionPct}%`);
    setText('#val-agency-fee-out', `${agencyPct}%`);
    setText('#val-legal-fee-out', `${legalPct}%`);
    setText('#val-service-charge-out', formatNaira(service));
    setText('#bd-rent', formatNaira(rent));
    setText('#bd-caution', formatNaira(caution));
    setText('#bd-agency', formatNaira(agency));
    setText('#bd-legal', formatNaira(legal));
    setText('#bd-service', formatNaira(service));
    setText('#val-total-upfront', formatNaira(total));
    setText('#mortgage-monthly-amount', formatNaira(total / 12));
  }

  fields.forEach(el => el && el.addEventListener('input', updateMoveInCost));
  updateMoveInCost();
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
