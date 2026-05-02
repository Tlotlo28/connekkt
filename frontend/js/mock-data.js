// ===========================
// MOCK DATA
// Replaces the backend until we build it.
// ===========================

const MOCK_CREATIVES = [
{
  id: 999, name: 'Modisa', category: 'musician',
  lat: -25.7479, lng: 28.1879, distance: 0,
  avatar: 'assets/img1.jpg',
  photos: [
    'assets/img1.jpg',
    'assets/img2.jpg',
    'assets/img3.jpg'
  ],
  bio: 'Afrohouse & Afrotech producer rooted in Pretoria. Building dancefloors one groove at a time — open to vocalists, visual artists, and live performance collabs.',
  tags: ['afrohouse', 'afrotech', 'producer', 'dj'],
  socials: [
    { type: 'spotify',    url: '#' },
    { type: 'soundcloud', url: '#' },
    { type: 'instagram',  url: '#' }
  ],
  contact: {
    email: 'tlotlomasisi66@gamil.com',
    phone: '+27 71 234 5678',
    whatsapp: '+27 71 234 5678',
    note: 'Best to DM on Instagram first.'
  },
  isMe: true   // 👈 flag so the profile page knows this is the logged-in user
},  
   
{
    id: 1, name: 'Thando M.', category: 'photographer',
    lat: -25.7461, lng: 28.1881, distance: 0.4,
    avatar: 'https://i.pravatar.cc/300?img=12',
    photos: [
      'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=900&q=80',
      'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=900&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=900&q=80'
    ],
    bio: 'Street and portrait photographer based in Pretoria. Always looking for golden hour and good company.',
    tags: ['street', 'portrait', 'lo-fi', 'afrofuturism'],
    socials: [
      { type: 'instagram', url: 'https://instagram.com/thando' },
      { type: 'behance',   url: 'https://behance.net/thando' }
    ],
    contact: {
    email: 'thando@example.com',
    whatsapp: '+27 82 111 2222'
    },
  },

  {
    id: 2, name: 'Lerato K.', category: 'designer',
    lat: -25.7521, lng: 28.1936, distance: 0.8,
    avatar: null,
    photos: [],
    bio: 'Brand identity, packaging, and the occasional zine. I work best with people who say "make it weird".',
    tags: ['branding', 'minimalist', 'experimental'],
    socials: [
      { type: 'instagram', url: 'https://instagram.com/lerato' },
      { type: 'foreign',   url: 'https://lerato.studio', label: 'Portfolio' }
    ],
    contact: {
    note: 'Reach me on Behance — I check it daily.'
    },
  },
  {
    id: 3, name: 'Sipho N.', category: 'musician',
    lat: -25.7398, lng: 28.1812, distance: 1.2,
    avatar: 'https://i.pravatar.cc/300?img=33',
    photos: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80'
    ],
    bio: 'Producer and beatmaker. Amapiano roots, jazz heart. Open to collabs with vocalists and visual artists.',
    tags: ['amapiano', 'jazz', 'lo-fi', 'experimental'],
    socials: [
      { type: 'spotify',    url: 'https://spotify.com/sipho' },
      { type: 'soundcloud', url: 'https://soundcloud.com/sipho' },
      { type: 'instagram',  url: 'https://instagram.com/sipho' }
    ]
  },
  { id: 4,  name: 'Naledi P.',  category: 'videographer', lat: -25.7585, lng: 28.2019, distance: 1.5, avatar: null, photos: [], bio: 'Music videos and short docs.', tags: ['music videos', 'doc'], socials: [] },
  { id: 5,  name: 'Kabelo D.',  category: 'uiux',         lat: -25.7434, lng: 28.1745, distance: 0.9, avatar: 'https://i.pravatar.cc/300?img=15', photos: [], bio: 'Product designer. I make confusing things less confusing.', tags: ['product', 'mobile'], socials: [{ type: 'instagram', url: '#' }] },
  { id: 6,  name: 'Amahle B.',  category: 'writer',       lat: -25.7612, lng: 28.1890, distance: 1.8, avatar: 'https://i.pravatar.cc/300?img=47', photos: [], bio: 'Copy and long-form. Brand voice nerd.', tags: ['copy', 'editorial'], socials: [] },
  { id: 7,  name: 'Tshepo R.',  category: 'marketer',     lat: -25.7472, lng: 28.2087, distance: 2.1, avatar: null, photos: [], bio: 'Growth marketing for creative brands.', tags: ['growth', 'social'], socials: [] },
  { id: 8,  name: 'Bongiwe S.', category: 'photographer', lat: -25.7350, lng: 28.1955, distance: 1.6, avatar: 'https://i.pravatar.cc/300?img=23', photos: [], bio: 'Fashion and editorial.', tags: ['fashion', 'editorial'], socials: [] },
  { id: 9,  name: 'Mandla J.',  category: 'designer',     lat: -25.7689, lng: 28.1768, distance: 2.7, avatar: null, photos: [], bio: 'Type and posters.', tags: ['type', 'print'], socials: [] },
  { id: 10, name: 'Zanele V.',  category: 'musician',     lat: -25.7301, lng: 28.2042, distance: 2.4, avatar: 'https://i.pravatar.cc/300?img=44', photos: [], bio: 'Vocalist looking for producers.', tags: ['vocals', 'jazz'], socials: [] }
];

// Helper used by the profile page to find a creative by ID
function getCreativeById(id) {
  return MOCK_CREATIVES.find(c => c.id === Number(id));
}