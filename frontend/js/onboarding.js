// ===========================
// ONBOARDING WIZARD LOGIC
// Single-page, multi-step. All data goes into one object,
// then gets sent to the backend at the end.
// ===========================

// --- 1. THE STATE OBJECT ---
// This is THE pattern: one object that grows as the user completes steps.
// At the end we'll POST this whole thing to /auth/signup + /users/me.
const onboardingData = {
  email: '',
  password: '',
  name: '',
  category: null,         // e.g. 'musician'
  subcategories: [],      // e.g. ['Afrohouse', 'Afrotech']
  bio: '',
  tags: [],               // Creative DNA tags
  photos: [],             // base64 strings or File objects
  socials: []             // [{type, url, label?}]
};

// --- 2. STEP NAVIGATION ---
const STEPS = ['welcome', 'signup', 'field', 'subcategories', 'bio', 'photos', 'socials', 'done'];
let currentStepIndex = 0;

const progressFill = document.getElementById('progressFill');
const backBtn = document.getElementById('backBtn');

function showStep(index) {
  // Clamp index so we don't go out of bounds
  if (index < 0 || index >= STEPS.length) return;
  currentStepIndex = index;

  // Hide all steps, show only the current one
  document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
  document.querySelector(`.step[data-step="${STEPS[index]}"]`).classList.add('is-active');

  // Update progress bar
  const pct = (index / (STEPS.length - 1)) * 100;
  progressFill.style.width = `${pct}%`;

  // Hide back button on first step
  backBtn.hidden = index === 0;

  // Step-specific render hooks
  if (STEPS[index] === 'subcategories') renderSubcategories();
}

function nextStep() { showStep(currentStepIndex + 1); }
function prevStep() { showStep(currentStepIndex - 1); }

backBtn.addEventListener('click', prevStep);

// Any button with data-go-next moves forward (saves us writing 8 click handlers)
document.querySelectorAll('[data-go-next]').forEach(btn => {
  btn.addEventListener('click', nextStep);
});

// --- 3. STEP 1: SIGN UP FORM ---
const signupForm = document.getElementById('signupForm');
const signupError = document.getElementById('signupError');

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  signupError.hidden = true;

  const name = document.getElementById('fName').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const password = document.getElementById('fPassword').value;

  // Basic frontend validation. Backend will validate too — never trust the frontend alone.
  if (name.length < 2)   return showError('Please enter your name.');
  if (!email.includes('@')) return showError('Please enter a valid email.');
  if (password.length < 8)  return showError('Password must be at least 8 characters.');

  onboardingData.name = name;
  onboardingData.email = email;
  onboardingData.password = password;

  nextStep();
});

function showError(msg) {
  signupError.textContent = msg;
  signupError.hidden = false;
}

// --- 4. STEP 2: PICK FIELD ---
const fieldGrid = document.getElementById('fieldGrid');
const fieldNextBtn = document.getElementById('fieldNextBtn');

// Build cards from CATEGORIES
fieldGrid.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
  <div class="field-card" data-cat="${key}" style="--card-color: ${cat.colorHex};">
    <div class="field-card__shape shape-${cat.shape}" style="background-color: ${cat.colorHex};">
      <span>${cat.initial}</span>
    </div>
    <div class="field-card__label">${cat.label}</div>
  </div>
`).join('');

fieldGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.field-card');
  if (!card) return;

  // Single-select: clear all, then mark this one
  fieldGrid.querySelectorAll('.field-card').forEach(c => c.classList.remove('is-selected'));
  card.classList.add('is-selected');

  onboardingData.category = card.dataset.cat;
  fieldNextBtn.disabled = false;
});

// --- 5. STEP 3: SUB-CATEGORIES ---
const subcatGrid = document.getElementById('subcatGrid');
const subcatSubtitle = document.getElementById('subcatSubtitle');

// Built dynamically because the chips depend on which field was picked
function renderSubcategories() {
  if (!onboardingData.category) return;
  const cat = CATEGORIES[onboardingData.category];

  subcatSubtitle.textContent = `You picked ${cat.label}. Pick anything that fits.`;

  subcatGrid.innerHTML = cat.subcategories.map(sc => `
    <div class="chip" data-sc="${sc}" style="--chip-color: ${cat.colorHex};">${sc}</div>
  `).join('');

  // Reset selections when re-rendering
  onboardingData.subcategories = [];
}

subcatGrid.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  chip.classList.toggle('is-selected');
  const value = chip.dataset.sc;

  if (chip.classList.contains('is-selected')) {
    onboardingData.subcategories.push(value);
  } else {
    onboardingData.subcategories = onboardingData.subcategories.filter(s => s !== value);
  }
});

// --- 6. STEP 4: BIO + DNA TAGS ---
const bioInput = document.getElementById('fBio');
const bioCount = document.getElementById('bioCount');
bioInput.addEventListener('input', () => {
  onboardingData.bio = bioInput.value;
  bioCount.textContent = `${bioInput.value.length} / 240`;
});

const dnaInput = document.getElementById('fDnaInput');
const dnaInputTags = document.getElementById('dnaInputTags');

dnaInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const value = dnaInput.value.trim().toLowerCase();
  if (!value) return;
  if (onboardingData.tags.includes(value)) return;
  if (onboardingData.tags.length >= 8) return; // cap so profiles don't get spammy

  onboardingData.tags.push(value);
  renderDnaTags();
  dnaInput.value = '';
});

function renderDnaTags() {
  dnaInputTags.innerHTML = onboardingData.tags.map(t => `
    <span class="dna-input-tag">
      ${t}
      <button type="button" data-remove="${t}" aria-label="Remove ${t}">×</button>
    </span>
  `).join('');
}

dnaInputTags.addEventListener('click', (e) => {
  if (e.target.matches('[data-remove]')) {
    const value = e.target.dataset.remove;
    onboardingData.tags = onboardingData.tags.filter(t => t !== value);
    renderDnaTags();
  }
});

// --- 7. STEP 5: PHOTO UPLOAD (with crop modal) ---
// Flow:
//   1. User picks a file
//   2. We open the crop modal with Cropper.js
//   3. User adjusts the crop box (locked to 3:4 ratio)
//   4. On confirm, we save the cropped image as a base64 data URL
//   5. On cancel, we discard and let them try again

let cropper = null;          // active Cropper.js instance
let activeSlotIndex = null;  // which photo slot triggered the modal

const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
const cropCancelBtn = document.getElementById('cropCancelBtn');
const cropConfirmBtn = document.getElementById('cropConfirmBtn');

function openCropModal(dataUrl, slotIndex) {
  activeSlotIndex = slotIndex;
  cropImage.src = dataUrl;
  cropModal.classList.add('is-open');
  cropModal.setAttribute('aria-hidden', 'false');

  // Wait for the image to load BEFORE initializing Cropper —
  // Cropper.js needs the natural width/height to set up the crop box.
  cropImage.onload = () => {
    if (cropper) cropper.destroy();
    cropper = new Cropper(cropImage, {
      aspectRatio: 3 / 4,        // locks the crop box to portrait
      viewMode: 1,               // crop box can't go outside the image
      autoCropArea: 1,           // start with the largest possible crop
      background: false,         // hide the checkerboard
      movable: true,             // user can drag the image
      zoomable: true,            // user can zoom
      scalable: false,
      rotatable: false,
      responsive: true,
      dragMode: 'move'           // drag = pan the image (instead of resizing)
    });
  };
}

function closeCropModal() {
  cropModal.classList.remove('is-open');
  cropModal.setAttribute('aria-hidden', 'true');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  activeSlotIndex = null;
}

cropCancelBtn.addEventListener('click', closeCropModal);

cropConfirmBtn.addEventListener('click', () => {
  if (!cropper || activeSlotIndex === null) return;

  // Get the cropped image as a 600x800 JPEG (3:4 ratio).
  // We export at a fixed size so all profile photos are consistent
  // and we don't bloat the database with massive originals.
  const canvas = cropper.getCroppedCanvas({
  width: 800,
  height: 1066,
  imageSmoothingQuality: 'high'
});

// 0.78 = visually nearly identical to 0.9, but ~40% fewer bytes
const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.78);

  // Save to state and update the slot preview
  onboardingData.photos[activeSlotIndex] = croppedDataUrl;
  updateSlotPreview(activeSlotIndex, croppedDataUrl);

  closeCropModal();
});

// Helper: update a slot's preview to show the chosen image
function updateSlotPreview(slotIndex, dataUrl) {
  const slot = document.querySelector(`.photo-slot[data-slot="${slotIndex}"]`);
  if (!slot) return;

  let preview = slot.querySelector('.photo-slot__preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'photo-slot__preview';
    slot.appendChild(preview);
  }
  preview.style.backgroundImage = `url('${dataUrl}')`;
  slot.classList.add('has-photo');
}

// Wire each file input to the crop flow.
// The trick for "select same file twice" is `input.value = ''` on click —
// that resets the input so the change event fires every time.
document.querySelectorAll('.photo-slot__input').forEach(input => {
  // Reset the input value on click so re-selecting the same file works
  input.addEventListener('click', (e) => {
    e.target.value = '';
  });

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const slot = input.closest('.photo-slot');
    const slotIndex = parseInt(slot.dataset.slot);

    // Read the file as a data URL, then send it to the cropper
    const reader = new FileReader();
    reader.onload = (ev) => {
      openCropModal(ev.target.result, slotIndex);
    };
    reader.readAsDataURL(file);
  });
});


// --- 8. STEP 6: SOCIALS ---
const SOCIAL_TYPES = [
  { key: 'instagram',  label: 'Instagram' },
  { key: 'spotify',    label: 'Spotify' },
  { key: 'soundcloud', label: 'SoundCloud' },
  { key: 'behance',    label: 'Behance' },
  { key: 'pinterest',  label: 'Pinterest' },
  { key: 'twitter',    label: 'Twitter / X' },
  { key: 'tiktok',     label: 'TikTok' },
  { key: 'foreign',    label: 'Other (custom link)' }
];

const socialsList = document.getElementById('socialsList');
const addForeignBtn = document.getElementById('addForeignBtn');

function addSocialRow(initial = {}) {
  const row = document.createElement('div');
  row.className = 'social-row';
  row.innerHTML = `
    <div class="social-row__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    </div>
    <select>
      ${SOCIAL_TYPES.map(t => `<option value="${t.key}" ${t.key === initial.type ? 'selected' : ''}>${t.label}</option>`).join('')}
    </select>
    <input type="url" placeholder="https://..." value="${initial.url || ''}" />
    <button type="button" class="social-row__remove" aria-label="Remove">×</button>
  `;

  // Remove handler
  row.querySelector('.social-row__remove').addEventListener('click', () => {
    row.remove();
    syncSocials();
  });

  // Live update on change
  row.querySelector('select').addEventListener('change', syncSocials);
  row.querySelector('input').addEventListener('input', syncSocials);

  socialsList.appendChild(row);
  syncSocials();
}

function syncSocials() {
  // Read all rows back into state — simpler than tracking per-row
  onboardingData.socials = Array.from(socialsList.querySelectorAll('.social-row')).map(row => ({
    type: row.querySelector('select').value,
    url:  row.querySelector('input').value.trim()
  })).filter(s => s.url); // drop empty rows
}

addForeignBtn.addEventListener('click', () => addSocialRow());

// Start with one empty Instagram row to nudge the user
addSocialRow({ type: 'instagram' });

// --- 9. STEP 7: FINISH — submits to the real backend ---
const finishBtn = document.getElementById('finishBtn');

finishBtn.addEventListener('click', async () => {
  finishBtn.disabled = true;
  finishBtn.textContent = 'Setting things up…';

  try {
    // Step 1: create the account
    finishBtn.textContent = 'Creating account…';
    await api.signup({
      email: onboardingData.email,
      password: onboardingData.password,
      name: onboardingData.name
    });

    // Step 2: save the text-only profile fields (small, fast, safe)
    finishBtn.textContent = 'Saving your profile…';
    await api.updateMe({
      category: onboardingData.category,
      subcategories: onboardingData.subcategories,
      bio: onboardingData.bio,
      tags: onboardingData.tags,
      socials: onboardingData.socials.filter(s => s.url)
    });

    // Step 3: save photos in their own request (largest payload, save it last)
    if (onboardingData.photos.length > 0) {
      finishBtn.textContent = 'Uploading photos…';
      await api.updateMe({ photos: onboardingData.photos });
    }

    finishBtn.textContent = 'Welcome to Connekkt!';
    setTimeout(() => { window.location.href = 'home.html'; }, 400);

  } catch (err) {
    finishBtn.disabled = false;
    finishBtn.textContent = 'Enter Connekkt';

    if (err.status === 409) {
      alert('That email is already registered. Redirecting to login…');
      window.location.href = 'login.html';
    } else {
      // Surface the real error so we can debug instead of guessing
      console.error('[Connekkt] Onboarding submit failed:', err);
      alert(`Couldn't finish setting things up: ${err.message}\n\nCheck the browser console for details.`);
    }
  }
});

// --- 10. "I already have an account" → real login flow ---
document.getElementById('loginBtn').addEventListener('click', () => {
  window.location.href = 'login.html';
});

// --- 10. "I already have an account" ---
document.getElementById('loginBtn').addEventListener('click', () => {
  // Login flow comes in round 3. For now just skip to home.
  console.log('[Connekkt] Login flow — coming in round 3.');
  window.location.href = 'home.html';
});

// --- KICK OFF ---
showStep(0);