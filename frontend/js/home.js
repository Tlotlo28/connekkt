// ===========================
// CONNEKKT HOME — V4 (real backend)
// ===========================

// --- Auth gate ---
if (!api.isLoggedIn()) {
  window.location.href = 'login.html';
}

// --- DOM refs (declared up-front so async functions can use them) ---
const profileBtn = document.getElementById('profileBtn');
const profileAvatar = document.getElementById('profileAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const filterBtn = document.getElementById('filterBtn');
const legendBtn = document.getElementById('legendBtn');
const legendModal = document.getElementById('legendModal');
const legendGrid = document.getElementById('legendGrid');
const filterModal = document.getElementById('filterModal');
const filterGrid = document.getElementById('filterGrid');
const clearFilterBtn = document.getElementById('clearFilterBtn');
const meetupModal = document.getElementById('meetupModal');
const listView = document.getElementById('listView');
const listItems = document.getElementById('listItems');
const listCount = document.getElementById('listCount');
const mapViewBtn = document.getElementById('mapViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const scanBtn = document.getElementById('scanBtn');
const radiusLabel = document.getElementById('radiusLabel');

// --- State ---
let ME = api.getCachedUser();
let userLocation = null;
let nearbyCreatives = [];
let activeFilter = null;

// --- 1. Map ---
const DEFAULT_CENTER = [-25.7479, 28.1879];
const DEFAULT_ZOOM = 13;

const map = L.map('map', {
  zoomControl: false,
  attributionControl: true,
  doubleClickZoom: false
}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// --- 2. Browser geolocation ---
function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => { console.warn('Geolocation denied/failed:', err.message); resolve(null); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

// --- 3. Pins ---
const pinsById = {};

function makePin(creative) {
  const cat = CATEGORIES[creative.category];
  if (!cat) return null;

  const icon = L.divIcon({
    className: '',
    html: `<div class="creative-pin shape-${cat.shape}" style="background-color: ${cat.colorHex};"><span>${cat.initial}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const marker = L.marker([creative.lat, creative.lng], { icon }).addTo(map);
  marker.bindPopup(`<strong>${creative.name || 'Unnamed'}</strong><br/><span style="color:#888">${cat.label}</span>`);
  marker.on('dblclick', (e) => {
    L.DomEvent.stopPropagation(e);
    window.location.href = `profile.html?id=${creative.id}`;
  });

  pinsById[creative.id] = marker;
  return marker;
}

function clearPins() {
  Object.values(pinsById).forEach(m => map.removeLayer(m));
  Object.keys(pinsById).forEach(k => delete pinsById[k]);
}

function getPinEl(marker) {
  return marker.getElement()?.querySelector('.creative-pin');
}

// --- 4. Profile avatar in top bar ---
function refreshProfileAvatar() {
  if (!ME) return;
  if (ME.photos && ME.photos.length > 0) {
    profileAvatar.style.backgroundImage = `url('${ME.photos[0]}')`;
    profileAvatar.setAttribute('data-has-photo', 'true');
  }
}

// --- 5. Fetch + render ---
async function loadNearbyCreatives() {
  try {
    const opts = { limit: 80 };
    if (activeFilter) opts.category = activeFilter;
    if (userLocation) {
      opts.lat = userLocation.lat;
      opts.lng = userLocation.lng;
      opts.radiusKm = 50;
    }
    nearbyCreatives = await api.listUsers(opts);
    clearPins();
    nearbyCreatives.forEach(c => {
      if (c.lat && c.lng) makePin(c);
    });
    renderList(nearbyCreatives);
  } catch (err) {
    console.error('[Connekkt] Could not load creatives:', err);
  }
}

function renderList(creatives) {
  listCount.textContent = creatives.length;
  if (creatives.length === 0) {
    listItems.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">
      No creatives found yet${activeFilter ? ' for this filter' : ''}.${userLocation ? ' Try widening your search.' : ''}
    </div>`;
    return;
  }
  listItems.innerHTML = creatives.map(c => {
    const cat = CATEGORIES[c.category] || CATEGORIES.musician;
    const photo = (c.photos && c.photos[0]) || null;
    const visual = photo
      ? `<div class="list-item__avatar" style="background-image: url('${photo}'); border-color: ${cat.colorHex};"></div>`
      : `<div class="list-item__shape shape-${cat.shape}" style="background-color: ${cat.colorHex};"><span>${cat.initial}</span></div>`;
    const distance = c.distance_km !== undefined && c.distance_km !== null
      ? (c.distance_km < 1 ? Math.round(c.distance_km * 1000) + ' m' : c.distance_km + ' km')
      : '';
    return `
      <div class="list-item" data-id="${c.id}">
        ${visual}
        <div class="list-item__info">
          <div class="list-item__name">${c.name || 'Unnamed'}</div>
          <div class="list-item__meta">${cat.label}</div>
        </div>
        <div class="list-item__distance">${distance}</div>
      </div>
    `;
  }).join('');
}

// --- 6. Scan button ---
let scanCircle = null;
let scanInterval = null;
let currentRadius = 0;
const RADIUS_MIN = 500;
const RADIUS_MAX = 10000;
const RADIUS_GROWTH = 250;
const TICK_MS = 50;

function startScan() {
  scanBtn.classList.add('is-scanning');
  currentRadius = RADIUS_MIN;

  Object.values(pinsById).forEach(marker => {
    const el = getPinEl(marker);
    if (!el) return;
    el.classList.remove('is-revealed');
    el.style.animationDelay = '';
    el.classList.add('is-dimmed');
  });

  const center = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER;
  scanCircle = L.circle(center, {
    radius: currentRadius,
    color: '#FF3D5A',
    fillColor: '#FF3D5A',
    fillOpacity: 0.08,
    weight: 2,
    className: 'scan-radius'
  }).addTo(map);

  scanInterval = setInterval(() => {
    if (!scanCircle) return; // safety check
    currentRadius = Math.min(currentRadius + RADIUS_GROWTH, RADIUS_MAX);
    scanCircle.setRadius(currentRadius);
    updateRadiusLabel();
  }, TICK_MS);

  updateRadiusLabel();
}

function endScan() {
  scanBtn.classList.remove('is-scanning');
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }

  const center = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER;

  const inRange = nearbyCreatives.filter(c => {
    if (!c.lat || !c.lng) return false;
    const d = map.distance(center, [c.lat, c.lng]);
    return d <= currentRadius;
  });

  radiusLabel.textContent = `Found ${inRange.length} creative${inRange.length === 1 ? '' : 's'}`;
  renderList(inRange);

  inRange.forEach((c, i) => {
    const el = getPinEl(pinsById[c.id]);
    if (!el) return;
    el.classList.remove('is-dimmed');
    el.style.animationDelay = `${i * 80}ms`;
    el.classList.add('is-revealed');
  });

  setTimeout(() => {
    if (scanCircle) {
      map.removeLayer(scanCircle);
      scanCircle = null;
    }
    Object.values(pinsById).forEach(marker => {
      const el = getPinEl(marker);
      if (!el) return;
      el.classList.remove('is-dimmed', 'is-revealed');
      el.style.animationDelay = '';
    });
    radiusLabel.textContent = 'Hold to scan';
  }, 2500);
}

function updateRadiusLabel() {
  const km = (currentRadius / 1000).toFixed(1);
  radiusLabel.textContent = `Scanning ${km} km`;
}

scanBtn.addEventListener('mousedown', startScan);
scanBtn.addEventListener('mouseup', endScan);
scanBtn.addEventListener('mouseleave', () => {
  if (scanInterval) endScan();
});
scanBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startScan(); });
scanBtn.addEventListener('touchend',   (e) => { e.preventDefault(); endScan();   });

// --- 7. List item click → profile ---
listItems.addEventListener('click', (e) => {
  const item = e.target.closest('.list-item');
  if (!item) return;
  const id = item.dataset.id;
  window.location.href = `profile.html?id=${id}`;
});

// --- 8. Map / List toggle ---
mapViewBtn.addEventListener('click', () => {
  mapViewBtn.classList.add('is-active');
  listViewBtn.classList.remove('is-active');
  listView.classList.remove('is-open');
});

listViewBtn.addEventListener('click', () => {
  listViewBtn.classList.add('is-active');
  mapViewBtn.classList.remove('is-active');
  listView.classList.add('is-open');
});

// --- 9. Profile + logout buttons ---
profileBtn.addEventListener('click', () => {
  if (ME) window.location.href = `profile.html?id=${ME.id}`;
});

logoutBtn.addEventListener('click', () => {
  if (confirm('Log out of Connekkt?')) api.logout();
});

// --- 10. Legend modal ---
legendGrid.innerHTML = Object.values(CATEGORIES).map(c => `
  <div class="legend-item">
    <div class="legend-item__shape shape-${c.shape}" style="background-color: ${c.colorHex};">
      <span>${c.initial}</span>
    </div>
    <div class="legend-item__label">${c.label}</div>
  </div>
`).join('');

legendBtn.addEventListener('click', () => {
  legendModal.classList.add('is-open');
  legendModal.setAttribute('aria-hidden', 'false');
});

legendModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-modal]')) {
    legendModal.classList.remove('is-open');
    legendModal.setAttribute('aria-hidden', 'true');
  }
});

// --- 11. Filter modal ---
function renderFilterGrid() {
  filterGrid.innerHTML = Object.entries(CATEGORIES).map(([key, c]) => `
    <div class="legend-item ${activeFilter === key ? 'is-selected' : ''}" data-cat="${key}" style="cursor:pointer;${activeFilter === key ? `border-color: ${c.colorHex};` : ''}">
      <div class="legend-item__shape shape-${c.shape}" style="background-color: ${c.colorHex};">
        <span>${c.initial}</span>
      </div>
      <div class="legend-item__label">${c.label}</div>
    </div>
  `).join('');
}

filterBtn.addEventListener('click', () => {
  renderFilterGrid();
  filterModal.classList.add('is-open');
  filterModal.setAttribute('aria-hidden', 'false');
});

filterGrid.addEventListener('click', async (e) => {
  const item = e.target.closest('.legend-item');
  if (!item) return;
  activeFilter = item.dataset.cat;
  renderFilterGrid();
  await loadNearbyCreatives();
});

clearFilterBtn.addEventListener('click', async () => {
  activeFilter = null;
  renderFilterGrid();
  await loadNearbyCreatives();
});

filterModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-modal]')) {
    filterModal.classList.remove('is-open');
    filterModal.setAttribute('aria-hidden', 'true');
  }
});

// --- 12. Meetup modal close handlers ---
meetupModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-modal]')) {
    meetupModal.classList.remove('is-open');
    meetupModal.setAttribute('aria-hidden', 'true');
  }
});

const ackBtn = document.getElementById('acknowledgeBtn');
if (ackBtn) {
  ackBtn.addEventListener('click', () => {
    meetupModal.classList.remove('is-open');
  });
}

// --- 13. Boot ---
// --- Boot ---
(async () => {
  // Always refresh ME from backend before doing anything that depends on it
  try {
    ME = await api.getMe();
    refreshProfileAvatar();
  } catch (err) {
    console.error('[home] getMe failed:', err.message);
    // If we can't even fetch our own user, the token is broken — force re-login
    api.logout();
    return;
  }

  userLocation = await getBrowserLocation();
  if (userLocation) {
    map.setView([userLocation.lat, userLocation.lng], DEFAULT_ZOOM);
    try { await api.updateMyLocation(userLocation); }
    catch (err) { console.warn('Could not save location:', err.message); }
  } else if (ME && ME.lat && ME.lng) {
    userLocation = { lat: ME.lat, lng: ME.lng };
    map.setView([userLocation.lat, userLocation.lng], DEFAULT_ZOOM);
  }

  await loadNearbyCreatives();
})();

// --- Refresh creatives when returning to the tab ---
// Quick fix for the "I don't see new users without a manual refresh" issue.
// Real solution = WebSockets (pinned for v2).
let lastRefresh = Date.now();
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    const elapsed = Date.now() - lastRefresh;
    if (elapsed > 30 * 1000) { // only re-fetch if it's been 30+ seconds
      lastRefresh = Date.now();
      await loadNearbyCreatives();
    }
  }
});