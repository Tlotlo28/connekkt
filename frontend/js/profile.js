// ===========================
// PROFILE PAGE LOGIC — V3
// Loads from real backend if it's the logged-in user's own profile.
// Falls back to mock data for other creatives (until we build /users/{id}).
// ===========================

if (!api.isLoggedIn()) {
  window.location.href = 'login.html';
}

let creative = null;
let cat = null;
let isMe = false;

async function loadCreative() {
  const params = new URLSearchParams(window.location.search);
  const creativeId = params.get('id');
  const cachedMe = api.getCachedUser();

  if (!creativeId || (cachedMe && Number(creativeId) === cachedMe.id)) {
    try {
      creative = await api.getMe();
      isMe = true;
    } catch (err) {
      console.warn('Falling back to cached user:', err.message);
      creative = cachedMe;
      isMe = true;
    }
  } else {
    creative = getCreativeById(creativeId);
    isMe = false;
  }

  if (!creative) {
    document.body.innerHTML = '<p style="color:white;padding:2rem;">Creative not found.</p>';
    return;
  }

  cat = CATEGORIES[creative.category] || CATEGORIES.musician;
  renderProfile();
}

function renderProfile() {
  const fadeColor = creative.fade_color || cat.colorHex;
  document.documentElement.style.setProperty('--fade-color', fadeColor);

  document.getElementById('creativeName').textContent = creative.name || 'Unnamed';
  document.getElementById('creativeField').textContent = cat.label;
  document.getElementById('creativeBio').textContent = creative.bio || '';
  document.getElementById('followerCount').textContent = isMe ? '0' : Math.floor(Math.random() * 900 + 100);

  const topRightIcon = document.getElementById('topRightIcon');
  const topRightBtn = document.getElementById('topRightBtn');
  if (isMe) {
    topRightIcon.outerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="topRightIcon">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>`;
    topRightBtn.setAttribute('aria-label', 'Edit profile');
  }

  const photoStack = document.getElementById('photoStack');
  const scrollHint = document.getElementById('scrollHint');
  const photos = creative.photos || [];

  if (photos.length > 0) {
    photoStack.innerHTML = photos.map((url, i) => `
      <div class="photo-slide ${i === 0 ? 'is-visible' : ''}" data-index="${i}">
        <div class="photo-slide__img" style="background-image: url('${url}');"></div>
      </div>
    `).join('');
    if (photos.length <= 1) scrollHint.classList.add('is-hidden');
  } else {
    photoStack.innerHTML = `
      <div class="photo-empty">
        <div class="photo-empty__shape shape-${cat.shape}" style="background-color: ${cat.colorHex};">
          <span>${cat.initial}</span>
        </div>
      </div>
    `;
    scrollHint.classList.add('is-hidden');
  }

  const mediaEl = document.getElementById('media');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { root: mediaEl, threshold: 0.6 });
  document.querySelectorAll('.photo-slide').forEach(slide => observer.observe(slide));

  mediaEl.addEventListener('scroll', () => {
    if (mediaEl.scrollTop > 50) {
      scrollHint.classList.add('is-hidden');
    } else if (photos.length > 1) {
      scrollHint.classList.remove('is-hidden');
    }
  });

  const likeBtn = document.getElementById('likeBtn');
  likeBtn.addEventListener('click', () => {
    likeBtn.classList.remove('is-playing');
    void likeBtn.offsetWidth;
    likeBtn.classList.add('is-playing');
    setTimeout(() => likeBtn.classList.remove('is-playing'), 800);
  });

  const profileEl = document.getElementById('profile');
  mediaEl.addEventListener('dblclick', () => {
    profileEl.classList.toggle('is-focus-mode');
  });

  const socialIcons = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    spotify:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3c-.2.4-.7.5-1.1.3-3-1.8-6.7-2.2-11.2-1.2-.4.1-.9-.2-1-.6-.1-.4.2-.9.6-1 4.8-1.1 9-.6 12.3 1.4.5.2.6.7.4 1.1zm1.5-3.3c-.3.4-.8.6-1.3.3-3.4-2.1-8.6-2.7-12.7-1.5-.5.1-1.1-.1-1.2-.7-.1-.5.1-1.1.7-1.2 4.6-1.4 10.4-.7 14.3 1.7.4.3.5.9.2 1.4zm.1-3.4c-4.1-2.4-10.8-2.7-14.7-1.5-.6.2-1.3-.2-1.5-.8-.2-.6.2-1.3.8-1.5 4.5-1.4 11.8-1.1 16.5 1.7.6.3.8 1.1.4 1.7-.3.5-1.1.7-1.5.4z"/></svg>',
    soundcloud:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 17h-1V9.5C5.4 9.5 5 10 5 10.5V17H4v-7c0-1.1.9-1.5 2-1.5h1V17zm15-3.5c0 1.9-1.6 3.5-3.5 3.5h-7v-9c0-.5.3-.9.8-1 .5-.1.9.1 1.2.5l.5 1c.7-.4 1.5-.6 2.3-.6 2.5 0 4.6 2 4.7 4.5 1 .2 2 .9 2 2.1zm-2-1c-.5 0-1 .3-1.2.7-.1.2-.4.3-.6.2-.2-.1-.4-.4-.3-.6 0-1.5-1.2-2.7-2.7-2.7-.6 0-1.1.2-1.6.5V17h6.5c.8 0 1.5-.7 1.5-1.5s-.7-1-1.6-1z"/></svg>',
    behance:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.7 10c-.7 2-3 3.5-5.7 3.5-3.6 0-6-2.4-6-6s2.4-6 6-6c3.4 0 6 2.4 6 6 0 .3 0 .5-.1.7H14c.2 1.5 1.4 2.6 3 2.6 1.1 0 2.1-.5 2.5-1.2l3.2.4zM14 12.7h6c-.3-1.4-1.4-2.4-2.9-2.4-1.5 0-2.6.9-3.1 2.4zM7 19H1V4.5h6.4c2.6 0 4.5 1.5 4.5 3.5 0 1.7-1 2.6-2.2 3.1 1.5.4 2.7 1.7 2.7 3.5C12.5 17 10.5 19 7 19zm-3-12h2.7c1 0 1.7-.5 1.7-1.5S7.7 4 6.7 4H4v3zm0 8.5h3c1.3 0 2-.6 2-1.7 0-1-.7-1.7-2-1.7H4v3.4z"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 4.8 2.8 8.9 6.9 10.8-.1-1-.2-2.4 0-3.4.2-.9 1.4-5.5 1.4-5.5s-.4-.7-.4-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-.9 3.8-.3 1.1.6 2 1.6 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.5-4.7-4.5-3.2 0-5 2.4-5 4.9 0 1 .4 2 .8 2.6.1.1.1.2.1.3-.1.4-.3 1.2-.3 1.4-.1.2-.2.3-.4.2-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.5-6.9 3.9 0 7 2.8 7 6.5 0 3.9-2.5 7.1-5.9 7.1-1.2 0-2.3-.6-2.6-1.3 0 0-.6 2.2-.7 2.7-.3 1-1 2.3-1.5 3.1 1.1.3 2.3.5 3.5.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>',
    twitter:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    tiktok:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-5.394 10.692 6.33 6.33 0 0010.857-4.424V8.687a8.182 8.182 0 004.773 1.526V6.79a4.831 4.831 0 01-1.003-.104z"/></svg>',
    foreign:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
  };

  const socialsEl = document.getElementById('socials');
  socialsEl.innerHTML = (creative.socials || []).map(s => {
    const icon = socialIcons[s.type] || socialIcons.foreign;
    const isForeign = s.type === 'foreign';
    const shapeClass = isForeign ? `is-foreign shape-${cat.shape}` : '';
    const title = s.label || s.type;
    return `<a href="${s.url}" target="_blank" rel="noopener" class="social-icon ${shapeClass}" title="${title}" aria-label="${title}">${icon}</a>`;
  }).join('');

  const dnaEl = document.getElementById('dnaTags');
  dnaEl.innerHTML = (creative.tags || []).map(t => `<span class="dna-tag">${t}</span>`).join('');

  const fadeColorBtn = document.getElementById('fadeColorBtn');
  if (isMe) {
    fadeColorBtn.hidden = false;
    const fadeSwatch = document.getElementById('fadeSwatch');
    fadeSwatch.style.background = fadeColor;

    const colorOptions = [cat.colorHex, ...Object.values(CATEGORIES).map(c => c.colorHex), '#0A0A0F'];
    let colorIndex = 0;

    fadeColorBtn.addEventListener('click', async () => {
      colorIndex = (colorIndex + 1) % colorOptions.length;
      const newColor = colorOptions[colorIndex];
      document.documentElement.style.setProperty('--fade-color', newColor);
      fadeSwatch.style.background = newColor;
      try {
        await api.updateMe({ fade_color: newColor });
      } catch (err) {
        console.warn('Could not save fade color:', err.message);
      }
    });
  } else {
    fadeColorBtn.remove();
  }

  topRightBtn.addEventListener('click', () => {
    if (isMe) console.log('[Connekkt] Edit profile flow — coming soon.');
    else console.log('[Connekkt] More options — coming later.');
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    window.history.back();
  });

  setupContactModal();
}

function setupContactModal() {
  const contactBtn = document.getElementById('contactBtn');
  const contactModal = document.getElementById('contactModal');
  const contactList = document.getElementById('contactList');
  const contactSubtitle = document.getElementById('contactModalSubtitle');

  const contactIcons = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>'
  };

  function buildContactRow(type, value) {
    const labels = { email: 'EMAIL', phone: 'PHONE', whatsapp: 'WHATSAPP', note: 'NOTE FROM CREATIVE' };
    const inner = `
      <div class="contact-row__icon">${contactIcons[type]}</div>
      <div class="contact-row__info">
        <div class="contact-row__label">${labels[type]}</div>
        <div class="contact-row__value">${value}</div>
      </div>
    `;
    if (type === 'note') return `<div class="contact-row contact-row--note">${inner}</div>`;
    let href = '#';
    if (type === 'email')    href = `mailto:${value}`;
    if (type === 'phone')    href = `tel:${value.replace(/\s+/g, '')}`;
    if (type === 'whatsapp') href = `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    return `<a href="${href}" class="contact-row" target="_blank" rel="noopener">${inner}</a>`;
  }

  contactBtn.addEventListener('click', () => {
    const c = creative.contact || {};
    const rows = [];
    if (c.email)    rows.push(buildContactRow('email', c.email));
    if (c.phone)    rows.push(buildContactRow('phone', c.phone));
    if (c.whatsapp) rows.push(buildContactRow('whatsapp', c.whatsapp));
    if (c.note)     rows.push(buildContactRow('note', c.note));

    if (rows.length === 0) {
      contactSubtitle.textContent = `${creative.name} prefers to keep things on the platform.`;
      contactList.innerHTML = `<div class="contact-empty">No direct contact info shared yet. Once Connekkt messaging launches, you'll be able to reach out here.</div>`;
    } else {
      contactSubtitle.textContent = `Here's how to reach ${creative.name}.`;
      contactList.innerHTML = rows.join('');
    }

    contactModal.classList.add('is-open');
    contactModal.setAttribute('aria-hidden', 'false');
  });

  contactModal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal]')) {
      contactModal.classList.remove('is-open');
      contactModal.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('is-open')) {
      contactModal.classList.remove('is-open');
      contactModal.setAttribute('aria-hidden', 'true');
    }
  });
}

loadCreative();