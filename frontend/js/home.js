// ===========================
// CONNEKKT HOME SCREEN LOGIC
// ===========================
// Handles the map, scan button, hold-to-expand-radius, list view, modal.

// --- Auth gate: kick out anyone who isn't logged in ---
if (!api.isLoggedIn()) {
  window.location.href = 'login.html';
}

// Load the real user's profile in the background. Fall back to cache if offline.
let ME = api.getCachedUser();
api.getMe().then(u => {
  ME = u;
  refreshProfileAvatar();
}).catch(err => {
  console.warn('[Connekkt] Could not refresh user:', err.message);
});



// --- 1. Initialize the map ---
// Default location: Pretoria CBD-ish. Eventually we'll request the user's actual location.
const DEFAULT_CENTER = [-25.7479, 28.1879];
const DEFAULT_ZOOM = 14;

const map = L.map('map', {
  zoomControl: false,
  attributionControl: true,
  doubleClickZoom: false   // we use double-click for opening profiles
}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

// CartoDB Dark Matter — free dark map tiles, perfect for our aesthetic
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// --- 2. Drop pins for each mock creative ---
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

  // Single click → popup with quick info
  marker.bindPopup(`<strong>${creative.name}</strong><br/><span style="color:#888">${cat.label}</span>`);

  // Double click → full profile
  marker.on('dblclick', (e) => {
    // Stop the map's default zoom-on-doubleclick behavior
    L.DomEvent.stopPropagation(e);
    window.location.href = `profile.html?id=${creative.id}`;
  });

  pinsById[creative.id] = marker;
  return marker;
}

MOCK_CREATIVES.forEach(makePin);

// --- 3. The scan button — hold-to-expand-radius ---
const scanBtn = document.getElementById('scanBtn');
const radiusLabel = document.getElementById('radiusLabel');

let scanCircle = null;            // the visible radius on the map
let scanInterval = null;          // grows the radius while held
let currentRadius = 0;            // in metres
const RADIUS_MIN = 500;
const RADIUS_MAX = 10000;
const RADIUS_GROWTH = 250;        // metres per tick
const TICK_MS = 50;

// Helper: get the inner .creative-pin element of a Leaflet marker
function getPinEl(marker) {
  return marker.getElement()?.querySelector('.creative-pin');
}

function startScan() {
  scanBtn.classList.add('is-scanning');
  currentRadius = RADIUS_MIN;

  // Dim all pins so the radius circle becomes the focus
  Object.values(pinsById).forEach(marker => {
    const el = getPinEl(marker);
    if (!el) return;
    el.classList.remove('is-revealed');
    el.style.animationDelay = '';
    el.classList.add('is-dimmed');
  });

  scanCircle = L.circle(DEFAULT_CENTER, {
    radius: currentRadius,
    color: '#FF3D5A',
    fillColor: '#FF3D5A',
    fillOpacity: 0.08,
    weight: 2,
    className: 'scan-radius'
  }).addTo(map);

  scanInterval = setInterval(() => {
    currentRadius = Math.min(currentRadius + RADIUS_GROWTH, RADIUS_MAX);
    scanCircle.setRadius(currentRadius);
    updateRadiusLabel();
  }, TICK_MS);

  updateRadiusLabel();
}

function endScan() {
  scanBtn.classList.remove('is-scanning');
  clearInterval(scanInterval);
  scanInterval = null;

  // Find creatives within the radius
  const inRange = MOCK_CREATIVES.filter(c => {
    const d = map.distance(DEFAULT_CENTER, [c.lat, c.lng]);
    return d <= currentRadius;
  });

  radiusLabel.textContent = `Found ${inRange.length} creative${inRange.length === 1 ? '' : 's'}`;
  renderList(inRange);

  // Fade the in-range pins back in with a staggered reveal
  inRange.forEach((c, i) => {
    const el = getPinEl(pinsById[c.id]);
    if (!el) return;
    el.classList.remove('is-dimmed');
    el.style.animationDelay = `${i * 80}ms`;
    el.classList.add('is-revealed');
  });

  // After 2.5s: clean up everything, return pins to normal
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

// Both mouse and touch (so it works on phones)
scanBtn.addEventListener('mousedown', startScan);
scanBtn.addEventListener('mouseup', endScan);
scanBtn.addEventListener('mouseleave', () => {
  if (scanInterval) endScan();
});
scanBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startScan(); });
scanBtn.addEventListener('touchend',   (e) => { e.preventDefault(); endScan();   });

// --- 4. List view ---
const listView = document.getElementById('listView');
const listItems = document.getElementById('listItems');
const listCount = document.getElementById('listCount');
const mapViewBtn = document.getElementById('mapViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

function renderList(creatives) {
  listCount.textContent = creatives.length;
  listItems.innerHTML = creatives.map(c => {
    const cat = CATEGORIES[c.category];

    // If they have a photo: circle avatar with a colored ring (their category color).
    // If they don't: fall back to the geometric shape with the category initial.
    const visual = c.avatar
      ? `<div class="list-item__avatar" style="background-image: url('${c.avatar}'); border-color: ${cat.colorHex};"></div>`
      : `<div class="list-item__shape shape-${cat.shape}" style="background-color: ${cat.colorHex};"><span>${cat.initial}</span></div>`;

    return `
      <div class="list-item" data-id="${c.id}">
        ${visual}
        <div class="list-item__info">
          <div class="list-item__name">${c.name}</div>
          <div class="list-item__meta">${cat.label}</div>
        </div>
        <div class="list-item__distance">${c.distance} km</div>
      </div>
    `;
  }).join('');
}

// Default: show all creatives in the list
renderList(MOCK_CREATIVES);

// Toggle between map and list
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

// --- Profile button avatar ---
function refreshProfileAvatar() {
  if (!ME) return;
  if (ME.photos && ME.photos.length > 0) {
    profileAvatar.style.backgroundImage = `url('${ME.photos[0]}')`;
    profileAvatar.setAttribute('data-has-photo', 'true');
  }
}

const profileAvatar = document.getElementById('profileAvatar');
refreshProfileAvatar();

// --- Legend modal ---
const legendBtn = document.getElementById('legendBtn');
const legendModal = document.getElementById('legendModal');
const legendGrid = document.getElementById('legendGrid');

// Build the grid once on page load (data comes from CATEGORIES)
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

// Close handlers (reuse the same data-close-modal pattern as the meetup modal)
legendModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-modal]')) {
    legendModal.classList.remove('is-open');
    legendModal.setAttribute('aria-hidden', 'true');
  }
});

// --- 5. List item click → show meetup disclaimer ---
const meetupModal = document.getElementById('meetupModal');

listItems.addEventListener('click', (e) => {
  const item = e.target.closest('.list-item');
  if (!item) return;
  const id = item.dataset.id;
  // Open the profile page for this creative
  window.location.href = `profile.html?id=${id}`;
});

// Close modal handlers
meetupModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-modal]')) {
    meetupModal.classList.remove('is-open');
    meetupModal.setAttribute('aria-hidden', 'true');
  }
});

document.getElementById('acknowledgeBtn').addEventListener('click', () => {
  meetupModal.classList.remove('is-open');
  // Later: navigate to the creative's profile page.
  console.log('[Connekkt] User acknowledged disclaimer.');
});

// Profile button → open the logged-in user's profile (Modisa for now)
document.getElementById('profileBtn').addEventListener('click', () => {
  if (ME) window.location.href = `profile.html?id=${ME.id}`;
});

// --- 6. Filter button (UI placeholder) ---
document.getElementById('filterBtn').addEventListener('click', () => {
  console.log('[Connekkt] Filter UI coming next round.');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Log out of Connekkt?')) api.logout();
});