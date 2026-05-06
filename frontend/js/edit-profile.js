// ===========================
// EDIT PROFILE
// ===========================

if (!api.isLoggedIn()) {
  window.location.href = 'login.html';
}

const SOCIAL_TYPES = [
  { key: 'instagram',   label: 'Instagram' },
  { key: 'tiktok',      label: 'TikTok' },
  { key: 'youtube',     label: 'YouTube' },
  { key: 'spotify',     label: 'Spotify' },
  { key: 'apple_music', label: 'Apple Music' },
  { key: 'soundcloud',  label: 'SoundCloud' },
  { key: 'tidal',       label: 'Tidal' },
  { key: 'bandcamp',    label: 'Bandcamp' },
  { key: 'behance',     label: 'Behance' },
  { key: 'dribbble',    label: 'Dribbble' },
  { key: 'pinterest',   label: 'Pinterest' },
  { key: 'twitter',     label: 'Twitter / X' },
  { key: 'linkedin',    label: 'LinkedIn' },
  { key: 'github',      label: 'GitHub' },
  { key: 'vimeo',       label: 'Vimeo' },
  { key: 'website',     label: 'Personal website' },
  { key: 'foreign',     label: 'Other (custom link)' }
];

let me = null;
let tags = [];

async function load() {
  try {
    me = await api.getMe();
  } catch (err) {
    alert('Could not load your profile.');
    window.location.href = 'home.html';
    return;
  }

  document.getElementById('eName').value = me.name || '';
  document.getElementById('eBio').value = me.bio || '';
  document.getElementById('bioCount').textContent = `${(me.bio || '').length} / 240`;
  document.getElementById('eContactEmail').value = me.contact?.email || '';
  document.getElementById('eContactWhatsapp').value = me.contact?.whatsapp || '';
  document.getElementById('eContactNote').value = me.contact?.note || '';

  tags = [...(me.tags || [])];
  renderTags();

  // Render socials
  (me.socials || []).forEach(s => addSocialRow(s));
  if ((me.socials || []).length === 0) addSocialRow({ type: 'instagram' });
}

// Bio counter
document.getElementById('eBio').addEventListener('input', (e) => {
  document.getElementById('bioCount').textContent = `${e.target.value.length} / 240`;
});

// Tags
const dnaInput = document.getElementById('eDnaInput');
const dnaInputTags = document.getElementById('dnaInputTags');

dnaInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const v = dnaInput.value.trim().toLowerCase();
  if (!v || tags.includes(v) || tags.length >= 8) return;
  tags.push(v);
  dnaInput.value = '';
  renderTags();
});

function renderTags() {
  dnaInputTags.innerHTML = tags.map(t => `
    <span class="dna-input-tag">${t}<button type="button" data-remove="${t}">×</button></span>
  `).join('');
}

dnaInputTags.addEventListener('click', (e) => {
  if (e.target.matches('[data-remove]')) {
    tags = tags.filter(t => t !== e.target.dataset.remove);
    renderTags();
  }
});

// Socials
const socialsList = document.getElementById('socialsList');

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
  row.querySelector('.social-row__remove').addEventListener('click', () => row.remove());
  socialsList.appendChild(row);
}

document.getElementById('addSocialBtn').addEventListener('click', () => addSocialRow());

// Save
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('editError');
  const saveBtn = document.getElementById('saveBtn');
  errEl.hidden = true;

  const socials = Array.from(socialsList.querySelectorAll('.social-row')).map(row => ({
    type: row.querySelector('select').value,
    url:  row.querySelector('input').value.trim()
  })).filter(s => s.url);

  const contact = {};
  const cEmail = document.getElementById('eContactEmail').value.trim();
  const cWhatsapp = document.getElementById('eContactWhatsapp').value.trim();
  const cNote = document.getElementById('eContactNote').value.trim();
  if (cEmail) contact.email = cEmail;
  if (cWhatsapp) contact.whatsapp = cWhatsapp;
  if (cNote) contact.note = cNote;

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    await api.updateMe({
      name: document.getElementById('eName').value.trim(),
      bio: document.getElementById('eBio').value.trim(),
      tags,
      socials,
      contact
    });
    window.location.href = `profile.html?id=${me.id}`;
  } catch (err) {
    errEl.textContent = err.message || 'Could not save changes.';
    errEl.hidden = false;
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save changes';
  }
});

document.getElementById('cancelBtn').addEventListener('click', () => window.history.back());
document.getElementById('backBtn').addEventListener('click', () => window.history.back());

load();